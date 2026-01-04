# Script para configurar un nuevo proyecto de Supabase

Write-Host "=== CONFIGURACIÓN DE NUEVO PROYECTO SUPABASE ===" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Cyan

Write-Host "PASO 1: Crear proyecto en Supabase" -ForegroundColor Yellow
Write-Host "1. Ve a: https://app.supabase.com" -ForegroundColor White
Write-Host "2. Inicia sesión con tu cuenta" -ForegroundColor White
Write-Host "3. Haz clic en 'New project'" -ForegroundColor White
Write-Host "4. Completa los campos:" -ForegroundColor White
Write-Host "   - Name: HAIDA" -ForegroundColor Gray
Write-Host "   - Database Password: Aupbag7." -ForegroundColor Gray
Write-Host "   - Region: EU West (London) o la más cercana" -ForegroundColor Gray
Write-Host "5. Espera a que se cree el proyecto (5-10 minutos)" -ForegroundColor White
Write-Host "" -ForegroundColor Cyan

Read-Host "Presiona Enter cuando hayas creado el proyecto y esté listo"

Write-Host "" -ForegroundColor Cyan
Write-Host "PASO 2: Obtener credenciales del proyecto" -ForegroundColor Yellow
Write-Host "1. Ve a Settings > API" -ForegroundColor White
Write-Host "2. Copia estos valores:" -ForegroundColor White
Write-Host "   - Project URL" -ForegroundColor Gray
Write-Host "   - anon/public key" -ForegroundColor Gray
Write-Host "   - service_role key" -ForegroundColor Gray
Write-Host "" -ForegroundColor White

$projectUrl = Read-Host "Pega la Project URL (ej: https://abcdefghijklmnop.supabase.co)"
$anonKey = Read-Host "Pega el anon/public key"
$serviceKey = Read-Host "Pega el service_role key"

Write-Host "" -ForegroundColor Cyan
Write-Host "PASO 3: Actualizar archivo .env.production" -ForegroundColor Yellow

# Extraer información del project URL
$projectId = $projectUrl -replace 'https://', '' -replace '\.supabase\.co', ''
$dbHost = "$projectId.supabase.co"
$dbUrl = "postgresql://postgres:Aupbag7.@$dbHost/postgres"

Write-Host "Project ID: $projectId" -ForegroundColor Gray
Write-Host "Database Host: $dbHost" -ForegroundColor Gray
Write-Host "Database URL: $dbUrl" -ForegroundColor Gray

# Actualizar .env.production
$envContent = @"
# ============================================
# HAIDA PRODUCTION ENVIRONMENT VARIABLES
# Supabase + Vercel Configuration
# ============================================

# ============================================
# SUPABASE - Database (PostgreSQL)
# ============================================
DATABASE_URL=$dbUrl
POSTGRES_URL=$dbUrl
POSTGRES_PRISMA_URL=$dbUrl
POSTGRES_URL_NON_POOLING=$dbUrl

DB_HOST=$dbHost
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=Aupbag7.
DB_SSL=true

POSTGRES_USER=postgres
POSTGRES_HOST=$dbHost
POSTGRES_PASSWORD=Aupbag7.
POSTGRES_DATABASE=postgres

# ============================================
# SUPABASE - API Configuration
# ============================================
SUPABASE_PROJECT_ID=$projectId
SUPABASE_PROJECT_NAME=HAIDA
SUPABASE_URL=$projectUrl
SUPABASE_API_URL=$projectUrl

# Public Keys (safe for client-side)
NEXT_PUBLIC_SUPABASE_URL=$projectUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$anonKey

# Private Keys (server-side only, NEVER expose to client)
SUPABASE_ANON_KEY=$anonKey
SUPABASE_SERVICE_ROLE_KEY=$serviceKey
SUPABASE_JWT_SECRET=your-jwt-secret-here

SUPABASE_ACCESS_TOKEN=sbp_a5ca399ca6dc85662d093fa21fae60c6e9b0f77d

# Supabase API Keys (legacy format)
SUPABASE_API_PUBLIC_KEY=sb_publishable_Y8XO7aQtE3HrxKIzEtqOHw_wRy-huwF
SUPABASE_API_PRIVATE_KEY=sb_secret_Mhh_Hh8jjzMcz4rn5-t40A_OI15Yc6ih8jjzMcz4rn5-t40A_OI15Yc6i

# ============================================
# VERCEL - Deployment Configuration
# ============================================
VERCEL_USER_ID=w9ITuSz5cmhTvpQIafRHh8mS
VERCEL_TOKEN_HAIDA=RsMSKpDF84aOXNaTCwCEanBi
VERCEL_TOKEN_ACCOUNT=lpTPNhJff0QxtVsD4e3Qhhgt
VERCEL_ORG_ID=w9ITuSz5cmhTvpQIafRHh8mS

# AI Gateway (Vercel AI SDK)
AI_GATEWAY_API_KEY=vck_0H2zUd4C0R7NYuCN4Cq3xWcLW85uCox4uj5rm410I10DAOzjiD1VV9mb

# ============================================
# HAIDA - Application Configuration
# ============================================
NODE_ENV=production
PORT=3001
API_PORT=3001

# Base URL for testing
BASE_URL=https://mcprod.thisisbarcelona.com
TEST_URL=https://mcprod.thisisbarcelona.com

# ============================================
# HAIDA - Notifications & Integrations
# ============================================
# Slack Webhook (update with your actual webhook)
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# GitHub Token (for CI/CD integration)
GITHUB_TOKEN=

# Azure DevOps (if applicable)
AZURE_DEVOPS_TOKEN=

# ============================================
# HAIDA - Change Detection
# ============================================
CHANGEDETECTION_URL=http://changedetection:5000
CHANGEDETECTION_API_KEY=

# ============================================
# HAIDA - Reporting
# ============================================
ALLURE_RESULTS_DIR=./reports/allure-results
ALLURE_REPORT_DIR=./reports/allure-report

# ============================================
# CORS & Security
# ============================================
ALLOWED_ORIGINS=$projectUrl,http://localhost:3000,http://localhost:3001
CORS_ENABLED=true

# ============================================
# Logging
# ============================================
LOG_LEVEL=info
"@

Set-Content -Path ".env.production" -Value $envContent -Encoding UTF8

Write-Host "Archivo .env.production actualizado" -ForegroundColor Green

Write-Host "" -ForegroundColor Cyan
Write-Host "PASO 4: Ejecutar setup de base de datos" -ForegroundColor Yellow

# Cargar variables de entorno
Get-Content ".env.production" | ForEach-Object {
    if ($_ -match '^([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

Write-Host "Ejecutando setup de base de datos..." -ForegroundColor Cyan
node database/setup-database.js

Write-Host "" -ForegroundColor Green
Write-Host "=== CONFIGURACIÓN COMPLETADA ===" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "Proyecto Supabase creado y configurado correctamente." -ForegroundColor White
Write-Host "Las tablas de HAIDA han sido creadas en la base de datos." -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "Dashboard: $projectUrl" -ForegroundColor Cyan
Write-Host "Admin Panel: https://app.supabase.com/project/$projectId" -ForegroundColor Cyan
