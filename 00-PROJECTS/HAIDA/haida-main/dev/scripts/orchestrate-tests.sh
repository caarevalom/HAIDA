#!/bin/bash
# HAIDA Test Orchestration Script
# Ejecuta suite completa de pruebas con reportes y sincronización

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║         HAIDA v2.1.0 - Test Orchestration            ║"
echo "╚════════════════════════════════════════════════════════╝"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_DIR="reports/orchestration_${TIMESTAMP}"
mkdir -p "$REPORT_DIR"

# Test results tracking (POSIX-friendly)
suite_names=()
suite_status=()
total_tests=0
passed_tests=0
failed_tests=0

# Function: Run test suite
run_test_suite() {
  local suite_name=$1
  local command=$2

  echo -e "\n${YELLOW}▶ Ejecutando: ${suite_name}${NC}"

  set +e
  eval "$command" > "$REPORT_DIR/${suite_name}.log" 2>&1
  local status=$?
  set -e

  if [ $status -eq 0 ]; then
    echo -e "${GREEN}✅ ${suite_name} PASÓ${NC}"
    ((passed_tests++))
    suite_names+=("$suite_name")
    suite_status+=("PASS")
  else
    echo -e "${RED}❌ ${suite_name} FALLÓ${NC}"
    ((failed_tests++))
    suite_names+=("$suite_name")
    suite_status+=("FAIL")
    tail -20 "$REPORT_DIR/${suite_name}.log"
  fi
  ((total_tests++))
}

# ===========================================
# 1. PRE-DEPLOYMENT CHECKS
# ===========================================
echo -e "\n${YELLOW}[1/6] Validaciones previas...${NC}"

# Check dependencies
if ! command -v npm &> /dev/null; then
  echo -e "${RED}❌ npm no instalado${NC}"
  exit 1
fi

# Install dependencies
echo "Instalando dependencias..."
npm ci > "$REPORT_DIR/npm-install.log" 2>&1 || true

# Security audit
echo "Ejecutando auditoría de seguridad..."
npm run security:audit > "$REPORT_DIR/security-audit.log" 2>&1 || true

# Type check
echo "Verificando tipos TypeScript..."
npm run type-check > "$REPORT_DIR/type-check.log" 2>&1 || true

# ===========================================
# 2. UNIT & COMPONENT TESTS
# ===========================================
echo -e "\n${YELLOW}[2/6] Tests unitarios${NC}"
run_test_suite "unit-tests" "npm run test:web tests/web-e2e/smoke.spec.ts"

# ===========================================
# 3. E2E TESTS (MULTI-BROWSER)
# ===========================================
echo -e "\n${YELLOW}[3/6] Tests E2E (5 navegadores)${NC}"
run_test_suite "e2e-tests" "npm run test:web"

# ===========================================
# 4. API TESTS
# ===========================================
echo -e "\n${YELLOW}[4/6] Tests de API${NC}"
run_test_suite "api-tests" "npm run test:api"

# ===========================================
# 5. PERFORMANCE & ACCESSIBILITY
# ===========================================
echo -e "\n${YELLOW}[5/6] Tests de rendimiento y accesibilidad${NC}"
run_test_suite "lighthouse-audit" "npm run lighthouse"

# Lighthouse results analysis
if [ -f "reports/lighthouse/report.html" ]; then
  echo "Análisis de Lighthouse:"
  grep -o '"score":[0-9]*' reports/lighthouse/report.html | head -5 || true
fi

# ===========================================
# 6. REPORT GENERATION & SYNC
# ===========================================
echo -e "\n${YELLOW}[6/6] Generación de reportes y sincronización${NC}"

# Generate Allure report
echo "Generando reporte Allure..."
npm run allure:generate > "$REPORT_DIR/allure-generate.log" 2>&1

# Sync to Jira (if configured)
if [ ! -z "$JIRA_TOKEN" ]; then
  echo "Sincronizando test cases a Jira..."
  node scripts/sync-jira-tests.js > "$REPORT_DIR/jira-sync.log" 2>&1 || true
fi

# Sync to Confluence (if configured)
if [ ! -z "$CONFLUENCE_TOKEN" ]; then
  echo "Sincronizando documentación a Confluence..."
  node scripts/sync-confluence.js > "$REPORT_DIR/confluence-sync.log" 2>&1 || true
fi

# ===========================================
# REPORT SUMMARY
# ===========================================
echo -e "\n╔════════════════════════════════════════════════════════╗"
echo -e "║              RESUMEN DE EJECUCIÓN                      ║"
echo -e "╚════════════════════════════════════════════════════════╝"

echo -e "\n📊 Resultados:"
echo "  Total Tests: $total_tests"
echo -e "  ${GREEN}Pasados: $passed_tests${NC}"
echo -e "  ${RED}Fallidos: $failed_tests${NC}"

echo -e "\n📋 Detalles por suite:"
for i in "${!suite_names[@]}"; do
  suite="${suite_names[$i]}"
  status="${suite_status[$i]}"
  if [ "$status" = "PASS" ]; then
    echo -e "  ${GREEN}✅ $suite${NC}"
  else
    echo -e "  ${RED}❌ $suite${NC}"
  fi
done

echo -e "\n📁 Reportes guardados en: $REPORT_DIR"
echo "  - Logs individuales de cada test"
echo "  - Reporte Allure: allure-report/index.html"
echo "  - Reporte Lighthouse: reports/lighthouse/report.html"

# ===========================================
# NOTIFICATIONS
# ===========================================
if [ ! -z "$SLACK_WEBHOOK" ]; then
  echo -e "\n📢 Enviando notificación a Slack..."

  STATUS_EMOJI="✅"
  STATUS_TEXT="Success"
  if [ $failed_tests -gt 0 ]; then
    STATUS_EMOJI="❌"
    STATUS_TEXT="Some tests failed"
  fi

  curl -X POST "$SLACK_WEBHOOK" \
    -H 'Content-Type: application/json' \
    -d "{
      \"text\": \"${STATUS_EMOJI} HAIDA Test Suite - ${STATUS_TEXT}\",
      \"attachments\": [{
        \"color\": \"$([ $failed_tests -eq 0 ] && echo 'good' || echo 'danger')\",
        \"fields\": [
          {\"title\": \"Total Tests\", \"value\": \"$total_tests\", \"short\": true},
          {\"title\": \"Passed\", \"value\": \"$passed_tests\", \"short\": true},
          {\"title\": \"Failed\", \"value\": \"$failed_tests\", \"short\": true},
          {\"title\": \"Timestamp\", \"value\": \"$TIMESTAMP\", \"short\": true}
        ]
      }]
    }" > /dev/null 2>&1 || true
fi

# ===========================================
# EXIT STATUS
# ===========================================
if [ $failed_tests -eq 0 ]; then
  echo -e "\n${GREEN}✅ Suite de pruebas completada exitosamente${NC}\n"
  exit 0
else
  echo -e "\n${RED}❌ Suite de pruebas completada con errores${NC}\n"
  echo "Revisar logs en: $REPORT_DIR"
  exit 1
fi
