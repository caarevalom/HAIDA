# HAIDA Complete Deployment Script
# Fixed version without syntax errors

param(
    [switch]$SkipDatabase,
    [switch]$SkipVercel,
    [switch]$ProductionDeploy
)

Write-Host "HAIDA Complete Deployment Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

$haidaPath = "C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA"
Set-Location $haidaPath

# Phase 1: Environment Setup
Write-Host "Phase 1: Environment Setup" -ForegroundColor Yellow

if (!(Test-Path ".env.production")) {
    Write-Host "ERROR: .env.production not found" -ForegroundColor Red
    exit 1
}

# Load environment variables
Get-Content ".env.production" | ForEach-Object {
    if ($_ -match '^([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

Write-Host "Environment variables loaded" -ForegroundColor Green

# Phase 2: Database Setup
if (!$SkipDatabase) {
    Write-Host "Phase 2: Database Setup" -ForegroundColor Yellow

    # Test connection
    Write-Host "Testing database connection..." -ForegroundColor Cyan

    $testScript = @"
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    await client.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Database connected successfully');
    await client.end();
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
}
test();
"@

    Set-Content "test-db.js" $testScript -Encoding UTF8
    node test-db.js

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database connection successful" -ForegroundColor Green

        # Run migrations
        Write-Host "Running database migrations..." -ForegroundColor Cyan
        Set-Location "database"
        node setup-database.js

        if ($LASTEXITCODE -eq 0) {
            Write-Host "Database migrations completed" -ForegroundColor Green
        } else {
            Write-Host "Database migrations failed" -ForegroundColor Red
        }

        Set-Location $haidaPath
    } else {
        Write-Host "Database connection failed" -ForegroundColor Red
    }
} else {
    Write-Host "Phase 2: Database setup skipped" -ForegroundColor Gray
}

# Phase 3: Install Dependencies
Write-Host "Phase 3: Install Dependencies" -ForegroundColor Yellow

Write-Host "Installing npm dependencies..." -ForegroundColor Cyan
npm ci --production

if ($LASTEXITCODE -eq 0) {
    Write-Host "Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "Dependency installation failed" -ForegroundColor Red
}

# Phase 4: Build Application
Write-Host "Phase 4: Build Application" -ForegroundColor Yellow

$packageJson = Get-Content "package.json" | ConvertFrom-Json

if ($packageJson.scripts.build) {
    Write-Host "Running build script..." -ForegroundColor Cyan
    npm run build

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Build successful" -ForegroundColor Green
    } else {
        Write-Host "Build failed" -ForegroundColor Red
    }
} else {
    Write-Host "No build script found, skipping..." -ForegroundColor Yellow
}

# Phase 5: Vercel Deployment
if (!$SkipVercel) {
    Write-Host "Phase 5: Vercel Deployment" -ForegroundColor Yellow

    # Check Vercel CLI
    try {
        $vercelVersion = vercel --version 2>$null
        Write-Host "Vercel CLI available" -ForegroundColor Green
    } catch {
        Write-Host "Installing Vercel CLI..." -ForegroundColor Cyan
        npm install -g vercel
    }

    # Set token
    $env:VERCEL_TOKEN = "RsMSKpDF84aOXNaTCwCEanBi"

    # Deploy
    if ($ProductionDeploy) {
        Write-Host "Deploying to production..." -ForegroundColor Cyan
        vercel --prod --token $env:VERCEL_TOKEN
    } else {
        Write-Host "Deploying to preview..." -ForegroundColor Cyan
        vercel --token $env:VERCEL_TOKEN
    }

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Deployment successful" -ForegroundColor Green
    } else {
        Write-Host "Deployment failed" -ForegroundColor Red
    }
} else {
    Write-Host "Phase 5: Vercel deployment skipped" -ForegroundColor Gray
}

# Phase 6: Verification
Write-Host "Phase 6: Verification" -ForegroundColor Yellow

$verifyScript = @"
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verify() {
  try {
    await client.connect();
    const result = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    console.log('Database verification completed');
    await client.end();
  } catch (err) {
    console.error('Database verification failed:', err.message);
  }
}
verify();
"@

Set-Content "verify-db.js" $verifyScript -Encoding UTF8
node verify-db.js

# Summary
Write-Host "Deployment Summary" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host ""
Write-Host "Supabase URL: https://wdebyxvtunromsnkqbrd.supabase.co"
Write-Host "Supabase Dashboard: https://app.supabase.com/project/wdebyxvtunromsnkqbrd"
Write-Host "Vercel Dashboard: https://vercel.com/w9ITuSz5cmhTvpQIafRHh8mS"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Run 'vercel ls' to check deployments"
Write-Host "2. Run 'vercel logs <deployment-url>' to check logs"
Write-Host "3. Run 'npm run test:web' to run tests"

# Cleanup
Remove-Item "test-db.js" -ErrorAction SilentlyContinue
Remove-Item "verify-db.js" -ErrorAction SilentlyContinue

Write-Host "Deployment script completed!" -ForegroundColor Green
