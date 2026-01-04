# ============================================
# HAIDA - Complete Tools Installation Script
# Installs all required tools without admin rights
# ============================================

param(
    [string]$SupabasePassword = ""
)

# Colors
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

# ============================================
# PHASE 1: Check Prerequisites
# ============================================
Write-Header "PHASE 1: Checking Prerequisites"

# Check Git
try {
    $gitVersion = git --version
    Write-Success "Git installed: $gitVersion"
} catch {
    Write-Error "Git not found. Please install Git first."
    exit 1
}

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Success "Docker installed: $dockerVersion"
} catch {
    Write-Warning "Docker not found (optional for local testing)"
}

# ============================================
# PHASE 2: Setup Directories
# ============================================
Write-Header "PHASE 2: Creating Directory Structure"

$BaseDir = "$env:USERPROFILE\Apps"
$NodeDir = "$BaseDir\nodejs"
$JavaDir = "$BaseDir\java"
$ToolsDir = "$BaseDir\tools"
$DownloadsDir = "$env:USERPROFILE\Downloads"

# Create directories
New-Item -ItemType Directory -Force -Path $BaseDir | Out-Null
New-Item -ItemType Directory -Force -Path $NodeDir | Out-Null
New-Item -ItemType Directory -Force -Path $JavaDir | Out-Null
New-Item -ItemType Directory -Force -Path $ToolsDir | Out-Null

Write-Success "Directories created in: $BaseDir"

# ============================================
# PHASE 3: Download Tools
# ============================================
Write-Header "PHASE 3: Downloading Tools"

$downloads = @{
    NodeJS = @{
        Url = "https://nodejs.org/dist/v20.10.0/node-v20.10.0-win-x64.zip"
        File = "$DownloadsDir\node-v20.10.0-win-x64.zip"
        Dest = $NodeDir
    }
    Java = @{
        Url = "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.9%2B9/OpenJDK17U-jdk_x64_windows_hotspot_17.0.9_9.zip"
        File = "$DownloadsDir\jdk-17.0.9_9.zip"
        Dest = $JavaDir
    }
}

Write-Info "Downloading Node.js..."
try {
    if (!(Test-Path $downloads.NodeJS.File)) {
        Invoke-WebRequest -Uri $downloads.NodeJS.Url -OutFile $downloads.NodeJS.File -UseBasicParsing
        Write-Success "Node.js downloaded"
    } else {
        Write-Warning "Node.js already downloaded, skipping..."
    }
} catch {
    Write-Error "Failed to download Node.js: $_"
    Write-Info "Please download manually from: $($downloads.NodeJS.Url)"
}

Write-Info "Downloading Java JDK 17..."
try {
    if (!(Test-Path $downloads.Java.File)) {
        Invoke-WebRequest -Uri $downloads.Java.Url -OutFile $downloads.Java.File -UseBasicParsing
        Write-Success "Java downloaded"
    } else {
        Write-Warning "Java already downloaded, skipping..."
    }
} catch {
    Write-Error "Failed to download Java: $_"
    Write-Info "Please download manually from: https://adoptium.net/temurin/releases/?version=17"
}

# ============================================
# PHASE 4: Extract Tools
# ============================================
Write-Header "PHASE 4: Extracting Tools"

# Extract Node.js
if (Test-Path $downloads.NodeJS.File) {
    Write-Info "Extracting Node.js..."
    try {
        Expand-Archive -Path $downloads.NodeJS.File -DestinationPath $NodeDir -Force
        Write-Success "Node.js extracted"
    } catch {
        Write-Error "Failed to extract Node.js: $_"
    }
}

# Extract Java
if (Test-Path $downloads.Java.File) {
    Write-Info "Extracting Java..."
    try {
        Expand-Archive -Path $downloads.Java.File -DestinationPath $JavaDir -Force
        Write-Success "Java extracted"
    } catch {
        Write-Error "Failed to extract Java: $_"
    }
}

# ============================================
# PHASE 5: Configure Environment Variables
# ============================================
Write-Header "PHASE 5: Configuring Environment Variables"

# Find extracted folders
$nodeFolder = Get-ChildItem $NodeDir -Directory | Where-Object { $_.Name -like "node-*" } | Select-Object -First 1
$javaFolder = Get-ChildItem $JavaDir -Directory | Where-Object { $_.Name -like "jdk-*" } | Select-Object -First 1

if ($nodeFolder) {
    $nodePath = $nodeFolder.FullName
    Write-Info "Node.js path: $nodePath"

    # Add to PATH
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($currentPath -notlike "*$nodePath*") {
        [Environment]::SetEnvironmentVariable("Path", "$nodePath;$currentPath", "User")
        Write-Success "Node.js added to PATH"
    } else {
        Write-Warning "Node.js already in PATH"
    }

    # Update current session
    $env:Path = "$nodePath;$env:Path"
} else {
    Write-Error "Node.js folder not found in $NodeDir"
}

