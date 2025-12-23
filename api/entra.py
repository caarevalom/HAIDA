"""
Microsoft Entra ID (Azure AD) Authentication for HAIDA
OAuth2 flow with Supabase integration
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, Dict, Any
import jwt
import os
import msal
from datetime import datetime, timedelta
from supabase import create_client, Client

router = APIRouter()

# Supabase Configuration
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Entra ID Configuration
ENTRA_AUTHORITY = os.environ.get("ENTRA_AUTHORITY", "https://login.microsoftonline.com/common")
ENTRA_CLIENT_ID = os.environ.get("ENTRA_CLIENT_ID", "")
ENTRA_CLIENT_SECRET = os.environ.get("ENTRA_CLIENT_SECRET", "")
ENTRA_REDIRECT_URI = os.environ.get("ENTRA_REDIRECT_URI", "https://haida-frontend.vercel.app/auth/callback")
ENTRA_SCOPES = ["User.Read", "email", "profile", "openid"]

# JWT Configuration
JWT_SECRET = os.environ.get("JWT_SECRET", "development-secret-key")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = int(os.environ.get("JWT_EXPIRATION_HOURS", "24"))

# Verificar si Entra está configurado
ENTRA_CONFIGURED = bool(ENTRA_CLIENT_ID and ENTRA_CLIENT_SECRET)

class EntraTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: Dict[str, Any]
    microsoft_token: Optional[str] = None
    microsoft_refresh_token: Optional[str] = None

async def get_or_create_user(email: str, name: str, microsoft_id: str) -> Dict[str, Any]:
    """
    Get or create user in Supabase using REST API
    Links Microsoft account with HAIDA user
    """
    try:
        # Check if user exists
        response = supabase.table("users").select("*").eq("email", email.lower()).execute()

        if response.data and len(response.data) > 0:
            user = response.data[0]
            # Update last login and Microsoft ID if not set
            update_data = {"last_login_at": datetime.utcnow().isoformat()}
            if not user.get("microsoft_id"):
                update_data["microsoft_id"] = microsoft_id

            supabase.table("users").update(update_data).eq("email", email.lower()).execute()
            return user

        # Create new user
        new_user = {
            "email": email.lower(),
            "name": name or email,
            "role": "viewer",  # Default role for Microsoft SSO users
            "is_active": True,
            "created_at": datetime.utcnow().isoformat(),
            "last_login_at": datetime.utcnow().isoformat(),
            "microsoft_id": microsoft_id,
            "auth_provider": "microsoft"
        }

        create_response = supabase.table("users").insert(new_user).execute()
        if create_response.data and len(create_response.data) > 0:
            return create_response.data[0]

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )

    except Exception as e:
        print(f"Error in get_or_create_user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

async def store_microsoft_tokens(user_id: str, access_token: str, refresh_token: Optional[str] = None):
    """
    Store Microsoft tokens in Supabase for future API calls
    """
    try:
        token_data = {
            "user_id": user_id,
            "provider": "microsoft",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow() + timedelta(hours=1)).isoformat()  # Microsoft tokens typically expire in 1 hour
        }

        # Check if token exists for this user
        existing = supabase.table("oauth_tokens").select("*").eq("user_id", user_id).eq("provider", "microsoft").execute()

        if existing.data and len(existing.data) > 0:
            # Update existing token
            supabase.table("oauth_tokens").update(token_data).eq("user_id", user_id).eq("provider", "microsoft").execute()
        else:
            # Insert new token
            supabase.table("oauth_tokens").insert(token_data).execute()

    except Exception as e:
        print(f"Warning: Failed to store Microsoft tokens: {e}")
        # Don't fail authentication if token storage fails
        pass

def create_jwt_token(user_data: Dict[str, Any], microsoft_token: Optional[str] = None) -> str:
    """Create JWT token with user data and Microsoft token reference"""
    payload = {
        "sub": user_data["id"],
        "email": user_data["email"],
        "role": user_data.get("role", "viewer"),
        "name": user_data.get("name"),
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.utcnow(),
        "provider": "microsoft",
        "has_microsoft_token": microsoft_token is not None
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

@router.get("/login")
async def entra_login():
    """
    Initiate Microsoft Entra ID OAuth2 login flow
    Returns auth URL for frontend to redirect to
    """
    if not ENTRA_CONFIGURED:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Microsoft Entra ID not configured. Set ENTRA_CLIENT_ID and ENTRA_CLIENT_SECRET environment variables."
        )

    try:
        # Create MSAL Confidential Client Application
        app = msal.ConfidentialClientApplication(
            ENTRA_CLIENT_ID,
            authority=ENTRA_AUTHORITY,
            client_credential=ENTRA_CLIENT_SECRET
        )

        # Generate authorization URL
        auth_url = app.get_authorization_request_url(
            scopes=ENTRA_SCOPES,
            redirect_uri=ENTRA_REDIRECT_URI
        )

        return {
            "auth_url": auth_url,
            "redirect_uri": ENTRA_REDIRECT_URI,
            "scopes": ENTRA_SCOPES,
            "configured": True
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate Microsoft login: {str(e)}"
        )

@router.post("/callback")
async def entra_callback(code: str):
    """
    Handle Microsoft Entra ID OAuth2 callback
    Exchange authorization code for tokens
    """
    if not ENTRA_CONFIGURED:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Microsoft Entra ID not configured"
        )

    try:
        # Create MSAL client
        app = msal.ConfidentialClientApplication(
            ENTRA_CLIENT_ID,
            authority=ENTRA_AUTHORITY,
            client_credential=ENTRA_CLIENT_SECRET
        )

        # Acquire token by authorization code
        result = app.acquire_token_by_authorization_code(
            code,
            scopes=ENTRA_SCOPES,
            redirect_uri=ENTRA_REDIRECT_URI
        )

        if "error" in result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Microsoft authentication failed: {result.get('error_description', result['error'])}"
            )

        # Extract user information from ID token claims
        claims = result.get("id_token_claims", {})
        email = (claims.get("preferred_username") or claims.get("email") or "").lower()
        name = claims.get("name") or email
        microsoft_id = claims.get("oid") or claims.get("sub")  # Microsoft user ID

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Microsoft did not return an email address"
            )

        # Get or create user in database
        user = await get_or_create_user(email, name, microsoft_id)

        # Store Microsoft tokens for future API calls
        microsoft_access_token = result.get("access_token")
        microsoft_refresh_token = result.get("refresh_token")

        if microsoft_access_token:
            await store_microsoft_tokens(
                user["id"],
                microsoft_access_token,
                microsoft_refresh_token
            )

        # Create HAIDA JWT token
        haida_token = create_jwt_token(user, microsoft_access_token)

        return EntraTokenResponse(
            access_token=haida_token,
            expires_in=JWT_EXPIRATION_HOURS * 3600,
            user={
                "id": user["id"],
                "email": user["email"],
                "name": user["name"],
                "role": user.get("role", "viewer"),
                "auth_provider": "microsoft"
            },
            microsoft_token=microsoft_access_token,
            microsoft_refresh_token=microsoft_refresh_token
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Callback error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}"
        )

@router.get("/status")
async def entra_status():
    """Check if Microsoft Entra ID is configured"""
    return {
        "configured": ENTRA_CONFIGURED,
        "client_id_set": bool(ENTRA_CLIENT_ID),
        "client_secret_set": bool(ENTRA_CLIENT_SECRET),
        "redirect_uri": ENTRA_REDIRECT_URI if ENTRA_CONFIGURED else None,
        "authority": ENTRA_AUTHORITY if ENTRA_CONFIGURED else None
    }
