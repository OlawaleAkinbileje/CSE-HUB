from datetime import datetime
from typing import Literal, Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field

# Auth Credentials Input
class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str
    role: Literal["student"] = "student"
    full_name: Optional[str] = None
    department_id: UUID
    access_code: str = Field(min_length=8, max_length=128)

class UserProfileUpdate(BaseModel):
    email: EmailStr
    department_id: UUID
    access_code: Optional[str] = Field(default=None, min_length=8, max_length=128)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class EmailAddressRequest(BaseModel):
    email: EmailStr

class EmailVerificationRequest(BaseModel):
    token: str = Field(min_length=32, max_length=256)

# Token Responses
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    id: Optional[str] = None
    full_name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    is_verified: Optional[bool] = None
    department_id: Optional[str] = None
    avatar_url: Optional[str] = None

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None

# User Response Payload
class UserResponse(BaseModel):
    id: str
    email: EmailStr
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime
    is_verified: bool = False
    department_id: Optional[str] = None
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True

class RegistrationResponse(UserResponse):
    verification_email_sent: bool
    message: str

class ProfileUpdateResponse(UserResponse):
    verification_email_sent: Optional[bool] = None
    message: str
