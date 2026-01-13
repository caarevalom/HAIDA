# Mapear CSV input + resultados ejecución = CSV output con información completa

param(
    [Parameter(Mandatory=$true)]
    [string]$InputCsvPath,
    
    [Parameter(Mandatory=$true)]
    [string]$TestResultsJsonPath,
    
    [Parameter(Mandatory=$false)]
    [string]$BugsJsonPath = "./bugs-detected.json",
    
    [Parameter(Mandatory=$false)]
    [string]$OutputPath = "./test-cases-with-results.csv"
)

$mappedCases = @()

try {
    # Importar datos
    $inputCases = Import-Csv -Path $InputCsvPath
    $results = Get-Content -Path $TestResultsJsonPath -Raw | ConvertFrom-Json
    
    $bugs = if (Test-Path $BugsJsonPath) {
        (Get-Content -Path $BugsJsonPath -Raw | ConvertFrom-Json).Bugs
    } else {
        @()
    }
    
    Write-Host "Mapeando $($inputCases.Count) test cases..."
    Write-Host ""
    
    # Procesar cada test case de entrada
    foreach ($inputCase in $inputCases) {
        $testId = $inputCase.ID
        
        # Buscar resultados de ejecución
        $testResult = $results.Tests | Where-Object { $_.TestId -eq $testId }
        $relatedBug = $bugs | Where-Object { $_.TestCaseId -eq $testId }
        
        # Crear fila de salida
        $outputCase = [PSCustomObject]@{
            # Columnas originales (mapeo 1:1)
            ID = $inputCase.ID
            TestName = $inputCase.TestName
            Module = $inputCase.Module
            Type = $inputCase.Type
            Requirement = $inputCase.Requirement
            Steps = $inputCase.Steps
            ExpectedResult = $inputCase.ExpectedResult
            Priority = $inputCase.Priority
            Platform = $inputCase.Platform
            
            # Columnas nuevas de ejecución
            ExecutionStatus = if ($testResult) { $testResult.Status } else { 'NOT_EXECUTED' }
            Duration = if ($testResult) { $testResult.Duration } else { '' }
            
            # Columnas nuevas de incidencia (si FAIL)
            BugID = if ($relatedBug) { $relatedBug.BugId } else { '' }
            ErrorType = if ($relatedBug) { $relatedBug.ErrorType } else { '' }
            ErrorDescription = if ($relatedBug) { $relatedBug.ErrorDescription } else { '' }
            SolutionProposed = if ($relatedBug) { $relatedBug.SolutionProposed } else { '' }
            SeverityBug = if ($relatedBug) { $relatedBug.Severity } else { '' }
            Estimation = if ($relatedBug) { $relatedBug.Estimation } else { '' }
            AssignedTo = if ($relatedBug) { $relatedBug.AssignedTo } else { '' }
            Comments = if ($relatedBug) { "Ver Bug $($relatedBug.BugId) para detalles" } else { '' }
            
            # Evidencias
            EvidenceScreenshot = if ($testResult) { "$($testResult.TestId)/screenshots" } else { '' }
            EvidenceNetwork = if ($testResult) { "$($testResult.TestId)/network" } else { '' }
            BackendLog = if ($testResult) { "$($testResult.TestId)/logs" } else { '' }
            VideoLink = if ($testResult) { "$($testResult.TestId)/video" } else { '' }
            
            # Timestamps
            ExecutionDate = if ($testResult) { Get-Date -Format 'yyyy-MM-dd HH:mm:ss' } else { '' }
        }
        
        $mappedCases += $outputCase
        
        # Mostrar progreso
        $status = $outputCase.ExecutionStatus
        $bug = if ($relatedBug) { " [BUG: $($relatedBug.BugId)]" } else { "" }
        Write-Host "✓ $testId - $status$bug"
    }
    
    # Exportar a CSV
    $mappedCases | Export-Csv -Path $OutputPath -NoTypeInformation -Delimiter ','
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════"
    Write-Host "✅ MAPEO COMPLETADO"
    Write-Host "═══════════════════════════════════════════════════════════════"
    Write-Host "Test cases procesados: $($mappedCases.Count)"
    Write-Host "PASS: $($mappedCases.Where({ $_.ExecutionStatus -eq 'PASS' }).Count)"
    Write-Host "FAIL: $($mappedCases.Where({ $_.ExecutionStatus -eq 'FAIL' }).Count)"
    Write-Host "BLOCKED: $($mappedCases.Where({ $_.ExecutionStatus -eq 'BLOCKED' }).Count)"
    Write-Host "NOT_EXECUTED: $($mappedCases.Where({ $_.ExecutionStatus -eq 'NOT_EXECUTED' }).Count)"
    Write-Host "CSV Salida: $OutputPath"
    Write-Host ""
    Write-Host "Estructura de salida:"
    Write-Host "  ├─ Columnas originales (input 1:1 mapeadas)"
    Write-Host "  ├─ ExecutionStatus | Duration"
    Write-Host "  ├─ BugID | ErrorType | ErrorDescription | SolutionProposed"
    Write-Host "  ├─ SeverityBug | Estimation | AssignedTo | Comments"
    Write-Host "  ├─ EvidenceScreenshot | EvidenceNetwork | BackendLog | VideoLink"
    Write-Host "  └─ ExecutionDate"
    
} catch {
    Write-Host "ERROR: $_"
    exit 1
}
