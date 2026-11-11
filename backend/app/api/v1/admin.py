import re
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import RoleChecker, get_optional_current_user
from app.db.session import get_db
from app.models.user import User, UserRole

router = APIRouter(prefix="/admin", tags=["Admin"])
support_router = APIRouter(prefix="/support", tags=["Support"])
allow_admin = RoleChecker(["admin"])
allow_optional_user = get_optional_current_user


class UserUpdate(BaseModel):
    role: Optional[str] = Field(default=None, pattern="^(student|staff|admin)$")
    is_active: Optional[bool] = None


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str = Field(default="", max_length=2000)
    parent_id: Optional[uuid.UUID] = None


class CategoryUpdate(CategoryCreate):
    is_active: Optional[bool] = None


class CourseCreate(BaseModel):
    course_code: str = Field(min_length=1, max_length=20)
    title: str = Field(min_length=1, max_length=255)
    level: int = Field(ge=100, le=900)
    category_id: uuid.UUID
    academic_session: Optional[str] = Field(default=None, max_length=20)


class SettingsUpdate(BaseModel):
    settings: dict


class SupportTicketCreate(BaseModel):
    subject: str = Field(min_length=3, max_length=255)
    category: str = Field(min_length=1, max_length=80)
    message: str = Field(min_length=10, max_length=10000)
    name: Optional[str] = Field(default=None, max_length=255)
    email: Optional[EmailStr] = None
    include_device_info: bool = False
    device_info: Optional[str] = Field(default=None, max_length=1000)


def _role_value(user: User) -> str:
    return user.role.value if hasattr(user.role, "value") else str(user.role)


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    if not slug:
        raise HTTPException(status_code=422, detail="Category name must contain letters or numbers")
    return slug


@router.get("/users")
def get_admin_users(
    db: Session = Depends(get_db),
    _: User = Depends(allow_admin),
):
    rows = db.execute(
        text(
            """
            SELECT u.id, u.full_name, u.username, u.email, u.role, u.is_active,
                   u.created_at,
                   (SELECT count(*) FROM public.resources r
                    WHERE r.backend_uploader_id = u.id) AS resources_uploaded
            FROM public.users u
            ORDER BY u.created_at DESC
            """
        )
    ).mappings().all()
    return [
        {
            "id": str(row["id"]),
            "name": row["full_name"] or row["username"] or "User",
            "email": row["email"],
            "role": str(row["role"]).title(),
            "status": "Active" if row["is_active"] else "Suspended",
            "lastActive": "Not recorded",
            "staffOrMatricId": None,
            "joinedDate": row["created_at"].strftime("%d %b %Y") if row["created_at"] else "Unknown",
            "resourcesUploaded": row["resources_uploaded"],
        }
        for row in rows
    ]


@router.patch("/users/{user_id}")
def update_admin_user(
    user_id: int,
    body: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admin),
):
    target = db.query(User).filter(User.id == user_id).first()
    if target is None:
        raise HTTPException(status_code=404, detail="User not found")
    if target.id == current_user.id and (
        body.role not in (None, "admin") or body.is_active is False
    ):
        raise HTTPException(status_code=400, detail="You cannot remove your own administrator access")
    if body.role is not None:
        target.role = UserRole(body.role)
    if body.is_active is not None:
        target.is_active = body.is_active
    db.commit()
    db.refresh(target)
    return {"id": str(target.id), "role": _role_value(target), "is_active": target.is_active}


@router.get("/categories")
def get_admin_categories(
    db: Session = Depends(get_db),
    _: User = Depends(allow_admin),
):
    categories = db.execute(
        text(
            """
            SELECT c.id, c.name, c.description, c.is_active, c.parent_id,
                   p.name AS parent_name,
                   (SELECT count(*) FROM public.resources r WHERE r.category_id = c.id) AS resource_count,
                   (SELECT count(*) FROM public.courses cr WHERE cr.category_id = c.id) AS course_count,
                   (SELECT count(*) FROM public.categories child WHERE child.parent_id = c.id) AS subcategory_count
            FROM public.categories c
            LEFT JOIN public.categories p ON p.id = c.parent_id
            ORDER BY c.name
            """
        )
    ).mappings().all()
    courses = db.execute(
        text(
            """
            SELECT cr.id, cr.course_code, cr.title, cr.level, cr.category_id,
                   cr.academic_session, cr.is_active,
                   (SELECT count(*) FROM public.resources r WHERE r.course_id = cr.id) AS resource_count
            FROM public.courses cr
            ORDER BY cr.course_code
            """
        )
    ).mappings().all()
    return {
        "categories": [
            {
                "id": str(row["id"]),
                "name": row["name"],
                "resourceCount": row["resource_count"],
                "courseCount": row["course_count"],
                "subcategoryCount": row["subcategory_count"],
                "status": "Active" if row["is_active"] else "Archived",
                "parent": row["parent_name"] or "None — Top-level category",
                "parentId": str(row["parent_id"]) if row["parent_id"] else None,
                "description": row["description"] or "",
            }
            for row in categories
        ],
        "courses": [
            {
                "id": str(row["id"]),
                "code": row["course_code"],
                "title": row["title"],
                "session": row["academic_session"] or "—",
                "level": str(row["level"]),
                "resources": row["resource_count"],
                "categoryId": str(row["category_id"]) if row["category_id"] else None,
                "status": "Active" if row["is_active"] else "Archived",
            }
            for row in courses
        ],
    }


