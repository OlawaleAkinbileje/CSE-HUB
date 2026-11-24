import base64
import hashlib
import hmac
import secrets
import uuid
from datetime import date, time
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator, model_validator
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import RoleChecker
from app.db.session import get_db
from app.models.user import User

router = APIRouter(prefix="/departments", tags=["Department Timetables"])
allow_admin = RoleChecker(["admin"])
allow_student = RoleChecker(["student"])
HASH_ITERATIONS = 310_000
WEEKDAYS = ("", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")


class AccessCodeValidation(BaseModel):
    code: str = Field(min_length=8, max_length=128)


class TimetableEntryPayload(BaseModel):
    entry_type: Literal["class", "exam", "event"]
    title: str = Field(min_length=1, max_length=150)
    course_code: Optional[str] = Field(default=None, max_length=20)
    day_of_week: Optional[int] = Field(default=None, ge=1, le=7)
    schedule_date: Optional[date] = None
    start_time: time
    end_time: time
    location: Optional[str] = Field(default=None, max_length=200)
    notes: Optional[str] = Field(default=None, max_length=2000)

    @field_validator("title", mode="before")
    @classmethod
    def strip_title(cls, value):
        return value.strip() if isinstance(value, str) else value

    @model_validator(mode="after")
    def validate_schedule_kind(self):
        if self.end_time <= self.start_time:
            raise ValueError("End time must be later than start time.")
        if self.entry_type == "class":
            if self.day_of_week is None or self.schedule_date is not None:
                raise ValueError("Weekly classes require a weekday and no date.")
        elif self.schedule_date is None or self.day_of_week is not None:
            raise ValueError("Exams and events require a date and no weekday.")
        return self


def _hash_access_code(code: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", code.encode("utf-8"), salt, HASH_ITERATIONS
    )
    return "pbkdf2_sha256${}${}${}".format(
        HASH_ITERATIONS, salt.hex(), digest.hex()
    )


def _verify_access_code(code: str, stored_hash: str) -> bool:
    try:
        algorithm, iterations, salt_hex, digest_hex = stored_hash.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        expected = bytes.fromhex(digest_hex)
        actual = hashlib.pbkdf2_hmac(
            "sha256", code.encode("utf-8"), bytes.fromhex(salt_hex), int(iterations)
        )
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


def verify_department_access_code(
    db: Session, department_id: uuid.UUID, clear_code: str
) -> bool:
    stored_hash = db.execute(
        text(
            """
            SELECT code_hash
            FROM public.department_access_codes
            WHERE department_id = :department_id
            """
        ),
        {"department_id": department_id},
    ).scalar()
    return bool(stored_hash and _verify_access_code(clear_code, stored_hash))


def _department(row) -> dict:
    return {
        "id": str(row["id"]),
        "slug": row["slug"],
        "name": row["name"],
        "faculty": row["faculty"],
        "program": row["program"],
    }


def _entry(row) -> dict:
    return {
        "id": str(row["id"]),
        "department_id": str(row["department_id"]),
        "entry_type": row["entry_type"],
        "title": row["title"],
        "course_code": row["course_code"],
        "day_of_week": row["day_of_week"],
        "day_name": WEEKDAYS[row["day_of_week"]] if row["day_of_week"] else None,
        "schedule_date": row["schedule_date"].isoformat() if row["schedule_date"] else None,
        "start_time": row["start_time"].strftime("%H:%M"),
        "end_time": row["end_time"].strftime("%H:%M"),
        "location": row["location"],
        "notes": row["notes"],
    }


def _get_department(db: Session, department_id: uuid.UUID):
    row = db.execute(
        text(
            "SELECT id, slug, name, faculty, program FROM public.departments "
            "WHERE id = :department_id"
        ),
        {"department_id": department_id},
    ).mappings().first()
    if row is None:
        raise HTTPException(status_code=404, detail="Department not found.")
    return row


@router.get("")
def list_departments(db: Session = Depends(get_db)):
    rows = db.execute(
        text("SELECT id, slug, name, faculty, program FROM public.departments ORDER BY name")
    ).mappings().all()
    return {"data": [_department(row) for row in rows]}


def _list_entries(db: Session, department_id: uuid.UUID):
    rows = db.execute(
        text(
            """
            SELECT id, department_id, entry_type, title, course_code, day_of_week,
                   schedule_date, start_time, end_time, location, notes
            FROM public.department_timetable_entries
            WHERE department_id = :department_id
            ORDER BY
                CASE WHEN schedule_date IS NULL THEN 0 ELSE 1 END,
                day_of_week NULLS LAST, schedule_date NULLS LAST, start_time
            """
        ),
        {"department_id": department_id},
    ).mappings().all()
    return [_entry(row) for row in rows]


@router.get("/admin")
def get_departments_for_admin(
    db: Session = Depends(get_db),
    _: User = Depends(allow_admin),
):
    rows = db.execute(
        text(
            """
            SELECT d.id, d.slug, d.name, d.faculty, d.program,
                   (a.department_id IS NOT NULL) AS has_access_code
            FROM public.departments d
            LEFT JOIN public.department_access_codes a ON a.department_id = d.id
            ORDER BY d.name
            """
        )
    ).mappings().all()
    return {
        "data": [
            {**_department(row), "has_access_code": row["has_access_code"]}
            for row in rows
        ]
    }


@router.post("/{department_id}/access-code/generate")
def generate_department_access_code(
    department_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(allow_admin),
):
    department = _get_department(db, department_id)
    clear_code = secrets.token_urlsafe(12)
    db.execute(
        text(
            """
            INSERT INTO public.department_access_codes (department_id, code_hash, updated_at)
            VALUES (:department_id, :code_hash, NOW())
            ON CONFLICT (department_id) DO UPDATE
            SET code_hash = EXCLUDED.code_hash, updated_at = NOW()
            """
        ),
        {"department_id": department_id, "code_hash": _hash_access_code(clear_code)},
    )
    db.commit()
    return {"department": _department(department), "code": clear_code}


@router.post("/validate-code")
def validate_department_access_code(
    body: AccessCodeValidation,
    db: Session = Depends(get_db),
    _: User = Depends(allow_student),
):
    code = body.code.strip()
    rows = db.execute(
        text("SELECT department_id, code_hash FROM public.department_access_codes")
    ).mappings().all()
    matched_id = None
    for row in rows:
        if _verify_access_code(code, row["code_hash"]):
            matched_id = str(row["department_id"])
    return {"valid": matched_id is not None, "department_id": matched_id}


@router.get("/timetable")
def get_student_timetable(
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_student),
):
    department_id = db.execute(
        text("SELECT department_id FROM public.users WHERE id = :user_id"),
        {"user_id": current_user.id},
    ).scalar()
    if department_id is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Your account has not been assigned to a department yet.",
        )
    department = _get_department(db, department_id)
    return {"department": _department(department), "entries": _list_entries(db, department_id)}


