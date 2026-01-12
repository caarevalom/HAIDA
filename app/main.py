import os, logging
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

# Load environment variables from .env file
load_dotenv()

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
    logging.getLogger("haida.error").error(
        "Unhandled exception",
        exc_info=True,
        extra={"extra": {"correlationId": req_id, "path": request.url.path}},
    )
    return JSONResponse(status_code=500, content={"error": "internal_error", "message": "Ha ocurrido un error inesperado", "correlationId": req_id})

from fastapi import HTTPException
@app.exception_handler(HTTPException)
async def http_exc_handler(request: Request, exc: HTTPException):
    req_id = getattr(request.state, "request_id", None)
    logging.getLogger("haida.http").warning(f"HTTP {exc.status_code}: {exc.detail}", extra={"extra": {"correlationId": req_id, "path": request.url.path}})
    return JSONResponse(status_code=exc.status_code, content={"error": "http_error", "message": exc.detail, "correlationId": req_id})

# Routers (sólo imports, Cline completará implementación)
# Import routers (only the ones that exist and work)
try:
    from app.routes.system import router as system_router
    app.include_router(system_router, tags=["system"])
    print("✅ System router loaded")
except ImportError as e:
    print(f"⚠️ System router not available: {e}")

try:
    from app.routes.auth import router as auth_router
    app.include_router(auth_router, prefix="/auth", tags=["auth"])
    print("✅ Auth router loaded")
except ImportError as e:
    print(f"⚠️ Auth router not available: {e}")

try:
    from app.routes.entra import router as entra_router
    app.include_router(entra_router, prefix="/entra", tags=["entra"])
    print("✅ Entra router loaded")
except ImportError as e:
    print(f"⚠️ Entra router not available: {e}")

# Optional routers - load if available
optional_routers = [
    ("docs", "/docs"),
    ("flags", "/flags"),
    ("chat", "/chat"),
    ("projects", "/projects"),
    ("scripts", "/scripts"),
    ("runs", "/script-runs"),
    ("notifications", "/notifications"),
    ("reports", "/reports"),
    ("files", "/files"),
    ("i18n", "/i18n"),
    ("admin", "/admin"),
]

for router_name, prefix in optional_routers:
    try:
        module = __import__(f"app.routes.{router_name}", fromlist=["router"])
        router = getattr(module, "router")
        app.include_router(router, prefix=prefix, tags=[router_name])
        print(f"✅ {router_name.capitalize()} router loaded")
    except (ImportError, AttributeError) as e:
        print(f"ℹ️ {router_name.capitalize()} router not available: {e}")

# Fallback health endpoint (no longer needed - system router handles it)
# System router already loaded above and provides /health endpoint

# Serve static frontend files (Vite build output)
# Get the absolute path to the dist folder (one level up from app directory, then into dist)
app_dir = Path(__file__).parent.parent
dist_dir = app_dir / "dist"

# Mount the static files
if dist_dir.exists():
    app.mount("/", StaticFiles(directory=str(dist_dir), html=True), name="static")
    logging.getLogger("haida").info(f"✅ Static files mounted from {dist_dir}")
else:
    logging.getLogger("haida").warning(f"⚠️ dist directory not found at {dist_dir}. Frontend files not available.")
