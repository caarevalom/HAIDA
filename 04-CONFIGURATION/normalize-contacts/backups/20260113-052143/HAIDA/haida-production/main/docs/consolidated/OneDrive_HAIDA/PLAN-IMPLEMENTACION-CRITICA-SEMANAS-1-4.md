╔══════════════════════════════════════════════════════════════════════════════╗
║ ║
║ PLAN DE IMPLEMENTACIÓN CRÍTICA ║
║ SEMANAS 1-4 (40 HORAS) ║
║ ║
║ Validación → Reorganización → Orquestación → Quality Gates ║
║ ║
╚══════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════════
🎯 OBJETIVO SEMANAS 1-4
═══════════════════════════════════════════════════════════════════════════════

Transformar sistema de MANUAL + GAPS a AUTOMÁTICO + VALIDADO

ENTRADA:
├─ Especificación Markdown
├─ CSV generado por usuario (sin validar)
└─ Scripts ejecutables (sin coordinación)

SALIDA:
├─ Especificación validada automáticamente
├─ CSV garantizado válido o BLOQUEADO
├─ Scripts coordinados por orquestador central
├─ Quality Gates activadas en cada etapa
├─ Logging y trazabilidad completa
└─ Sistema listo para CI/CD

═══════════════════════════════════════════════════════════════════════════════
📋 SEMANA 1-2: VALIDACIÓN Y QUALITY GATES (20 HORAS)
═══════════════════════════════════════════════════════════════════════════════

ITEM 1.1: ValidateSpecification.ps1 (1 hora)
═══════════════════════════════════════════════════════════════════════════════

ARCHIVO: HAIDA/tools/ValidateSpecification.ps1 (CREAR)

FUNCIONALIDAD:
param(
[string]$SpecPath = $(Read-Host "Path a especificación Markdown"),
    [switch]$Strict = $false
)

VALIDACIONES:
├─ [REQUERIDO] Archivo existe
├─ [REQUERIDO] Contiene al menos 1 REQ-### (regex: REQ-[A-Z0-9_]+)
├─ [REQUERIDO] Contiene secciones: DESCRIPCIÓN, ACEPTACIÓN, CASOS_USO
├─ [REQUERIDO] Cada caso uso tiene PRE-CONDICIONES y PASOS
├─ [OPCIONAL si -Strict] Contiene criterios WCAG o seguridad
├─ [OPCIONAL si -Strict] Contiene estimación de esfuerzo
└─ [RECOMENDADO] Longitud mínima 500 caracteres

SALIDA:
├─ ✅ Especificación VÁLIDA
├─ ⚠️ Especificación con ADVERTENCIAS (sigue adelante)
├─ 🔴 Especificación INVÁLIDA (BLOQUEA generación)
└─ Reporte detallado de gaps

RETORNO:
└─ $true si válida, $false si inválida

CÓDIGO BASE:

function ValidateSpecification {
param([string]$SpecPath, [bool]$Strict = $false)

    if (-not (Test-Path $SpecPath)) {
        Write-Host "❌ Archivo no existe: $SpecPath" -ForegroundColor Red
        return $false
    }

    $content = Get-Content $SpecPath -Raw
    $errors = @()
    $warnings = @()

    # Validación requerida 1: REQ-###
    if ($content -notmatch 'REQ-[A-Z0-9_]+') {
        $errors += "Sin requisitos identificables (REQ-###)"
    }

    # Validación requerida 2: Secciones
    @('DESCRIPCIÓN', 'ACEPTACIÓN', 'CASOS_USO') | % {
        if ($content -notmatch "^## $_") {
            $errors += "Falta sección: $_"
        }
    }

    # Validación requerida 3: PRE-CONDICIONES y PASOS
    $casosCont = [regex]::Matches($content, '### Caso de Uso:')
    if ($casosCont.Count -gt 0) {
        $casosCont | % {
            $idx = $_.Index
            $subText = $content.Substring($idx, [Math]::Min(500, $content.Length - $idx))
            if ($subText -notmatch 'Pre-condiciones|Pasos') {
                $warnings += "Caso uso incompleto: falta Pre-condiciones o Pasos"
            }
        }
    }

    if ($Strict) {
        # Más validaciones
        if ($content -notmatch 'WCAG|accesib|secur') {
            $warnings += "[STRICT] Considera agregar criterios WCAG o seguridad"
        }
    }

    # Reportar
    Write-Host ""
    Write-Host "════════════════════════════════════════"
    Write-Host "VALIDACIÓN DE ESPECIFICACIÓN"
    Write-Host "════════════════════════════════════════"

    if ($errors.Count -gt 0) {
        Write-Host "❌ ERRORES CRÍTICOS ($($errors.Count)):" -ForegroundColor Red
        $errors | % { Write-Host "   - $_" }
        return $false
    }

    if ($warnings.Count -gt 0) {
        Write-Host "⚠️  ADVERTENCIAS ($($warnings.Count)):" -ForegroundColor Yellow
        $warnings | % { Write-Host "   - $_" }
        $continue = Read-Host "¿Continuar sin los cambios? (S/N)"
        if ($continue -ne 'S') { return $false }
    }

    Write-Host "✅ Especificación VÁLIDA" -ForegroundColor Green
    return $true

}

