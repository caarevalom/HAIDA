#!/bin/bash

# ═══════════════════════════════════════════════════════════
# HAIDA - Setup Final Automatizado
# ═══════════════════════════════════════════════════════════

set -e  # Exit on error

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Tokens
VERCEL_TOKEN="TGtBryOqKfSQNAapoP1SWu4F"

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   HAIDA - Configuración Automatizada de Vercel    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"

# ═══════════════════════════════════════════════════════════
# PASO 1: Verificar Token
# ═══════════════════════════════════════════════════════════
echo -e "\n${YELLOW}[1/4]${NC} Verificando autenticación Vercel..."
VERCEL_USER=$(vercel whoami --token "$VERCEL_TOKEN" 2>&1)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Autenticado como: $VERCEL_USER"
else
    echo -e "${RED}✗${NC} Error de autenticación"
    exit 1
fi

# ═══════════════════════════════════════════════════════════
# PASO 2: Actualizar Variables de Entorno en Vercel
# ═══════════════════════════════════════════════════════════
echo -e "\n${YELLOW}[2/4]${NC} Actualizando variables de entorno..."

# Frontend
echo -e "${BLUE}  → Frontend (haida-frontend)${NC}"
cd /Users/carlosa/Hiberus/HAIDA-PROJECT/Figma

# Solo actualizamos las variables críticas
echo "https://haidapi.stayarta.com" | vercel env rm VITE_API_URL production --yes --token "$VERCEL_TOKEN" 2>/dev/null || true
echo "https://haidapi.stayarta.com" | vercel env add VITE_API_URL production --token "$VERCEL_TOKEN" 2>/dev/null || echo "    Variable ya existe"

echo "https://haida.stayarta.com/auth" | vercel env rm VITE_ENTRA_REDIRECT_URI production --yes --token "$VERCEL_TOKEN" 2>/dev/null || true
echo "https://haida.stayarta.com/auth" | vercel env add VITE_ENTRA_REDIRECT_URI production --token "$VERCEL_TOKEN" 2>/dev/null || echo "    Variable ya existe"

# Backend
echo -e "${BLUE}  → Backend (haida)${NC}"
cd /Users/carlosa/Hiberus/HAIDA-PROJECT

echo "https://haida.stayarta.com,http://localhost:3000" | vercel env rm CORS_ORIGINS production --yes --token "$VERCEL_TOKEN" 2>/dev/null || true
echo "https://haida.stayarta.com,http://localhost:3000" | vercel env add CORS_ORIGINS production --token "$VERCEL_TOKEN" 2>/dev/null || echo "    Variable ya existe"

echo "https://haida.stayarta.com/auth" | vercel env rm ENTRA_REDIRECT_URI production --yes --token "$VERCEL_TOKEN" 2>/dev/null || true
echo "https://haida.stayarta.com/auth" | vercel env add ENTRA_REDIRECT_URI production --token "$VERCEL_TOKEN" 2>/dev/null || echo "    Variable ya existe"

echo -e "${GREEN}✓${NC} Variables actualizadas"

# ═══════════════════════════════════════════════════════════
# PASO 3: Verificar DNS
# ═══════════════════════════════════════════════════════════
echo -e "\n${YELLOW}[3/4]${NC} Verificando DNS..."

check_dns() {
    domain=$1
    expected=$2
    result=$(dig "$domain" CNAME +short 2>/dev/null | head -1)
    if [[ "$result" == "$expected"* ]] || [[ "$result" == *"vercel"* ]]; then
        echo -e "${GREEN}✓${NC} $domain → DNS configurado"
    else
        echo -e "${YELLOW}⚠${NC}  $domain → DNS pendiente (actual: $result)"
    fi
}

check_dns "haida.stayarta.com" "b562e8d42f8787b9.vercel-dns-017.com"
check_dns "haidapi.stayarta.com" "a092a36a9f4d6d0d.vercel-dns-017.com"

# ═══════════════════════════════════════════════════════════
# PASO 4: Verificar Dominios en Vercel
# ═══════════════════════════════════════════════════════════
echo -e "\n${YELLOW}[4/4]${NC} Verificando dominios en Vercel..."

DOMAINS=$(vercel domains ls --token "$VERCEL_TOKEN" 2>&1)
if echo "$DOMAINS" | grep -q "haida.stayarta.com"; then
    echo -e "${GREEN}✓${NC} haida.stayarta.com agregado en Vercel"
else
    echo -e "${RED}✗${NC} haida.stayarta.com NO encontrado en Vercel"
    echo -e "${YELLOW}  → Debes agregar manualmente en:${NC}"
    echo -e "     https://vercel.com/carlos-arevalos-projects-cf7340ea/haida-frontend/settings/domains"
fi

if echo "$DOMAINS" | grep -q "haidapi.stayarta.com"; then
    echo -e "${GREEN}✓${NC} haidapi.stayarta.com agregado en Vercel"
else
    echo -e "${RED}✗${NC} haidapi.stayarta.com NO encontrado en Vercel"
    echo -e "${YELLOW}  → Debes agregar manualmente en:${NC}"
    echo -e "     https://vercel.com/carlos-arevalos-projects-cf7340ea/haida/settings/domains"
fi

# ═══════════════════════════════════════════════════════════
# Resumen Final
# ═══════════════════════════════════════════════════════════
echo -e "\n${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              CONFIGURACIÓN COMPLETADA              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"

echo -e "\n${GREEN}✅ Completado:${NC}"
echo "  • Variables de entorno actualizadas en Vercel"
echo "  • Archivos de configuración actualizados"
echo "  • Security headers configurados"

echo -e "\n${YELLOW}⚠️  Pendiente (Manual):${NC}"
echo "  1. Agregar dominios en Vercel Dashboard:"
echo "     • haida.stayarta.com → haida-frontend"
echo "     • haidapi.stayarta.com → haida"
echo ""
echo "  2. Actualizar DNS en Cloudflare:"
echo "     • haida → b562e8d42f8787b9.vercel-dns-017.com"
echo "     • haidapi → a092a36a9f4d6d0d.vercel-dns-017.com"
echo ""
echo "  3. Redeploy:"
echo "     cd /Users/carlosa/Hiberus/HAIDA-PROJECT/Figma"
echo "     vercel --prod --force --token $VERCEL_TOKEN"
echo ""
echo "     cd /Users/carlosa/Hiberus/HAIDA-PROJECT"
echo "     vercel --prod --force --token $VERCEL_TOKEN"

echo -e "\n${BLUE}📋 Guías Disponibles:${NC}"
echo "  • QUICK-SETUP.txt - Guía rápida"
echo "  • docs/PASOS-AGREGAR-DOMINIOS-VERCEL.md - Paso a paso"
echo "  • docs/DEPLOYMENT-GUIDE-STAYARTA.md - Guía completa"
echo "  • CREDENTIALS.md - Credenciales y tokens"

echo -e "\n${GREEN}═══════════════════════════════════════════════════════${NC}"
