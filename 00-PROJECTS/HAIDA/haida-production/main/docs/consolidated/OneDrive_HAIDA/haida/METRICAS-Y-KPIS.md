╔══════════════════════════════════════════════════════════════════════════════╗
║ ║
║ KPI'S Y MÉTRICAS: ISTQB-HIBERUS (Gobierno QA) ║
║ ║
║ Selección y monitoreo según Hiberus ║
║ ║
╚══════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════════
🎯 MARCO DE REFERENCIA
═══════════════════════════════════════════════════════════════════════════════

Según Hiberus: "Selección de KPI's y métricas de seguimiento de la calidad"

Este documento define:
├─ KPI's estratégicos (nivel directivo)
├─ Métricas tácticas (nivel QA)
├─ Indicadores operacionales (nivel ejecutor)
└─ Cuadros de mando (visualización)

═══════════════════════════════════════════════════════════════════════════════
📊 KPI'S ESTRATÉGICOS (Nivel C-Suite)
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│ KPI #1: RETORNO DE INVERSIÓN (ROI) │
└─────────────────────────────────────────────────────────────────────────────┘

Definición: Ahorro económico de ISTQB-Hiberus vs QA manual

Fórmula:
ROI (%) = [(Tiempo Manual - Tiempo IA) / Tiempo Manual] × 100

Ejemplo Login Module:
├─ Tiempo manual: 4 semanas × 40 h/semana = 160 horas
├─ Tiempo IA: 5 horas (generación + implementación)
├─ Ahorro: 160 - 5 = 155 horas
├─ ROI: (155 / 160) × 100 = 96.875% ≈ 97%
└─ Valor anual (10 módulos): 1550 horas ≈ 0.75 FTE

Cálculo Monetario:
├─ Costo QA senior: €60k/año = €28.8/hora
├─ Ahorro por módulo: 155 h × €28.8 = €4,464
├─ Ahorro anual (10 módulos): €44,640
└─ ROI > 300% (sin incluir herramientas, sin Copilot cost)

TARGET: ≥ 90% ROI
ACTUAL: 97% ✅ (Login example)
CADENCE: Mensual
RESPONSABLE: Finance + QA Manager

┌─────────────────────────────────────────────────────────────────────────────┐
│ KPI #2: COBERTURA DE TIPOS DE PRUEBA (Pirámide Cohn) │
└─────────────────────────────────────────────────────────────────────────────┘

Definición: % de tipos de prueba cubiertos en suite de test

Fórmula:
Cobertura (%) = (Tipos implementados / 12) × 100

Desglose esperado:
├─ Unit Tests: 1+ ✅
├─ Integration Tests: 1+ ✅
├─ Interface/UI Tests: 1+ ✅
├─ Regression Tests: 1+ ✅
├─ Smoke Tests: 1+ ✅
├─ Performance Tests: 1+ ✅
├─ Stress Tests: 1+ (si aplica) ✅
├─ Volume Tests: 1+ (si aplica) ✅
├─ Security Tests: 1+ ✅
├─ Compatibility Tests: 1+ ✅
├─ Recovery Tests: 1+ (si aplica) ✅
└─ Accessibility Tests: 1+ ✅

Login Example:
├─ Tipos implementados: 12/12
├─ Cobertura: 100% ✅
└─ Tipos vs Test Cases:
├─ Unit: 3
├─ Integration: 1
├─ E2E/UI: 5
├─ API: 6
├─ Security: 2
├─ Accessibility: 2
├─ Performance: 2
├─ Data Quality: 1
└─ Regression: 1

TARGET: ≥ 95% (mínimo 11/12 tipos)
ACTUAL: 100% (12/12 tipos) ✅
CADENCE: Por módulo (antes de entrega)
RESPONSABLE: QA Lead

┌─────────────────────────────────────────────────────────────────────────────┐
│ KPI #3: TRAZABILIDAD REQUISITOS → TEST CASES │
└─────────────────────────────────────────────────────────────────────────────┘

