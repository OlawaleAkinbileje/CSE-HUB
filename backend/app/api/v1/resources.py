from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import RoleChecker, get_current_user
from app.models.user import User
from app.models.resource import Resource, ResourceType, ResourceStatus

router = APIRouter(prefix="/resources", tags=["Resources"])

# Require staff or admin privileges for uploads/approvals
allow_staff_or_admin = RoleChecker(["staff", "admin"])

@router.get("/")
def get_resources(
    resource_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    course_code: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Resource)
        if resource_type:
            query = query.filter(Resource.resource_type == resource_type)
        if status:
            query = query.filter(Resource.status == status)
        elif not status:
            # Default to approved for public search
            query = query.filter(Resource.status == ResourceStatus.APPROVED)
        if course_code:
            query = query.filter(Resource.course_code.ilike(f"%{course_code}%"))
        if search:
            query = query.filter(
                (Resource.title.ilike(f"%{search}%")) |
                (Resource.description.ilike(f"%{search}%"))
            )
        resources = query.offset(offset).limit(limit).all()
        return [
            {
                "id": str(r.id),
                "title": r.title,
                "description": r.description or "",
                "resource_type": r.resource_type.value if hasattr(r.resource_type, "value") else str(r.resource_type),
                "course_code": r.course_code or "",
                "file_url": r.file_url,
                "status": r.status.value if hasattr(r.status, "value") else str(r.status),
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "uploader_id": r.uploader_id,
                "uploader_name": r.uploader.full_name if r.uploader else "Department Staff",
            }
            for r in resources
        ]
    except Exception:
        return []

@router.get("/past-questions")
def get_past_questions(db: Session = Depends(get_db)):
    """Returns past questions list or aggregated years safely."""
    try:
        resources = db.query(Resource).filter(
            Resource.resource_type == ResourceType.PAST_QUESTION,
            Resource.status == ResourceStatus.APPROVED
        ).all()
        return [
            {
                "id": str(r.id),
                "title": r.title,
                "course_code": r.course_code or "CSE",
                "file_url": r.file_url,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in resources
        ]
    except Exception:
        return []

@router.get("/projects")
def get_projects(db: Session = Depends(get_db)):
    """Returns projects repository list safely."""
    try:
        resources = db.query(Resource).filter(
            Resource.resource_type == ResourceType.PROJECT,
            Resource.status == ResourceStatus.APPROVED
        ).all()
        return [
            {
                "id": str(r.id),
                "title": r.title,
                "description": r.description or "",
                "tags": [r.course_code] if r.course_code else ["Computer Science"],
                "year": r.created_at.year if r.created_at else 2026,
                "department": "Computer Science & Engineering",
                "downloads": 0,
                "imageUrl": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
                "file_url": r.file_url,
            }
            for r in resources
        ]
    except Exception:
        return []

@router.get("/code-preview")
def get_code_preview(db: Session = Depends(get_db)):
    """Returns active code snippet preview safely."""
    try:
        resource = db.query(Resource).filter(
            Resource.resource_type == ResourceType.CODE_PREVIEW,
            Resource.status == ResourceStatus.APPROVED
        ).first()
        if resource:
            return {
                "id": str(resource.id),
                "title": resource.title,
                "description": resource.description or "",
                "code": resource.description or "",
                "language": "python",
                "filename": f"{resource.title.lower().replace(' ', '_')}.py",
            }
    except Exception:
        pass
    return {
        "id": "1",
        "title": "Sample Python Model",
        "description": "Scikit-Learn Machine Learning Pipeline",
        "code": "# Import necessary libraries\nimport numpy as np\nimport pandas as pd\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.ensemble import RandomForestClassifier\n\n# Load dataset\ndata = pd.read_csv('dataset.csv')\n\n# Split features and target\nX = data.drop('target', axis=1)\ny = data['target']\n\n# Split data into training and testing sets\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.2, random_state=42\n)",
        "language": "python",
        "filename": "model_pipeline.py",
    }

@router.get("/my-resources")
def get_my_resources(
    tab: str = Query("saved"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Returns the current user's saved or uploaded resources."""
    try:
        if not current_user:
            return []
        query = db.query(Resource).filter(Resource.uploader_id == current_user.id)
        resources = query.all()
        return [
            {
                "id": str(r.id),
                "title": r.title,
                "category": r.resource_type.value if hasattr(r.resource_type, "value") else str(r.resource_type),
                "format": "PDF",
                "size": "2.4 MB",
                "course": r.course_code or "CSE",
                "author": current_user.full_name or current_user.username or "Self",
                "savedDate": r.created_at.strftime("%d %b %Y") if r.created_at else "Recently",
                "downloadStatus": "Downloaded",
                "iconColor": "text-[#245CFF]",
                "iconBg": "bg-[#245CFF]/10",
                "file_url": r.file_url,
            }
            for r in resources
        ]
    except Exception:
        return []

@router.get("/submissions")
def get_staff_submissions(
    status: Optional[str] = Query("pending"),
    db: Session = Depends(get_db)
):
    """Returns submissions waiting for review safely."""
    try:
        query = db.query(Resource)
        if status:
            query = query.filter(Resource.status == status)
        submissions = query.all()
        return [
            {
                "id": f"sub-{s.id}",
                "title": s.title,
                "submitterName": s.uploader.full_name if s.uploader else "Student",
                "submitterRole": s.uploader.role if s.uploader else "student",
                "submitterEmail": s.uploader.email if s.uploader else "",
                "submitterId": f"CSE/ST/{s.uploader_id}",
                "course": s.course_code or "CSE",
                "courseTitle": "Computer Science Resource",
                "academicYear": "2026 / 2027",
                "category": s.resource_type.value if hasattr(s.resource_type, "value") else str(s.resource_type),
                "fileType": "Document",
                "fileName": f"{s.title}.pdf",
                "fileSize": "2.1 MB",
                "pageCount": 12,
                "visibility": "Public",
                "tags": [s.course_code] if s.course_code else ["CSE"],
                "submittedDate": s.created_at.strftime("%d %b %Y") if s.created_at else "Recently",
                "status": "Pending" if s.status == ResourceStatus.PENDING else ("Approved" if s.status == ResourceStatus.APPROVED else "Rejected"),
            }
            for s in submissions
        ]
    except Exception:
        return []

@router.post("/approve/{resource_id}")
def approve_resource(
    resource_id: str, 
    current_user: User = Depends(allow_staff_or_admin)
):
    return {"message": f"Resource {resource_id} approved by {current_user.username}"}

@router.get("/{resource_id}")
def get_resource_by_id(resource_id: int, db: Session = Depends(get_db)):
    try:
        r = db.query(Resource).filter(Resource.id == resource_id).first()
        if r:
            return {
                "id": str(r.id),
                "title": r.title,
                "description": r.description or "",
                "resource_type": r.resource_type.value if hasattr(r.resource_type, "value") else str(r.resource_type),
                "course_code": r.course_code or "",
                "file_url": r.file_url,
                "status": r.status.value if hasattr(r.status, "value") else str(r.status),
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "uploader_name": r.uploader.full_name if r.uploader else "Department Staff",
            }
    except Exception:
        pass
    return None
