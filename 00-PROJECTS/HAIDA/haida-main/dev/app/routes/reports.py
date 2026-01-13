"""Reports endpoints"""
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
import uuid

from app.core.db import fetch_one, fetch_all, execute
from app.core.request_context import get_tenant_id, get_user_id
from app.core.tenants import require_tenant_membership
from app.core.supabase_client import get_supabase_client

router = APIRouter()

class Report(BaseModel):
    id: str
    tenant_id: str
    template_id: Optional[str]
    name: str
    description: Optional[str]
    report_type: str
    status: str
    format: str
    file_url: Optional[str]
    parameters: dict
    data: dict
    generated_at: Optional[datetime]
    created_by: Optional[str]
    created_at: datetime
    updated_at: datetime

class ReportCreate(BaseModel):
    project_id: str
    report_type: str = "execution_summary"
    format: str = "html"
    name: Optional[str] = None
    description: Optional[str] = None
    date_range: Optional[Dict[str, str]] = None
    filters: Optional[Dict[str, Any]] = None

class ReportUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    file_url: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    data: Optional[Dict[str, Any]] = None

class ReportListResponse(BaseModel):
    reports: List[Report]
    total: int
    page: int
    per_page: int

class ReportGenerationRequest(BaseModel):
    project_id: str
    report_type: str
    format: str = "html"
    date_range: Optional[Dict[str, str]] = None
    filters: Optional[Dict[str, Any]] = None

SUPPORTED_FORMATS = {"html", "json"}

