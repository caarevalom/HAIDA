from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional
import base64
import jwt
import os, msal
from app.core.db import fetch_one


def _clean_env(name: str, default: str = "") -> str:
    value = os.environ.get(name, default)
    if value is None:
        return ""
    return value.strip()

router = APIRouter()

# Entra ID Configuration (opcional - solo si está configurado)
AUTHORITY = _clean_env("ENTRA_AUTHORITY", "https://login.microsoftonline.com/common")
CLIENT_ID = _clean_env("ENTRA_CLIENT_ID", "")
CLIENT_SECRET = _clean_env("ENTRA_CLIENT_SECRET", "")
CLIENT_CERT_THUMBPRINT = _clean_env("ENTRA_CLIENT_CERT_THUMBPRINT", "")
CLIENT_CERT_PRIVATE_KEY_B64 = _clean_env("ENTRA_CLIENT_CERT_PRIVATE_KEY_B64", "")
CLIENT_CERT_PRIVATE_KEY = _clean_env("ENTRA_CLIENT_CERT_PRIVATE_KEY", "")
REDIRECT_URI = _clean_env("ENTRA_REDIRECT_URI", "https://haida.stayarta.com/auth")
_RAW_SCOPES = _clean_env("GRAPH_SCOPES", "User.Read").split()
_MSAL_RESERVED_SCOPES = {"openid", "profile", "offline_access"}
SCOPES = [scope for scope in _RAW_SCOPES if scope not in _MSAL_RESERVED_SCOPES]
if not SCOPES:
    SCOPES = ["User.Read"]
STATE_TOKEN = _clean_env("ENTRA_STATE", "local-dev-state")
MAX_SSO_USERS = int(_clean_env("MAX_SSO_USERS", "3") or "3")
ALLOWED_SSO_EMAILS = {
    email.strip().lower()
    for email in _clean_env("ALLOWED_SSO_EMAILS", "").split(",")
    if email.strip()
}
JWT_SECRET = _clean_env("JWT_SECRET", "development-secret-key")
JWT_ALGORITHM = "HS256"
def _get_jwt_expiration_delta() -> timedelta:
    minutes = os.environ.get("JWT_EXPIRATION_MINUTES")
    if minutes:
        try:
            return timedelta(minutes=int(minutes))
        except ValueError:
            pass
    hours = os.environ.get("JWT_EXPIRATION_HOURS")
    if hours:
        try:
            return timedelta(hours=int(hours))
        except ValueError:
            pass
    return timedelta(hours=24)

JWT_EXPIRATION = _get_jwt_expiration_delta()
JWT_EXPIRATION_SECONDS = int(JWT_EXPIRATION.total_seconds())
DASHBOARD_PATH = _clean_env("DASHBOARD_PATH", "/dashboard")
COPILOT_URL = _clean_env("COPILOT_URL", "https://m365.cloud.microsoft/chat/?auth=2&origindomain=Offic")

# Verificar si Entra está configurado
ENTRA_CONFIGURED = bool(
    CLIENT_ID
    and (
        CLIENT_SECRET
        or (CLIENT_CERT_THUMBPRINT and (CLIENT_CERT_PRIVATE_KEY_B64 or CLIENT_CERT_PRIVATE_KEY))
    )
)

def _get_client_credential():
    if CLIENT_CERT_THUMBPRINT and (CLIENT_CERT_PRIVATE_KEY_B64 or CLIENT_CERT_PRIVATE_KEY):
        private_key = CLIENT_CERT_PRIVATE_KEY
        if CLIENT_CERT_PRIVATE_KEY_B64:
            try:
                private_key = base64.b64decode(CLIENT_CERT_PRIVATE_KEY_B64).decode("utf-8")
            except Exception as exc:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="ENTRA_CLIENT_CERT_PRIVATE_KEY_B64 no es valido",
                ) from exc
        return {"private_key": private_key, "thumbprint": CLIENT_CERT_THUMBPRINT}
    if CLIENT_SECRET:
        return CLIENT_SECRET
    return None

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
        "exp": datetime.utcnow() + JWT_EXPIRATION,
        "iat": datetime.utcnow(),
        "provider": "microsoft",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

@router.get("/login")
def login():
    if not ENTRA_CONFIGURED:
        raise HTTPException(
            status_code=501,
            detail="Microsoft Entra ID not configured. Set ENTRA_CLIENT_ID and a client secret or certificate in .env",
        )

    client_credential = _get_client_credential()
    if not client_credential:
        raise HTTPException(
            status_code=501,
            detail="Microsoft Entra ID not configured. Missing client secret or certificate.",
        )

    app = msal.ConfidentialClientApplication(CLIENT_ID, authority=AUTHORITY, client_credential=client_credential)
    auth_url = app.get_authorization_request_url(SCOPES, redirect_uri=REDIRECT_URI, state=STATE_TOKEN)
    return {
        "auth_url": auth_url,
        "redirect_uri": REDIRECT_URI,
        "scopes": SCOPES,
        "state": STATE_TOKEN,
        "local_redirect": "localhost" in REDIRECT_URI,
    }

class EntraCallbackRequest(BaseModel):
    code: str
    state: Optional[str] = None

def _validate_state(state: Optional[str]):
    if state is None:
        return
    if state != STATE_TOKEN:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Estado inválido en callback de Microsoft")

async def _handle_callback(code: str, state: Optional[str]):
    if not ENTRA_CONFIGURED:
        raise HTTPException(status_code=501, detail="Microsoft Entra ID not configured")

    _validate_state(state)

    client_credential = _get_client_credential()
    if not client_credential:
        raise HTTPException(
            status_code=501,
            detail="Microsoft Entra ID not configured. Missing client secret or certificate.",
        )

    app = msal.ConfidentialClientApplication(CLIENT_ID, authority=AUTHORITY, client_credential=client_credential)
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
        "expires_in": JWT_EXPIRATION_SECONDS,
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

@router.get("/callback")
async def callback(code: str, state: Optional[str] = None):
    return await _handle_callback(code, state)

@router.post("/callback")
async def callback_post(payload: EntraCallbackRequest):
    return await _handle_callback(payload.code, payload.state)

@router.get("/status")
def entra_status():
    """Check if Microsoft Entra ID is configured"""
    return {
        "configured": ENTRA_CONFIGURED,
        "client_id_set": bool(CLIENT_ID),
        "client_secret_set": bool(CLIENT_SECRET),
        "client_cert_set": bool(
            CLIENT_CERT_THUMBPRINT
            and (CLIENT_CERT_PRIVATE_KEY_B64 or CLIENT_CERT_PRIVATE_KEY)
        ),
        "redirect_uri": REDIRECT_URI if ENTRA_CONFIGURED else None,
        "authority": AUTHORITY if ENTRA_CONFIGURED else None,
    }
