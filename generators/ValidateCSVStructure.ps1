# Validar estructura CSV de test cases (13 columnas ISTQB-Hiberus)
param(
    [Parameter(Mandatory=$true)]
    [string]$CsvPath
)

$errors = @()
$warnings = @()
$validTests = 0

try {
    # Importar CSV
    $tests = Import-Csv -Path $CsvPath -Delimiter ','
    
    if ($null -eq $tests) {
        Write-Host "❌ ERROR: CSV vacío o formato inválido"
        exit 1
    }
    
    # Columnas requeridas (ISTQB-Hiberus v1.0)
    $requiredColumns = @(
        'ID',
        'TestName',
        'Module',
        'Type',
        'Requirement',
        'Steps',
        'ExpectedResult',
        'Priority',
        'Platform',
        'Status',
        'Evidence',
        'BugID',
        'ExecutedBy',
        'ExecutionDate'
    )
    
    # Validar columnas
    $csvColumns = $tests[0].PSObject.Properties.Name
    foreach ($col in $requiredColumns) {
        if ($csvColumns -notcontains $col) {
            $errors += "❌ Columna faltante: $col"
        }
    }
    
    if ($errors.Count -gt 0) {
        Write-Host "Errores encontrados:"
        $errors | ForEach-Object { Write-Host $_ }
        exit 1
    }
    
    # Validar cada test case
    $testCount = 0
    foreach ($test in $tests) {
        $testCount++
        $rowErrors = @()
        
        # Validar ID (formato TC_MODULE_###)
        if ($test.ID -notmatch '^TC_[A-Z]+_\d{3}$') {
            $rowErrors += "ID inválido: $($test.ID) (debe ser TC_AUTH_001)"
        }
        
        # Validar Type (ISTQB 12 tipos)
        $validTypes = @('Funcional','UI','Seguridad','Performance','API','DB','Integracion','Usabilidad','Accesibilidad','Compatibilidad','Smoke','Regresion')
        if ($validTypes -notcontains $test.Type) {
            $rowErrors += "Type inválido: $($test.Type)"
        }
        
        # Validar Requirement (formato REQ-###-###)
        if ($test.Requirement -notmatch '^REQ-[A-Z]+-\d{3}$' -and $test.Requirement -ne '') {
            $warnings += "Requirement dudoso en TC $($test.ID): $($test.Requirement)"
        }
        
        # Validar Priority
        if ($test.Priority -notmatch '^(CRÍTICA|ALTA|MEDIA|BAJA)$') {
            $rowErrors += "Priority inválido: $($test.Priority)"
        }
        
        # Validar Platform
        if ($test.Platform -notmatch '^(Desktop|Mobile|Ambas)$') {
            $rowErrors += "Platform inválido: $($test.Platform)"
        }
        
        # Validar Status
        if ($test.Status -notmatch '^(PASS|FAIL|BLOQUEADO|PENDIENTE)$') {
            $rowErrors += "Status inválido: $($test.Status)"
        }
        
        # Registrar errores por test
        if ($rowErrors.Count -gt 0) {
            Write-Host "❌ Test $($test.ID) - Fila $testCount:"
            $rowErrors | ForEach-Object { Write-Host "   $_" }
        } else {
            $validTests++
        }
    }
    
    # Resumen
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host "✅ VALIDACIÓN CSV COMPLETADA"
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host "Total tests: $testCount"
    Write-Host "Tests válidos: $validTests ✅"
    Write-Host "Errores: $($errors.Count) ❌"
    Write-Host "Warnings: $($warnings.Count) ⚠️"
    
    if ($errors.Count -gt 0) {
        Write-Host "`n❌ FALLÓ - Corregir errores antes de continuar"
        exit 1
    }
    
    Write-Host "`n✅ CSV VÁLIDO - Listo para ejecutar"
    
} catch {
    Write-Host "❌ ERROR: $_"
    exit 1
}
