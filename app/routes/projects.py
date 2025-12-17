"""
Projects management endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
import os
from supabase import create_client, Client

router = APIRouter()

# Supabase client
def get_supabase() -> Client:
    """Get Supabase client"""
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_KEY')

    if not supabase_url or not supabase_key:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    return create_client(supabase_url, supabase_key)

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
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100)
):
    """
    List all projects for current tenant
    """
    supabase = get_supabase()

    # Query projects from Supabase
    result = supabase.table('projects')\
        .select('*')\
        .order('created_at', desc=True)\
        .range(skip, skip + limit - 1)\
        .execute()

    return result.data if result.data else []

@router.post("", response_model=Project)
async def create_project(project: ProjectCreate):
    """
    Create a new project
    TODO: Insert into projects table
    """
    # TODO: Implement actual creation
    return Project(
        id=str(uuid.uuid4()),
        tenant_id=str(uuid.uuid4()),
        name=project.name,
        description=project.description,
        repository_url=project.repository_url,
        base_url=project.base_url,
        status="active",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

@router.get("/{project_id}", response_model=Project)
async def get_project(project_id: str):
    """
    Get project by ID
    """
    supabase = get_supabase()

    result = supabase.table('projects')\
        .select('*')\
        .eq('id', project_id)\
        .execute()

    if not result.data or len(result.data) == 0:
        raise HTTPException(status_code=404, detail="Project not found")

    return result.data[0]

@router.put("/{project_id}", response_model=Project)
async def update_project(project_id: str, project: ProjectCreate):
    """
    Update project
    TODO: Update in database
    """
    # TODO: Implement actual update
    raise HTTPException(status_code=404, detail="Project not found")

@router.delete("/{project_id}")
async def delete_project(project_id: str):
    """
    Delete project
    TODO: Soft delete in database
    """
    # TODO: Implement actual deletion
    return {"message": "Project deleted successfully"}

@router.get("/{project_id}/test-suites")
async def list_test_suites(project_id: str):
    """
    List test suites for a project
    """
    supabase = get_supabase()

    result = supabase.table('test_suites')\
        .select('*')\
        .eq('project_id', project_id)\
        .order('created_at', desc=True)\
        .execute()

    return result.data if result.data else []