ITEM 1.2: ValidateCSVStructure.ps1 (1.5 horas)
═══════════════════════════════════════════════════════════════════════════════

ARCHIVO: HAIDA/tools/ValidateCSVStructure.ps1 (CREAR)

VALIDACIONES (12 puntos):

1. Estructura básica:
   ├─ Separador pipe (|)
   ├─ 13 columnas exactamente
   └─ Headers correctos

2. Columnas requeridas (13):
   ├─ TEST*ID: Formato TC_MODULO*### (ej: TC_LOGIN_001)
   ├─ TIPO_PRUEBA: En [Funcional, Integración, Unitaria, API, E2E, Seguridad, Performance, Carga, Estrés, Accesibilidad, Regresión, Instalación]
   ├─ COMPONENTE: No vacío
   ├─ MODULO: No vacío
   ├─ REQUISITO_ID: Formato REQ-### (ej: REQ-LOGIN_001)
   ├─ DESCRIPCION: Min 20 caracteres
   ├─ PRECONDICIONES: No vacío o "N/A"
   ├─ PASOS: Min 3 pasos separados por \n
   ├─ RESULTADO_ESPERADO: Min 20 caracteres
   ├─ PRIORIDAD: En [P0, P1, P2, P3]
   ├─ RIESGO: En [Crítico, Alto, Medio, Bajo]
   ├─ ETIQUETA_AUTOMATIZACION: En [Si, No, Parcial]
   └─ ESTADO: En [Pendiente, En Implementación, Implementado, Validado]

3. Validaciones cross-row:
   ├─ TEST_ID único (sin duplicados)
   ├─ REQUISITO_ID debe ser subset de especificación original
   ├─ Cobertura de todos REQUISITO_ID presentes
   └─ Al menos 1 test P0 o P1

4. Estadísticas:
   ├─ Total tests
   ├─ Distribution por tipo
   ├─ Distribution por prioridad
   ├─ Coverage requisitos
   └─ Alertas si distribución sospechosa

SALIDA:
├─ ✅ CSV VÁLIDO
├─ ⚠️ CSV con ADVERTENCIAS
├─ 🔴 CSV INVÁLIDO (detalles de qué falta)
└─ Reporte JSON para automatización

PSEUDOCÓDIGO:

