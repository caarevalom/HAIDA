from fastapi import APIRouter, Request, HTTPException
import os, msal, urllib.parse

router = APIRouter()

# Entra ID Configuration (opcional - solo si está configurado)
AUTHORITY = os.environ.get("ENTRA_AUTHORITY", "https://login.microsoftonline.com/common")
CLIENT_ID = os.environ.get("ENTRA_CLIENT_ID", "")
CLIENT_SECRET = os.environ.get("ENTRA_CLIENT_SECRET", "")
REDIRECT_URI = os.environ.get("ENTRA_REDIRECT_URI", "http://localhost:8000/entra/callback")
SCOPES = os.environ.get("GRAPH_SCOPES", "User.Read").split()

# Verificar si Entra está configurado
ENTRA_CONFIGURED = bool(CLIENT_ID and CLIENT_SECRET)

@router.get("/login")
def login():
    if not ENTRA_CONFIGURED:
        raise HTTPException(status_code=501, detail="Microsoft Entra ID not configured. Set ENTRA_CLIENT_ID and ENTRA_CLIENT_SECRET in .env")

    app = msal.ConfidentialClientApplication(CLIENT_ID, authority=AUTHORITY, client_credential=CLIENT_SECRET)
    auth_url = app.get_authorization_request_url(SCOPES, redirect_uri=REDIRECT_URI, state="nonce123")
    return {"auth_url": auth_url}

@router.get("/callback")
def callback(code: str, state: str):
    if not ENTRA_CONFIGURED:
        raise HTTPException(status_code=501, detail="Microsoft Entra ID not configured")

    app = msal.ConfidentialClientApplication(CLIENT_ID, authority=AUTHORITY, client_credential=CLIENT_SECRET)
    result = app.acquire_token_by_authorization_code(code, scopes=SCOPES, redirect_uri=REDIRECT_URI)
    # TODO: Generar JWT local con claims básicas
    # TODO: Guardar/actualizar perfil en DB
    return {"microsoft": {"expires_in": result.get("expires_in"), "token_type": result.get("token_type")}}
