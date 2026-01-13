# 🚀 SUPABASE + VERCEL CONFIGURATION - HAIDA

## ✅ Configuration Complete

All Supabase and Vercel credentials have been configured for HAIDA.

---

## 📊 SUPABASE CONFIGURATION

### Project Details
```
Project Name: HAIDA
Project ID: wdebyxvtunromsnkqbrd
Project URL: https://wdebyxvtunromsnkqbrd.supabase.co
```

### Database Connection
```
Host: db.wdebyxvtunromsnkqbrd.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: Aupbag7.
```

### Connection String
```
postgresql://postgres:hola@stayarta.com:5432/postgres
```

### API Keys

**Public Keys** (safe for client-side):
```
SUPABASE_URL=https://wdebyxvtunromsnkqbrd.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4OTU3NTEsImV4cCI6MjA4MTQ3MTc1MX0._VYypgb2tV9u_4jSAt3sbcFj-drhufB0oN9o3BcgHTs
```

**Private Keys** (server-side only):
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg5NTc1MSwiZXhwIjoyMDgxNDcxNzUxfQ.Jg6UBGpYDBBKvB4pgaKW_OJCTx0VOm9UMI18vqdUEJc
```

---

## 🌐 VERCEL CONFIGURATION

### Account Details
```
User ID: w9ITuSz5cmhTvpQIafRHh8mS
Org ID: w9ITuSz5cmhTvpQIafRHh8mS
```

### Tokens
```
HAIDA Token: RsMSKpDF84aOXNaTCwCEanBi
Account Token: lpTPNhJff0QxtVsD4e3Qhhgt
```

### AI Gateway
```
AI_GATEWAY_API_KEY=vck_0H2zUd4C0R7NYuCN4Cq3xWcLW85uCox4uj5rm410I10DAOzjiD1VV9mb
```

---

## 📁 FILES CREATED

1. **`.env.production`** - Production environment variables
2. **`vercel.json`** - Vercel deployment configuration
3. **`.vercelignore`** - Files to exclude from deployment
4. **`setup-supabase.ps1`** - Supabase setup script
5. **`setup-vercel.ps1`** - Vercel setup script
6. **`deploy-complete.ps1`** - Complete deployment automation

---

## 🚀 QUICK START

### Option 1: Complete Setup (Recommended)

```powershell
# Run complete setup
.\deploy-complete.ps1

# Or with production deployment
.\deploy-complete.ps1 -ProductionDeploy
```

### Option 2: Step by Step

```powershell
# 1. Setup Supabase
.\setup-supabase.ps1

# 2. Setup Vercel
.\setup-vercel.ps1

# 3. Deploy
vercel --prod
```

---

## 🗄️ DATABASE SETUP

### Automatic Setup

```powershell
# Configure and create database
.\setup-supabase.ps1
```

### Manual Setup

```powershell
# Connect to database
psql "postgresql://postgres:hola@stayarta.com:5432/postgres"

# Or run migrations
cd database
$env:DB_PASSWORD="Aupbag7."
node setup-database.js
```

### Verify Database

```powershell
# Check connection
$testScript = @"
const {Client} = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:hola@stayarta.com:5432/postgres',
  ssl: {rejectUnauthorized: false}
});