@router.post("/categories", status_code=201)
def create_category(
    body: CategoryCreate,
    db: Session = Depends(get_db),
    _: User = Depends(allow_admin),
):
    row = db.execute(
        text(
            """
            INSERT INTO public.categories (name, slug, description, parent_id)
            VALUES (:name, :slug, :description, :parent_id)
            RETURNING id, name
            """
        ),
        {
            "name": body.name.strip(),
            "slug": _slugify(body.name),
            "description": body.description.strip(),
            "parent_id": body.parent_id,
        },
    ).mappings().one()
    db.commit()
    return {"id": str(row["id"]), "name": row["name"]}


@router.patch("/categories/{category_id}")
def update_category(
    category_id: uuid.UUID,
    body: CategoryUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(allow_admin),
):
    row = db.execute(
        text(
            """
            UPDATE public.categories
            SET name = :name, slug = :slug, description = :description,
                parent_id = :parent_id,
                is_active = COALESCE(:is_active, is_active)
            WHERE id = :id
            RETURNING id
            """
        ),
        {
            "id": category_id,
            "name": body.name.strip(),
            "slug": _slugify(body.name),
            "description": body.description.strip(),
            "parent_id": body.parent_id,
            "is_active": body.is_active,
        },
    ).first()
    if row is None:
        raise HTTPException(status_code=404, detail="Category not found")
    db.commit()
    return {"id": str(category_id), "updated": True}


@router.post("/courses", status_code=201)
def create_course(
    body: CourseCreate,
    db: Session = Depends(get_db),
    _: User = Depends(allow_admin),
):
    category_exists = db.execute(
        text("SELECT 1 FROM public.categories WHERE id = :id AND is_active"),
        {"id": body.category_id},
    ).first()
    if category_exists is None:
        raise HTTPException(status_code=422, detail="Select an active category")
    row = db.execute(
        text(
            """
            INSERT INTO public.courses (course_code, title, level, category_id, academic_session)
            VALUES (:code, :title, :level, :category_id, :academic_session)
            RETURNING id
            """
        ),
        {
            "code": body.course_code.strip().upper(),
            "title": body.title.strip(),
            "level": body.level,
            "category_id": body.category_id,
            "academic_session": body.academic_session,
        },
    ).first()
    db.commit()
    return {"id": str(row.id)}


@router.patch("/courses/{course_id}")
def update_course(
    course_id: uuid.UUID,
    body: CourseCreate,
    db: Session = Depends(get_db),
    _: User = Depends(allow_admin),
):
    result = db.execute(
        text(
            """
            UPDATE public.courses
            SET course_code = :code, title = :title, level = :level,
                category_id = :category_id, academic_session = :academic_session
            WHERE id = :id
            """
        ),
        {
            "id": course_id,
            "code": body.course_code.strip().upper(),
            "title": body.title.strip(),
            "level": body.level,
            "category_id": body.category_id,
            "academic_session": body.academic_session,
        },
    )
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    db.commit()
    return {"id": str(course_id), "updated": True}


@router.patch("/courses/{course_id}/archive")
def archive_course(
    course_id: uuid.UUID,
    archived: bool = Query(True),
    db: Session = Depends(get_db),
    _: User = Depends(allow_admin),
):
    result = db.execute(
        text("UPDATE public.courses SET is_active = :active WHERE id = :id"),
        {"id": course_id, "active": not archived},
    )
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    db.commit()
    return {"id": str(course_id), "archived": archived}


