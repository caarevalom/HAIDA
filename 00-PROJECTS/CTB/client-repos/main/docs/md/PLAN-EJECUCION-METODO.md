╔═══════════════════════════════════════════════════════════════════════════════╗
║                          PLAN DE EJECUCIÓN METODICA - CTB                    ║
║                                                                               ║
║                     SIN ROMPER NADA - PASO A PASO Y CUIDADOSO                ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝


═══════════════════════════════════════════════════════════════════════════════
✅ ESTADO ACTUAL (VERIFICADO)
═══════════════════════════════════════════════════════════════════════════════

SISTEMA HAIDA:
├─ ✅ Carpeta principal: qa-starter-kit/
├─ ✅ Scripts base: run-qa-local.ps1, run-qa.ps1 
├─ ✅ Generador: HAIDA/generators/generate-tests.ps1
├─ ✅ Documentación: 16 archivos MD (README, QUICK-START, INDEX, etc)
├─ ✅ Estructura: docs/, examples/, generators/, outputs/, templates/
└─ ⚠️ Validadores NO EXISTEN YET (ValidateSpecification, ValidateCSVStructure, GenerateRequirementsMatrix)
   → Se crearán como parte de la ejecución

DOCUMENTACIÓN CTB:
├─ ✅ Plan de Pruebas - CTB.docx (2.25 MB)
├─ ✅ CTB VisitBarcelona Análisis funcional_v2.pdf (2.03 MB)
├─ ✅ CTB VisitBarcelona Análisis funcional_v2-castellano.pdf (3.07 MB)
├─ ✅ Guía de QA – Proyecto CTB VisitBarcelona.pdf (3.8 MB)
├─ ✅ hiberus - Memoria técnica.pdf (12.71 MB)
└─ ✅ HIBERUS_Informe_EstadoCalidad_CTB_B2C_DSK_Header.pptx

INCIDENCIAS Y DATOS CONTEXTO:
├─ 440 test cases (Desktop 220, Mobile 220)
├─ 50+ bugs abiertos (9 críticos, 40 normales)
├─ 8 módulos principales (Header, Footer, Home, Login, Registro, Perfil, Favoritos, Carrito, Calendario)
└─ Excel SharePoint accesible (usuario es creator)


═══════════════════════════════════════════════════════════════════════════════
🎯 ESTRATEGIA DE EJECUCIÓN METÓDICA (SIN RIESGOS)
═══════════════════════════════════════════════════════════════════════════════

FASE A: ANÁLISIS Y DOCUMENTACIÓN (2 horas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Objetivo: Entender requisitos, módulos, casos existentes SIN TOCAR NADA

A.1) Crear documento de síntesis CTB
   ├─ Módulos identificados
   ├─ Requisitos clave (REQ-###)
   ├─ Incidencias críticas (9 bugs)
   ├─ Casos de uso principales
   └─ Output: CTB-REQUISITOS-SINTESIS.md

A.2) Revisar 440 casos existentes
   ├─ Descargar de TestLink (si posible) O revisar en documentación
   ├─ Validar formato (CSV/XML)
   ├─ Clasificar por módulo
   ├─ Identificar deprecados/actualizados
   └─ Output: CTB-CASOS-INVENTARIO.csv

A.3) Crear mapa de requisitos → casos
   ├─ REQ-AUTH-001 → [TC_AUTH_001, TC_AUTH_002, ...]
   ├─ REQ-NAV-001 → [TC_NAV_001, TC_NAV_002, ...]
   └─ Output: CTB-TRAZABILIDAD-REQ-TESTS.md


FASE B: CREAR HERRAMIENTAS VALIDACIÓN (2 horas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Objetivo: Scripts automáticos para validación de test cases

B.1) ValidateCSVStructure.ps1
   ├─ Validar 13 columnas ISTQB
   ├─ Validar formato CSV
   ├─ Validar requisitos (REQ-###)
   └─ Output: Reporte validación CSV

B.2) ValidateSpecification.ps1
   ├─ Validar formato BRD/PRD (markdown)
   ├─ Extraer requisitos (REQ-###)
   ├─ Validar aceptación criteria
   └─ Output: Requisitos extraídos

B.3) GenerateRequirementsMatrix.ps1
   ├─ Cruzar requisitos vs test cases
   ├─ Identificar gaps (REQ sin test)
   ├─ Identificar tests orfanos (test sin REQ)
   └─ Output: Matriz trazabilidad + reporte gaps


FASE C: PREPARAR FRAMEWORK CAPTURA (1 hora)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Objetivo: Script Playwright robusto para captura automática

C.1) playwright-capture-evidence.ps1
   ├─ Abrir navegador
   ├─ Ejecutar test steps
   ├─ Screenshot en cada paso
   ├─ Grabar video completo
   ├─ Capturar network log (requests/responses)
   ├─ Capturar logs backend
   ├─ Guardar en estructura /evidencias/TC_###/
   └─ Manejo robusto de errores (no fallar, registrar)

