# ============================================
# HAIDA - Pre-Push Verification Script
# ============================================

$Color = @{
    Reset  = "`e[0m"
    Red    = "`e[31m"
    Green  = "`e[32m"
    Yellow = "`e[33m"
    Blue   = "`e[34m"
    Cyan   = "`e[36m"
}

function Write-Header {
    param([string]$Message)
    Write-Host "`n$($Color.Blue)========================================$($Color.Reset)"
    Write-Host "$($Color.Blue)$Message$($Color.Reset)"
    Write-Host "$($Color.Blue)========================================$($Color.Reset)`n"
}

function Write-Success {
    param([string]$Message)
    Write-Host "$($Color.Green)✓ $Message$($Color.Reset)"
}

function Write-Error {
    param([string]$Message)
    Write-Host "$($Color.Red)✗ $Message$($Color.Reset)"
}

function Write-Warning {
    param([string]$Message)
    Write-Host "$($Color.Yellow)⚠ $Message$($Color.Reset)"
}

function Write-Info {
    param([string]$Message)
    Write-Host "$($Color.Cyan)ℹ $Message$($Color.Reset)"
}

Write-Header "HAIDA - Pre-Push Verification"

$haidaPath = "C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA"
Set-Location $haidaPath

$hasErrors = $false

# ============================================
# 1. Check Git Configuration
# ============================================
Write-Header "1. Git Configuration"

$gitUser = git config user.name 2>$null
$gitEmail = git config user.email 2>$null

if ($gitUser) {
    Write-Success "user.name: $gitUser"
} else {
    Write-Error "user.name not configured"
    $hasErrors = $true
}

if ($gitEmail) {
    Write-Success "user.email: $gitEmail"
} else {
    Write-Error "user.email not configured"
    $hasErrors = $true
}

# ============================================
# 2. Check SSH Configuration
# ============================================
Write-Header "2. SSH Configuration"

if (Test-Path ".git\config-ssh") {
    Write-Success "SSH config file exists"

    $sshCommand = git config core.sshCommand
    if ($sshCommand) {
        Write-Success "SSH command configured: $sshCommand"
    } else {
        Write-Error "SSH command not configured"
        $hasErrors = $true
    }
} else {
    Write-Error "SSH config file missing"
    $hasErrors = $true
}

if (Test-Path "Pro\HAIDA-Deploy") {
    Write-Success "Private SSH key exists"
} else {
    Write-Error "Private SSH key missing"
    $hasErrors = $true
}

if (Test-Path "Pro\HAIDA-Deploy.pub") {
    Write-Success "Public SSH key exists"
} else {
    Write-Error "Public SSH key missing"
    $hasErrors = $true
}

# ============================================
# 3. Check Sensitive Files Protection
# ============================================
Write-Header "3. Sensitive Files Protection"

$sensitiveFiles = @(
    ".env.production",
    "Pro/HAIDA-Deploy",
    "Pro/HAIDA-Deploy.pub"
)

$trackedSensitive = @()
foreach ($file in $sensitiveFiles) {
    $isTracked = git ls-files $file 2>$null
    if ($isTracked) {
        $trackedSensitive += $file
    }
}

if ($trackedSensitive.Count -eq 0) {
    Write-Success "No sensitive files are tracked by Git"
} else {
    Write-Error "Sensitive files are tracked by Git:"
    foreach ($file in $trackedSensitive) {
        Write-Host "  - $file" -ForegroundColor Red
    }
    $hasErrors = $true
}

# ============================================
# 4. Check .gitignore
# ============================================
Write-Header "4. .gitignore Configuration"

if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content ".gitignore" -Raw

    $requiredPatterns = @(
        ".env.production",
        "*.key",
        "*.pem"
    )

    $allPatternsFound = $true
    foreach ($pattern in $requiredPatterns) {
        if ($gitignoreContent -like "*$pattern*") {
            Write-Success "$pattern is in .gitignore"
        } else {
            Write-Warning "$pattern is NOT in .gitignore"
            $allPatternsFound = $false
        }
    }

    if ($allPatternsFound) {
        Write-Success ".gitignore properly configured"
    }
} else {
    Write-Error ".gitignore file missing"
    $hasErrors = $true
}

# ============================================
# 5. Check Remote Configuration
# ============================================
Write-Header "5. Remote Configuration"

$remoteUrl = git config --get remote.origin.url
if ($remoteUrl -eq "git@github.com:CarlosArturoArevaloM/HAIDA.git") {
    Write-Success "Remote URL correct: $remoteUrl"
} else {
    Write-Error "Remote URL incorrect: $remoteUrl"
    Write-Info "Expected: git@github.com:CarlosArturoArevaloM/HAIDA.git"
    $hasErrors = $true
}

# ============================================
# 6. Test SSH Connection
# ============================================
Write-Header "6. SSH Connection Test"

Write-Info "Testing connection to GitHub..."
$testResult = & ssh -F ".git\config-ssh" -T git@github.com 2>&1

if ($testResult -like "*successfully authenticated*") {
    Write-Success "SSH connection successful"
    Write-Info "GitHub authenticated as: CarlosArturoArevaloM"
} else {
    Write-Warning "SSH connection test:"
    Write-Host "  $testResult" -ForegroundColor Yellow
}

# ============================================
# 7. Check Repository Status
# ============================================
Write-Header "7. Repository Status"

$status = git status --short
if ($status) {
    Write-Info "Files to be committed:"
    Write-Host $status
} else {
    Write-Info "No changes to commit"
}

# Count files
$stagedCount = (git diff --cached --name-only | Measure-Object).Count
$modifiedCount = (git diff --name-only | Measure-Object).Count
$untrackedCount = (git ls-files --others --exclude-standard | Measure-Object).Count

Write-Info "Summary:"
Write-Host "  Staged: $stagedCount files" -ForegroundColor Cyan
Write-Host "  Modified: $modifiedCount files" -ForegroundColor Cyan
Write-Host "  Untracked: $untrackedCount files" -ForegroundColor Cyan

# ============================================
# 8. Final Verification
# ============================================
Write-Header "Final Verification"

if ($hasErrors) {
    Write-Error "Verification FAILED - Please fix errors before pushing"
    Write-Host ""
    Write-Host "Run this to fix:" -ForegroundColor Yellow
    Write-Host "  .\setup-github.ps1" -ForegroundColor Yellow
    exit 1
} else {
    Write-Success "All checks passed! Safe to push to GitHub"
    Write-Host ""
    Write-Host "=== Ready to Push ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Run these commands:" -ForegroundColor Cyan
    Write-Host "  git add ." -ForegroundColor White
    Write-Host "  git commit -m 'feat: Initial HAIDA setup with complete infrastructure'" -ForegroundColor White
    Write-Host "  git push -u origin main" -ForegroundColor White
    Write-Host ""
}
