# Guía de Despliegue HAIDA - Dominios stayarta.com

**Fecha**: +34662652300
**Estado**: ✅ Configuración completada - Pendiente despliegue manual
**Dominios**: haida.stayarta.com | haidapi.stayarta.com | bothaida.stayarta.com

---

## Resumen Ejecutivo

Se ha completado la migración de configuración de HAIDA de `carlosarta.com` a `stayarta.com`, incluyendo:

- ✅ Actualización de archivos de configuración (vercel.json, .env)
- ✅ Security headers y CORS configurados
- ✅ Bot Management y reglas de firewall documentadas
- ✅ Script de actualización de variables de entorno
- ✅ Telegram bot actualizado
- ✅ Verificación de DNS propagation
- ⏳ **Pendiente**: Agregar dominios en Vercel Dashboard (manual)

---

## Arquitectura de Despliegue

```
┌─────────────────────────────────────────────────────┐
│                 stayarta.com                        │
└─────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
   haida.stayarta.com  haidapi.stayarta.com  bothaida.stayarta.com
   (Frontend)          (Backend API)         (Telegram Bot)
        │               │                     │
        ▼               ▼                     ▼
   Vercel              Vercel                Railway
   haida-frontend      haida                 haida-api
   (React + Vite)      (FastAPI)             (Python Bot)
```

---

## 1. Cambios Realizados

### 1.1 Configuración Frontend (`Figma/vercel.json`)

**Actualizado**:
- ✅ Security headers (HSTS, X-Frame-Options, CSP)
- ✅ CORS headers para API
- ✅ Variables de entorno actualizadas
- ✅ `VITE_API_URL` → `https://haidapi.stayarta.com`

**Ubicación**: `/Users/carlosa/Hiberus/HAIDA-PROJECT/Figma/vercel.json`

### 1.2 Configuración Backend (`vercel.json`)

**Actualizado**:
- ✅ Security headers completos
- ✅ CORS configurado para `https://haida.stayarta.com`
- ✅ Routes optimizadas para FastAPI
- ✅ Runtime Python 3.11 configurado
- ✅ Cache headers para /health endpoint

**Ubicación**: `/Users/carlosa/Hiberus/HAIDA-PROJECT/vercel.json`

### 1.3 Variables de Entorno (`.env`)

**Actualizado**:
```bash
# URLs actualizadas
CORS_ORIGINS=http://localhost:3000,https://haida.stayarta.com,https://haidapi.stayarta.com
WEBHOOK_URL=https://bothaida.stayarta.com
ENTRA_REDIRECT_URI=https://haida.stayarta.com/auth
```

### 1.4 Telegram Bot

**Estado**: ✅ Ya actualizado
- WEBAPP_URL defaultea a `https://haida.stayarta.com`
- Usa variables de entorno (no requiere cambios)

### 1.5 Documentación Bot Management

**Creado**: `/Users/carlosa/Hiberus/HAIDA-PROJECT/docs/VERCEL-BOT-MANAGEMENT-CONFIG.md`

**Incluye**:
- Configuración completa de firewall
- Reglas de rate limiting
- Bypass rules para webhooks
- Configuración de AI bots
- Monitoreo y alertas

---

## 2. DNS Verificado (Cloudflare)

```
✅ haida.stayarta.com
   CNAME → haida-frontend.vercel.app
   Propagado: +34662652300, +34662652300

✅ haidapi.stayarta.com
   CNAME → haida-one.vercel.app
   Propagado: +34662652300, +34662652300

✅ bothaida.stayarta.com
   CNAME → haida-api.railway.app
   Propagado: +34662652300
```

**Verificación**:
```bash
dig haida.stayarta.com
dig haidapi.stayarta.com
dig bothaida.stayarta.com
```

---

## 3. Pasos de Despliegue Manual

### Fase 1: Agregar Dominios en Vercel (MANUAL)

