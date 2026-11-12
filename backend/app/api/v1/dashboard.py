from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import RoleChecker
from app.db.session import get_db
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])
allow_staff = RoleChecker(["staff", "admin"])
allow_admin = RoleChecker(["admin"])
allow_student = RoleChecker(["student"])


@router.get("/student")
def get_student_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_student),
):
    user_id = current_user.id
    metrics = db.execute(
        text(
            """
            SELECT
                (SELECT count(*) FROM public.resources WHERE status::text = 'approved') AS total_resources,
                (SELECT count(*) FROM public.backend_downloads
                 WHERE user_id = :user_id AND downloaded_at >= NOW() - INTERVAL '30 days') AS downloads,
                (SELECT count(*) FROM public.backend_saved_resources WHERE user_id = :user_id) AS bookmarks,
                (SELECT count(*) FROM public.backend_search_events
                 WHERE user_id = :user_id AND created_at >= NOW() - INTERVAL '30 days') AS recent_searches
            """
        ),
        {"user_id": user_id},
    ).mappings().one()
    recent_resources = db.execute(
        text(
            """
            SELECT r.id, r.title, r.resource_type, r.file_type, r.created_at,
                   c.course_code, cat.name AS category
            FROM public.resources r
            LEFT JOIN public.courses c ON c.id = r.course_id
            LEFT JOIN public.categories cat ON cat.id = r.category_id
            WHERE r.status::text = 'approved'
            ORDER BY r.created_at DESC
            LIMIT 5
            """
        )
    ).mappings().all()
    return {
        "metrics": {
            "totalResources": metrics["total_resources"],
            "downloads": metrics["downloads"],
            "bookmarks": metrics["bookmarks"],
            "recentSearches": metrics["recent_searches"],
        },
        "recentResources": [
            {
                "id": str(row["id"]),
                "title": row["title"],
                "resourceType": row["resource_type"],
                "fileType": row["file_type"],
                "course": row["course_code"],
                "category": row["category"],
                "createdAt": row["created_at"].isoformat() if row["created_at"] else None,
            }
            for row in recent_resources
        ],
        "categories": [
            {"title": "Past Questions", "cat": "past-questions"},
            {"title": "Projects", "cat": "projects"},
            {"title": "Lecture Notes", "cat": "lecture-notes"},
            {"title": "Code Samples", "cat": "code-samples"},
        ],
    }


@router.get("/staff")
def get_staff_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_staff),
):
    metrics = db.execute(
        text(
            """
            SELECT
                (SELECT count(*) FROM public.resources) AS total_resources,
                (SELECT count(*) FROM public.resources WHERE status::text = 'pending') AS pending_review,
                (SELECT count(*) FROM public.backend_downloads) AS total_downloads,
                (SELECT count(*) FROM public.users WHERE is_active) AS active_users
            """
        )
    ).mappings().one()
    recent_submissions = db.execute(
        text(
            """
            SELECT r.id, r.title, r.status::text AS status, r.created_at,
                   COALESCE(u.full_name, u.username, 'Unknown user') AS submitter,
                   c.course_code
            FROM public.resources r
            LEFT JOIN public.users u ON u.id = r.backend_uploader_id
            LEFT JOIN public.courses c ON c.id = r.course_id
            ORDER BY r.created_at DESC
            LIMIT 6
            """
        )
    ).mappings().all()
    return {
        "metrics": {
            "totalResources": metrics["total_resources"],
            "pendingReview": metrics["pending_review"],
            "totalDownloads": metrics["total_downloads"],
            "activeUsers": metrics["active_users"],
        },
        "recentSubmissions": [
            {
                "id": str(row["id"]),
                "title": row["title"],
                "status": row["status"],
                "submittedAt": row["created_at"].isoformat() if row["created_at"] else None,
                "submitter": row["submitter"],
                "course": row["course_code"],
            }
            for row in recent_submissions
        ],
    }


@router.get("/admin")
def get_admin_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admin),
):
    metrics = db.execute(
        text(
            """
            SELECT
                (SELECT count(*) FROM public.resources) AS total_resources,
                (SELECT count(*) FROM public.users) AS total_users,
                (SELECT count(*) FROM public.resources WHERE status::text = 'pending') AS pending_review,
                (SELECT count(*) FROM public.backend_downloads) AS total_downloads
            """
        )
    ).mappings().one()
    roles = db.execute(
        text("SELECT role, count(*) AS total FROM public.users GROUP BY role")
    ).mappings().all()
    role_counts = {str(row["role"]).lower(): row["total"] for row in roles}
    total_users = metrics["total_users"]
    colors = {"student": "#7148FF", "staff": "#F6B93D", "admin": "#FF4869"}
    labels = {"student": "Students", "staff": "Staff", "admin": "Admins"}
    distribution = [
        {
            "label": labels[role],
            "count": role_counts.get(role, 0),
            "percentage": f"{(role_counts.get(role, 0) / total_users * 100):.1f}%" if total_users else "0%",
            "color": colors[role],
        }
        for role in ("student", "staff", "admin")
    ]
    growth_rows = db.execute(
        text(
            """
            SELECT months.month::date AS month, count(r.id) AS total
            FROM generate_series(
                date_trunc('month', NOW()) - INTERVAL '5 months',
                date_trunc('month', NOW()),
                INTERVAL '1 month'
            ) AS months(month)
            LEFT JOIN public.resources r
              ON date_trunc('month', r.created_at) = months.month
            GROUP BY months.month
            ORDER BY months.month
            """
        )
    ).mappings().all()
    return {
        "metrics": {
            "totalResources": metrics["total_resources"],
            "totalUsers": total_users,
            "pendingReview": metrics["pending_review"],
            "totalDownloads": metrics["total_downloads"],
        },
        "userDistribution": distribution,
        "resourceGrowth": [
            {
                "month": row["month"].strftime("%b %Y"),
                "count": row["total"],
            }
            for row in growth_rows
        ],
    }
