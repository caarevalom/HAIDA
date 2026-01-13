# HAIDA Deployment Guide

Complete guide for deploying HAIDA across multiple environments.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Local Development](#local-development)
5. [Production Deployment](#production-deployment)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Health Checks](#health-checks)
8. [Monitoring & Logging](#monitoring--logging)
9. [Troubleshooting](#troubleshooting)
10. [Rollback Procedures](#rollback-procedures)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    HAIDA System Architecture                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend (Next.js)              Backend (FastAPI)           │
│  ┌──────────────────┐           ┌──────────────────┐        │
│  │  haida-frontend  │◄──────────┤  haida-backend   │        │
│  │  Port: 3000      │           │  Port: 8000      │        │
│  │  Vercel Deploy   │           │  Railway Deploy  │        │
│  └──────────────────┘           └──────────────────┘        │
│                                         ▲                    │
│         ┌─────────────────────────────┬─┴──────────────────┐ │
│         │                             │                    │ │
│    ┌────▼────────┐   ┌───────────────▼───┐  ┌──────────┐  │ │
│    │  PostgreSQL │   │     Redis Cache   │  │ Change   │  │ │
│    │  Port: 5432 │   │   Port: 6379      │  │ Detection│  │ │
│    │  DB Storage │   │  Session/Cache    │  │Port: 5000│  │ │
│    └─────────────┘   └───────────────────┘  └──────────┘  │ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Services

| Service         | Port      | Environment | Type       | Deployment |
| --------------- | --------- | ----------- | ---------- | ---------- |
| Frontend        | 3000      | Prod/Dev    | Next.js    | Vercel     |
| Backend         | 8000/3001 | Prod/Dev    | FastAPI    | Railway    |
| PostgreSQL      | 5432      | Both        | Database   | Docker     |
| Redis           | 6379      | Both        | Cache      | Docker     |
| Changedetection | 5000      | Dev         | Monitoring | Docker     |

---

## Prerequisites

### Required Tools

```bash
# Essential
docker >= 20.10
docker-compose >= 2.0
git >= 2.30
node >= 20
npm >= 10
python >= 3.11

# For production deployment
railway login        # Railway CLI for backend
vercel login        # Vercel CLI for frontend

# Optional but recommended
curl >= 7.68
postgresql-client   # For database operations
redis-cli          # For cache debugging
```

### Installation

#### macOS

```bash
brew install docker docker-compose node python@3.11 postgresql@15 redis
npm install -g @railway/cli vercel
```

#### Ubuntu/Debian

```bash
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
sudo apt-get install docker-compose nodejs python3.11 postgresql-client redis-tools
npm install -g @railway/cli vercel
```

#### Windows (WSL2)

```bash
# Use Windows Terminal with WSL2
wsl --install
# Then run Ubuntu commands above
```

---

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/hiberus/haida.git
cd haida
```

### 2. Configure Environment Variables

#### Development

```bash
# Copy example file
cp .env.example .env

# Edit with your values
nano .env  # or vim .env
```

#### Production

```bash
# Copy production template
cp .env.production.template .env.production

# Edit with production values
nano .env.production

# IMPORTANT: Never commit .env.production to git
echo ".env.production" >> .gitignore
```

### 3. Required Secrets

Generate secure random values:

```bash
# Database password
openssl rand -base64 32

# Redis password (optional)
openssl rand -base64 24

# API secret key
openssl rand -base64 48

# JWT secret
openssl rand -base64 64
```

### 4. GitHub Secrets Configuration

For CI/CD pipeline, configure these secrets in GitHub:

```
Settings > Secrets and variables > Actions

RAILWAY_TOKEN          # Railway deployment token
VERCEL_TOKEN          # Vercel deployment token
VERCEL_ORG_ID         # Vercel organization ID
VERCEL_PROJECT_ID     # Vercel project ID
SLACK_WEBHOOK         # For notifications
```

---

## Local Development

### Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start all services
docker-compose up -d

# 3. Wait for services to be healthy
docker-compose ps

# 4. View logs
docker-compose logs -f

# 5. Access services
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# Changedetection: http://localhost:5000
# Allure Reports: http://localhost:4040
```

### Backend Development

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Start production build
npm start
```

### Database Management

```bash
# Connect to PostgreSQL
psql -h localhost -U haida_user -d haida_results

# Run migrations
cd backend
alembic upgrade head

# Backup database
pg_dump -h localhost -U haida_user haida_results > backup.sql

# Restore database
psql -h localhost -U haida_user haida_results < backup.sql
```

### Redis Cache

```bash
# Connect to Redis CLI
redis-cli

# Check cache
redis-cli GET key-name

# Clear cache
redis-cli FLUSHALL

# Monitor activity
redis-cli MONITOR
```

---

## Production Deployment

### Full Deployment

```bash
# Single command deployment
./deploy.sh production

# This will:
# 1. Check all requirements
# 2. Build Docker images
# 3. Run tests
# 4. Deploy backend to Railway
# 5. Deploy frontend to Vercel
# 6. Verify deployments
# 7. Generate deployment report
```

### Backend Deployment (Railway)

```bash
# Manual deployment
./deploy-backend.sh production

# Or via Railway CLI
railway up

# View logs
railway logs -f

# View environment
railway environment

# Rollback
railway deploy --service=backend --environment=production --version=<previous-version>
```

### Frontend Deployment (Vercel)

```bash
# Manual deployment
./deploy-frontend.sh production

# Or via Vercel CLI
vercel deploy --prod

# View deployments
vercel list

# View logs
vercel logs

# Rollback
vercel rollback
```

### Docker Compose Production

```bash
# Start services with production config
docker-compose -f docker-compose.production.yml up -d

# Monitor
docker-compose -f docker-compose.production.yml ps
docker-compose -f docker-compose.production.yml logs -f

# Stop services
docker-compose -f docker-compose.production.yml down

# Clean up
docker-compose -f docker-compose.production.yml down -v
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

The pipeline is defined in `.github/workflows/deploy.yml` and includes:

#### 1. Test Job

- Runs on every push to main/develop
- Tests backend (pytest)
- Tests frontend (npm test)
- Uploads coverage reports

#### 2. Build Job

- Builds Docker images for backend and frontend
- Pushes to GitHub Container Registry
- Runs only on successful tests

#### 3. Deploy Jobs

- Deploy backend to Railway (main branch only)
- Deploy frontend to Vercel (main branch only)
- Parallel deployment for speed

#### 4. Notification Job

- Sends Slack notification on completion
- Reports success/failure status

### Trigger Deployments

```bash
# Automatic (on push to main)
git push origin main

# Manual trigger via GitHub CLI
gh workflow run deploy.yml -f environment=production

# View workflow runs
gh run list

# View specific run logs
gh run view <run-id> --log
```

---

## Health Checks

### Backend Health

```bash
# Development
curl http://localhost:3001/health

# Production
curl https://api.haida.hiberus.com/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-12-18T10:30:00Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "redis": "connected",
    "changedetection": "connected"
  }
}
```

### Frontend Health

```bash
# Development
curl http://localhost:3000/api/health

# Production
curl https://haida.hiberus.com/api/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-12-18T10:30:00Z"
}
```

### Database Health

```bash
# Docker Compose
docker-compose exec postgres pg_isready -U haida_user

# Direct connection
pg_isready -h localhost -U haida_user
```

### Redis Health

```bash
# Docker Compose
docker-compose exec redis redis-cli ping

# Direct connection
redis-cli -h localhost ping
```

### Full System Health Check

```bash
#!/bin/bash
echo "Backend: $(curl -s http://localhost:3001/health | jq .status)"
echo "Frontend: $(curl -s http://localhost:3000/api/health | jq .status)"
echo "Database: $(docker-compose exec -T postgres pg_isready -U haida_user)"
echo "Redis: $(docker-compose exec -T redis redis-cli ping)"
```

---

## Monitoring & Logging

### Docker Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail 100

# With timestamps
docker-compose logs -f --timestamps
```

### Application Logs

```bash
# Backend logs
tail -f ./logs/haida.log
tail -f ./logs/backend/*.log

# View with timestamps
grep "ERROR\|WARN" ./logs/haida.log | tail -20
```

### Database Logs

```bash
# PostgreSQL slow query log
docker-compose exec postgres cat /var/log/postgresql/postgresql.log

# Redis activity
redis-cli MONITOR
```

### Sentry Error Tracking

```bash
# Configure in .env
SENTRY_DSN=https://hola@stayarta.com/project-id

# View errors
https://sentry.io/organizations/your-org/issues/
```

### Logtail Centralized Logging

```bash
# Configure in .env
LOGTAIL_TOKEN=your-logtail-token

# View logs
https://betterstack.com/logs
```

---

## Troubleshooting

### Common Issues

#### Services Won't Start

```bash
# Check Docker is running
docker ps

# Check port conflicts
lsof -i :3000
lsof -i :8000
lsof -i :5432

# Kill process using port
kill -9 <PID>

# Check logs
docker-compose logs [service]
```

#### Database Connection Error

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Test connection
psql -h localhost -U haida_user -d haida_results

# Check credentials in .env
cat .env | grep DB_

# Restart database
docker-compose restart postgres
```

#### Redis Connection Error

```bash
# Check Redis is running
docker-compose ps redis

# Test connection
redis-cli -h localhost ping

# Clear cache
redis-cli FLUSHALL

# Restart Redis
docker-compose restart redis
```

#### Tests Failing

```bash
# Run with verbose output
pytest tests/ -v -s

# Run specific test
pytest tests/test_health.py -v

# Check test logs
cat ./test-results/test.log

# Run in Docker
docker-compose run --rm backend pytest tests/ -v
```

#### Deployment Fails

```bash
# Check logs
tail -f ./logs/deploy-*.log

# Verify environment variables
env | grep -E "RAILWAY|VERCEL|DATABASE"

# Test connectivity
curl https://api.haida.hiberus.com/health
curl https://haida.hiberus.com

# Manual rollback
git revert <commit-hash>
git push
```

---

## Rollback Procedures

### Railway Backend Rollback

```bash
# View deployment history
railway deployment history --service=backend

# Rollback to previous version
railway deploy --service=backend --version=<previous-id>

# Or via GitHub
git revert <commit-hash>
git push
# GitHub Actions will automatically deploy the reverted version
```

### Vercel Frontend Rollback

```bash
# View deployments
vercel list

# Rollback to previous deployment
vercel rollback

# Or specify version
vercel rollback <deployment-id>

# Or via GitHub
git revert <commit-hash>
git push
```

### Database Rollback

```bash
# Backup current database
pg_dump -h localhost -U haida_user haida_results > backup_$(date +%Y%m%d).sql

# Downgrade migrations
cd backend
alembic downgrade -1

# Restore if needed
psql -h localhost -U haida_user haida_results < backup.sql
```

---

## URLs & Access

### Development Environments

| Service         | URL                        | Auth       |
| --------------- | -------------------------- | ---------- |
| Frontend        | http://localhost:3000      | None       |
| Backend API     | http://localhost:3001      | API Key    |
| Backend Docs    | http://localhost:3001/docs | None       |
| Changedetection | http://localhost:5000      | None       |
| Allure Reports  | http://localhost:4040      | None       |
| PostgreSQL      | localhost:5432             | haida_user |
| Redis           | localhost:6379             | None       |

### Production Environments

| Service  | URL                                | Auth        |
| -------- | ---------------------------------- | ----------- |
| Frontend | https://haida.hiberus.com          | SSO/OAuth   |
| API      | https://api.haida.hiberus.com      | JWT/API Key |
| API Docs | https://api.haida.hiberus.com/docs | JWT         |

### Administrative Access

```
Railway Dashboard:      https://railway.app
Vercel Dashboard:       https://vercel.com/dashboard
GitHub Workflows:       https://github.com/hiberus/haida/actions
Sentry Monitoring:      https://sentry.io
Logtail Logs:           https://betterstack.com
```

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com)
- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

---

**Last Updated**: +34662652300
**Version**: 1.0.0
**Maintainer**: DevOps Team (Hiberus)
