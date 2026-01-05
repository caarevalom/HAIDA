from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
import jwt
from jwt import PyJWTError
import os, msal, secrets, time, json
from app.core.db import fetch_one, execute

router = APIRouter()

# Entra ID Configuration (opcional - solo si está configurado)
TENANT_ID = os.environ.get("ENTRA_TENANT_ID") or os.environ.get("AZURE_TENANT_ID") or ""
AUTHORITY = (
    os.environ.get("ENTRA_AUTHORITY")
    or os.environ.get("AZURE_AUTHORITY")
    or (f"https://login.microsoftonline.com/{TENANT_ID}" if TENANT_ID else "https://login.microsoftonline.com/common")
)
CLIENT_ID = os.environ.get("ENTRA_CLIENT_ID") or os.environ.get("AZURE_CLIENT_ID") or ""
CLIENT_SECRET = os.environ.get("ENTRA_CLIENT_SECRET") or os.environ.get("AZURE_CLIENT_SECRET") or ""
REDIRECT_URI = os.environ.get("ENTRA_REDIRECT_URI") or os.environ.get("AZURE_REDIRECT_URI") or "http://localhost:8000/entra/callback"
SCOPES = os.environ.get("GRAPH_SCOPES", "openid profile email offline_access User.Read").split()
STATE_TTL_SEC = int(os.environ.get("ENTRA_STATE_TTL_SEC", "600"))
ALLOW_STATIC_STATE = os.environ.get("ENTRA_STATE_ALLOW_STATIC", "false").lower() == "true"
STATIC_STATE = os.environ.get("ENTRA_STATE", "")
MAX_SSO_USERS = int(os.environ.get("MAX_SSO_USERS", "3"))
ALLOWED_SSO_EMAILS = {
    email.strip().lower()
    for email in os.environ.get("ALLOWED_SSO_EMAILS", "").split(",")
    if email.strip()
}
ALLOWED_TENANT_IDS = {
    tenant.strip()
    for tenant in os.environ.get("ALLOWED_TENANT_IDS", "").split(",")
    if tenant.strip()
}
JWT_SECRET = os.environ.get("JWT_SECRET", "development-secret-key")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = int(os.environ.get("JWT_EXPIRATION_HOURS", "24"))
DASHBOARD_PATH = os.environ.get("DASHBOARD_PATH", "/dashboard")
COPILOT_URL = os.environ.get("COPILOT_URL", "https://m365.cloud.microsoft/chat/?auth=2&origindomain=Offic")
DEFAULT_TENANT_ID = os.environ.get("DEFAULT_TENANT_ID", "")

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
        if MAX_SSO_USERS > 0 and total["total"] >= MAX_SSO_USERS:
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
    if DEFAULT_TENANT_ID:
        payload["tenant_id"] = DEFAULT_TENANT_ID
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def _store_microsoft_tokens(user_id: str, result: dict) -> None:
    access_token = result.get("access_token")
    if not access_token:
        return
    now_ts = int(time.time())
    expires_in = int(result.get("expires_in") or 0)
    metadata = {
        "access_token": access_token,
        "expires_at": now_ts + max(expires_in - 30, 0) if expires_in else now_ts + 3600,
        "scope": result.get("scope"),
        "token_type": result.get("token_type"),
    }
    refresh_token = result.get("refresh_token")
    if refresh_token:
        metadata["refresh_token"] = refresh_token
    execute(
        "UPDATE users SET metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{microsoft}', %s::jsonb, true), updated_at = %s WHERE id = %s",
        (json.dumps(metadata), datetime.utcnow(), user_id),
    )

def _build_state() -> str:
    if ALLOW_STATIC_STATE and STATIC_STATE:
        return STATIC_STATE
    payload = {
        "nonce": secrets.token_urlsafe(16),
        "iat": int(time.time()),
        "exp": int(time.time()) + STATE_TTL_SEC,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def _verify_state(state: str) -> None:
    if ALLOW_STATIC_STATE and STATIC_STATE and state == STATIC_STATE:
        return
    try:
        jwt.decode(state, JWT_SECRET, algorithms=[JWT_ALGORITHM], options={"require": ["exp", "iat"]})
    except PyJWTError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Estado inválido en callback de Microsoft")

@router.get("/login")
def login():
    if not ENTRA_CONFIGURED:
        raise HTTPException(status_code=501, detail="Microsoft Entra ID not configured. Set ENTRA_CLIENT_ID and ENTRA_CLIENT_SECRET in .env")

    app = msal.ConfidentialClientApplication(CLIENT_ID, authority=AUTHORITY, client_credential=CLIENT_SECRET)
    state_token = _build_state()
    auth_url = app.get_authorization_request_url(SCOPES, redirect_uri=REDIRECT_URI, state=state_token, prompt="select_account")
    return {
        "auth_url": auth_url,
        "redirect_uri": REDIRECT_URI,
        "scopes": SCOPES,
        "state": state_token,
        "local_redirect": "localhost" in REDIRECT_URI,
    }

@router.get("/callback")
async def callback(code: str, state: str):
    if not ENTRA_CONFIGURED:
        raise HTTPException(status_code=501, detail="Microsoft Entra ID not configured")

    _verify_state(state)

    app = msal.ConfidentialClientApplication(CLIENT_ID, authority=AUTHORITY, client_credential=CLIENT_SECRET)
    result = app.acquire_token_by_authorization_code(code, scopes=SCOPES, redirect_uri=REDIRECT_URI)
    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error de Microsoft: {result.get('error_description', result['error'])}",
        )

    claims = result.get("id_token_claims") or {}
    tid = claims.get("tid")
    if ALLOWED_TENANT_IDS and tid not in ALLOWED_TENANT_IDS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tenant no autorizado para Microsoft SSO",
        )
    email = (claims.get("preferred_username") or claims.get("email") or "").lower()
    name = claims.get("name") or email
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Microsoft no devolvió un email en el id_token",
        )

    user = _get_or_create_user(email, name)
    _store_microsoft_tokens(user["id"], result)
    local_token = _issue_local_token(user)

    return {
        "access_token": local_token,
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


class EntraCallbackPayload(BaseModel):
    code: str
    state: str


@router.post("/callback")
async def callback_post(payload: EntraCallbackPayload):
    """Support frontend POST callback with JSON body."""
    return await callback(payload.code, payload.state)

@router.get("/status")
def status():
    """Expose Entra configuration status without secrets."""
    return {
        "configured": ENTRA_CONFIGURED,
        "authority": AUTHORITY,
        "redirect_uri": REDIRECT_URI,
        "client_id_set": bool(CLIENT_ID),
        "tenant_id_set": bool(TENANT_ID),
        "allowed_sso_emails_count": len(ALLOWED_SSO_EMAILS),
        "allowed_tenant_ids_count": len(ALLOWED_TENANT_IDS),
        "max_sso_users": MAX_SSO_USERS,
    }
