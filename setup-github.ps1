# ============================================
# HAIDA - GitHub Configuration Script
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

function Write-Info {
    param([string]$Message)
    Write-Host "$($Color.Cyan)ℹ $Message$($Color.Reset)"
}

Write-Header "HAIDA - GitHub Configuration"

$haidaPath = "C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA"
$sshKeyPath = "$haidaPath\Pro\HAIDA-Deploy"
$sshPubKeyPath = "$haidaPath\Pro\HAIDA-Deploy.pub"

# Verify SSH keys exist
Write-Info "Checking SSH keys..."
if (!(Test-Path $sshKeyPath)) {
    Write-Error "Private key not found: $sshKeyPath"
    exit 1
}
if (!(Test-Path $sshPubKeyPath)) {
    Write-Error "Public key not found: $sshPubKeyPath"
    exit 1
}
Write-Success "SSH keys found"

# Configure Git user (if not already configured)
Set-Location $haidaPath

$gitUser = git config user.name 2>$null
$gitEmail = git config user.email 2>$null

if (!$gitUser) {
    git config --global user.name "caarevalo"
    Write-Success "Git user.name configured: caarevalo"
} else {
    Write-Info "Git user.name already configured: $gitUser"
}

if (!$gitEmail) {
    git config --global user.email "caarevalo@hiberus.com"
    Write-Success "Git user.email configured: caarevalo@hiberus.com"
} else {
    Write-Info "Git user.email already configured: $gitEmail"
}

# Configure SSH for this repository
Write-Info "Configuring SSH for GitHub..."

$sshConfig = @"
Host github.com
    HostName github.com
    User git
    IdentityFile $sshKeyPath
    IdentitiesOnly yes
    StrictHostKeyChecking no
"@

Set-Content "$haidaPath\.git\config-ssh" $sshConfig -Encoding UTF8
git config --local core.sshCommand "ssh -F .git/config-ssh"
Write-Success "SSH configured for repository"

# Verify remote
$remoteUrl = git config --get remote.origin.url
Write-Info "Remote URL: $remoteUrl"

if ($remoteUrl -ne "git@github.com:CarlosArturoArevaloM/HAIDA.git") {
    git remote set-url origin git@github.com:CarlosArturoArevaloM/HAIDA.git
    Write-Success "Remote URL updated"
}

# Test SSH connection
Write-Info "Testing SSH connection to GitHub..."
$testResult = & ssh -F "$haidaPath\.git\config-ssh" -T git@github.com 2>&1

if ($testResult -like "*successfully authenticated*") {
    Write-Success "SSH connection successful"
} else {
    Write-Error "SSH connection failed"
    Write-Info "Result: $testResult"
}

# Show current status
Write-Header "Repository Status"
git status --short

# Show remotes
Write-Header "Remote Configuration"
git remote -v

Write-Host ""
Write-Success "GitHub configuration completed!"
Write-Host ""
Write-Host "=== SSH Key Fingerprint (GitHub) ===" -ForegroundColor Cyan
Write-Host "SHA256:9um1TTWmdzu/woGrJmJQ+m9mTSwkPkmBmuHDX4IrPb8"
Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Commit your changes:"
Write-Host "   git add ."
Write-Host "   git commit -m 'feat: Initial HAIDA setup'"
Write-Host ""
Write-Host "2. Push to GitHub:"
Write-Host "   git push -u origin main"
Write-Host ""
Write-Host "3. Verify on GitHub:"
Write-Host "   https://github.com/CarlosArturoArevaloM/HAIDA"
Write-Host ""
