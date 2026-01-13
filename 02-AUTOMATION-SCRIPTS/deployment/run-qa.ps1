param(
  [string]$NodePath = "C:\Users\CarlosArturoArevaloM\Documents\Proyectos\node-v24.12.0-win-x64",
  [string]$ProjectPath = (Get-Location).Path,
  [switch]$SkipInstall = $false,
  [switch]$SkipBrowsers = $false,
  [switch]$WebOnly = $false,
  [switch]$ApiOnly = $false
)

function Write-Status { param([string]$msg); Write-Host "[QA] $msg" -ForegroundColor Cyan }
function Write-Error_ { param([string]$msg); Write-Host "ERROR: $msg" -ForegroundColor Red }
function Write-Warn_ { param([string]$msg); Write-Host "WARN: $msg" -ForegroundColor Yellow }
function Write-Success { param([string]$msg); Write-Host "[OK] $msg" -ForegroundColor Green }

function Abort($msg) {
  Write-Error_ "$msg"
  exit 1
}

# Step 1: Configure PATH
Write-Status "Step 1: Configurando PATH temporal para Node.js en: $NodePath"
if (-not (Test-Path $NodePath)) {
  Abort "No existe la carpeta de Node.js: $NodePath"
}

$OriginalPath = $env:PATH
$env:PATH = "$NodePath;$env:PATH"
Write-Status "PATH actualizado. Verificando node/npm..."

# Validate node & npm
try {
  $nodeVer = & node -v 2>$null
  $npmVer = & npm -v 2>$null
  if (-not $nodeVer -or -not $npmVer) { throw "No válido" }
} catch {
  $env:PATH = $OriginalPath
  Abort "node o npm no están accesibles. Revisa ruta de Node.js."
}

Write-Success "node: $nodeVer"
Write-Success "npm: $npmVer"

# Step 2: Navigate to project
Write-Status "Step 2: Entrando al proyecto: $ProjectPath"
if (-not (Test-Path $ProjectPath)) {
  Abort "No existe el proyecto: $ProjectPath"
}
Push-Location $ProjectPath

# Create or verify .env
Write-Status "Step 2b: Verificando .env..."
if (-not (Test-Path ".env")) {
  Write-Warn_ ".env no existe. Creando con BASE_URL por defecto..."
  if (Test-Path ".env.example") {
    Copy-Item ".env.example" ".env"
    Write-Success ".env creado desde .env.example"
  } else {
    "BASE_URL=https://mcprod.thisisbarcelona.com" | Out-File -Encoding UTF8 .env
    Write-Success ".env creado con BASE_URL por defecto"
  }
} else {
  Write-Success ".env ya existe"
}

# Step 3: Install dependencies
if (-not $SkipInstall) {
  Write-Status "Step 3: Instalando dependencias (npm ci | npm install)"
  
  $npmCiOk = $true
  if (Test-Path "package-lock.json") {
    Write-Status "Detectado package-lock.json, usando npm ci..."
    & npm ci 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { $npmCiOk = $false }
  } else {
    Write-Warn_ "package-lock.json no encontrado, usando npm install..."
    $npmCiOk = $false
  }
  
  if (-not $npmCiOk) {
    Write-Status "Ejecutando npm install..."
    & npm install
    if ($LASTEXITCODE -ne 0) {
      Pop-Location
      Abort "npm install falló. Revisa la salida."
    }
  }
  Write-Success "Dependencias instaladas"
} else {
  Write-Status "Step 3: --SkipInstall activado. Omitiendo npm ci/install"
}

# Step 4: Install Playwright browsers
if (-not $SkipBrowsers) {
  Write-Status "Step 4: Instalando navegadores Playwright (npx playwright install --with-deps)"
  & npx playwright install --with-deps
  if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Abort "Instalación de navegadores Playwright falló."
  }
  Write-Success "Navegadores Playwright instalados"
} else {
  Write-Status "Step 4: --SkipBrowsers activado. Omitiendo instalación de navegadores"
}

# Helper: Run npm script
function Run-NpmScript {
  param(
    [string]$ScriptName,
    [bool]$Required = $false
  )
  
  Write-Status "Ejecutando: npm run $ScriptName"
  
  # Check if script exists in package.json
  $pkg = Get-Content package.json -Raw | ConvertFrom-Json
  if (-not $pkg.scripts.$ScriptName) {
    Write-Warn_ "Script '$ScriptName' no existe en package.json"
    return $false
  }
  
  & npm run $ScriptName
  $success = $LASTEXITCODE -eq 0
  
  if ($success) {
    Write-Success "Script '$ScriptName' completado"
  } else {
    Write-Warn_ "Script '$ScriptName' falló (exit code: $LASTEXITCODE)"
  }
  
  return $success
}

# Step 5a: Run tests (web, api, lighthouse)
Write-Status "Step 5: Ejecutando pruebas (Web E2E, API, Lighthouse)"

if ($WebOnly) {
  Run-NpmScript "test:web" $true
} elseif ($ApiOnly) {
  Run-NpmScript "test:api" $true
} else {
  # Run all test suites
  $webOk = Run-NpmScript "test:web" $false
  $apiOk = Run-NpmScript "test:api" $false
  $lhOk = Run-NpmScript "lighthouse" $false
}

# Step 5b: Generate & open Allure report
Write-Status "Step 5b: Generando reporte Allure..."

# Check if allure CLI is available
$allureCmd = Get-Command allure -ErrorAction SilentlyContinue

if ($allureCmd) {
  Write-Status "allure CLI detectado. Usando comando allure..."
  
  Run-NpmScript "allure:clean" $false
  Run-NpmScript "allure:generate" $false
  Run-NpmScript "allure:open" $false
  
  Write-Success "Reporte Allure abierto"
} else {
  Write-Warn_ "allure CLI no detectado. Usando npx allure-commandline@2 como alternativa..."
  
  if (Test-Path "reports/allure-results") {
    & npx allure-commandline@2 generate reports/allure-results -o reports/allure-report --clean
    if ($LASTEXITCODE -ne 0) {
      Write-Warn_ "Generación de Allure HTML falló. Verifica reports/allure-results."
    } else {
      Write-Success "Allure HTML generado en ./reports/allure-report"
      
      $reportPath = Resolve-Path .\reports\allure-report\index.html -ErrorAction SilentlyContinue
      if ($reportPath) {
        Write-Status "Abriendo reporte: $reportPath"
        Start-Process $reportPath
      } else {
        Write-Warn_ "No se encontró index.html en allure-report. Verifica la carpeta manualmente."
      }
    }
  } else {
    Write-Warn_ "Carpeta reports/allure-results no existe. No hay resultados para generar reporte."
  }
}

# Final status
Write-Host ""
Write-Success "=== Proceso E2E Testing finalizado ==="
Write-Status "Reportes:"
Write-Status "  - Playwright HTML: ./playwright-report"
Write-Status "  - Allure Report: ./reports/allure-report"
Write-Status "  - Newman (API): ./reports/newman"
Write-Status "  - Lighthouse: ./reports/lighthouse"
Write-Status ""

# Cleanup
Pop-Location
$env:PATH = $OriginalPath
Write-Success "PATH restaurado. Sesion finalizada."
exit 0
