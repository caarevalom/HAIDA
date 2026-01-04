param(
  [string]$NodePath = "C:\Users\CarlosArturoArevaloM\Documents\Proyectos\node-v24.12.0-win-x64",
  [string]$ProjectPath = (Get-Location).Path,
  [string]$BaseUrl = "http://localhost:3000",
  [int]$Port = 3000,
  [switch]$SkipServer = $false,
  [switch]$SkipTests = $false,
  [switch]$ServerOnly = $false,
  [switch]$WebOnly = $false
)

function Write-Status { param([string]$msg); Write-Host "[QA] $msg" -ForegroundColor Cyan }
function Write-Error_ { param([string]$msg); Write-Host "ERROR: $msg" -ForegroundColor Red }
function Write-Warn_ { param([string]$msg); Write-Host "WARN: $msg" -ForegroundColor Yellow }
function Write-Success { param([string]$msg); Write-Host "[OK] $msg" -ForegroundColor Green }

# Step 1: Configure PATH
Write-Status "Configurando PATH temporal para Node.js..."
if (-not (Test-Path $NodePath)) {
  Write-Error_ "No existe Node.js en: $NodePath"
  exit 1
}

$OriginalPath = $env:PATH
$env:PATH = "$NodePath;$env:PATH"

try {
  $nodeVer = & node -v 2>$null
  $npmVer = & npm -v 2>$null
  if (-not $nodeVer -or -not $npmVer) { throw "No válido" }
} catch {
  $env:PATH = $OriginalPath
  Write-Error_ "node o npm no están accesibles"
  exit 1
}

Write-Success "node: $nodeVer | npm: $npmVer"

# Step 2: Navigate to project
Write-Status "Entrando al proyecto: $ProjectPath"
if (-not (Test-Path $ProjectPath)) {
  Write-Error_ "No existe: $ProjectPath"
  exit 1
}
Push-Location $ProjectPath

# Step 3: Start mock server (if not skipped)
if (-not $SkipServer) {
  Write-Status "Step 1: Iniciando servidor local mock en puerto $Port..."
  Write-Status "Base URL configurada: $BaseUrl"
  
  # Update .env with BaseUrl
  Write-Status "Actualizando .env con BASE_URL=$BaseUrl"
  "BASE_URL=$BaseUrl" | Out-File -Encoding UTF8 .env -Force
  $portInUse = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
  if ($portInUse) {
    Write-Warn_ "Puerto $Port ya está en uso. Deteniendo proceso anterior..."
    # Try to kill existing node process on that port
    Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Handles -gt 0 } | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
  }
  
  # Start the mock server in background
  Write-Status "Iniciando node tools/mock-server.js (en background)..."
  $serverProcess = Start-Process node -ArgumentList "tools/mock-server.js" -NoNewWindow -PassThru
  
  # Wait for server to start
  Start-Sleep -Seconds 2
  
  # Verify server is running
  $attempts = 0
  $serverRunning = $false
  while ($attempts -lt 5) {
    try {
      $response = Invoke-WebRequest -Uri "http://localhost:$Port" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
      if ($response.StatusCode -eq 200) {
        $serverRunning = $true
        break
      }
    } catch {
      $attempts++
      if ($attempts -lt 5) { Start-Sleep -Seconds 1 }
    }
  }
  
  if ($serverRunning) {
    Write-Success "Servidor local ejecutándose en http://localhost:$Port"
    Write-Status "Servidor corriendo con PID: $($serverProcess.Id)"
  } else {
    Write-Error_ "El servidor no respondió. Revisa que puerto $Port esté disponible."
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    Pop-Location
    $env:PATH = $OriginalPath
    exit 1
  }
} else {
  Write-Status "Step 1: Omitiendo inicio de servidor (-SkipServer)"
  $serverProcess = $null
}

# Step 4: Run tests (if not skipped)
if (-not $SkipTests -and -not $ServerOnly) {
  Write-Status "Step 2: Ejecutando pruebas contra servidor local..."
  
  # Install dependencies first
  Write-Status "Verificando dependencias..."
  if (-not (Test-Path "node_modules")) {
    Write-Status "Instalando packages..."
    & npm install
  } else {
    Write-Status "Dependencies ya instaladas"
  }
  
  # Run web tests
  if ($WebOnly -or -not $ServerOnly) {
    Write-Status "Ejecutando Web E2E tests..."
    & npm run test:web
    if ($LASTEXITCODE -eq 0) {
      Write-Success "Web tests completados"
    } else {
      Write-Warn_ "Web tests fallaron (posiblemente por servidor no disponible)"
    }
  }
}

# Step 5: Keep server running if requested
if ($ServerOnly) {
  Write-Status ""
  Write-Status "MODO SERVER-ONLY: El servidor está ejecutándose."
  Write-Status "Presiona Ctrl+C para detener."
  Write-Status ""
  
  # Wait indefinitely
  while ($true) { Start-Sleep -Seconds 1 }
}

# Cleanup
Write-Status "Limpiando..."
if ($serverProcess -and -not $ServerOnly) {
  Write-Status "Deteniendo servidor local..."
  Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
  Start-Sleep -Seconds 1
  Write-Success "Servidor detenido"
}

Pop-Location
$env:PATH = $OriginalPath
Write-Success "PATH restaurado. Sesión finalizada."
exit 0
