import logging
import hashlib
import mimetypes
import re
import uuid
from io import BytesIO
from pathlib import Path
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.api.deps import (
    RoleChecker,
    get_current_user,
    get_optional_current_user,
)
from app.db.session import get_db
from app.models.search_event import SearchEvent
from app.models.user import User
from app.services.admin_settings import load_admin_settings
from app.services.storage import read_stored_bytes, save_uploaded_bytes

router = APIRouter(prefix="/resources", tags=["Resources"])
logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {
    ".pdf": ("document", None),
    ".doc": ("document", None),
    ".docx": ("document", None),
    ".ppt": ("document", None),
    ".pptx": ("document", None),
    ".txt": ("text", None),
    ".md": ("text", None),
    ".py": ("code", "python"),
    ".js": ("code", "javascript"),
    ".jsx": ("code", "javascript"),
    ".ts": ("code", "typescript"),
    ".tsx": ("code", "typescript"),
    ".java": ("code", "java"),
    ".c": ("code", "c"),
    ".h": ("code", "c"),
    ".cpp": ("code", "cpp"),
    ".sql": ("code", "sql"),
    ".html": ("code", "html"),
    ".css": ("code", "css"),
    ".json": ("code", "json"),
}
RESOURCE_TYPES = {"past_question", "project", "lecture_note", "code_preview", "other"}
RESOURCE_SELECT = """
    SELECT r.id, r.title, r.description, r.file_url, r.file_type, r.file_size,
           r.course_id, r.category_id,
           r.programming_language, r.keywords, r.resource_type, r.visibility,
           r.status::text AS status, r.created_at, r.updated_at,
           r.storage_key, r.original_filename, r.backend_uploader_id,
           c.name AS category_name, cr.course_code, cr.title AS course_title,
           COALESCE(u.full_name, 'Department Staff') AS uploader_name,
           (SELECT count(*) FROM public.backend_downloads d
            WHERE d.resource_id = r.id) AS downloads
    FROM public.resources r
    LEFT JOIN public.categories c ON c.id = r.category_id
    LEFT JOIN public.courses cr ON cr.id = r.course_id
    LEFT JOIN public.users u ON u.id = r.backend_uploader_id
"""
allow_staff_or_admin = RoleChecker(["staff", "admin"])


class CommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=4000)
    parent_id: Optional[uuid.UUID] = None


class ResourceMetadataUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=10000)
    resource_type: Optional[str] = None
    course_code: Optional[str] = Field(default=None, max_length=20)
    category_id: Optional[str] = None
    keywords: Optional[list[str]] = Field(default=None, max_length=20)


def _role_name(user: User) -> str:
    return user.role.value if hasattr(user.role, "value") else str(user.role)


def _resource_id(value: str) -> uuid.UUID:
    try:
        return uuid.UUID(value)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail="Resource not found") from exc


def _resource_values(row) -> dict:
    result = dict(row)
    result.pop("storage_key", None)
    result.pop("backend_uploader_id", None)
    result["id"] = str(result["id"])
    result["course_id"] = str(result["course_id"]) if result.get("course_id") else None
    result["category_id"] = str(result["category_id"]) if result.get("category_id") else None
    result["course_code"] = result.pop("course_code", None) or ""
    result["category"] = result.pop("category_name", None) or "Other"
    result["uploader_name"] = result.get("uploader_name") or "Department Staff"
    for field in ("created_at", "updated_at"):
        if result.get(field) is not None:
            result[field] = result[field].isoformat()
    if result.get("keywords") is None:
        result["keywords"] = []
    return result


def _visible_resource(db: Session, resource_id: uuid.UUID, user: Optional[User]):
    row = db.execute(
        text(RESOURCE_SELECT + " WHERE r.id = :resource_id"),
        {"resource_id": resource_id},
    ).mappings().first()
    if row is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    if row["status"] != "approved" and (
        user is None
        or (
            _role_name(user) not in {"staff", "admin"}
            and row["backend_uploader_id"] != user.id
        )
    ):
        raise HTTPException(status_code=404, detail="Resource not found")
    if row["visibility"] == "staff_only" and (
        user is None
        or (
            _role_name(user) not in {"staff", "admin"}
            and row["backend_uploader_id"] != user.id
        )
    ):
        raise HTTPException(status_code=404, detail="Resource not found")
    return row


