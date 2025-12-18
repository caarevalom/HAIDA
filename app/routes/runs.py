"""
Test Runs (Script Executions) endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
from app.core.db import fetch_one, fetch_all, execute

router = APIRouter()

class TestExecution(BaseModel):
    id: str
    project_id: str
    change_detection_id: Optional[str]
    execution_type: str
    trigger_source: str
    environment: str
    browser: Optional[str]
    platform: Optional[str]
    status: str
    started_at: datetime
    completed_at: Optional[datetime]
    duration_ms: Optional[int]
    total_tests: int
    passed_tests: int
    failed_tests: int
    skipped_tests: int
    allure_report_url: Optional[str]
    playwright_report_url: Optional[str]
    artifacts_path: Optional[str]
    triggered_by: Optional[str]
    metadata: dict

class TestExecutionCreate(BaseModel):
    project_id: str
    execution_type: str = "manual"
    trigger_source: str = "api_call"
    environment: str = "staging"
    browser: Optional[str] = None
    platform: Optional[str] = None
    test_suite_ids: Optional[List[str]] = None

class TestExecutionUpdate(BaseModel):
    status: Optional[str] = None
    completed_at: Optional[datetime] = None
    total_tests: Optional[int] = None
    passed_tests: Optional[int] = None
    failed_tests: Optional[int] = None
    skipped_tests: Optional[int] = None
    allure_report_url: Optional[str] = None
    playwright_report_url: Optional[str] = None
    artifacts_path: Optional[str] = None

class TestResult(BaseModel):
    id: str
    test_execution_id: str
    test_case_id: Optional[str]
    test_name: str
    test_file: Optional[str]
    test_id_ref: Optional[str]
    status: str
    error_message: Optional[str]
    error_stack: Optional[str]
    duration_ms: Optional[int]
    retries: int
    screenshot_url: Optional[str]
    video_url: Optional[str]
    trace_url: Optional[str]
    logs: Optional[str]
    assertions_passed: int
    assertions_failed: int
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime

class TestExecutionListResponse(BaseModel):
    executions: List[TestExecution]
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

@router.get("", response_model=TestExecutionListResponse)
async def list_executions(
    project_id: Optional[str] = None,
    status: Optional[str] = None,
    environment: Optional[str] = None,
    execution_type: Optional[str] = None,
    page: int = 1,
    per_page: int = 20,
    authorization: str = None
):
    """List test executions with filters and pagination"""
    user_id = await get_current_user_id(authorization)
    
    # Build WHERE clause - users can only see executions from their projects
    where_conditions = ["te.triggered_by = %s OR EXISTS (SELECT 1 FROM projects p WHERE p.id = te.project_id AND p.owner_id = %s)"]
    params = [user_id, user_id]
    
    if project_id:
        where_conditions.append("te.project_id = %s")
        params.append(project_id)
    
    if status:
        where_conditions.append("te.status = %s")
        params.append(status)
    
    if environment:
        where_conditions.append("te.environment = %s")
        params.append(environment)
    
    if execution_type:
        where_conditions.append("te.execution_type = %s")
        params.append(execution_type)
    
    where_clause = " WHERE " + " AND ".join(where_conditions)
    
    # Get total count
    count_sql = f"SELECT COUNT(*) as total FROM test_executions te{where_clause}"
    count_result = fetch_one(count_sql, tuple(params))
    total = count_result['total'] if count_result else 0
    
    # Get executions with pagination
    offset = (page - 1) * per_page
    executions_sql = f"""
    SELECT te.id, te.project_id, te.change_detection_id, te.execution_type, 
           te.trigger_source, te.environment, te.browser, te.platform, te.status,
           te.started_at, te.completed_at, te.duration_ms, te.total_tests,
           te.passed_tests, te.failed_tests, te.skipped_tests, te.allure_report_url,
           te.playwright_report_url, te.artifacts_path, te.triggered_by, te.metadata
    FROM test_executions te
    {where_clause}
    ORDER BY te.started_at DESC 
    LIMIT %s OFFSET %s
    """
    
    params.extend([per_page, offset])
    executions = fetch_all(executions_sql, tuple(params))
    
    execution_list = []
    for execution in executions:
        execution_data = dict(execution)
        execution_data['metadata'] = execution_data['metadata'] or {}
        execution_list.append(TestExecution(**execution_data))
    
    return TestExecutionListResponse(
        executions=execution_list,
        total=total,
        page=page,
        per_page=per_page
    )

@router.post("", response_model=TestExecution)
async def create_execution(execution: TestExecutionCreate, authorization: str = None):
    """Create new test execution"""
    user_id = await get_current_user_id(authorization)
    
    # Verify user has access to the project
    project = fetch_one(
        "SELECT id FROM projects WHERE id = %s AND (owner_id = %s)",
        (execution.project_id, user_id)
    )
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to project"
        )
    
    execution_id = str(uuid.uuid4())
    
    sql = """
    INSERT INTO test_executions 
    (id, project_id, execution_type, trigger_source, environment, browser, platform,
     status, started_at, total_tests, passed_tests, failed_tests, skipped_tests, triggered_by)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    RETURNING id, project_id, change_detection_id, execution_type, trigger_source,
              environment, browser, platform, status, started_at, completed_at,
              duration_ms, total_tests, passed_tests, failed_tests, skipped_tests,
              allure_report_url, playwright_report_url, artifacts_path,
              triggered_by, metadata
    """
    
    try:
        result = execute(sql, (
            execution_id,
            execution.project_id,
            execution.execution_type,
            execution.trigger_source,
            execution.environment,
            execution.browser,
            execution.platform,
            "pending",
            datetime.utcnow(),
            0,  # total_tests
            0,  # passed_tests
            0,  # failed_tests
            0,  # skipped_tests
            user_id
        ))
        
        # Fetch the created execution
        created_execution = fetch_one(
            """
            SELECT id, project_id, change_detection_id, execution_type, trigger_source,
                   environment, browser, platform, status, started_at, completed_at,
                   duration_ms, total_tests, passed_tests, failed_tests, skipped_tests,
                   allure_report_url, playwright_report_url, artifacts_path,
                   triggered_by, metadata
            FROM test_executions WHERE id = %s
            """,
            (execution_id,)
        )
        
        if created_execution:
            execution_data = dict(created_execution)
            execution_data['metadata'] = execution_data['metadata'] or {}
            return TestExecution(**execution_data)
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create execution"
            )
            
    except Exception as e:
        print(f"Error creating execution: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create execution: {str(e)}"
        )

@router.get("/{execution_id}", response_model=TestExecution)
async def get_execution(execution_id: str, authorization: str = None):
    """Get specific execution by ID"""
    user_id = await get_current_user_id(authorization)
    
    execution = fetch_one(
        """
        SELECT te.id, te.project_id, te.change_detection_id, te.execution_type, 
               te.trigger_source, te.environment, te.browser, te.platform, te.status,
               te.started_at, te.completed_at, te.duration_ms, te.total_tests,
               te.passed_tests, te.failed_tests, te.skipped_tests, te.allure_report_url,
               te.playwright_report_url, te.artifacts_path, te.triggered_by, te.metadata
        FROM test_executions te
        WHERE te.id = %s AND (te.triggered_by = %s OR EXISTS (SELECT 1 FROM projects p WHERE p.id = te.project_id AND p.owner_id = %s))
        """,
        (execution_id, user_id, user_id)
    )
    
    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Execution not found"
        )
    
    execution_data = dict(execution)
    execution_data['metadata'] = execution_data['metadata'] or {}
    return TestExecution(**execution_data)

@router.put("/{execution_id}", response_model=TestExecution)
async def update_execution(execution_id: str, execution_update: TestExecutionUpdate, authorization: str = None):
    """Update existing execution"""
    user_id = await get_current_user_id(authorization)
    
    # Check if execution exists and user has access
    existing_execution = fetch_one(
        """
        SELECT id FROM test_executions te
        WHERE te.id = %s AND (te.triggered_by = %s OR EXISTS (SELECT 1 FROM projects p WHERE p.id = te.project_id AND p.owner_id = %s))
        """,
        (execution_id, user_id, user_id)
    )
    
    if not existing_execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Execution not found"
        )
    
    # Build UPDATE dynamically
    update_fields = []
    params = []
    
    if execution_update.status is not None:
        update_fields.append("status = %s")
        params.append(execution_update.status)
    
    if execution_update.completed_at is not None:
        update_fields.append("completed_at = %s")
        params.append(execution_update.completed_at)
    
    if execution_update.total_tests is not None:
        update_fields.append("total_tests = %s")
        params.append(execution_update.total_tests)
    
    if execution_update.passed_tests is not None:
        update_fields.append("passed_tests = %s")
        params.append(execution_update.passed_tests)
    
    if execution_update.failed_tests is not None:
        update_fields.append("failed_tests = %s")
        params.append(execution_update.failed_tests)
    
    if execution_update.skipped_tests is not None:
        update_fields.append("skipped_tests = %s")
        params.append(execution_update.skipped_tests)
    
    if execution_update.allure_report_url is not None:
        update_fields.append("allure_report_url = %s")
        params.append(execution_update.allure_report_url)
    
    if execution_update.playwright_report_url is not None:
        update_fields.append("playwright_report_url = %s")
        params.append(execution_update.playwright_report_url)
    
    if execution_update.artifacts_path is not None:
        update_fields.append("artifacts_path = %s")
        params.append(execution_update.artifacts_path)
    
    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    params.append(execution_id)
    sql = f"""
    UPDATE test_executions 
    SET {', '.join(update_fields)}
    WHERE id = %s
    """
    
    try:
        execute(sql, tuple(params))
        
        # Fetch updated execution
        updated_execution = fetch_one(
            """
            SELECT te.id, te.project_id, te.change_detection_id, te.execution_type, 
                   te.trigger_source, te.environment, te.browser, te.platform, te.status,
                   te.started_at, te.completed_at, te.duration_ms, te.total_tests,
                   te.passed_tests, te.failed_tests, te.skipped_tests, te.allure_report_url,
                   te.playwright_report_url, te.artifacts_path, te.triggered_by, te.metadata
            FROM test_executions te
            WHERE te.id = %s
            """,
            (execution_id,)
        )
        
        execution_data = dict(updated_execution)
        execution_data['metadata'] = execution_data['metadata'] or {}
        return TestExecution(**execution_data)
        
    except Exception as e:
        print(f"Error updating execution: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update execution: {str(e)}"
        )

@router.get("/{execution_id}/results", response_model=List[TestResult])
async def get_execution_results(execution_id: str, authorization: str = None):
    """Get test results for a specific execution"""
    user_id = await get_current_user_id(authorization)
    
    # Check if execution exists and user has access
    execution = fetch_one(
        """
        SELECT id FROM test_executions te
        WHERE te.id = %s AND (te.triggered_by = %s OR EXISTS (SELECT 1 FROM projects p WHERE p.id = te.project_id AND p.owner_id = %s))
        """,
        (execution_id, user_id, user_id)
    )
    
    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Execution not found"
        )
    
    results = fetch_all(
        """
        SELECT id, test_execution_id, test_case_id, test_name, test_file, test_id_ref,
               status, error_message, error_stack, duration_ms, retries, screenshot_url,
               video_url, trace_url, logs, assertions_passed, assertions_failed,
               started_at, completed_at, created_at
        FROM test_results
        WHERE test_execution_id = %s
        ORDER BY created_at ASC
        """,
        (execution_id,)
    )
    
    result_list = []
    for result in results:
        result_data = dict(result)
        result_list.append(TestResult(**result_data))
    
    return result_list

@router.get("/{execution_id}/status")
async def get_execution_status(execution_id: str, authorization: str = None):
    """Get execution status and progress"""
    user_id = await get_current_user_id(authorization)
    
    execution = fetch_one(
        """
        SELECT te.id, te.status, te.started_at, te.completed_at, te.duration_ms,
               te.total_tests, te.passed_tests, te.failed_tests, te.skipped_tests
        FROM test_executions te
        WHERE te.id = %s AND (te.triggered_by = %s OR EXISTS (SELECT 1 FROM projects p WHERE p.id = te.project_id AND p.owner_id = %s))
        """,
        (execution_id, user_id, user_id)
    )
    
    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Execution not found"
        )
    
    # Get results count by status
    results_summary = fetch_one(
        """
        SELECT 
            COUNT(*) as total_results,
            COUNT(CASE WHEN status = 'passed' THEN 1 END) as passed_count,
            COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count,
            COUNT(CASE WHEN status = 'skipped' THEN 1 END) as skipped_count,
            COUNT(CASE WHEN status = 'running' THEN 1 END) as running_count
        FROM test_results
        WHERE test_execution_id = %s
        """,
        (execution_id,)
    )
    
    execution_data = dict(execution)
    results_data = dict(results_summary) if results_summary else {}
    
    return {
        "execution_id": execution_id,
        "status": execution_data['status'],
        "started_at": execution_data['started_at'],
        "completed_at": execution_data['completed_at'],
        "duration_ms": execution_data['duration_ms'],
        "total_tests": execution_data['total_tests'],
        "passed_tests": execution_data['passed_tests'],
        "failed_tests": execution_data['failed_tests'],
        "skipped_tests": execution_data['skipped_tests'],
        "results_summary": results_data,
        "progress_percentage": (
            (results_data.get('passed_count', 0) + results_data.get('failed_count', 0) + results_data.get('skipped_count', 0)) / 
            max(execution_data['total_tests'], 1) * 100
        ) if execution_data['total_tests'] > 0 else 0
    }

@router.delete("/{execution_id}")
async def delete_execution(execution_id: str, authorization: str = None):
    """Delete execution and its results"""
    user_id = await get_current_user_id(authorization)
    
    # Check if execution exists and user has access
    existing_execution = fetch_one(
        """
        SELECT id FROM test_executions te
        WHERE te.id = %s AND te.triggered_by = %s
        """,
        (execution_id, user_id)
    )
    
    if not existing_execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Execution not found or access denied"
        )
    
    try:
        # Delete test results first (foreign key constraint)
        execute("DELETE FROM test_results WHERE test_execution_id = %s", (execution_id,))
        
        # Delete execution
        execute("DELETE FROM test_executions WHERE id = %s", (execution_id,))
        
        return {"message": "Execution deleted successfully"}
        
    except Exception as e:
        print(f"Error deleting execution: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete execution: {str(e)}"
        )

@router.post("/{execution_id}/cancel")
async def cancel_execution(execution_id: str, authorization: str = None):
    """Cancel a running execution"""
    user_id = await get_current_user_id(authorization)
    
    # Check if execution exists and user has access
    execution = fetch_one(
        """
        SELECT id, status FROM test_executions te
        WHERE te.id = %s AND te.triggered_by = %s
        """,
        (execution_id, user_id)
    )
    
    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Execution not found"
        )
    
    if execution['status'] not in ['pending', 'running']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Execution cannot be cancelled in current status"
        )
    
    try:
        # Update execution status to cancelled
        execute(
            "UPDATE test_executions SET status = %s, completed_at = %s WHERE id = %s",
            ('cancelled', datetime.utcnow(), execution_id)
        )
        
        return {"message": "Execution cancelled successfully"}
        
    except Exception as e:
        print(f"Error cancelling execution: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel execution: {str(e)}"
        )
