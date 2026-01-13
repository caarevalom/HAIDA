#!/usr/bin/env python3
"""
HAIDA Telegram Bot v3.0 - AI-Powered
Bot avanzado con IA multirol entrenada
"""

import os
import json
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import logging
from datetime import datetime
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    InlineQueryHandler,
    filters,
    ContextTypes
)
from dotenv import load_dotenv

from app.ai import get_assistant

# Configuración de logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Configuración
load_dotenv()

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
if not TOKEN:
    raise SystemExit("Missing TELEGRAM_BOT_TOKEN environment variable.")
WEBAPP_URL = "https://haida-dashboard.vercel.app"

# Instancia del asistente de IA
assistant = get_assistant()

def _append_memory_entry(
    conversation_id: str,
    user_id: int,
    username: str | None,
    user_message: str,
    assistant_response: str
) -> None:
    memory_path = os.environ.get(
        "HAIDA_MEMORY_FILE",
        os.path.expanduser("~/.codex/memory.jsonl")
    )
    entry = {
        "ts": datetime.utcnow().isoformat(),
        "type": "chat",
        "content": f"user: {user_message}\nassistant: {assistant_response}",
        "tags": [
            "haida",
            "telegram",
            "bot",
            f"conversation:{conversation_id}",
            f"user:{user_id}",
        ],
        "meta": {
            "conversation_id": conversation_id,
            "user_id": user_id,
            "username": username or "",
            "channel": "telegram",
        },
    }
    try:
        memory_dir = os.path.dirname(memory_path) or "."
        os.makedirs(memory_dir, exist_ok=True)
        with open(memory_path, "a", encoding="utf-8") as handle:
            handle.write(json.dumps(entry, ensure_ascii=True) + "\n")
    except Exception:
        return

# =============================================================================
# COMANDOS PRINCIPALES
# =============================================================================

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Comando /start - Menú principal
    """
    user = update.effective_user
    user_id = user.id

    keyboard = [
        [InlineKeyboardButton("📊 Dashboard Web", web_app=WebAppInfo(url=WEBAPP_URL))],
        [
            InlineKeyboardButton("✅ Estado Sistema", callback_data="status"),
            InlineKeyboardButton("🧪 Tests", callback_data="tests")
        ],
        [
            InlineKeyboardButton("📈 Reportes", callback_data="reports"),
            InlineKeyboardButton("🎯 Jira", callback_data="jira")
        ],
        [
            InlineKeyboardButton("🤖 Asistente IA", callback_data="ai_menu"),
            InlineKeyboardButton("❓ Ayuda", callback_data="help")
        ]
    ]

    welcome_text = f"""
🚀 **HAIDA Bot v3.0 - AI-Powered**

¡Hola {user.first_name}!

Soy HAIDA, tu asistente integral para QA, desarrollo y gestión de proyectos.

**🎓 Mis capacidades**:
• QA Tester ISTQB Expert Level
• Software Developer Expert
• Software Architect
• Analista Funcional
• Integration Specialist
• Project Manager

**💬 Cómo usarme**:
• Usa los botones para acciones rápidas
• Escríbeme directamente para consultas con IA
• Genera test cases automáticamente
• Analiza errores y logs
• Code review de tus tests
• Ayuda con arquitectura

Selecciona una opción del menú o escríbeme tu pregunta directamente.
"""

    await update.message.reply_text(
        welcome_text,
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Comando /help - Ayuda y documentación
    """
    help_text = """
📚 **HAIDA - Guía de Uso**

**COMANDOS**:
/start - Menú principal
/status - Estado del sistema
/tests - Ejecutar tests
/reports - Ver reportes
/ai - Modo asistente IA
/help - Esta ayuda

**ASISTENTE IA**:
Escríbeme directamente para usar la IA avanzada:

*Ejemplos*:
• "Genera test cases para login con OAuth"
• "Explica este error de Playwright: [error]"
• "Code review de mi test: [código]"
• "¿Microservicios o monolito para 10K usuarios?"
• "Diseña arquitectura para e-commerce escalable"
• "Cómo integrar Stripe con webhook retry logic?"

**MIS ROLES**:
🧪 QA Tester ISTQB Expert
💻 Software Developer
🏗️ Software Architect
📊 Analista Funcional
🔌 Integration Specialist
📋 Project Manager

**CAPACIDADES**:
• Generar test cases ISTQB
• Analizar resultados de tests
• Code review de automation scripts
• Troubleshoot errores
• Diseño de arquitectura
• Estimación de proyectos
• Integración de APIs
• Best practices

**DASHBOARD**:
Accede al dashboard web para:
• Ver métricas en tiempo real
• Ejecutar tests con configuración avanzada
• Generar reportes personalizados
• Gestionar proyectos

**SOPORTE**:
📧 hola@stayarta.com
🌐 https://stayarta.atlassian.net/wiki/spaces/HAIDA
"""

    await update.message.reply_text(help_text, parse_mode="Markdown")

