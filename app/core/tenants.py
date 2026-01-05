import os
from fastapi import Request, HTTPException
from app.core.db import fetch_one
from app.core.supabase_client import get_supabase_client

def resolve_tenant_id(request: Request) -> str | None:
    # Convención: header 'X-Tenant-Id' o 'X-Workspace'
    return request.headers.get("X-Tenant-Id") or request.headers.get("X-Workspace")

ENFORCE_TENANT_MEMBERSHIP = os.environ.get("ENFORCE_TENANT_MEMBERSHIP", "false").lower() == "true"

def require_tenant_membership(tenant_id: str | None, user_id: str | None):
    """Ensure user belongs to tenant when enforcement is enabled."""
    if not ENFORCE_TENANT_MEMBERSHIP:
        return
    if not tenant_id or not user_id:
        raise HTTPException(status_code=401, detail="Tenant membership required")

    if os.environ.get("DATABASE_URL"):
        row = fetch_one(
            "SELECT 1 FROM tenant_members WHERE tenant_id = %s AND user_id = %s",
            (tenant_id, user_id),
        )
        if not row:
            raise HTTPException(status_code=403, detail="User not in tenant")
        return

    supabase = get_supabase_client()
    result = supabase.table("tenant_members")\
        .select("role")\
        .eq("tenant_id", tenant_id)\
        .eq("user_id", user_id)\
        .limit(1)\
        .execute()
    if not result.data:
        raise HTTPException(status_code=403, detail="User not in tenant")
