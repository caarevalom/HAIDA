# 🎯 HAIDA - Complete Setup Guide

## 📋 Overview

HAIDA is a comprehensive Quality Assurance platform with AI integration, combining traditional testing automation with intelligent insights for enterprise software quality assurance.

**Stack**: FastAPI + Supabase + Vercel + Copilot Studio
**Architecture**: Multi-tenant with RBAC, real-time features
**Features**: Testing automation, AI chat, documentation, CI/CD

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (for tooling)
- **Python** 3.11+ (for FastAPI)
- **Supabase** account (database)
- **Vercel** account (deployment)
- **Microsoft** account (Entra SSO)

### 1. Clone & Setup

```bash
git clone <your-repo>
cd HAIDA

# Install Node.js dependencies (for tooling)
npm install

# Install Python dependencies
pip install fastapi uvicorn python-dotenv msal redis
```

### 2. Environment Configuration

```bash
# Copy environment template
cp infra/.env.example .env.production

# Edit with your values:
# - SUPABASE_URL & keys
# - VERCEL_TOKEN
# - ENTRA_* credentials
# - JWT_SECRET
# - REDIS_URL (optional)
```

### 3. Database Setup

```powershell
# Windows PowerShell
.\setup-new-supabase.ps1
# OR
.\deploy-complete.ps1
```

### 4. Local Development

```bash
# Start FastAPI server
cd app
uvicorn main:app --reload --port 8000

# API docs: http://localhost:8000/docs
# Health check: http://localhost:8000/health
```

### 5. Deploy to Production

```bash
# Vercel deployment
vercel --prod

# CI/CD: Push to main branch triggers automatic deployment
```

---

## 🏗️ Architecture Details

### Core Components

```
HAIDA/
├── app/                    # FastAPI backend
│   ├── core/              # Shared utilities
│   │   ├── settings.py    # Configuration
│   │   ├── cors.py        # CORS setup
│   │   ├── rbac.py        # Role-based access
│   │   ├── tenants.py     # Multi-tenant logic
│   │   ├── limiter.py     # Rate limiting
│   │   ├── otel.py        # Observability
│   │   ├── i18n.py        # Internationalization
│   │   └── jwt_auth.py    # JWT authentication
│   └── routes/            # API endpoints
│       ├── auth.py        # Local auth
│       ├── entra.py       # Microsoft SSO
│       ├── docs.py        # Documentation
│       ├── chat.py        # AI chat
│       └── [other].py     # Additional routes
├── infra/                 # Infrastructure
│   ├── supabase/          # Database
│   │   ├── schema.sql     # Complete schema
│   │   └── policies.sql   # RLS policies
│   └── .env.example       # Environment template
├── docs/                  # Documentation
│   ├── HAIDA_Spec.md      # Technical spec
│   ├── API/openapi.yaml   # API specification
│   ├── UX/                # Design system
│   └── DB/ERD.mmd         # Database diagram
└── .github/workflows/     # CI/CD
    └── ci.yml            # GitHub Actions
```

### Security Model

- **Multi-tenant**: Complete isolation via RLS
- **RBAC**: Granular permissions system
- **Authentication**: Entra SSO + local JWT
- **Rate Limiting**: Redis-based throttling
- **Audit Logging**: Complete activity tracking

---

## 🔧 Configuration

### Environment Variables

#### Required

```bash
# App
APP_NAME=HAIDA
APP_ENV=production

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE=your_service_role_key

# Vercel
VERCEL_TOKEN=your_vercel_token

# Microsoft Entra
ENTRA_TENANT_ID=your_tenant_id
ENTRA_CLIENT_ID=your_app_client_id
ENTRA_CLIENT_SECRET=your_app_client_secret
ENTRA_REDIRECT_URI=https://your-app.vercel.app/api/entra/callback

# JWT
JWT_SECRET=your_super_secret_key
```

#### Optional

```bash
# Redis (for rate limiting & queues)
REDIS_URL=redis://localhost:6379/0

# Copilot Studio
DIRECT_LINE_SECRET=your_direct_line_secret

# Azure Key Vault
AZURE_KEYVAULT_URL=https://your-keyvault.vault.azure.net
```

### Supabase Setup

1. Create project at https://supabase.com
2. Run SQL schema: `infra/supabase/schema.sql`
3. Apply policies: `infra/supabase/policies.sql`
4. Configure authentication providers

### Vercel Deployment

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`
4. Configure environment variables in dashboard

---

## 🚀 API Endpoints

### Authentication

```http
POST /auth/login          # Local login
POST /auth/register       # User registration
GET  /auth/me            # Current user profile

GET  /entra/login        # Entra SSO initiation
GET  /entra/callback     # OAuth callback
```

### Core Features

```http
# Tenants & Projects
GET  /tenants            # List user tenants
POST /tenants            # Create tenant
GET  /projects           # List projects
POST /projects           # Create project

# Testing
GET  /projects/{id}/test-suites    # List test suites
POST /projects/{id}/test-suites    # Create suite
POST /scripts/{id}/run            # Execute script
GET  /script-runs/{id}            # Get execution status

