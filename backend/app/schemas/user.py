from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr

# Auth Credentials Input
class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str
    role: Literal["student"] = "student"
    full_name: Optional[str] = None
    department: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Token Responses
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    full_name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None

# User Response Payload
class UserResponse(BaseModel):
    id: str
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
