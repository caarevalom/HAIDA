╔══════════════════════════════════════════════════════════════════════════════╗
║ ║
║ ÍNDICE COMPLETO - ISTQB-HIBERUS ║
║ ║
║ Módulo diferenciador para propuesta piloto a manager ║
║ ║
╚══════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════════
📍 UBICACIÓN: c:/Users/CarlosArturoArevaloM/Documents/Proyectos/qa-starter-kit/istqb-hiberus/
═══════════════════════════════════════════════════════════════════════════════

═══════════════════════════════════════════════════════════════════════════════
📚 DOCUMENTACIÓN (LEER PRIMERO)
═══════════════════════════════════════════════════════════════════════════════

1. README.md [EMPEZAR AQUÍ]
   └─ Visión general de ISTQB-Hiberus
   └─ Qué es, por qué es importante, flujo core
   └─ Diferenciador para propuesta a manager
   ✓ Leer: 10 minutos

2. TIPOS_PRUEBAS_VALIDACION.md [CRÍTICO PARA PROPUESTA]
   └─ Auditoría completa: ISTQB-Hiberus vs Pirámide de Cohn (Hiberus)
   └─ Valida 100% cobertura de 12 tipos de prueba
   └─ Matriz de validación, ejemplos, verificación de criterios
   └─ DEMUESTRA: Cumplimiento 100% con estándares Hiberus
   ✓ Leer: 15 minutos (ANTES de presentar a manager)

3. MAPEO-PIRAMIDE-COHN.md [REFERENCIA PROFESIONAL]
   └─ Cómo ISTQB-Hiberus cubre Pirámide de Cohn (Funcionales + No Funcionales)
   └─ Desglose por cada tipo: funcional vs no funcional
   └─ Ubicación en código, ejemplos, frameworks
   └─ Justifica alineación con Hiberus estándares
   ✓ Leer: 20 minutos (para entender cobertura profunda)

4. QUICK-START.md
   └─ Guía rápida de 3 pasos (adjuntar → generar → validar)
   └─ Comandos, checklist, troubleshooting
   └─ Copia rápida para técnico
   ✓ Leer: 5 minutos (consultable)

5. PRESENTATION-MANAGER.md
   └─ Cómo presentar a tu jefe/manager
   └─ Argumentos de venta, demo, ROI, roadmap
   └─ Respuestas a preguntas probables
   └─ NUEVA SECCIÓN: Validación Pirámide Cohn (referencia tipos de prueba)
   ✓ Leer: 15 minutos (para presentar)

═══════════════════════════════════════════════════════════════════════════════
📁 CARPETA: templates/ (PLANTILLAS Y PROMPTS)
═══════════════════════════════════════════════════════════════════════════════

1. FUNCTIONAL-SPEC-TEMPLATE.md
   └─ Plantilla para escribir especificaciones funcionales
   └─ Secciones: Requisitos, Criterios aceptación, Flujos, Datos, Riesgos
   └─ Copia y rellena para tu módulo
   ✓ Usar: Cuando escribas especificación nueva

2. ISTQB-PROMPT-ENGINEER.md
   └─ Prompts optimizados para Copilot/Claude
   └─ PROMPT MASTER (principal) + variantes
   └─ Instrucciones de uso (Copilot Chat, Claude.ai, API)
   ✓ Usar: Cuando generes test cases con IA

3. CSV-SCHEMA.md
   └─ Definición formal de columnas CSV
   └─ Tipos de dato, valores válidos, ejemplos
   └─ Validación y reglas
   ✓ Referencia: Para validar CSV generado

═══════════════════════════════════════════════════════════════════════════════
📁 CARPETA: docs/ (ESPECIFICACIONES - ADJUNTAR AQUÍ)
═══════════════════════════════════════════════════════════════════════════════

README-DOCS.md
└─ Instrucciones de qué y cómo adjuntar documentos
└─ Formatos aceptados (BRD, PRD, TechSpec, API Spec)
└─ Validación antes de generar
✓ Leer primero: cómo adjuntar tu documentación

[Aquí es donde TÚ agregas tus especificaciones]
└─ especificacion-login.md
└─ especificacion-payment.md
└─ especificacion-dashboard.md
└─ etc...

✓ Crear: Copia FUNCTIONAL-SPEC-TEMPLATE.md y rellena con tu contenido

═══════════════════════════════════════════════════════════════════════════════
📁 CARPETA: generators/ (SCRIPTS)
═══════════════════════════════════════════════════════════════════════════════

