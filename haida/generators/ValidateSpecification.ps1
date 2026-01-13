# Validar especificación funcional (BRD/PRD en markdown)
param(
    [Parameter(Mandatory=$true)]
    [string]$SpecPath
)

$requirements = @()
$errors = @()

try {
    $spec = Get-Content -Path $SpecPath -Raw
    
    # Extraer requisitos (patrón REQ-###-###)
    $reqPattern = 'REQ-([A-Z]+)-(\d{3})'
    $matches = [regex]::Matches($spec, $reqPattern)
    
    if ($matches.Count -eq 0) {
        Write-Host "⚠️  WARNING: No se encontraron requisitos (REQ-### format)"
    }
    
    foreach ($match in $matches) {
        $req = $match.Value
        if ($req -notin $requirements) {
            $requirements += $req
        }
    }
    
    # Validar estructura (debe tener secciones mínimas)
    $hasRequirements = $spec -match '## Requisitos|## Requirements'
    $hasAcceptance = $spec -match 'Acceptance Criteria|Criterios de Aceptación|## AC'
    
    if (-not $hasRequirements) {
        $errors += "⚠️  No se encontró sección de Requisitos"
    }
    
    if (-not $hasAcceptance) {
        $errors += "⚠️  No se encontró sección de Criterios de Aceptación"
    }
    
    # Resumen
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host "✅ VALIDACIÓN ESPECIFICACIÓN"
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host "Requisitos encontrados: $($requirements.Count)"
    Write-Host "`nDetalle requisitos:"
    $requirements | Sort-Object | ForEach-Object { Write-Host "  ✓ $_" }
    
    if ($errors.Count -gt 0) {
        Write-Host "`n⚠️  Warnings:"
        $errors | ForEach-Object { Write-Host "  $_" }
    }
    
    Write-Host "`n✅ Especificación validada"
    return $requirements
    
} catch {
    Write-Host "❌ ERROR: $_"
    exit 1
}