function ValidateCSVStructure {
param([string]$CSVPath, [string]$SpecPath)

    $csv = Import-Csv $CSVPath -Delimiter '|'
    $spec = Get-Content $SpecPath -Raw
    $errors = @()
    $warnings = @()

    # Validación 1: Headers
    $headers = @('TEST_ID','TIPO_PRUEBA','COMPONENTE','MODULO','REQUISITO_ID',
                 'DESCRIPCION','PRECONDICIONES','PASOS','RESULTADO_ESPERADO',
                 'PRIORIDAD','RIESGO','ETIQUETA_AUTOMATIZACION','ESTADO')

    if (@($csv[0].PSObject.Properties.Name).Count -ne $headers.Count) {
        $errors += "Número de columnas incorrecto"
    }

    # Validación 2: Cada fila
    $testIds = @()
    $reqIds = @()

    $csv | % {
        # Validación TEST_ID
        if ($_.TEST_ID -notmatch '^TC_[A-Z_]+_\d{3}$') {
            $errors += "TEST_ID inválido: $($_.TEST_ID)"
        }

        if ($testIds -contains $_.TEST_ID) {
            $errors += "TEST_ID duplicado: $($_.TEST_ID)"
        }
        $testIds += $_.TEST_ID

        # Validación TIPO_PRUEBA
        $tipos = @('Funcional','Integración','Unitaria','API','E2E','Seguridad',
                   'Performance','Carga','Estrés','Accesibilidad','Regresión','Instalación')
        if ($tipos -notcontains $_.TIPO_PRUEBA) {
            $errors += "TIPO_PRUEBA inválido: $($_.TIPO_PRUEBA)"
        }

        # Validación REQUISITO_ID
        $reqId = $_.REQUISITO_ID
        if ($spec -notmatch [regex]::Escape($reqId)) {
            $warnings += "REQUISITO_ID no encontrado en spec: $reqId"
        }
        $reqIds += $reqId

        # Validación DESCRIPCION, PASOS, etc.
        if ($_.DESCRIPCION.Length -lt 20) {
            $errors += "DESCRIPCION muy corta en $($_.TEST_ID)"
        }

        if (($_.PASOS | Measure-Object -Character).Characters -lt 30) {
            $errors += "PASOS muy cortos en $($_.TEST_ID)"
        }

        # Validación PRIORIDAD, RIESGO, ESTADO
        if ([regex]::Matches('P0|P1|P2|P3', $_.PRIORIDAD).Count -eq 0) {
            $errors += "PRIORIDAD inválida: $($_.PRIORIDAD)"
        }
    }

    # Validación 3: Cobertura de requisitos
    $reqsEnSpec = [regex]::Matches($spec, 'REQ-[A-Z0-9_]+') | % { $_.Value } | Select-Object -Unique
    $reqsEnCSV = $reqIds | Select-Object -Unique

    $reqsSinTest = $reqsEnSpec | ? { $_ -notin $reqsEnCSV }
    if ($reqsSinTest.Count -gt 0) {
        $errors += "Requisitos sin tests: $($reqsSinTest -join ', ')"
    }

    # Reportar
    if ($errors.Count -gt 0) {
        Write-Host "❌ CSV INVÁLIDO"
        $errors | % { Write-Host "   ❌ $_" -ForegroundColor Red }
        return $false
    }

    if ($warnings.Count -gt 0) {
        Write-Host "⚠️  ADVERTENCIAS"
        $warnings | % { Write-Host "   ⚠️  $_" -ForegroundColor Yellow }
    }

    Write-Host "✅ CSV VÁLIDO" -ForegroundColor Green
    Write-Host "  - $($csv.Count) tests"
    Write-Host "  - $($reqsEnCSV.Count) requisitos cubiertos"
    return $true

}

ITEM 1.3: GenerateRequirementsMatrix.ps1 (1 hora)
═══════════════════════════════════════════════════════════════════════════════

ARCHIVO: HAIDA/tools/GenerateRequirementsMatrix.ps1 (CREAR)

ENTRADA:
├─ CSV validado (test-cases-YYYY-MM-DD.csv)
└─ Especificación original (example-brd.md)

SALIDA:
├─ requirements-matrix-YYYY-MM-DD.csv (pipe-separated)
│ ├─ REQUISITO*ID | TIPO_REQ | TESTS_COVERED | TIPOS_PRUEBA | COVERAGE*% | ESTADO
│ └─ REQ-001 | Funcional | TC_LOGIN_001,TC_LOGIN_005 | Funcional,E2E | 100% | ✅
│
└─ requirements-matrix-stats.txt
├─ Total requisitos: 12
├─ Requisitos cubiertos: 12 (100%)
├─ Requisitos sin tests: 0
├─ Cobertura promedio: 87%
└─ ESTADO: ✅ LISTO PARA IMPLEMENTAR

FUNCIONALIDAD:
├─ Extrae todos REQ-### de especificación
├─ Mapea cada REQ a tests en CSV
├─ Calcula cobertura por tipo de prueba
├─ Detecta requisitos huérfanos (sin tests)
├─ Genera matriz de trazabilidad
└─ Genera alertas si cobertura < 90%

