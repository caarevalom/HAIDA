# HAIDA Environment URLs & Access

Complete guide to all HAIDA service URLs, credentials, and administrative access points.

## Development Environment

### Application URLs

| Service | URL | Port | Status |
|---------|-----|------|--------|
| **Frontend** | http://localhost:3000 | 3000 | Development |
| **Backend API** | http://localhost:3001 | 3001 | Development |
| **API Documentation** | http://localhost:3001/docs | 3001 | Swagger UI |
| **API Alternative Docs** | http://localhost:3001/redoc | 3001 | ReDoc |
| **Changedetection.io** | http://localhost:5000 | 5000 | Monitoring |
| **Selenium Hub** | http://localhost:4444 | 4444 | Browser Automation |
| **Allure Reports** | http://localhost:4040 | 4040 | Test Reports |

### Database Access

```
PostgreSQL
├─ Host: localhost
├─ Port: 5432
├─ Database: haida_results (or haida_test for testing)
├─ Username: haida_user
└─ Password: (see .env file)

Connection String:
postgresql://haida_user:password@localhost:5432/haida_results

Redis
├─ Host: localhost
├─ Port: 6379
├─ Database: 0
├─ Password: (optional, see .env)
└─ Command: redis-cli -h localhost -p 6379
```

### Development Credentials

```bash
# API Access (Bearer Token)
Authorization: Bearer <JWT_TOKEN>

# API Key (if configured)
X-API-Key: <API_KEY>

# Database Access
User: haida_user
Password: (from .env)

# Default Admin (if implemented)
Email: admin@haida.local
Password: (set during initialization)
```

---

## Staging Environment

### Application URLs

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | https://staging.haida.hiberus.com | Staging |
| **Backend API** | https://api-staging.haida.hiberus.com | Staging |
| **API Documentation** | https://api-staging.haida.hiberus.com/docs | Staging |
| **Allure Reports** | https://reports-staging.haida.hiberus.com | Staging |

### Staging Access

```bash
# Via VPN/IP Whitelist
- Staging accessible from office networks only
- Requires VPN connection for remote access

# Credentials
- Use staging service accounts (not production)
- Change passwords weekly
- Enable 2FA for all accounts

# Database Access
- Read-only replicas available
- Connection pooling: 20 max connections
- Backups: Daily at 2 AM UTC
```

---

## Production Environment

### Application URLs

| Service | URL | Status | SLA |
|---------|-----|--------|-----|
| **Frontend** | https://haida.hiberus.com | Production | 99.9% |
| **Backend API** | https://api.haida.hiberus.com | Production | 99.9% |
| **API Documentation** | https://api.haida.hiberus.com/docs | Production | - |
| **Status Dashboard** | https://status.haida.hiberus.com | Monitoring | - |

### Production Access

```bash
# Authentication Methods
1. SSO (Single Sign-On) / OAuth 2.0
2. JWT Bearer Tokens (API)
3. API Keys (for integrations)

# IP Restrictions
- Frontend: Global access
- API: IP whitelist for integrations
- Admin: Office networks only

# Multi-Factor Authentication
- Required for all admin access
- Time-based OTP (TOTP)
- SMS backup codes available
```

### Production Database

```
PostgreSQL Managed
├─ Host: prod-db.railway.app
├─ Port: 5432
├─ Database: haida_production
├─ SSL: Required (sslmode=require)
├─ Connection Pooling: PgBouncer
├─ Max Connections: 100
├─ Read Replicas: 2
└─ Automated Backups: Hourly

Connection String:
postgresql://haida_user:password@prod-db.railway.app:5432/haida_production?sslmode=require

Redis Managed
├─ Host: prod-redis.railway.app
├─ Port: 6379
├─ TLS: Enabled
├─ Memory: 512MB
├─ Replication: Enabled
└─ Persistence: AOF enabled
```

---

## Deployment Platforms

### Railway (Backend)

```
Platform:     https://railway.app
Dashboard:    https://railway.app/dashboard
Project:      HAIDA Backend
Environment:  Production
Status Page:  https://status.railway.app
Documentation: https://docs.railway.app

API Access:
├─ Endpoint: https://api.railway.app/graphql
├─ Authentication: API Token (RAILWAY_TOKEN)
└─ Documentation: https://docs.railway.app/reference
```

### Vercel (Frontend)

```
Platform:     https://vercel.com
Dashboard:    https://vercel.com/dashboard
Project:      haida-frontend
Organization: Hiberus
Status Page:  https://www.vercel-status.com
Documentation: https://vercel.com/docs

API Access:
├─ Endpoint: https://api.vercel.com
├─ Authentication: Bearer Token (VERCEL_TOKEN)
└─ Documentation: https://vercel.com/docs/api
```

---

## Monitoring & Administration

### Monitoring Dashboards

| Service | URL | Purpose | Access |
|---------|-----|---------|--------|
| **Sentry** | https://sentry.io | Error Tracking | Team members |
| **Logtail** | https://betterstack.com | Centralized Logging | DevOps team |
| **Uptime Monitoring** | https://uptimerobot.com | Health Checks | DevOps team |

### CI/CD Platforms

| Service | URL | Purpose |
|---------|-----|---------|
| **GitHub** | https://github.com/hiberus/haida | Source Code |
| **GitHub Actions** | https://github.com/hiberus/haida/actions | Workflows |
| **GitHub Packages** | https://github.com/hiberus/haida/packages | Container Registry |

