#!/bin/bash

################################################################################
# MONITOR DE CONFIGURACIÓN - CLAUDE CODE
# Propósito: Monitorear cambios en configuración y alertar de exposiciones
# Uso: bash monitor-claude-config.sh [--daemon] [--interval 3600]
# Se ejecuta como proceso background o vía cron
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
MONITOR_DIR="$HOME/.claude-monitor"
LAST_STATE_FILE="$MONITOR_DIR/last-state.json"
CHANGES_LOG="$MONITOR_DIR/changes.log"
ALERTS_LOG="$MONITOR_DIR/alerts.log"
DAEMON_MODE=false
CHECK_INTERVAL=3600  # 1 hora por defecto
RUNNING_PID_FILE="$MONITOR_DIR/.monitor.pid"

# Crear directorio si no existe
mkdir -p "$MONITOR_DIR"

################################################################################
# Argumentos
################################################################################

while [[ $# -gt 0 ]]; do
    case $1 in
        --daemon)
            DAEMON_MODE=true
            shift
            ;;
        --interval)
            CHECK_INTERVAL=$2
            shift 2
            ;;
        --stop)
            if [ -f "$RUNNING_PID_FILE" ]; then
                kill $(cat "$RUNNING_PID_FILE") 2>/dev/null || true
                rm "$RUNNING_PID_FILE"
                echo "Monitor detenido"
            fi
            exit 0
            ;;
        --status)
            if [ -f "$RUNNING_PID_FILE" ]; then
                echo "Monitor corriendo (PID: $(cat $RUNNING_PID_FILE))"
            else
                echo "Monitor no está corriendo"
            fi
            exit 0
            ;;
        *)
            echo "Uso: $0 [--daemon] [--interval SEGUNDOS] [--stop] [--status]"
            exit 1
            ;;
    esac
done

################################################################################
# Funciones
################################################################################

print_header() {
    echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  MONITOR DE CONFIGURACIÓN - CLAUDE CODE${NC}                  ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

log_change() {
    local message=$1
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] $message" >> "$CHANGES_LOG"
}

log_alert() {
    local severity=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$severity] $message" >> "$ALERTS_LOG"
}

alert_critical() {
    local message=$1
    echo -e "${RED}🔴 ALERTA CRÍTICA: $message${NC}"
    log_alert "CRÍTICA" "$message"

    # Enviar notificación (si está configurado)
    notify_user "CRÍTICA" "$message"
}

alert_warning() {
    local message=$1
    echo -e "${YELLOW}⚠️ ADVERTENCIA: $message${NC}"
    log_alert "ADVERTENCIA" "$message"
}

notify_user() {
    local severity=$1
    local message=$2

    # TODO: Integrar con Slack, email, etc.
    # Por ahora solo log

    # Descomenta para notificaciones Slack:
    # if [ -n "$SLACK_WEBHOOK" ]; then
    #     curl -X POST "$SLACK_WEBHOOK" \
    #         -H 'Content-Type: application/json' \
    #         -d "{\"text\": \"[$severity] $message\"}"
    # fi
}

get_file_hash() {
    local file=$1
    if [ -f "$file" ]; then
        shasum "$file" | awk '{print $1}'
    else
        echo "FILE_NOT_FOUND"
    fi
}

get_file_modification_time() {
    local file=$1
    if [ -f "$file" ]; then
        stat -f%m "$file" 2>/dev/null || stat -c %Y "$file" 2>/dev/null
    else
        echo "0"
    fi
}

check_for_credentials() {
    local file=$1
    local critical_patterns=(
        "DATABASE_URL.*postgres.*password"
        "SUPABASE_KEY.*eyJ"
        "ENTRA_CLIENT_SECRET="
        "VERCEL.*TOKEN="
        "password.*="
    )

    for pattern in "${critical_patterns[@]}"; do
        if grep -E "$pattern" "$file" 2>/dev/null | grep -v "^#" > /dev/null; then
            return 0  # Credenciales encontradas
        fi
    done

    return 1  # Sin credenciales
}

check_file_permissions() {
    local file=$1
    local perms=$(stat -f %A "$file" 2>/dev/null || stat -c %a "$file" 2>/dev/null)

    # .env files deben ser 600 o 700
    if [[ "$file" == *".env"* ]]; then
        if [[ "$perms" != "600" && "$perms" != "700" ]]; then
            alert_warning "Permisos débiles en $file: $perms (debería ser 600)"
        fi
    fi

    # .credentials.json debe ser 600
    if [[ "$file" == *".credentials.json"* ]]; then
        if [[ "$perms" != "600" ]]; then
            alert_critical "Permisos débiles en $file: $perms (debe ser 600)"
        fi
    fi
}