PSEUDOCÓDIGO:

function GenerateRequirementsMatrix {
param([string]$CSVPath, [string]$SpecPath)

    $csv = Import-Csv $CSVPath -Delimiter '|'
    $spec = Get-Content $SpecPath -Raw

    # Extraer todos REQ-### de especificación
    $reqsInSpec = [regex]::Matches($spec, 'REQ-[A-Z0-9_]+') | % { $_.Value } | Select-Object -Unique

    # Crear matriz
    $matrix = @()
    foreach ($req in $reqsInSpec) {
        $testsForReq = $csv | ? { $_.REQUISITO_ID -eq $req }
        $tipos = @($testsForReq | % { $_.TIPO_PRUEBA } | Select-Object -Unique) -join ', '
        $coverage = $testsForReq.Count

        $matrix += @{
            REQUISITO_ID = $req
            TESTS_COVERED = @($testsForReq | % { $_.TEST_ID }) -join ','
            TIPOS_PRUEBA = $tipos
            NUM_TESTS = $coverage
            COVERAGE_% = if ($coverage -gt 0) { "✅" } else { "⚠️" }
            ESTADO = if ($coverage -gt 0) { "Cubierto" } else { "SIN COBERTURA" }
        }
    }

    # Exportar
    $matrixPath = "$((Get-Item $CSVPath).Directory)\requirements-matrix-$(Get-Date -Format 'yyyyMMdd').csv"
    $matrix | ConvertTo-Csv -Delimiter '|' -NoTypeInformation | Set-Content $matrixPath

    # Estadísticas
    $totalReqs = $reqsInSpec.Count
    $coveredReqs = ($matrix | ? { $_.NUM_TESTS -gt 0 }).Count
    $coverage = [Math]::Round(($coveredReqs / $totalReqs) * 100)

    Write-Host "📊 MATRIZ DE REQUISITOS"
    Write-Host "  - Total requisitos: $totalReqs"
    Write-Host "  - Requisitos cubiertos: $coveredReqs ($coverage%)"
    Write-Host "  - Requisitos sin tests: $($totalReqs - $coveredReqs)"

    if ($coverage -lt 90) {
        Write-Host "⚠️  ALERTA: Cobertura < 90%" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Cobertura > 90%" -ForegroundColor Green
    }

    return $matrix

}

ITEM 1.4: Mejorar generate-tests.ps1 (1 hora)
═══════════════════════════════════════════════════════════════════════════════

MODIFICACIÓN: HAIDA/generators/generate-tests.ps1

AGREGAR después de cada paso:

Step 1: Validar especificación
├─ Llamar ValidateSpecification ($docPath)
├─ Si falla, stop con error
└─ Si ok, continuar

Step 2: Preparar prompt (IGUAL)

Step 3: Mostrar opciones (IGUAL)

Step 4: NUEVO - Validar CSV
├─ Pedir ruta a CSV pasted
├─ Llamar ValidateCSVStructure ($csvPath, $docPath)
├─ Si falla, pedir reintentar
├─ Si ok, continuar

Step 5: NUEVO - Generar matriz requisitos
├─ Llamar GenerateRequirementsMatrix ($csvPath, $docPath)
├─ Reportar cobertura
├─ Si < 90%, pedir revisión
└─ Si >= 90%, continuar

Step 6: Guardar CSV validado
├─ Copiar a outputs/ con timestamp
├─ Copiar matriz requisitos
└─ Reportar localización

ITEM 1.5: Agregar Quality Gates a run-qa-local.ps1 (1.5 horas)
═══════════════════════════════════════════════════════════════════════════════

MODIFICACIÓN: run-qa-local.ps1

AGREGAR GATES DESPUÉS DE CADA FASE:

GATE 1: Setup validado
├─ Node.js disponible
├─ npm disponible
├─ Dependencias npm OK
└─ BLOQUEANTE si falla

GATE 2: Servidor healthcheck
├─ Servidor responde /health
├─ Response = 200 OK
├─ Response time < 1000ms
└─ TIMEOUT si tarda > 30 seg

GATE 3: Archivo test exists
├─ Playwright tests existen
├─ Jest tests existen
└─ BLOQUEANTE si faltan