def _resource_query(
    db: Session,
    *,
    resource_type: Optional[str] = None,
    course_code: Optional[str] = None,
    category_slug: Optional[str] = None,
    search: Optional[str] = None,
    file_type: Optional[str] = None,
    programming_language: Optional[str] = None,
    year: Optional[int] = None,
    sort_by: str = "relevance",
    status_filter: Optional[str] = "approved",
    include_staff_only: bool = False,
    full_text_search: bool = True,
    limit: int = 50,
    offset: int = 0,
):
    conditions = []
    params: dict = {"limit": limit, "offset": offset}
    if status_filter:
        conditions.append("r.status::text = :status")
        params["status"] = status_filter
    if not include_staff_only:
        conditions.append("r.visibility = 'public'")
    if resource_type:
        conditions.append("r.resource_type = :resource_type")
        params["resource_type"] = resource_type
    if course_code:
        conditions.append("cr.course_code ILIKE :course_code")
        params["course_code"] = f"%{course_code}%"
    if category_slug:
        conditions.append("c.slug = :category_slug")
        params["category_slug"] = category_slug
    if file_type:
        conditions.append("r.file_type ILIKE :file_type")
        params["file_type"] = f"%{file_type}%"
    if programming_language:
        conditions.append("r.programming_language ILIKE :programming_language")
        params["programming_language"] = f"%{programming_language}%"
    if year:
        conditions.append("EXTRACT(YEAR FROM r.created_at) = :year")
        params["year"] = year
    if search:
        params["search"] = search
        if full_text_search:
            conditions.append(
                "(r.search_vector @@ plainto_tsquery('english', :search) "
                "OR similarity(r.title, :search) >= 0.12)"
            )
        else:
            params["search_pattern"] = f"%{search}%"
            conditions.append(
                "(r.title ILIKE :search_pattern OR r.description ILIKE :search_pattern)"
            )

    where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""
    count = db.execute(
        text(
            "SELECT count(*) FROM public.resources r "
            "LEFT JOIN public.categories c ON c.id = r.category_id "
            "LEFT JOIN public.courses cr ON cr.id = r.course_id"
            + where_clause
        ),
        params,
    ).scalar_one()

    order_options = {
        "relevance": (
            "ts_rank(r.search_vector, plainto_tsquery('english', :search)) DESC, "
            "similarity(r.title, :search) DESC, r.created_at DESC"
            if search
            else "r.created_at DESC"
        ),
        "newest": "r.created_at DESC",
        "oldest": "r.created_at ASC",
        "title_asc": "lower(r.title) ASC",
        "title_desc": "lower(r.title) DESC",
        "downloads": (
            "(SELECT count(*) FROM public.backend_downloads d "
            "WHERE d.resource_id = r.id) DESC, r.created_at DESC"
        ),
    }
    order_by = f" ORDER BY {order_options[sort_by]}"
    rows = db.execute(
        text(RESOURCE_SELECT + where_clause + order_by + " LIMIT :limit OFFSET :offset"),
        params,
    ).mappings().all()
    return [_resource_values(row) for row in rows], count


def _notify_user(
    db: Session, user_id: int, title: str, message: str, notification_type: str
) -> None:
    db.execute(
        text(
            """
            INSERT INTO public.backend_notifications
                (user_id, title, message, notification_type)
            VALUES (:user_id, :title, :message, :notification_type)
            """
        ),
        {
            "user_id": user_id,
            "title": title,
            "message": message,
            "notification_type": notification_type,
        },
    )


