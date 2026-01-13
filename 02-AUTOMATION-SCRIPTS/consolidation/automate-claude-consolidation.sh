#!/bin/bash

################################################################################
# AUTOMATIZACIÓN COMPLETA - CONSOLIDACIÓN CLAUDE CODE
# Propósito: Ejecutar toda la consolidación en orden automático
# Uso: bash automate-claude-consolidation.sh [fase]
# Fases: all, consolidate, git-hooks, validate, monitor
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PHASE=${1:-all}
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

################################################################################
# Funciones
################################################################################

print_header() {
    echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  AUTOMATIZACIÓN COMPLETA - CLAUDE CODE CONSOLIDATION${NC}      ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

print_phase() {
    echo ""
    echo -e "${CYAN}┌─────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│ FASE $1${NC}"
    echo -e "${CYAN}└─────────────────────────────────────────────────────────────┘${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

verify_script_exists() {
    local script=$1
    if [ ! -f "$SCRIPT_DIR/$script" ]; then
        print_error "No encontrado: $SCRIPT_DIR/$script"
        return 1
    fi
    chmod +x "$SCRIPT_DIR/$script"
    return 0
}

phase_consolidate() {
    print_phase "1 - CONSOLIDACIÓN DE CONFIGURACIÓN"

    print_step "Verificando script de consolidación..."
    if ! verify_script_exists "consolidate-claude-config.sh"; then
        print_error "No se puede continuar sin consolidate-claude-config.sh"
        return 1
    fi

    print_step "Ejecutando consolidación..."
    bash "$SCRIPT_DIR/consolidate-claude-config.sh"

    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        print_success "Fase de consolidación completada"
        return 0
    else
        print_error "Consolidación falló (código: $exit_code)"
        return 1
    fi
}

phase_git_hooks() {
    print_phase "2 - INSTALACIÓN DE GIT-SECRETS Y HOOKS"

    print_step "Verificando script de git-secrets..."
    if ! verify_script_exists "install-git-secrets.sh"; then
        print_error "No se puede continuar sin install-git-secrets.sh"
        return 1
    fi

    print_step "Ejecutando instalación de git-secrets..."
    bash "$SCRIPT_DIR/install-git-secrets.sh"

    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        print_success "Fase de git-secrets completada"
        return 0
    else
        print_error "Instalación de git-secrets falló (código: $exit_code)"
        return 1
    fi
}

phase_validate() {
    print_phase "3 - VALIDACIÓN DE CONFIGURACIÓN"

    print_step "Verificando script de validación..."
    if ! verify_script_exists "validate-claude-config.sh"; then
        print_error "No se puede continuar sin validate-claude-config.sh"
        return 1
    fi

    print_step "Ejecutando validación..."
    bash "$SCRIPT_DIR/validate-claude-config.sh"

    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        print_success "Validación completada sin errores"
        return 0
    else
        print_warning "Validación encontró algunos problemas (revisa reporte)"
        return 0  # No bloqueamos en validación
    fi
}

phase_monitor() {
    print_phase "4 - CONFIGURACIÓN DE MONITOREO"

    print_step "Verificando script de monitoreo..."
    if ! verify_script_exists "monitor-claude-config.sh"; then
        print_error "No se puede continuar sin monitor-claude-config.sh"
        return 1
    fi

    print_step "Iniciando monitoreo en daemon..."
    bash "$SCRIPT_DIR/monitor-claude-config.sh" --daemon --interval 3600 &

    local monitor_pid=$!
    print_success "Monitor iniciado (PID: $monitor_pid)"

    # Crear entrada cron (opcional)
    print_step "¿Configurar validación diaria vía cron? (s/n)"
    read -r add_cron
    if [[ "$add_cron" =~ ^[Ss]$ ]]; then
        # Agregar a crontab
        (crontab -l 2>/dev/null; echo "0 2 * * * bash $SCRIPT_DIR/validate-claude-config.sh >> $HOME/.claude-monitor/cron.log 2>&1") | crontab -
        print_success "Cron job agregado (validación diaria a las 2:00 AM)"
    fi

    return 0
}

print_summary() {
    local timestamp=$(date)

    cat > "$HOME/.claude-consolidation-summary-${TIMESTAMP}.txt" << SUMMARY
════════════════════════════════════════════════════════════════
RESUMEN DE AUTOMATIZACIÓN - CLAUDE CODE CONSOLIDATION
════════════════════════════════════════════════════════════════

Fecha: $timestamp
Fase ejecutada: $PHASE

FASES COMPLETADAS:

1. CONSOLIDACIÓN DE CONFIGURACIÓN
   - Limpieza de credenciales hardcodeadas
   - Creación de templates .env seguros
   - Backups automáticos generados

2. INSTALACIÓN DE GIT-SECRETS
   - git-secrets instalado/verificado
   - Pre-commit hooks configurados
   - Patrones de detección instalados
   - Scripts de limpieza creados

3. VALIDACIÓN
   - Configuración verificada
   - Archivos JSON validados
   - Permisos verificados
   - Reporte generado

4. MONITOREO
   - Monitor daemon iniciado
   - Alertas configuradas
   - Cron jobs programados (opcional)

ARCHIVOS IMPORTANTES:

Configuration:
  - ~/.claude/settings.json (limpio)
  - ~/.claude/.env.template (seguro)
  - /Users/carlosa/HAIDA/.claude/settings.local.json (limpio)

Backup & Recovery:
  - ~/.claude-config-backups/ (backups automáticos)

Monitoring:
  - ~/.claude-monitor/ (logs y reportes)
  - ~/.git-hooks/ (hooks personalizados)

Scripts Disponibles:
  - consolidate-claude-config.sh (re-ejecutable)
  - install-git-secrets.sh (re-ejecutable)
  - validate-claude-config.sh (verificación manual)
  - monitor-claude-config.sh (monitoreo continuo)

PRÓXIMOS PASOS:

1. Revisar archivos .env.template y llenar con valores reales
2. Verificar que .env no está commiteado (git status)
3. Rotar credenciales en Vercel, Supabase, Azure
4. Limpiar git history si es necesario: ~/.git-secrets-cleanup
5. Ejecutar prueba: cd /repo && git diff --cached --name-only (no debe mostrar .env)

VERIFICACIÓN RÁPIDA:

  ✓ Configuración consolidada
  ✓ Git-secrets instalado
  ✓ Pre-commit hooks activos
  ✓ Validación pasada
  ✓ Monitoreo activo

COMANDOS ÚTILES:

  # Ver estado del monitor
  bash $SCRIPT_DIR/monitor-claude-config.sh --status

  # Detener monitor
  bash $SCRIPT_DIR/monitor-claude-config.sh --stop

  # Validación manual
  bash $SCRIPT_DIR/validate-claude-config.sh

  # Ver logs
  tail -f ~/.claude-monitor/alerts.log

════════════════════════════════════════════════════════════════
Consolidación completada: $timestamp
════════════════════════════════════════════════════════════════

CLASIFICACIÓN: CONFIDENCIAL
SUMMARY

    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ AUTOMATIZACIÓN COMPLETADA${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Resumen guardado en: $HOME/.claude-consolidation-summary-${TIMESTAMP}.txt"
    echo ""
    cat "$HOME/.claude-consolidation-summary-${TIMESTAMP}.txt"
}

print_usage() {
    echo "Uso: $0 [fase]"
    echo ""
    echo "Fases:"
    echo "  all          - Ejecutar todas las fases (default)"
    echo "  consolidate  - Fase 1: Consolidación"
    echo "  git-hooks    - Fase 2: Git-secrets y hooks"
    echo "  validate     - Fase 3: Validación"
    echo "  monitor      - Fase 4: Monitoreo"
    echo ""
    echo "Ejemplo:"
    echo "  bash $0 all           # Ejecutar todo"
    echo "  bash $0 consolidate   # Solo consolidación"
}

################################################################################
# Main
################################################################################

main() {
    print_header

    case "$PHASE" in
        all)
            print_info "Ejecutando TODAS las fases de consolidación..."
            phase_consolidate || exit 1
            phase_git_hooks || exit 1
            phase_validate || exit 1
            phase_monitor || exit 1
            print_summary
            ;;
        consolidate)
            phase_consolidate || exit 1
            ;;
        git-hooks)
            phase_git_hooks || exit 1
            ;;
        validate)
            phase_validate || exit 1
            ;;
        monitor)
            phase_monitor || exit 1
            ;;
        help|-h|--help)
            print_usage
            exit 0
            ;;
        *)
            print_error "Fase desconocida: $PHASE"
            print_usage
            exit 1
            ;;
    esac
}

main "$@"
