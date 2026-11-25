import hashlib
import logging
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.api.v1.departments import verify_department_access_code
from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.user import (
    EmailAddressRequest,
    EmailVerificationRequest,
    ProfileUpdateResponse,
    RegistrationResponse,
    Token,
    UserLogin,
    UserProfileUpdate,
    UserRegister,
    UserResponse,
)
from app.services.admin_settings import load_admin_settings, parse_approved_domains
from app.services.email_verification import EmailDeliveryError, send_verification_email
from app.services.storage import read_stored_bytes, save_uploaded_bytes

router = APIRouter(prefix="/auth", tags=["Authentication"])
MAX_AVATAR_SIZE = 5 * 1024 * 1024
logger = logging.getLogger(__name__)

def _issue_verification_email(db: Session, user: User) -> None:
    token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    db.execute(
        text(
            """
            UPDATE public.users
            SET verification_token_hash = :token_hash,
                verification_expires_at = :expires_at,
                verification_sent_at = NOW()
            WHERE id = :user_id
            """
        ),
        {
            "token_hash": token_hash,
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=24),
            "user_id": user.id,
        },
    )
    db.commit()
    try:
        send_verification_email(user.email, user.full_name, token)
    except EmailDeliveryError:
        db.execute(
            text("UPDATE public.users SET verification_sent_at = NULL WHERE id = :user_id"),
            {"user_id": user.id},
        )
        db.commit()
        raise


@router.post(
    "/register",
    response_model=RegistrationResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    settings = load_admin_settings(db)
    if settings["generalSettings"]["maintenanceMode"]:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="CSE Hub is temporarily unavailable while maintenance is in progress.",
        )
    if not settings["userAccess"]["allowSelfRegistration"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student self-registration is currently disabled.",
        )
    email = str(user_in.email).strip().lower()
    email_domain = email.rsplit("@", 1)[-1]
    approved_domains = parse_approved_domains(settings["userAccess"]["approvedDomains"])
    if email_domain not in approved_domains:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Use an email address from an approved institutional domain: "
                f"{', '.join(sorted(approved_domains))}."
            ),
        )
    department_exists = db.execute(
        text("SELECT 1 FROM public.departments WHERE id = :department_id"),
        {"department_id": user_in.department_id},
    ).first()
    if not department_exists:
        raise HTTPException(status_code=422, detail="The selected department does not exist.")
    if not verify_department_access_code(db, user_in.department_id, user_in.access_code.strip()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The department access code is invalid.",
        )

    if db.query(User.id).filter(User.email == email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This email address is already registered. Sign in or request an email verification link.",
        )
    if db.query(User.id).filter(User.username == user_in.username).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This matric number or username is already in use. Check it or enter a different one.",
        )

    user = User(
        full_name=user_in.full_name,
        email=email,
        username=user_in.username,
        hashed_password=get_password_hash(user_in.password),
        role=UserRole.STUDENT,
        is_active=True,
    )
    db.add(user)
    db.flush()
    db.execute(
        text("UPDATE public.users SET department_id = :department_id WHERE id = :user_id"),
        {"department_id": user_in.department_id, "user_id": user.id},
    )
    db.commit()

    verification_email_sent = True
    try:
        _issue_verification_email(db, user)
    except EmailDeliveryError as exc:
        logger.error(
            "Account %s was created but its verification email could not be sent: %s",
            user.id,
            exc,
        )
        verification_email_sent = False

    response = RegistrationResponse(
        id=str(user.id),
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        role=user.role.value if isinstance(user.role, UserRole) else str(user.role),
        is_active=user.is_active,
        created_at=user.created_at,
        department_id=str(user_in.department_id),
        is_verified=user.is_verified,
        verification_email_sent=verification_email_sent,
        message=(
            "Your account is registered. Check your inbox for a verification link before signing in."
            if verification_email_sent
            else (
                "Your account is registered, but we could not send the verification email. "
                "Request a fresh link or contact support."
            )
        ),
    )
    return response


