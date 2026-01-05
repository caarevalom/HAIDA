"""Telegram Bot Integration for HAIDA"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import os
import httpx
import logging
from app.core.supabase_client import get_supabase_client

router = APIRouter()
logger = logging.getLogger("haida.telegram")

# Telegram Configuration
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")
TELEGRAM_API_URL = "https://api.telegram.org"

TELEGRAM_CONFIGURED = bool(TELEGRAM_BOT_TOKEN)

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

        # Send acknowledgment
        response_text = f"Recibido tu mensaje: _{text[:30]}..._"
        await _send_telegram_message(str(chat_id), response_text)

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

    success = await _send_telegram_message(TELEGRAM_CHAT_ID, message)

    if not success:
        raise HTTPException(status_code=500, detail="Failed to send notification")

    return {"status": "sent", "event_type": event_type}

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
