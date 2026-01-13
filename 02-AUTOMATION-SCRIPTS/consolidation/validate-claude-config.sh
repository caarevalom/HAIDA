#!/bin/bash

################################################################################
# VALIDADOR DE CONFIGURACIÓN - CLAUDE CODE
# Propósito: Verificar que no hay secretos ni credenciales expuestas
# Uso: bash validate-claude-config.sh
# Frecuencia: Ejecutar antes de cada commit o via cron diario
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuración
CLAUDE_HOME="$HOME/.claude"
REPORT_FILE="/tmp/claude-config-validation-$(date +%Y%m%d-%H%M%S).txt"
ISSUES_FOUND=0
WARNINGS_FOUND=0
CRITICAL_ISSUES=0

################################################################################
# Funciones de Utilidad
################################################################################

print_header() {
    echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  VALIDADOR DE CONFIGURACIÓN - CLAUDE CODE${NC}               ${BLUE}║${NC}"
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
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
}

print_critical() {
    echo -e "${RED}🔴 CRÍTICO: $1${NC}"
    CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
    WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_pass() {
    echo -e "${CYAN}→ $1${NC}"
}

################################################################################
# Funciones de Validación
################################################################################

validate_settings_json() {
    print_section "1. Validando ~/.claude/settings.json"

    local settings_file="$CLAUDE_HOME/settings.json"

    # Verificar que existe
    if [ ! -f "$settings_file" ]; then
        print_error "No encontrado: $settings_file"
        return 1
    fi

    # Verificar JSON válido
    if ! python3 -m json.tool "$settings_file" > /dev/null 2>&1; then
        print_critical "JSON inválido en: $settings_file"
        return 1
    fi

    print_pass "JSON válido"

    # Buscar credenciales
    print_pass "Buscando credenciales hardcodeadas..."

    local creds_found=0

    if grep -E "(DATABASE_URL.*password|SUPABASE_KEY.*eyJ)" "$settings_file" 2>/dev/null; then
        print_critical "Credenciales encontradas en settings.json"
        creds_found=$((creds_found + 1))
    fi

    if grep -E "(password|token|secret).*=" "$settings_file" | grep -v "^#" | grep -v "^//" > /dev/null; then
        print_warning "Posibles credenciales en settings.json (revisar manualmente)"
        creds_found=$((creds_found + 1))
    fi

    # Verificar plugins
    print_pass "Validando plugins habilitados..."

    if ! grep -q "enabledPlugins" "$settings_file"; then
        print_warning "No se encontró campo enabledPlugins"
    else
        local plugin_count=$(grep -o '".*@claude-plugins-official"' "$settings_file" | wc -l)
        print_success "Plugins habilitados: $plugin_count"
    fi

    return $creds_found
}

validate_project_settings() {
    print_section "2. Validando settings por proyecto"

    local projects=(
        "/Users/carlosa/HAIDA/.claude/settings.local.json"
        "/Users/carlosa/HAIDA-PROJECT/.claude/settings.local.json"
    )

    for project_settings in "${projects[@]}"; do
        if [ ! -f "$project_settings" ]; then
            print_info "No encontrado: $project_settings (OK - heredita global)"
            continue
        fi

        echo ""
        print_pass "Validando: $project_settings"

        # JSON válido
        if ! python3 -m json.tool "$project_settings" > /dev/null 2>&1; then
            print_critical "JSON inválido en: $project_settings"
            continue
        fi

        # Buscar credenciales específicas
        if grep -E "(DATABASE_URL|SUPABASE_KEY|password=|token=)" "$project_settings" 2>/dev/null | \
           grep -v "^#" > /dev/null; then
            print_critical "Credenciales encontradas en: $project_settings"
        else
            print_success "Sin credenciales hardcodeadas"
        fi

        # Validar permisos
        if grep -q '"allow"' "$project_settings"; then
            local allow_count=$(grep -o '"Bash(' "$project_settings" | wc -l)
            print_pass "Permisos bash: $allow_count"
        fi
    done
}

validate_env_files() {
    print_section "3. Validando archivos .env"

    local env_files=(
        "$CLAUDE_HOME/.env"
        "/Users/carlosa/HAIDA/.env"
        "/Users/carlosa/HAIDA-PROJECT/.env"
        "/Users/carlosa/Privalia/.env"
    )

    for env_file in "${env_files[@]}"; do
        if [ -f "$env_file" ]; then
            print_warning ".env file encontrado: $env_file (verificar en .gitignore)"

            # Verificar que está en .gitignore
            local repo_dir=$(dirname "$env_file")
            if [ -d "$repo_dir/.git" ]; then
                if ! grep -q "^\.env" "$repo_dir/.gitignore" 2>/dev/null; then
                    print_critical ".env NO está en .gitignore: $repo_dir"
                fi
            fi
        fi
    done

    # Verificar .env.example files (deben estar, sin credenciales)
    echo ""
    print_pass "Verificando templates .env.example..."

    for example_file in "$CLAUDE_HOME"/.env.template /Users/carlosa/HAIDA/.env.template; do
        if [ -f "$example_file" ]; then
            if grep -E "password|token|secret|DATABASE_URL" "$example_file" | \
               grep -v "=" > /dev/null; then
                print_critical "Credenciales en template: $example_file"
            else
                print_success "Template seguro: $example_file"
            fi
        fi
    done
}

validate_git_repos() {
    print_section "4. Validando repositorios Git"

    local repos=(
        "/Users/carlosa/HAIDA"
        "/Users/carlosa/HAIDA-PROJECT"
        "/Users/carlosa/Privalia"
    )

    for repo_dir in "${repos[@]}"; do
        if [ ! -d "$repo_dir/.git" ]; then
            print_info "No es git repo: $repo_dir (OK)"
            continue
        fi

        echo ""
        print_pass "Validando: $repo_dir"

        cd "$repo_dir"

        # Verificar .gitignore
        if [ ! -f ".gitignore" ]; then
            print_warning "No .gitignore encontrado"
        else
            if ! grep -q "\.env" ".gitignore"; then
                print_critical ".env* NO está en .gitignore"
            else
                print_success ".env* está en .gitignore"
            fi

            if ! grep -q "settings.local.json" ".gitignore"; then
                print_warning "settings.local.json NO está en .gitignore"
            else
                print_success "settings.local.json está en .gitignore"
            fi
        fi

        # Buscar secretos en archivos tracked
        print_pass "Buscando secretos en archivos tracked..."

        local secrets_in_files=0
        while IFS= read -r file; do
            if [ -f "$file" ]; then
                if grep -E "DATABASE_URL.*postgres|SUPABASE_KEY.*eyJ|password.*=" "$file" 2>/dev/null | \
                   grep -v "^#" | grep -v "template" > /dev/null; then
                    print_critical "Posible secreto en: $repo_dir/$file"
                    secrets_in_files=$((secrets_in_files + 1))
                fi
            fi
        done < <(git ls-files 2>/dev/null)

        if [ $secrets_in_files -eq 0 ]; then
            print_success "Sin secretos en archivos tracked"
        fi

        # Búsqueda en history
        print_pass "Buscando en git history..."

        if git log -p --all 2>/dev/null | \
           grep -E "(DATABASE_URL|SUPABASE_KEY).*password|token.*eyJ" | head -1 > /dev/null; then
            print_warning "Posibles secretos en git history (considera limpiar)"
        else
            print_success "Sin secretos recientes en history"
        fi
    done
}

validate_claude_hooks() {
    print_section "5. Validando git-secrets hooks"

    # Verificar que git está configurado con hooks
    if git config --global core.hooksPath > /dev/null 2>&1; then
        local hooks_path=$(git config --global core.hooksPath)
        print_success "Git hooks configurado en: $hooks_path"

        if [ -f "$hooks_path/pre-commit" ]; then
            print_success "Pre-commit hook existe"
        else
            print_warning "Pre-commit hook NO encontrado"
        fi
    else
        print_warning "Git hooks NO configurado globalmente"
    fi

    # Verificar git-secrets
    if command -v git-secrets &> /dev/null; then
        print_success "git-secrets instalado"
    else
        print_warning "git-secrets NO instalado (instalar con: bash install-git-secrets.sh)"
    fi
}

validate_credentials_storage() {
    print_section "6. Validando almacenamiento de credenciales"

    # Verificar .credentials.json
    if [ -f "$CLAUDE_HOME/.credentials.json" ]; then
        if [ $(stat -f%A "$CLAUDE_HOME/.credentials.json" 2>/dev/null || stat -c %a "$CLAUDE_HOME/.credentials.json") != "600" ]; then
            print_warning "Permisos de .credentials.json no son restrictivos (600)"
        else
            print_success ".credentials.json tiene permisos restrictivos (600)"
        fi
    fi

    # Verificar que no hay secrets en history.jsonl
    if [ -f "$CLAUDE_HOME/history.jsonl" ]; then
        if grep -E "(password|token|secret|DATABASE_URL|SUPABASE_KEY)" "$CLAUDE_HOME/history.jsonl" | \
           head -1 > /dev/null; then
            print_warning "Posibles secretos en history.jsonl (revisar manualmente)"
        else
            print_success "Sin secretos en history.jsonl"
        fi
    fi
}

validate_vercel_integration() {
    print_section "7. Validando integración Vercel"

    # Buscar token de Vercel expuesto
    if grep -r "vercel.*token\|VERCEL.*TOKEN" "$CLAUDE_HOME" 2>/dev/null | \
       grep -v "^#" | grep -v ".backup" > /dev/null; then
        print_critical "Token Vercel posiblemente expuesto"
    else
        print_success "Sin tokens Vercel expuestos localmente"
    fi

    # Verificar que Vercel environment variables están configuradas
    if [ -d "/Users/carlosa/HAIDA/.vercel" ]; then
        print_pass "Vercel config encontrado en HAIDA"
        if grep -q "projectId" "/Users/carlosa/HAIDA/.vercel/project.json"; then
            print_success "Vercel project configurado"
        fi
    fi
}

generate_report() {
    print_section "8. Generando reporte"

    cat > "$REPORT_FILE" << REPORT
REPORTE DE VALIDACIÓN - CONFIGURACIÓN CLAUDE CODE
Generado: $(date)
====================================================================

RESUMEN:
- Problemas críticos: $CRITICAL_ISSUES
- Advertencias: $WARNINGS_FOUND
- Problemas totales: $ISSUES_FOUND

DETALLES:

1. Archivos validados:
   - ~/.claude/settings.json
   - ~/.claude/settings.local.json
   - Todos los .env files
   - Todos los repositorios Git

2. Verificaciones realizadas:
   - JSON válido
   - Credenciales hardcodeadas
   - .gitignore correcto
   - git-secrets configurado
   - Permisos de archivos
   - Secretos en git history

3. Repos auditados:
   - /Users/carlosa/HAIDA
   - /Users/carlosa/HAIDA-PROJECT
   - /Users/carlosa/Privalia

====================================================================
Reporte completado: $(date)
REPORT

    print_success "Reporte guardado: $REPORT_FILE"
}

print_summary() {
    print_section "RESUMEN DE VALIDACIÓN"

    echo ""
    echo "  Problemas críticos: $CRITICAL_ISSUES"
    echo "  Advertencias: $WARNINGS_FOUND"
    echo "  Total de problemas: $ISSUES_FOUND"
    echo ""

    if [ $CRITICAL_ISSUES -gt 0 ]; then
        print_critical "Se encontraron $CRITICAL_ISSUES problemas críticos"
        echo ""
        echo "Acciones requeridas:"
        if [ $CRITICAL_ISSUES -gt 0 ]; then
            echo "  1. Ejecutar: bash consolidate-claude-config.sh"
            echo "  2. Rotar todas las credenciales en Vercel"
            echo "  3. Ejecutar: bash install-git-secrets.sh"
            echo "  4. Limpiar git history: ~/.git-secrets-cleanup"
        fi
        return 1
    elif [ $WARNINGS_FOUND -gt 0 ]; then
        print_warning "Se encontraron $WARNINGS_FOUND advertencias"
        echo ""
        echo "Revisar reporte: $REPORT_FILE"
        return 0
    else
        print_success "✅ Configuración validada correctamente"
        return 0
    fi
}

################################################################################
# Main
################################################################################

main() {
    print_header

    validate_settings_json || true
    validate_project_settings || true
    validate_env_files || true
    validate_git_repos || true
    validate_claude_hooks || true
    validate_credentials_storage || true
    validate_vercel_integration || true

    echo ""
    generate_report
    print_summary

    local exit_code=$?
    echo ""
    print_info "Reporte completo: $REPORT_FILE"

    return $exit_code
}

main "$@"
