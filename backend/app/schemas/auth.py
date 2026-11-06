from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    full_name: str          # 👈 Required (no Optional, no default value)
    email: EmailStr
    username: str
    password: str
    role: str = "student"