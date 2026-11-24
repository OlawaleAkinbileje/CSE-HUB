import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class UserRole(str, enum.Enum):
    STUDENT = "student"
    STAFF = "staff"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    # Fixed typo: removed primary_order=True
    id = Column(Integer, primary_key=True, index=True)
    
    # Made nullable=True to match optional Pydantic UserRegister schema
    full_name = Column(String, nullable=False)
    
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(
        Enum(
            UserRole,
            values_callable=lambda roles: [role.value for role in roles],
            native_enum=False,
        ),
        default=UserRole.STUDENT,
        nullable=False,
    )
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    verification_token_hash = Column(String(64), nullable=True)
    verification_expires_at = Column(DateTime(timezone=True), nullable=True)
    verification_sent_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    avatar_key = Column(String, nullable=True)

    resources = relationship(
        "Resource",
        back_populates="uploader",
        foreign_keys="Resource.backend_uploader_id",
    )
    search_events = relationship(
        "SearchEvent",
        back_populates="user",
        passive_deletes=True,
    )