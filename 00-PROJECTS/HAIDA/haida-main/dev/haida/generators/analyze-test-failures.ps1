# Analizar fallos de test cases y proponer soluciones

param(
    [Parameter(Mandatory=$true)]
    [string]$TestResultsJsonPath,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputPath = "./bugs-detected.json"
)

# Mapeo de errores a soluciones
$errorPatterns = @{
    'timeout' = @{
        type = 'TIMEOUT'
        severity = 'ALTA'
        solution = 'Aumentar timeout o optimizar endpoint'
        estimation = '2h'
    }
    'element not found' = @{
        type = 'ELEMENT_NOT_FOUND'
        severity = 'MEDIA'
        solution = 'Revisar selectores CSS/XPath o cambios de UI'
        estimation = '1h'
    }
    'assertion' = @{
        type = 'ASSERTION_FAILED'
        severity = 'ALTA'
        solution = 'Actualizar test o revisar lógica de negocio'
        estimation = '2h'
    }
    'network' = @{
        type = 'NETWORK_ERROR'
        severity = 'CRÍTICA'
        solution = 'Revisar disponibilidad de endpoint o conectividad'
        estimation = '1h'
    }
    'database' = @{
        type = 'DATABASE_ERROR'
        severity = 'CRÍTICA'
        solution = 'Revisar conexión a BD o estado del servidor'
        estimation = '2h'
    }
    'authentication' = @{
        type = 'AUTH_ERROR'
        severity = 'CRÍTICA'
        solution = 'Revisar credenciales o token expirado'
        estimation = '1h'
    }
    'validation' = @{
        type = 'DATA_VALIDATION'
        severity = 'MEDIA'
        solution = 'Corregir datos de entrada o validación'
        estimation = '1h'
    }
}

# Mapeo de módulos a responsables
$moduleOwners = @{
    'AUTH' = 'backend-auth@hiberus.com'
    'NAV' = 'frontend-nav@hiberus.com'
    'HOME' = 'frontend-home@hiberus.com'
    'SEARCH' = 'backend-search@hiberus.com'
    'FAV' = 'backend-favorites@hiberus.com'
    'PROFILE' = 'backend-profile@hiberus.com'
    'CART' = 'backend-cart@hiberus.com'
    'CHECK' = 'backend-checkout@hiberus.com'
    'CAL' = 'backend-calendar@hiberus.com'
}

$bugs = @()
$bugCounter = 0

try {
    # Importar resultados
    $results = Get-Content -Path $TestResultsJsonPath -Raw | ConvertFrom-Json
    
    Write-Host "Analizando $($results.Tests.Count) test cases..."
    Write-Host ""
    
    # Procesar cada test fallido
    foreach ($test in $results.Tests) {
        if ($test.Status -ne 'PASS') {
            $bugCounter++
            
            # Generar ID único
            $bugId = "CTB-{0:D3}-{1}" -f $bugCounter, (Get-Date -Format 'yyyyMMddHHmm')
            
            # Detectar tipo de error
            $errorType = 'UNKNOWN'
            $solution = 'Investigación manual requerida'
            $severity = 'MEDIA'
            $estimation = '4h'
            
            if ($test.Status -eq 'FAIL') {
                $severity = 'ALTA'
                
                # Buscar patrón en errores
                foreach ($pattern in $errorPatterns.Keys) {
                    if ($test.Error -match $pattern) {
                        $errorType = $errorPatterns[$pattern].type
                        $solution = $errorPatterns[$pattern].solution
                        $severity = $errorPatterns[$pattern].severity
                        $estimation = $errorPatterns[$pattern].estimation
                        break
                    }
                }
            } elseif ($test.Status -eq 'BLOCKED') {
                $severity = 'MEDIA'
                $errorType = 'BLOCKED'
                $solution = 'Investigar causa del bloqueo'
                $estimation = '2h'
            }
            
            # Obtener responsable por módulo
            $assignedTo = if ($moduleOwners.ContainsKey($test.Module)) {
                $moduleOwners[$test.Module]
            } else {
                'qa-team@hiberus.com'
            }
            
            # Crear estructura de bug
            $bug = @{
                BugId = $bugId
                Module = $test.Module
                TestCaseId = $test.TestId
                Status = $test.Status
                ErrorType = $errorType
                ErrorDescription = $test.Error
                Severity = $severity
                SolutionProposed = $solution
                Estimation = $estimation
                AssignedTo = $assignedTo
                EvidenceScreenshot = "$($test.TestId)/error.png"
                EvidenceNetwork = "$($test.TestId)/network.json"
                BackendLog = "$($test.TestId)/backend.log"
                CreatedDate = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                Status = 'OPEN'
            }
            
            $bugs += $bug
            
            Write-Host "Bug detectado: $bugId"
            Write-Host "  Test: $($test.TestId) - $($test.Status)"
            Write-Host "  Módulo: $($test.Module)"
            Write-Host "  Tipo: $errorType"
            Write-Host "  Severidad: $severity"
            Write-Host "  Solución: $solution"
            Write-Host ""
        }
    }
    
    # Guardar bugs a JSON
    $bugsOutput = @{
        TotalBugsDetected = $bugs.Count
        CreatedDate = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        Bugs = $bugs
    }
    
    $bugsOutput | ConvertTo-Json -Depth 10 | Out-File -FilePath $OutputPath
    
    Write-Host "═══════════════════════════════════════════════════════════════"
    Write-Host "✅ ANÁLISIS COMPLETADO"
    Write-Host "═══════════════════════════════════════════════════════════════"
    Write-Host "Total bugs detectados: $($bugs.Count)"
    Write-Host "Críticos: $($bugs.Where({ $_.Severity -eq 'CRÍTICA' }).Count)"
    Write-Host "Altos: $($bugs.Where({ $_.Severity -eq 'ALTA' }).Count)"
    Write-Host "Medios: $($bugs.Where({ $_.Severity -eq 'MEDIA' }).Count)"
    Write-Host "Salida: $OutputPath"
    
} catch {
    Write-Host "ERROR: $_"
    exit 1
}
