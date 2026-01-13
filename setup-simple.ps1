# HAIDA Simple Setup Script
# Sin permisos de administrador

param([string]$SupabasePassword = "")

Write-Host "`n=== HAIDA Setup Started ===" -ForegroundColor Cyan

# Directorios
$BaseDir = "$env:USERPROFILE\Apps"
$NodeDir = "$BaseDir\nodejs"
$JavaDir = "$BaseDir\java"

# Crear directorios
New-Item -ItemType Directory -Force -Path $BaseDir | Out-Null
New-Item -ItemType Directory -Force -Path $NodeDir | Out-Null
New-Item -ItemType Directory -Force -Path $JavaDir | Out-Null

Write-Host "Created directories in: $BaseDir" -ForegroundColor Green

# URLs de descarga
$nodeUrl = "https://nodejs.org/dist/v20.10.0/node-v20.10.0-win-x64.zip"
$javaUrl = "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.9%2B9/OpenJDK17U-jdk_x64_windows_hotspot_17.0.9_9.zip"

$nodeZip = "$env:USERPROFILE\Downloads\node-v20.10.0-win-x64.zip"
$javaZip = "$env:USERPROFILE\Downloads\jdk-17.0.9.zip"

# Descargar Node.js
Write-Host "`nDownloading Node.js..." -ForegroundColor Cyan
if (!(Test-Path $nodeZip)) {
    try {
        Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeZip
        Write-Host "Node.js downloaded" -ForegroundColor Green
    } catch {
        Write-Host "Download failed. Please download manually:" -ForegroundColor Yellow
        Write-Host $nodeUrl
    }
}

# Descargar Java
Write-Host "`nDownloading Java..." -ForegroundColor Cyan
if (!(Test-Path $javaZip)) {
    try {
        Invoke-WebRequest -Uri $javaUrl -OutFile $javaZip
        Write-Host "Java downloaded" -ForegroundColor Green
    } catch {
        Write-Host "Download failed. Please download manually:" -ForegroundColor Yellow
        Write-Host "https://adoptium.net/temurin/releases/?version=17"
    }
}

# Extraer Node.js
if (Test-Path $nodeZip) {
    Write-Host "`nExtracting Node.js..." -ForegroundColor Cyan
    Expand-Archive -Path $nodeZip -DestinationPath $NodeDir -Force
    Write-Host "Node.js extracted" -ForegroundColor Green
}

# Extraer Java
if (Test-Path $javaZip) {
    Write-Host "Extracting Java..." -ForegroundColor Cyan
    Expand-Archive -Path $javaZip -DestinationPath $JavaDir -Force
    Write-Host "Java extracted" -ForegroundColor Green
}

# Configurar PATH
$nodeFolder = Get-ChildItem $NodeDir -Directory | Where-Object { $_.Name -like "node-*" } | Select-Object -First 1
$javaFolder = Get-ChildItem $JavaDir -Directory | Where-Object { $_.Name -like "jdk-*" } | Select-Object -First 1

if ($nodeFolder) {
    $nodePath = $nodeFolder.FullName
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($currentPath -notlike "*$nodePath*") {
        [Environment]::SetEnvironmentVariable("Path", "$nodePath;$currentPath", "User")
        Write-Host "Node.js added to PATH" -ForegroundColor Green
    }
    $env:Path = "$nodePath;$env:Path"
}

if ($javaFolder) {
    $javaPath = $javaFolder.FullName
    [Environment]::SetEnvironmentVariable("JAVA_HOME", $javaPath, "User")
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($currentPath -notlike "*$javaPath\bin*") {
        [Environment]::SetEnvironmentVariable("Path", "$javaPath\bin;$currentPath", "User")
        Write-Host "Java added to PATH" -ForegroundColor Green
    }
    $env:JAVA_HOME = $javaPath
    $env:Path = "$javaPath\bin;$env:Path"
}

# Instalar dependencias HAIDA
Write-Host "`nInstalling HAIDA dependencies..." -ForegroundColor Cyan
$haidaPath = "C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA"

if (Test-Path $haidaPath) {
    Set-Location $haidaPath

    & npm ci
    & npm install pg
    & npm install -g allure-commandline lighthouse newman
    & npx playwright install --with-deps

    Write-Host "Dependencies installed" -ForegroundColor Green
}

# Configurar .env
$envFile = "$haidaPath\.env"
$envExample = "$haidaPath\.env.example"

if ((Test-Path $envExample) -and !(Test-Path $envFile)) {
    Copy-Item $envExample $envFile
    Write-Host ".env file created" -ForegroundColor Green
}

# Configurar Supabase si password provided
if ($SupabasePassword) {
    Write-Host "`nConfiguring Supabase..." -ForegroundColor Cyan

    if (Test-Path $envFile) {
        $content = Get-Content $envFile -Raw
        $content = $content -replace "DB_PASSWORD=.*", "DB_PASSWORD=$SupabasePassword"
        Set-Content $envFile $content
        Write-Host "Supabase configured" -ForegroundColor Green
    }

    # Setup database
    $env:DB_PASSWORD = $SupabasePassword
    Set-Location "$haidaPath\database"
    & node setup-database.js
}

Write-Host "`n=== Setup Complete ===" -ForegroundColor Green
Write-Host "`nNext steps:"
Write-Host "1. Close this PowerShell"
Write-Host "2. Open a NEW PowerShell"
Write-Host "3. Run: cd C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA"
Write-Host "4. Run: node --version"
Write-Host "5. Run: npm run test:web"
Write-Host ""
