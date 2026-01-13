"""
Supabase Authentication endpoints for Vercel
"""
from fastapi import APIRouter, HTTPException, status, Header
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
import os
from datetime import datetime, timedelta
from supabase import create_client, Client

router = APIRouter()

# Supabase Configuration
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
JWT_SECRET = os.environ.get("JWT_SECRET", "development-secret-key")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = int(os.environ.get("JWT_EXPIRATION_HOURS", "24"))
ALLOWED_PUBLIC_ROLES = {
    role.strip()
    for role in os.environ.get("PUBLIC_ROLES", "viewer").split(",")
    if role.strip()
}

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")

# Initialize Supabase client with service role key
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: Optional[str] = "viewer"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: Optional[Dict[str, Any]] = None

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    is_active: bool
    created_at: datetime
    last_login_at: Optional[datetime] = None

def create_jwt_token(user_data: Dict[str, Any]) -> str:
    """Create JWT token with user data"""
    default_tenant = os.environ.get("DEFAULT_TENANT_ID")
    payload = {
        "sub": user_data["id"],
        "email": user_data["email"],
        "role": user_data.get("role", "viewer"),
        "name": user_data.get("name"),
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.utcnow()
    }
    if default_tenant:
        payload["tenant_id"] = default_tenant
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_user_from_database(email: str) -> Optional[Dict[str, Any]]:
    """Get user from our users table using Supabase REST API"""
    try:
        response = supabase.table("users").select("*").eq("email", email).execute()
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        print(f"Error fetching user from database: {e}")
        return None

async def create_user_in_database(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create user in our users table using Supabase REST API"""
    try:
        new_user = {
            "id": user_data["id"],
            "email": user_data["email"],
            "name": user_data.get("name", ""),
            "role": user_data.get("role", "viewer"),
            "is_active": True,
            "created_at": datetime.utcnow().isoformat()
        }
        response = supabase.table("users").insert(new_user).execute()
        if response.data and len(response.data) > 0:
            return response.data[0]
        return new_user
    except Exception as e:
        print(f"Error creating user in database: {e}")
        raise

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """
    Authenticate user with Supabase and return JWT token
    """
    try:
        # Authenticate with Supabase
        auth_response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })

        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        # Get or create user in our database
        user = await get_user_from_database(request.email)
        if not user:
            # Create user in our database
            user_data = {
                "id": auth_response.user.id,
                "email": auth_response.user.email,
                "name": auth_response.user.user_metadata.get("full_name", auth_response.user.email),
                "role": auth_response.user.user_metadata.get("role", "viewer")
            }
            user = await create_user_in_database(user_data)

        # Update last login using Supabase REST API
        supabase.table("users").update({"last_login_at": datetime.utcnow().isoformat()}).eq("email", request.email).execute()

        # Create JWT token
        token = create_jwt_token(user)

        return TokenResponse(
            access_token=token,
            expires_in=JWT_EXPIRATION_HOURS * 3600,
            user={
                "id": user["id"],
                "email": user["email"],
                "name": user["name"],
                "role": user["role"]
            }
        )

    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )

@router.post("/register", response_model=TokenResponse)
async def register(request: RegisterRequest):
    """
    Register new user with Supabase

    Note: User is automatically created in public.users table via database trigger
    when Supabase Auth creates the user in auth.users. We just need to wait and
    fetch the user data from public.users.
    """
    try:
        # Normalize role for public registration
        role = request.role if request.role in ALLOWED_PUBLIC_ROLES else "viewer"

        # Create user in Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {
                    "full_name": request.full_name,
                    "role": role
                }
            }
        })

        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration failed"
            )

        # Wait briefly for trigger to complete (trigger runs on INSERT in auth.users)
        import asyncio
        await asyncio.sleep(0.5)  # 500ms should be enough for trigger execution

        # Fetch user from database (created by trigger)
        user = await get_user_from_database(auth_response.user.email)

        # If trigger hasn't run yet, retry a few times
        retry_count = 0
        max_retries = 3
        while not user and retry_count < max_retries:
            await asyncio.sleep(0.5)
            user = await get_user_from_database(auth_response.user.email)
            retry_count += 1

        # If still no user after retries, fall back to manual creation
        if not user:
            print(f"Warning: Trigger did not create user, creating manually")
            user_data = {
                "id": auth_response.user.id,
                "email": auth_response.user.email,
                "name": request.full_name or auth_response.user.email,
                "role": role
            }
            user = await create_user_in_database(user_data)

        # Create JWT token
        token = create_jwt_token(user)

        return TokenResponse(
            access_token=token,
            expires_in=JWT_EXPIRATION_HOURS * 3600,
            user={
                "id": user["id"],
                "email": user["email"],
                "name": user["name"],
                "role": user["role"]
            }
        )

    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Get current authenticated user from JWT token
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required"
        )

    try:
        # Extract token from "Bearer <token>"
        token = authorization.replace("Bearer ", "")

        # Decode JWT token
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email = payload.get("email")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        # Get user from database
        user = await get_user_from_database(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return UserResponse(**user)

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

@router.post("/logout")
async def logout():
    """
    Logout user (invalidate token on client side)
    """
    return {"message": "Logged out successfully"}

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(authorization: Optional[str] = Header(None)):
    """
    Refresh JWT token
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required"
        )

    try:
        # Extract token from "Bearer <token>"
        token = authorization.replace("Bearer ", "")

        # Decode JWT token (allowing expired tokens for refresh)
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM], options={"verify_exp": False})
        email = payload.get("email")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        # Get user from database
        user = await get_user_from_database(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Create new JWT token
        new_token = create_jwt_token(user)

        return TokenResponse(
            access_token=new_token,
            expires_in=JWT_EXPIRATION_HOURS * 3600,
            user={
                "id": user["id"],
                "email": user["email"],
                "name": user["name"],
                "role": user["role"]
            }
        )

    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
