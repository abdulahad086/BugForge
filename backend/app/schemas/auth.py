import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from app.models.enums import UserRole


class RegisterRequest(BaseModel):
    organization_name: str = Field(..., min_length=2, max_length=255)
    organization_slug: str = Field(..., min_length=2, max_length=255)
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    role: UserRole
    organization_id: uuid.UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
