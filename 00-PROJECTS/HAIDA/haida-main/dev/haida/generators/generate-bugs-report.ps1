# Deduplicar bugs, agrupar por root cause, formatear para Excel

param(
    [Parameter(Mandatory=$true)]
    [string]$AnalyzedBugsPath,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputPath = "./bugs-for-excel.json"
)

$bugReport = @{
    ReportDate = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    TotalBugsDetected = 0
    UniqueBugs = 0
    ByCriticity = @{}
    Bugs = @()
}

try {
    # Cargar bugs analizados
    $analyzedBugs = Get-Content -Path $AnalyzedBugsPath -Raw | ConvertFrom-Json
    
    Write-Host "Procesando $($analyzedBugs.Bugs.Count) bugs detectados..."
    Write-Host ""
    
    $bugReport.TotalBugsDetected = $analyzedBugs.Bugs.Count
    
    # Agrupar por root cause (deduplicación)
    $deduped = @{}
    
    foreach ($bug in $analyzedBugs.Bugs) {
        $rootCause = $bug.ErrorType  # Usar error type como key
        
        if (-not $deduped[$rootCause]) {
            $deduped[$rootCause] = @{
                BugId = $bug.BugId
                ErrorType = $bug.ErrorType
                ErrorDescription = $bug.ErrorDescription
                SolutionProposed = $bug.SolutionProposed
                Severity = $bug.Severity
                Estimation = $bug.Estimation
                AssignedTo = $bug.AssignedTo
                Module = $bug.Module
                AffectedTests = @()
            }
        }
        
        # Agregar test case a la lista
        $deduped[$rootCause].AffectedTests += $bug.TestCaseId
    }
    
    Write-Host "Bugs únicos por root cause: $($deduped.Count)"
    Write-Host ""
    
    # Crear estructura para Excel
    foreach ($rootCause in $deduped.Keys) {
        $groupedBug = $deduped[$rootCause]
        $affectedCount = $groupedBug.AffectedTests.Count
        
        # Mapear severidad a prioridad Excel
        $severity = $groupedBug.Severity
        $priority = switch ($severity) {
            'CRÍTICA' { 'P0 - Crítico' }
            'ALTA' { 'P1 - Alto' }
            'MEDIA' { 'P2 - Medio' }
            'BAJA' { 'P3 - Bajo' }
            default { 'P2 - Medio' }
        }
        
        # Crear registro para Excel
        $excelBug = [PSCustomObject]@{
            BugId = $groupedBug.BugId
            Module = $groupedBug.Module
            ErrorType = $groupedBug.ErrorType
            ErrorDescription = $groupedBug.ErrorDescription
            SolutionProposed = $groupedBug.SolutionProposed
            Severity = $severity
            Priority = $priority
            Estimation = $groupedBug.Estimation
            AssignedTo = $groupedBug.AssignedTo
            AffectedTestCount = $affectedCount
            AffectedTests = ($groupedBug.AffectedTests -join ', ')
            Status = 'OPEN'
            CreatedDate = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            DueDate = ''
            Resolution = ''
            ClosedDate = ''
            Notes = "Afecta a $affectedCount caso(s) de prueba. Ver análisis detallado para detalles."
        }
        
        $bugReport.Bugs += $excelBug
        
        # Actualizar contadores por criticidad
        if (-not $bugReport.ByCriticity[$severity]) {
            $bugReport.ByCriticity[$severity] = 0
        }
        $bugReport.ByCriticity[$severity] += 1
    }
    
    $bugReport.UniqueBugs = $bugReport.Bugs.Count
    
    # Guardar en JSON (para import a Excel)
    $bugReport | ConvertTo-Json -Depth 10 | Set-Content -Path $OutputPath
    
    # También guardar como CSV para Excel directo
    $csvPath = $OutputPath -replace '\.json$', '.csv'
    $bugReport.Bugs | Select-Object BugId, Module, ErrorType, ErrorDescription, SolutionProposed, `
        Severity, Priority, Estimation, AssignedTo, AffectedTestCount, AffectedTests, Status, CreatedDate | `
        Export-Csv -Path $csvPath -NoTypeInformation -Delimiter ','
    
    Write-Host "═══════════════════════════════════════════════════════════════"
    Write-Host "✅ DEDUPLICACIÓN Y GENERACIÓN DE REPORTE COMPLETADA"
    Write-Host "═══════════════════════════════════════════════════════════════"
    Write-Host "Bugs totales detectados: $($bugReport.TotalBugsDetected)"
    Write-Host "Bugs únicos (deduplicados): $($bugReport.UniqueBugs)"
    Write-Host ""
    Write-Host "Por Severidad:"
    foreach ($sev in $bugReport.ByCriticity.Keys) {
        Write-Host "  $sev : $($bugReport.ByCriticity[$sev])"
    }
    Write-Host ""
    Write-Host "Salidas generadas:"
    Write-Host "  JSON: $OutputPath"
    Write-Host "  CSV:  $csvPath"
    Write-Host ""
    Write-Host "Estructura de cada bug en Excel:"
    Write-Host "  ├─ BugId | Module | ErrorType | ErrorDescription"
    Write-Host "  ├─ SolutionProposed | Severity | Priority | Estimation"
    Write-Host "  ├─ AssignedTo | AffectedTestCount | AffectedTests"
    Write-Host "  └─ Status | CreatedDate | DueDate | Resolution | Notes"
    
} catch {
    Write-Host "ERROR: $_"
    exit 1
}