GATE 4: Ejecución validada
├─ Tests ejecutan sin syntax error
├─ No hay timeouts
├─ Allure results generados
└─ BLOQUEANTE si no se genera

PSEUDOCÓDIGO:

function ValidateGate {
param([string]$GateName, [scriptblock]$Validation)

    Write-Host ""
    Write-Host "🚪 GATE: $GateName" -ForegroundColor Cyan

    try {
        $result = & $Validation
        if ($result -eq $true) {
            Write-Host "✅ GATE PASSED" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ GATE FAILED: $result" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ GATE ERROR: $_" -ForegroundColor Red
        return $false
    }

}

# Uso:

ValidateGate "Setup" {
if ((node -v) -and (npm -v)) { return $true }
return "Node.js o npm no disponible"
}

═══════════════════════════════════════════════════════════════════════════════
📋 SEMANA 3-4: REORGANIZACIÓN ESTRUCTURA (15 HORAS)
═══════════════════════════════════════════════════════════════════════════════

ITEM 2.1: Crear estructura validations/ (1 hora)

Crear: HAIDA/validations/v1.0/
├─ TIPOS_PRUEBAS_VALIDACION.md
├─ MAPEO-PIRAMIDE-COHN.md
├─ ALINEACION-SERVICIOS-HIBERUS.md
├─ METRICAS-Y-KPIS.md
├─ README.md (índice)
└─ CHANGELOG.md (histórico)

ITEM 2.2: Crear estructura config/ (1 hora)

Crear: HAIDA/config/
├─ hiberus-policies.json (políticas Hiberus)
│ ├─ coverage_min_percentage: 90
│ ├─ max_test_duration_seconds: 300
│ ├─ quality_gates: [GATE1, GATE2, ...]
│ └─ reporting_format: "allure"
│
├─ quality-gates.json (definiciones gates)
│ ├─ GATE_SETUP: validaciones, severity
│ ├─ GATE_VALIDATION: validaciones, severity
│ └─ GATE_EXECUTION: validaciones, severity
│
└─ tool-config.json (configuración herramientas)
├─ jest: { timeout, workers, coverage }
├─ playwright: { timeout, workers, retries }
├─ newman: { timeout, iterations }
└─ lighthouse: { threshold }

ITEM 2.3: Crear estructura tools/ (1.5 horas)

Mover/Crear: HAIDA/generators/tools/
├─ ValidateSpecification.ps1 (1.1)
├─ ValidateCSVStructure.ps1 (1.2)
├─ GenerateRequirementsMatrix.ps1 (1.3)
├─ coverage-calculator.ps1 (nuevo)
├─ report-generator.ps1 (nuevo)
└─ json-validator.ps1 (nuevo)

ITEM 2.4: Crear test templates (2 horas)

Crear: HAIDA/templates/test-templates/
├─ playwright-test.spec.ts.template
├─ jest-test.spec.ts.template
├─ api-test.postman.json.template
├─ accessibility-test.template
└─ performance-test.k6.js.template

ITEM 2.5: Actualizar links y referencias (2 horas)

Actualizar:
├─ README.md (links a new structure)
├─ QUICK-START.md (paths)
├─ INDEX.md (reorganización)
├─ generate-tests.ps1 (import de tools)
└─ run-qa-local.ps1 (import de config)

ITEM 2.6: Crear CHANGELOG.md (0.5 horas)

Contenido:
├─ v1.+34662652300): Initial release
│ ├─ ✅ 12 tipos pruebas cubiertos
│ ├─ ✅ 5 servicios Hiberus alineados
│ └─ ✅ 97% ROI demostrado
│
├─ v1.1 (2025-01-XX) [PRÓXIMO]:
│ ├─ ✅ Validación automática CSV
│ ├─ ✅ Validación especificaciones
│ ├─ ✅ Matriz requisitos
│ ├─ ✅ Quality gates
│ └─ ✅ Reorganización estructura
│
└─ Future: CI/CD pipeline, batch processing, etc.

═══════════════════════════════════════════════════════════════════════════════
TABLA DE IMPLEMENTACIÓN RESUMIDA
═══════════════════════════════════════════════════════════════════════════════

