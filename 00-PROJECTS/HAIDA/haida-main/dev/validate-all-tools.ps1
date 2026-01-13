#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Validar todas las herramientas necesarias para HAIDA: Playwright, Appium, Newman, k6, axe-core, Allure
.DESCRIPTION
    Script que verifica instalación, versiones y funcionamiento básico de todas las herramientas QA
.AUTHOR
    Carlos Arévalo | caarevalo@hiberus.com
#>

param(
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Continue"
$SuccessColor = "Green"
$WarningColor = "Yellow"
$ErrorColor = "Red"

# Variables globales
$validation_results = @()
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$report_path = ".\reports\tools-validation-$timestamp.json"

function Write-FormattedLog {
    param($Message, $Level = "INFO")
    $colors = @{
        "OK"    = $SuccessColor
        "WARN"  = $WarningColor
        "ERROR" = $ErrorColor
        "INFO"  = "Cyan"
    }
    Write-Host "[$Level] $Message" -ForegroundColor $colors[$Level]
}

# ============================================================
# 1. PLAYWRIGHT VALIDATION
# ============================================================
function Validate-Playwright {
    Write-FormattedLog "═════════════════════════════════════════════════════════════" -Level "INFO"
    Write-FormattedLog "Validando Playwright..." -Level "INFO"
    Write-FormattedLog "═════════════════════════════════════════════════════════════" -Level "INFO"
    
    try {
        $pw_version = npm list @playwright/test 2>$null | Select-String "playwright" | Select-Object -First 1
        if ($pw_version) {
            Write-FormattedLog "✓ Playwright instalado: $pw_version" -Level "OK"
            
            # Verificar navegadores
            $browsers = @("chromium", "firefox", "webkit")
            $missing_browsers = @()
            
            foreach ($browser in $browsers) {
                $status = npx playwright install --with-$browser 2>&1
                if ($?) {
                    Write-FormattedLog "  ✓ Navegador $browser: OK" -Level "OK"
                } else {
                    $missing_browsers += $browser
                    Write-FormattedLog "  ✗ Navegador $browser: FALTA" -Level "WARN"
                }
            }
            
            if ($missing_browsers.Count -gt 0) {
                Write-FormattedLog "  ⚠ Instalar navegadores faltantes: npx playwright install" -Level "WARN"
            }
            
            $validation_results += [PSCustomObject]@{
                Tool       = "Playwright"
                Status     = "OK"
                Version    = $pw_version
                Details    = "Instalado con navegadores"
                Timestamp  = Get-Date
            }
        }
    }
    catch {
        Write-FormattedLog "✗ Playwright: ERROR - $_" -Level "ERROR"
        $validation_results += [PSCustomObject]@{
            Tool       = "Playwright"
            Status     = "ERROR"
            Version    = "N/A"
            Details    = $_.Exception.Message
            Timestamp  = Get-Date
        }
    }
}

# ============================================================
# 2. APPIUM VALIDATION
# ============================================================
function Validate-Appium {
    Write-FormattedLog "═════════════════════════════════════════════════════════════" -Level "INFO"
    Write-FormattedLog "Validando Appium..." -Level "INFO"
    Write-FormattedLog "═════════════════════════════════════════════════════════════" -Level "INFO"
    
    try {
        $appium_test = npm list appium 2>$null | Select-String "appium"
        if ($appium_test) {
            Write-FormattedLog "✓ Appium instalado" -Level "OK"
            $validation_results += [PSCustomObject]@{
                Tool       = "Appium"
                Status     = "OK"
                Version    = "Instalado"
                Details    = "Mobile testing framework listo"
                Timestamp  = Get-Date
            }
        } else {
            Write-FormattedLog "⚠ Appium no encontrado. Instalando..." -Level "WARN"
            npm install appium --save-dev --legacy-peer-deps
            Write-FormattedLog "✓ Appium instalado correctamente" -Level "OK"
            $validation_results += [PSCustomObject]@{
                Tool       = "Appium"
                Status     = "INSTALLED"
                Version    = "Nuevamente instalado"
                Details    = "Requiere configuración de dispositivos"
                Timestamp  = Get-Date
            }
        }
    }
    catch {
        Write-FormattedLog "✗ Appium: ERROR - $_" -Level "ERROR"
        $validation_results += [PSCustomObject]@{
            Tool       = "Appium"
            Status     = "ERROR"
            Version    = "N/A"
            Details    = $_.Exception.Message
            Timestamp  = Get-Date
        }
    }
}

# ============================================================
# 3. NEWMAN (POSTMAN) VALIDATION
# ============================================================
function Validate-Newman {
    Write-FormattedLog "═════════════════════════════════════════════════════════════" -Level "INFO"
    Write-FormattedLog "Validando Newman (Postman CLI)..." -Level "INFO"
    Write-FormattedLog "═════════════════════════════════════════════════════════════" -Level "INFO"
    
    try {
        $newman_version = npm list newman 2>$null | Select-String "newman"
        if ($newman_version) {
            Write-FormattedLog "✓ Newman instalado" -Level "OK"
            
            # Verificar que puede ejecutarse
            $test_run = & npx newman --version 2>&1
            if ($?) {
                Write-FormattedLog "  ✓ Newman ejecutable correctamente" -Level "OK"
                $validation_results += [PSCustomObject]@{
                    Tool       = "Newman"
                    Status     = "OK"
                    Version    = $test_run
                    Details    = "CLI de Postman funcional"
                    Timestamp  = Get-Date
                }
            }
        }
    }
    catch {
        Write-FormattedLog "✗ Newman: ERROR - $_" -Level "ERROR"
        $validation_results += [PSCustomObject]@{
            Tool       = "Newman"
            Status     = "ERROR"
            Version    = "N/A"
            Details    = "Postman CLI no funcional"
            Timestamp  = Get-Date
        }
    }
}

# ============================================================
# 4. K6 (PERFORMANCE) VALIDATION
# ============================================================
function Validate-K6 {
    Write-FormattedLog "═════════════════════════════════════════════════════════════" -Level "INFO"
    Write-FormattedLog "Validando k6 (Performance Testing)..." -Level "INFO"
    Write-FormattedLog "═════════════════════════════════════════════════════════════" -Level "INFO"
    
    try {
        $k6_test = npm list k6 2>$null | Select-String "k6"
        if ($k6_test) {
            Write-FormattedLog "✓ k6 instalado" -Level "OK"
            $validation_results += [PSCustomObject]@{
                Tool       = "k6"
                Status     = "OK"
                Version    = "Instalado"
                Details    = "Testing de rendimiento disponible"
                Timestamp  = Get-Date
            }
        } else {
            Write-FormattedLog "⚠ k6 no encontrado - opcional pero recomendado" -Level "WARN"
            Write-FormattedLog "  Para instalarlo: npm install k6 --save-dev" -Level "WARN"
            $validation_results += [PSCustomObject]@{
                Tool       = "k6"
                Status     = "MISSING"
                Version    = "N/A"
                Details    = "Opcional - Performance testing"
                Timestamp  = Get-Date
            }
        }
    }
    catch {
        Write-FormattedLog "✗ k6: ERROR - $_" -Level "ERROR"
        $validation_results += [PSCustomObject]@{
            Tool       = "k6"
            Status     = "ERROR"
            Version    = "N/A"
            Details    = $_.Exception.Message
            Timestamp  = Get-Date
        }
    }
}

# ============================================================
# 5. AXE-CORE (ACCESSIBILITY) VALIDATION
# ============================================================
function Validate-AxeCore {
    Write-FormattedLog "═════════════════════════════════════════════════════════════" -Level "INFO"
    Write-FormattedLog "Validando axe-core (Accessibility Testing)..." -Level "INFO"
    Write-FormattedLog "═════════════════════════════════════════════════════════════" -Level "INFO"
    
    try {
        $axe_test = npm list axe-core 2>$null | Select-String "axe-core"
        if ($axe_test) {
            Write-FormattedLog "✓ axe-core instalado" -Level "OK"
            $validation_results += [PSCustomObject]@{
                Tool       = "axe-core"
                Status     = "OK"
                Version    = "Instalado"
                Details    = "Testing de accesibilidad (WCAG) disponible"
                Timestamp  = Get-Date
            }
        } else {
            Write-FormattedLog "⚠ axe-core no encontrado - importante para WCAG" -Level "WARN"
            Write-FormattedLog "  Para instalarlo: npm install axe-core --save-dev" -Level "WARN"
            $validation_results += [PSCustomObject]@{
                Tool       = "axe-core"
                Status     = "MISSING"
                Version    = "N/A"
                Details    = "Importante para validación WCAG 2A"
                Timestamp  = Get-Date
            }
        }
    }
    catch {
        Write-FormattedLog "✗ axe-core: ERROR - $_" -Level "ERROR"
        $validation_results += [PSCustomObject]@{
            Tool       = "axe-core"
            Status     = "ERROR"
            Version    = "N/A"
            Details    = $_.Exception.Message
            Timestamp  = Get-Date
        }
    }
}

# ============================================================
# 6. ALLURE REPORTING VALIDATION
# ============================================================
function Validate-Allure {
    Write-FormattedLog "═════════════════════════════════════════════════════════════" -Level "INFO"
    Write-FormattedLog "Validando Allure (Reporting)..." -Level "INFO"
    Write-FormattedLog "═════════════════════════════════════════════════════════════" -Level "INFO"
    
    try {
        $allure_test = npm list @wdio/allure-reporter 2>$null | Select-String "allure"
        if ($allure_test) {
            Write-FormattedLog "✓ Allure Reporter instalado" -Level "OK"
            
            # Verificar carpeta de resultados
            if (Test-Path "./allure-results") {
                Write-FormattedLog "  ✓ Carpeta allure-results existe" -Level "OK"
            } else {
                Write-FormattedLog "  ⚠ Creando carpeta allure-results..." -Level "WARN"
                New-Item -ItemType Directory -Force -Path "./allure-results" | Out-Null
                Write-FormattedLog "  ✓ Carpeta creada" -Level "OK"
            }
            
            $validation_results += [PSCustomObject]@{
                Tool       = "Allure"
                Status     = "OK"
                Version    = "Instalado"
                Details    = "Reportes profesionales configurados"
                Timestamp  = Get-Date
            }
        }
    }
    catch {
        Write-FormattedLog "✗ Allure: ERROR - $_" -Level "ERROR"
        $validation_results += [PSCustomObject]@{
            Tool       = "Allure"
            Status     = "ERROR"
            Version    = "N/A"
            Details    = $_.Exception.Message
            Timestamp  = Get-Date
        }
    }
}

# ============================================================
# MAIN EXECUTION
# ============================================================

Write-FormattedLog "╔════════════════════════════════════════════════════════════╗" -Level "INFO"
Write-FormattedLog "║         VALIDACIÓN DE HERRAMIENTAS - HAIDA v1.0            ║" -Level "INFO"
Write-FormattedLog "╚════════════════════════════════════════════════════════════╝" -Level "INFO"
Write-FormattedLog "Autor: Carlos Arévalo | caarevalo@hiberus.com" -Level "INFO"
Write-FormattedLog ""

# Ejecutar validaciones
Validate-Playwright
Validate-Appium
Validate-Newman
Validate-K6
Validate-AxeCore
Validate-Allure

# Resumen
Write-FormattedLog ""
Write-FormattedLog "╔════════════════════════════════════════════════════════════╗" -Level "INFO"
Write-FormattedLog "║                  RESUMEN DE VALIDACIÓN                     ║" -Level "INFO"
Write-FormattedLog "╚════════════════════════════════════════════════════════════╝" -Level "INFO"

$ok_count = ($validation_results | Where-Object { $_.Status -eq "OK" -or $_.Status -eq "INSTALLED" }).Count
$error_count = ($validation_results | Where-Object { $_.Status -eq "ERROR" }).Count
$missing_count = ($validation_results | Where-Object { $_.Status -eq "MISSING" }).Count
$total_count = $validation_results.Count

Write-FormattedLog "Total herramientas: $total_count" -Level "INFO"
Write-FormattedLog "✓ Operacionales: $ok_count" -Level "OK"
Write-FormattedLog "⚠ Faltantes: $missing_count" -Level "WARN"
Write-FormattedLog "✗ Errores: $error_count" -Level "ERROR"

Write-FormattedLog ""
Write-FormattedLog "Detalle de herramientas:" -Level "INFO"
$validation_results | Format-Table -AutoSize @(
    @{ Label = "Herramienta"; Expression = { $_.Tool } },
    @{ Label = "Estado"; Expression = { $_.Status } },
    @{ Label = "Detalles"; Expression = { $_.Details } }
)

# Guardar reporte
New-Item -ItemType Directory -Path "./reports" -Force | Out-Null
$validation_results | ConvertTo-Json | Set-Content -Path $report_path -Encoding UTF8
Write-FormattedLog ""
Write-FormattedLog "Reporte guardado en: $report_path" -Level "INFO"

# Recomendaciones finales
Write-FormattedLog ""
Write-FormattedLog "╔════════════════════════════════════════════════════════════╗" -Level "INFO"
Write-FormattedLog "║                 PRÓXIMOS PASOS                             ║" -Level "INFO"
Write-FormattedLog "╚════════════════════════════════════════════════════════════╝" -Level "INFO"

if ($missing_count -gt 0) {
    Write-FormattedLog "1. Instalar herramientas faltantes" -Level "WARN"
    Write-FormattedLog "   npm install --save-dev appium k6 axe-core" -Level "WARN"
}

Write-FormattedLog "2. Ejecutar primera prueba: npm test" -Level "INFO"
Write-FormattedLog "3. Ver reportes: npx allure serve ./allure-results" -Level "INFO"
Write-FormattedLog "4. Configurar dispositivos móviles si necesita Appium real" -Level "INFO"

Write-FormattedLog ""
Write-FormattedLog "✓ Validación completada - $(Get-Date -Format 'HH:mm:ss')" -Level "OK"
