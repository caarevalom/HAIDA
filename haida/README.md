╔══════════════════════════════════════════════════════════════════════════════╗
║ ║
║ HAIDA TEST GENERATOR ║
║ ║
║ Plataforma inteligente de generación automática de tests ║
║ Alineados con estándares ISTQB profesionales ║
║ ║
║ 🎯 PROPUESTA DIFERENCIADORA 🎯 ║
║ ║
╚══════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════════
¿QUÉ ES HAIDA?
═══════════════════════════════════════════════════════════════════════════════

HAIDA es un **módulo generador inteligente de test cases** que transforma
documentación funcional en suites de pruebas profesionales y auditables.

FLUJO CORE:
📄 Documento Funcional (adjuntar)
↓
🤖 Análisis con IA (Copilot/Claude)
↓
✅ Test Cases ISTQB (generados automáticamente)
↓
📊 CSV Estructurado (tipos, componentes, requisitos)
↓
🔗 Mapeado a suites en Playwright/Newman/Jest

DIFERENCIADOR:
✓ Sin intervención manual
✓ Conforme estándares ISTQB
✓ Trazabilidad requisitos ↔ tests
✓ Formato CSV auditable
✓ Separación por tipos y componentes
✓ Profesional, detallado, serio

═══════════════════════════════════════════════════════════════════════════════
ESTRUCTURA DE CARPETAS
═══════════════════════════════════════════════════════════════════════════════

istqb-hiberus/
├── docs/ # Documentación funcional (adjunta por usuario)
│ ├── README-DOCS.md # Instrucciones de qué adjuntar
│ └── [usuario adjunta].md # Especificaciones, BRDs, PRDs, etc
│
├── templates/ # Plantillas y prompts
│ ├── FUNCTIONAL-SPEC-TEMPLATE.md # Template de documento funcional
│ ├── ISTQB-PROMPT-ENGINEER.md # Prompts para IA
│ └── CSV-SCHEMA.md # Estructura esperada del CSV
│
├── generators/ # Scripts de generación
│ ├── generate-tests.ps1 # Script principal (PowerShell)
│ └── parse-csv.js # Parseador de output CSV
│
├── outputs/ # CSVs generados
│ ├── test-cases-YYYY-MM-DD.csv # Test cases generados
│ ├── requirements-matrix.csv # Matriz requisitos ↔ tests
│ └── [otros reportes].csv
│
├── examples/ # Ejemplos demostradores
│ ├── example-brd.md # BRD de ejemplo
│ ├── example-output.csv # CSV generado de ejemplo
│ └── STEP-BY-STEP.md # Ejemplo paso a paso
│
└── README.md # Este archivo

═══════════════════════════════════════════════════════════════════════════════
FLUJO DE USO (USUARIO FINAL)
═══════════════════════════════════════════════════════════════════════════════

PASO 1: ADJUNTAR DOCUMENTACIÓN FUNCIONAL
└─ Ir a: istqb-hiberus/docs/
└─ Copiar template: FUNCTIONAL-SPEC-TEMPLATE.md
└─ Rellenar con especificación (historias, requisitos, criterios aceptación)
└─ Guardar como: docs/especificacion-modulo-X.md

PASO 2: EJECUTAR GENERADOR
└─ PowerShell (en qa-starter-kit/)
└─ powershell -File istqb-hiberus\generators\generate-tests.ps1 -DocPath "istqb-hiberus\docs\especificacion-modulo-X.md"

PASO 3: VALIDAR OUTPUT
└─ Revisar: istqb-hiberus/outputs/test-cases-YYYY-MM-DD.csv
└─ Estructura: [ID | Tipo | Componente | Requisito | Descripción | Pasos | Expected | ...]
└─ Integrar CSV a suite de tests existente

PASO 4: IMPORTAR A TESTS
└─ Script convierte CSV a test cases en Playwright/Newman/Jest
└─ Tests listos para ejecutar

═══════════════════════════════════════════════════════════════════════════════
TIPOS DE PRUEBAS (ISTQB) SOPORTADOS
═══════════════════════════════════════════════════════════════════════════════

