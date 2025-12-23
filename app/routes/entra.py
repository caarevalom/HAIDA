from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, status
import jwt
import os, msal
from app.core.db import fetch_one

router = APIRouter()

# Entra ID Configuration (opcional - solo si está configurado)
AUTHORITY = os.environ.get("ENTRA_AUTHORITY", "https://login.microsoftonline.com/common")
CLIENT_ID = os.environ.get("ENTRA_CLIENT_ID", "")
CLIENT_SECRET = os.environ.get("ENTRA_CLIENT_SECRET", "")
REDIRECT_URI = os.environ.get("ENTRA_REDIRECT_URI", "http://localhost:8000/entra/callback")
SCOPES = os.environ.get("GRAPH_SCOPES", "User.Read").split()
STATE_TOKEN = os.environ.get("ENTRA_STATE", "local-dev-state")
MAX_SSO_USERS = int(os.environ.get("MAX_SSO_USERS", "3"))
ALLOWED_SSO_EMAILS = {
    email.strip().lower()
    for email in os.environ.get("ALLOWED_SSO_EMAILS", "").split(",")
    if email.strip()
}
JWT_SECRET = os.environ.get("JWT_SECRET", "development-secret-key")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = int(os.environ.get("JWT_EXPIRATION_HOURS", "24"))
DASHBOARD_PATH = os.environ.get("DASHBOARD_PATH", "/dashboard")
COPILOT_URL = os.environ.get("COPILOT_URL", "https://m365.cloud.microsoft/chat/?auth=2&origindomain=Offic")

# Verificar si Entra está configurado
ENTRA_CONFIGURED = bool(CLIENT_ID and CLIENT_SECRET)

def _get_or_create_user(email: str, name: str):
    """
    Reglas de validación para Microsoft SSO:
    - Debe estar activo
    - Opcional: debe estar en ALLOWED_SSO_EMAILS si se ha configurado la variable
    - No permitimos más de MAX_SSO_USERS usuarios en total (se puede ampliar por env)
    - Si no existe, se crea el registro en tabla users con datos básicos
    """
    normalized = email.lower()
    if ALLOWED_SSO_EMAILS and normalized not in ALLOWED_SSO_EMAILS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email fuera de la lista blanca de Microsoft SSO",
        )

    user = fetch_one(
        "SELECT id, email, name, role, is_active FROM users WHERE lower(email) = %s",
        (normalized,),
    )
    if not user:
        total = fetch_one("SELECT COUNT(*) AS total FROM users") or {"total": 0}
        if total["total"] >= MAX_SSO_USERS:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Número de usuarios permitidos excedido para SSO",
            )
        # Crea usuario con rol viewer por defecto
        user = fetch_one(
            """
            INSERT INTO users (email, name, role, is_active, created_at)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, email, name, role, is_active
            """,
            (normalized, name or normalized, "viewer", True, datetime.utcnow()),
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario desactivado",
        )

    return user

def _issue_local_token(user: dict) -> str:
    """Genera un JWT interno para sesiones locales tras validar Microsoft."""
    payload = {
        "sub": str(user["id"]),
        "email": user["email"],
        "role": user.get("role", "viewer"),
        "name": user.get("name", ""),
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.utcnow(),
        "provider": "microsoft",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

@router.get("/login")
def login():
    if not ENTRA_CONFIGURED:
        raise HTTPException(status_code=501, detail="Microsoft Entra ID not configured. Set ENTRA_CLIENT_ID and ENTRA_CLIENT_SECRET in .env")

    app = msal.ConfidentialClientApplication(CLIENT_ID, authority=AUTHORITY, client_credential=CLIENT_SECRET)
    auth_url = app.get_authorization_request_url(SCOPES, redirect_uri=REDIRECT_URI, state=STATE_TOKEN)
    return {
        "auth_url": auth_url,
        "redirect_uri": REDIRECT_URI,
        "scopes": SCOPES,
        "state": STATE_TOKEN,
        "local_redirect": "localhost" in REDIRECT_URI,
    }

@router.get("/callback")
def callback(code: str, state: str):
    if not ENTRA_CONFIGURED:
        raise HTTPException(status_code=501, detail="Microsoft Entra ID not configured")

    if state != STATE_TOKEN:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Estado inválido en callback de Microsoft")

    app = msal.ConfidentialClientApplication(CLIENT_ID, authority=AUTHORITY, client_credential=CLIENT_SECRET)
    result = app.acquire_token_by_authorization_code(code, scopes=SCOPES, redirect_uri=REDIRECT_URI)

    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error de Microsoft: {result.get('error_description', result['error'])}",
        )

    claims = result.get("id_token_claims") or {}
    email = (claims.get("preferred_username") or claims.get("email") or "").lower()
    name = claims.get("name") or email
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Microsoft no devolvió un email en el id_token",
        )

    user = _get_or_create_user(email, name)
    local_token = _issue_local_token(user)

    return {
        "token": local_token,
        "token_type": "bearer",
        "expires_in": JWT_EXPIRATION_HOURS * 3600,
        "redirect_to": DASHBOARD_PATH,
        "copilot_url": COPILOT_URL,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user.get("name", name),
            "role": user.get("role", "viewer"),
        },
        "microsoft": {
            "expires_in": result.get("expires_in"),
            "token_type": result.get("token_type"),
            "scope": result.get("scope"),
            "redirect_uri": REDIRECT_URI,
        },
    }
