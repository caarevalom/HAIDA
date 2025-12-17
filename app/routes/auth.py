"""
Local Authentication endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
import jwt
import os
from datetime import datetime, timedelta

router = APIRouter()

# JWT Configuration
JWT_SECRET = os.environ.get("JWT_SECRET", "development-secret-key")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = int(os.environ.get("JWT_EXPIRATION_HOURS", "24"))

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """
    Local JWT authentication
    TODO: Validate against Supabase auth.users
    """
    # TODO: Implement actual authentication
    # For now, return a JWT token for development

    payload = {
        "sub": request.email,
        "email": request.email,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.utcnow()
    }

    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return TokenResponse(
        access_token=token,
        expires_in=JWT_EXPIRATION_HOURS * 3600
    )

@router.post("/register", response_model=TokenResponse)
async def register(request: RegisterRequest):
    """
    User registration
    TODO: Create user in Supabase auth.users and user_profiles
    """
    # TODO: Implement actual registration
    # For now, return a JWT token for development

    payload = {
        "sub": request.email,
        "email": request.email,
        "name": request.full_name,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.utcnow()
    }

    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return TokenResponse(
        access_token=token,
        expires_in=JWT_EXPIRATION_HOURS * 3600
    )

@router.get("/me")
async def get_current_user():
    """
    Get current authenticated user
    TODO: Extract from JWT token and fetch from DB
    """
    # TODO: Implement actual user fetching
    return {
        "id": "00000000-0000-0000-0000-000000000000",
        "email": "user@example.com",
        "full_name": "Test User",
        "role": "viewer"
    }

@router.post("/logout")
async def logout():
    """
    Logout user (invalidate token on client side)
    """
    return {"message": "Logged out successfully"}