@router.post("/resend-verification", status_code=status.HTTP_202_ACCEPTED)
def resend_verification_email(
    request: EmailAddressRequest,
    db: Session = Depends(get_db),
):
    email = str(request.email).strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if user is None or user.is_verified or not user.is_active:
        return {
            "message": "If this address belongs to an unverified account, a new verification link will be sent shortly."
        }

    can_send = db.execute(
        text(
            """
            SELECT verification_sent_at IS NULL
                   OR verification_sent_at < NOW() - INTERVAL '1 minute'
            FROM public.users WHERE id = :user_id
            """
        ),
        {"user_id": user.id},
    ).scalar_one()
    if can_send:
        try:
            _issue_verification_email(db, user)
        except EmailDeliveryError as exc:
            logger.error("Could not resend verification email for account %s.", user.id)
            raise HTTPException(status_code=503, detail=str(exc)) from exc
    return {
        "message": "If this address belongs to an unverified account, a new verification link will be sent shortly."
    }


@router.post("/verify-email")
def verify_email(
    request: EmailVerificationRequest,
    db: Session = Depends(get_db),
):
    token_hash = hashlib.sha256(request.token.encode("utf-8")).hexdigest()
    user_id = db.execute(
        text(
            """
            UPDATE public.users
            SET is_verified = TRUE,
                verification_token_hash = NULL,
                verification_expires_at = NULL,
                verification_sent_at = NULL
            WHERE verification_token_hash = :token_hash
              AND verification_expires_at > NOW()
              AND is_active = TRUE
            RETURNING id
            """
        ),
        {"token_hash": token_hash},
    ).scalar()
    if user_id is None:
        raise HTTPException(
            status_code=400,
            detail="This link has expired or was already used. Request a fresh verification link below.",
        )
    db.commit()
    return {"verified": True, "message": "Email verified successfully. You can now sign in."}


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    email = str(credentials.email).strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="That email and password combination does not match our records.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive account")
    if not user.is_verified:
        raise HTTPException(
            status_code=403,
            detail="Verify your email address before signing in. You can request a new verification link.",
        )

    role = user.role.value if isinstance(user.role, UserRole) else str(user.role)
    access_token = create_access_token(subject=user.id, role=role)
    profile = db.execute(
        text("SELECT avatar_key, department_id FROM public.users WHERE id = :user_id"),
        {"user_id": user.id},
    ).mappings().one()
    return {
        "id": str(user.id),
        "access_token": access_token,
        "token_type": "bearer",
        "role": role,
        "full_name": user.full_name or "",
        "username": user.username,
        "email": user.email,
        "is_verified": user.is_verified,
        "department_id": str(profile["department_id"]) if profile["department_id"] else None,
        "avatar_url": f"/api/v1/auth/users/{user.id}/avatar" if profile["avatar_key"] else None,
    }


@router.get("/me", response_model=UserResponse)
def get_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = db.execute(
        text("SELECT avatar_key, department_id FROM public.users WHERE id = :user_id"),
        {"user_id": current_user.id},
    ).mappings().one()
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "role": _user_role(current_user),
        "is_active": current_user.is_active,
        "created_at": current_user.created_at,
        "is_verified": current_user.is_verified,
        "department_id": str(profile["department_id"]) if profile["department_id"] else None,
        "avatar_url": f"/api/v1/auth/users/{current_user.id}/avatar" if profile["avatar_key"] else None,
    }