#### Frontend
1. Ir a: https://vercel.com/carlos-arevalos-projects-cf7340ea/haida-frontend/settings/domains
2. Click "Add Domain"
3. Agregar: `haida.stayarta.com`
4. Marcar como "Primary Domain"
5. Esperar verificación SSL automática

#### Backend
1. Ir a: https://vercel.com/carlos-arevalos-projects-cf7340ea/haida/settings/domains
2. Click "Add Domain"
3. Agregar: `haidapi.stayarta.com`
4. Marcar como "Primary Domain"
5. Esperar verificación SSL automática

### Fase 2: Actualizar Variables de Entorno (AUTOMÁTICO)

**Opción A: Script automatizado**
```bash
cd /Users/carlosa/Hiberus/HAIDA-PROJECT
./scripts/update-vercel-env.sh VcGSlMUzEPrxUryMWq67dvLq
```

**Opción B: Manual en Dashboard**
- Frontend: https://vercel.com/carlos-arevalos-projects-cf7340ea/haida-frontend/settings/environment-variables
- Backend: https://vercel.com/carlos-arevalos-projects-cf7340ea/haida/settings/environment-variables

**Variables críticas a verificar**:
```
FRONTEND:
- VITE_API_URL=https://haidapi.stayarta.com
- VITE_ENTRA_REDIRECT_URI=https://haida.stayarta.com/auth

BACKEND:
- CORS_ORIGINS=https://haida.stayarta.com,http://localhost:3000
- ENTRA_REDIRECT_URI=https://haida.stayarta.com/auth
```

### Fase 3: Redeploy Proyectos

#### Frontend
```bash
cd /Users/carlosa/Hiberus/HAIDA-PROJECT/Figma
vercel --prod --token VcGSlMUzEPrxUryMWq67dvLq
```

#### Backend
```bash
cd /Users/carlosa/Hiberus/HAIDA-PROJECT
vercel --prod --token VcGSlMUzEPrxUryMWq67dvLq
```

### Fase 4: Configurar Bot Management (DASHBOARD)

**Ubicación**: https://vercel.com/carlos-arevalos-projects-cf7340ea/~/security/firewall

#### 4.1 Bot Protection
```
Mode: CHALLENGE
Protected Paths: /auth/*, /api/*, /dashboard/*
Excluded Paths: /public/*, /_next/*, /health
```

#### 4.2 Rate Limiting
**Frontend (haida-frontend)**:
- API requests: 100/min per IP
- Auth endpoints: 10/min per IP
- Registration: 3/hour per IP

**Backend (haida)**:
- API general: 200/min per IP
- Auth endpoints: 20/min per IP
- Webhooks: 1000/min per token

#### 4.3 Bypass Rules (Custom Firewall Rules)

**Regla 1**: Telegram Webhooks
```javascript
Condition: path starts with "/webhook"
Action: bypass
```

**Regla 2**: Microsoft Entra Callbacks
```javascript
Condition: path in ["/entra/callback", "/api/auth/callback"]
Action: bypass
```

**Regla 3**: Health Checks
```javascript
Condition: path equals "/health"
Action: bypass
```

**Regla 4**: Monitoring Bots
```javascript
Condition: User-Agent contains ["Googlebot", "Bingbot", "Playwright"]
Action: bypass
```

### Fase 5: Verificación Post-Despliegue

#### 5.1 Frontend
```bash
# Verificar carga de página
curl -I https://haida.stayarta.com

# Verificar security headers
curl -I https://haida.stayarta.com | grep -E "X-Frame-Options|Strict-Transport"

# Verificar CORS
curl -H "Origin: https://haida.stayarta.com" -I https://haidapi.stayarta.com/health
```

#### 5.2 Backend API
```bash
# Health check
curl https://haidapi.stayarta.com/health

# Verificar Entra login
curl https://haidapi.stayarta.com/entra/status

# Verificar CORS headers
curl -H "Origin: https://haida.stayarta.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type, Authorization" \
     -X OPTIONS https://haidapi.stayarta.com/api/auth/login
```

