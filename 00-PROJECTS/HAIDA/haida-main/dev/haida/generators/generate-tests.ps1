#!/usr/bin/env powershell
<#
═══════════════════════════════════════════════════════════════════════════════
  ISTQB-HIBERUS TEST CASE GENERATOR
  
  Propósito: Automatizar generación de test cases ISTQB desde documentación
             funcional usando IA (Copilot/Claude)
  
  Modo de uso:
    powershell -File istqb-hiberus\generators\generate-tests.ps1 `
      -DocPath "istqb-hiberus\docs\especificacion-login.md"
  
  Salida:
    istqb-hiberus\outputs\test-cases-YYYY-MM-DD.csv
    istqb-hiberus\outputs\requirements-matrix.csv
    istqb-hiberus\outputs\execution-summary.txt

═══════════════════════════════════════════════════════════════════════════════
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$DocPath,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputFolder = "istqb-hiberus\outputs",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipPrompt,
    
    [Parameter(Mandatory=$false)]
    [switch]$GeneratePlaywrightSpec
)

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    ISTQB-HIBERUS TEST GENERATOR                             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. VALIDAR DOCUMENTO DE ENTRADA
Write-Host "[1/4] Validando documento funcional..." -ForegroundColor Yellow

if (-not (Test-Path $DocPath)) {
    Write-Host "❌ Error: Documento no encontrado en $DocPath" -ForegroundColor Red
    exit 1
}

$docContent = Get-Content $DocPath -Raw
Write-Host "✓ Documento cargado: $(Split-Path $DocPath -Leaf)" -ForegroundColor Green
Write-Host "  Tamaño: $([math]::Round((Get-Item $DocPath).Length / 1KB, 2)) KB" -ForegroundColor Gray

# Extraer info del documento
$moduleName = if ($docContent -match "# (.+)(?:\n|$)") { $matches[1] } else { "Unknown" }
$reqCount = [regex]::Matches($docContent, "REQ-\d+").Count
Write-Host "  Módulo: $moduleName" -ForegroundColor Gray
Write-Host "  Requisitos detectados: $reqCount" -ForegroundColor Gray
Write-Host ""

# 2. PREPARAR PROMPT ISTQB
Write-Host "[2/4] Preparando prompt ISTQB para IA..." -ForegroundColor Yellow

$istqbPrompt = @"
Eres un experto en testing según estándares ISTQB. 

Analiza el siguiente documento funcional y genera test cases profesionales, 
estructurados y auditables.

INSTRUCCIONES:
1. Extrae TODOS los requisitos (REQ-###)
2. Para cada requisito, crea test cases alineados a tipos ISTQB:
   - Unit Tests (validación de lógica, funciones)
   - Integration Tests (comunicación entre componentes)
   - API Tests (contracts, payloads, status codes)
   - E2E Tests (flujos de usuario completos)
   - Smoke Tests (health checks)
   - Security Tests (inyecciones, auth, validación)
   - Accessibility Tests (WCAG 2A)
   - Performance Tests (latencia, carga)
   - Data Quality Tests (integridad, formatos)

3. Para CADA test case, incluye:
   - TEST_ID: TC_[MODULO]_[###]
   - TIPO_PRUEBA: Unit/API/E2E/Smoke/Regression/Performance/Security/Accessibility
   - COMPONENTE: Nombre del componente
   - MODULO: Nombre del módulo
   - REQUISITO_ID: Referencia REQ-###
   - DESCRIPCION: Qué se prueba (clara, concisa)
   - PRECONDICIONES: Estado inicial (BD, datos, env vars)
   - PASOS: Numerados, ejecutables, sin ambigüedad
   - RESULTADO_ESPERADO: Asertable (verifiable)
   - PRIORIDAD: P0 (blocker) | P1 (crítico) | P2 (medio) | P3 (bajo)
   - RIESGO: Alto | Medio | Bajo
   - ETIQUETA_AUTOMATIZACION: @unit @api @e2e @regression @perf @security @a11y (tags)
   - ESTADO: Generado

4. Genera el output EN FORMATO CSV con pipes (|) como separadores.

5. Asegúrate de:
   ✓ Cobertura ISTQB completa (todos los tipos presentes)
   ✓ Trazabilidad clara REQ → Test
   ✓ PASOS ejecutables y verificables
   ✓ Prioridad basada en riesgo de negocio
   ✓ Etiquetas consistentes para grep en Playwright

DOCUMENTO A ANALIZAR:
$docContent

OUTPUT ESPERADO:
CSV con header:
TEST_ID|TIPO_PRUEBA|COMPONENTE|MODULO|REQUISITO_ID|DESCRIPCION|PRECONDICIONES|PASOS|RESULTADO_ESPERADO|PRIORIDAD|RIESGO|ETIQUETA_AUTOMATIZACION|ESTADO

[Filas de test cases...]

Incluye al final:
- Resumen: "Total test cases: XXX"
- Cobertura: "Cobertura ISTQB: Unit(X), API(X), E2E(X), ..."

¡Genera el CSV ahora!
"@

Write-Host "✓ Prompt ISTQB preparado" -ForegroundColor Green
Write-Host "  Líneas: $(($istqbPrompt | Measure-Object -Line).Lines)" -ForegroundColor Gray
Write-Host ""

# 3. INSTRUCCIONES AL USUARIO
Write-Host "[3/4] Instrucciones para generar test cases con IA..." -ForegroundColor Yellow
Write-Host ""
Write-Host "El sistema requiere IA para generar test cases. Opciones:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  OPCIÓN A: Copilot Chat (VS Code - Recomendado)" -ForegroundColor Yellow
Write-Host "    1. Abre VS Code" -ForegroundColor Gray
Write-Host "    2. Abre Copilot Chat (Ctrl+Shift+I)" -ForegroundColor Gray
Write-Host "    3. Copia el prompt de abajo y pégalo en Chat" -ForegroundColor Gray
Write-Host "    4. Copia el CSV resultado" -ForegroundColor Gray
Write-Host "    5. Guarda en: istqb-hiberus/outputs/test-cases-YYYY-MM-DD.csv" -ForegroundColor Gray
Write-Host ""
Write-Host "  OPCIÓN B: Claude.ai" -ForegroundColor Yellow
Write-Host "    1. Ve a https://claude.ai" -ForegroundColor Gray
Write-Host "    2. Nuevo chat" -ForegroundColor Gray
Write-Host "    3. Pega el prompt de abajo" -ForegroundColor Gray
Write-Host "    4. Copia CSV resultado" -ForegroundColor Gray
Write-Host ""
Write-Host "  OPCIÓN C: API (automatizado - requiere API key)" -ForegroundColor Yellow
Write-Host "    1. Configura: \$env:ANTHROPIC_API_KEY = 'tu-key'" -ForegroundColor Gray
Write-Host "    2. El script lo hace automáticamente (en desarrollo)" -ForegroundColor Gray
Write-Host ""

# Guardar prompt en archivo para facilitar copia
$promptFile = "$OutputFolder\PROMPT-TO-COPILOT-$timestamp.txt"
if (-not (Test-Path $OutputFolder)) {
    New-Item -ItemType Directory -Path $OutputFolder | Out-Null
}
$istqbPrompt | Out-File $promptFile -Encoding UTF8
Write-Host "✓ Prompt guardado en: $promptFile" -ForegroundColor Green
Write-Host "  Abre este archivo y copia el contenido a Copilot Chat" -ForegroundColor Gray
Write-Host ""

# Mostrar una parte del prompt
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
Write-Host "PROMPT A COPILOT (primeras líneas):" -ForegroundColor DarkGray
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
Write-Host ($istqbPrompt -split "`n" | Select-Object -First 20 | Out-String) -ForegroundColor DarkGray
Write-Host "[... ver archivo completo: $promptFile ...]" -ForegroundColor DarkGray
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
Write-Host ""