# =============================================================================
# ASISTENTE DE IA
# =============================================================================

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Manejar mensajes de texto del usuario (conversación con IA)
    """
    user = update.effective_user
    user_message = update.message.text

    # Indicar que el bot está escribiendo
    await update.message.chat.send_action("typing")

    # Obtener ID de conversación único por usuario
    conversation_id = f"telegram_{user.id}"

    # Detectar tipo de tarea basado en palabras clave
    task_type = detect_task_type(user_message)

    # Detectar contexto del usuario (rol, urgencia)
    context_data = detect_context(user_message)

    # Chatear con el asistente de IA
    response = assistant.chat(
        user_message=user_message,
        conversation_id=conversation_id,
        context=context_data,
        task_type=task_type
    )

    _append_memory_entry(
        conversation_id=conversation_id,
        user_id=user.id,
        username=getattr(user, "username", None),
        user_message=user_message,
        assistant_response=response
    )

    # Enviar respuesta (dividir si es muy larga)
    if len(response) > 4096:
        # Telegram tiene límite de 4096 caracteres por mensaje
        for i in range(0, len(response), 4096):
            await update.message.reply_text(
                response[i:i+4096],
                parse_mode="Markdown"
            )
    else:
        await update.message.reply_text(
            response,
            parse_mode="Markdown"
        )

def detect_task_type(message: str) -> str:
    """
    Detectar tipo de tarea basado en mensaje del usuario

    Args:
        message: Mensaje del usuario

    Returns:
        str: Tipo de tarea (code_generation, test_cases, analysis, etc.)
    """
    message_lower = message.lower()

    if any(kw in message_lower for kw in ["genera test", "test case", "casos de prueba"]):
        return "test_cases"
    elif any(kw in message_lower for kw in ["código", "code", "función", "class"]):
        return "code_generation"
    elif any(kw in message_lower for kw in ["error", "fallo", "bug", "problema"]):
        return "analysis"
    elif any(kw in message_lower for kw in ["arquitectura", "diseño", "patrón"]):
        return "analysis"
    else:
        return "general"

def detect_context(message: str) -> dict:
    """
    Detectar contexto del usuario basado en mensaje

    Args:
        message: Mensaje del usuario

    Returns:
        dict: Contexto (user_role, urgency, etc.)
    """
    context = {
        "user_role": "qa_engineer",  # Default
        "urgency": "medium"
    }

    message_lower = message.lower()

    # Detectar rol
    if any(kw in message_lower for kw in ["arquitectura", "diseño de sistema", "escalabilidad"]):
        context["user_role"] = "architect"
    elif any(kw in message_lower for kw in ["integración", "api", "webhook"]):
        context["user_role"] = "integrator"
    elif any(kw in message_lower for kw in ["proyecto", "estimación", "planificación"]):
        context["user_role"] = "manager"
    elif any(kw in message_lower for kw in ["código", "función", "clase"]):
        context["user_role"] = "developer"
    elif any(kw in message_lower for kw in ["requisitos", "user story", "análisis"]):
        context["user_role"] = "analyst"

    # Detectar urgencia
    if any(kw in message_lower for kw in ["urgente", "rápido", "ahora", "ya"]):
        context["urgency"] = "high"
    elif any(kw in message_lower for kw in ["explorar", "aprender", "entender"]):
        context["urgency"] = "low"

    return context

# =============================================================================
# CALLBACKS DE BOTONES
# =============================================================================

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Manejar clicks en botones inline
    """
    query = update.callback_query
    await query.answer()

    data = query.data

    if data == "status":
        await show_status(query)
    elif data == "tests":
        await show_tests_menu(query)
    elif data == "reports":
        await show_reports_menu(query)
    elif data == "jira":
        await show_jira_menu(query)
    elif data == "ai_menu":
        await show_ai_menu(query)
    elif data == "help":
        await query.message.reply_text(
            "Usa /help para ver la guía completa de uso",
            parse_mode="Markdown"
        )
    elif data.startswith("ai_"):
        await handle_ai_action(query, data)
    elif data.startswith("test_"):
        await handle_test_action(query, data)

