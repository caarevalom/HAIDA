# ============================================
# HAIDA - SSH Agent Setup
# ============================================

Write-Host "`n=== HAIDA SSH Agent Setup ===`n" -ForegroundColor Cyan

$keyPath = "C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA\Pro\HAIDA-Deploy"

# Check if key exists
if (!(Test-Path $keyPath)) {
    Write-Host "ERROR: SSH key not found at: $keyPath" -ForegroundColor Red
    exit 1
}

Write-Host "1. Checking SSH Agent service..." -ForegroundColor Yellow

# Check if ssh-agent service exists
$service = Get-Service ssh-agent -ErrorAction SilentlyContinue

if (!$service) {
    Write-Host "   WARNING: ssh-agent service not found" -ForegroundColor Red
    Write-Host "   Install OpenSSH Client from Windows Settings" -ForegroundColor Yellow
    Write-Host "   Or use Git Bash instead" -ForegroundColor Yellow
    exit 1
}

# Start ssh-agent if not running
if ($service.Status -ne 'Running') {
    Write-Host "   Starting ssh-agent service..." -ForegroundColor Cyan
    try {
        Start-Service ssh-agent
        Write-Host "   OK ssh-agent started" -ForegroundColor Green
    } catch {
        Write-Host "   ERROR: Could not start ssh-agent" -ForegroundColor Red
        Write-Host "   Run PowerShell as Administrator and try again" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "   OK ssh-agent is running" -ForegroundColor Green
}

# Add SSH key
Write-Host "`n2. Adding SSH key to agent..." -ForegroundColor Yellow
Write-Host "   Key: $keyPath" -ForegroundColor Cyan
Write-Host "`n   You will be asked for the passphrase now:" -ForegroundColor Yellow
Write-Host ""

ssh-add $keyPath

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n   OK Key added successfully" -ForegroundColor Green
} else {
    Write-Host "`n   ERROR: Could not add key" -ForegroundColor Red
    exit 1
}

# Verify key is loaded
Write-Host "`n3. Verifying loaded keys..." -ForegroundColor Yellow

$keys = ssh-add -l
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK Loaded keys:" -ForegroundColor Green
    Write-Host "   $keys" -ForegroundColor Cyan
} else {
    Write-Host "   ERROR: No keys loaded" -ForegroundColor Red
    exit 1
}

# Test GitHub connection
Write-Host "`n4. Testing GitHub connection..." -ForegroundColor Yellow

$testResult = ssh -F .git/config-ssh -T git@github.com 2>&1

if ($testResult -like "*successfully authenticated*") {
    Write-Host "   OK Connected to GitHub" -ForegroundColor Green
    Write-Host "   $testResult" -ForegroundColor Cyan
} else {
    Write-Host "   WARNING: Connection test result:" -ForegroundColor Yellow
    Write-Host "   $testResult" -ForegroundColor Yellow
}

# Final instructions
Write-Host "`n=== Setup Complete! ===`n" -ForegroundColor Green

Write-Host "Your SSH key is now loaded in memory." -ForegroundColor Cyan
Write-Host "You can now push to GitHub without entering the passphrase.`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. git add ." -ForegroundColor White
Write-Host "  2. git commit -m 'feat: Initial HAIDA setup'" -ForegroundColor White
Write-Host "  3. git push -u origin main" -ForegroundColor White
Write-Host ""

Write-Host "NOTE: The key will remain loaded until you restart your computer." -ForegroundColor Yellow
Write-Host "To persist this, see: SSH-PASSPHRASE-GUIDE.md" -ForegroundColor Yellow
Write-Host ""
