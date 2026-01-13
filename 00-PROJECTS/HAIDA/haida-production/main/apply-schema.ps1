# HAIDA - Aplicar Schema a Supabase (PowerShell)
# No requiere permisos de administrador

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  HAIDA - Aplicar Schema a Supabase" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Cargar variables de entorno desde .env
$envFile = ".env"
if (Test-Path $envFile) {
    Write-Host "[1/5] Cargando credenciales desde .env..." -ForegroundColor Yellow
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*?)\s*=\s*(.*?)\s*$') {
            $name = $matches[1]
            $value = $matches[2]
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
    Write-Host "  ✓ Variables de entorno cargadas" -ForegroundColor Green
} else {
    Write-Host "  ✗ ERROR: Archivo .env no encontrado" -ForegroundColor Red
    exit 1
}

# Extraer credenciales
$SUPABASE_URL = $env:SUPABASE_URL
$SUPABASE_SERVICE_KEY = $env:SUPABASE_SERVICE_ROLE_KEY
$DATABASE_URL = $env:DATABASE_URL

Write-Host ""
Write-Host "[2/5] Verificando credenciales..." -ForegroundColor Yellow
Write-Host "  Supabase URL: $SUPABASE_URL" -ForegroundColor Gray

# Opción 1: Usar Supabase REST API para ejecutar SQL
Write-Host ""
Write-Host "[3/5] Preparando archivos SQL..." -ForegroundColor Yellow

# Leer schema principal
$schemaPath = "infrastructure\supabase\schema.sql"
if (Test-Path $schemaPath) {
    Write-Host "  ✓ Schema principal encontrado" -ForegroundColor Green
    $schemaContent = Get-Content $schemaPath -Raw
} else {
    Write-Host "  ✗ ERROR: $schemaPath no encontrado" -ForegroundColor Red
    exit 1
}

# Leer migrations
$migrations = @()
$migrationsDir = "infrastructure\supabase\migrations"
if (Test-Path $migrationsDir) {
    $migrationFiles = Get-ChildItem "$migrationsDir\*.sql" | Sort-Object Name
    foreach ($file in $migrationFiles) {
        Write-Host "  ✓ Migration encontrada: $($file.Name)" -ForegroundColor Green
        $migrations += @{
            name = $file.Name
            content = Get-Content $file.FullName -Raw
        }
    }
}

Write-Host ""
Write-Host "[4/5] Aplicando schema vía Supabase API..." -ForegroundColor Yellow
Write-Host "  ADVERTENCIA: Esto puede tardar 2-3 minutos" -ForegroundColor Yellow
Write-Host ""

# Función para ejecutar SQL via Supabase REST API
function Invoke-SupabaseSQL {
    param(
        [string]$sql,
        [string]$description
    )

    Write-Host "  Ejecutando: $description" -ForegroundColor Cyan

    # Usar endpoint de PostgREST para ejecutar SQL
    $url = "$SUPABASE_URL/rest/v1/rpc/exec_sql"

    $headers = @{
        "apikey" = $SUPABASE_SERVICE_KEY
        "Authorization" = "Bearer $SUPABASE_SERVICE_KEY"
        "Content-Type" = "application/json"
        "Prefer" = "return=representation"
    }

    $body = @{
        query = $sql
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body -ErrorAction Stop
        Write-Host "  ✓ Completado: $description" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "  ⚠ Error: $_" -ForegroundColor Yellow
        return $false
    }
}

# ALTERNATIVA: Usar curl para ejecutar via backend admin endpoint
Write-Host "  Usando endpoint /admin/apply-schema del backend..." -ForegroundColor Cyan

try {
    # Verificar que el backend esté corriendo
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:8000/health" -ErrorAction Stop
    Write-Host "  ✓ Backend está corriendo" -ForegroundColor Green

    # Aplicar schema principal
    Write-Host ""
    Write-Host "  Aplicando schema principal..." -ForegroundColor Yellow
    $schemaResponse = Invoke-RestMethod -Uri "http://localhost:8000/admin/apply-schema" -Method Post -ErrorAction Stop

    if ($schemaResponse.status -eq "success") {
        Write-Host "  ✓ Schema principal aplicado" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Schema: $($schemaResponse.message)" -ForegroundColor Yellow
    }

    # Aplicar migrations
    Write-Host ""
    Write-Host "  Aplicando migrations..." -ForegroundColor Yellow
    $migrationsResponse = Invoke-RestMethod -Uri "http://localhost:8000/admin/apply-migrations" -Method Post -ErrorAction Stop

    Write-Host "  ✓ Migrations aplicadas: $($migrationsResponse.migrations_applied)" -ForegroundColor Green
    if ($migrationsResponse.migrations_failed -gt 0) {
        Write-Host "  ⚠ Migrations fallidas: $($migrationsResponse.migrations_failed)" -ForegroundColor Yellow
    }

    # Mostrar detalles
    Write-Host ""
    Write-Host "  Detalles:" -ForegroundColor Cyan
    foreach ($result in $migrationsResponse.results) {
        if ($result.status -eq "success") {
            Write-Host "    ✓ $($result.file)" -ForegroundColor Green
        } else {
            Write-Host "    ✗ $($result.file): $($result.error)" -ForegroundColor Red
        }
    }

} catch {
    Write-Host "  ✗ ERROR: No se pudo conectar al backend" -ForegroundColor Red
    Write-Host "  Asegúrate de que Docker esté corriendo: docker-compose ps" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  ERROR Details: $_" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "[5/5] Verificando estado de la base de datos..." -ForegroundColor Yellow

try {
    $dbStatus = Invoke-RestMethod -Uri "http://localhost:8000/admin/db-status" -ErrorAction Stop

    Write-Host ""
    Write-Host "  ✓ Conexión a Supabase: OK" -ForegroundColor Green
    Write-Host "  Total de tablas: $($dbStatus.total_tables)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Migrations Status:" -ForegroundColor Cyan
    Write-Host "    • Tabla 'defects' existe: $($dbStatus.migrations_status.defects_table_exists)" -ForegroundColor Gray
    Write-Host "    • test_steps es JSONB: $($dbStatus.migrations_status.test_steps_is_jsonb)" -ForegroundColor Gray
    Write-Host "    • test_steps tipo: $($dbStatus.migrations_status.test_steps_type)" -ForegroundColor Gray

    Write-Host ""
    Write-Host "  Tablas creadas:" -ForegroundColor Cyan
    foreach ($table in $dbStatus.tables) {
        Write-Host "    • $table" -ForegroundColor Gray
    }

} catch {
    Write-Host "  ⚠ No se pudo verificar el estado de la DB" -ForegroundColor Yellow
    Write-Host "  ERROR: $_" -ForegroundColor Gray
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  ✓ Proceso Completado" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Cyan
Write-Host "  1. Verifica la DB en Supabase Dashboard" -ForegroundColor White
Write-Host "  2. Testea endpoints: curl http://localhost:8000/api/projects" -ForegroundColor White
Write-Host "  3. Deploy frontend: cd Figma && vercel --prod" -ForegroundColor White
Write-Host ""