1. generate-tests.ps1
   └─ Script PowerShell principal
   └─ Lee especificación → prepara prompt → interactúa con IA
   └─ Guarda prompt para copiar a Copilot Chat
   └─ Solicita pegar CSV resultado

   Uso:

   ```powershell
   powershell -File istqb-hiberus\generators\generate-tests.ps1 `
     -DocPath "istqb-hiberus\docs\tu-especificacion.md"
   ```

   ✓ Ejecutar: Cuando adjuntes nueva especificación

2. parse-csv.js (FUTURE)
   └─ Convertirá CSV a código Playwright/Jest ejecutable
   └─ Todavía en desarrollo
   └─ Próxima mejora

═══════════════════════════════════════════════════════════════════════════════
📁 CARPETA: outputs/ (SALIDA - TEST CASES GENERADOS)
═══════════════════════════════════════════════════════════════════════════════

Aquí aparecerán los archivos después de ejecutar generador:

1. test-cases-YYYY-MM-DD.csv
   └─ OUTPUT PRINCIPAL: Test cases generados por IA
   └─ Filas: una por test case (TEST_ID, TIPO_PRUEBA, COMPONENTE, ...)
   └─ Columnas: según CSV-SCHEMA.md
   └─ Uso: Referencia para escribir tests, importar a TMS, documentación

   ✓ Validar: Abre en Excel, verifica TEST_IDs únicos, tipos variados

2. PROMPT-TO-COPILOT-YYYY-MM-DD_hhmmss.txt
   └─ Prompt generado para copiar a Copilot Chat
   └─ Contiene: instrucciones ISTQB + contenido especificación
   └─ Uso: Copiar contenido completo a VS Code Copilot Chat

   ✓ Usar: Cuando no quieras escribir prompt manualmente

3. requirements-matrix.csv (FUTURE)
   └─ Matriz: Requisito ID → Test cases que lo cubren
   └─ Cobertura por requisito
   └─ Próxima mejora

═══════════════════════════════════════════════════════════════════════════════
📁 CARPETA: examples/ (EJEMPLOS Y DEMOS)
═══════════════════════════════════════════════════════════════════════════════

1. example-brd.md
   └─ Especificación funcional COMPLETA y rellenada
   └─ Módulo: Login
   └─ Requisitos: REQ-001 a REQ-004
   └─ Casos de uso, flujos, datos de prueba
   └─ Uso: Copiar para tu propio módulo, adaptar

   ✓ Ver: Formato correcto de especificación

2. example-output.csv
   └─ CSV GENERADO de example-brd.md
   └─ 22 test cases (Unit, API, E2E, Smoke, Security, Accessibility, Perf, Data)
   └─ Trazabilidad completa a REQ-001, REQ-002, REQ-003, REQ-004
   └─ Ejemplo de lo que DEBES obtener

   ✓ Ver: Estructura y cantidad esperada de tests
   ✓ Comparar: Tu output debe verse similar

3. STEP-BY-STEP.md
   └─ Tutorial completo: especificación → generador → CSV
   └─ Paso 1: Documento funcional (example-brd.md)
   └─ Paso 2: Prompt usado en Copilot
   └─ Paso 3: CSV generado (example-output.csv)
   └─ Paso 4: Cómo usar
   └─ Paso 5: Integración a Playwright

   ✓ Seguir: Cuando hagas tu primera generación

═══════════════════════════════════════════════════════════════════════════════
🚀 FLUJO COMPLETO (PASO A PASO)
═══════════════════════════════════════════════════════════════════════════════

PASO 1: ADJUNTAR ESPECIFICACIÓN (5-10 minutos)
├─ Leer: docs/README-DOCS.md
├─ Copiar: templates/FUNCTIONAL-SPEC-TEMPLATE.md
├─ Rellenar: Tu módulo (requisitos, criterios, flujos, datos)
├─ Guardar: docs/especificacion-[modulo].md
└─ Resultado: Documento .md completo

PASO 2: GENERAR TEST CASES (20 minutos)
├─ Ejecutar: powershell -File istqb-hiberus\generators\generate-tests.ps1
├─ Input: Ruta a tu especificación (docs/especificacion-[modulo].md)
├─ Output: PROMPT-TO-COPILOT-\*.txt en outputs/
├─ Acción: Copiar prompt completo a Copilot Chat (VS Code)
├─ IA genera: Test cases en formato CSV
├─ Pegar: CSV resultado cuando script lo pida
└─ Resultado: test-cases-YYYY-MM-DD.csv en outputs/

PASO 3: VALIDAR CSV (10 minutos)
├─ Abrir: istqb-hiberus/outputs/test-cases-YYYY-MM-DD.csv en Excel
├─ Validar:
│ ✓ TEST_IDs únicos (TC_LOGIN_001, TC_LOGIN_002, ...)
│ ✓ TIPO_PRUEBA variado (no todos E2E)
│ ✓ COMPONENTE consistente
│ ✓ REQUISITO_ID = REQ-### del documento original
│ ✓ DESCRIPCION clara y sin jerga
│ ✓ PASOS ejecutables y numerados
│ ✓ RESULTADO_ESPERADO verificable
│ ✓ PRIORIDAD coherente (P0/P1 críticos, P2/P3 menores)
│ ✓ ETIQUETA_AUTOMATIZACION con @ (para Playwright grep)
├─ Comparar: example-output.csv como referencia
├─ Corregir: Errores obvios (manualmente si es necesario)
└─ Resultado: CSV validado y listo

PASO 4: INTEGRAR A TESTS (opcional, según caso)
├─ Opción A: Usar CSV como documentación
│ └─ Referencia para escribir tests en Playwright/Jest manualmente
├─ Opción B: Convertir CSV a código (Future)
│ └─ node istqb-hiberus/generators/parse-csv.js
│ └─ Genera: tests/web-e2e/generated-from-istqb.spec.ts
├─ Opción C: Importar a TMS
│ └─ TestRail, Jira, Azure DevOps
│ └─ CSV es directamente importable
└─ Resultado: Tests integrados y ejecutables

PASO 5: EJECUTAR Y REPORTAR
├─ Ejecutar: npm run test:web
├─ Reportería: Allure + HTML
├─ Resultado: Métricas, cobertura, trazabilidad

═══════════════════════════════════════════════════════════════════════════════
💡 QUICK REFERENCE (COMANDOS)
═══════════════════════════════════════════════════════════════════════════════

Generar test cases:
powershell -File istqb-hiberus\generators\generate-tests.ps1 `
-DocPath "istqb-hiberus\docs\tu-especificacion.md"