@router.get("/{department_id}/timetable")
def get_department_timetable_for_admin(
    department_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(allow_admin),
):
    department = _get_department(db, department_id)
    return {"department": _department(department), "entries": _list_entries(db, department_id)}


@router.post("/timetable", status_code=status.HTTP_201_CREATED)
def create_timetable_entry(
    body: TimetableEntryPayload,
    department_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admin),
):
    _get_department(db, department_id)
    row = db.execute(
        text(
            """
            INSERT INTO public.department_timetable_entries (
                department_id, entry_type, title, course_code, day_of_week, schedule_date,
                start_time, end_time, location, notes, created_by
            ) VALUES (
                :department_id, :entry_type, :title, :course_code, :day_of_week, :schedule_date,
                :start_time, :end_time, :location, :notes, :created_by
            )
            RETURNING id, department_id, entry_type, title, course_code, day_of_week,
                      schedule_date, start_time, end_time, location, notes
            """
        ),
        {**body.model_dump(), "department_id": department_id, "created_by": current_user.id},
    ).mappings().one()
    db.commit()
    return {"entry": _entry(row)}


@router.put("/timetable/{entry_id}")
def update_timetable_entry(
    entry_id: uuid.UUID,
    body: TimetableEntryPayload,
    db: Session = Depends(get_db),
    _: User = Depends(allow_admin),
):
    row = db.execute(
        text(
            """
            UPDATE public.department_timetable_entries
            SET entry_type = :entry_type, title = :title, course_code = :course_code,
                day_of_week = :day_of_week, schedule_date = :schedule_date,
                start_time = :start_time, end_time = :end_time, location = :location,
                notes = :notes, updated_at = NOW()
            WHERE id = :entry_id
            RETURNING id, department_id, entry_type, title, course_code, day_of_week,
                      schedule_date, start_time, end_time, location, notes
            """
        ),
        {**body.model_dump(), "entry_id": entry_id},
    ).mappings().first()
    if row is None:
        raise HTTPException(status_code=404, detail="Timetable entry not found.")
    db.commit()
    return {"entry": _entry(row)}


@router.delete("/timetable/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_timetable_entry(
    entry_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(allow_admin),
):
    result = db.execute(
        text("DELETE FROM public.department_timetable_entries WHERE id = :entry_id"),
        {"entry_id": entry_id},
    )
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Timetable entry not found.")
    db.commit()
