"""Feature Flags endpoints"""
from fastapi import APIRouter, HTTPException, Request
from typing import Dict, Any
from app.core.supabase_client import get_supabase_client
from app.core.tenants import resolve_tenant_id

router = APIRouter()

@router.get("")
async def get_feature_flags(request: Request) -> Dict[str, Any]:
    """Get all feature flags"""
    supabase = get_supabase_client()
    tenant_id = resolve_tenant_id(request) or request.headers.get("X-Tenant-Id")

    flags_result = supabase.table("feature_flags")\
        .select("key, default_value, is_active")\
        .execute()

    flags = {}
    if flags_result.data:
        for flag in flags_result.data:
            if flag.get("is_active"):
                flags[flag["key"]] = flag.get("default_value")

    if tenant_id and flags:
        overrides = supabase.table("tenant_feature_flags")\
            .select("flag_key, value, is_enabled")\
            .eq("tenant_id", tenant_id)\
            .execute()
        if overrides.data:
            for row in overrides.data:
                if row.get("is_enabled") and row.get("flag_key") in flags:
                    flags[row["flag_key"]] = row.get("value")

    return flags

@router.get("/{flag_key}")
async def get_flag(request: Request, flag_key: str) -> Dict[str, Any]:
    """Get specific flag"""
    supabase = get_supabase_client()
    tenant_id = resolve_tenant_id(request) or request.headers.get("X-Tenant-Id")

    flag_result = supabase.table("feature_flags")\
        .select("key, default_value, is_active")\
        .eq("key", flag_key)\
        .execute()

    if not flag_result.data:
        raise HTTPException(status_code=404, detail="Flag not found")

    flag = flag_result.data[0]
    value = flag.get("default_value")
    enabled = flag.get("is_active", False)

    if tenant_id:
        override = supabase.table("tenant_feature_flags")\
            .select("value, is_enabled")\
            .eq("tenant_id", tenant_id)\
            .eq("flag_key", flag_key)\
            .execute()
        if override.data:
            row = override.data[0]
            value = row.get("value")
            enabled = row.get("is_enabled", enabled)

    return {"key": flag_key, "value": value, "enabled": enabled}