SEMANA 1-2: VALIDACIÓN (20 HORAS)
┌────────────────────────────────────────────────────────────────────────┐
│ ITEM │ DESCRIPCIÓN │ HORAS │ ARCHIVO/MODIFICACIÓN │
├───────────────────────────────────────────────────────────────────────┤
│ 1.1 │ ValidateSpecification.ps1 │ 1.0 │ CREAR tools/ │
│ 1.2 │ ValidateCSVStructure.ps1 │ 1.5 │ CREAR tools/ │
│ 1.3 │ GenerateRequirementsMatrix.ps1 │ 1.0 │ CREAR tools/ │
│ 1.4 │ Mejorar generate-tests.ps1 │ 1.0 │ MODIFICAR generators/ │
│ 1.5 │ Quality Gates run-qa-local.ps1 │ 1.5 │ MODIFICAR raíz/ │
│ 2.1 │ Health check servidor │ 0.5 │ MODIFICAR raíz/ │
│ 2.2 │ Validar dependencias │ 0.5 │ MODIFICAR raíz/ │
│ 2.3 │ Logging estructurado │ 0.75 │ MODIFICAR raíz/ │
│ 2.4 │ Testing/debugging nuevos items │ 3.0 │ Terminal testing │
│ │ SUBTOTAL SEMANAS 1-2 │ 20.0 │ │
└───────────────────────────────────────────────────────────────────────┘

SEMANA 3-4: REORGANIZACIÓN (15 HORAS)
┌────────────────────────────────────────────────────────────────────────┐
│ ITEM │ DESCRIPCIÓN │ HORAS │ DIRECTORIO │
├───────────────────────────────────────────────────────────────────────┤
│ 3.1 │ Crear structure validations/ │ 1.0 │ HAIDA/ │
│ 3.2 │ Crear structure config/ │ 1.0 │ HAIDA/ │
│ 3.3 │ Crear structure tools/ │ 1.5 │ generators/ │
│ 3.4 │ Crear test templates │ 2.0 │ templates/ │
│ 3.5 │ Actualizar links internos │ 2.0 │ Múltiples .md │
│ 3.6 │ Crear CHANGELOG.md │ 0.5 │ HAIDA/ │
│ 3.7 │ Testing migración │ 5.0 │ Terminal testing │
│ 3.8 │ Documentar nuevos paths │ 2.0 │ README.md updates │
│ │ SUBTOTAL SEMANAS 3-4 │ 15.0 │ │
└───────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
IMPACTO ESPERADO DESPUÉS DE SEMANAS 1-4
═══════════════════════════════════════════════════════════════════════════════

ANTES:
├─ ❌ Validación manual
├─ ❌ CSV sin verificar → Tests quebrados
├─ ❌ Gaps de cobertura no detectados
├─ ❌ Scripts desorganizados
└─ ❌ Sin logging persistente

DESPUÉS:
├─ ✅ Validación automática en cada etapa
├─ ✅ CSV garantizado válido o BLOQUEADO
├─ ✅ Matriz requisitos con 100% trazabilidad
├─ ✅ Estructura escalable y mantenible
├─ ✅ Logging y auditoría completa
├─ ✅ Quality Gates en 4 puntos críticos
├─ ✅ Listo para CI/CD
└─ ✅ Documentación actualizada

REDUCCIÓN DE RIESGOS:
├─ Previene 90% de defectos por CSV inválido
├─ Detecta gaps de cobertura antes de implementación
├─ Facilita debugging con logging estructurado
├─ Automatiza validaciones manuales
└─ Alinea con estándares Hiberus

ROI FASE 1:
├─ Inversión: 40 horas
├─ Ahorro primeros 3 meses: 150 horas (debugging, re-trabajo)
├─ Ratio: 3.75x ROI en 3 meses
└─ Payback: 2 semanas

═════════════════════════════════════════════════════════════════════════════════
DOCUMENTO: PLAN-IMPLEMENTACION-CRITICA-SEMANAS-1-4.md
TIPO: Plan de acción detallado
CREADO: 15/12/2025
STATUS: Listo para ejecución
SIGUIENTE: Implementar items 1.1-1.5 (SEMANA 1)
═════════════════════════════════════════════════════════════════════════════════
