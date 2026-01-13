"""File management endpoints"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from typing import List
from datetime import datetime
import os
from app.core.supabase_client import get_supabase_client
from app.core.request_context import get_tenant_id, get_user_id
from app.core.tenants import require_tenant_membership

router = APIRouter()

@router.post("/upload")
async def upload_file(request: Request, file: UploadFile = File(...)):
    """Upload file to Supabase Storage"""
    tenant_id = get_tenant_id(request)
    user_id = get_user_id(request)
    require_tenant_membership(tenant_id, user_id)
    supabase = get_supabase_client()
    bucket = request.headers.get("X-Storage-Bucket") or "haida-files"

    content = await file.read()
    prefix = f"{tenant_id}/{user_id}"
    object_path = f"{prefix}/{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{file.filename}"

    result = supabase.storage.from_(bucket).upload(
        object_path,
        content,
        file_options={"content-type": file.content_type}
    )
    if getattr(result, "error", None):
        raise HTTPException(status_code=500, detail="Upload failed")

    use_public_url = request.headers.get("X-Storage-Public-Url", "false").lower() == "true"
    use_public_url = use_public_url or os.environ.get("STORAGE_USE_PUBLIC_URL", "false").lower() == "true"
    expires_in = int(request.headers.get("X-File-Url-Expires", "3600"))
    if use_public_url:
        public_url = supabase.storage.from_(bucket).get_public_url(object_path)
        url = public_url
    else:
        signed = supabase.storage.from_(bucket).create_signed_url(object_path, expires_in)
        url = signed.get("signedURL") if isinstance(signed, dict) else None
    if not url:
        raise HTTPException(status_code=500, detail="Failed to create file URL")
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "path": object_path,
        "url": url,
        "expires_in": expires_in if not use_public_url else None
    }

@router.get("")
async def list_files(request: Request):
    """List user files"""
    tenant_id = get_tenant_id(request)
    user_id = get_user_id(request)
    require_tenant_membership(tenant_id, user_id)
    supabase = get_supabase_client()
    bucket = request.headers.get("X-Storage-Bucket") or "haida-files"

    prefix = f"{tenant_id}/{user_id}"
    files = supabase.storage.from_(bucket).list(prefix)
    return files or []

@router.get("/{file_id}")
async def get_file(request: Request, file_id: str):
    """Get signed download URL for a file"""
    tenant_id = get_tenant_id(request)
    user_id = get_user_id(request)
    require_tenant_membership(tenant_id, user_id)
    supabase = get_supabase_client()
    bucket = request.headers.get("X-Storage-Bucket") or "haida-files"
    expires_in = int(request.headers.get("X-File-Url-Expires", "3600"))

    object_path = f"{tenant_id}/{user_id}/{file_id}"
    signed = supabase.storage.from_(bucket).create_signed_url(object_path, expires_in)
    signed_url = signed.get("signedURL") if isinstance(signed, dict) else None
    if not signed_url:
        raise HTTPException(status_code=404, detail="File not found")

    return {"download_url": signed_url, "expires_in": expires_in}

@router.delete("/{file_id}")
async def delete_file(request: Request, file_id: str):
    """Delete file"""
    tenant_id = get_tenant_id(request)
    user_id = get_user_id(request)
    require_tenant_membership(tenant_id, user_id)
    supabase = get_supabase_client()
    bucket = request.headers.get("X-Storage-Bucket") or "haida-files"

    object_path = f"{tenant_id}/{user_id}/{file_id}"
    result = supabase.storage.from_(bucket).remove([object_path])
    if getattr(result, "error", None):
        raise HTTPException(status_code=500, detail="Delete failed")
    return {"message": "File deleted"}
