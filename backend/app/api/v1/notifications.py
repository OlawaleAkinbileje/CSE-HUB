import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User

router = APIRouter(prefix="/notifications", tags=["Notifications"])


def _notification_id(value: str) -> uuid.UUID:
    try:
        return uuid.UUID(value)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail="Notification not found") from exc


@router.get("/")
def get_user_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = db.execute(
        text(
            """
            SELECT id, title, message, is_read, notification_type, created_at
            FROM public.backend_notifications
            WHERE user_id = :user_id
            ORDER BY created_at DESC
            LIMIT 100
            """
        ),
        {"user_id": current_user.id},
    ).mappings().all()
    return [
        {
            "id": str(row["id"]),
            "title": row["title"],
            "description": row["message"],
            "category": (
                "Reviews"
                if row["notification_type"] in {"resource_review", "resource_submission"}
                else "Resources"
                if row["notification_type"] == "resource_comment"
                else "System"
            ),
            "timestamp": row["created_at"].isoformat(),
            "isRead": row["is_read"],
        }
        for row in rows
    ]


@router.patch("/{notification_id}/read")
def mark_notification_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = db.execute(
        text(
            """
            UPDATE public.backend_notifications
            SET is_read = TRUE
            WHERE id = :notification_id AND user_id = :user_id
            RETURNING id
            """
        ),
        {
            "notification_id": _notification_id(notification_id),
            "user_id": current_user.id,
        },
    ).first()
    if result is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.commit()
    return {"id": str(result.id), "is_read": True}


@router.post("/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = db.execute(
        text(
            """
            UPDATE public.backend_notifications
            SET is_read = TRUE
            WHERE user_id = :user_id AND is_read = FALSE
            """
        ),
        {"user_id": current_user.id},
    )
    db.commit()
    return {"updated": result.rowcount}
