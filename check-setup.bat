@echo off
REM Quick check script to validate Node.js portable setup

setlocal enabledelayedexpansion

REM Colors (approximate in CMD)
echo.
echo ========================================
echo  QA E2E - Node.js Portable Check
echo ========================================
echo.

set NODE_PATH=C:\Users\CarlosArturoArevaloM\Documents\Proyectos\node-v24.12.0-win-x64
set PROJECT_PATH=C:\Users\CarlosArturoArevaloM\Documents\Proyectos\qa-starter-kit

REM Check if Node.js exists
if not exist "%NODE_PATH%" (
  echo [ERROR] Node.js no existe en: %NODE_PATH%
  echo [INFO]  Descarga Node.js portable desde: https://nodejs.org/en/download/prebuilt-installer
  exit /b 1
)

echo [OK] Carpeta Node.js encontrada: %NODE_PATH%

REM Add Node.js to PATH
set PATH=%NODE_PATH%;%PATH%

REM Check node
echo.
echo [CHECK] Validando node...
node -v >nul 2>&1
if errorlevel 1 (
  echo [ERROR] node.exe no funciona
  exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo [OK] %NODE_VER%

REM Check npm
echo [CHECK] Validando npm...
npm -v >nul 2>&1
if errorlevel 1 (
  echo [ERROR] npm.cmd no funciona
  exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VER=%%i
echo [OK] %NPM_VER%

REM Check project
echo.
echo [CHECK] Validando proyecto...
if not exist "%PROJECT_PATH%" (
  echo [ERROR] Proyecto no existe: %PROJECT_PATH%
  exit /b 1
)
echo [OK] Proyecto encontrado: %PROJECT_PATH%

REM Check key files
cd /d "%PROJECT_PATH%"
if not exist "package.json" (
  echo [WARN] package.json no encontrado
) else (
  echo [OK] package.json presente
)

if not exist ".env" (
  echo [WARN] .env no existe (sera creado al ejecutar run-qa.ps1)
) else (
  echo [OK] .env presente
)

if not exist "playwright.config.ts" (
  echo [WARN] playwright.config.ts no encontrado
) else (
  echo [OK] playwright.config.ts presente
)

echo.
echo ========================================
echo  [SUCCESS] Setup validado. Listo para ejecutar:
echo  
echo  cd "%PROJECT_PATH%"
echo  powershell -NoProfile -ExecutionPolicy Bypass -File .\run-qa.ps1
echo ========================================
echo.
pause
