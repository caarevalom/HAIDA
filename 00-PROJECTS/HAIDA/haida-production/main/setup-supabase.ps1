# ============================================
# HAIDA - Supabase Configuration Script
# ============================================

Write-Host "`n=== HAIDA Supabase Setup ===" -ForegroundColor Cyan

$haidaPath = "C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA"

# Set environment variables
$env:DB_HOST = "db.wdebyxvtunromsnkqbrd.supabase.co"
$env:DB_PORT = "5432"
$env:DB_NAME = "postgres"
$env:DB_USER = "postgres"
$env:DB_PASSWORD = "Aupbag7."
$env:DB_SSL = "true"
$env:DATABASE_URL = "postgresql://postgres:Aupbag7.@db.wdebyxvtunromsnkqbrd.supabase.co:5432/postgres"

Write-Host "Environment variables set" -ForegroundColor Green

# Test database connection
Write-Host "`nTesting database connection..." -ForegroundColor Cyan

Set-Location "$haidaPath\database"

$testScript = @"
const { Client } = require('pg');

const client = new Client({
  host: 'db.wdebyxvtunromsnkqbrd.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Aupbag7.',
  ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    await client.connect();
    console.log('✓ Connected to Supabase');

    const result = await client.query('SELECT NOW()');
    console.log('✓ Database time:', result.rows[0].now);

    await client.end();
    console.log('✓ Connection test successful');
  } catch (err) {
    console.error('✗ Connection failed:', err.message);
    process.exit(1);
  }
}

test();
"@

Set-Content "test-connection.js" $testScript
node test-connection.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Database connection successful" -ForegroundColor Green

    # Run database setup
    Write-Host "`nCreating database schema..." -ForegroundColor Cyan
    node setup-database.js

    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✓ Database schema created" -ForegroundColor Green
    } else {
        Write-Host "`n✗ Database setup failed" -ForegroundColor Red
    }
} else {
    Write-Host "`n✗ Database connection failed" -ForegroundColor Red
}

# Update .env files
Write-Host "`nUpdating .env files..." -ForegroundColor Cyan
Set-Location $haidaPath

$envFiles = @(".env", ".env.local", ".env.production")

foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        $content = Get-Content $envFile -Raw

        # Update Supabase variables
        $content = $content -replace "DB_HOST=.*", "DB_HOST=db.wdebyxvtunromsnkqbrd.supabase.co"
        $content = $content -replace "DB_PORT=.*", "DB_PORT=5432"
        $content = $content -replace "DB_NAME=.*", "DB_NAME=postgres"
        $content = $content -replace "DB_USER=.*", "DB_USER=postgres"
        $content = $content -replace "DB_PASSWORD=.*", "DB_PASSWORD=Aupbag7."
        $content = $content -replace "DB_SSL=.*", "DB_SSL=true"
        $content = $content -replace "SUPABASE_URL=.*", "SUPABASE_URL=https://wdebyxvtunromsnkqbrd.supabase.co"

        Set-Content $envFile $content
        Write-Host "✓ Updated $envFile" -ForegroundColor Green
    }
}

Write-Host "`n=== Supabase Setup Complete ===" -ForegroundColor Green
Write-Host "`nNext steps:"
Write-Host "1. Verify database in Supabase dashboard: https://app.supabase.com/project/wdebyxvtunromsnkqbrd"
Write-Host "2. Run tests: npm run test:web"
Write-Host "3. Check database: psql `"postgresql://postgres:Aupbag7.@db.wdebyxvtunromsnkqbrd.supabase.co:5432/postgres`""
Write-Host ""
