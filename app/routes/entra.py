from fastapi import APIRouter, Request
import os, msal, urllib.parse

router = APIRouter()

AUTHORITY = os.environ["ENTRA_AUTHORITY"]
CLIENT_ID = os.environ["ENTRA_CLIENT_ID"]
CLIENT_SECRET = os.environ["ENTRA_CLIENT_SECRET"]
REDIRECT_URI = os.environ["ENTRA_REDIRECT_URI"]
SCOPES = os.environ.get("GRAPH_SCOPES", "User.Read").split()

@router.get("/login")
def login():
    app = msal.ConfidentialClientApplication(CLIENT_ID, authority=AUTHORITY, client_credential=CLIENT_SECRET)
    auth_url = app.get_authorization_request_url(SCOPES, redirect_uri=REDIRECT_URI, state="nonce123")
    return {"auth_url": auth_url}

@router.get("/callback")
def callback(code: str, state: str):
    app = msal.ConfidentialClientApplication(CLIENT_ID, authority=AUTHORITY, client_credential=CLIENT_SECRET)
    result = app.acquire_token_by_authorization_code(code, scopes=SCOPES, redirect_uri=REDIRECT_URI)
    # Generar tu JWT local con claims básicas
    # Guardar/actualizar perfil en DB según tu diseño
    return {"microsoft": {"expires_in": result.get("expires_in"), "token_type": result.get("token_type")}}