@router.patch("/me/profile", response_model=ProfileUpdateResponse)
def update_my_profile(
    profile: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    settings = load_admin_settings(db)
    email = str(profile.email).strip().lower()
    email_domain = email.rsplit("@", 1)[-1]
    approved_domains = parse_approved_domains(settings["userAccess"]["approvedDomains"])
    if email_domain not in approved_domains:
        raise HTTPException(
            status_code=400,
            detail=(
                "Use an email address from an approved institutional domain: "
                f"{', '.join(sorted(approved_domains))}."
            ),
        )
    if not db.execute(
        text("SELECT 1 FROM public.departments WHERE id = :department_id"),
        {"department_id": profile.department_id},
    ).first():
        raise HTTPException(status_code=422, detail="The selected department does not exist.")

    existing = db.query(User.id).filter(
        User.email == email,
        User.id != current_user.id,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="That email address is already in use.")

    current_department_id = db.execute(
        text("SELECT department_id FROM public.users WHERE id = :user_id"),
        {"user_id": current_user.id},
    ).scalar()
    if (
        _user_role(current_user) == "student"
        and current_department_id != profile.department_id
    ):
        if not profile.access_code or not verify_department_access_code(
            db, profile.department_id, profile.access_code.strip()
        ):
            raise HTTPException(status_code=400, detail="The department access code is invalid.")

    email_changed = email != str(current_user.email).lower()
    if email_changed:
        current_user.email = email
        current_user.is_verified = False
        current_user.verification_token_hash = None
        current_user.verification_expires_at = None
        current_user.verification_sent_at = None
    db.execute(
        text("UPDATE public.users SET department_id = :department_id WHERE id = :user_id"),
        {"department_id": profile.department_id, "user_id": current_user.id},
    )
    db.commit()
    db.refresh(current_user)

    verification_email_sent = None
    message = "Profile updated."
    delivery_error = ""
    if email_changed:
        try:
            _issue_verification_email(db, current_user)
            verification_email_sent = True
            message = "Profile updated. Verify your new email address before your next sign-in."
        except EmailDeliveryError as exc:
            logger.error("Email was changed for account %s but verification could not be sent.", current_user.id)
            verification_email_sent = False
            delivery_error = str(exc)
            message = f"Email updated, but verification could not be sent: {delivery_error}"

    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "role": _user_role(current_user),
        "is_active": current_user.is_active,
        "created_at": current_user.created_at,
        "is_verified": current_user.is_verified,
        "department_id": str(profile.department_id),
        "avatar_url": (
            f"/api/v1/auth/users/{current_user.id}/avatar"
            if current_user.avatar_key
            else None
        ),
        "verification_email_sent": verification_email_sent,
        "message": message,
    }


def _user_role(user: User) -> str:
    return user.role.value if isinstance(user.role, UserRole) else str(user.role)


def _avatar_media_type(data: bytes, filename: str) -> str:
    suffix = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if data.startswith(b"\x89PNG\r\n\x1a\n") and suffix == "png":
        return "image/png"
    if data.startswith(b"\xff\xd8\xff") and suffix in {"jpg", "jpeg"}:
        return "image/jpeg"
    if len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP" and suffix == "webp":
        return "image/webp"
    raise HTTPException(
        status_code=415,
        detail="Upload a valid PNG, JPEG, or WebP profile picture.",
    )


@router.post("/me/avatar")
def upload_profile_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        image_bytes = file.file.read(MAX_AVATAR_SIZE + 1)
        if not image_bytes:
            raise HTTPException(status_code=422, detail="The selected image is empty.")
        if len(image_bytes) > MAX_AVATAR_SIZE:
            raise HTTPException(status_code=413, detail="Profile pictures must be 5 MB or smaller.")
        _avatar_media_type(image_bytes, file.filename or "")
        storage_key = f"avatars/{current_user.id}/profile-picture"
        save_uploaded_bytes(image_bytes, storage_key)
        db.execute(
            text("UPDATE public.users SET avatar_key = :avatar_key WHERE id = :user_id"),
            {"avatar_key": storage_key, "user_id": current_user.id},
        )
        db.commit()
    except HTTPException:
        db.rollback()
        raise
    finally:
        file.file.close()

    return {
        "avatar_url": f"/api/v1/auth/users/{current_user.id}/avatar",
    }


@router.get("/users/{user_id}/avatar")
def get_profile_avatar(
    user_id: int,
    db: Session = Depends(get_db),
):
    profile = db.execute(
        text("SELECT avatar_key FROM public.users WHERE id = :user_id"),
        {"user_id": user_id},
    ).mappings().first()
    if profile is None or not profile["avatar_key"]:
        raise HTTPException(status_code=404, detail="Profile picture not found.")
    image_bytes = read_stored_bytes(profile["avatar_key"])
    media_type = (
        "image/png" if image_bytes.startswith(b"\x89PNG\r\n\x1a\n")
        else "image/jpeg" if image_bytes.startswith(b"\xff\xd8\xff")
        else "image/webp"
    )
    return Response(
        content=image_bytes,
        media_type=media_type,
        headers={"Cache-Control": "public, max-age=300"},
    )
