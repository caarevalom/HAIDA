# HAIDA DevOps & Infrastructure Stack

Complete overview of the DevOps infrastructure, CI/CD pipeline, and deployment architecture.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           HAIDA System                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      GitHub Repository                          │   │
│  │  (Source Code + CI/CD Configuration)                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                  │                                       │
│                                  ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    GitHub Actions Pipeline                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │   │
│  │  │    Test      │→ │    Build     │→ │   Deploy     │          │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│           │                    │                    │                    │
│           ▼                    ▼                    ▼                    │
│   ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐         │
│   │  PostgreSQL    │  │ Container Reg  │  │  Deployments     │         │
│   │  (Tests)       │  │  (ghcr.io)     │  │  - Railway       │         │
│   │  Test Results  │  │  - Backend img │  │  - Vercel        │         │
│   └────────────────┘  │  - Frontend img│  │  - Docker        │         │
│                       └────────────────┘  └──────────────────┘         │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌──────────────────┬────────┴─────────┬─────────────────┐
        ▼                  ▼                  ▼                 ▼
   ┌─────────────┐   ┌──────────┐      ┌──────────┐      ┌──────────┐
   │  Development│   │ Staging  │      │Production│      │Monitoring│
   ├─────────────┤   ├──────────┤      ├──────────┤      ├──────────┤
   │Docker Local │   │Docker    │      │Railway   │      │Sentry    │
   │Port 3000    │   │Compose   │      │Backend   │      │Errors    │
   │Port 3001    │   │IP:       │      │Vercel    │      │Logtail   │
   │Port 5000    │   │Whitelisted      │Frontend  │      │Logs      │
   └─────────────┘   └──────────┘      └──────────┘      └──────────┘
```

---

## CI/CD Pipeline Flow

```
Git Push → GitHub Actions Trigger
    │
    ├─► TEST JOB (runs on every push)
    │   ├─ Setup PostgreSQL
    │   ├─ Setup Redis
    │   ├─ Run Backend Tests (pytest)
    │   ├─ Run Frontend Tests (npm test)
    │   └─ Upload Coverage
    │
    ├─► BUILD JOB (only if tests pass)
    │   ├─ Build Backend Docker image
    │   │  └─ Push to ghcr.io
    │   ├─ Build Frontend Docker image
    │   │  └─ Push to ghcr.io
    │   └─ Tag with version & git sha
    │
    ├─► DEPLOY BACKEND JOB (main branch only)
    │   ├─ Deploy to Railway
    │   ├─ Run migrations
    │   ├─ Health check
    │   └─ Slack notification
    │
    ├─► DEPLOY FRONTEND JOB (main branch only)
    │   ├─ Deploy to Vercel
    │   ├─ Verify deployment
    │   └─ Update DNS (if needed)
    │
    └─► NOTIFICATION JOB
        ├─ Slack message
        ├─ Email (optional)
        └─ GitHub Status
```

---

## Services & Deployments

### Development (Local Docker Compose)

```yaml
Services Running Locally:
├─ Frontend (Next.js): http://localhost:3000
├─ Backend API (FastAPI): http://localhost:3001
├─ PostgreSQL: localhost:5432
├─ Redis: localhost:6379
├─ Changedetection.io: http://localhost:5000
├─ Selenium Hub: http://localhost:4444
└─ Allure Reports: http://localhost:4040

Configuration:
  - docker-compose.yml (development)
  - Environment: .env file
  - Volumes: ./data (mounted locally)
  - Logs: ./logs (stored locally)
```

### Production (Distributed)

```yaml
Backend Deployment (Railway):
├─ API Server (FastAPI)       : https://api.haida.hiberus.com
├─ Database (PostgreSQL)      : Railway Managed
├─ Cache (Redis)              : Railway Managed
├─ Health Check               : /health endpoint
└─ Auto-scaling              : Based on CPU/Memory

Frontend Deployment (Vercel):
├─ Web App (Next.js)          : https://haida.hiberus.com
├─ CDN                        : Vercel Global Network
├─ SSL/TLS                    : Automatic renewal
├─ Health Check               : /api/health endpoint
└─ Auto-scaling              : Built-in

Configuration:
- docker-compose.production.yml
- Environment: .env.production
- Managed databases
- Auto-backup enabled
```

---

## Docker Images

### Backend Image

```dockerfile
# Dockerfile: backend/Dockerfile
FROM python:3.11-slim

# Multi-stage build:
1. Builder stage - Install dependencies
2. Runtime stage - Copy only necessary files

# Final image:
- Base: python:3.11-slim
- Size: ~400MB
- Healthcheck: GET /health
- Port: 8000
- Command: uvicorn app.main:app
```

### Frontend Image

```dockerfile
# Dockerfile: frontend/Dockerfile
FROM node:20-alpine

# Multi-stage build:
1. Builder stage - Build Next.js app
2. Runtime stage - Optimized image

