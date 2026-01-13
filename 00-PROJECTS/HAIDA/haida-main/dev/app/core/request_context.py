import os
from fastapi import HTTPException, Request
import jwt
from app.core.tenants import resolve_tenant_id

ALLOW_HEADER_AUTH = os.environ.get("ALLOW_HEADER_AUTH", "false").lower() == "true"
ALLOW_HEADER_TENANT = os.environ.get("ALLOW_HEADER_TENANT", "false").lower() == "true"
IS_DEV = os.environ.get("NODE_ENV", "development") == "development"

def get_tenant_id(request: Request, required: bool = True) -> str | None:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth.removeprefix("Bearer ").strip()
        secret = os.environ.get("JWT_SECRET", "development-secret-key")
        algorithm = os.environ.get("JWT_ALGORITHM", "HS256")
        try:
            payload = jwt.decode(token, secret, algorithms=[algorithm])
            tenant_id = payload.get("tenant_id") or payload.get("tenant")
            if tenant_id:
                return tenant_id
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid token")

    tenant_id = resolve_tenant_id(request) or os.getenv("DEFAULT_TENANT_ID")
    if tenant_id and (ALLOW_HEADER_TENANT or IS_DEV or os.getenv("DEFAULT_TENANT_ID")):
        return tenant_id
    if required and not tenant_id:
        raise HTTPException(status_code=400, detail="Tenant id required")
    return tenant_id

def get_user_id(request: Request, required: bool = True) -> str | None:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth.removeprefix("Bearer ").strip()
        secret = os.environ.get("JWT_SECRET", "development-secret-key")
        algorithm = os.environ.get("JWT_ALGORITHM", "HS256")
        try:
            payload = jwt.decode(token, secret, algorithms=[algorithm])
            user_id = payload.get("sub")
            if user_id:
                return user_id
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid token")

    header_user_id = request.headers.get("X-User-Id")
    if header_user_id and (ALLOW_HEADER_AUTH or IS_DEV):
        return header_user_id
    if required:
        raise HTTPException(status_code=401, detail="User id required")
    return None