async function test() {
  await client.connect();
  const result = await client.query('SELECT NOW()');
  console.log('✓ Connected:', result.rows[0].now);

  const tables = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema='public' AND table_type='BASE TABLE'
  `);
  console.log('✓ Tables:', tables.rows.length);
  await client.end();
}

test().catch(console.error);
"@

node -e "$testScript"
```

---

## 🌍 VERCEL DEPLOYMENT

### Install Vercel CLI

```powershell
npm install -g vercel
```

### Login to Vercel

```powershell
# Using token
$env:VERCEL_TOKEN="RsMSKpDF84aOXNaTCwCEanBi"

# Or interactive login
vercel login
```

### Deploy

```powershell
# Preview deployment
vercel

# Production deployment
vercel --prod

# With custom environment
vercel --prod --env DATABASE_URL=@database_url
```

### Set Environment Variables

**Option A: Using CLI**

```powershell
vercel env add DATABASE_URL production
# Paste: postgresql://postgres:hola@stayarta.com:5432/postgres

vercel env add SUPABASE_URL production
# Paste: https://wdebyxvtunromsnkqbrd.supabase.co

vercel env add SUPABASE_ANON_KEY production
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Option B: Using Dashboard**

1. Go to: https://vercel.com/w9ITuSz5cmhTvpQIafRHh8mS/settings/environment-variables
2. Add each variable manually
3. Select environment: Production, Preview, Development

### Required Environment Variables in Vercel

```
DATABASE_URL
POSTGRES_URL
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NODE_ENV
PORT
BASE_URL
```

---

## 🔧 CONFIGURATION FILES EXPLAINED

### `.env.production`

Complete environment configuration with all credentials.
**⚠️ NEVER commit this file to git!**

### `vercel.json`

Deployment configuration:
- Build settings
- Routes configuration
- Environment variable references
- Region selection

### `.vercelignore`

Files excluded from deployment:
- node_modules
- test results
- local env files
- documentation

---

## 🧪 TESTING

### Test Supabase Connection

```powershell
# Quick test
node -e "const {Client}=require('pg'); const c=new Client({connectionString:'postgresql://postgres:hola@stayarta.com:5432/postgres',ssl:{rejectUnauthorized:false}}); c.connect().then(()=>c.query('SELECT NOW()')).then(r=>console.log('✓',r.rows[0].now)).catch(console.error).finally(()=>c.end())"
```

### Test Vercel Deployment

```powershell
# List deployments
vercel ls

# Get deployment logs
vercel logs <deployment-url>

# Open deployment
vercel open
```

### Run HAIDA Tests

```powershell
# Web tests
npm run test:web

# API tests
npm run test:api

# All tests
npm test
```

---

## 📊 MONITORING & DASHBOARDS

### Supabase Dashboard

- **Main Dashboard**: https://app.supabase.com/project/wdebyxvtunromsnkqbrd
- **Table Editor**: https://app.supabase.com/project/wdebyxvtunromsnkqbrd/editor
- **SQL Editor**: https://app.supabase.com/project/wdebyxvtunromsnkqbrd/sql
- **Database**: https://app.supabase.com/project/wdebyxvtunromsnkqbrd/database/tables

### Vercel Dashboard

- **Main Dashboard**: https://vercel.com/w9ITuSz5cmhTvpQIafRHh8mS
- **Deployments**: https://vercel.com/w9ITuSz5cmhTvpQIafRHh8mS/deployments
- **Settings**: https://vercel.com/w9ITuSz5cmhTvpQIafRHh8mS/settings
- **Environment**: https://vercel.com/w9ITuSz5cmhTvpQIafRHh8mS/settings/environment-variables

---

## 🔐 SECURITY BEST PRACTICES

### ✅ DO:
- Use environment variables for all secrets
- Keep `.env.production` in `.gitignore`
- Use SUPABASE_SERVICE_ROLE_KEY only on server-side
- Rotate tokens periodically
- Use SSL connections for database

### ❌ DON'T:
- Commit credentials to git
- Expose SERVICE_ROLE_KEY to client
- Use same credentials across environments
- Share tokens in public channels

---

## 🚨 TROUBLESHOOTING

### Database Connection Issues

```powershell
# Test connection
psql "postgresql://postgres:hola@stayarta.com:5432/postgres"

# Check SSL requirement
# Supabase requires SSL: ssl: {rejectUnauthorized: false}
```

### Vercel Deployment Fails

```powershell
# Check logs
vercel logs

# Redeploy
vercel --prod --force

# Check build logs
npm run build
```

### Environment Variables Not Working

```powershell
# List Vercel env vars
vercel env ls

# Pull env vars locally
vercel env pull

# Re-add env var
vercel env rm DATABASE_URL production
vercel env add DATABASE_URL production
```

---

## 📖 USEFUL COMMANDS

### Supabase

```powershell
# Connect to database
psql "postgresql://postgres:hola@stayarta.com:5432/postgres"

# Backup database
pg_dump "postgresql://postgres:hola@stayarta.com:5432/postgres" > backup.sql

# Restore database
psql "postgresql://..." < backup.sql

# Run query
psql "postgresql://..." -c "SELECT * FROM users"
```

### Vercel

```powershell
# Deploy
vercel
vercel --prod

# List deployments
vercel ls

# Remove deployment
vercel rm <deployment-name>

# View logs
vercel logs <deployment-url>

# Open in browser
vercel open

# Check status
vercel inspect <deployment-url>
```

### Git

```powershell
# Commit changes
git add .
git commit -m "feat: Configure Supabase and Vercel"
git push

# Create deployment branch
git checkout -b deploy/production
git push origin deploy/production
```

---

## 🎯 NEXT STEPS

### Immediate (Now):

1. ✅ Run `.\setup-supabase.ps1`
2. ✅ Run `.\setup-vercel.ps1`
3. ✅ Deploy with `vercel --prod`
4. ✅ Verify database tables
5. ✅ Run tests

### Short Term (This Week):

1. Configure CI/CD with GitHub Actions
2. Setup monitoring and alerts
3. Create backup strategy
4. Document API endpoints
5. Setup custom domain

### Long Term (This Month):

1. Implement Row Level Security in Supabase
2. Setup staging environment
3. Configure CDN
4. Optimize database queries
5. Setup analytics

---

## 📞 SUPPORT

### Documentation
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- HAIDA Docs: See `README.md`

### Dashboards
- Supabase: https://app.supabase.com/
- Vercel: https://vercel.com/dashboard

### Contact
- Email: hola@stayarta.com
- Project: HAIDA QA Automation

---

**Created**: ++34662652300
**Version**: 1.0
**Status**: ✅ Production Ready