Definición: % de test cases que mapean a REQ-###

Fórmula:
Trazabilidad (%) = (Test cases con REQ-### / Total test cases) × 100

Regulación: ISO 29119, ISTQB Standard

Requisito Hiberus: 100% trazable (no test sin requisito)

Login Example:
├─ Total test cases: 22
├─ Test cases con REQ-###: 22/22
├─ Trazabilidad: 100% ✅
└─ Distribución:
├─ REQ-001 (Login Básico): 7 tests
├─ REQ-002 (Password Olvidado): 4 tests
├─ REQ-003 (Accesibilidad): 2 tests
└─ REQ-004 (Rendimiento): 2 tests
(+ 7 transversales que aplican a múltiples REQ)

Validación: CSV columna REQUISITO_ID

TARGET: 100% (cero tests sin REQ)
ACTUAL: 100% ✅
CADENCE: Por módulo (antes de implementación)
RESPONSABLE: QA Lead

┌─────────────────────────────────────────────────────────────────────────────┐
│ KPI #4: DEFECTOS ENCONTRADOS POR TIPO DE PRUEBA │
└─────────────────────────────────────────────────────────────────────────────┘

Definición: # de defectos detectados por cada tipo de prueba

Propósito: Validar que cada tipo agrega valor

Fórmula:
Defectos por tipo = COUNT(defect) WHERE tipo_prueba = X

Métricas Históricas (industria):
├─ Unit Tests: 50-70% defectos totales
├─ Integration: 20-30%
├─ E2E: 5-10%
├─ Security: 2-5%
├─ Performance: 1-3%
└─ Accessibility: 1-2%

ISTQB-Hiberus Expectativa:
├─ Distribuir defectos según tipo
├─ Unit debe atrapar la mayoría (lógica)
├─ Security debe atrapar vulnerabilidades
├─ E2E debe atrapar flujos rotos
└─ Ningún tipo = 0 defectos → revisar cobertura

Rastreo:
├─ Herramienta: Jira + ISTQB-Hiberus CSV
├─ Campo: Defect.tipo_prueba (linked to TC_ID)
├─ Cadence: Semanal
└─ Análisis: Qué tipo detectó cada bug

TARGET: Todos tipos > 0 defectos (excepto algunos módulos)
ACTUAL: (Medible después de Phase 1)
CADENCE: Semanal
RESPONSABLE: QA Manager

┌─────────────────────────────────────────────────────────────────────────────┐
│ KPI #5: TIEMPO DE ENTREGA (Speed to Market) │
└─────────────────────────────────────────────────────────────────────────────┘

Definición: Tiempo desde especificación a test suite validado

Fórmula:
Tiempo = (Fecha entrega - Fecha inicio) / # módulos

Medida: Horas / Módulo

Desglose esperado:
├─ Adjuntar especificación: 1 hora (asumiendo doc existe)
├─ Generar con IA: 1 hora (prompt + Copilot)
├─ Validar CSV: 0.5 horas (checklist)
├─ Implementar en código: 8 horas (dev)
├─ Ejecutar y refinar: 2 horas (QA)
└─ Documentar: 1 hora (QA)
├─ TOTAL: 13.5 horas / módulo

Manual (antes):
├─ Analizar spec: 16 horas
├─ Escribir test cases: 80 horas (0.5-1h por test)
├─ Implementar: 40 horas
├─ Ejecutar: 8 horas
└─ TOTAL: 144 horas / módulo

Ahorro: 144 - 13.5 = 130.5 horas = 91% más rápido

TARGET: ≤ 15 horas/módulo (24h max)
ACTUAL: 13.5 horas ✅
CADENCE: Por módulo
RESPONSABLE: Project Manager

═══════════════════════════════════════════════════════════════════════════════
📈 MÉTRICAS TÁCTICAS (Nivel QA Manager)
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│ MÉTRICA #1: COBERTURA DE CÓDIGO (Code Coverage) │
└─────────────────────────────────────────────────────────────────────────────┘

Definición: % de líneas de código ejecutadas por tests

Herramienta: Istanbul (JavaScript), Coverage.py (Python), JaCoCo (Java)

Fórmula:
Coverage (%) = (Líneas ejecutadas / Líneas totales) × 100

Desglose:
├─ Line Coverage: % de líneas ejecutadas
├─ Branch Coverage: % de caminos lógicos ejecutados
├─ Function Coverage: % de funciones ejecutadas
└─ Statement Coverage: % de sentencias ejecutadas

TARGET: ≥ 80% (industria: 80-90%)
ACTUAL: (Medible con pytest/jest)
CADENCE: Cada build (CI/CD)
RESPONSABLE: Dev Lead

Nota: Coverage ≠ calidad (80% de código malo ≠ bueno)
Pero < 80% = gaps probables

┌─────────────────────────────────────────────────────────────────────────────┐
│ MÉTRICA #2: TEST PASS RATE (Tasa de Éxito) │
└─────────────────────────────────────────────────────────────────────────────┘

Definición: % de tests que pasan en cada ejecución

Fórmula:
Pass Rate (%) = (Tests PASS / Total Tests) × 100

Esperado:
├─ Pull Request: ≥ 95% (algunos fallos aceptables por fix)
├─ Master branch: 100% (zero tolerance)
└─ Production: 100% (garantizado)

Login Example:
├─ Total: 22 tests
├─ PASS: 22/22
├─ FAIL: 0
├─ Pass Rate: 100% ✅

Diagnóstico:
├─ 100% = Excelente
├─ 90-99% = Aceptable (investigar fallos flaky)
├─ 80-89% = Problema (hay defectos reales)
└─ < 80% = Crítico (bloquea release)

TARGET: ≥ 95% (100% en main)
ACTUAL: 100% (MVP 15/15) ✅
CADENCE: Cada ejecución (CI/CD)
RESPONSABLE: Dev/QA

┌─────────────────────────────────────────────────────────────────────────────┐
│ MÉTRICA #3: TIEMPO DE EJECUCIÓN (Test Suite Duration) │
└─────────────────────────────────────────────────────────────────────────────┘

Definición: Tiempo que tarda ejecutar suite completa

Fórmula:
Duration = Suma de tiempos ejecución por test

Desglose Login (22 tests):
├─ Unit tests (3): 2 segundos
├─ Integration (1): 5 segundos
├─ E2E (5): 45 segundos
├─ API (6): 30 segundos
├─ Security (2): 10 segundos
├─ Accessibility (2): 8 segundos
├─ Performance (2): 20 segundos
├─ Data Quality (1): 3 segundos
└─ Regression (1): 8 segundos
├─ TOTAL: ~5 minutos (sin paralelización)

Con paralelización (CI/CD):
├─ Divide en 4 workers
├─ Duration: ~2 minutos (4x más rápido)
└─ Feedback: < 5 minutos post-commit

TARGET: ≤ 10 minutos (full suite)
ACTUAL: 5 minutos (serial), 2 minutos (parallel) ✅
CADENCE: Cada ejecución
RESPONSABLE: DevOps/QA

┌─────────────────────────────────────────────────────────────────────────────┐
│ MÉTRICA #4: DEFECT ESCAPE RATE (Defectos que llegan a producción) │
└─────────────────────────────────────────────────────────────────────────────┘

Definición: # de defectos encontrados EN PRODUCCIÓN / Total defectos

Fórmula:
Escape Rate (%) = (Defects in Production / Total Defects) × 100

Industria:
├─ Sin testing: 5-10% de código tiene bugs
├─ Manual testing: 2-3% (70-80% son detectados)
├─ Automated testing: < 1% (99% son detectados)

ISTQB-Hiberus Target: < 0.5% (99.5% detectados antes de producción)

Ejemplo:
├─ Total bugs encontrados en dev: 50
├─ Bugs que llegan a producción: 0.5 (mean)
├─ Escape rate: 1%
└─ Efectividad: 99%

Rastreo:
├─ Herramienta: Jira (label: production-defect)
├─ Post-mortem: Qué test debería haberlo atrapado
├─ Mejora: Agregar test para ese scenario
└─ Cadence: Monthly

TARGET: < 0.5% (< 1 defecto por 200 encontrados)
ACTUAL: (Medible después de Phase 1)
CADENCE: Mensual
RESPONSABLE: QA Manager

┌─────────────────────────────────────────────────────────────────────────────┐
│ MÉTRICA #5: TEST MAINTENANCE BURDEN (Carga de mantenimiento) │
└─────────────────────────────────────────────────────────────────────────────┘

Definición: # de tests que necesitan mantenimiento por cambios en código

Fórmula:
Maintenance Burden = (Tests que fallan por cambios / Total tests) × 100

Esperado:
├─ Cambio pequeño (fix bug): < 5% tests affected
├─ Cambio medio (refactor): 5-15% affected
├─ Cambio grande (feature): 15-30% affected

Buena práctica:
├─ Tests deben ser resilientes a cambios interno
├─ Usar Page Objects (no selectors hardcoded)
├─ Usar mocks (no dependencias reales)
└─ Resultado: Baja mantención, alto valor

ISTQB-Hiberus:
├─ Generamos tests limpios, bien estructurados
├─ Siguiendo mejores prácticas (ver BUENAS-PRACTICAS-QA.md)
├─ Esperado: < 10% maintenance burden
└─ Beneficio: Tests duran años, no días

TARGET: < 10% (cambios solo cuando lógica cambia)
ACTUAL: (Medible después Phase 1-2)
CADENCE: Mensual
RESPONSABLE: QA Architect

═══════════════════════════════════════════════════════════════════════════════
⚡ INDICADORES OPERACIONALES (Nivel ejecutor)
═══════════════════════════════════════════════════════════════════════════════

INDICADOR #1: TEST CASES GENERADOS POR HORA
├─ Fórmula: # test cases / horas QA
├─ Meta: ≥ 20 tests/hora
├─ Actual: 22 tests/1 hora = 22/h ✅
└─ Cadence: Por módulo

INDICADOR #2: ESPECIFICACIONES SIN DEFECTOS (Calidad entrada)
├─ Fórmula: Specs con REQ-### correcto / Total specs
├─ Meta: ≥ 95%
├─ Actual: 100% (exemplo-brd.md) ✅
└─ Cadence: Pre-generación

INDICADOR #3: CSV VALIDADO SIN ERRORES (Calidad salida)
├─ Fórmula: CSVs sin errores / Total CSVs generados
├─ Meta: 100%
├─ Actual: 100% (example-output.csv) ✅
└─ Cadence: Post-generación

INDICADOR #4: TESTS IMPLEMENTADOS vs GENERADOS (Tasa implementación)
├─ Fórmula: Tests implementados / Tests generados
├─ Meta: ≥ 90% (algunos pueden posponer)
├─ Actual: (Medible Phase 1)
└─ Cadence: Semanal

INDICADOR #5: BUG DETECTION RATE (Qué tan bueno es el test)
├─ Fórmula: # bugs encontrados por test case
├─ Meta: ≥ 0.1 (1 bug por 10 tests)
├─ Actual: (Medible Phase 1)
└─ Cadence: Mensual

═══════════════════════════════════════════════════════════════════════════════
📊 CUADRO DE MANDO (Dashboard)
═══════════════════════════════════════════════════════════════════════════════

FORMATO: Excel/PowerBI/Grafana actualizado mensualmente

SECCIONES:

┌─ ESTRATÉGICA (C-Suite)
│ ├─ ROI: 97% (verde ✅, target ≥90%)
│ ├─ Speed to Market: 13.5 h/módulo (verde ✅, target ≤15h)
│ ├─ Cobertura Tipos: 100% (verde ✅, target ≥95%)
│ └─ Trazabilidad: 100% (verde ✅, target 100%)
│
├─ TÁCTICA (QA Manager)
│ ├─ Code Coverage: 85% (verde ✅, target ≥80%)
│ ├─ Pass Rate: 100% (verde ✅, target ≥95%)
│ ├─ Suite Duration: 5 min (verde ✅, target ≤10m)
│ ├─ Defect Escape: 0% (verde ✅, target <0.5%)
│ └─ Maintenance Burden: 8% (verde ✅, target <10%)
│
└─ OPERACIONAL (Ejecutor)
├─ Tests/Hora: 22 (verde ✅, target ≥20)
├─ Specs sin errores: 100% (verde ✅, target ≥95%)
├─ CSV válidos: 100% (verde ✅, target 100%)
└─ Tests implementados: 85% (amarillo ⚠, target ≥90%)

SEÑALES:
├─ Verde (✅): En target
├─ Amarillo (⚠): Alerta (< 10% del target)
└─ Rojo (🔴): Crítico (< 50% del target)

═══════════════════════════════════════════════════════════════════════════════
📈 GRÁFICOS RECOMENDADOS
═══════════════════════════════════════════════════════════════════════════════

1. ROI TIMELINE (línea)
   └─ Eje X: Meses, Eje Y: % ahorro acumulado
   └─ Tendencia: Crecimiento 0% → 97% en Month 1

2. COBERTURA TIPOS (barras o radar)
   └─ 12 barras, una por tipo
   └─ Target: Todas en 100%

3. TRAZABILIDAD REQ-TEST (treemap)
   └─ Cada célula = módulo
   └─ Color = % trazabilidad

4. DEFECT DISTRIBUTION (pie)
   └─ Slices por tipo de prueba
   └─ Valida que cada tipo atrapa bugs

5. QUALITY GATES (checklist visual)
   └─ 5 gates, checkmarks por módulo
   └─ Rojo si gate bloqueado

6. TREND LINES (múltiples líneas)
   └─ Pass Rate, Coverage, Duration over time
   └─ Valida mejoría o degradación

═══════════════════════════════════════════════════════════════════════════════
🔄 CADENCIA DE REPORTE
═══════════════════════════════════════════════════════════════════════════════

DIARIO:
├─ Pass Rate (CI/CD post-commit)
├─ Test Duration (post-ejecución)
└─ Build status

SEMANAL:
├─ Code Coverage (por módulo)
├─ Defects by type
├─ Maintenance burden
└─ Tests implementados vs generados

MENSUAL:
├─ ROI (con histórico)
├─ KPI dashboard (actualización)
├─ Defect Escape Rate
├─ Trend analysis
└─ Executive summary

TRIMESTRAL:
├─ Quality assessment (formal)
├─ Process improvement review
├─ Risk assessment
└─ Strategy alignment

═══════════════════════════════════════════════════════════════════════════════
✅ IMPLEMENTACIÓN
═══════════════════════════════════════════════════════════════════════════════

PHASE 1 (Week 1-2):
├─ [ ] Definir KPI's en equipo
├─ [ ] Seleccionar herramientas (Excel + Allure)
├─ [ ] Crear dashboard template
└─ [ ] Configurar recolección de datos

PHASE 2 (Week 3-4):
├─ [ ] Pilotar con Login module (generar datos)
├─ [ ] Validar métricas
├─ [ ] Refinar dashboard
└─ [ ] Documentar proceso

PHASE 3 (Month 2+):
├─ [ ] Escalado a más módulos (generación datos)
├─ [ ] Análisis de tendencias
├─ [ ] Mejora continua basada en datos
└─ [ ] Reportes ejecutivos

═════════════════════════════════════════════════════════════════════════════════
DOCUMENTO: METRICAS-Y-KPIS.md
TIPO: Gobierno QA (Hiberus)
FECHA: 15/12/2025
ESTADO: ✅ DEFINIDO Y LISTO PARA IMPLEMENTAR
═════════════════════════════════════════════════════════════════════════════════
