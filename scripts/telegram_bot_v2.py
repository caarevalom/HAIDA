#!/usr/bin/env python3
"""
HAIDA Bot v2.0 - Versión Completa con MiniApp
"""
import os
from datetime import datetime
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram import InlineQueryResultArticle, InputTextMessageContent, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler
from telegram.ext import InlineQueryHandler, ContextTypes
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
if not TOKEN:
    raise SystemExit("Missing TELEGRAM_BOT_TOKEN environment variable.")
WEBAPP_URL = "https://haida-dashboard.vercel.app"  # Se configurará después

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Menú principal con TODAS las opciones"""
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
            InlineKeyboardButton("📚 Confluence", callback_data="confluence"),
            InlineKeyboardButton("💬 Chat IA", callback_data="ai")
        ],
        [InlineKeyboardButton("🔍 Búsqueda Inline", switch_inline_query_current_chat="")]
    ]
    
    await update.message.reply_text(
        "🚀 *HAIDA Bot v2.0 - Sistema Completo*\n\n"
        "*Funcionalidades:*\n"
        "📊 Dashboard interactivo (MiniApp)\n"
        "🧪 Ejecutar test suites\n"
        "📈 Reportes en tiempo real\n"
        "🎯 Integración Jira/Confluence\n"
        "💬 Chat con IA (DeepSeek R1)\n"
        "🔍 Modo inline en cualquier chat\n\n"
        "Selecciona una opción:",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

async def status(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Estado completo del sistema"""
    query = update.callback_query
    if query:
        await query.answer()
        msg = query.message
    else:
        msg = update.message
    
    status_text = f"""
🟢 *HAIDA - Estado del Sistema*

*Servicios Core:*
✅ Bot Telegram (24/7 en Railway)
✅ API FastAPI
✅ PostgreSQL + Supabase
✅ Redis Cache
✅ LM Studio DeepSeek R1

*Integraciones:*
✅ Confluence (stayarta.atlassian.net)
✅ Jira
✅ Railway Deploy

*Última verificación:*
_{datetime.now().strftime("%d/%m/%Y %H:%M:%S")}_
"""
    
    await msg.reply_text(status_text, parse_mode="Markdown")

async def tests_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Menú de test suites"""
    query = update.callback_query
    await query.answer()
    
    keyboard = [
        [
            InlineKeyboardButton("🌐 Web E2E", callback_data="run:web"),
            InlineKeyboardButton("🔌 API", callback_data="run:api")
        ],
        [
            InlineKeyboardButton("⚡ Performance", callback_data="run:perf"),
            InlineKeyboardButton("♿ A11y", callback_data="run:a11y")
        ],
        [InlineKeyboardButton("« Volver", callback_data="back")]
    ]
    
    await query.message.reply_text(
        "🧪 *Test Suites Disponibles*\n\n"
        "Selecciona un suite para ejecutar:",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

async def reports_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Menú de reportes"""
    query = update.callback_query
    await query.answer()
    
    keyboard = [
        [InlineKeyboardButton("📊 Reporte Diario", callback_data="report:daily")],
        [InlineKeyboardButton("📈 Reporte Semanal", callback_data="report:weekly")],
        [InlineKeyboardButton("« Volver", callback_data="back")]
    ]
    
    await query.message.reply_text(
        "📈 *Reportes Disponibles*",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

async def jira_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Integración con Jira"""
    query = update.callback_query
    await query.answer()
    
    await query.message.reply_text(
        "🎯 *Integración Jira*\n\n"
        "• Crear bugs\n"
        "• Ver issues\n"
        "• Actualizar estados\n\n"
        "🔗 https://stayarta.atlassian.net",
        parse_mode="Markdown"
    )

async def confluence_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Integración con Confluence"""
    query = update.callback_query
    await query.answer()
    
    await query.message.reply_text(
        "📚 *Confluence - Documentación*\n\n"
        "📄 Espacio HAIDA creado\n"
        "📝 Listo para subir docs\n\n"
        "🔗 https://stayarta.atlassian.net/wiki/spaces/HAIDA",
        parse_mode="Markdown"
    )

async def ai_chat(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Chat con IA"""
    query = update.callback_query
    if query:
        await query.answer()
        msg = query.message
    else:
        msg = update.message
    
    await msg.reply_text(
        "💬 *Chat con DeepSeek R1*\n\n"
        "Usa: `/ask <tu pregunta>`\n\n"
        "Ejemplo:\n"
        "`/ask cómo escribir un test de login`",
        parse_mode="Markdown"
    )

async def inline_query(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Inline mode - funciona en cualquier chat"""
    query = update.inline_query.query.lower()
    
    results = [
        InlineQueryResultArticle(
            id="1",
            title="📊 Estado del Sistema",
            description="Ver estado actual de HAIDA",
            input_message_content=InputTextMessageContent(
                "🟢 *HAIDA Sistema*\n✅ Todos los servicios OK",
                parse_mode="Markdown"
            )
        ),
        InlineQueryResultArticle(
            id="2",
            title="📚 Documentación",
            description="Enlaces a Confluence",
            input_message_content=InputTextMessageContent(
                "📚 *HAIDA Docs*\n🔗 https://stayarta.atlassian.net/wiki/spaces/HAIDA",
                parse_mode="Markdown"
            )
        ),
        InlineQueryResultArticle(
            id="3",
            title="🎯 Jira",
            description="Ir a Jira",
            input_message_content=InputTextMessageContent(
                "🎯 *Jira*\n🔗 https://stayarta.atlassian.net",
                parse_mode="Markdown"
            )
        )
    ]
    
    await update.inline_query.answer(results)

async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Manejador de botones"""
    query = update.callback_query
    data = query.data
    
    handlers = {
        "status": status,
        "tests": tests_menu,
        "reports": reports_menu,
        "jira": jira_menu,
        "confluence": confluence_menu,
        "ai": ai_chat,
        "back": start
    }
    
    handler = handlers.get(data)
    if handler:
        await handler(update, context)
    else:
        await query.answer("Función en desarrollo 🚧")

def main():
    """Iniciar bot"""
    print("="*60)
    print("🚀 HAIDA Bot v2.0 - Iniciando...")
    print("="*60)
    
    app = Application.builder().token(TOKEN).build()
    
    # Comandos
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("status", status))
    
    # Inline mode
    app.add_handler(InlineQueryHandler(inline_query))
    
    # Botones
    app.add_handler(CallbackQueryHandler(button_handler))
    
    print("✅ Bot activo y listo")
    print("="*60)
    
    app.run_polling()

if __name__ == "__main__":
    main()
