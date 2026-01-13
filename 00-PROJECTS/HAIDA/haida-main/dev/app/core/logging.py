import logging, json, os, sys
from datetime import datetime

class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "ts": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
            "module": record.module,
            "func": record.funcName,
            "line": record.lineno,
        }
        # Extra fields (correlationId, user, tenant) si existen
        if hasattr(record, "extra"):
            payload.update(record.extra)  # dict con claves conocidas
        return json.dumps(payload, ensure_ascii=False)

def setup_logging():
    level = os.environ.get("LOG_LEVEL", "INFO").upper()
    json_enabled = os.environ.get("LOG_JSON", "true").lower() == "true"
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, level, logging.INFO))
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(getattr(logging, level, logging.INFO))
    handler.setFormatter(JsonFormatter() if json_enabled else logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s"))
    logger.handlers = [handler]  # Evitar duplicados
