# HAIDA Vercel Deployment Guide

## Pre-Deployment Checklist

Este documento describe los pasos necesarios para deployar HAIDA a producción en Vercel.

### 1. Database Setup

#### 1.1 Ejecutar Migraciones
```bash
# Asegurate que DATABASE_URL está configurada con Supabase
export DATABASE_URL="postgresql://user:password@db.xxx.supabase.co:5432/postgres"

# Ejecutar migraciones para crear tablas de chat
bash database/setup-chat-tables.sh
```

#### 1.2 Tablas Creadas
- `chat_providers` - Configuración de proveedores AI (Perplexity, Copilot, etc.)
- `chat_threads` - Hilos de conversación
- `chat_messages` - Mensajes individuales
- `telegram_messages` - Mensajes recibidos del bot de Telegram
- `oauth_tokens` - Tokens de autenticación de proveedores externos

---

## 2. Environment Variables en Vercel

Configurar las siguientes variables de entorno en el dashboard de Vercel:

### 2.1 Variables Críticas (Obligatorias)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
JWT_SECRET=your-super-secret-random-key-min-32-chars
```

### 2.2 Variables de Entra/Microsoft (Obligatorias)
```
ENTRA_CLIENT_ID=your-azure-app-id
ENTRA_TENANT_ID=your-tenant-id
ENTRA_CLIENT_SECRET=your-client-secret
ENTRA_REDIRECT_URI=https://haida-one.vercel.app/auth/callback
```

### 2.3 Variables de Perplexity (Opcional pero Recomendado)
```
PERPLEXITY_API_KEY=ppl-xxxx-your-api-key
PERPLEXITY_BASE_URL=https://api.perplexity.ai
PERPLEXITY_MODEL=llama-2-70b-chat
PERPLEXITY_MAX_TOKENS=2048
```

### 2.4 Variables de Telegram (Opcional)
```
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz_1234567890
TELEGRAM_CHAT_ID=1234567890
```

### 2.5 Variables de Copilot/Direct Line (Opcional)
```
DIRECT_LINE_SECRET=your-direct-line-secret
DIRECT_LINE_ENDPOINT=https://directline.botframework.com/v3/directline
```

### 2.6 Configuración Adicional
```
NODE_ENV=production
APP_NAME=HAIDA
CORS_ORIGINS=https://haida-one.vercel.app,https://your-domain.com
RATE_LIMIT_PERPLEXITY_MAX=30
RATE_LIMIT_PERPLEXITY_WINDOW=60
RATE_LIMIT_CHAT_MAX=30
RATE_LIMIT_CHAT_WINDOW=60
LOG_LEVEL=INFO
```

---

## 3. Pasos de Deployment

### 3.1 Preparación
1. Asegurar que todos los cambios estén commiteados
```bash
git add .
git commit -m "Deploy: HAIDA v2.1.0 with Perplexity and Telegram integration"
```

2. Push a GitHub
```bash
git push origin main
```

### 3.2 Configurar Vercel
1. Ir a https://vercel.com/dashboard
2. Seleccionar el proyecto HAIDA
3. Ir a Settings → Environment Variables
4. Agregar todas las variables listadas arriba

### 3.3 Deploy
```bash
# Opción 1: Automático (Vercel se deployará automáticamente cuando se merge a main)
# - El deployment ocurre automáticamente

# Opción 2: Manual desde Vercel CLI
npm install -g vercel
vercel --prod
```

### 3.4 Verificar Deployment
```bash
# Comprobar que el API está respondiendo
curl https://haida-one.vercel.app/health

# Respuesta esperada:
# {
#   "status": "healthy",
#   "service": "HAIDA API",
#   "version": "2.0.0"
# }
```

---

## 4. Configuración de Integraciones

### 4.1 Telegram Bot Setup
1. Crear bot en Telegram (@BotFather)
2. Obtener el token del bot
3. Configurar webhook:
```bash
curl -X POST https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook \
  -d "url=https://haida-one.vercel.app/api/telegram/webhook"
```

4. Verificar webhook:
```bash
curl https://haida-one.vercel.app/api/telegram/webhook/info
```

### 4.2 Perplexity API
1. Ir a https://www.perplexity.ai/
2. Obtener API key en settings
3. Agregar variable de entorno `PERPLEXITY_API_KEY`
4. Verificar integracion:
```bash
curl https://haida-one.vercel.app/api/perplexity/status
```

### 4.3 Microsoft Entra/OAuth
1. Ir a Azure Portal → App registrations
2. Obtener Client ID y Secret
3. Configurar reply URLs:
   - `https://haida-one.vercel.app/auth/callback`
   - `https://haida-one.vercel.app/entra/callback`
4. Verificar configuración:
```bash
curl https://haida-one.vercel.app/api/entra/status
```

---

## 5. Monitoreo y Logs

### 5.1 Vercel Logs
```bash
# Ver logs en tiempo real
vercel logs --follow

# Ver logs de función específica
vercel logs --follow api
```

### 5.2 Supabase Logs
1. Ir a Supabase Dashboard
2. Seleccionar proyecto
3. Database → Query Logs
4. Ver logs de queries ejecutadas

### 5.3 Errores Comunes

| Error | Causa | Solución |
|---|---|---|
| `401 Unauthorized` | JWT_SECRET incorrecto | Verificar que JWT_SECRET en Vercel es idéntico al local |
| `502 Bad Gateway` | Falla de base de datos | Verificar DATABASE_URL y conectividad Supabase |
| `503 Service Unavailable` | API Perplexity no disponible | Verificar PERPLEXITY_API_KEY y rate limits |
| `Telegram webhook failed` | URL webhook incorrecta | Verificar que la URL es accesible públicamente |

---

## 6. Rollback

Si hay problemas en producción:

```bash
# Ver deployments anteriores
vercel list

# Revertir a deployment anterior
vercel promote <deployment-id>

# O desde GitHub: crear PR revert y merge a main
git revert <commit-hash>
git push origin main
```

---

## 7. Performance Optimization

### 7.1 Configurar CDN Cache
En `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

### 7.2 Monitorear Usage
- Ir a Vercel Dashboard → Settings → Usage
- Revisar CPU time, bandwidth, requests
- Configurar alertas si es necesario

---

## 8. Security Checklist

- ✅ No hay credenciales en `.env` commiteado
- ✅ JWT_SECRET es único y fuerte (min 32 caracteres)
- ✅ CORS está restringido a dominios permitidos
- ✅ Rate limiting configurado en endpoints públicos
- ✅ Database SSL enabled
- ✅ RLS (Row Level Security) habilitado en Supabase
- ✅ Logs sensitivos no exponen credenciales

---

## 9. Post-Deployment Testing

### 9.1 Smoke Tests
```bash
# Test autenticación
curl -X POST https://haida-one.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# Test Perplexity
curl https://haida-one.vercel.app/api/perplexity/status

# Test Telegram
curl https://haida-one.vercel.app/api/telegram/status

# Test Microsoft Entra
curl https://haida-one.vercel.app/api/entra/status
```

### 9.2 Health Checks
```bash
# Endpoint salud
curl https://haida-one.vercel.app/health

# Todos los routers cargados
curl https://haida-one.vercel.app/api/system/status
```

---

## 10. Support y Troubleshooting

### Contactos
- **DevOps:** devops@hiberus.com
- **QA Team:** qa-team@hiberus.com
- **Supabase Support:** https://supabase.com/support

### Recursos
- [Vercel Deployment Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

---

**Last Updated:** 2026-01-05
**Version:** 2.1.0
**Status:** Ready for Production
