from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import uuid

class RequestIdMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, header_name: str = "X-Request-Id"):
        super().__init__(app)
        self.header_name = header_name

    async def dispatch(self, request, call_next):
        req_id = request.headers.get(self.header_name) or str(uuid.uuid4())
        # Propagar en request.state
        request.state.request_id = req_id
        response: Response = await call_next(request)
        response.headers[self.header_name] = req_id
        return response