C.2) Estructura carpetas evidencias
   ├─ /evidencias/TC_001/screenshots/ (paso1.png, paso2.png, ...)
   ├─ /evidencias/TC_001/network/ (requests.json, responses.json)
   ├─ /evidencias/TC_001/logs/ (backend.log)
   ├─ /evidencias/TC_001/video.mp4
   └─ /evidencias/TC_001/result.json (status, timestamps, errors)


FASE D: EJECUTAR CON CAPTURA (6-8 horas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Objetivo: Correr 440+ test cases con captura automática

D.1) Batch 1: Módulo Login (10-15 casos)
   ├─ Ejecutar TC_AUTH_001 → TC_AUTH_015
   ├─ Capturar evidencias automáticamente
   ├─ Registrar PASS/FAIL/BLOQUEADO
   └─ Si hay FAIL → investigar y registrar causa

D.2) Batch 2: Módulos NAV (Header, Footer, Búsqueda)
   ├─ Ejecutar TC_NAV_001 → TC_NAV_030
   ├─ Captura automática
   └─ Mapeo a bugs conocidos

D.3) Batch 3-8: Resto módulos (Favoritos, Perfil, Carrito, Calendario, etc)
   ├─ Ejecución metódica por módulo
   ├─ Captura de evidencias
   └─ Registro de estados


FASE E: DOCUMENTAR EN EXCEL (2 horas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Objetivo: Actualizar Excel SharePoint con resultados

E.1) Descargar Excel actual
   └─ Backup: Excel_backup_2025-12-16.xlsx

E.2) Pestañas a actualizar/crear:
   ├─ Test Plan Actual (440 casos)
   │  ├─ TC_ID | Nombre | Pasos | Expected | Status | Module
   │  ├─ Frontend_Evidence | Backend_Evidence | Video_Link
   │  └─ Bug_ID | Fecha_Ejecución
   ├─ Ejecución (resultados)
   │  ├─ TC_ID | Status | Duración | Timestamp | Error_Msg
   ├─ Defectos (50+ bugs)
   │  ├─ Bug_ID | Severidad (Crítica/Normal) | Module | Estado
   │  ├─ Test_Relacionado | Descripción | Fecha_Reporte
   ├─ Cobertura (métricas)
   │  ├─ Módulo | Total_REQ | Total_Test | Coverage% | Status
   ├─ Timeline (histórico)
   │  └─ Fecha | Módulo | Tests_Ejecutados | Pass | Fail | Bloqueado
   └─ Dashboard
      ├─ Gráficos KPIs, cobertura por módulo, trend línea

E.3) Cargar a SharePoint
   └─ URL: https://hiberus-my.sharepoint.com/.../


FASE F: REPORTES FINALES (1 hora)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Objetivo: Reportes ejecutivos para cliente

F.1) Allure Report
   ├─ Todos los test cases
   ├─ Screenshots embebidas
   ├─ Timeline ejecución
   └─ Análisis por módulo

F.2) Resumen ejecutivo
   ├─ Total casos: 440
   ├─ PASS: X | FAIL: Y | BLOQUEADO: Z
   ├─ Cobertura requisitos: X%
   ├─ Bugs conocidos mapeados
   └─ Recomendaciones

F.3) Matriz trazabilidad final
   ├─ REQ-### → TC_### → Status → Evidence
   └─ Gaps identificados (si existen)


═══════════════════════════════════════════════════════════════════════════════
📊 CRONOGRAMA
═══════════════════════════════════════════════════════════════════════════════

Fase A: 2 horas    (Análisis)
Fase B: 2 horas    (Herramientas validación)
Fase C: 1 hora     (Framework captura)
Fase D: 8 horas    (Ejecución 440 casos)
Fase E: 2 horas    (Excel)
Fase F: 1 hora     (Reportes)
──────────────
TOTAL: 16 horas    (2 días continuos)


═══════════════════════════════════════════════════════════════════════════════
🛡️ PROTECCIONES CONTRA ERRORES
═══════════════════════════════════════════════════════════════════════════════

✅ BACKUP: Crear backup Excel antes de modificar
✅ CONTROL: Ejecutar por lotes (Batch 1, 2, 3, ...) con verificación entre batches
✅ VALIDACIÓN: Validar cada paso antes de pasar a siguiente
✅ LOGGING: Registrar absolutamente todo (errores, timestamps, estados)
✅ ROLLBACK: Si algo falla, tener capacidad de volver atrás
✅ REVISIÓN: Revisar resultados intermedios antes de continuar
✅ SEPARACIÓN: Guarda evidencias en carpeta separada (no en Excel)


═══════════════════════════════════════════════════════════════════════════════
🚀 PRÓXIMO PASO (INMEDIATO)
═══════════════════════════════════════════════════════════════════════════════

Comenzar FASE A (Análisis):
1. Crear CTB-REQUISITOS-SINTESIS.md
2. Revisar 440 casos (inventario)
3. Crear mapa trazabilidad

¿Proceder con FASE A? (SÍ/NO)

