# HAIDA - Quick Verification Script

Write-Host "`n=== HAIDA Pre-Push Verification ===`n" -ForegroundColor Cyan

$haidaPath = "C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA"
Set-Location $haidaPath

$hasErrors = $false

# 1. Git Configuration
Write-Host "1. Git Configuration" -ForegroundColor Yellow
$gitUser = git config user.name 2>$null
$gitEmail = git config user.email 2>$null

if ($gitUser) {
    Write-Host "  OK user.name: $gitUser" -ForegroundColor Green
} else {
    Write-Host "  ERROR user.name not configured" -ForegroundColor Red
    $hasErrors = $true
}

if ($gitEmail) {
    Write-Host "  OK user.email: $gitEmail" -ForegroundColor Green
} else {
    Write-Host "  ERROR user.email not configured" -ForegroundColor Red
    $hasErrors = $true
}

# 2. SSH Configuration
Write-Host "`n2. SSH Configuration" -ForegroundColor Yellow

if (Test-Path ".git\config-ssh") {
    Write-Host "  OK SSH config exists" -ForegroundColor Green
} else {
    Write-Host "  ERROR SSH config missing" -ForegroundColor Red
    $hasErrors = $true
}

if (Test-Path "Pro\HAIDA-Deploy") {
    Write-Host "  OK Private key exists" -ForegroundColor Green
} else {
    Write-Host "  ERROR Private key missing" -ForegroundColor Red
    $hasErrors = $true
}

# 3. Sensitive Files
Write-Host "`n3. Sensitive Files Protection" -ForegroundColor Yellow

$trackedEnv = git ls-files ".env.production" 2>$null
if (!$trackedEnv) {
    Write-Host "  OK .env.production NOT tracked" -ForegroundColor Green
} else {
    Write-Host "  ERROR .env.production is tracked!" -ForegroundColor Red
    $hasErrors = $true
}

$trackedKey = git ls-files "Pro/HAIDA-Deploy" 2>$null
if (!$trackedKey) {
    Write-Host "  OK SSH keys NOT tracked" -ForegroundColor Green
} else {
    Write-Host "  ERROR SSH keys are tracked!" -ForegroundColor Red
    $hasErrors = $true
}

# 4. Remote Configuration
Write-Host "`n4. Remote Configuration" -ForegroundColor Yellow

$remoteUrl = git config --get remote.origin.url
if ($remoteUrl -eq "git@github.com:CarlosArturoArevaloM/HAIDA.git") {
    Write-Host "  OK Remote: $remoteUrl" -ForegroundColor Green
} else {
    Write-Host "  ERROR Remote incorrect: $remoteUrl" -ForegroundColor Red
    $hasErrors = $true
}

# 5. Repository Status
Write-Host "`n5. Repository Status" -ForegroundColor Yellow

$stagedCount = (git diff --cached --name-only 2>$null | Measure-Object).Count
$modifiedCount = (git diff --name-only 2>$null | Measure-Object).Count
$untrackedCount = (git ls-files --others --exclude-standard 2>$null | Measure-Object).Count

Write-Host "  Staged: $stagedCount files" -ForegroundColor Cyan
Write-Host "  Modified: $modifiedCount files" -ForegroundColor Cyan
Write-Host "  Untracked: $untrackedCount files" -ForegroundColor Cyan

# Final Result
Write-Host "`n=== Result ===" -ForegroundColor Cyan

if ($hasErrors) {
    Write-Host "`nERROR: Verification FAILED" -ForegroundColor Red
    Write-Host "Run: .\setup-github.ps1" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "`nSUCCESS: All checks passed!" -ForegroundColor Green
    Write-Host "`nReady to push:" -ForegroundColor Cyan
    Write-Host "  git add ." -ForegroundColor White
    Write-Host "  git commit -m 'feat: Initial HAIDA setup'" -ForegroundColor White
    Write-Host "  git push -u origin main" -ForegroundColor White
    Write-Host ""
}
