#!/usr/bin/env python3
import os
from dotenv import load_dotenv
from telegram.ext import Application, CommandHandler

load_dotenv()

async def start(u, c):
    await u.message.reply_text("🚀 HAIDA Bot OK")
    
async def status(u, c):
    await u.message.reply_text("✅ Sistema Operativo")

token = os.getenv("TELEGRAM_BOT_TOKEN")
if not token:
    raise SystemExit("Missing TELEGRAM_BOT_TOKEN environment variable.")

app = Application.builder().token(token).build()
app.add_handler(CommandHandler("start", start))
app.add_handler(CommandHandler("status", status))
print("Bot activo...")
app.run_polling()
