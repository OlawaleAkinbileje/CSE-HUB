from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.user import Token, UserLogin, UserRegister, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

INSTITUTIONAL_EMAIL_DOMAINS = {"oauife.edu.ng", "student.oauife.ng"}
INSTITUTIONAL_EMAIL_ERROR = (
    "Registration requires an OAU-issued email address. "
    "Students should use @student.oauife.ng; staff should use @oauife.edu.ng."
)
ACCOUNT_EXISTS_ERROR = (
    "An account with this email address or username already exists. "
    "Please sign in or use a different email address or matric number."
)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    email_domain = str(user_in.email).rsplit("@", 1)[-1].lower()
    if email_domain not in INSTITUTIONAL_EMAIL_DOMAINS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=INSTITUTIONAL_EMAIL_ERROR,
        )

    existing_user = db.query(User).filter(
        (User.email == user_in.email) | (User.username == user_in.username)
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ACCOUNT_EXISTS_ERROR,
        )

    user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        username=user_in.username,
        hashed_password=get_password_hash(user_in.password),
        role=UserRole.STUDENT,
        is_active=True,
    )
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
