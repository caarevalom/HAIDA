"""
Test Scripts management endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
from app.core.db import fetch_one, fetch_all, execute
from app.routes.auth import get_current_user

router = APIRouter()

class ScriptCreate(BaseModel):
    name: str
    description: Optional[str] = None
    code: str
    framework: str = "playwright"
    language: str = "typescript"
    project_id: Optional[str] = None
    test_suite_id: Optional[str] = None
    tags: Optional[List[str]] = []

class ScriptUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    code: Optional[str] = None
    framework: Optional[str] = None
    language: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[List[str]] = None

class Script(BaseModel):
    id: str
    project_id: str
    test_suite_id: Optional[str]
    name: str
    description: Optional[str]
    code: str
    framework: str
    language: str
    status: str
    tags: List[str]
    created_by: str
    created_at: datetime
    updated_at: datetime

class ScriptListResponse(BaseModel):
    scripts: List[Script]
    total: int
    page: int
    per_page: int

async def get_current_user_id(authorization: str = None) -> str:
    """Extract user ID from JWT token"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required"
        )
    
    try:
        import jwt
        import os
        JWT_SECRET = os.environ.get("JWT_SECRET", "development-secret-key")
        JWT_ALGORITHM = "HS256"
        
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("sub")
    except:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

@router.get("", response_model=ScriptListResponse)
async def list_scripts(
    project_id: Optional[str] = None,
    test_suite_id: Optional[str] = None,
    framework: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    per_page: int = 20,
    authorization: str = None
):
    """List scripts with filters and pagination"""
    user_id = await get_current_user_id(authorization)
    
    # Build WHERE clause
    where_conditions = ["created_by = %s"]
    params = [user_id]
    
    if project_id:
        where_conditions.append("project_id = %s")
        params.append(project_id)
    
    if test_suite_id:
        where_conditions.append("test_suite_id = %s")
        params.append(test_suite_id)
    
    if framework:
        where_conditions.append("automation_framework = %s")
        params.append(framework)
    
    if status:
        where_conditions.append("status = %s")
        params.append(status)
    
    where_clause = " WHERE " + " AND ".join(where_conditions)
    
    # Get total count
    count_sql = f"SELECT COUNT(*) as total FROM test_cases{where_clause}"
    count_result = fetch_one(count_sql, tuple(params))
    total = count_result['total'] if count_result else 0
    
    # Get scripts with pagination
    offset = (page - 1) * per_page
    scripts_sql = f"""
    SELECT tc.id, ts.project_id, tc.test_suite_id, tc.name, tc.description, 
           tc.test_steps as code, tc.automation_framework as framework, 
           tc.module as language, tc.status, tc.tags, tc.created_by, 
           tc.created_at, tc.updated_at
    FROM test_cases tc
    LEFT JOIN test_suites ts ON tc.test_suite_id = ts.id
    {where_clause}
    ORDER BY tc.created_at DESC 
    LIMIT %s OFFSET %s
    """
    
    params.extend([per_page, offset])
    scripts = fetch_all(scripts_sql, tuple(params))
    
    script_list = []
    for script in scripts:
        script_data = dict(script)
        script_data['project_id'] = script_data['project_id'] or ""
        script_data['tags'] = script_data['tags'] or []
        script_list.append(Script(**script_data))
    
    return ScriptListResponse(
        scripts=script_list,
        total=total,
        page=page,
        per_page=per_page
    )

