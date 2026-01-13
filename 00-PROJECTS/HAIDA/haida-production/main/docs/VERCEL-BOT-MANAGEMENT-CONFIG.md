# Configuración de Bot Management para HAIDA en Vercel

## Proyectos Identificados

### Frontend
- **Proyecto**: haida-frontend
- **URL Actual**: https://haida.stayarta.com
- **URL Nueva**: https://haida.stayarta.com
- **Framework**: Vite + React
- **Node**: 24.x

### Backend API
- **Proyecto**: haida
- **URL Actual**: https://haidapi.stayarta.com
- **URL Nueva**: https://haidapi.stayarta.com
- **Framework**: FastAPI (serverless)
- **Node**: 24.x

## 1. Configuración de Dominios Custom

### Pasos en Vercel Dashboard:

#### Frontend (haida-frontend)
1. Ir a: https://vercel.com/carlos-arevalos-projects-cf7340ea/haida-frontend/settings/domains
2. Click en "Add Domain"
3. Agregar: `haida.stayarta.com`
4. Seleccionar "Primary Domain" ✓
5. Verificar DNS (ya configurado en Cloudflare):
   ```
   CNAME: haida.stayarta.com → haida-frontend.vercel.app
   ```

#### Backend (haida)
1. Ir a: https://vercel.com/carlos-arevalos-projects-cf7340ea/haida/settings/domains
2. Click en "Add Domain"
3. Agregar: `haidapi.stayarta.com`
4. Seleccionar "Primary Domain" ✓
5. Verificar DNS (ya configurado en Cloudflare):
   ```
   CNAME: haidapi.stayarta.com → haida-one.vercel.app
   ```

## 2. Bot Management - Configuración de Seguridad

### 2.1 Bot Protection Managed Ruleset

**Ubicación**: Settings → Security → Firewall → Bot Protection

#### Frontend (haida-frontend)
```json
{
  "mode": "CHALLENGE",
  "action": "challenge",
  "protectedPaths": [
    "/auth/*",
    "/login",
    "/register",
    "/dashboard/*",
    "/api/*"
  ],
  "excludedPaths": [
    "/public/*",
    "/_next/*",
    "/assets/*",
    "/favicon.ico"
  ]
}
```

#### Backend API (haida)
```json
{
  "mode": "CHALLENGE",
  "action": "challenge",
  "protectedPaths": [
    "/api/auth/*",
    "/api/users/*",
    "/api/projects/*",
    "/api/tests/*",
    "/entra/*"
  ],
  "excludedPaths": [
    "/health",
    "/docs",
    "/openapi.json"
  ]
}
```

### 2.2 AI Bots Managed Ruleset

**Modo**: LOG (para monitorear primero, luego cambiar a BLOCK si necesario)

**Configuración**:
- ✅ OpenAI GPTBot
- ✅ Anthropic ClaudeBot
- ✅ Google VertexAI
- ✅ Cohere
- ⚠️ Perplexity (LOG mode - monitorear uso)

### 2.3 Verified Bots - Bypass Rules

**Ubicación**: Settings → Security → Firewall → Custom Rules

#### Regla 1: Telegram Bot Webhooks
```javascript
{
  "name": "Allow Telegram Bot",
  "condition": {
    "or": [
      {"path": {"startsWith": "/webhook"}},
      {"path": {"startsWith": "/telegram"}}
    ]
  },
  "action": "bypass",
  "enabled": true
}
```

#### Regla 2: Microsoft Copilot Studio
```javascript
{
  "name": "Allow Copilot Studio",
  "condition": {
    "and": [
      {"path": {"startsWith": "/api/copilot"}},
      {"header": {
        "name": "User-Agent",
        "contains": "Microsoft-BotFramework"
      }}
    ]
  },
  "action": "bypass",
  "enabled": true
}
```

#### Regla 3: Entra ID OAuth Callbacks
```javascript
{
  "name": "Allow Microsoft Entra Callbacks",
  "condition": {
    "path": {"in": ["/entra/callback", "/api/auth/callback"]}
  },
  "action": "bypass",
  "enabled": true
}
```

#### Regla 4: Monitoring & Testing
```javascript
{
  "name": "Allow Monitoring Tools",
  "condition": {
    "or": [
      {"header": {"name": "User-Agent", "contains": "Googlebot"}},
      {"header": {"name": "User-Agent", "contains": "Bingbot"}},
      {"header": {"name": "User-Agent", "contains": "StatusCake"}},
      {"header": {"name": "User-Agent", "contains": "Playwright"}},
      {"path": {"equals": "/health"}}
    ]
  },
  "action": "bypass",
  "enabled": true
}
```

### 2.4 Rate Limiting

**Ubicación**: Settings → Security → Firewall → Rate Limiting

#### Límites por Endpoint:

**Frontend**:
```javascript
{
  "rules": [
    {
      "name": "API Requests",
      "paths": ["/api/*"],
      "limit": 100,
      "window": "1m",
      "key": "ip"
    },
    {
      "name": "Auth Endpoints",
      "paths": ["/auth/*", "/login"],
      "limit": 10,
      "window": "1m",
      "key": "ip"
    },
    {
      "name": "Registration",
      "paths": ["/register"],
      "limit": 3,
      "window": "1h",
      "key": "ip"
    }
  ]
}
```