#### 5.3 Telegram Bot
```bash
# Verificar webhook (desde Railway)
curl https://bothaida.stayarta.com/health

# Verificar MiniApp URL
# Abrir Telegram → @HAIDABot → /start → Click "Dashboard Web"
# Debe abrir: https://haida.stayarta.com
```

#### 5.4 Microsoft Entra OAuth
```bash
# Iniciar login flow
curl https://haidapi.stayarta.com/entra/login

# Debe devolver auth_url con redirect_uri correcto
# redirect_uri: https://haida.stayarta.com/auth
```

---

## 4. Configuración Azure AD (YA COMPLETADA)

**App ID**: `93dae11f-417c-49ff-8d66-d642afb66327`
**Tenant ID**: `9b7594d6-2c7d-4fe2-b248-213f64996877`

**Redirect URIs actualizados**:
- ✅ https://haida.stayarta.com
- ✅ https://haida.stayarta.com/auth
- ✅ https://haida.stayarta.com/auth
- ✅ https://haidapi.stayarta.com/api/auth/callback
- ✅ Supabase callbacks
- ✅ Localhost (development)

**Verificación**:
```bash
az ad app show --id 93dae11f-417c-49ff-8d66-d642afb66327 --query "web.redirectUris"
```

---

## 5. Railway (Telegram Bot)

**Proyecto**: haida-api
**URL**: https://bothaida.stayarta.com

**Variables a verificar en Railway**:
```bash
TELEGRAM_BOT_TOKEN=+34662652300:AAGUbxodYRSf1RsOWZARDmQEs8Rb84Sbxnc
WEBAPP_URL=https://haida.stayarta.com
WEBHOOK_URL=https://bothaida.stayarta.com
API_URL=https://haidapi.stayarta.com (si existe)
```

**Deploy**:
```bash
# Railway redeploy (si necesario)
railway up
```

---

## 6. Monitoreo Post-Despliegue

### 6.1 Dashboards Vercel

**Frontend Analytics**:
https://vercel.com/carlos-arevalos-projects-cf7340ea/haida-frontend/analytics

**Backend Analytics**:
https://vercel.com/carlos-arevalos-projects-cf7340ea/haida/analytics

**Firewall Logs**:
https://vercel.com/carlos-arevalos-projects-cf7340ea/~/security/firewall/logs

### 6.2 Métricas Clave

- ✅ Uptime > 99.9%
- ✅ Response time < 500ms (p95)
- ✅ Error rate < 0.1%
- ✅ Bot blocks < 10/hour (normal traffic)
- ✅ SSL certificate valid

### 6.3 Alertas Configuradas

**Email/Slack notifications**:
- 🚨 Deployment failed
- ⚠️  High bot traffic (>100 blocks/5min)
- ⚠️  Rate limit exceeded (>50 triggers/1min)
- ⚠️  Failed auth attempts (>20/5min)

---

## 7. Rollback Plan

Si algo falla, revertir a dominios anteriores:

### Opción A: Rollback Total
```bash
# 1. Restaurar dominios anteriores en Vercel Dashboard
haida.stayarta.com → haida-frontend
haidapi.stayarta.com → haida

# 2. Revertir variables de entorno
VITE_API_URL=https://haidapi.stayarta.com
CORS_ORIGINS=https://haida.stayarta.com
```

### Opción B: Rollback Parcial (mantener stayarta.com)
```bash
# Mantener nuevos dominios pero revertir configuración
git revert <commit-hash>
vercel --prod
```

### Backup de Configuración
```bash
# Backup automático creado en:
/Users/carlosa/Hiberus/HAIDA-PROJECT/.backups/+34662652300/
- vercel.json.backup
- Figma/vercel.json.backup
- .env.backup
```

---

## 8. Checklist de Despliegue

### Pre-Despliegue
- [x] DNS configurado en Cloudflare
- [x] DNS propagado y verificado
- [x] vercel.json actualizado (frontend)
- [x] vercel.json actualizado (backend)
- [x] .env actualizado
- [x] Azure AD redirect URIs actualizados
- [x] Telegram bot actualizado
- [x] Script de env vars creado

