#!/bin/bash

##############################################################################
# Script de Ejecución de Tests QA - API Checkout Error Handling
# Autor: QA Analyst ISTQB
# Fecha: 2025-12-24
# Descripción: Ejecuta suite completa de tests con Newman y genera reportes
##############################################################################

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
COLLECTION_FILE="Checkout_Error_Handling_API.postman_collection.json"
ENVIRONMENT_FILE="Checkout_Environment.postman_environment.json"
REPORTS_DIR="./reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Banner
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   QA Testing Suite - Checkout Error Handling API          ║"
echo "║   Ejecución Automatizada con Newman                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar que Newman está instalado
echo -e "${YELLOW}[1/6] Verificando dependencias...${NC}"
if ! command -v newman &> /dev/null
then
    echo -e "${RED}✗ Newman no está instalado${NC}"
    echo -e "${YELLOW}Instalando Newman...${NC}"
    npm install -g newman
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Newman instalado correctamente${NC}"
    else
        echo -e "${RED}✗ Error al instalar Newman${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Newman está instalado${NC}"
fi

# Verificar archivos necesarios
echo -e "\n${YELLOW}[2/6] Verificando archivos de prueba...${NC}"
if [ ! -f "$COLLECTION_FILE" ]; then
    echo -e "${RED}✗ No se encuentra el archivo: $COLLECTION_FILE${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Colección encontrada: $COLLECTION_FILE${NC}"

if [ ! -f "$ENVIRONMENT_FILE" ]; then
    echo -e "${RED}✗ No se encuentra el archivo: $ENVIRONMENT_FILE${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Entorno encontrado: $ENVIRONMENT_FILE${NC}"

# Crear directorio de reportes
echo -e "\n${YELLOW}[3/6] Preparando directorio de reportes...${NC}"
mkdir -p $REPORTS_DIR
echo -e "${GREEN}✓ Directorio de reportes: $REPORTS_DIR${NC}"

# Mostrar configuración
echo -e "\n${BLUE}══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Configuración de Ejecución:${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
echo -e "Colección:       $COLLECTION_FILE"
echo -e "Entorno:         $ENVIRONMENT_FILE"
echo -e "Reportes:        $REPORTS_DIR"
echo -e "Timestamp:       $TIMESTAMP"
echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}\n"

# Preguntar si continuar
read -p "¿Deseas continuar con la ejecución? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo -e "${YELLOW}Ejecución cancelada por el usuario${NC}"
    exit 0
fi

# Ejecutar tests
echo -e "\n${YELLOW}[4/6] Ejecutando suite de tests...${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"

newman run "$COLLECTION_FILE" \
    -e "$ENVIRONMENT_FILE" \
    --reporters cli,html,json,junit \
    --reporter-html-export "$REPORTS_DIR/test-report-$TIMESTAMP.html" \
    --reporter-json-export "$REPORTS_DIR/test-results-$TIMESTAMP.json" \
    --reporter-junit-export "$REPORTS_DIR/junit-results-$TIMESTAMP.xml" \
    --color on \
    --delay-request 100 \
    --timeout-request 10000

# Capturar código de salida
EXIT_CODE=$?

echo -e "\n${BLUE}════════════════════════════════════════════════════════════${NC}"

# Analizar resultados
echo -e "\n${YELLOW}[5/6] Analizando resultados...${NC}"

if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ Todos los tests pasaron exitosamente${NC}"
    STATUS="PASSED"
else
    echo -e "${RED}✗ Algunos tests fallaron${NC}"
    STATUS="FAILED"
fi

# Generar resumen
echo -e "\n${YELLOW}[6/6] Generando resumen...${NC}"

echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    RESUMEN DE EJECUCIÓN                    ║${NC}"
echo -e "${BLUE}╠════════════════════════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║${NC} Estado:           ${STATUS}"
echo -e "${BLUE}║${NC} Fecha/Hora:       $(date '+%Y-%m-%d %H:%M:%S')"
echo -e "${BLUE}║${NC} Reportes:"
echo -e "${BLUE}║${NC}   - HTML:         $REPORTS_DIR/test-report-$TIMESTAMP.html"
echo -e "${BLUE}║${NC}   - JSON:         $REPORTS_DIR/test-results-$TIMESTAMP.json"
echo -e "${BLUE}║${NC}   - JUnit:        $REPORTS_DIR/junit-results-$TIMESTAMP.xml"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

# Abrir reporte HTML si está disponible
if command -v open &> /dev/null; then
    read -p "¿Deseas abrir el reporte HTML? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "$REPORTS_DIR/test-report-$TIMESTAMP.html"
    fi
elif command -v xdg-open &> /dev/null; then
    read -p "¿Deseas abrir el reporte HTML? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        xdg-open "$REPORTS_DIR/test-report-$TIMESTAMP.html"
    fi
fi

# Instrucciones finales
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Próximos pasos:${NC}"
echo -e "1. Revisar reporte HTML para detalles visuales"
echo -e "2. Consultar JSON para análisis programático"
echo -e "3. Revisar ${YELLOW}Informe_Ejecucion_Pruebas_QA.md${NC} para contexto"
echo -e "4. Corregir defectos identificados"
echo -e "5. Re-ejecutar tests después de correcciones"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"

exit $EXIT_CODE