# 4. ESPERAR INPUT DEL USUARIO
Write-Host "[4/4] Siguiente paso..." -ForegroundColor Yellow
Write-Host ""
if (-not $SkipPrompt) {
    Write-Host "¿Ya tienes el CSV generado por IA y listo para guardar?" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Opciones:" -ForegroundColor Gray
    Write-Host "  1. Sí, pegar CSV y continuar" -ForegroundColor Gray
    Write-Host "  2. No, voy a generar en Copilot primero (salir)" -ForegroundColor Gray
    Write-Host "  3. Usar ejemplo de demostración" -ForegroundColor Gray
    Write-Host ""
    $choice = Read-Host "Selecciona (1/2/3)"
    
    switch ($choice) {
        "1" {
            Write-Host "Pega el CSV resultado (termina con una línea vacía):" -ForegroundColor Yellow
            Write-Host "Nota: Incluir el header: TEST_ID|TIPO_PRUEBA|..." -ForegroundColor Gray
            Write-Host ""
            
            $csvContent = @()
            while ($true) {
                $line = Read-Host ""
                if ($line -eq "") { break }
                $csvContent += $line
            }
            
            $csv = $csvContent -join "`n"
            $outputPath = "$OutputFolder\test-cases-$(Get-Date -Format 'yyyy-MM-dd').csv"
            $csv | Out-File $outputPath -Encoding UTF8
            
            Write-Host ""
            Write-Host "✓ CSV guardado en: $outputPath" -ForegroundColor Green
            Write-Host "  Líneas: $($csvContent.Count)" -ForegroundColor Gray
            Write-Host ""
            Write-Host "Siguiente: Usar el CSV en la suite de tests" -ForegroundColor Cyan
            Write-Host "  1. Revisar CSV manualmente" -ForegroundColor Gray
            Write-Host "  2. Convertir a Playwright spec: node istqb-hiberus\generators\parse-csv.js" -ForegroundColor Gray
            Write-Host "  3. Ejecutar tests: npm run test:web" -ForegroundColor Gray
        }
        
        "2" {
            Write-Host ""
            Write-Host "Pasos:" -ForegroundColor Yellow
            Write-Host "  1. Abre el archivo de prompt: $promptFile" -ForegroundColor Gray
            Write-Host "  2. Cópialo a Copilot Chat en VS Code (Ctrl+Shift+I)" -ForegroundColor Gray
            Write-Host "  3. Espera a que genere el CSV" -ForegroundColor Gray
            Write-Host "  4. Vuelve a ejecutar este script con los resultados" -ForegroundColor Gray
            Write-Host ""
            exit 0
        }
        
        "3" {
            Write-Host "Usando ejemplo de demostración..." -ForegroundColor Cyan
            if (Test-Path "istqb-hiberus\examples\example-output.csv") {
                Copy-Item "istqb-hiberus\examples\example-output.csv" `
                    -Destination "$OutputFolder\test-cases-$(Get-Date -Format 'yyyy-MM-dd')-demo.csv"
                Write-Host "✓ Ejemplo copiado a: $OutputFolder" -ForegroundColor Green
                Write-Host ""
                Write-Host "Este es un ejemplo de 22 test cases generados automáticamente" -ForegroundColor Cyan
                Write-Host "Para tu propio proyecto, sigue pasos 1 y 2" -ForegroundColor Cyan
            }
        }
    }
} else {
    Write-Host "Modo skip-prompt activado" -ForegroundColor Yellow
    Write-Host "CSV esperado en: $OutputFolder\test-cases-*.csv" -ForegroundColor Gray
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "RESUMEN ISTQB-HIBERUS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Documento analizado: $moduleName" -ForegroundColor Green
Write-Host "✓ Requisitos detectados: $reqCount" -ForegroundColor Green
Write-Host "✓ Prompt ISTQB generado y guardado" -ForegroundColor Green
Write-Host "✓ Próximo: Usar IA para generar test cases" -ForegroundColor Green
Write-Host ""
Write-Host "Documentación:" -ForegroundColor Yellow
Write-Host "  - README.md → Visión general" -ForegroundColor Gray
Write-Host "  - FUNCTIONAL-SPEC-TEMPLATE.md → Cómo escribir especificaciones" -ForegroundColor Gray
Write-Host "  - ISTQB-PROMPT-ENGINEER.md → Prompts personalizados" -ForegroundColor Gray
Write-Host "  - CSV-SCHEMA.md → Definición de columnas CSV" -ForegroundColor Gray
Write-Host "  - STEP-BY-STEP.md → Ejemplo completo Login" -ForegroundColor Gray
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