# Final image:
- Base: node:20-alpine
- Size: ~200MB
- Healthcheck: GET /api/health
- Port: 3000
- Command: npm start
```

### Image Registry

```
Container Registry: GitHub Container Registry (ghcr.io)

Image Names:
├─ ghcr.io/hiberus/haida/backend:<tag>
└─ ghcr.io/hiberus/haida/frontend:<tag>

Tags:
├─ latest              - Latest main branch build
├─ main                - Current main branch
├─ v1.0.0              - Version tags
├─ git-sha             - Specific commit
└─ develop             - Development branch
```

---

## Deployment Methods

### Method 1: Full Automated (GitHub Actions)

```bash
git push origin main
↓
GitHub Actions triggers automatically
↓
Tests → Build → Deploy → Verify → Notify
```

**Advantages**: Fast, automated, tested, tracked
**Time**: 10-15 minutes
**Rollback**: Simple git revert

### Method 2: Manual Full Deployment

```bash
./deploy.sh production
```

**What it does**:

1. Checks all requirements
2. Builds Docker images
3. Runs tests
4. Deploys backend to Railway
5. Deploys frontend to Vercel
6. Verifies health
7. Generates report

**Advantages**: Full control, detailed output
**Time**: 15-20 minutes

### Method 3: Component-Specific Deployment

```bash
# Backend only
./deploy-backend.sh production

# Frontend only
./deploy-frontend.sh production
```

### Method 4: Manual Platform Deployments

```bash
# Railway (Backend)
railway up
railway deploy

# Vercel (Frontend)
vercel deploy --prod
```

---

## Health Monitoring

### Health Check Endpoints

```
Backend:
  GET /health
  Returns: {status: "healthy", services: {...}}
  Interval: 30s
  Timeout: 10s

Frontend:
  GET /api/health
  Returns: {status: "healthy"}
  Interval: 30s
  Timeout: 10s

Database:
  pg_isready -U haida_user
  Docker health check
  Interval: 10s

Redis:
  redis-cli ping
  Docker health check
  Interval: 10s
```

### Monitoring Tools

```
Sentry (Error Tracking)
├─ Backend errors → Sentry DSN
├─ Frontend errors → Sentry DSN
├─ Alerts on threshold
└─ https://sentry.io

Logtail (Centralized Logging)
├─ Application logs
├─ System logs
├─ Real-time search
└─ https://betterstack.com

Uptime Monitoring
├─ Service availability
├─ Response time tracking
└─ Alerts on outages

Custom Dashboards
├─ Railway dashboard
├─ Vercel dashboard
└─ GitHub Actions runs
```

---

## Environment Variables

### Backend (.env)

```bash
# Core
NODE_ENV=production
PORT=8000

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=haida_results
DB_USER=haida_user
DB_PASSWORD=***
DB_SSL=true

# Cache
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=***

# Services
CHANGEDETECTION_URL=http://changedetection:5000
CHANGEDETECTION_API_KEY=***

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
SENTRY_DSN=***
LOGTAIL_TOKEN=***

# Notifications
SLACK_WEBHOOK=***
SMTP_HOST=smtp.gmail.com
SMTP_USER=***
SMTP_PASSWORD=***

# Security
API_SECRET_KEY=***
JWT_SECRET=***
CORS_ORIGIN=https://haida.hiberus.com

# Feature Flags
ENABLE_VISUAL_REGRESSION=true
ENABLE_ACCESSIBILITY_CHECKS=true
```

### Frontend (.env)

```bash
# Public API
NEXT_PUBLIC_API_URL=https://api.haida.hiberus.com

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=***

# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_ID=***
```

---

## Backup & Recovery

### Automated Backups

```
Database Backups:
├─ Frequency: Hourly (production)
├─ Retention: 30 days
├─ Location: AWS S3 (geo-replicated)
├─ Type: Point-in-time recovery
└─ Access: DevOps team only

Application Backups:
├─ Docker images: Retained (10 latest versions)
├─ Code: GitHub repository
├─ Configuration: GitHub (encrypted)
└─ Frequency: On every deployment

Manual Backups:
├─ Database: pg_dump
├─ Redis: redis-cli --rdb
└─ Commands: Available in docs
```

### Recovery Procedures

```
Frontend (Vercel):
1. Click "Rollback" in Vercel dashboard (1 min)
2. Or: git revert && git push (5 min)

Backend (Railway):
1. View deployment history
2. Click "Redeploy" on previous version (2 min)
3. Or: git revert && git push (5 min)

Database:
1. Railway provides point-in-time recovery
2. Automated daily backups in S3
3. Manual restore: psql -f backup.sql (15 min)