@router.get("/")
def get_resources(
    resource_type: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    course_code: Optional[str] = Query(None),
    category_slug: Optional[str] = Query(None),
    search: Optional[str] = Query(None, min_length=1, max_length=200),
    file_type: Optional[str] = Query(None),
    programming_language: Optional[str] = Query(None),
    year: Optional[int] = Query(None, ge=1900, le=2200),
    sort_by: Optional[str] = Query(
        None,
        pattern="^(relevance|newest|oldest|title_asc|title_desc|downloads)$",
    ),
    limit: Optional[int] = Query(None, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    if search is not None:
        search = search.strip()
        if not search:
            raise HTTPException(status_code=422, detail="Search term cannot be empty")

    settings = load_admin_settings(db)
    search_settings = settings["searchSettings"]
    configured_sort = search_settings["defaultSort"]
    if configured_sort not in {"relevance", "newest", "downloads"}:
        configured_sort = {
            "Relevance": "relevance",
            "Newest First": "newest",
            "Most Downloaded": "downloads",
        }.get(configured_sort, "relevance")
    selected_sort = sort_by or configured_sort
    try:
        configured_limit = int(search_settings["resultsPerPage"])
    except (TypeError, ValueError):
        configured_limit = 20
    selected_limit = limit or (configured_limit if configured_limit in {10, 20, 50} else 20)
    selected_status = status_filter
    staff_view = current_user is not None and _role_name(current_user) in {"staff", "admin"}
    if selected_status is None and not staff_view:
        selected_status = "approved"
    if selected_status and selected_status not in {
        "pending",
        "approved",
        "changes_requested",
        "rejected",
        "archived",
    }:
        raise HTTPException(status_code=422, detail="Unsupported resource status")
    if selected_status != "approved" and not staff_view:
        raise HTTPException(status_code=403, detail="Staff access is required")
    if resource_type and resource_type not in RESOURCE_TYPES:
        raise HTTPException(status_code=422, detail="Unsupported resource type")

    data, count = _resource_query(
        db,
        resource_type=resource_type,
        course_code=course_code,
        category_slug=category_slug,
        search=search,
        file_type=file_type,
        programming_language=programming_language,
        year=year,
        sort_by=selected_sort,
        status_filter=selected_status,
        include_staff_only=staff_view,
        full_text_search=bool(search_settings["fullTextSearch"]),
        limit=selected_limit,
        offset=offset,
    )
    if search and current_user:
        db.add(SearchEvent(user_id=current_user.id, query_text=search.strip()))
        db.commit()
    return {"data": data, "count": count}


@router.get("/search-history")
def get_search_history(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = db.query(SearchEvent).filter(
        SearchEvent.user_id == current_user.id,
        SearchEvent.query_text.is_not(None),
    ).order_by(SearchEvent.created_at.desc(), SearchEvent.id.desc()).limit(limit).all()
    return [
        {
            "id": row.id,
            "query": row.query_text,
            "created_at": row.created_at.isoformat() if row.created_at else None,
        }
        for row in rows
    ]


@router.get("/past-questions")
def get_past_questions(db: Session = Depends(get_db)):
    rows, _ = _resource_query(db, resource_type="past_question", limit=100, offset=0)
    return rows


@router.get("/projects")
def get_projects(db: Session = Depends(get_db)):
    rows, _ = _resource_query(db, resource_type="project", limit=100, offset=0)
    return [
        {
            **row,
            "tags": row["keywords"] or ([row["course_code"]] if row["course_code"] else []),
            "year": row["created_at"][:4] if row["created_at"] else "",
            "department": "Computer Science & Engineering",
        }
        for row in rows
    ]


@router.get("/options")
def get_resource_options(db: Session = Depends(get_db)):
    categories = db.execute(
        text("SELECT id, name, slug FROM public.categories ORDER BY name")
    ).mappings().all()
    courses = db.execute(
        text("SELECT id, course_code, title FROM public.courses ORDER BY course_code")
    ).mappings().all()
    years = db.execute(
        text(
            "SELECT DISTINCT EXTRACT(YEAR FROM created_at)::integer AS year "
            "FROM public.resources WHERE status::text = 'approved' "
            "ORDER BY year DESC"
        )
    ).scalars().all()
    return {
        "categories": [
            {"id": str(row["id"]), "name": row["name"], "slug": row["slug"]}
            for row in categories
        ],
        "courses": [
            {
                "id": str(row["id"]),
                "course_code": row["course_code"],
                "title": row["title"],
            }
            for row in courses
        ],
        "years": years,
    }


@router.get("/stats")
def get_public_resource_stats(db: Session = Depends(get_db)):
    stats = db.execute(
        text(
            """
            SELECT
                (SELECT count(*) FROM public.resources
                 WHERE status::text = 'approved' AND visibility = 'public') AS total_resources,
                (SELECT count(*) FROM public.users) AS total_users,
                (SELECT count(*) FROM public.courses) AS total_courses
            """
        )
    ).mappings().one()
    return {
        "totalResources": stats["total_resources"],
        "totalUsers": stats["total_users"],
        "totalCourses": stats["total_courses"],
    }


@router.get("/code-preview")
def get_code_preview(db: Session = Depends(get_db)):
    resource = db.execute(
        text(
            RESOURCE_SELECT
            + " WHERE r.resource_type = 'code_preview' AND r.status::text = 'approved'"
            + " AND r.visibility = 'public'"
            + " ORDER BY r.created_at DESC LIMIT 1"
        )
    ).mappings().first()
    if resource is None:
        raise HTTPException(status_code=404, detail="No published code samples are available")

    values = _resource_values(resource)
    code = resource["description"] or ""
    if resource["storage_key"]:
        code = read_stored_bytes(resource["storage_key"]).decode("utf-8", errors="replace")
    return {
        "id": values["id"],
        "title": values["title"],
        "description": values["description"] or "",
        "code": code,
        "language": values["programming_language"] or "text",
        "filename": values.get("original_filename") or values["title"],
    }


@router.get("/my-resources")
def get_my_resources(
    tab: str = Query("saved", pattern="^(saved|downloaded|uploads|readingList)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if tab in {"saved", "readingList"}:
        rows = db.execute(
            text(
                RESOURCE_SELECT
                + """
                JOIN public.backend_saved_resources s ON s.resource_id = r.id
                WHERE s.user_id = :user_id AND r.status::text = 'approved'
                ORDER BY s.created_at DESC
                """
            ),
            {"user_id": current_user.id},
        ).mappings().all()
    elif tab == "downloaded":
        rows = db.execute(
            text(
                RESOURCE_SELECT
                + """
                JOIN (
                    SELECT resource_id, max(downloaded_at) AS saved_at
                    FROM public.backend_downloads
                    WHERE user_id = :user_id
                    GROUP BY resource_id
                ) d ON d.resource_id = r.id
                WHERE r.status::text = 'approved'
                ORDER BY d.saved_at DESC
                """
            ),
            {"user_id": current_user.id},
        ).mappings().all()
    else:
        rows = db.execute(
            text(
                RESOURCE_SELECT
                + """
                WHERE r.backend_uploader_id = :user_id
                ORDER BY r.created_at DESC
                """
            ),
            {"user_id": current_user.id},
        ).mappings().all()

    result = []
    for row in rows:
        resource = _resource_values(row)
        resource["category"] = resource["resource_type"]
        resource["format"] = resource["file_type"].upper()
        resource["size"] = f"{resource['file_size'] / (1024 * 1024):.1f} MB"
        resource["course"] = resource["course_code"] or "CSE"
        resource["author"] = resource["uploader_name"]
        resource["savedDate"] = resource["created_at"]
        resource["downloadStatus"] = "Downloaded" if tab == "downloaded" else "Saved"
        result.append(resource)
    return result


@router.patch("/{resource_id}")
def update_resource_metadata(
    resource_id: str,
    update: ResourceMetadataUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_staff_or_admin),
):
    parsed_id = _resource_id(resource_id)
    _visible_resource(db, parsed_id, current_user)
    updates = update.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="Provide at least one metadata field to update")

    values = {}
    if "title" in updates:
        title = (updates["title"] or "").strip()
        if not title:
            raise HTTPException(status_code=422, detail="Title cannot be empty")
        values["title"] = title
    if "description" in updates:
        values["description"] = updates["description"].strip() if updates["description"] else ""
    if "resource_type" in updates:
        if updates["resource_type"] not in RESOURCE_TYPES:
            raise HTTPException(status_code=422, detail="Unsupported resource type")
        values["resource_type"] = updates["resource_type"]
    if "course_code" in updates:
        course_code = (updates["course_code"] or "").strip()
        course = (
            db.execute(
                text("SELECT id, category_id FROM public.courses WHERE course_code = :course_code"),
                {"course_code": course_code},
            ).first()
            if course_code
            else None
        )
        if course_code and course is None:
            raise HTTPException(status_code=422, detail="Course not found")
        values["course_id"] = course.id if course else None
    if "category_id" in updates:
        category_id = updates["category_id"]
        if category_id:
            try:
                category_id = uuid.UUID(category_id)
            except ValueError as exc:
                raise HTTPException(status_code=422, detail="Invalid category") from exc
            if not db.execute(
                text("SELECT 1 FROM public.categories WHERE id = :category_id"),
                {"category_id": category_id},
            ).first():
                raise HTTPException(status_code=422, detail="Category not found")
        values["category_id"] = category_id
    effective_course_id = values.get("course_id", resource["course_id"])
    effective_category_id = values.get("category_id", resource["category_id"])
    if effective_course_id and effective_category_id:
        course_category_id = db.execute(
            text("SELECT category_id FROM public.courses WHERE id = :course_id"),
            {"course_id": effective_course_id},
        ).scalar_one()
        if course_category_id and course_category_id != effective_category_id:
            raise HTTPException(
                status_code=422,
                detail="The selected category does not match the course category",
            )
    if "keywords" in updates:
        values["keywords"] = list(dict.fromkeys(
            tag.strip()[:64] for tag in (updates["keywords"] or []) if tag.strip()
        ))[:20]

    assignments = ", ".join(f"{column} = :{column}" for column in values)
    values["resource_id"] = parsed_id
    db.execute(
        text(
            f"UPDATE public.resources SET {assignments}, updated_at = NOW() "
            "WHERE id = :resource_id"
        ),
        values,
    )
    db.commit()
    updated = db.execute(
        text(RESOURCE_SELECT + " WHERE r.id = :resource_id"),
        {"resource_id": parsed_id},
    ).mappings().one()
    return _resource_values(updated)


def _upload_policy(db: Session) -> tuple[int, set[str], bool, str]:
    policy = load_admin_settings(db)["resourcePolicy"]
    match = re.fullmatch(r"\s*(\d+)\s*(MB|KB|B)\s*", str(policy["maxFileSize"]), re.I)
    if not match:
        raise HTTPException(status_code=500, detail="Invalid maximum upload size configuration.")
    size, unit = int(match.group(1)), match.group(2).upper()
    max_bytes = size * {"MB": 1024 * 1024, "KB": 1024, "B": 1}[unit]
    if max_bytes <= 0 or max_bytes > 100 * 1024 * 1024:
        raise HTTPException(status_code=500, detail="Maximum upload size must be between 1 byte and 100 MB.")

    extensions = {
        f".{token.strip().lower().lstrip('.')}"
        for token in str(policy["allowedFormats"]).split(",")
        if token.strip()
    }
    if not extensions or extensions - ALLOWED_EXTENSIONS.keys():
        raise HTTPException(status_code=500, detail="Invalid allowed file formats configuration.")
    visibility_setting = str(policy["defaultVisibility"]).strip().lower()
    if visibility_setting not in {"public — all visitors", "staff only"}:
        raise HTTPException(status_code=500, detail="Invalid default resource visibility configuration.")
    visibility = "staff_only" if visibility_setting == "staff only" else "public"
    return max_bytes, extensions, bool(policy["detectDuplicates"]), visibility


@router.post("/upload", status_code=status.HTTP_201_CREATED)
def upload_resource(
    file: UploadFile = File(...),
    title: str = Form(..., min_length=1, max_length=255),
    description: str = Form("", max_length=10000),
    resource_type: str = Form("other"),
    course_code: Optional[str] = Form(None),
    category_id: Optional[str] = Form(None),
    programming_language: Optional[str] = Form(None),
    keywords: str = Form(""),
    current_user: User = Depends(allow_staff_or_admin),
    db: Session = Depends(get_db),
):
    if resource_type not in RESOURCE_TYPES:
        raise HTTPException(status_code=422, detail="Unsupported resource type")
    title = title.strip()
    if not title:
        raise HTTPException(status_code=422, detail="Title cannot be empty")
    max_upload_size, allowed_extensions, detect_duplicates, visibility = _upload_policy(db)
    original_filename = re.split(r"[/\\]", file.filename or "upload")[-1]
    extension = Path(original_filename).suffix.lower()
    file_info = ALLOWED_EXTENSIONS.get(extension)
    if file_info is None or extension not in allowed_extensions:
        raise HTTPException(status_code=415, detail="This file type is not permitted")

    selected_category_id = None
    if category_id:
        try:
            selected_category_id = uuid.UUID(category_id)
        except ValueError as exc:
            raise HTTPException(status_code=422, detail="Invalid category") from exc
        if not db.execute(
            text("SELECT 1 FROM public.categories WHERE id = :category_id"),
            {"category_id": selected_category_id},
        ).first():
            raise HTTPException(status_code=422, detail="Category not found")

    selected_course_id = None
    if course_code:
        course = db.execute(
            text("SELECT id, category_id FROM public.courses WHERE course_code = :course_code"),
            {"course_code": course_code.strip()},
        ).first()
        if not course:
            raise HTTPException(status_code=422, detail="Course not found")
        if (
            selected_category_id
            and course.category_id
            and course.category_id != selected_category_id
        ):
            raise HTTPException(
                status_code=422,
                detail="The selected category does not match the course category",
            )
        selected_course_id = course.id

    clean_keywords = list(dict.fromkeys(
        item.strip()[:64] for item in keywords.split(",") if item.strip()
    ))[:20]
    language = (programming_language or file_info[1] or "").strip() or None
    storage_key = f"{uuid.uuid4().hex}{extension}"
    try:
        file_bytes = file.file.read(max_upload_size + 1)
        file_size = len(file_bytes)
        if file_size == 0:
            raise HTTPException(status_code=422, detail="The uploaded file is empty")
        if file_size > max_upload_size:
            raise HTTPException(
                status_code=413,
                detail="File exceeds the configured maximum upload size.",
            )
        content_hash = hashlib.sha256(file_bytes).hexdigest()
        if detect_duplicates and db.execute(
            text("SELECT 1 FROM public.resources WHERE content_hash = :content_hash LIMIT 1"),
            {"content_hash": content_hash},
        ).first():
            raise HTTPException(
                status_code=409,
                detail="An identical file has already been submitted.",
            )

        save_uploaded_bytes(file_bytes, storage_key)

        resource_id = db.execute(
            text(
                """
                INSERT INTO public.resources
                    (title, description, file_url, file_type, file_size, course_id,
                     category_id, programming_language, keywords, status, resource_type,
                     storage_key, original_filename, backend_uploader_id, visibility,
                     content_hash)
                VALUES
                    (:title, :description, :file_url, :file_type, :file_size, :course_id,
                     :category_id, :programming_language, :keywords,
                     'approved'::public.resource_status, :resource_type,
                     :storage_key, :original_filename, :uploader_id, :visibility,
                     :content_hash)
                RETURNING id
                """
            ),
            {
                "title": title,
                "description": description.strip(),
                "file_url": "",
                "file_type": file_info[0],
                "file_size": file_size,
                "course_id": selected_course_id,
                "category_id": selected_category_id,
                "programming_language": language,
                "keywords": clean_keywords,
                "resource_type": resource_type,
                "storage_key": storage_key,
                "original_filename": original_filename[:255],
                "uploader_id": current_user.id,
                "visibility": visibility,
                "content_hash": content_hash,
            },
        ).scalar_one()
        file_url = f"/api/v1/resources/{resource_id}/download"
        db.execute(
            text("UPDATE public.resources SET file_url = :file_url WHERE id = :id"),
            {"file_url": file_url, "id": resource_id},
        )
        _notify_user(
            db,
            current_user.id,
            "Resource published",
            f"{title.strip()} is now available to students.",
            "resource_publication",
        )
        db.commit()
    except HTTPException:
        db.rollback()
        raise
    except (OSError, SQLAlchemyError) as exc:
        db.rollback()
        logger.exception("Could not save uploaded resource")
        raise HTTPException(status_code=500, detail="Resource upload failed") from exc
    finally:
        file.file.close()

    return {"id": str(resource_id), "status": "approved", "file_url": file_url}


@router.get("/{resource_id}/comments")
def get_resource_comments(
    resource_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    parsed_id = _resource_id(resource_id)
    _visible_resource(db, parsed_id, current_user)
    rows = db.execute(
        text(
            """
            SELECT c.id, c.parent_id, c.content, c.created_at, c.user_id,
                   u.full_name AS author_name, u.username AS author_username,
                   u.avatar_key
            FROM public.backend_comments c
            JOIN public.users u ON u.id = c.user_id
            WHERE c.resource_id = :resource_id
            ORDER BY c.created_at ASC
            """
        ),
        {"resource_id": parsed_id},
    ).mappings().all()
    return [
        {
            "id": str(row["id"]),
            "parent_id": str(row["parent_id"]) if row["parent_id"] else None,
            "content": row["content"],
            "author": row["author_name"] or row["author_username"] or "User",
            "avatar_url": (
                f"/api/v1/auth/users/{row['user_id']}/avatar"
                if row["avatar_key"]
                else None
            ),
            "created_at": row["created_at"].isoformat(),
        }
        for row in rows
    ]


@router.get("/{resource_id}/preview")
def preview_resource(
    resource_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    parsed_id = _resource_id(resource_id)
    resource = _visible_resource(db, parsed_id, current_user)
    if resource["file_type"] not in {"code", "text"}:
        raise HTTPException(
            status_code=415,
            detail="This resource type does not support text preview",
        )
    storage_key = resource["storage_key"]
    if not storage_key:
        raise HTTPException(status_code=404, detail="Resource file is not stored")
    try:
        stored_bytes = read_stored_bytes(storage_key)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Resource file is unavailable") from exc
    return {
        "id": str(parsed_id),
        "title": resource["title"],
        "filename": resource["original_filename"] or resource["title"],
        "language": resource["programming_language"] or "text",
        "content": stored_bytes.decode("utf-8", errors="replace"),
    }


@router.get("/{resource_id}/file-preview")
def preview_document_file(
    resource_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    parsed_id = _resource_id(resource_id)
    resource = _visible_resource(db, parsed_id, current_user)
    filename = resource["original_filename"] or ""
    if resource["file_type"] != "document" or Path(filename).suffix.lower() != ".pdf":
        raise HTTPException(status_code=415, detail="Only PDF documents can be previewed inline")
    storage_key = resource["storage_key"]
    if not storage_key:
        raise HTTPException(status_code=404, detail="Resource file is not stored")
    try:
        stored_bytes = read_stored_bytes(storage_key)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Resource file is unavailable") from exc
    safe_name = filename.replace("\r", "").replace("\n", "")
    return StreamingResponse(
        BytesIO(stored_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{safe_name}"'},
    )


@router.post("/{resource_id}/comments", status_code=status.HTTP_201_CREATED)
def create_resource_comment(
    resource_id: str,
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    parsed_id = _resource_id(resource_id)
    resource = _visible_resource(db, parsed_id, current_user)
    content = comment.content.strip()
    if not content:
        raise HTTPException(status_code=422, detail="Comment cannot be empty")
    parent_user_id = None
    if comment.parent_id:
        parent = db.execute(
            text(
                "SELECT user_id FROM public.backend_comments "
                "WHERE id = :parent_id AND resource_id = :resource_id"
            ),
            {"parent_id": comment.parent_id, "resource_id": parsed_id},
        ).first()
        if not parent:
            raise HTTPException(status_code=422, detail="Reply target not found")
        parent_user_id = parent.user_id

    row = db.execute(
        text(
            """
            INSERT INTO public.backend_comments (resource_id, user_id, parent_id, content)
            VALUES (:resource_id, :user_id, :parent_id, :content)
            RETURNING id, created_at
            """
        ),
        {
            "resource_id": parsed_id,
            "user_id": current_user.id,
            "parent_id": comment.parent_id,
            "content": content,
        },
    ).mappings().one()
    notified_users = set()
    if parent_user_id not in (None, current_user.id):
        _notify_user(
            db,
            parent_user_id,
            "New reply to your comment",
            f"{current_user.full_name or current_user.username} replied to your comment on {resource['title']}.",
            "resource_reply",
        )
        notified_users.add(parent_user_id)
    if (
        resource["backend_uploader_id"] not in (None, current_user.id)
        and resource["backend_uploader_id"] not in notified_users
    ):
        _notify_user(
            db,
            resource["backend_uploader_id"],
            "New resource comment",
            f"{current_user.full_name} commented on {resource['title']}.",
            "resource_comment",
        )
    db.commit()
    return {
        "id": str(row["id"]),
        "parent_id": str(comment.parent_id) if comment.parent_id else None,
        "content": content,
        "author": current_user.full_name or current_user.username,
        "avatar_url": (
            f"/api/v1/auth/users/{current_user.id}/avatar"
            if getattr(current_user, "avatar_key", None)
            else None
        ),
        "created_at": row["created_at"].isoformat(),
    }


@router.put("/{resource_id}/bookmark")
def save_resource(
    resource_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    parsed_id = _resource_id(resource_id)
    _visible_resource(db, parsed_id, current_user)
    db.execute(
        text(
            """
            INSERT INTO public.backend_saved_resources (user_id, resource_id)
            VALUES (:user_id, :resource_id)
            ON CONFLICT (user_id, resource_id) DO NOTHING
            """
        ),
        {"user_id": current_user.id, "resource_id": parsed_id},
    )
    db.commit()
    return {"saved": True}


@router.delete("/{resource_id}/bookmark")
def remove_saved_resource(
    resource_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    parsed_id = _resource_id(resource_id)
    _visible_resource(db, parsed_id, current_user)
    db.execute(
        text(
            "DELETE FROM public.backend_saved_resources "
            "WHERE user_id = :user_id AND resource_id = :resource_id"
        ),
        {"user_id": current_user.id, "resource_id": parsed_id},
    )
    db.commit()
    return {"saved": False}


@router.get("/{resource_id}/download")
def download_resource(
    resource_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    parsed_id = _resource_id(resource_id)
    resource = _visible_resource(db, parsed_id, current_user)
    storage_key = resource["storage_key"]
    if not storage_key:
        raise HTTPException(status_code=404, detail="Resource file is not stored")
    try:
        stored_bytes = read_stored_bytes(storage_key)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Resource file is unavailable") from exc

    if current_user is not None:
        db.execute(
            text(
                "INSERT INTO public.backend_downloads (user_id, resource_id) "
                "VALUES (:user_id, :resource_id)"
            ),
            {"user_id": current_user.id, "resource_id": parsed_id},
        )
        db.commit()
    filename = resource["original_filename"] or f"{resource['title']}{Path(resource['original_filename'] or resource['title']).suffix if resource['original_filename'] else ''}"
    filename = filename.replace("\r", "").replace("\n", "")
    media_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
    return StreamingResponse(
        BytesIO(stored_bytes),
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{resource_id}")
def get_resource_by_id(
    resource_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    parsed_id = _resource_id(resource_id)
    resource = _visible_resource(db, parsed_id, current_user)
    values = _resource_values(resource)
    values["is_saved"] = (
        db.execute(
            text(
                "SELECT 1 FROM public.backend_saved_resources "
                "WHERE user_id = :user_id AND resource_id = :resource_id"
            ),
            {"user_id": current_user.id, "resource_id": parsed_id},
        ).first()
        is not None
        if current_user
        else False
    )
    return values
