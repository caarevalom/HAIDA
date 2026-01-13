"""
Schemas Pydantic para User
Validación de datos en requests/responses
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserRole

class UserBase(BaseModel):
    """Schema base de usuario"""
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.VIEWER

class UserCreate(UserBase):
    """Schema para crear usuario"""
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    """Schema para actualizar usuario"""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    password: Optional[str] = Field(None, min_length=8)

class UserResponse(UserBase):
    """Schema de respuesta de usuario"""
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Pydantic v2

class UserLogin(BaseModel):
    """Schema para login"""
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    """Schema de respuesta de autenticación"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
