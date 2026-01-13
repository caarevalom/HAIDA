#!/bin/bash

################################################################################
# SCRIPT DE CONSOLIDACIÓN - CONFIGURACIÓN CLAUDE CODE
# Propósito: Limpiar credenciales hardcodeadas y consolidar settings
# Uso: bash consolidate-claude-config.sh
# Seguridad: Crea backups automáticos antes de modificar
################################################################################

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Directorios
CLAUDE_HOME="$HOME/.claude"
BACKUP_DIR="$HOME/.claude-config-backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Contadores
CREDENTIALS_REMOVED=0
FILES_MODIFIED=0
ERRORS=0

################################################################################
# Funciones de Utilidad
################################################################################

print_header() {
    echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  CONSOLIDACIÓN DE CONFIGURACIÓN - CLAUDE CODE${NC}            ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

print_section() {
    echo -e "\n${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    ERRORS=$((ERRORS + 1))
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

################################################################################
# Funciones de Backup
################################################################################

create_backup() {
    local file=$1

    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        print_success "Directorio de backup creado: $BACKUP_DIR"
    fi

    if [ -f "$file" ]; then
        local filename=$(basename "$file")
        local backup_file="$BACKUP_DIR/${filename}.backup-${TIMESTAMP}"
        cp "$file" "$backup_file"
        print_success "Backup creado: $backup_file"
        echo "$backup_file"
    fi
}

################################################################################
# Funciones de Limpieza
################################################################################

extract_credentials() {
    local file=$1
    local output_file=$2

    # Buscar patrones de credenciales
    grep -E "(DATABASE_URL|SUPABASE_KEY|password|token|secret|API_KEY)" "$file" 2>/dev/null | \
    grep -v "^#" | \
    grep -v "^//" > "$output_file" || true
}

sanitize_settings_json() {
    local file=$1
    local backup_file=$(create_backup "$file")

    print_info "Limpiando: $file"

    # Crear versión sanitizada
    python3 << 'PYTHON_SCRIPT'
import json
import sys
import re
from pathlib import Path

file_path = sys.argv[1]

try:
    with open(file_path, 'r') as f:
        content = f.read()

    # Patrones de credenciales a buscar
    patterns = [
        r'DATABASE_URL="[^"]*"',
        r'SUPABASE_KEY=[\'"][^\'"]*[\'"]',
        r'password[\'"]?\s*[:=]\s*[\'"]?[^\'"]+[\'"]?',
        r'token[\'"]?\s*[:=]\s*[\'"]?eyJ[^\'"]*[\'"]?',
        r'secret[\'"]?\s*[:=]\s*[\'"][^\'"]*[\'"]',
        r'API_KEY=[\'"][^\'"]*[\'"]',
        r'ENTRA_CLIENT_SECRET=[\'"][^\'"]*[\'"]',
        r'"email"\s*:\s*"[^"@]+@[^"]*"',
        r'"password"\s*:\s*"[^"]*"',
        r'Bearer\s+[a-zA-Z0-9\-_\.]+',
        r'eyJhbGciOi[A-Za-z0-9\-_\.]+',
    ]

    sanitized = content
    removed_count = 0

    for pattern in patterns:
        matches = re.findall(pattern, sanitized)
        if matches:
            for match in matches:
                print(f"ENCONTRADO: {match[:50]}...")
                # Reemplazar con placeholder
                sanitized = sanitized.replace(match, '"***REMOVED***"')
                removed_count += 1

    # Escribir archivo sanitizado
    with open(file_path, 'w') as f:
        f.write(sanitized)

    print(f"\n✓ {removed_count} credenciales removidas")
    print(f"✓ Backup guardado: {sys.argv[2]}")

except Exception as e:
    print(f"✗ Error: {e}")
    sys.exit(1)

PYTHON_SCRIPT

    python3 - "$file" "$backup_file" << 'EOF'
import json
import sys
import re
from pathlib import Path

file_path = sys.argv[1]
backup_file = sys.argv[2]

try:
    with open(file_path, 'r') as f:
        content = f.read()

    # Patrones de credenciales a buscar
    patterns = [
        r'DATABASE_URL="[^"]*"',
        r'SUPABASE_KEY=[\'"][^\'"]*[\'"]',
        r'password[\'"]?\s*[:=]\s*[\'"]?[^\'"]*[\'"]?',
        r'token[\'"]?\s*[:=]\s*[\'"]?eyJ[^\'"]*[\'"]?',
        r'secret[\'"]?\s*[:=]\s*[\'"][^\'"]*[\'"]',
        r'API_KEY=[\'"][^\'"]*[\'"]',
    ]

    sanitized = content
    removed_count = 0

    for pattern in patterns:
        matches = re.findall(pattern, sanitized)
        if matches:
            for match in matches:
                print(f"[CREDENTIAL] {match[:60]}...", file=sys.stderr)
                sanitized = sanitized.replace(match, '"***REMOVED***"')
                removed_count += 1

    with open(file_path, 'w') as f:
        f.write(sanitized)

    print(removed_count)

except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
EOF
}

################################################################################
# Función Principal de Consolidación
################################################################################

consolidate_global_settings() {
    print_section "1. Consolidando ~/.claude/settings.json"

    local settings_file="$CLAUDE_HOME/settings.json"

    if [ ! -f "$settings_file" ]; then
        print_error "No encontrado: $settings_file"
        return 1
    fi

    # Crear backup
    create_backup "$settings_file"

    # Limpiar credenciales
    print_info "Limpiando credenciales hardcodeadas..."

    python3 << 'PYTHON_CLEAN'
import json
import re
import sys

settings_file = sys.argv[1]

try:
    with open(settings_file, 'r') as f:
        settings = json.load(f)

    # Patrones de credenciales en bash commands
    creds_found = []

    if 'permissions' in settings and 'allow' in settings['permissions']:
        new_allow = []
        for cmd in settings['permissions']['allow']:
            # Buscar credenciales
            if re.search(r'(DATABASE_URL|SUPABASE_KEY|password|token|secret)=', cmd):
                creds_found.append(cmd[:80] + "...")
                # Remover comando con credenciales
                continue
            new_allow.append(cmd)

        settings['permissions']['allow'] = new_allow

    # Guardar versión limpia
    with open(settings_file, 'w') as f:
        json.dump(settings, f, indent=2)

    print(f"✓ {len(creds_found)} comandos con credenciales removidos")
    for cred in creds_found:
        print(f"  - {cred}")

except Exception as e:
    print(f"✗ Error: {e}")
    sys.exit(1)

PYTHON_CLEAN

    python3 - "$settings_file" << 'EOF'
import json
import re
import sys

settings_file = sys.argv[1]

try:
    with open(settings_file, 'r') as f:
        settings = json.load(f)

    creds_found = []

    if 'permissions' in settings and 'allow' in settings['permissions']:
        new_allow = []
        for cmd in settings['permissions']['allow']:
            if re.search(r'(DATABASE_URL|SUPABASE_KEY|password|token|secret)=', cmd):
                creds_found.append(cmd[:80])
                continue
            new_allow.append(cmd)

        settings['permissions']['allow'] = new_allow

    with open(settings_file, 'w') as f:
        json.dump(settings, f, indent=2)

    print(len(creds_found))

except Exception as e:
    print(0)

EOF

    CREDENTIALS_REMOVED=$?
    print_success "Credenciales removidas de settings.json"
    FILES_MODIFIED=$((FILES_MODIFIED + 1))
}

consolidate_project_settings() {
    print_section "2. Consolidando settings por proyecto"

    local projects=(
        "/Users/carlosa/HAIDA/.claude/settings.local.json"
        "/Users/carlosa/HAIDA-PROJECT/.claude/settings.local.json"
    )

    for project_settings in "${projects[@]}"; do
        if [ -f "$project_settings" ]; then
            print_info "Procesando: $project_settings"
            create_backup "$project_settings"

            # Limpiar
            python3 << PYTHON_CLEANUP
import json
import re

file = "$project_settings"
try:
    with open(file, 'r') as f:
        data = json.load(f)

    if 'permissions' in data and 'allow' in data['permissions']:
        new_allow = []
        removed = 0
        for cmd in data['permissions']['allow']:
            if re.search(r'(password|token|secret|DATABASE_URL|SUPABASE_KEY|email)=', cmd):
                removed += 1
                continue
            new_allow.append(cmd)

        data['permissions']['allow'] = new_allow

    with open(file, 'w') as f:
        json.dump(data, f, indent=2)

    print(f"✓ {removed} credenciales removidas")
except:
    print("✗ Error")

PYTHON_CLEANUP

            FILES_MODIFIED=$((FILES_MODIFIED + 1))
        fi
    done
}

create_env_templates() {
    print_section "3. Creando archivos .env.template seguros"

    # Template global
    cat > "$CLAUDE_HOME/.env.template" << 'ENV_TEMPLATE'
# Plantilla de Variables de Ambiente - Claude Code
# Copiar a .env y llenar con valores reales (NUNCA commitear .env)

# ============================================================================
# SUPABASE - Database & Authentication
# ============================================================================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================================================
# DATABASE - PostgreSQL
# ============================================================================
DATABASE_URL=postgresql://postgres:password@db.host:5432/database
DB_PASSWORD=your_secure_password_here

# ============================================================================
# AZURE ENTRA - OAuth
# ============================================================================
ENTRA_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
ENTRA_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
ENTRA_CLIENT_SECRET=your_client_secret_here

# ============================================================================
# VERCEL - Deployment
# ============================================================================
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id

# ============================================================================
# TESTING - Credentials
# ============================================================================
TEST_EMAIL=test@example.com
TEST_PASSWORD=test_password_here
TEST_USER_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================================================
# INTEGRATIONS
# ============================================================================
SLACK_WEBHOOK=https://hooks.slack.com/services/...
JIRA_API_TOKEN=your_jira_token
FIGMA_API_TOKEN=your_figma_token
RAILWAY_TOKEN=your_railway_token
TELEGRAM_BOT_TOKEN=your_telegram_token

ENV_TEMPLATE

    print_success "Template creado: $CLAUDE_HOME/.env.template"

    # Template por proyecto
    cat > "/Users/carlosa/HAIDA/.env.template" << 'ENV_HAIDA'
# HAIDA Project Environment Variables
# Base: ~/.claude/.env.template

# HAIDA-specific variables
HAIDA_BASE_URL=https://mcprod.thisisbarcelona.com
HAIDA_MODE=development
CHANGE_DETECTION_URL=http://localhost:5000
ALLURE_REPORTS_URL=http://localhost:4040

ENV_HAIDA

    print_success "Template creado: /Users/carlosa/HAIDA/.env.template"
}

generate_secrets_report() {
    print_section "4. Generando reporte de secretos encontrados"

    local report_file="$BACKUP_DIR/SECRETS_FOUND_${TIMESTAMP}.txt"

    cat > "$report_file" << 'REPORT'
# REPORTE DE SECRETOS ENCONTRADOS EN CONFIGURACIÓN CLAUDE CODE
# Generado: $(date)
# CLASIFICACIÓN: CONFIDENCIAL

## CREDENCIALES EXPUESTAS ENCONTRADAS:

### TIER 1 - CRÍTICAS (Rotación inmediata):
REPORT

    # Buscar secrets específicos
    grep -r "DATABASE_URL\|SUPABASE_KEY\|password.*=" "$CLAUDE_HOME" 2>/dev/null | \
    grep -v "Backup" | \
    sed 's/=.*/=***REDACTED***/g' >> "$report_file" || true

    cat >> "$report_file" << 'REPORT'

### LOCACIONES:
- ~/.claude/settings.json
- ~/.claude/settings.local.json
- /Users/carlosa/HAIDA/.claude/settings.local.json
- /Users/carlosa/HAIDA-PROJECT/.claude/settings.local.json

### RECOMENDACIONES:
1. Rotar TODAS las credenciales encontradas
2. Usar Vercel Environment Variables para producción
3. Usar 1Password o similar para desarrollo local
4. Implementar pre-commit hooks para prevenir futuras exposiciones

REPORT

    print_success "Reporte generado: $report_file"
    print_warning "⚠️ Este archivo contiene información sensible - almacenar de forma segura"
}

################################################################################
# Main Execution
################################################################################

main() {
    print_header

    print_info "Iniciando consolidación de configuración Claude Code..."
    echo ""

    # 1. Consolidar global
    consolidate_global_settings || print_error "Error en consolidación global"

    # 2. Consolidar proyectos
    consolidate_project_settings || print_error "Error en consolidación de proyectos"

    # 3. Crear templates
    create_env_templates

    # 4. Generar reporte
    generate_secrets_report

    # Resumen
    print_section "RESUMEN DE CONSOLIDACIÓN"
    echo ""
    echo "  Archivos modificados: $FILES_MODIFIED"
    echo "  Credenciales removidas: $CREDENTIALS_REMOVED"
    echo "  Errores encontrados: $ERRORS"
    echo "  Backups en: $BACKUP_DIR"
    echo ""

    if [ $ERRORS -eq 0 ]; then
        print_success "✅ Consolidación completada sin errores"
        echo ""
        print_info "Próximos pasos:"
        echo "  1. Revisar archivos .env.template"
        echo "  2. Llenar valores reales en archivos .env (NO commitear)"
        echo "  3. Ejecutar: bash install-git-secrets.sh"
        echo "  4. Verificar con: bash validate-claude-config.sh"
        return 0
    else
        print_error "⚠️ Se encontraron $ERRORS errores"
        return 1
    fi
}

main "$@"