@router.post("", response_model=Script)
async def create_script(script: ScriptCreate, authorization: str = None):
    """Create new test script"""
    user_id = await get_current_user_id(authorization)
    
    script_id = str(uuid.uuid4())
    
    # Convert tags list to PostgreSQL array
    tags_array = script.tags if script.tags else []
    
    # Get project_id from test_suite if not provided
    project_id = script.project_id
    if not project_id and script.test_suite_id:
        suite_result = fetch_one("SELECT project_id FROM test_suites WHERE id = %s", (script.test_suite_id,))
        if suite_result:
            project_id = suite_result['project_id']
    
    if not project_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="project_id is required when test_suite_id is not provided"
        )
    
    sql = """
    INSERT INTO test_cases 
    (id, test_suite_id, test_id, name, description, test_type, component, module,
     preconditions, test_steps, expected_result, priority, risk_level, is_automated,
     automation_script_path, automation_framework, status, tags, created_by, created_at, updated_at)
    VALUES 
    (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    
    try:
        execute(sql, (
            script_id,
            script.test_suite_id,
            f"TC_AUTO_{script_id[:8].upper()}",  # Generate test_id
            script.name,
            script.description,
            "Automation",  # test_type
            "Automated Script",  # component
            script.language,  # module
            "",  # preconditions
            script.code,  # test_steps
            "Script executes successfully",  # expected_result
            "medium",  # priority
            "medium",  # risk_level
            True,  # is_automated
            f"/scripts/{script_id}",  # automation_script_path
            script.framework,  # automation_framework
            "draft",  # status
            tags_array,  # tags
            user_id,  # created_by
            datetime.utcnow(),  # created_at
            datetime.utcnow()  # updated_at
        ))
        
        # Fetch the created script
        created_script = fetch_one(
            """
            SELECT tc.id, ts.project_id, tc.test_suite_id, tc.name, tc.description, 
                   tc.test_steps as code, tc.automation_framework as framework, 
                   tc.module as language, tc.status, tc.tags, tc.created_by, 
                   tc.created_at, tc.updated_at
            FROM test_cases tc
            LEFT JOIN test_suites ts ON tc.test_suite_id = ts.id
            WHERE tc.id = %s
            """,
            (script_id,)
        )
        
        if created_script:
            script_data = dict(created_script)
            script_data['tags'] = script_data['tags'] or []
            return Script(**script_data)
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create script"
            )
            
    except Exception as e:
        print(f"Error creating script: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create script: {str(e)}"
        )

@router.get("/{script_id}", response_model=Script)
async def get_script(script_id: str, authorization: str = None):
    """Get specific script by ID"""
    user_id = await get_current_user_id(authorization)
    
    script = fetch_one(
        """
        SELECT tc.id, ts.project_id, tc.test_suite_id, tc.name, tc.description, 
               tc.test_steps as code, tc.automation_framework as framework, 
               tc.module as language, tc.status, tc.tags, tc.created_by, 
               tc.created_at, tc.updated_at
        FROM test_cases tc
        LEFT JOIN test_suites ts ON tc.test_suite_id = ts.id
        WHERE tc.id = %s AND tc.created_by = %s
        """,
        (script_id, user_id)
    )
    
    if not script:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Script not found"
        )
    
    script_data = dict(script)
    script_data['project_id'] = script_data['project_id'] or ""
    script_data['tags'] = script_data['tags'] or []
    return Script(**script_data)

@router.put("/{script_id}", response_model=Script)
async def update_script(script_id: str, script_update: ScriptUpdate, authorization: str = None):
    """Update existing script"""
    user_id = await get_current_user_id(authorization)
    
    # Check if script exists and belongs to user
    existing_script = fetch_one(
        "SELECT id FROM test_cases WHERE id = %s AND created_by = %s",
        (script_id, user_id)
    )
    
    if not existing_script:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Script not found"
        )
    
    # Build UPDATE dynamically
    update_fields = []
    params = []
    
    if script_update.name is not None:
        update_fields.append("name = %s")
        params.append(script_update.name)
    
    if script_update.description is not None:
        update_fields.append("description = %s")
        params.append(script_update.description)
    
    if script_update.code is not None:
        update_fields.append("test_steps = %s")
        params.append(script_update.code)
    
    if script_update.framework is not None:
        update_fields.append("automation_framework = %s")
        params.append(script_update.framework)
    
    if script_update.language is not None:
        update_fields.append("module = %s")
        params.append(script_update.language)
    
    if script_update.status is not None:
        update_fields.append("status = %s")
        params.append(script_update.status)
    
    if script_update.tags is not None:
        update_fields.append("tags = %s")
        params.append(script_update.tags)
    
    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Add updated_at and script_id
    update_fields.append("updated_at = %s")
    params.append(datetime.utcnow())
    params.append(script_id)
    
    sql = f"""
    UPDATE test_cases 
    SET {', '.join(update_fields)}
    WHERE id = %s
    """
    
    try:
        execute(sql, tuple(params))
        
        # Fetch updated script
        updated_script = fetch_one(
            """
            SELECT tc.id, ts.project_id, tc.test_suite_id, tc.name, tc.description, 
                   tc.test_steps as code, tc.automation_framework as framework, 
                   tc.module as language, tc.status, tc.tags, tc.created_by, 
                   tc.created_at, tc.updated_at
            FROM test_cases tc
            LEFT JOIN test_suites ts ON tc.test_suite_id = ts.id
            WHERE tc.id = %s
            """,
            (script_id,)
        )
        
        script_data = dict(updated_script)
        script_data['project_id'] = script_data['project_id'] or ""
        script_data['tags'] = script_data['tags'] or []
        return Script(**script_data)
        
    except Exception as e:
        print(f"Error updating script: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update script: {str(e)}"
        )

@router.delete("/{script_id}")
async def delete_script(script_id: str, authorization: str = None):
    """Delete script"""
    user_id = await get_current_user_id(authorization)
    
    # Check if script exists and belongs to user
    existing_script = fetch_one(
        "SELECT id FROM test_cases WHERE id = %s AND created_by = %s",
        (script_id, user_id)
    )
    
    if not existing_script:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Script not found"
        )
    
    try:
        execute("DELETE FROM test_cases WHERE id = %s", (script_id,))
        return {"message": "Script deleted successfully"}
        
    except Exception as e:
        print(f"Error deleting script: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete script: {str(e)}"
        )

@router.post("/{script_id}/run")
async def run_script(script_id: str, authorization: str = None):
    """Execute script - creates a test execution record"""
    user_id = await get_current_user_id(authorization)
    
    # Check if script exists and belongs to user
    script = fetch_one(
        """
        SELECT tc.*, ts.project_id 
        FROM test_cases tc 
        LEFT JOIN test_suites ts ON tc.test_suite_id = ts.id 
        WHERE tc.id = %s AND tc.created_by = %s
        """,
        (script_id, user_id)
    )
    
    if not script:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Script not found"
        )
    
    try:
        # Create test execution record
        execution_id = str(uuid.uuid4())
        
        execution_sql = """
        INSERT INTO test_executions 
        (id, project_id, execution_type, trigger_source, environment, status, 
         started_at, total_tests, triggered_by)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        execute(
            execution_sql,
            (
                execution_id,
                script['project_id'],
                "manual",
                "api_call",
                "staging",
                "pending",
                datetime.utcnow(),
                1,  # total_tests
                user_id
            )
        )
        
        return {
            "execution_id": execution_id,
            "script_id": script_id,
            "status": "queued",
            "message": "Script execution queued successfully"
        }
        
    except Exception as e:
        print(f"Error queuing script execution: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to queue script execution: {str(e)}"
        )