# AI Chat
GET  /chat/threads                # List conversations
POST /chat/threads                # New conversation
POST /chat/threads/{id}/messages  # Send message

# Documentation
GET  /docs                        # List documents
POST /docs                        # Create document
POST /docs/search                 # Search documents
```

### System

```http
GET  /health              # Health check
GET  /version            # API version
GET  /system/status      # System metrics
GET  /flags              # Feature flags
GET  /system/rate        # Rate limiting status
```

---

## 🔐 Security Configuration

### Row Level Security (RLS)

All tables have RLS enabled with tenant-based isolation:

```sql
-- Example policy
CREATE POLICY "tenant_data_isolation" ON projects
    FOR ALL USING (tenant_id IN (
        SELECT tenant_id FROM tenant_members
        WHERE user_id = auth.uid()
    ));
```

### CORS Configuration

```python
# app/core/cors.py
origins = [
    "http://localhost:3000",
    "https://your-app.vercel.app",
    os.environ.get("SUPABASE_URL")
]
```

### Rate Limiting

```python
# Applied per endpoint
@app.middleware("http")
async def rate_limit_middleware(request, call_next):
    # Redis-based rate limiting logic
    pass
```

---

## 🤖 AI Integration

### Copilot Studio Setup

1. Create bot in Copilot Studio
2. Configure Direct Line channel
3. Get Direct Line secret
4. Configure in environment variables

### Fallback Providers

- **Primary**: Copilot Studio (Microsoft)
- **Fallback**: OpenAI/Anthropic
- **Auto-switch**: On connection failures

### Context Integration

- Document references
- Script suggestions
- Test case generation
- Code explanations

---

## 📊 Monitoring & Observability

### OpenTelemetry Setup

```python
# app/core/otel.py
import os
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter

def setup_otel():
    endpoint = os.environ.get("OTEL_EXPORTER_OTLP_ENDPOINT")
    if endpoint:
        # Configure tracing
        pass
```

### Logging

- **Structured JSON logs**
- **Log levels**: DEBUG, INFO, WARNING, ERROR
- **Request correlation IDs**
- **Performance metrics**

### Health Checks

```bash
# Health endpoint
curl https://your-app.vercel.app/health

# Response
{
  "status": "healthy",
  "version": "2.0.0",
  "timestamp": "2025-12-16T19:00:00Z"
}
```

---

## 🧪 Testing

### Local Testing

```bash
# Install test dependencies
pip install pytest httpx

# Run tests
pytest

# API testing
npm run test:api
```

### QA Scripts

```powershell
# Run QA automation
.\run-qa-local.ps1

# Validate setup
.\validate-all-tools.ps1
```

### Playwright Tests

```bash
# E2E tests
npx playwright test

# Visual regression
npx playwright test --headed

# Generate reports
npx playwright show-report
```

---

## 🚢 Deployment

### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "pip install -r requirements.txt",
  "devCommand": "uvicorn main:app --reload",
  "installCommand": "pip install -r requirements.txt",
  "framework": null,
  "functions": {
    "app/main.py": {
      "runtime": "python3.11"
    }
  }
}
```

### Environment Variables in Vercel

1. Go to Vercel dashboard
2. Select your project
3. Settings → Environment Variables
4. Add all variables from `.env.production`

### Production URL

- **API**: `https://your-app.vercel.app/api/v2`
- **Docs**: `https://your-app.vercel.app/docs`
- **Health**: `https://your-app.vercel.app/health`

---

## 🔧 Troubleshooting

### Common Issues

#### Database Connection

```bash
# Test Supabase connection
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
supabase.from('users').select('*').limit(1).then(console.log);
"
```

#### Authentication Issues

```bash
# Check JWT token
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-app.vercel.app/auth/me
```

#### Rate Limiting

```bash
# Check rate limit status
curl https://your-app.vercel.app/system/rate
```

### Logs & Debugging

```bash
# Vercel logs
vercel logs

# Local logs
tail -f logs/app.log

# Database logs (Supabase dashboard)
# Go to Reports → Logs
```

---

## 📚 Additional Resources

### Documentation

- **API Docs**: `/docs` (OpenAPI/Swagger)
- **Technical Spec**: `docs/HAIDA_Spec.md`
- **Database ERD**: `docs/DB/ERD.mmd`
- **UX Design**: `docs/UX/`

### Development

- **Local Setup**: `docs/LOCAL-TESTING-QUICK-START.md`
- **Contributing**: `docs/CONTRIBUTING.md`
- **Security**: `docs/SECURITY/ThreatModel.md`

### Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Documentation**: Internal wiki

---

## 🎉 Success Checklist

- [ ] Supabase project created and configured
- [ ] Database schema deployed
- [ ] RLS policies applied
- [ ] Vercel project deployed
- [ ] Environment variables configured
- [ ] Authentication working (Entra + local)
- [ ] API endpoints responding
- [ ] Health checks passing
- [ ] Basic testing completed
- [ ] Documentation accessible

**¡HAIDA está listo para revolucionar tu QA!** 🚀