✓ Unit Tests (código, backend, funciones)
✓ Integration Tests (servicios, APIs internas)
✓ API/REST Tests (endpoint contracts, payloads)
✓ System Tests (flujo end-to-end, múltiples módulos)
✓ E2E Tests (web, UI, user journeys)
✓ Smoke Tests (health checks, sanidad)
✓ Regression Tests (cambios no rompen existente)
✓ UAT Tests (aceptación usuario)
✓ Performance Tests (carga, stress, volumen)
✓ Security Tests (OWASP, inyecciones, auth)
✓ Accessibility Tests (WCAG, a11y)
✓ Compatibility Tests (navegadores, dispositivos, formatos)
✓ Data Quality Tests (integridad, consistencia, validez)

Cada documento funcional → generador ISTQB clasifica automáticamente

═══════════════════════════════════════════════════════════════════════════════
FORMATO CSV SALIDA
═══════════════════════════════════════════════════════════════════════════════

Estructura (|separado por pipes para legibilidad):

TEST_ID | TIPO_PRUEBA | COMPONENTE | MODULO | REQUISITO_ID | DESCRIPCION | PRECONDICIONES | PASOS | RESULTADO_ESPERADO | PRIORIDAD | RIESGO | ETIQUETA_AUTOMATIZACION | ESTADO

Ejemplo:
─────────────────────────────────────────────────────────────────────────────

TC_USR_001 | Unit | Auth | Login | REQ-001 | Validar contraseña vacía | Usuario no autenticado | 1. Ir a login 2. Dejar vacío password 3. Click submit | Error "Password requerido" | P1 | Alto | @unit @auth | Generado

TC_USR_002 | API | Auth | Login | REQ-001 | POST /auth debe rechazar payload sin email | Server corriendo | 1. POST /auth sin email | HTTP 400 + error "email required" | P1 | Alto | @api @unit @auth | Generado

TC_USR_003 | E2E | Auth | Login | REQ-001,REQ-002 | Flujo login completo en navegador | BD vacía, server corriendo | 1. Navegar a /login 2. Ingresar user+pass válidos 3. Submit | Redirige a /dashboard, sesión activa | P1 | Alto | @e2e @regression | Generado

TC_USR_004 | Accessibility | UI | Login | REQ-003 | Form login cumple WCAG 2A | Login page cargada | 1. Escanear con axe-core | 0 violaciones WCAG | P2 | Medio | @a11y @wcag | Generado

TC_USR_005 | Performance | API | Auth | REQ-004 | Login < 200ms en red normal | Server corriendo | 1. Llamar POST /auth en connection 4G | Response < 200ms | P2 | Medio | @perf @api | Generado

─────────────────────────────────────────────────────────────────────────────