Complete System:
1. Use git revert for code changes
2. Triggers full CI/CD pipeline
3. All services redeploy automatically
```

---

## Security

### Infrastructure Security

```
SSL/TLS:
├─ Certificates: Let's Encrypt
├─ Auto-renewal: Enabled
├─ Protocol: TLS 1.2+
└─ Grade: A+

Network:
├─ Database: Private network only
├─ Redis: Private network only
├─ API: Rate limiting enabled
└─ Frontend: Global CDN with DDoS protection

Authentication:
├─ API: JWT Bearer tokens
├─ Admin: 2FA required
├─ Secrets: GitHub encrypted
└─ Database: Username/password

Secrets Management:
├─ Storage: GitHub Secrets
├─ Rotation: 90 days
├─ Access: Team members only
└─ Audit: GitHub logs
```

### Compliance

```
Data Protection:
├─ Encryption: TLS in transit
├─ Database: No unencrypted storage
├─ Backups: Encrypted
└─ GDPR: Compliant

Audit:
├─ GitHub Actions logs
├─ Railway deployment logs
├─ Vercel deployment logs
└─ Application logs in Logtail
```

---

## Performance Optimization

### Frontend (Vercel)

```
- Next.js automatic code splitting
- Image optimization
- CSS minification
- Static generation where possible
- ISR (Incremental Static Regeneration)
- Global CDN with edge caching
```

### Backend (Railway)

```
- Connection pooling (PostgreSQL)
- Redis caching layer
- Async request handling
- Gzip compression
- Request timeout optimization
- Auto-scaling on Railway
```

### Database

```
- Query optimization
- Index creation
- Connection pooling
- Read replicas for scaling
- Hourly vacuuming
- Statistics updates
```

---

## Scripts Reference

### Main Scripts

```bash
./deploy.sh [environment]           # Full deployment
./deploy-backend.sh [environment]   # Backend only
./deploy-frontend.sh [environment]  # Frontend only
./init-devops.sh                    # Initialize DevOps setup
```

### Docker Commands

```bash
docker-compose up -d                # Start services
docker-compose down                 # Stop services
docker-compose logs -f              # View logs
docker-compose ps                   # Service status
docker-compose exec [service] bash  # Shell access
docker-compose restart              # Restart all
```

### Database Commands

```bash
# Connect
psql -h localhost -U haida_user -d haida_results

# Backup
pg_dump -h localhost -U haida_user haida_results > backup.sql

# Restore
psql -h localhost -U haida_user haida_results < backup.sql

# Migrations (backend)
alembic upgrade head    # Apply all
alembic downgrade -1    # Rollback one
alembic current         # Show current version
```

### Testing Commands

```bash
# Backend tests
pytest tests/ -v

# Frontend tests
npm test

# All tests
npm test && cd backend && pytest

# Coverage
pytest --cov=app --cov-report=html
```

---

## Troubleshooting

### Common Issues

```
Issue: Port already in use
Solution:
  lsof -i :[port]
  kill -9 [PID]

Issue: Database connection failed
Solution:
  docker-compose ps postgres
  docker-compose logs postgres
  docker-compose restart postgres

Issue: Deployment fails
Solution:
  Check logs: tail -f ./logs/deploy-*.log
  Verify tokens: env | grep -E "RAILWAY|VERCEL"
  Test connectivity: curl https://api.haida.hiberus.com

Issue: Tests failing
Solution:
  Run locally first: pytest tests/ -v
  Check database is clean
  Verify all services are running
```

---

## Documentation Files

```
├─ DEPLOYMENT.md              - Complete deployment guide
├─ DEVOPS-STACK.md           - This file (architecture overview)
├─ ENVIRONMENT-URLS.md       - URLs and access information
├─ .github/SECRETS.md        - GitHub Secrets setup
│
├─ backend/Dockerfile        - Backend container
├─ frontend/Dockerfile       - Frontend container
│
├─ docker-compose.yml        - Development configuration
├─ docker-compose.production.yml - Production configuration
│
├─ deploy.sh                 - Full deployment script
├─ deploy-backend.sh         - Backend deployment
├─ deploy-frontend.sh        - Frontend deployment
├─ init-devops.sh            - DevOps initialization
│
└─ .github/workflows/deploy.yml - CI/CD pipeline
```

---

## Getting Started

1. **Initial Setup**

   ```bash
   ./init-devops.sh
   ```

2. **Local Development**

   ```bash
   docker-compose up -d
   npm install && npm run dev
   ```

3. **Push Changes**

   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

4. **Monitor Deployment**
   - GitHub Actions: https://github.com/hiberus/haida/actions
   - Railway: https://railway.app/dashboard
   - Vercel: https://vercel.com/dashboard

5. **Access Application**
   - Frontend: https://haida.hiberus.com
   - API: https://api.haida.hiberus.com
   - Docs: https://api.haida.hiberus.com/docs

---

**Last Updated**: ++34662652300
**Version**: 1.0.0
**Maintained By**: DevOps Team (Hiberus)