@router.get("/analytics")
def get_admin_analytics(
    db: Session = Depends(get_db),
    _: User = Depends(allow_admin),
):
    metrics = db.execute(
        text(
            """
            SELECT
                (SELECT count(*) FROM public.backend_downloads) AS total_downloads,
                (SELECT count(*) FROM public.users WHERE is_active) AS active_users,
                (SELECT count(*) FROM public.resources) AS uploaded_resources,
                (SELECT round(count(*)::numeric / 30, 1)
                 FROM public.backend_downloads
                 WHERE downloaded_at >= NOW() - INTERVAL '30 days') AS average_daily_downloads
            """
        )
    ).mappings().one()
    popular = db.execute(
        text(
            """
            SELECT r.id, r.title, COALESCE(c.course_code, 'CSE') AS course,
                   count(d.id) AS downloads
            FROM public.resources r
            LEFT JOIN public.courses c ON c.id = r.course_id
            LEFT JOIN public.backend_downloads d ON d.resource_id = r.id
            WHERE r.status::text = 'approved'
            GROUP BY r.id, r.title, c.course_code
            ORDER BY downloads DESC, r.created_at DESC
            LIMIT 10
            """
        )
    ).mappings().all()
    return {
        "metrics": {
            "totalDownloads": metrics["total_downloads"],
            "activeUsers": metrics["active_users"],
            "uploadedResources": metrics["uploaded_resources"],
            "avgDailyDownloads": float(metrics["average_daily_downloads"] or 0),
        },
        "popularResources": [
            {
                "id": str(row["id"]),
                "title": row["title"],
                "course": row["course"],
                "downloads": row["downloads"],
                "change": "—",
            }
            for row in popular
        ],
    }


@router.get("/settings")
def get_admin_settings(
    db: Session = Depends(get_db),
    _: User = Depends(allow_admin),
):
    row = db.execute(
        text("SELECT settings, updated_at FROM public.admin_settings WHERE id = 1")
    ).mappings().first()
    if row is None:
        return {"settings": None, "updatedAt": None}
    return {
        "settings": row["settings"],
        "updatedAt": row["updated_at"].isoformat() if row["updated_at"] else None,
    }


@router.put("/settings")
def save_admin_settings(
    body: SettingsUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(allow_admin),
):
    import json

    row = db.execute(
        text(
            """
            INSERT INTO public.admin_settings (id, settings, updated_at)
            VALUES (1, CAST(:settings AS jsonb), NOW())
            ON CONFLICT (id) DO UPDATE
            SET settings = EXCLUDED.settings, updated_at = NOW()
            RETURNING updated_at
            """
        ),
        {"settings": json.dumps(body.settings)},
    ).mappings().one()
    db.commit()
    return {"settings": body.settings, "updatedAt": row["updated_at"].isoformat()}


@support_router.post("/tickets", status_code=201)
def create_support_ticket(
    body: SupportTicketCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(allow_optional_user),
):
    email = current_user.email if current_user else (str(body.email) if body.email else None)
    name = current_user.full_name if current_user else body.name
    if not email or not name:
        raise HTTPException(status_code=422, detail="Name and email are required")
    device_info = body.device_info if body.include_device_info else None
    row = db.execute(
        text(
            """
            INSERT INTO public.support_tickets
                (user_id, name, email, subject, category, message, device_info)
            VALUES (:user_id, :name, :email, :subject, :category, :message, :device_info)
            RETURNING id, created_at
            """
        ),
        {
            "user_id": current_user.id if current_user else None,
            "name": name,
            "email": email,
            "subject": body.subject.strip(),
            "category": body.category,
            "message": body.message.strip(),
            "device_info": device_info,
        },
    ).mappings().one()
    db.commit()
    return {"id": str(row["id"]), "status": "open", "createdAt": row["created_at"].isoformat()}


@router.get("/support-tickets")
def list_support_tickets(
    status_filter: Optional[str] = Query(None, alias="status", pattern="^(open|in_progress|resolved|closed)$"),
    db: Session = Depends(get_db),
    _: User = Depends(allow_admin),
):
    rows = db.execute(
        text(
            """
            SELECT id, name, email, subject, category, message, device_info, status, created_at
            FROM public.support_tickets
            WHERE (:status IS NULL OR status = :status)
            ORDER BY created_at DESC
            LIMIT 200
            """
        ),
        {"status": status_filter},
    ).mappings().all()
    return [
        {
            **dict(row),
            "id": str(row["id"]),
            "createdAt": row["created_at"].isoformat(),
        }
        for row in rows
    ]


@router.patch("/support-tickets/{ticket_id}")
def update_support_ticket(
    ticket_id: uuid.UUID,
    status_value: str = Query(..., alias="status", pattern="^(open|in_progress|resolved|closed)$"),
    db: Session = Depends(get_db),
    _: User = Depends(allow_admin),
):
    result = db.execute(
        text("UPDATE public.support_tickets SET status = :status WHERE id = :id"),
        {"id": ticket_id, "status": status_value},
    )
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Support ticket not found")
    db.commit()
    return {"id": str(ticket_id), "status": status_value}