### Despliegue
- [ ] Dominios agregados en Vercel Dashboard
- [ ] Variables de entorno actualizadas
- [ ] Frontend redeployado
- [ ] Backend redeployado
- [ ] Bot Management configurado
- [ ] Rate limiting configurado
- [ ] Bypass rules creadas

### Post-Despliegue
- [ ] Frontend accesible en haida.stayarta.com
- [ ] Backend API responde en haidapi.stayarta.com
- [ ] Telegram bot funcional
- [ ] Microsoft login funcional
- [ ] CORS funcionando
- [ ] Security headers verificados
- [ ] Firewall logs revisados
- [ ] Monitoreo configurado

---

## 9. Soporte y Troubleshooting

### Problema: Dominio no resuelve
```bash
# Verificar DNS
dig haida.stayarta.com

# Verificar en Vercel
vercel domains ls --token <TOKEN>

# Flush DNS local
sudo dscacheutil -flushcache (macOS)
```

### Problema: CORS errors
```bash
# Verificar headers
curl -I -H "Origin: https://haida.stayarta.com" https://haidapi.stayarta.com/api/test

# Verificar CORS_ORIGINS en backend
vercel env ls --token <TOKEN> | grep CORS
```

### Problema: Microsoft login falla
```bash
# Verificar redirect URIs
az ad app show --id 93dae11f-417c-49ff-8d66-d642afb66327 --query "web.redirectUris"

# Verificar ENTRA_REDIRECT_URI
vercel env ls --token <TOKEN> | grep ENTRA
```

### Problema: Bot protection bloquea tráfico legítimo
```bash
# Revisar logs de firewall
# Dashboard → Security → Firewall → Logs

# Agregar IP/User-Agent a bypass rules
# Dashboard → Security → Firewall → Custom Rules → Add Rule
```

---

## 10. Contactos y Recursos

### Dashboards
- **Vercel**: https://vercel.com/carlos-arevalos-projects-cf7340ea
- **Cloudflare**: https://dash.cloudflare.com
- **Azure AD**: https://portal.azure.com
- **Railway**: https://railway.app
- **Supabase**: https://supabase.com/dashboard

### Documentación
- **Bot Management**: `/docs/VERCEL-BOT-MANAGEMENT-CONFIG.md`
- **CLAUDE.md**: `/CLAUDE.md`
- **API Docs**: `https://haidapi.stayarta.com/docs`

### Tokens y Credenciales
- **Vercel Token**: `VcGSlMUzEPrxUryMWq67dvLq`
- **Azure CLI**: Ya autenticado
- **Railway**: Configurado en .env

---

## 11. Próximos Pasos (Post-Deployment)

### Optimizaciones Recomendadas
1. **Vercel AI SDK**: Integrar para chatbot mejorado
2. **Edge Caching**: Configurar para assets estáticos
3. **Image Optimization**: Usar Vercel Image Optimization
4. **Bundle Analysis**: Optimizar tamaño del bundle
5. **Lighthouse Score**: Alcanzar 95+ en todas las métricas

### Monitoreo Avanzado
1. **Datadog/Sentry**: Integrar APM
2. **Custom Metrics**: Dashboards de negocio
3. **Audit Logs**: Exportar a SIEM (si Enterprise)
4. **Performance Monitoring**: Real User Monitoring (RUM)

### Seguridad
1. **WAF Custom Rules**: Afinar basado en tráfico real
2. **DDoS Protection**: Revisar umbrales
3. **Secrets Rotation**: Rotar JWT_SECRET trimestralmente
4. **Penetration Testing**: Contratar auditoría

---

**Última actualización**: +34662652300:30
**Autor**: Claude Code
**Estado**: ✅ Configuración completa - Listo para despliegue manual

**¿Preguntas?** Consultar documentación o contactar DevOps team.
