import os, base64, json, hmac, hashlib, time
from fastapi import HTTPException, Depends, Request

def _b64pad(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "===")

def verify_jwt(token: str, secret: str) -> dict:
    try:
        h, p, s = token.split(".")
        sig = hmac.new(secret.encode(), f"{h}.{p}".encode(), hashlib.sha256).digest()
        if base64.urlsafe_b64encode(sig).rstrip(b"=") != s.encode():
            raise ValueError("firma inválida")
        payload = json.loads(_b64pad(p))
        if int(time.time()) > payload.get("exp", 0):
            raise ValueError("token expirado")
        return payload
    except Exception:
        raise HTTPException(401, "Token inválido")

def require_user(request: Request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Falta Authorization Bearer")
    token = auth.removeprefix("Bearer ").strip()
    secret = os.environ.get("JWT_SECRET", "change_me_super_secret")
    return verify_jwt(token, secret)
