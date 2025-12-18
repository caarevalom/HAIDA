"""
Reports endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
import json
from app.core.db import fetch_one, fetch_all, execute

router = APIRouter()

class Report(BaseModel):
    id: str
    project_id: str
    execution_id: Optional[str]
    name: str
    description: Optional[str]
    report_type: str
    format: str
    status: str
    file_path: Optional[str]
    file_size: Optional[int]
    download_url: Optional[str]
    metadata: dict
    created_by: str
    created_at: datetime
    updated_at: datetime

class ReportCreate(BaseModel):
    project_id: str
    execution_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    report_type: str = "execution_summary"
    format: str = "pdf"

class ReportUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    download_url: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class ReportListResponse(BaseModel):
    reports: List[Report]
    total: int
    page: int
    per_page: int

class ReportGenerationRequest(BaseModel):
    project_id: str
    report_type: str
    format: str = "pdf"
    date_range: Optional[Dict[str, str]] = None
    filters: Optional[Dict[str, Any]] = None

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

@router.get("", response_model=ReportListResponse)
async def list_reports(
    project_id: Optional[str] = None,
    execution_id: Optional[str] = None,
    report_type: Optional[str] = None,
    status: Optional[str] = None,
    format: Optional[str] = None,
    page: int = 1,
    per_page: int = 20,
    authorization: str = None
):
    """List reports with filters and pagination"""
    user_id = await get_current_user_id(authorization)
    
    # Build WHERE clause
    where_conditions = ["created_by = %s"]
    params = [user_id]
    
    if project_id:
        where_conditions.append("project_id = %s")
        params.append(project_id)
    
    if execution_id:
        where_conditions.append("execution_id = %s")
        params.append(execution_id)
    
    if report_type:
        where_conditions.append("report_type = %s")
        params.append(report_type)
    
    if status:
        where_conditions.append("status = %s")
        params.append(status)
    
    if format:
        where_conditions.append("format = %s")
        params.append(format)
    
    where_clause = " WHERE " + " AND ".join(where_conditions)
    
    # Get total count
    count_sql = f"SELECT COUNT(*) as total FROM reports{where_clause}"
    count_result = fetch_one(count_sql, tuple(params))
    total = count_result['total'] if count_result else 0
    
    # Get reports with pagination
    offset = (page - 1) * per_page
    reports_sql = f"""
    SELECT id, project_id, execution_id, name, description, report_type, format,
           status, file_path, file_size, download_url, metadata, created_by,
           created_at, updated_at
    FROM reports
    {where_clause}
    ORDER BY created_at DESC 
    LIMIT %s OFFSET %s
    """
    
    params.extend([per_page, offset])
    reports = fetch_all(reports_sql, tuple(params))
    
    report_list = []
    for report in reports:
        report_data = dict(report)
        report_data['metadata'] = report_data['metadata'] or {}
        report_list.append(Report(**report_data))
    
    return ReportListResponse(
        reports=report_list,
        total=total,
        page=page,
        per_page=per_page
    )

@router.post("/generate", response_model=Report)
async def generate_report(request: ReportGenerationRequest, authorization: str = None):
    """Generate a new report"""
    user_id = await get_current_user_id(authorization)
    
    # Verify user has access to the project
    project = fetch_one(
        "SELECT id FROM projects WHERE id = %s AND owner_id = %s",
        (request.project_id, user_id)
    )
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to project"
        )
    
    report_id = str(uuid.uuid4())
    report_name = f"{request.report_type}_{request.format}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
    
    # Create report record
    sql = """
    INSERT INTO reports 
    (id, project_id, execution_id, name, description, report_type, format,
     status, metadata, created_by, created_at, updated_at)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    RETURNING id, project_id, execution_id, name, description, report_type, format,
              status, file_path, file_size, download_url, metadata, created_by,
              created_at, updated_at
    """
    
    try:
        # Generate report data based on type
        report_data = await generate_report_data(
            request.project_id, 
            request.report_type, 
            request.date_range,
            request.filters
        )
        
        created_report = execute(sql, (
            report_id,
            request.project_id,
            None,  # execution_id (can be added later)
            report_name,
            f"Generated {request.report_type} report",
            request.report_type,
            request.format,
            "generating",
            report_data,
            user_id,
            datetime.utcnow(),
            datetime.utcnow()
        ))
        
        # Fetch the created report
        report = fetch_one(
            """
            SELECT id, project_id, execution_id, name, description, report_type, format,
                   status, file_path, file_size, download_url, metadata, created_by,
                   created_at, updated_at
            FROM reports WHERE id = %s
            """,
            (report_id,)
        )
        
        if report:
            report_data = dict(report)
            report_data['metadata'] = report_data['metadata'] or {}
            
            # In a real implementation, you would:
            # 1. Generate the actual file (PDF, Excel, etc.)
            # 2. Save to storage (S3, Vercel, etc.)
            # 3. Update the record with file_path and download_url
            
            # For now, we'll simulate completion
            file_path = f"/reports/{report_id}.{request.format}"
            download_url = f"/api/reports/{report_id}/download"
            
            execute(
                """
                UPDATE reports 
                SET status = %s, file_path = %s, download_url = %s, updated_at = %s
                WHERE id = %s
                """,
                ("completed", file_path, download_url, datetime.utcnow(), report_id)
            )
            
            # Fetch updated report
            updated_report = fetch_one("SELECT * FROM reports WHERE id = %s", (report_id,))
            updated_data = dict(updated_report)
            updated_data['metadata'] = updated_data['metadata'] or {}
            
            return Report(**updated_data)
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create report"
            )
            
    except Exception as e:
        print(f"Error generating report: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate report: {str(e)}"
        )

async def generate_report_data(project_id: str, report_type: str, date_range: Optional[Dict[str, str]], filters: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate report data based on type"""
    
    if report_type == "execution_summary":
        return await generate_execution_summary(project_id, date_range, filters)
    elif report_type == "test_coverage":
        return await generate_test_coverage(project_id, date_range, filters)
    elif report_type == "trends":
        return await generate_trends_report(project_id, date_range, filters)
    elif report_type == "performance":
        return await generate_performance_report(project_id, date_range, filters)
    else:
        return {"error": "Unsupported report type"}