COLUMNAS (descripción):
├─ TEST*ID: Identificador único (TC_MODULO*###)
├─ TIPO_PRUEBA: Unit | API | E2E | Smoke | Regression | Performance | Security | Accessibility | ...
├─ COMPONENTE: Auth, Payment, Dashboard, UI, Backend, Database, ...
├─ MODULO: Login, Register, Profile, Checkout, ...
├─ REQUISITO_ID: Referencia a REQ-### en documentación
├─ DESCRIPCION: Qué se prueba (clara, concisa)
├─ PRECONDICIONES: Estado inicial necesario
├─ PASOS: Numerados, ejecutables
├─ RESULTADO_ESPERADO: Asertable (el test lo verifica)
├─ PRIORIDAD: P0 (blocker) | P1 (crítico) | P2 (medio) | P3 (bajo)
├─ RIESGO: Alto | Medio | Bajo
├─ ETIQUETA_AUTOMATIZACION: @unit @api @e2e @regression @perf @security @a11y (para Playwright.grep)
└─ ESTADO: Generado | Manual | Verificado | En_Ejecucion | Pasado | Fallido

═══════════════════════════════════════════════════════════════════════════════
CARACTERÍSTICAS DIFERENCIADORA (PROPUESTA A MANAGER)
═══════════════════════════════════════════════════════════════════════════════

1. AUTOMATIZACIÓN DE DISEÑO DE TESTS
   ✓ Sin QA necesariamente escribiendo cada test manualmente
   ✓ IA analiza requisitos y genera ISTQB-compliant
   ✓ Ahorro: 60-70% tiempo diseño de tests

2. TRAZABILIDAD AUTOMÁTICA
   ✓ Cada test linkea a requisito (REQ-###)
   ✓ Matriz de cobertura generada
   ✓ Auditable para regulaciones

3. CONSISTENCIA Y PROFESIONALISMO
   ✓ Formato estándar (CSV, estructurado)
   ✓ Nomenclatura ISTQB
   ✓ Separación clara por tipos y componentes

4. ESCALABILIDAD
   ✓ Múltiples módulos procesados en batch
   ✓ Reutilizable en otros proyectos Hiberus
   ✓ Base para automatización completa

5. INTEGRACIÓN SEAMLESS
   ✓ CSV exportable a Playwright/Newman/Jest
   ✓ Sincronizado con CI/CD
   ✓ Reportería histórica

6. SEGURIDAD Y COMPLIANCE
   ✓ Cero datos sensibles en generación
   ✓ Logs auditables
   ✓ Cumple estándares corporativos

═══════════════════════════════════════════════════════════════════════════════
CONTENIDO DE CARPETAS
═══════════════════════════════════════════════════════════════════════════════

📁 docs/
└─ Aquí adjuntas tus especificaciones funcionales (BRD, PRD, user stories)
└─ README-DOCS.md → instrucciones de qué incluir
└─ Ejemplo: especificacion-login-ctb.md

📁 templates/
├─ FUNCTIONAL-SPEC-TEMPLATE.md
│ └─ Plantilla lista para rellenar (estructura esperada por IA)
│
├─ ISTQB-PROMPT-ENGINEER.md
│ └─ Prompts optimizados para Copilot/Claude
│ └─ Instrucciones: "Analiza este documento y extrae test cases ISTQB"
│
└─ CSV-SCHEMA.md
└─ Definición completa de columnas y valores válidos

📁 generators/
├─ generate-tests.ps1
│ └─ Orquestador: lee doc → llama IA → formatea CSV → exporta
│
└─ parse-csv.js
└─ Utilidad: convierte CSV a test code (Playwright spec, Newman collection, etc)

📁 outputs/
├─ test-cases-YYYY-MM-DD.csv
│ └─ Salida principal (tests generados)
│
├─ requirements-matrix.csv
│ └─ Matriz: requisito → tests que lo cubren
│
└─ [otros reports]
└─ Trazabilidad, análisis de cobertura, etc

📁 examples/
├─ example-brd.md
│ └─ Especificación funcional de ejemplo (Login module)
│
├─ example-output.csv
│ └─ CSV generado de esa especificación
│
└─ STEP-BY-STEP.md
└─ Demostración completa: de .md a CSV

═══════════════════════════════════════════════════════════════════════════════
PRÓXIMOS PASOS
═══════════════════════════════════════════════════════════════════════════════

1. Revisar: templates/FUNCTIONAL-SPEC-TEMPLATE.md (cómo escribir spec)
2. Crear: Tu primera especificación en docs/
3. Revisar: templates/ISTQB-PROMPT-ENGINEER.md (cómo generar)
4. Ejecutar: generators/generate-tests.ps1 -DocPath "tu-spec.md"
5. Validar: outputs/test-cases-YYYY-MM-DD.csv
6. Integrar: a la suite de tests existente en tests/

Ver ejemplo completo en: examples/STEP-BY-STEP.md

═══════════════════════════════════════════════════════════════════════════════
VISIÓN (PARA MANAGER)
═══════════════════════════════════════════════════════════════════════════════

HAIDA es la **respuesta automatizada a la pregunta:**
"¿Cómo convertimos especificaciones en tests profesionales, auditables y
mantenibles sin escribir cada uno manualmente?"

IMPACTO:
├─ Velocidad: De requisito a test suite en horas (no días)
├─ Calidad: Cobertura ISTQB garantizada
├─ Trazabilidad: Requisito → Test → Resultado (auditable)
├─ Escala: Múltiples módulos en paralelo
└─ ROI: 60-70% ahorro en QA manual

EJEMPLO:
Antes: QA lee 50 historias → escribe 300 tests → ~2 semanas
Ahora: Adjuntar doc → ejecutar script → CSV listo → ~2 horas

═══════════════════════════════════════════════════════════════════════════════