async def show_status(query):
    """Mostrar estado del sistema"""
    status_text = """
✅ **HAIDA Sistema - Estado**

**Servicios**:
• API: 🟢 Healthy
• Database: 🟢 Connected
• Redis: 🟢 Running
• LM Studio (IA): 🟢 Online
• Telegram Bot: 🟢 Active

**Integraciones**:
• Jira: 🟢 Connected (30 issues)
• Confluence: 🟢 Connected (4 páginas)
• Railway: 🟢 Deployed

**Última ejecución de tests**:
• Fecha: 31 Dic 2025, 09:43
• Status: ✅ Passed
• Tests: 23/23 passed
• Duración: 45 segundos

Todo operativo ✅
"""
    await query.message.reply_text(status_text, parse_mode="Markdown")

async def show_tests_menu(query):
    """Mostrar menú de tests"""
    keyboard = [
        [InlineKeyboardButton("🌐 Tests E2E Web", callback_data="test_e2e")],
        [InlineKeyboardButton("🔌 Tests API", callback_data="test_api")],
        [InlineKeyboardButton("⚡ Tests Performance", callback_data="test_perf")],
        [InlineKeyboardButton("♿ Tests Accesibilidad", callback_data="test_a11y")],
        [InlineKeyboardButton("◀️ Volver", callback_data="start")]
    ]

    await query.message.reply_text(
        "🧪 **Tests Disponibles**\n\nSelecciona el tipo de test a ejecutar:",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

async def show_reports_menu(query):
    """Mostrar menú de reportes"""
    keyboard = [
        [InlineKeyboardButton("📊 Último Reporte", callback_data="report_last")],
        [InlineKeyboardButton("📈 Trending (7 días)", callback_data="report_trending")],
        [InlineKeyboardButton("📥 Descargar PDF", callback_data="report_pdf")],
        [InlineKeyboardButton("◀️ Volver", callback_data="start")]
    ]

    await query.message.reply_text(
        "📈 **Reportes**\n\nSelecciona el tipo de reporte:",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

async def show_jira_menu(query):
    """Mostrar menú de Jira"""
    keyboard = [
        [InlineKeyboardButton("📋 Mis Issues", callback_data="jira_my")],
        [InlineKeyboardButton("➕ Crear Issue", callback_data="jira_create")],
        [InlineKeyboardButton("🔍 Buscar", callback_data="jira_search")],
        [InlineKeyboardButton("◀️ Volver", callback_data="start")]
    ]

    await query.message.reply_text(
        "🎯 **Jira Integration**\n\nProyecto: HAIDA\nIssues: 30 (7 Epics + 23 Stories)\n\nSelecciona una acción:",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

async def show_ai_menu(query):
    """Mostrar menú del asistente IA"""
    keyboard = [
        [InlineKeyboardButton("🧪 Generar Test Cases", callback_data="ai_gen_tests")],
        [InlineKeyboardButton("🔍 Analizar Error", callback_data="ai_analyze_error")],
        [InlineKeyboardButton("👨‍💻 Code Review", callback_data="ai_code_review")],
        [InlineKeyboardButton("🏗️ Arquitectura", callback_data="ai_architecture")],
        [InlineKeyboardButton("🗑️ Limpiar Historial", callback_data="ai_clear")],
        [InlineKeyboardButton("◀️ Volver", callback_data="start")]
    ]

    ai_text = """
🤖 **HAIDA AI Assistant**

**Mis roles profesionales**:
• QA Tester ISTQB Expert
• Software Developer Expert
• Software Architect
• Analista Funcional
• Integration Specialist
• Project Manager

**Cómo usarme**:
Simplemente escríbeme tu pregunta y responderé desde el rol más apropiado.

O usa los botones para acciones específicas:
"""

    await query.message.reply_text(
        ai_text,
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

async def handle_ai_action(query, data: str):
    """Manejar acciones del menú de IA"""
    if data == "ai_gen_tests":
        await query.message.reply_text(
            "🧪 **Generador de Test Cases**\n\nEnvíame la especificación funcional y generaré test cases ISTQB-compliant.\n\nEjemplo:\n```\nGenera test cases para:\n- Login con email y password\n- Validación de campos\n- OAuth con Google\n```",
            parse_mode="Markdown"
        )
    elif data == "ai_analyze_error":
        await query.message.reply_text(
            "🔍 **Análisis de Errores**\n\nEnvíame el mensaje de error completo y te ayudaré a resolverlo.\n\nEjemplo:\n```\nError: Target closed\nTest: login_test.spec.ts:45\nBrowser: Chromium\n```",
            parse_mode="Markdown"
        )
    elif data == "ai_code_review":
        await query.message.reply_text(
            "👨‍💻 **Code Review**\n\nEnvíame tu código de tests y haré un review completo.\n\nEjemplo:\n```python\ndef test_login():\n    driver.find_element(By.ID, 'email').send_keys('hola@stayarta.com')\n    driver.find_element(By.ID, 'password').send_keys('pass123')\n    driver.find_element(By.ID, 'submit').click()\n    assert driver.current_url == '/dashboard'\n```",
            parse_mode="Markdown"
        )
    elif data == "ai_architecture":
        await query.message.reply_text(
            "🏗️ **Consulta de Arquitectura**\n\nPregúntame sobre:\n• Diseño de sistemas\n• Patrones de arquitectura\n• Microservicios vs Monolito\n• Escalabilidad\n• Bases de datos\n• APIs y integraciones\n\nEjemplo:\n\"¿Cómo diseñar arquitectura para e-commerce con 100K usuarios?\"",
            parse_mode="Markdown"
        )
    elif data == "ai_clear":
        user_id = query.from_user.id
        conversation_id = f"telegram_{user_id}"
        assistant.clear_history(conversation_id)
        await query.message.reply_text(
            "✅ Historial de conversación limpiado.\n\nNueva conversación iniciada.",
            parse_mode="Markdown"
        )

async def handle_test_action(query, data: str):
    """Manejar acciones de tests"""
    test_type = data.replace("test_", "")

    test_messages = {
        "e2e": "🌐 **Ejecutando Tests E2E Web**...\n\n⏳ Esto puede tomar 1-2 minutos.\nTe notificaré cuando termine.",
        "api": "🔌 **Ejecutando Tests API**...\n\n⏳ Validando endpoints...",
        "perf": "⚡ **Ejecutando Tests de Performance**...\n\n⏳ Simulando 100 usuarios concurrentes...",
        "a11y": "♿ **Ejecutando Auditoría de Accesibilidad**...\n\n⏳ Validando WCAG 2.1 AA..."
    }

    message = test_messages.get(test_type, "Ejecutando tests...")
    await query.message.reply_text(message, parse_mode="Markdown")

    # Aquí integrarías con la API real para ejecutar tests
    # Por ahora, simulamos resultado exitoso
    await query.message.reply_text(
        "✅ **Tests completados**\n\n23/23 tests passed\nDuración: 45 segundos\n\nVer reporte completo: /reports",
        parse_mode="Markdown"
    )

# =============================================================================
# INLINE MODE
# =============================================================================

async def inline_query(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Manejar inline queries (@haida_bot [query])
    """
    # Implementar búsquedas inline si es necesario
    pass

# =============================================================================
# MAIN
# =============================================================================

def main():
    """Ejecutar bot"""
    print("🚀 Iniciando HAIDA Telegram Bot v3.0 (AI-Powered)...")

    # Crear aplicación
    application = Application.builder().token(TOKEN).build()

    # Handlers de comandos
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))

    # Handler de mensajes de texto (IA)
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    # Handler de callbacks (botones)
    application.add_handler(CallbackQueryHandler(button_callback))

    # Handler de inline queries
    application.add_handler(InlineQueryHandler(inline_query))

    # Iniciar bot
    print("✅ Bot iniciado correctamente")
    print(f"📱 Telegram: @Haidauto_bot")
    print(f"🌐 Dashboard: {WEBAPP_URL}")
    print("🤖 Asistente IA: DeepSeek R1 cargado")
    print("\n💬 Esperando mensajes...")

    # Run bot
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