if ($javaFolder) {
    $javaPath = $javaFolder.FullName
    Write-Info "Java path: $javaPath"

    # Set JAVA_HOME
    [Environment]::SetEnvironmentVariable("JAVA_HOME", $javaPath, "User")
    Write-Success "JAVA_HOME set to: $javaPath"

    # Add to PATH
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($currentPath -notlike "*$javaPath\bin*") {
        [Environment]::SetEnvironmentVariable("Path", "$javaPath\bin;$currentPath", "User")
        Write-Success "Java added to PATH"
    } else {
        Write-Warning "Java already in PATH"
    }

    # Update current session
    $env:JAVA_HOME = $javaPath
    $env:Path = "$javaPath\bin;$env:Path"
} else {
    Write-Error "Java folder not found in $JavaDir"
}

# ============================================
# PHASE 6: Verify Installations
# ============================================
Write-Header "PHASE 6: Verifying Installations"

Start-Sleep -Seconds 2

Write-Info "Checking Node.js..."
try {
    $nodeVer = & node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Node.js: $nodeVer"
    } else {
        Write-Error "Node.js verification failed"
    }
} catch {
    Write-Error "Node.js not accessible. May need to restart PowerShell."
}

Write-Info "Checking NPM..."
try {
    $npmVer = & npm --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "NPM: v$npmVer"
    } else {
        Write-Error "NPM verification failed"
    }
} catch {
    Write-Error "NPM not accessible"
}

Write-Info "Checking Java..."
try {
    $javaVer = & java -version 2>&1 | Select-Object -First 1
    Write-Success "Java: $javaVer"
} catch {
    Write-Error "Java not accessible. May need to restart PowerShell."
}

Write-Info "Checking Git..."
try {
    $gitVer = git --version
    Write-Success "Git: $gitVer"
} catch {
    Write-Error "Git verification failed"
}

# ============================================
# PHASE 7: Install NPM Global Packages
# ============================================
Write-Header "PHASE 7: Installing NPM Global Packages"

$globalPackages = @(
    "allure-commandline",
    "lighthouse",
    "newman"
)

foreach ($package in $globalPackages) {
    Write-Info "Installing $package..."
    try {
        & npm install -g $package --quiet
        if ($LASTEXITCODE -eq 0) {
            Write-Success "$package installed"
        } else {
            Write-Warning "$package installation had issues"
        }
    } catch {
        Write-Error "Failed to install $package"
    }
}

# ============================================
# PHASE 8: Install HAIDA Dependencies
# ============================================
Write-Header "PHASE 8: Installing HAIDA Dependencies"

$haidaPath = "C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA"

if (Test-Path $haidaPath) {
    Set-Location $haidaPath
    Write-Info "Installing HAIDA dependencies..."

    # Install dependencies
    & npm ci

    # Install pg for Supabase
    Write-Info "Installing pg package..."
    & npm install pg

    # Install Playwright browsers
    Write-Info "Installing Playwright browsers (this may take a few minutes)..."
    & npx playwright install --with-deps

    Write-Success "HAIDA dependencies installed"
} else {
    Write-Warning "HAIDA directory not found: $haidaPath"
}

# ============================================
# PHASE 9: Configure HAIDA Environment
# ============================================
Write-Header "PHASE 9: Configuring HAIDA Environment"

$envFile = "$haidaPath\.env"
$envExample = "$haidaPath\.env.example"

if (Test-Path $envExample) {
    if (!(Test-Path $envFile)) {
        Copy-Item $envExample $envFile
        Write-Success ".env file created from template"
    } else {
        Write-Warning ".env file already exists"
    }

    # Update .env with Supabase credentials if provided
    if ($SupabasePassword) {
        Write-Info "Updating .env with Supabase credentials..."

        $envContent = Get-Content $envFile
        $envContent = $envContent -replace "DB_HOST=.*", "DB_HOST=db.wdebyxvtunromsnkqbrd.supabase.co"
        $envContent = $envContent -replace "DB_PORT=.*", "DB_PORT=5432"
        $envContent = $envContent -replace "DB_NAME=.*", "DB_NAME=postgres"
        $envContent = $envContent -replace "DB_USER=.*", "DB_USER=postgres"
        $envContent = $envContent -replace "DB_PASSWORD=.*", "DB_PASSWORD=$SupabasePassword"
        $envContent = $envContent -replace "DB_SSL=.*", "DB_SSL=true"

        Set-Content $envFile $envContent
        Write-Success "Supabase credentials configured in .env"
    } else {
        Write-Warning "No Supabase password provided. Please update .env manually."
    }
} else {
    Write-Warning ".env.example not found"
}

# ============================================
# PHASE 10: Setup Supabase Database
# ============================================
Write-Header "PHASE 10: Setting Up Supabase Database"