Ver ejemplo:
Get-Content "istqb-hiberus\examples\example-output.csv" | Out-GridView

Abrir outputs:
explorer "istqb-hiberus\outputs"

Leer documentación principal:
code "istqb-hiberus\README.md"

Leer guía de presentación:
code "istqb-hiberus\PRESENTATION-MANAGER.md"

═══════════════════════════════════════════════════════════════════════════════
🎯 CASOS DE USO
═══════════════════════════════════════════════════════════════════════════════

CASO 1: Tengo una especificación, quiero test cases ISTQB rápido

1. Leer: QUICK-START.md (5 min)
2. Copiar: templates/FUNCTIONAL-SPEC-TEMPLATE.md
3. Rellenar: Tu contenido
4. Ejecutar: generate-tests.ps1
5. Generar: Con Copilot Chat
6. Resultado: CSV con tests en 1 hora

CASO 2: Quiero ver cómo funciona sin generar mi propio

1. Leer: examples/STEP-BY-STEP.md
2. Ver: examples/example-brd.md (especificación Login)
3. Ver: examples/example-output.csv (22 tests generados)
4. Entender: El flujo y cantidad esperada

CASO 3: Quiero presentar a mi manager

1. Leer: PRESENTATION-MANAGER.md
2. Preparar: Slides con problema → solución → ROI
3. Demo: Mostrar example-brd.md → example-output.csv (2 minutos)
4. Explicar: Roadmap (Fase 1-4)
5. Solicitar: Aprobación para Fase 1 (piloto 2 semanas)

CASO 4: Quiero escalarlo a múltiples módulos

1. Completar: Fase 1 piloto (1 módulo)
2. Documentar: Proceso, learnings, metrics
3. Automatizar: Batch processing (múltiples docs)
4. Escalar: A otros proyectos Hiberus

═══════════════════════════════════════════════════════════════════════════════
⚠️ VALIDACIÓN ANTES DE USAR
═══════════════════════════════════════════════════════════════════════════════

ESPECIFICACIÓN:
✓ En Markdown (.md)
✓ Tiene "Requisitos Funcionales" con REQ-###
✓ Requisitos numerados (REQ-001, REQ-002, ...)
✓ Criterios de aceptación específicos (no vagas)
✓ Flujos de usuario definidos (paso a paso)
✓ Datos de prueba incluidos
✓ Sin PII o información sensible

CSV GENERADO:
✓ Todas las columnas presentes (header completo)
✓ TEST_IDs únicos (no duplicados)
✓ TIPO_PRUEBA válidos (from lista estándar)
✓ REQUISITO_ID mapean a REQ-### original
✓ PASOS ejecutables (no vagos)
✓ RESULTADO_ESPERADO es verificable
✓ PRIORIDAD lógica (crítico = P0/P1)
✓ Etiquetas con @ para Playwright grep

