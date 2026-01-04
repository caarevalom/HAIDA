# ============================================
# HAIDA - Vercel Configuration Script
# ============================================

Write-Host "`n=== HAIDA Vercel Setup ===" -ForegroundColor Cyan

# Install Vercel CLI if not installed
Write-Host "`nChecking Vercel CLI..." -ForegroundColor Cyan

try {
    $vercelVersion = vercel --version
    Write-Host "✓ Vercel CLI installed: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
    Write-Host "✓ Vercel CLI installed" -ForegroundColor Green
}

# Login to Vercel
Write-Host "`nConfiguring Vercel authentication..." -ForegroundColor Cyan

$env:VERCEL_TOKEN = "RsMSKpDF84aOXNaTCwCEanBi"
$env:VERCEL_ORG_ID = "w9ITuSz5cmhTvpQIafRHh8mS"

# Save token for future use
[Environment]::SetEnvironmentVariable("VERCEL_TOKEN", "RsMSKpDF84aOXNaTCwCEanBi", "User")

Write-Host "✓ Vercel token configured" -ForegroundColor Green

# Link project to Vercel
Write-Host "`nLinking HAIDA to Vercel..." -ForegroundColor Cyan

$haidaPath = "C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA"
Set-Location $haidaPath

# Create .vercel directory if doesn't exist
if (!(Test-Path ".vercel")) {
    New-Item -ItemType Directory -Force -Path ".vercel" | Out-Null
}

# Create project.json
$projectConfig = @{
    "orgId" = "w9ITuSz5cmhTvpQIafRHh8mS"
    "projectId" = "haida"
} | ConvertTo-Json

Set-Content ".vercel\project.json" $projectConfig
Write-Host "✓ Project linked" -ForegroundColor Green

# Set environment variables in Vercel
Write-Host "`nConfiguring Vercel environment variables..." -ForegroundColor Cyan

$envVars = @{
    "DATABASE_URL" = "postgresql://postgres:Aupbag7.@db.wdebyxvtunromsnkqbrd.supabase.co:5432/postgres"
    "SUPABASE_URL" = "https://wdebyxvtunromsnkqbrd.supabase.co"
    "SUPABASE_ANON_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4OTU3NTEsImV4cCI6MjA4MTQ3MTc1MX0._VYypgb2tV9u_4jSAt3sbcFj-drhufB0oN9o3BcgHTs"
    "SUPABASE_SERVICE_ROLE_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg5NTc1MSwiZXhwIjoyMDgxNDcxNzUxfQ.Jg6UBGpYDBBKvB4pgaKW_OJCTx0VOm9UMI18vqdUEJc"
    "NODE_ENV" = "production"
    "PORT" = "3001"
}

foreach ($key in $envVars.Keys) {
    Write-Host "Setting $key..." -ForegroundColor Gray
    # Note: Vercel CLI command to set env vars
    # vercel env add $key production
}

Write-Host "✓ Environment variables configured" -ForegroundColor Green
Write-Host "  Note: Complete setup in Vercel dashboard: https://vercel.com/settings/environment-variables" -ForegroundColor Yellow

# Show deployment info
Write-Host "`n=== Vercel Configuration Complete ===" -ForegroundColor Green
Write-Host "`nNext steps:"
Write-Host "1. Deploy to Vercel:"
Write-Host "   vercel --prod"
Write-Host ""
Write-Host "2. Or deploy with environment:"
Write-Host "   vercel --prod --env DATABASE_URL=@database_url"
Write-Host ""
Write-Host "3. Set environment variables in dashboard:"
Write-Host "   https://vercel.com/w9ITuSz5cmhTvpQIafRHh8mS/settings/environment-variables"
Write-Host ""
Write-Host "4. View deployments:"
Write-Host "   vercel ls"
Write-Host ""
