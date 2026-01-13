"""Telegram Bot Integration for HAIDA"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, Dict, Any, List, Tuple
from datetime import datetime
import os
import httpx
import logging
from app.core.supabase_client import get_supabase_client
from app.core.db import fetch_all, fetch_one
from app.core.jwt_auth import verify_jwt

router = APIRouter()
logger = logging.getLogger("haida.telegram")

# Telegram Configuration
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")
TELEGRAM_API_URL = "https://api.telegram.org"

TELEGRAM_CONFIGURED = bool(TELEGRAM_BOT_TOKEN)
ROLE_LEVELS = {"viewer": 1, "developer": 2, "qa_engineer": 3, "admin": 4}
EVENT_TYPES = {"test_completed", "test_failed", "deployment", "alert"}
DEFAULT_LIMIT = 5

class TelegramMessage(BaseModel):
    chat_id: str
    text: str
    parse_mode: Optional[str] = "Markdown"
    disable_web_page_preview: Optional[bool] = True

class TelegramUpdate(BaseModel):
    update_id: int
    message: Optional[Dict[str, Any]] = None
    edited_message: Optional[Dict[str, Any]] = None

class BotStatus(BaseModel):
    configured: bool
    bot_token_set: bool
    chat_id_set: bool
    webhook_configured: bool

def _parse_command(text: str) -> Tuple[Optional[str], List[str]]:
    if not text or not text.startswith("/"):
        return None, []
    parts = text.strip().split()
    command = parts[0][1:].split("@")[0].lower()
    return command, parts[1:]

def _role_allows(role: str, required: str) -> bool:
    return ROLE_LEVELS.get(role or "viewer", 0) >= ROLE_LEVELS.get(required, 0)

async def _get_linked_user(supabase, chat_id: str) -> Optional[Dict[str, Any]]:
    try:
        result = supabase.table("telegram_users")\
            .select("*")\
            .eq("chat_id", str(chat_id))\
            .eq("is_active", True)\
            .limit(1)\
            .execute()
        return result.data[0] if result.data else None
    except Exception:
        return None

def _resolve_tenant_id(supabase, user_id: str, payload: Dict[str, Any]) -> Optional[str]:
    tenant_id = payload.get("tenant_id") or os.environ.get("DEFAULT_TENANT_ID")
    if tenant_id:
        return tenant_id
    try:
        result = supabase.table("tenant_members")\
            .select("tenant_id")\
            .eq("user_id", user_id)\
            .limit(1)\
            .execute()
        if result.data:
            return result.data[0].get("tenant_id")
    except Exception:
        return None
    return None

def _get_user_role(supabase, user_id: str, payload: Dict[str, Any]) -> str:
    if payload.get("role"):
        return payload.get("role")
    try:
        result = supabase.table("users")\
            .select("role")\
            .eq("id", user_id)\
            .limit(1)\
            .execute()
        if result.data:
            return result.data[0].get("role") or "viewer"
    except Exception:
        return "viewer"
    return "viewer"

async def _upsert_linked_user(
    supabase,
    chat_id: str,
    telegram_user_id: Optional[str],
    telegram_username: Optional[str],
    display_name: Optional[str],
    payload: Dict[str, Any],
    token: str,
) -> Tuple[bool, str]:
    user_id = payload.get("sub")
    if not user_id:
        return False, "Token sin user_id"
    tenant_id = _resolve_tenant_id(supabase, user_id, payload)
    if not tenant_id:
        return False, "Tenant no disponible. Define DEFAULT_TENANT_ID."

    role = _get_user_role(supabase, user_id, payload)
    now = datetime.utcnow().isoformat()
    data = {
        "chat_id": str(chat_id),
        "telegram_user_id": str(telegram_user_id) if telegram_user_id else None,
        "telegram_username": telegram_username,
        "telegram_display_name": display_name,
        "user_id": user_id,
        "tenant_id": tenant_id,
        "role": role,
        "access_token": token,
        "token_expires_at": payload.get("exp"),
        "is_active": True,
        "linked_at": now,
        "updated_at": now,
    }
    try:
        supabase.table("telegram_users").upsert(data).execute()
        return True, f"Vinculado como {role}"
    except Exception as exc:
        return False, f"No se pudo vincular: {exc}"

async def _set_subscription(
    supabase,
    chat_id: str,
    tenant_id: str,
    event_type: str,
    active: bool,
) -> bool:
    now = datetime.utcnow().isoformat()
    payload = {
        "chat_id": str(chat_id),
        "tenant_id": tenant_id,
        "event_type": event_type,
        "is_active": active,
        "updated_at": now,
    }
    try:
        supabase.table("telegram_subscriptions").upsert(payload).execute()
        return True
    except Exception:
        return False

def _format_list(items: List[str]) -> str:
    return "\n".join(f"- {item}" for item in items)

def _help_text() -> str:
    return "\n".join(
        [
            "*HAIDA Bot*",
            "Comandos disponibles:",
            "/help - ayuda",
            "/status - estado bot/webhook",
            "/health - health API",
            "/version - version backend",
            "/link <token> - vincular usuario",
            "/unlink - desvincular",
            "/projects - listar proyectos",
            "/project <id|slug> - detalle",
            "/runs - ultimas ejecuciones",
            "/reports - ultimos reportes",
            "/subscribe <test_completed|test_failed|deployment|alert>",
            "/unsubscribe <evento|all>",
            "/subscriptions - ver suscripciones",
        ]
    )

async def _list_projects(user: Dict[str, Any]) -> List[Dict[str, Any]]:
    is_admin = _role_allows(user.get("role", "viewer"), "admin")
    user_id = user.get("user_id")
    try:
        if is_admin:
            sql = "SELECT id, name, status, base_url FROM projects ORDER BY created_at DESC LIMIT %s"
            return fetch_all(sql, (DEFAULT_LIMIT,)) or []
        sql = "SELECT id, name, status, base_url FROM projects WHERE owner_id = %s ORDER BY created_at DESC LIMIT %s"
        return fetch_all(sql, (user_id, DEFAULT_LIMIT)) or []
    except Exception:
        supabase = get_supabase_client()
        query = supabase.table("projects").select("id,name,status,base_url").order("created_at", desc=True).limit(DEFAULT_LIMIT)
        if not is_admin and user_id:
            query = query.eq("owner_id", user_id)
        result = query.execute()
        return result.data or []

async def _list_runs(user: Dict[str, Any]) -> List[Dict[str, Any]]:
    is_admin = _role_allows(user.get("role", "viewer"), "admin")
    user_id = user.get("user_id")
    try:
        if is_admin:
            sql = """SELECT te.id, te.status, te.environment, te.total_tests, te.failed_tests, p.name AS project_name
                     FROM test_executions te
                     LEFT JOIN projects p ON te.project_id = p.id
                     ORDER BY te.started_at DESC LIMIT %s"""
            return fetch_all(sql, (DEFAULT_LIMIT,)) or []
        sql = """SELECT te.id, te.status, te.environment, te.total_tests, te.failed_tests, p.name AS project_name
                 FROM test_executions te
                 LEFT JOIN projects p ON te.project_id = p.id
                 WHERE p.owner_id = %s
                 ORDER BY te.started_at DESC LIMIT %s"""
        return fetch_all(sql, (user_id, DEFAULT_LIMIT)) or []
    except Exception:
        return []

async def _list_reports(user: Dict[str, Any]) -> List[Dict[str, Any]]:
    tenant_id = user.get("tenant_id")
    user_id = user.get("user_id")
    if not tenant_id:
        return []
    try:
        sql = """SELECT id, name, report_type, status, format, created_at
                 FROM reports WHERE tenant_id = %s AND created_by = %s
                 ORDER BY created_at DESC LIMIT %s"""
        return fetch_all(sql, (tenant_id, user_id, DEFAULT_LIMIT)) or []
    except Exception:
        return []

async def _send_telegram_message(chat_id: str, text: str, parse_mode: str = "Markdown") -> bool:
    """Send message to Telegram chat"""
    if not TELEGRAM_BOT_TOKEN:
        logger.warning("Telegram bot token not configured")
        return False

    try:
        url = f"{TELEGRAM_API_URL}/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": parse_mode,
            "disable_web_page_preview": True,
        }

        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            result = response.json()

            if result.get("ok"):
                logger.info(f"Message sent to Telegram chat {chat_id}")
                return True
            else:
                logger.error(f"Telegram API error: {result.get('description')}")
                return False

    except httpx.HTTPError as e:
        logger.error(f"Telegram connection error: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Error sending Telegram message: {str(e)}")
        return False

async def _get_telegram_webhook_info() -> Dict[str, Any]:
    """Get webhook information from Telegram"""
    if not TELEGRAM_BOT_TOKEN:
        return {"error": "Telegram bot token not configured"}

    try:
        url = f"{TELEGRAM_API_URL}/bot{TELEGRAM_BOT_TOKEN}/getWebhookInfo"
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(url)
            response.raise_for_status()
            result = response.json()
            return result.get("result", {})
    except Exception as e:
        logger.error(f"Error getting webhook info: {str(e)}")
        return {"error": str(e)}

async def _set_telegram_webhook(webhook_url: str) -> bool:
    """Set webhook URL for Telegram bot"""
    if not TELEGRAM_BOT_TOKEN:
        logger.warning("Telegram bot token not configured")
        return False

    try:
        url = f"{TELEGRAM_API_URL}/bot{TELEGRAM_BOT_TOKEN}/setWebhook"
        payload = {
            "url": webhook_url,
            "allowed_updates": ["message", "edited_message", "callback_query"],
        }

        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            result = response.json()

            if result.get("ok"):
                logger.info(f"Telegram webhook set to {webhook_url}")
                return True
            else:
                logger.error(f"Telegram webhook error: {result.get('description')}")
                return False

    except httpx.HTTPError as e:
        logger.error(f"Telegram webhook connection error: {str(e)}")
        return False

def _escape_telegram_text(text: str) -> str:
    """Escape special characters for Telegram Markdown"""
    # Escape special characters for Markdown
    special_chars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!']
    for char in special_chars:
        text = text.replace(char, f'\\{char}')
    return text

async def _handle_command(
    chat_id: str,
    telegram_user_id: Optional[str],
    telegram_username: Optional[str],
    display_name: Optional[str],
    text: str,
) -> str:
    command, args = _parse_command(text)
    if not command:
        return "Mensaje recibido."

    if command in {"start", "help"}:
        return _help_text()

    if command == "link":
        if not args:
            return "Uso: /link <token>"
        token = args[0]
        supabase = get_supabase_client()
        try:
            payload = verify_jwt(token, os.environ.get("JWT_SECRET", "change_me_super_secret"))
        except Exception:
            return "Token invalido."
        ok, message = await _upsert_linked_user(
            supabase,
            chat_id,
            telegram_user_id,
            telegram_username,
            display_name,
            payload,
            token,
        )
        return message if ok else f"Error: {message}"

    supabase = get_supabase_client()
    linked = await _get_linked_user(supabase, chat_id)
    if command in {"unlink", "whoami"} and not linked:
        return "No estas vinculado. Usa /link <token>."

    if command == "unlink":
        try:
            supabase.table("telegram_users").update({"is_active": False}).eq("chat_id", str(chat_id)).execute()
            return "Cuenta desvinculada."
        except Exception:
            return "No se pudo desvincular."

    if command == "status":
        webhook_info = await _get_telegram_webhook_info()
        url = webhook_info.get("url") or "not set"
        return f"Bot: {'OK' if TELEGRAM_CONFIGURED else 'NO'}\nWebhook: {url}"

    if command == "health":
        return "Health: consulta /health via backend."

    if command == "version":
        return f"Version: {os.environ.get('APP_VERSION', 'unknown')}"

    if not linked:
        return "Vincula tu cuenta con /link <token> para usar este comando."

    role = linked.get("role") or "viewer"
    if command == "projects":
        if not _role_allows(role, "viewer"):
            return "Permiso denegado."
        projects = await _list_projects(linked)
        if not projects:
            return "No hay proyectos."
        items = [
            f"{p.get('name')} ({p.get('status')}) - {p.get('base_url')}"
            for p in projects
        ]
        return _format_list(items)

    if command == "project":
        if not args:
            return "Uso: /project <id|slug>"
        value = args[0]
        try:
            row = fetch_one(
                "SELECT id, name, status, base_url FROM projects WHERE id::text = %s OR slug = %s",
                (value, value),
            )
        except Exception:
            row = None
        if not row:
            return "Proyecto no encontrado."
        return f"{row.get('name')} ({row.get('status')}) - {row.get('base_url')}"

    if command == "runs":
        runs = await _list_runs(linked)
        if not runs:
            return "No hay ejecuciones recientes."
        items = [
            f"{r.get('project_name')}: {r.get('status')} (fail {r.get('failed_tests')}/{r.get('total_tests')})"
            for r in runs
        ]
        return _format_list(items)

    if command == "reports":
        reports = await _list_reports(linked)
        if not reports:
            return "No hay reportes recientes."
        items = [
            f"{r.get('name')} [{r.get('report_type')}] ({r.get('status')})"
            for r in reports
        ]
        return _format_list(items)

    if command == "subscribe":
        if not args:
            return f"Uso: /subscribe <{', '.join(sorted(EVENT_TYPES))}>"
        event = args[0]
        if event not in EVENT_TYPES:
            return f"Evento invalido: {event}"
        ok = await _set_subscription(supabase, chat_id, linked.get("tenant_id"), event, True)
        return "Suscrito." if ok else "No se pudo suscribir."

    if command == "unsubscribe":
        if not args:
            return "Uso: /unsubscribe <evento|all>"
        event = args[0]
        if event == "all":
            try:
                supabase.table("telegram_subscriptions")\
                    .update({"is_active": False})\
                    .eq("chat_id", str(chat_id))\
                    .execute()
                return "Suscripciones desactivadas."
            except Exception:
                return "No se pudo actualizar."
        if event not in EVENT_TYPES:
            return f"Evento invalido: {event}"
        ok = await _set_subscription(supabase, chat_id, linked.get("tenant_id"), event, False)
        return "Suscripcion removida." if ok else "No se pudo remover."

    if command == "subscriptions":
        try:
            result = supabase.table("telegram_subscriptions")\
                .select("event_type,is_active")\
                .eq("chat_id", str(chat_id))\
                .eq("is_active", True)\
                .execute()
            items = [row.get("event_type") for row in (result.data or [])]
            return "Suscripciones activas:\n" + _format_list(items) if items else "Sin suscripciones."
        except Exception:
            return "No se pudo leer suscripciones."

    return "Comando no reconocido. Usa /help."

@router.get("/status", response_model=BotStatus)
async def status():
    """Get Telegram bot status"""
    webhook_info = await _get_telegram_webhook_info()
    webhook_configured = bool(webhook_info.get("url"))

    return BotStatus(
        configured=TELEGRAM_CONFIGURED,
        bot_token_set=bool(TELEGRAM_BOT_TOKEN),
        chat_id_set=bool(TELEGRAM_CHAT_ID),
        webhook_configured=webhook_configured
    )

@router.post("/webhook")
async def webhook(update: TelegramUpdate):
    """Telegram webhook endpoint for receiving messages"""
    if not TELEGRAM_BOT_TOKEN:
        raise HTTPException(status_code=501, detail="Telegram bot not configured")

    try:
        # Process message
        message = update.message or update.edited_message
        if not message:
            return {"status": "ok"}

        chat_id = message.get("chat", {}).get("id")
        text = message.get("text", "")
        from_user = message.get("from", {})
        user_id = from_user.get("id")
        user_name = from_user.get("first_name", "Unknown")

        if not chat_id or not text:
            return {"status": "ok"}

        logger.info(f"Telegram message from {user_name} ({user_id}): {text[:50]}")

        # Store message in database
        supabase = get_supabase_client()
        try:
            payload = {
                "chat_id": str(chat_id),
                "user_id": str(user_id),
                "user_name": user_name,
                "text": text,
                "message_type": "user",
                "created_at": datetime.utcnow().isoformat(),
            }
            supabase.table("telegram_messages").insert(payload).execute()
        except Exception as e:
            logger.warning(f"Could not store message in database: {str(e)}")

        response_text = await _handle_command(
            str(chat_id),
            str(user_id) if user_id else None,
            from_user.get("username"),
            user_name,
            text,
        )
        safe_text = _escape_telegram_text(response_text)
        await _send_telegram_message(str(chat_id), safe_text)

        return {"status": "ok"}

    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        return {"status": "error", "message": str(e)}

@router.post("/send")
async def send_message(message: TelegramMessage):
    """Send message via Telegram bot"""
    if not TELEGRAM_BOT_TOKEN:
        raise HTTPException(status_code=501, detail="Telegram bot not configured")

    success = await _send_telegram_message(
        message.chat_id,
        message.text,
        message.parse_mode or "Markdown"
    )

    if not success:
        raise HTTPException(
            status_code=500,
            detail="Failed to send Telegram message"
        )

    return {"status": "sent", "chat_id": message.chat_id}

@router.post("/webhook/set")
async def set_webhook(request: Request):
    """Set webhook URL for Telegram bot"""
    if not TELEGRAM_BOT_TOKEN:
        raise HTTPException(status_code=501, detail="Telegram bot not configured")

    body = await request.json()
    webhook_url = body.get("webhook_url")

    if not webhook_url:
        raise HTTPException(status_code=400, detail="webhook_url required")

    success = await _set_telegram_webhook(webhook_url)

    if not success:
        raise HTTPException(
            status_code=500,
            detail="Failed to set Telegram webhook"
        )

    webhook_info = await _get_telegram_webhook_info()
    return {
        "status": "set",
        "webhook_url": webhook_url,
        "webhook_info": webhook_info
    }

@router.get("/webhook/info")
async def get_webhook_info():
    """Get current webhook information"""
    if not TELEGRAM_BOT_TOKEN:
        raise HTTPException(status_code=501, detail="Telegram bot not configured")

    webhook_info = await _get_telegram_webhook_info()
    return webhook_info

@router.post("/notifications/{tenant_id}/{event_type}")
async def send_notification(tenant_id: str, event_type: str, data: Dict[str, Any]):
    """Send notification to Telegram for specific events"""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        raise HTTPException(status_code=501, detail="Telegram notifications not configured")

    # Format message based on event type
    message = f"🔔 *HAIDA Notification* - {event_type}\n\n"

    if event_type == "test_completed":
        message += f"✅ Test Suite Completed\n"
        message += f"Project: {data.get('project_name', 'N/A')}\n"
        message += f"Tests Run: {data.get('tests_run', 0)}\n"
        message += f"Passed: {data.get('tests_passed', 0)}\n"
        message += f"Failed: {data.get('tests_failed', 0)}\n"
        message += f"Duration: {data.get('duration', 'N/A')}s"

    elif event_type == "test_failed":
        message += f"❌ Test Failed\n"
        message += f"Project: {data.get('project_name', 'N/A')}\n"
        message += f"Test: {data.get('test_name', 'N/A')}\n"
        message += f"Error: {data.get('error_message', 'Unknown error')}"

    elif event_type == "deployment":
        message += f"🚀 Deployment Notification\n"
        message += f"Environment: {data.get('environment', 'N/A')}\n"
        message += f"Status: {data.get('status', 'N/A')}\n"
        message += f"Version: {data.get('version', 'N/A')}"

    elif event_type == "alert":
        message += f"⚠️ Alert\n"
        message += f"Severity: {data.get('severity', 'N/A')}\n"
        message += f"Message: {data.get('message', 'N/A')}"

    else:
        message += f"Data: {str(data)[:200]}"

    supabase = get_supabase_client()
    recipients: List[str] = []
    try:
        result = supabase.table("telegram_subscriptions")\
            .select("chat_id")\
            .eq("tenant_id", tenant_id)\
            .eq("event_type", event_type)\
            .eq("is_active", True)\
            .execute()
        recipients = [row.get("chat_id") for row in (result.data or []) if row.get("chat_id")]
    except Exception:
        recipients = []

    if not recipients and TELEGRAM_CHAT_ID:
        recipients = [TELEGRAM_CHAT_ID]

    if not recipients:
        raise HTTPException(status_code=500, detail="No Telegram recipients configured")

    for chat in recipients:
        success = await _send_telegram_message(str(chat), message)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to send notification")

    return {"status": "sent", "event_type": event_type, "recipients": len(recipients)}

@router.get("/messages/{chat_id}")
async def get_messages(chat_id: str, limit: int = 10):
    """Get messages from a specific Telegram chat"""
    if not TELEGRAM_BOT_TOKEN:
        raise HTTPException(status_code=501, detail="Telegram bot not configured")

    supabase = get_supabase_client()
    try:
        result = supabase.table("telegram_messages")\
            .select("*")\
            .eq("chat_id", chat_id)\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()

        messages = result.data or []
        return {
            "chat_id": chat_id,
            "count": len(messages),
            "messages": messages
        }
    except Exception as e:
        logger.error(f"Error fetching messages: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch messages")