SI FALLA:
├─ Revisar: templates/CSV-SCHEMA.md (definición)
├─ Comparar: examples/example-output.csv (referencia)
├─ Validar: Especificación original (¿clara?)
├─ Regenerar: Con Copilot (pedir correcciones)
└─ Corregir: Manualmente si es necesario

═══════════════════════════════════════════════════════════════════════════════
📊 MÉTRICAS DE ÉXITO
═══════════════════════════════════════════════════════════════════════════════

PILOTO (Fase 1):
✓ 1 módulo procesado completamente
✓ CSV con mínimo 15-20 test cases
✓ Cobertura ISTQB: 8+ tipos distintos representados
✓ Trazabilidad: 100% requisitos cubiertos
✓ Tiempo: 1 hora from especificación to CSV validado
✓ Calidad: CSV valida sin errores críticos

ESCALA (Fase 2+):
✓ 3+ módulos procesados
✓ Procesos repetibles y documentados
✓ Tests ejecutables en CI/CD
✓ Reportería unificada (Allure)
✓ Trazabilidad requierimientos → tests → resultados
✓ ROI comprobado vs QA manual

═══════════════════════════════════════════════════════════════════════════════
🔗 INTEGRACIÓN CON PROPUESTA GENERAL
═══════════════════════════════════════════════════════════════════════════════

ISTQB-Hiberus es PARTE de la propuesta general a manager:

├─ PROPOSAL-TO-MANAGER.md (propuesta 1: visión general + roadmap)
│
├─ istqb-hiberus/ (CORE DIFERENCIADOR: generación automática tests)
│ ├─ README.md (visión ISTQB-Hiberus)
│ ├─ QUICK-START.md (guía rápida)
│ ├─ PRESENTATION-MANAGER.md (cómo presentar)
│ └─ [templates, docs, generators, outputs, examples]
│
└─ qa-starter-kit/ (infraestructura: scripts, tests, reportería)
├─ run-qa-local.ps1 (ejecución tests)
├─ tests/ (suite de tests)
├─ tools/ (mock server)
└─ [configs, documentación]

FLUJO COMPLETO:

1. Especificación funcional (PO)
   ↓
2. ISTQB-Hiberus genera test cases CSV (IA)
   ↓
3. CSV se importa a suite (docs + código)
   ↓
4. run-qa-local.ps1 ejecuta tests
   ↓
5. Reportería con Allure + HTML

═══════════════════════════════════════════════════════════════════════════════
✅ CHECKLIST ANTES DE PRESENTAR A MANAGER
═══════════════════════════════════════════════════════════════════════════════

DOCUMENTACIÓN:
✓ README.md (visión general)
✓ QUICK-START.md (guía rápida)
✓ PRESENTATION-MANAGER.md (cómo presentar)
✓ templates/FUNCTIONAL-SPEC-TEMPLATE.md (plantilla visible)

EJEMPLOS:
✓ example-brd.md (especificación rellenada)
✓ example-output.csv (CSV generado, 22 tests)
✓ STEP-BY-STEP.md (tutorial completo)

FUNCIONALIDAD:
✓ generate-tests.ps1 ejecutable
✓ Prompt generado correctamente
✓ CSV output validado

PRESENTACIÓN:
✓ Pitck corto preparado (30 segundos)
✓ Ejemplo Login visible y entendible
✓ Roadmap claro (Fase 1-4)
✓ ROI calculado y realista

═══════════════════════════════════════════════════════════════════════════════
🚀 PRÓXIMOS PASOS
═══════════════════════════════════════════════════════════════════════════════

INMEDIATO:

1. Leer: README.md (10 min)
2. Leer: QUICK-START.md (5 min)
3. Ver: examples/ (2 min)

CORTO PLAZO (1 semana):

1. Adjuntar: Tu primera especificación a docs/
2. Generar: Test cases con IA
3. Validar: CSV resultado
4. Documentar: Proceso y learnings

MEDIANO PLAZO (2 semanas):

1. Preparar: Presentación para manager
2. Leer: PRESENTATION-MANAGER.md
3. Hacer: Slides / Demo
4. Agendar: Reunión con jefe

LARGO PLAZO (1-3 meses):

1. Aprobación: Fase 1 piloto
2. Procesar: 1-2 módulos más
3. Escalabilidad: Múltiples proyectos
4. Optimización: Workflows, automatización completa

═══════════════════════════════════════════════════════════════════════════════

"ISTQB-Hiberus: De especificaciones funcionales a suite ISTQB completa
en menos tiempo del que toma una reunión de kickoff."

═════════════════════════════════════════════════════════════════════════════════

ÍNDICE CREADO: 15/12/2025
VERSIÓN: 1.0
ESTATUS: LISTO PARA PRESENTAR
