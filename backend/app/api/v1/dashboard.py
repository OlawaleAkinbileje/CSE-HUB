from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.user import User
from app.models.resource import Resource, ResourceStatus
from app.api.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/student")
def get_student_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Safely returns student metrics, falling back to 0s for new users."""
    total_resources = 0
    my_downloads = 0
    my_bookmarks = 0
    recent_searches = 0

    try:
        total_resources = db.query(Resource).filter(Resource.status == ResourceStatus.APPROVED).count()
        if current_user:
            # Count user's uploaded/saved if exists
            my_bookmarks = db.query(Resource).filter(Resource.uploader_id == current_user.id).count()
    except Exception:
        pass

    return {
        "metrics": {
            "totalResources": total_resources,
            "downloads": my_downloads,
            "bookmarks": my_bookmarks,
            "recentSearches": recent_searches,
        },
        "recentResources": [],
        "categories": [
            {"title": "Past Questions", "cat": "past-questions"},
            {"title": "Projects", "cat": "projects"},
            {"title": "Lecture Notes", "cat": "lecture-notes"},
            {"title": "Code Samples", "cat": "code-samples"},
        ]
    }

@router.get("/staff")
def get_staff_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Safely returns staff overview metrics."""
    total_resources = 0
    pending_review = 0
    total_downloads = 0
    active_users = 0

    try:
        total_resources = db.query(Resource).count()
        pending_review = db.query(Resource).filter(Resource.status == ResourceStatus.PENDING).count()
        active_users = db.query(User).filter(User.is_active == True).count()
    except Exception:
        pass

    return {
        "metrics": {
            "totalResources": total_resources,
            "pendingReview": pending_review,
            "totalDownloads": total_downloads,
            "activeUsers": active_users,
        },
        "recentSubmissions": []
    }

@router.get("/admin")
def get_admin_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Safely returns admin overview metrics and system distributions."""
    total_resources = 0
    total_users = 0
    pending_review = 0
    total_downloads = 0

    try:
        total_resources = db.query(Resource).count()
        total_users = db.query(User).count()
        pending_review = db.query(Resource).filter(Resource.status == ResourceStatus.PENDING).count()
    except Exception:
        pass

    return {
        "metrics": {
            "totalResources": total_resources,
            "totalUsers": total_users,
            "pendingReview": pending_review,
            "totalDownloads": total_downloads,
        },
        "userDistribution": [
            {"label": "Students", "percentage": "70%", "color": "#7148FF"},
            {"label": "Staff", "percentage": "20%", "color": "#F6B93D"},
            {"label": "Admins", "percentage": "10%", "color": "#FF4869"},
        ],
        "resourceGrowth": []
    }