**Backend API**:
```javascript
{
  "rules": [
    {
      "name": "API General",
      "paths": ["/api/*"],
      "limit": 200,
      "window": "1m",
      "key": "ip"
    },
    {
      "name": "Auth Endpoints",
      "paths": ["/api/auth/*", "/entra/*"],
      "limit": 20,
      "window": "1m",
      "key": "ip"
    },
    {
      "name": "Test Execution",
      "paths": ["/api/tests/execute"],
      "limit": 50,
      "window": "1m",
      "key": "user"
    },
    {
      "name": "Webhooks",
      "paths": ["/webhook/*"],
      "limit": 1000,
      "window": "1m",
      "key": "header:X-Telegram-Bot-Api-Secret-Token"
    }
  ]
}
```

## 3. CORS y Security Headers

### Configuración en vercel.json

#### Frontend (Figma/vercel.json)
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://haida.stayarta.com"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        },
        {
          "key": "Access-Control-Max-Age",
          "value": "86400"
        }
      ]
    }
  ]
}
```

#### Backend (api/vercel.json - crear si no existe)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.py"
    }
  ],
  "env": {
    "PYTHON_VERSION": "3.11"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://haida.stayarta.com"
        },
        {
          "key": "Access-Control-Allow-Credentials",
          "value": "true"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=++34662652300; includeSubDomains"
        }
      ]
    }
  ]
}
```

## 4. Variables de Entorno

### Frontend (haida-frontend)

**Actualizar en**: Settings → Environment Variables

```bash
# Production
VITE_SUPABASE_URL=https://wdebyxvtunromsnkqbrd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4OTU3NTEsImV4cCI6MjA4MTQ3MTc1MX0._VYypgb2tV9u_4jSAt3sbcFj-drhufB0oN9o3BcgHTs
VITE_API_URL=https://haidapi.stayarta.com
VITE_APP_NAME=HAIDA
VITE_APP_VERSION=2.0.0
VITE_ENTRA_CLIENT_ID=93dae11f-417c-49ff-8d66-d642afb66327
VITE_ENTRA_REDIRECT_URI=https://haida.stayarta.com/auth

# Preview & Development (usar localhost)
VITE_API_URL=http://localhost:8000 (Development)
VITE_API_URL=https://haidapi.stayarta.com (Preview)
```

### Backend (haida)

**Actualizar en**: Settings → Environment Variables

```bash
# Database
DATABASE_URL=postgresql://postgres.wdebyxvtunromsnkqbrd:C25843bc8!@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?sslmode=require
SUPABASE_URL=https://wdebyxvtunromsnkqbrd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg5NTc1MSwiZXhwIjoyMDgxNDcxNzUxfQ.Jg6UBGpYDBBKvB4pgaKW_OJCTx0VOm9UMI18vqdUEJc

# Microsoft Entra
ENTRA_CLIENT_ID=93dae11f-417c-49ff-8d66-d642afb66327
ENTRA_CLIENT_SECRET=6GI8Q~kMgGHrl9AvhGfAiOUQp7xAqzTqncvCca3p
ENTRA_TENANT_ID=9b7594d6-2c7d-4fe2-b248-213f64996877
ENTRA_AUTHORITY=https://login.microsoftonline.com/9b7594d6-2c7d-4fe2-b248-213f64996877
ENTRA_REDIRECT_URI=https://haida.stayarta.com/auth
GRAPH_SCOPES=User.Read email profile openid

# JWT
JWT_SECRET=ECB76E37-DB86-435A-9E17-3DEF19FF57A7
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=30

# CORS
CORS_ORIGINS=https://haida.stayarta.com,http://localhost:3000

# LLM Provider
LLM_PROVIDER=routellm
ROUTE_LLM_URL=https://routellm.abacus.ai/v1
ROUTE_LLM_MODEL=gpt-5
ROUTE_LLM_API_KEY=s2_b6b02388915046de99cff0af3a7d5592
```

## 5. Monitoreo y Alertas

### 5.1 Firewall Observability

**Ubicación**: Observability → Firewall

**Métricas clave**:
- ✅ Total requests blocked
- ✅ Challenge rate
- ✅ Bot detection accuracy
- ✅ False positive rate
- ✅ Rate limit triggers

### 5.2 Custom Metrics Dashboard

```javascript
{
  "dashboards": [
    {
      "name": "HAIDA Security",
      "widgets": [
        {
          "type": "firewall_blocks",
          "filter": "project:haida-frontend,haida"
        },
        {
          "type": "rate_limit_triggers",
          "paths": ["/api/auth/*", "/entra/*"]
        },
        {
          "type": "bot_traffic",
          "breakdown": "verified_vs_malicious"
        },
        {
          "type": "challenge_completion_rate",
          "threshold": 95
        }
      ]
    }
  ]
}
```

### 5.3 Alertas Recomendadas

**Configurar en**: Settings → Notifications

