#!/bin/bash

# ============================================
# Script para actualizar variables de entorno en Vercel
# HAIDA Project - Dominios stayarta.com
# ============================================

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vercel Token
VERCEL_TOKEN="${1:-VcGSlMUzEPrxUryMWq67dvLq}"

if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  Uso: $0 <VERCEL_TOKEN>${NC}"
    echo -e "   O establece VERCEL_TOKEN como variable de entorno"
    exit 1
fi

echo -e "${BLUE}🚀 Actualizando variables de entorno en Vercel${NC}"
echo -e "${BLUE}══════════════════════════════════════════════${NC}"

# ============================================
# FRONTEND (haida-frontend)
# ============================================
echo -e "\n${GREEN}📦 Frontend (haida-frontend)${NC}"

FRONTEND_ENVS=(
    "VITE_SUPABASE_URL|https://wdebyxvtunromsnkqbrd.supabase.co"
    "VITE_SUPABASE_ANON_KEY|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4OTU3NTEsImV4cCI6MjA4MTQ3MTc1MX0._VYypgb2tV9u_4jSAt3sbcFj-drhufB0oN9o3BcgHTs"
    "VITE_API_URL|https://haidapi.stayarta.com"
    "VITE_APP_NAME|HAIDA"
    "VITE_APP_VERSION|2.0.0"
    "VITE_ENTRA_CLIENT_ID|93dae11f-417c-49ff-8d66-d642afb66327"
    "VITE_ENTRA_REDIRECT_URI|https://haida.stayarta.com/auth"
)

for env in "${FRONTEND_ENVS[@]}"; do
    KEY="${env%%|*}"
    VALUE="${env##*|}"
    echo -e "  Setting ${BLUE}${KEY}${NC}..."

    # Producción
    echo "$VALUE" | vercel env add "$KEY" production --force --token "$VERCEL_TOKEN" --scope haida-frontend 2>/dev/null || echo "    ⚠️  Ya existe o error"

    # Preview (opcional)
    # echo "$VALUE" | vercel env add "$KEY" preview --force --token "$VERCEL_TOKEN" --scope haida-frontend 2>/dev/null || echo "    ⚠️  Ya existe o error"
done

# ============================================
# BACKEND (haida)
# ============================================
echo -e "\n${GREEN}📡 Backend (haida)${NC}"

BACKEND_ENVS=(
    # Database
    "DATABASE_URL|postgresql://postgres.wdebyxvtunromsnkqbrd:C25843bc8!@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?sslmode=require"
    "SUPABASE_URL|https://wdebyxvtunromsnkqbrd.supabase.co"
    "SUPABASE_SERVICE_ROLE_KEY|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg5NTc1MSwiZXhwIjoyMDgxNDcxNzUxfQ.Jg6UBGpYDBBKvB4pgaKW_OJCTx0VOm9UMI18vqdUEJc"

    # Microsoft Entra
    "ENTRA_CLIENT_ID|93dae11f-417c-49ff-8d66-d642afb66327"
    "ENTRA_CLIENT_SECRET|6GI8Q~kMgGHrl9AvhGfAiOUQp7xAqzTqncvCca3p"
    "ENTRA_TENANT_ID|9b7594d6-2c7d-4fe2-b248-213f64996877"
    "ENTRA_AUTHORITY|https://login.microsoftonline.com/9b7594d6-2c7d-4fe2-b248-213f64996877"
    "ENTRA_REDIRECT_URI|https://haida.stayarta.com/auth"
    "GRAPH_SCOPES|User.Read email profile openid"

    # JWT
    "JWT_SECRET|ECB76E37-DB86-435A-9E17-3DEF19FF57A7"
    "JWT_ALGORITHM|HS256"
    "JWT_EXPIRATION_MINUTES|30"

    # CORS
    "CORS_ORIGINS|https://haida.stayarta.com,http://localhost:3000"

    # LLM
    "LLM_PROVIDER|routellm"
    "ROUTE_LLM_URL|https://routellm.abacus.ai/v1"
    "ROUTE_LLM_MODEL|gpt-5"
    "ROUTE_LLM_API_KEY|s2_b6b02388915046de99cff0af3a7d5592"
)

for env in "${BACKEND_ENVS[@]}"; do
    KEY="${env%%|*}"
    VALUE="${env##*|}"
    echo -e "  Setting ${BLUE}${KEY}${NC}..."

    # Producción
    echo "$VALUE" | vercel env add "$KEY" production --force --token "$VERCEL_TOKEN" --scope haida 2>/dev/null || echo "    ⚠️  Ya existe o error"
done

# ============================================
# Resumen
# ============================================
echo -e "\n${GREEN}✅ Variables de entorno actualizadas${NC}"
echo -e "\n${YELLOW}📋 Próximos pasos:${NC}"
echo "  1. Agregar dominios en Vercel Dashboard:"
echo "     - haida.stayarta.com → haida-frontend"
echo "     - haidapi.stayarta.com → haida"
echo ""
echo "  2. Verificar deployment:"
echo "     vercel --prod --token $VERCEL_TOKEN"
echo ""
echo "  3. Verificar variables:"
echo "     vercel env ls --token $VERCEL_TOKEN"
echo ""
echo -e "${BLUE}══════════════════════════════════════════════${NC}"
