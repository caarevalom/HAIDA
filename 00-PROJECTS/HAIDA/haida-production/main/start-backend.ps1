# HAIDA Backend - Inicio Rápido con Docker
# Este script NO requiere permisos de administrador

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HAIDA Backend - Docker Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Docker
Write-Host "[1/5] Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "  ✓ Docker encontrado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ ERROR: Docker no está instalado o no está corriendo" -ForegroundColor Red
    Write-Host "  → Abre Docker Desktop y vuelve a intentar" -ForegroundColor Yellow
    exit 1
}

# 2. Verificar docker-compose
Write-Host "[2/5] Verificando Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version
    Write-Host "  ✓ Docker Compose encontrado: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ ERROR: Docker Compose no disponible" -ForegroundColor Red
    exit 1
}

# 3. Verificar archivo .env
Write-Host "[3/5] Verificando configuración..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "  ✓ Archivo .env encontrado" -ForegroundColor Green
} else {
    Write-Host "  ⚠ ADVERTENCIA: No se encontró .env" -ForegroundColor Yellow
    Write-Host "  → El backend usará valores por defecto" -ForegroundColor Yellow

    # Preguntar si desea continuar
    $continue = Read-Host "  ¿Deseas continuar de todos modos? (s/n)"
    if ($continue -ne "s") {
        Write-Host "  → Crea un archivo .env con tus credenciales y vuelve a intentar" -ForegroundColor Yellow
        Write-Host "  → Puedes copiar .env.example como base" -ForegroundColor Yellow
        exit 0
    }
}

# 4. Detener contenedores previos (si existen)
Write-Host "[4/5] Limpiando contenedores previos..." -ForegroundColor Yellow
docker-compose down 2>$null
Write-Host "  ✓ Limpieza completada" -ForegroundColor Green

# 5. Iniciar servicios
Write-Host "[5/5] Iniciando servicios (Backend + Redis)..." -ForegroundColor Yellow
Write-Host ""
docker-compose up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ Backend INICIADO correctamente" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "URLs disponibles:" -ForegroundColor Cyan
    Write-Host "  • API Backend:    http://localhost:8000" -ForegroundColor White
    Write-Host "  • Health Check:   http://localhost:8000/health" -ForegroundColor White
    Write-Host "  • Swagger Docs:   http://localhost:8000/docs" -ForegroundColor White
    Write-Host "  • ReDoc:          http://localhost:8000/redoc" -ForegroundColor White
    Write-Host "  • Redis:          localhost:6379" -ForegroundColor White
    Write-Host ""
    Write-Host "Comandos útiles:" -ForegroundColor Cyan
    Write-Host "  • Ver logs:       docker-compose logs -f backend" -ForegroundColor White
    Write-Host "  • Detener todo:   docker-compose down" -ForegroundColor White
    Write-Host "  • Reiniciar:      docker-compose restart backend" -ForegroundColor White
    Write-Host ""

    # Esperar 3 segundos para que el backend inicie
    Write-Host "Esperando a que el backend inicie..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3

    # Testear health endpoint
    Write-Host "Testeando health endpoint..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✓ Backend respondiendo correctamente!" -ForegroundColor Green
            Write-Host "  Respuesta: $($response.Content)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  ⚠ Backend aún no responde (puede tardar unos segundos más)" -ForegroundColor Yellow
        Write-Host "  → Revisa los logs con: docker-compose logs -f backend" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "🚀 Listo para testear!" -ForegroundColor Green
    Write-Host ""

} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ✗ ERROR al iniciar Backend" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Ver logs con: docker-compose logs backend" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