if ($SupabasePassword) {
    $env:DB_PASSWORD = $SupabasePassword

    $dbSetupScript = "$haidaPath\database\setup-database.js"

    if (Test-Path $dbSetupScript) {
        Write-Info "Running database setup..."
        Set-Location "$haidaPath\database"

        try {
            & node setup-database.js
            Write-Success "Database setup completed"
        } catch {
            Write-Error "Database setup failed: $_"
        }

        Set-Location $haidaPath
    } else {
        Write-Warning "Database setup script not found"
    }
} else {
    Write-Warning "Skipping database setup (no password provided)"
    Write-Info "To setup database later, run:"
    Write-Info "  cd $haidaPath\database"
    Write-Info "  `$env:DB_PASSWORD='YOUR_PASSWORD'"
    Write-Info "  node setup-database.js"
}

# ============================================
# PHASE 11: Create Verification Script
# ============================================
Write-Header "PHASE 11: Creating Verification Scripts"

$verifyScript = @"
# HAIDA Verification Script
Write-Host "``n=== HAIDA Tools Verification ===" -ForegroundColor Cyan
Write-Host ""

# Node.js
try {
    `$v = node --version
    Write-Host "✓ Node.js: `$v" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js: NOT FOUND" -ForegroundColor Red
}

# NPM
try {
    `$v = npm --version
    Write-Host "✓ NPM: v`$v" -ForegroundColor Green
} catch {
    Write-Host "✗ NPM: NOT FOUND" -ForegroundColor Red
}

# Java
try {
    `$v = java -version 2>&1 | Select-Object -First 1
    Write-Host "✓ Java: `$v" -ForegroundColor Green
} catch {
    Write-Host "✗ Java: NOT FOUND" -ForegroundColor Red
}

# Git
try {
    `$v = git --version
    Write-Host "✓ Git: `$v" -ForegroundColor Green
} catch {
    Write-Host "✗ Git: NOT FOUND" -ForegroundColor Red
}

# Docker
try {
    `$v = docker --version
    Write-Host "✓ Docker: `$v" -ForegroundColor Green
} catch {
    Write-Host "⚠ Docker: NOT FOUND (optional)" -ForegroundColor Yellow
}

# Playwright
try {
    `$v = npx playwright --version 2>&1
    Write-Host "✓ Playwright: `$v" -ForegroundColor Green
} catch {
    Write-Host "⚠ Playwright: NOT FOUND" -ForegroundColor Yellow
}

# Allure
try {
    `$v = allure --version 2>&1
    Write-Host "✓ Allure: `$v" -ForegroundColor Green
} catch {
    Write-Host "⚠ Allure: NOT FOUND" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Environment Variables ===" -ForegroundColor Cyan
Write-Host "JAVA_HOME: `$env:JAVA_HOME"
Write-Host ""
Write-Host "=== HAIDA Project ===" -ForegroundColor Cyan
if (Test-Path "C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA") {
    Write-Host "✓ HAIDA directory found" -ForegroundColor Green
} else {
    Write-Host "✗ HAIDA directory NOT found" -ForegroundColor Red
}
Write-Host ""
"@

Set-Content "$haidaPath\verify-tools.ps1" $verifyScript
Write-Success "Verification script created: verify-tools.ps1"

# ============================================
# FINAL SUMMARY
# ============================================
Write-Header "Installation Complete!"

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Tools installed in: $BaseDir" -ForegroundColor Green
Write-Host "✓ Environment variables configured" -ForegroundColor Green
Write-Host "✓ NPM global packages installed" -ForegroundColor Green
Write-Host "✓ HAIDA dependencies installed" -ForegroundColor Green
if ($SupabasePassword) {
    Write-Host "✓ Supabase database configured" -ForegroundColor Green
} else {
    Write-Host "⚠ Supabase database NOT configured (no password)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. CLOSE this PowerShell window"
Write-Host "2. OPEN a NEW PowerShell window"
Write-Host "3. Run verification:"
Write-Host "   cd C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA"
Write-Host "   .\verify-tools.ps1"
Write-Host ""
Write-Host "4. Run your first test:"
Write-Host "   npm run test:web -- --project=chromium tests/web-e2e/smoke.spec.ts"
Write-Host ""
Write-Host "5. View documentation:"
Write-Host "   code README.md"
Write-Host ""

if (!$SupabasePassword) {
    Write-Warning "To setup Supabase database:"
    Write-Host "   cd database"
    Write-Host "   `$env:DB_PASSWORD='YOUR_PASSWORD'"
    Write-Host "   node setup-database.js"
    Write-Host ""
}

Write-Host "=== Support ===" -ForegroundColor Cyan
Write-Host "Documentation: INSTALACION-PASO-A-PASO.md"
Write-Host "CLI Guide: CLI-TOOLS-GUIDE.md"
Write-Host "Database: database/README-DATABASE.md"
Write-Host ""

Write-Success "Setup complete! Restart PowerShell to use the new tools."