scan_directory() {
    print_section "Escaneando directorio: $1"

    local dir=$1
    local scan_results="$MONITOR_DIR/scan-$(date +%s).json"

    # Crear snapshot JSON
    echo "{" > "$scan_results"
    echo "  \"scan_time\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"," >> "$scan_results"
    echo "  \"files_checked\": [" >> "$scan_results"

    local first=true
    local credentials_found=0
    local permission_issues=0

    for file in $(find "$dir" -type f \( -name "*.json" -o -name ".env*" \) 2>/dev/null); do
        # Ignorar backups
        if [[ "$file" == *"backup"* ]] || [[ "$file" == *".cache"* ]]; then
            continue
        fi

        if ! $first; then echo "," >> "$scan_results"; fi
        first=false

        # Verificar credenciales
        if check_for_credentials "$file"; then
            credentials_found=$((credentials_found + 1))
            alert_critical "Credenciales encontradas en: $file"

            echo "    {" >> "$scan_results"
            echo "      \"file\": \"$file\"," >> "$scan_results"
            echo "      \"has_credentials\": true," >> "$scan_results"
            echo "      \"severity\": \"CRITICAL\"" >> "$scan_results"
            echo "    }" >> "$scan_results"
        else
            # Verificar permisos
            check_file_permissions "$file"

            echo "    {" >> "$scan_results"
            echo "      \"file\": \"$file\"," >> "$scan_results"
            echo "      \"has_credentials\": false," >> "$scan_results"
            echo "      \"hash\": \"$(get_file_hash $file)\"," >> "$scan_results"
            echo "      \"modified\": $(get_file_modification_time $file)" >> "$scan_results"
            echo "    }" >> "$scan_results"
        fi
    done

    echo "  ]" >> "$scan_results"
    echo "}" >> "$scan_results"

    if [ $credentials_found -gt 0 ]; then
        alert_critical "Se encontraron $credentials_found archivos con posibles credenciales"
    fi
}

check_git_hooks() {
    print_section "Verificando git-hooks"

    # Verificar que hooks están instalados
    if ! git config --global core.hooksPath > /dev/null 2>&1; then
        alert_warning "Git hooks NO configurado globalmente"
    fi

    # Verificar que pre-commit hook existe
    if [ ! -f "$HOME/.git-hooks/pre-commit" ]; then
        alert_warning "Pre-commit hook NO encontrado"
    fi
}

check_environment_variables() {
    print_section "Verificando variables de ambiente"

    # Buscar secrets en ambiente actual
    if env | grep -E "(PASSWORD|TOKEN|SECRET|DATABASE_URL)" | grep -v "^#" > /dev/null; then
        alert_warning "Secrets encontrados en variables de ambiente (revisar ~/.bash_profile)"
    fi
}

generate_monitor_report() {
    print_section "Generando reporte de monitoreo"

    local report_file="$MONITOR_DIR/monitor-report-$(date +%Y%m%d).txt"

    cat > "$report_file" << REPORT
REPORTE DE MONITOREO - CONFIGURACIÓN CLAUDE CODE
Generado: $(date)
====================================================================

ARCHIVOS MONITOREADOS:
- $CLAUDE_HOME/settings.json
- $CLAUDE_HOME/settings.local.json
- /Users/carlosa/HAIDA/.claude/settings.local.json
- /Users/carlosa/HAIDA-PROJECT/.claude/settings.local.json

ÚLTIMAS ALERTAS:
$(tail -20 "$ALERTS_LOG" 2>/dev/null || echo "Sin alertas")

CAMBIOS RECIENTES:
$(tail -20 "$CHANGES_LOG" 2>/dev/null || echo "Sin cambios")

====================================================================
Estado del monitoreo: ACTIVO
Intervalo de chequeo: $CHECK_INTERVAL segundos
Próximo chequeo: $(date -d "+$CHECK_INTERVAL seconds" 2>/dev/null || date -v +${CHECK_INTERVAL}S)
REPORT

    echo -e "${GREEN}Reporte generado: $report_file${NC}"
}

print_section() {
    echo -e "\n${BLUE}▶ $1${NC}"
}

run_checks() {
    print_header

    echo "Iniciando chequeos de configuración..."
    echo ""

    # Chequeos
    scan_directory "$CLAUDE_HOME"
    scan_directory "/Users/carlosa/HAIDA/.claude"
    scan_directory "/Users/carlosa/HAIDA-PROJECT/.claude"

    check_git_hooks
    check_environment_variables

    echo ""
    generate_monitor_report
}

daemon_mode() {
    echo -e "${BLUE}Iniciando monitor en modo daemon${NC}"
    echo "PID: $$"
    echo $$ > "$RUNNING_PID_FILE"

    # Trap para limpieza
    trap 'rm -f "$RUNNING_PID_FILE"; exit 0' SIGTERM SIGINT

    while true; do
        echo ""
        echo "=== Chequeo de monitoreo: $(date) ==="
        run_checks

        echo "Próximo chequeo en $CHECK_INTERVAL segundos..."
        sleep $CHECK_INTERVAL
    done
}

################################################################################
# Main
################################################################################

if $DAEMON_MODE; then
    daemon_mode
else
    run_checks
fi