async def generate_execution_summary(project_id: str, date_range: Optional[Dict[str, str]], filters: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate execution summary report data"""
    
    # Build WHERE clause for date range
    where_conditions = ["project_id = %s"]
    params = [project_id]
    
    if date_range and date_range.get("start_date") and date_range.get("end_date"):
        where_conditions.append("started_at BETWEEN %s AND %s")
        params.extend([date_range["start_date"], date_range["end_date"]])
    
    where_clause = " WHERE " + " AND ".join(where_conditions)
    
    # Get execution summary
    summary = fetch_one(
        f"""
        SELECT 
            COUNT(*) as total_executions,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_executions,
            COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_executions,
            COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_executions,
            AVG(duration_ms) as avg_duration_ms,
            SUM(total_tests) as total_tests,
            SUM(passed_tests) as total_passed,
            SUM(failed_tests) as total_failed,
            SUM(skipped_tests) as total_skipped,
            MIN(started_at) as first_execution,
            MAX(started_at) as last_execution
        FROM test_executions
        {where_clause}
        """,
        tuple(params)
    )
    
    # Get recent executions
    recent_executions = fetch_all(
        f"""
        SELECT id, status, started_at, completed_at, duration_ms,
               total_tests, passed_tests, failed_tests, skipped_tests
        FROM test_executions
        {where_clause}
        ORDER BY started_at DESC
        LIMIT 10
        """,
        tuple(params)
    )
    
    return {
        "summary": dict(summary) if summary else {},
        "recent_executions": [dict(exec) for exec in recent_executions],
        "generated_at": datetime.utcnow().isoformat(),
        "project_id": project_id
    }

async def generate_test_coverage(project_id: str, date_range: Optional[Dict[str, str]], filters: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate test coverage report data"""
    
    # Get test coverage from view
    coverage_data = fetch_all(
        """
        SELECT * FROM v_test_coverage
        WHERE test_suite_id IN (
            SELECT id FROM test_suites WHERE project_id = %s
        )
        """,
        (project_id,)
    )
    
    # Get test case breakdown by type
    type_breakdown = fetch_all(
        """
        SELECT test_type, COUNT(*) as count, 
               COUNT(CASE WHEN is_automated = true THEN 1 END) as automated
        FROM test_cases
        WHERE test_suite_id IN (
            SELECT id FROM test_suites WHERE project_id = %s
        )
        GROUP BY test_type
        """,
        (project_id,)
    )
    
    return {
        "coverage_by_suite": [dict(data) for data in coverage_data],
        "coverage_by_type": [dict(data) for data in type_breakdown],
        "generated_at": datetime.utcnow().isoformat(),
        "project_id": project_id
    }

async def generate_trends_report(project_id: str, date_range: Optional[Dict[str, str]], filters: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate trends report data"""
    
    # Get daily execution trends
    daily_trends = fetch_all(
        """
        SELECT 
            DATE(started_at) as date,
            COUNT(*) as executions,
            SUM(total_tests) as total_tests,
            SUM(passed_tests) as passed_tests,
            SUM(failed_tests) as failed_tests,
            AVG(duration_ms) as avg_duration
        FROM test_executions
        WHERE project_id = %s
        AND started_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(started_at)
        ORDER BY date DESC
        """,
        (project_id,)
    )
    
    return {
        "daily_trends": [dict(trend) for trend in daily_trends],
        "generated_at": datetime.utcnow().isoformat(),
        "project_id": project_id
    }

async def generate_performance_report(project_id: str, date_range: Optional[Dict[str, str]], filters: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate performance report data"""
    
    # Get performance metrics
    performance_data = fetch_all(
        """
        SELECT 
            id,
            started_at,
            duration_ms,
            total_tests,
            passed_tests,
            failed_tests,
            environment,
            browser
        FROM test_executions
        WHERE project_id = %s
        AND status = 'completed'
        AND duration_ms IS NOT NULL
        ORDER BY started_at DESC
        LIMIT 100
        """,
        (project_id,)
    )
    
    return {
        "performance_metrics": [dict(data) for data in performance_data],
        "generated_at": datetime.utcnow().isoformat(),
        "project_id": project_id
    }

@router.get("/{report_id}", response_model=Report)
async def get_report(report_id: str, authorization: str = None):
    """Get specific report by ID"""
    user_id = await get_current_user_id(authorization)
    
    report = fetch_one(
        """
        SELECT id, project_id, execution_id, name, description, report_type, format,
               status, file_path, file_size, download_url, metadata, created_by,
               created_at, updated_at
        FROM reports
        WHERE id = %s AND created_by = %s
        """,
        (report_id, user_id)
    )
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    report_data = dict(report)
    report_data['metadata'] = report_data['metadata'] or {}
    return Report(**report_data)

@router.put("/{report_id}", response_model=Report)
async def update_report(report_id: str, report_update: ReportUpdate, authorization: str = None):
    """Update existing report"""
    user_id = await get_current_user_id(authorization)
    
    # Check if report exists and belongs to user
    existing_report = fetch_one(
        "SELECT id FROM reports WHERE id = %s AND created_by = %s",
        (report_id, user_id)
    )
    
    if not existing_report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Build UPDATE dynamically
    update_fields = []
    params = []
    
    if report_update.name is not None:
        update_fields.append("name = %s")
        params.append(report_update.name)
    
    if report_update.description is not None:
        update_fields.append("description = %s")
        params.append(report_update.description)
    
    if report_update.status is not None:
        update_fields.append("status = %s")
        params.append(report_update.status)
    
    if report_update.file_path is not None:
        update_fields.append("file_path = %s")
        params.append(report_update.file_path)
    
    if report_update.file_size is not None:
        update_fields.append("file_size = %s")
        params.append(report_update.file_size)
    
    if report_update.download_url is not None:
        update_fields.append("download_url = %s")
        params.append(report_update.download_url)
    
    if report_update.metadata is not None:
        update_fields.append("metadata = %s")
        params.append(json.dumps(report_update.metadata))
    
    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Add updated_at and report_id
    update_fields.append("updated_at = %s")
    params.append(datetime.utcnow())
    params.append(report_id)
    
    sql = f"""
    UPDATE reports 
    SET {', '.join(update_fields)}
    WHERE id = %s
    """
    
    try:
        execute(sql, tuple(params))
        
        # Fetch updated report
        updated_report = fetch_one(
            """
            SELECT id, project_id, execution_id, name, description, report_type, format,
                   status, file_path, file_size, download_url, metadata, created_by,
                   created_at, updated_at
            FROM reports WHERE id = %s
            """,
            (report_id,)
        )
        
        report_data = dict(updated_report)
        report_data['metadata'] = report_data['metadata'] or {}
        return Report(**report_data)
        
    except Exception as e:
        print(f"Error updating report: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update report: {str(e)}"
        )

@router.delete("/{report_id}")
async def delete_report(report_id: str, authorization: str = None):
    """Delete report"""
    user_id = await get_current_user_id(authorization)
    
    # Check if report exists and belongs to user
    existing_report = fetch_one(
        "SELECT id, file_path FROM reports WHERE id = %s AND created_by = %s",
        (report_id, user_id)
    )
    
    if not existing_report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    try:
        # In a real implementation, you would delete the file from storage
        # For now, we'll just delete the database record
        
        execute("DELETE FROM reports WHERE id = %s", (report_id,))
        
        return {"message": "Report deleted successfully"}
        
    except Exception as e:
        print(f"Error deleting report: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete report: {str(e)}"
        )

@router.get("/{report_id}/download")
async def download_report(report_id: str, authorization: str = None):
    """Download report file"""
    user_id = await get_current_user_id(authorization)
    
    report = fetch_one(
        "SELECT id, name, format, file_path, download_url, status FROM reports WHERE id = %s AND created_by = %s",
        (report_id, user_id)
    )
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    if report['status'] != 'completed':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Report is not ready for download"
        )
    
    if not report['file_path']:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report file not found"
        )
    
    # In a real implementation, you would:
    # 1. Stream the file from storage (S3, Vercel, etc.)
    # 2. Return appropriate headers for download
    # 3. Handle different file types
    
    return {
        "message": "Download endpoint - implement file streaming",
        "report_id": report_id,
        "file_path": report['file_path'],
        "format": report['format'],
        "download_url": f"/files/reports/{report_id}.{report['format']}"
    }

@router.post("/{report_id}/export")
async def export_report(report_id: str, format: str = "json", authorization: str = None):
    """Export report in different format"""
    user_id = await get_current_user_id(authorization)
    
    report = fetch_one(
        """
        SELECT id, name, report_type, metadata, status
        FROM reports 
        WHERE id = %s AND created_by = %s
        """,
        (report_id, user_id)
    )
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    if report['status'] != 'completed':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Report is not ready for export"
        )
    
    # Convert to requested format
    metadata = report['metadata'] or {}
    
    if format == "json":
        return {
            "report_id": report_id,
            "name": report['name'],
            "type": report['report_type'],
            "data": metadata,
            "exported_at": datetime.utcnow().isoformat()
        }
    elif format == "csv":
        # Convert to CSV format (simplified)
        return {
            "message": "CSV export - implement CSV conversion",
            "data": metadata
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported export format: {format}"
        )
