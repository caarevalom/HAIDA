#!/bin/bash
echo "🚀 Desplegando HAIDA Bot a Railway..."

# Instalar Railway CLI si no está
if ! command -v railway &> /dev/null; then
    npm install -g @railway/cli
fi

# Login (usar el token)
if [ -z "$RAILWAY_TOKEN" ]; then
    echo "❌ RAILWAY_TOKEN no configurado en el entorno."
    exit 1
fi

# Inicializar proyecto
railway init

# Configurar variables de entorno
if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "❌ TELEGRAM_BOT_TOKEN no configurado en el entorno."
    exit 1
fi
railway variables set TELEGRAM_BOT_TOKEN="$TELEGRAM_BOT_TOKEN"

# Desplegar
railway up

echo "✅ Desplegado a Railway!"
echo "🔗 El bot ahora está online 24/7"
