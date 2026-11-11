import json
import re
import secrets
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.config import settings as supabase_settings
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserRegister, UserLogin, OAuthLogin, Token, UserResponse
from app.core.security import verify_password, get_password_hash, create_access_token
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # 1. Check if user already exists (by email or username)
    existing_user = db.query(User).filter(
        (User.email == user_in.email) | (User.username == user_in.username)
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or username already exists.",
        )

    # 2. Hash password and instantiate User model with full_name
    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        full_name=user_in.full_name,  # Required by PostgreSQL schema
        email=user_in.email,
        username=user_in.username,
        hashed_password=hashed_pwd,
        role=UserRole.STUDENT,
        is_active=True
    )

    # 3. Save to database
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive account")

    access_token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "full_name": user.full_name or "",
        "username": user.username,
        "email": user.email,
    }

@router.post("/oauth", response_model=Token)
def oauth_login(credentials: OAuthLogin, db: Session = Depends(get_db)):
    if not supabase_settings.SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OAuth sign-in is not configured on the server.",
        )

    request = Request(
        f"{supabase_settings.SUPABASE_URL.rstrip('/')}/auth/v1/user",
        headers={
            "apikey": supabase_settings.SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {credentials.access_token}",
        },
    )
    try:
        with urlopen(request, timeout=10) as response:
            identity = json.loads(response.read())
    except HTTPError as exc:
        if exc.code >= 500:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="The identity provider could not verify the OAuth session.",
            ) from exc
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The OAuth session could not be verified.",
        ) from exc
    except URLError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The identity provider could not be reached.",
        ) from exc
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The identity provider returned an invalid response.",
        ) from exc

    if not isinstance(identity, dict):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The identity provider returned an invalid response.",
        )

    email = identity.get("email")
    if not isinstance(email, str) or not email.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The identity provider did not return an email address.",
        )
    if not identity.get("email_confirmed_at") and not identity.get("confirmed_at"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Verify your email address with the identity provider before continuing.",
        )

    email = email.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == email).first()
    if user is None:
        metadata = identity.get("user_metadata")
        metadata = metadata if isinstance(metadata, dict) else {}
        suggested_username = (
            metadata.get("preferred_username")
            or metadata.get("user_name")
            or email.split("@", 1)[0]
        )
        base_username = re.sub(r"[^a-zA-Z0-9._-]", "", str(suggested_username)).strip("._-")
        base_username = base_username or "user"
        username = base_username
        suffix = 1
        while db.query(User.id).filter(User.username == username).first():
            suffix += 1
            username = f"{base_username}{suffix}"

        full_name = metadata.get("full_name") or metadata.get("name") or username
        user = User(
            full_name=str(full_name).strip() or username,
            email=email,
            username=username,
            hashed_password=get_password_hash(secrets.token_urlsafe(32)),
            role=UserRole.STUDENT,
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive account")

    role = user.role.value if isinstance(user.role, UserRole) else str(user.role)
    access_token = create_access_token(subject=user.id, role=role)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": role,
        "full_name": user.full_name or "",
        "username": user.username,
        "email": user.email,
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
