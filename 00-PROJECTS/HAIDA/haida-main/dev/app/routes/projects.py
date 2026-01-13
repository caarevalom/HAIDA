"""Projects management endpoints"""
from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
import re
from app.core.supabase_client import get_supabase_client
from app.core.tenants import resolve_tenant_id, require_tenant_membership
from app.core.request_context import get_user_id

router = APIRouter()

def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or f"project-{uuid.uuid4().hex[:8]}"

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    repository_url: Optional[str] = None
    base_url: Optional[str] = None

class Project(BaseModel):
    id: str
    tenant_id: Optional[str] = None
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    repository_url: Optional[str] = None
    documentation_url: Optional[str] = None
    base_url: Optional[str] = None
    status: Optional[str] = "active"
    type: Optional[str] = None
    settings: Optional[dict] = None
    metadata: Optional[dict] = None
    created_by: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

@router.get("", response_model=List[Project])
async def list_projects(
    request: Request,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100)
):
    """
    List all projects for current tenant
    """
    tenant_id = resolve_tenant_id(request) or request.headers.get("X-Tenant-Id")
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Tenant id required")
    user_id = get_user_id(request)
    require_tenant_membership(tenant_id, user_id)

    supabase = get_supabase_client()

    # Query projects from Supabase
    result = supabase.table('projects')\
        .select('*')\
        .eq('tenant_id', tenant_id)\
        .order('created_at', desc=True)\
        .range(skip, skip + limit - 1)\
        .execute()

    return result.data if result.data else []

@router.post("", response_model=Project)
async def create_project(request: Request, project: ProjectCreate):
    """
    Create a new project
    """
    tenant_id = resolve_tenant_id(request) or request.headers.get("X-Tenant-Id")
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Tenant id required")
    user_id = get_user_id(request)
    require_tenant_membership(tenant_id, user_id)
    if not project.base_url:
        raise HTTPException(status_code=400, detail="base_url is required")

    supabase = get_supabase_client()

    slug = slugify(project.name)
    existing = supabase.table("projects")\
        .select("id")\
        .eq("tenant_id", tenant_id)\
        .eq("slug", slug)\
        .limit(1)\
        .execute()
    if existing.data:
        slug = f"{slug}-{uuid.uuid4().hex[:6]}"

    payload = {
        "tenant_id": tenant_id,
        "name": project.name,
        "slug": slug,
        "description": project.description,
        "repository_url": project.repository_url,
        "base_url": project.base_url,
        "status": "active",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    result = supabase.table('projects').insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Project creation failed")
    return result.data[0]

@router.get("/{project_id}", response_model=Project)
async def get_project(request: Request, project_id: str):
    """
    Get project by ID
    """
    tenant_id = resolve_tenant_id(request) or request.headers.get("X-Tenant-Id")
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Tenant id required")
    user_id = get_user_id(request)
    require_tenant_membership(tenant_id, user_id)

    supabase = get_supabase_client()

    result = supabase.table('projects')\
        .select('*')\
        .eq('id', project_id)\
        .eq('tenant_id', tenant_id)\
        .execute()

    if not result.data or len(result.data) == 0:
        raise HTTPException(status_code=404, detail="Project not found")

    return result.data[0]

@router.put("/{project_id}", response_model=Project)
async def update_project(request: Request, project_id: str, project: ProjectCreate):
    """
    Update project
    """
    tenant_id = resolve_tenant_id(request) or request.headers.get("X-Tenant-Id")
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Tenant id required")
    user_id = get_user_id(request)
    require_tenant_membership(tenant_id, user_id)

    supabase = get_supabase_client()
    payload = {
        "name": project.name,
        "description": project.description,
        "repository_url": project.repository_url,
        "base_url": project.base_url,
        "updated_at": datetime.utcnow().isoformat(),
    }
    result = supabase.table('projects')\
        .update(payload)\
        .eq('id', project_id)\
        .eq('tenant_id', tenant_id)\
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Project not found")
    return result.data[0]

@router.delete("/{project_id}")
async def delete_project(request: Request, project_id: str):
    """
    Delete project
    """
    tenant_id = resolve_tenant_id(request) or request.headers.get("X-Tenant-Id")
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Tenant id required")
    user_id = get_user_id(request)
    require_tenant_membership(tenant_id, user_id)

    supabase = get_supabase_client()
    result = supabase.table('projects')\
        .update({"status": "archived", "updated_at": datetime.utcnow().isoformat()})\
        .eq('id', project_id)\
        .eq('tenant_id', tenant_id)\
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project archived successfully"}

@router.get("/{project_id}/test-suites")
async def list_test_suites(request: Request, project_id: str):
    """
    List test suites for a project
    """
    tenant_id = get_tenant_id(request)
    user_id = get_user_id(request)
    require_tenant_membership(tenant_id, user_id)

    supabase = get_supabase_client()

    # Verify project belongs to tenant
    project = supabase.table('projects')\
        .select('id')\
        .eq('id', project_id)\
        .eq('tenant_id', tenant_id)\
        .limit(1)\
        .execute()

    if not project.data:
        raise HTTPException(status_code=404, detail="Project not found")

    result = supabase.table('test_suites')\
        .select('*')\
        .eq('project_id', project_id)\
        .eq('tenant_id', tenant_id)\
        .order('created_at', desc=True)\
        .execute()

    return result.data if result.data else []
