#!/bin/bash
# ===========================================
# HAIDA - Script de Configuración de Variables de Entorno
# ===========================================

set -e

echo "🚀 HAIDA - Configuración de Variables de Entorno"
echo "================================================"
echo ""

# Verificar si ya existe .env
if [ -f .env ]; then
    echo "⚠️  El archivo .env ya existe."
    read -p "¿Deseas sobrescribirlo? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Operación cancelada."
        exit 1
    fi
fi

# Copiar .env.example a .env
cp .env.example .env
echo "✅ Archivo .env creado desde .env.example"
echo ""

echo "📝 Próximos pasos:"
echo ""
echo "1. Edita el archivo .env con tus credenciales reales:"
echo "   nano .env"
echo "   # o con tu editor favorito"
echo ""
echo "2. Variables importantes a configurar:"
echo "   - SUPABASE_URL y SUPABASE_SERVICE_KEY"
echo "   - JIRA_API_TOKEN y JIRA_EMAIL"
echo "   - TEST_ADMIN_EMAIL y TEST_ADMIN_PASSWORD"
echo ""
echo "3. Verifica que el archivo .env está en .gitignore:"
echo "   cat .gitignore | grep '.env'"
echo ""
echo "4. Para obtener credenciales, consulta:"
echo "   - Supabase: https://app.supabase.com/project/_/settings/api"
echo "   - Jira/Confluence: https://id.atlassian.com/manage-profile/security/api-tokens"
echo ""

# Verificar que .env está en .gitignore
if grep -q "^\.env$" .gitignore || grep -q "^\*\*\/\.env$" .gitignore; then
    echo "✅ .env está correctamente excluido en .gitignore"
else
    echo "⚠️  ADVERTENCIA: .env no está en .gitignore"
    echo "   Añadiendo ahora..."
    echo ".env" >> .gitignore
    echo "✅ .env añadido a .gitignore"
fi

echo ""
echo "✨ Configuración completada!"