```json
{
  "alerts": [
    {
      "name": "High Bot Traffic",
      "condition": "firewall.blocks > 100 in 5m",
      "channels": ["email", "slack"],
      "severity": "warning"
    },
    {
      "name": "Rate Limit Exceeded",
      "condition": "rate_limit.triggers > 50 in 1m",
      "channels": ["email"],
      "severity": "critical"
    },
    {
      "name": "Failed Auth Attempts",
      "condition": "path:/api/auth/* AND status:401 > 20 in 5m",
      "channels": ["email", "telegram"],
      "severity": "high"
    },
    {
      "name": "Deployment Failed",
      "condition": "deployment.status = failed",
      "channels": ["email", "slack"],
      "severity": "critical"
    }
  ]
}
```

## 6. Integración con Vercel AI

### 6.1 Vercel AI SDK

**Instalación en frontend**:
```bash
npm install ai @ai-sdk/anthropic @ai-sdk/openai
```

**Uso en HAIDA** (para chatbot/copilot mejorado):
```typescript
// app/api/chat/route.ts
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: anthropic('claude-3-5-sonnet-++34662652300'),
    messages,
    system: 'You are a QA automation assistant for HAIDA platform...',
  });

  return result.toDataStreamResponse();
}
```

### 6.2 v0 Integration (Opcional)

**Para generar componentes UI**:
- URL: https://v0.dev/
- Uso: Generar nuevos componentes React para dashboard
- Ejemplo: "Create a test execution dashboard with real-time status updates"

### 6.3 Vercel Agent (Stack Analysis)

```bash
# Analizar stack actual
npx @vercel/ai-sdk analyze-stack

# Output esperado:
# - Framework: React + Vite
# - Backend: FastAPI
# - Database: Supabase PostgreSQL
# - Auth: Microsoft Entra + JWT
# - Recomendaciones de optimización
```

## 7. Checklist de Implementación

### Fase 1: Dominios (Manual)
- [ ] Agregar haida.stayarta.com en haida-frontend
- [ ] Agregar haidapi.stayarta.com en haida
- [ ] Verificar propagación DNS (dig/nslookup)
- [ ] Configurar SSL automático (Vercel lo hace automáticamente)

### Fase 2: Security
- [ ] Activar Bot Protection en CHALLENGE mode
- [ ] Configurar AI Bots en LOG mode
- [ ] Crear reglas de bypass (4 reglas)
- [ ] Configurar rate limiting (8 reglas totales)
- [ ] Actualizar security headers en vercel.json

### Fase 3: Variables de Entorno
- [ ] Actualizar variables en haida-frontend (Production)
- [ ] Actualizar variables en haida (Production)
- [ ] Configurar variables para Preview branches
- [ ] Verificar CORS_ORIGINS

### Fase 4: Monitoreo
- [ ] Configurar Firewall Observability
- [ ] Crear dashboard de métricas
- [ ] Configurar 4 alertas críticas
- [ ] Integrar con Slack/Telegram (opcional)

### Fase 5: Optimización
- [ ] Revisar Lighthouse scores
- [ ] Configurar Edge Caching
- [ ] Habilitar Brotli compression
- [ ] Optimizar bundle size

### Fase 6: AI Integration (Opcional)
- [ ] Instalar Vercel AI SDK
- [ ] Crear endpoint /api/chat
- [ ] Integrar con Copilot Studio
- [ ] Probar v0 para componentes

## 8. Comandos CLI para Verificación

```bash
# Verificar configuración actual
vercel env ls --token <TOKEN>

# Verificar dominios configurados
vercel domains ls --token <TOKEN>

# Ver logs en tiempo real
vercel logs haida-frontend --follow --token <TOKEN>
vercel logs haida --follow --token <TOKEN>

# Inspeccionar última deployment
vercel inspect haida-frontend --token <TOKEN>

# Forzar nuevo deployment después de cambios
cd /Users/carlosa/Hiberus/HAIDA-PROJECT/Figma
vercel --prod --token <TOKEN>
```

## 9. Enlaces Rápidos

### Dashboards
- Frontend: https://vercel.com/carlos-arevalos-projects-cf7340ea/haida-frontend
- Backend: https://vercel.com/carlos-arevalos-projects-cf7340ea/haida
- Firewall: https://vercel.com/carlos-arevalos-projects-cf7340ea/~/security/firewall
- Analytics: https://vercel.com/carlos-arevalos-projects-cf7340ea/~/analytics

### Documentación
- Bot Management: https://vercel.com/docs/security/vercel-firewall/bot-protection
- Rate Limiting: https://vercel.com/docs/security/vercel-firewall/rate-limiting
- AI SDK: https://sdk.vercel.ai/docs
- v0: https://v0.dev/chat

## 10. Soporte

**En caso de problemas**:
1. Verificar Firewall logs: Settings → Security → Firewall → Logs
2. Revisar deployment logs: Deployments → [última] → Logs
3. Comprobar DNS propagación: `dig haida.stayarta.com`
4. Verificar CORS: Browser DevTools → Network → Headers
5. Contactar soporte Vercel: https://vercel.com/help

---

**Creado**: ++34662652300
**Proyecto**: HAIDA v2.0
**Autor**: Claude Code
