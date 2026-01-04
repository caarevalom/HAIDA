from fastapi import Request

def resolve_tenant_id(request: Request) -> str | None:
    # Convención: header 'X-Tenant-Id' o 'X-Workspace'
    return request.headers.get("X-Tenant-Id") or request.headers.get("X-Workspace")