### Communication Channels

```
Slack Integration
├─ Channel: #haida-deployments
├─ Notifications: Deployments, errors, alerts
├─ Webhook: Configured in GitHub Actions
└─ Access: DevOps + QA Team

Email Notifications
├─ Recipients: qa-team@hiberus.com
├─ Frequency: On failures only
└─ Configured via SMTP_TO env var
```

---

## API Endpoints Reference

### Base URLs

```
Development:  http://localhost:3001
Staging:      https://api-staging.haida.hiberus.com
Production:   https://api.haida.hiberus.com
```

### Core Endpoints

```bash
# Health & Status
GET  /health
GET  /status
GET  /version

# Documentation
GET  /docs              # Swagger UI
GET  /redoc             # ReDoc
GET  /openapi.json      # OpenAPI specification

# Authentication
POST /auth/login
POST /auth/refresh
POST /auth/logout
POST /auth/token

# Change Detection
GET  /changedetection/watches
POST /changedetection/watches
PUT  /changedetection/watches/{id}
DELETE /changedetection/watches/{id}

# Test Execution
POST /tests/execute
GET  /tests/results
GET  /tests/results/{id}

# Reports
GET  /reports/allure
GET  /reports/summary
```

---

## Service Dependencies

### Internal Services

```
Frontend (port 3000)
  └─> Backend (port 8000/3001)
      └─> PostgreSQL (port 5432)
      └─> Redis (port 6379)
      └─> Changedetection (port 5000)
          └─> Selenium Hub (port 4444)
```

### External Services

```
GitHub (github.com)
  ├─> Repository: hiberus/haida
  ├─> Workflows: CI/CD Pipeline
  └─> Container Registry: ghcr.io

Railway (railway.app)
  ├─> Backend Deployment
  └─> Database: PostgreSQL managed

Vercel (vercel.com)
  └─> Frontend Deployment

Slack (slack.com)
  └─> Notifications & Alerts

Sentry (sentry.io)
  └─> Error Tracking & Monitoring

Logtail (betterstack.com)
  └─> Centralized Logging
```

---

## Connectivity & Network

### Public Access

```
Frontend:  Publicly accessible
           CDN: Vercel Global Network
           SSL: *.haida.hiberus.com

Backend:   Rate-limited public access
           IP Whitelisting: Optional
           Authentication: Required
           SSL: *.haida.hiberus.com
```

### Private Access

```
Database:  Internal access only
           Private network: Railway/AWS
           Connection Pool: 20-100 connections
           Backups: Geo-replicated

Redis:     Internal access only
           Private network
           Persistence: Enabled
```

### VPN Access

```
Development:  Office network + VPN
Staging:      IP whitelist + VPN
Production:   Restricted (ops only)
Admin:        2FA + VPN required
```

---

## Backup & Disaster Recovery

### Backup Locations

```
Database Backups:
├─ Location: AWS S3 (us-east-1)
├─ Retention: 30 days (production), 7 days (staging)
├─ Frequency: Hourly (production)
└─ Access: DevOps team only

Application Backups:
├─ Location: GitHub Releases
├─ Format: Docker images tagged with versions
└─ Retention: Latest 10 versions

Configuration Backups:
├─ Location: GitHub (encrypted)
├─ Frequency: On-demand
└─ Access: Team leads only
```

### Recovery Procedures

```
Frontend Recovery:
  1. Vercel Rollback (1 minute)
  2. GitHub Actions Redeploy (5 minutes)
  3. Manual Docker rebuild (15 minutes)

Backend Recovery:
  1. Railway Rollback (2 minutes)
  2. Database Restore (varies)
  3. Manual redeployment (10 minutes)

Database Recovery:
  1. Point-in-time restore (15 minutes)
  2. From hourly backup (30 minutes)
  3. From daily backup (1 hour)
```

---

## Security & Compliance

### SSL/TLS Certificates

```
Primary Domain:     *.haida.hiberus.com
Certificate:        Let's Encrypt (Auto-renewal)
Expiration:         Valid 90 days
Renewal:            Automatic (Vercel/Railway)
Status:             A+ on SSL Labs
```

### Security Headers

```
Headers Configured:
├─ Content-Security-Policy
├─ X-Frame-Options: DENY
├─ X-Content-Type-Options: nosniff
├─ Strict-Transport-Security: max-age=31536000
└─ Referrer-Policy: strict-origin-when-cross-origin
```

### Rate Limiting

```
API Endpoints:
├─ Public endpoints:     100 req/min per IP
├─ Authenticated:        1000 req/min per user
├─ Admin endpoints:      10000 req/min per user
└─ Deployment webhooks:  No limit (IP whitelisted)
```

---

## Quick Reference

### Development Checklist

- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend API responds at http://localhost:3001/health
- [ ] PostgreSQL accepting connections
- [ ] Redis cache working
- [ ] Changedetection running
- [ ] Allure reports available at http://localhost:4040

### Production Checklist

- [ ] Frontend loads from https://haida.hiberus.com
- [ ] API responds from https://api.haida.hiberus.com/health
- [ ] SSL certificates valid
- [ ] Database connections pooling correctly
- [ ] Error tracking enabled (Sentry)
- [ ] Logs aggregating (Logtail)
- [ ] Monitoring alerts active
- [ ] Backups running successfully

---

**Last Updated**: 2024-12-18
**Version**: 1.0.0
**Maintained By**: DevOps Team
