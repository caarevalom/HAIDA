import os, logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.logging import setup_logging
from app.core.middleware import RequestIdMiddleware
from app.core.cors import setup_cors

setup_logging()
app = FastAPI(title=os.environ.get("APP_NAME", "HAIDA"))

# CORS
setup_cors(app, os.environ)
# Request ID
app.add_middleware(RequestIdMiddleware, header_name=os.environ.get("REQUEST_ID_HEADER", "X-Request-Id"))

# Handlers
@app.exception_handler(Exception)
async def unhandled_exc_handler(request: Request, exc: Exception):
    req_id = getattr(request.state, "request_id", None)
    logging.getLogger("haida.error").error("Unhandled exception", extra={"extra": {"correlationId": req_id, "path": request.url.path}})
    return JSONResponse(status_code=500, content={"error": "internal_error", "message": "Ha ocurrido un error inesperado", "correlationId": req_id})

from fastapi import HTTPException
@app.exception_handler(HTTPException)
async def http_exc_handler(request: Request, exc: HTTPException):
    req_id = getattr(request.state, "request_id", None)
    logging.getLogger("haida.http").warning(f"HTTP {exc.status_code}: {exc.detail}", extra={"extra": {"correlationId": req_id, "path": request.url.path}})
    return JSONResponse(status_code=exc.status_code, content={"error": "http_error", "message": exc.detail, "correlationId": req_id})

# Routers (sólo imports, Cline completará implementación)
from app.routes.system import router as system_router
from app.routes.auth import router as auth_router
from app.routes.entra import router as entra_router
from app.routes.docs import router as docs_router
from app.routes.flags import router as flags_router
from app.routes.chat import router as chat_router
from app.routes.projects import router as projects_router
from app.routes.scripts import router as scripts_router
from app.routes.runs import router as runs_router
from app.routes.notifications import router as notifications_router
from app.routes.reports import router as reports_router
from app.routes.files import router as files_router
from app.routes.i18n import router as i18n_router

# registro de routers
app.include_router(system_router, tags=["system"])
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(entra_router, prefix="/entra", tags=["entra"])
app.include_router(docs_router, prefix="/docs", tags=["docs"])
app.include_router(flags_router, prefix="/flags", tags=["flags"])
app.include_router(chat_router, prefix="/chat", tags=["chat"])
app.include_router(projects_router, prefix="/projects", tags=["projects"])
app.include_router(scripts_router, prefix="/scripts", tags=["scripts"])
app.include_router(runs_router, prefix="/script-runs", tags=["runs"])
app.include_router(notifications_router, prefix="/notifications", tags=["notifications"])
app.include_router(reports_router, prefix="/reports", tags=["reports"])
app.include_router(files_router, prefix="/files", tags=["files"])
app.include_router(i18n_router, prefix="/i18n", tags=["i18n"])

@app.get("/health")
def health():
    return {"status": "healthy", "version": "2.0.0"}
