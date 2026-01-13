# Generar matriz trazabilidad: Requisitos → Test Cases (identificar gaps)
param(
    [Parameter(Mandatory=$true)]
    [string]$RequirementsCsvPath,
    
    [Parameter(Mandatory=$true)]
    [string]$TestCasesCsvPath,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputPath = "./coverage-matrix.csv"
)

$matrix = @()
$gaps = @()
$orphans = @()

try {
    # Importar datos
    $reqs = Import-Csv -Path $RequirementsCsvPath
    $tests = Import-Csv -Path $TestCasesCsvPath
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host "🔍 GENERANDO MATRIZ TRAZABILIDAD"
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Para cada requisito, encontrar tests asociados
    foreach ($req in $reqs) {
        $reqId = $req.ID
        $linkedTests = $tests | Where-Object { $_.Requirement -eq $reqId }
        
        if ($linkedTests.Count -eq 0) {
            $gaps += [PSCustomObject]@{
                Requirement = $reqId
                Module = $req.Module
                Name = $req.Name
                TestCases = 0
                Coverage = "❌ 0%"
            }
            Write-Host "❌ GAP: $reqId - Sin tests asociados"
        } else {
            $testIds = ($linkedTests | ForEach-Object { $_.ID }) -join '; '
            $matrix += [PSCustomObject]@{
                Requirement = $reqId
                Module = $req.Module
                Name = $req.Name
                TestCount = $linkedTests.Count
                TestCases = $testIds
                Coverage = "✅ OK"
            }
            Write-Host "✅ $reqId → $($linkedTests.Count) test(s)"
        }
    }
    
    # Identificar tests orfanos (sin requisito asociado)
    foreach ($test in $tests) {
        $parentReq = $reqs | Where-Object { $_.ID -eq $test.Requirement }
        if ($null -eq $parentReq) {
            $orphans += [PSCustomObject]@{
                TestCase = $test.ID
                Module = $test.Module
                Status = "⚠️  Huérfano"
            }
            Write-Host "⚠️  HUÉRFANO: $($test.ID) - Requisito $($test.Requirement) no existe"
        }
    }
    
    # Exportar matriz
    $matrix | Export-Csv -Path $OutputPath -Delimiter ',' -NoTypeInformation
    
    # Resumen
    $coveragePercent = if ($reqs.Count -gt 0) { 
        [math]::Round(($matrix.Count / $reqs.Count) * 100, 2) 
    } else { 0 }
    
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host "📊 RESUMEN COBERTURA"
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host "Requisitos totales: $($reqs.Count)"
    Write-Host "Requisitos cubiertos: $($matrix.Count) ✅"
    Write-Host "Gaps encontrados: $($gaps.Count) ❌"
    Write-Host "Tests huérfanos: $($orphans.Count) ⚠️"
    Write-Host "Cobertura: $coveragePercent%"
    Write-Host "`nMatriz exportada: $OutputPath"
    
    if ($gaps.Count -gt 0) {
        Write-Host "`n❌ GAPS DETECTADOS:"
        $gaps | ForEach-Object { 
            Write-Host "  - $($_.Requirement) ($($_.Module)): $($_.Name)"
        }
    }
    
    if ($orphans.Count -gt 0) {
        Write-Host "`n⚠️  TESTS HUÉRFANOS:"
        $orphans | ForEach-Object { 
            Write-Host "  - $($_.TestCase) en módulo $($_.Module)"
        }
    }
    
} catch {
    Write-Host "❌ ERROR: $_"
    exit 1
}