def _json_safe(value):
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, dict):
        return {k: _json_safe(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_json_safe(v) for v in value]
    return value


def render_report_html(report_name: str, report_type: str, data: Dict[str, Any]) -> str:
    summary = data.get("summary", {})
    chart = data.get("chart_data", [])
    trends = data.get("daily_trends", [])

    chart_rows = "".join(
        f"<div class='bar'><span>{item['label']}</span><div style='width:{item['value']}%'></div><em>{item['value']}%</em></div>"
        for item in chart
    )

    trend_rows = "".join(
        f"<tr><td>{item.get('date')}</td><td>{item.get('executions', 0)}</td><td>{item.get('passed_tests', 0)}</td><td>{item.get('failed_tests', 0)}</td></tr>"
        for item in trends
    )

    return f"""
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>{report_name}</title>
<style>
body {{ font-family: Arial, sans-serif; margin: 24px; color: #1b1b1b; }}
header {{ display: flex; justify-content: space-between; align-items: baseline; }}
section {{ margin-top: 24px; }}
.kpis {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }}
.kpi {{ border: 1px solid #e2e2e2; border-radius: 8px; padding: 12px; background: #fafafa; }}
.kpi h3 {{ margin: 0 0 6px; font-size: 12px; text-transform: uppercase; color: #666; }}
.kpi p {{ margin: 0; font-size: 20px; font-weight: bold; }}
.chart .bar {{ display: grid; grid-template-columns: 120px 1fr 60px; align-items: center; gap: 8px; margin-bottom: 8px; }}
.chart .bar div {{ height: 10px; background: #1f6feb; border-radius: 999px; }}
.chart .bar span {{ font-size: 12px; color: #444; }}
.chart .bar em {{ font-size: 12px; color: #444; text-align: right; }}
.table {{ width: 100%; border-collapse: collapse; }}
.table th, .table td {{ border: 1px solid #e2e2e2; padding: 8px; font-size: 12px; }}
.table th {{ background: #f0f0f0; text-align: left; }}
</style>
</head>
<body>
<header>
  <div>
    <h1>{report_name}</h1>
    <p>Tipo: {report_type}</p>
  </div>
  <div>
    <p>Generado: {data.get('generated_at')}</p>
  </div>
</header>
<section>
  <h2>Resumen</h2>
  <div class="kpis">
    <div class="kpi"><h3>Total ejecuciones</h3><p>{summary.get('total_executions', 0)}</p></div>
    <div class="kpi"><h3>Completadas</h3><p>{summary.get('completed_executions', 0)}</p></div>
    <div class="kpi"><h3>Fallidas</h3><p>{summary.get('failed_executions', 0)}</p></div>
    <div class="kpi"><h3>Promedio duracion</h3><p>{summary.get('avg_duration_ms', 0)} ms</p></div>
  </div>
</section>
<section class="chart">
  <h2>Distribucion de resultados</h2>
  {chart_rows or '<p>Sin datos suficientes.</p>'}
</section>
<section>
  <h2>Tendencias recientes</h2>
  <table class="table">
    <thead><tr><th>Fecha</th><th>Ejecuciones</th><th>Passed</th><th>Failed</th></tr></thead>
    <tbody>{trend_rows or '<tr><td colspan="4">Sin datos</td></tr>'}</tbody>
  </table>
</section>
</body>
</html>
"""


def _normalize_format(fmt: str) -> str:
    fmt = (fmt or "").lower()
    return fmt if fmt in SUPPORTED_FORMATS else "html"


@router.get("", response_model=ReportListResponse)
async def list_reports(
    request: Request,
    report_type: Optional[str] = None,
    status: Optional[str] = None,
    format: Optional[str] = None,
    page: int = 1,
    per_page: int = 20,
):
    """List reports with filters and pagination"""
    tenant_id = get_tenant_id(request)
    user_id = get_user_id(request)
    require_tenant_membership(tenant_id, user_id)

    where_conditions = ["tenant_id = %s", "created_by = %s"]
    params = [tenant_id, user_id]

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

    count_sql = f"SELECT COUNT(*) as total FROM reports{where_clause}"
    count_result = fetch_one(count_sql, tuple(params))
    total = count_result["total"] if count_result else 0

    offset = (page - 1) * per_page
    reports_sql = f"""
    SELECT id, tenant_id, template_id, name, description, report_type, status,
           format, file_url, parameters, data, generated_at, created_by,
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
        report_data["parameters"] = report_data.get("parameters") or {}
        report_data["data"] = report_data.get("data") or {}
        report_list.append(Report(**report_data))

    return ReportListResponse(reports=report_list, total=total, page=page, per_page=per_page)


@router.post("/generate", response_model=Report)
async def generate_report(request: Request, payload: ReportGenerationRequest):
    """Generate a new report"""
    tenant_id = get_tenant_id(request)
    user_id = get_user_id(request)
    require_tenant_membership(tenant_id, user_id)

    project = fetch_one(
        "SELECT id FROM projects WHERE id = %s AND tenant_id = %s",
        (payload.project_id, tenant_id)
    )
    if not project:
        raise HTTPException(status_code=403, detail="Access denied to project")

    report_id = str(uuid.uuid4())
    fmt = _normalize_format(payload.format)
    report_name = payload.name or f"{payload.report_type}_{fmt}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
    description = payload.description or f"Generated {payload.report_type} report"

    try:
        report_data = await generate_report_data(
            payload.project_id,
            payload.report_type,
            payload.date_range,
            payload.filters
        )
    except Exception as e:
        report_data = {"error": f"Report data unavailable: {str(e)}"}
    report_data = _json_safe(report_data)

    parameters = {
        "project_id": payload.project_id,
        "requested_format": payload.format,
        "report_type": payload.report_type,
        "date_range": payload.date_range or {},
        "filters": payload.filters or {},
    }

    insert_sql = """
    INSERT INTO reports
    (id, tenant_id, name, description, report_type, status, format, file_url,
     parameters, data, generated_at, created_by, created_at, updated_at)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    supabase = get_supabase_client()
    insert_payload = {
        "id": report_id,
        "tenant_id": tenant_id,
        "name": report_name,
        "description": description,
        "report_type": payload.report_type,
        "status": "generating",
        "format": fmt,
        "file_url": None,
        "parameters": parameters,
        "data": report_data,
        "generated_at": None,
        "created_by": user_id,
    }
    result = supabase.table("reports").insert(insert_payload).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Report creation failed")
    report = result.data[0]

    file_url = None
    if fmt == "html":
        bucket = request.headers.get("X-Reports-Bucket") or "haida-reports"
        storage_path = f"reports/{tenant_id}/{report_id}.html"
        html = render_report_html(report_name, payload.report_type, report_data)
        upload_result = supabase.storage.from_(bucket).upload(
            storage_path,
            html.encode("utf-8"),
            file_options={"content-type": "text/html; charset=utf-8"}
        )
        if getattr(upload_result, "error", None):
            raise HTTPException(status_code=500, detail="Report upload failed")
        file_url = storage_path

    update_payload = {
        "status": "completed",
        "file_url": file_url,
        "generated_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    updated = supabase.table("reports").update(update_payload).eq("id", report_id).execute()
    if updated.data:
        report = updated.data[0]
    report_data_db = dict(report)
    report_data_db["parameters"] = report_data_db.get("parameters") or {}
    report_data_db["data"] = report_data_db.get("data") or {}
    return Report(**report_data_db)


async def generate_report_data(project_id: str, report_type: str, date_range: Optional[Dict[str, str]], filters: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    if report_type == "execution_summary":
        return await generate_execution_summary(project_id, date_range, filters)
    if report_type == "test_coverage":
        return await generate_test_coverage(project_id, date_range, filters)
    if report_type == "trends":
        return await generate_trends_report(project_id, date_range, filters)
    if report_type == "performance":
        return await generate_performance_report(project_id, date_range, filters)
    return {"error": "Unsupported report type"}


async def generate_execution_summary(project_id: str, date_range: Optional[Dict[str, str]], filters: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    where_conditions = ["project_id = %s"]
    params = [project_id]

    if date_range and date_range.get("start_date") and date_range.get("end_date"):
        where_conditions.append("started_at BETWEEN %s AND %s")
        params.extend([date_range["start_date"], date_range["end_date"]])

    where_clause = " WHERE " + " AND ".join(where_conditions)

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

    summary_data = dict(summary) if summary else {}
    total_tests = summary_data.get("total_tests") or 0
    passed = summary_data.get("total_passed") or 0
    failed = summary_data.get("total_failed") or 0
    skipped = summary_data.get("total_skipped") or 0
    total = max(total_tests, 1)

    chart_data = [
        {"label": "Passed", "value": round((passed / total) * 100, 2)},
        {"label": "Failed", "value": round((failed / total) * 100, 2)},
        {"label": "Skipped", "value": round((skipped / total) * 100, 2)},
    ]

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
        "summary": summary_data,
        "recent_executions": [dict(exec) for exec in recent_executions],
        "chart_data": chart_data,
        "generated_at": datetime.utcnow().isoformat(),
        "project_id": project_id,
    }


async def generate_test_coverage(project_id: str, date_range: Optional[Dict[str, str]], filters: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    coverage_data = fetch_all(
        """
        SELECT * FROM v_test_coverage
        WHERE test_suite_id IN (
            SELECT id FROM test_suites WHERE project_id = %s
        )
        """,
        (project_id,)
    )

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

    chart_data = [
        {"label": row.get("test_type"), "value": row.get("count", 0)}
        for row in (type_breakdown or [])
    ]

    return {
        "coverage_by_suite": [dict(data) for data in coverage_data],
        "coverage_by_type": [dict(data) for data in type_breakdown],
        "chart_data": chart_data,
        "generated_at": datetime.utcnow().isoformat(),
        "project_id": project_id,
    }


async def generate_trends_report(project_id: str, date_range: Optional[Dict[str, str]], filters: Optional[Dict[str, Any]]) -> Dict[str, Any]:
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
        "project_id": project_id,
    }


async def generate_performance_report(project_id: str, date_range: Optional[Dict[str, str]], filters: Optional[Dict[str, Any]]) -> Dict[str, Any]:
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
        "project_id": project_id,
    }


@router.get("/{report_id}", response_model=Report)
async def get_report(request: Request, report_id: str):
    """Get specific report by ID"""
    tenant_id = get_tenant_id(request)
    user_id = get_user_id(request)
    require_tenant_membership(tenant_id, user_id)

    report = fetch_one(
        """
        SELECT id, tenant_id, template_id, name, description, report_type, status,
               format, file_url, parameters, data, generated_at, created_by,
               created_at, updated_at
        FROM reports
        WHERE id = %s AND tenant_id = %s AND created_by = %s
        """,
        (report_id, tenant_id, user_id)
    )

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report_data = dict(report)
    report_data["parameters"] = report_data.get("parameters") or {}
    report_data["data"] = report_data.get("data") or {}
    return Report(**report_data)


@router.put("/{report_id}", response_model=Report)
async def update_report(request: Request, report_id: str, report_update: ReportUpdate):
    """Update existing report"""
    tenant_id = get_tenant_id(request)
    user_id = get_user_id(request)
    require_tenant_membership(tenant_id, user_id)

    existing_report = fetch_one(
        "SELECT id FROM reports WHERE id = %s AND tenant_id = %s AND created_by = %s",
        (report_id, tenant_id, user_id)
    )

    if not existing_report:
        raise HTTPException(status_code=404, detail="Report not found")

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
    if report_update.file_url is not None:
        update_fields.append("file_url = %s")
        params.append(report_update.file_url)
    if report_update.parameters is not None:
        update_fields.append("parameters = %s")
        params.append(json.dumps(report_update.parameters))
    if report_update.data is not None:
        update_fields.append("data = %s")
        params.append(json.dumps(report_update.data))

    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_fields.append("updated_at = %s")
    params.append(datetime.utcnow())
    params.append(report_id)

    sql = f"UPDATE reports SET {', '.join(update_fields)} WHERE id = %s"
    execute(sql, tuple(params))

    updated_report = fetch_one(
        """
        SELECT id, tenant_id, template_id, name, description, report_type, status,
               format, file_url, parameters, data, generated_at, created_by,
               created_at, updated_at
        FROM reports WHERE id = %s
        """,
        (report_id,)
    )

    report_data = dict(updated_report)
    report_data["parameters"] = report_data.get("parameters") or {}
    report_data["data"] = report_data.get("data") or {}
    return Report(**report_data)


@router.delete("/{report_id}")
async def delete_report(request: Request, report_id: str):
    """Delete report"""
    tenant_id = get_tenant_id(request)
    user_id = get_user_id(request)
    require_tenant_membership(tenant_id, user_id)

    existing_report = fetch_one(
        "SELECT id FROM reports WHERE id = %s AND tenant_id = %s AND created_by = %s",
        (report_id, tenant_id, user_id)
    )

    if not existing_report:
        raise HTTPException(status_code=404, detail="Report not found")

    execute("DELETE FROM reports WHERE id = %s", (report_id,))
    return {"message": "Report deleted successfully"}


@router.get("/{report_id}/view")
async def view_report(request: Request, report_id: str):
    """Render report as HTML for in-app viewing"""
    report = await get_report(request, report_id)
    if report.format != "html" or not report.file_url:
        raise HTTPException(status_code=400, detail="Report not available for preview")

    supabase = get_supabase_client()
    bucket = request.headers.get("X-Reports-Bucket") or "haida-reports"
    data = supabase.storage.from_(bucket).download(report.file_url)
    if not data:
        raise HTTPException(status_code=404, detail="Report file not found")

    return HTMLResponse(content=data.decode("utf-8"), status_code=200)


@router.get("/{report_id}/download")
async def download_report(request: Request, report_id: str):
    """Download report file"""
    report = await get_report(request, report_id)

    if report.status != "completed":
        raise HTTPException(status_code=400, detail="Report is not ready for download")

    if report.format == "json":
        return {
            "report_id": report.id,
            "name": report.name,
            "type": report.report_type,
            "data": report.data,
            "downloaded_at": datetime.utcnow().isoformat(),
        }

    if not report.file_url:
        raise HTTPException(status_code=404, detail="Report file not found")

    supabase = get_supabase_client()
    bucket = request.headers.get("X-Reports-Bucket") or "haida-reports"
    expires_in = int(request.headers.get("X-Report-Url-Expires", "3600"))
    signed = supabase.storage.from_(bucket).create_signed_url(report.file_url, expires_in)
    signed_url = signed.get("signedURL") if isinstance(signed, dict) else None

    if not signed_url:
        raise HTTPException(status_code=500, detail="Failed to generate download URL")

    return {"download_url": signed_url, "expires_in": expires_in}


@router.post("/{report_id}/export")
async def export_report(request: Request, report_id: str, format: str = "json"):
    """Export report in different format"""
    report = await get_report(request, report_id)

    if report.status != "completed":
        raise HTTPException(status_code=400, detail="Report is not ready for export")

    data = report.data or {}

    if format == "json":
        return {
            "report_id": report.id,
            "name": report.name,
            "type": report.report_type,
            "data": data,
            "exported_at": datetime.utcnow().isoformat(),
        }

    if format == "csv":
        summary = data.get("summary", {})
        lines = ["metric,value"] + [f"{k},{summary.get(k, '')}" for k in summary.keys()]
        return {"csv": "\n".join(lines)}

    raise HTTPException(status_code=400, detail=f"Unsupported export format: {format}")
