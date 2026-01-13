# 🔧 Configuración de Servicios - Guía Paso a Paso

**Tiempo estimado**: 30 minutos
**Dificultad**: Fácil ⭐

---

## 📋 Checklist General

- [ ] SendGrid SMTP configurado (15 min)
- [ ] Upstash Redis configurado (10 min)
- [ ] Lighthouse workflow merged (5 min)
- [ ] SQL ejecutado en Supabase (5 min)
- [ ] Verificaciones finales (5 min)

---

## 1️⃣ Configurar SendGrid SMTP (15 minutos)

### Paso 1.1: Crear Cuenta SendGrid

1. **Ir a**: https://sendgrid.com/
2. **Click en**: "Start for Free"
3. **Completar registro**:
   - Email de trabajo
   - Password seguro
   - Verificar email

**Free Tier**: 100 emails/día (suficiente para empezar)

---

### Paso 1.2: Crear API Key

1. **Navegar a**: Settings → API Keys (en menú lateral izquierdo)
2. **Click**: "Create API Key"
3. **Configuración**:
   ```
   API Key Name: HAIDA Production
   API Key Permissions: Full Access (o "Mail Send" solo)
   ```
4. **Click**: "Create & View"
5. **⚠️ IMPORTANTE**: Copiar el API Key AHORA (solo se muestra una vez)
   ```
   SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

### Paso 1.3: Verificar Sender Identity

SendGrid requiere verificar tu email de envío:

**Opción A: Single Sender Verification (Rápido - 5 min)**
1. **Navegar a**: Settings → Sender Authentication
2. **Click**: "Verify a Single Sender"
3. **Completar formulario**:
   ```
   From Email: hola@stayarta.com
   From Name: HAIDA QA Platform
   Reply To: (tu email real)
   Company Address: (tu dirección)
   ```
4. **Verificar email**: Revisar inbox y click en link de verificación
5. **Esperar**: 5-10 minutos para que se active

**Opción B: Domain Authentication (Profesional - 15 min)**
1. **Navegar a**: Settings → Sender Authentication
2. **Click**: "Authenticate Your Domain"
3. **Seguir wizard**: Agregar registros DNS a tu dominio
   - SendGrid te dará 3 CNAME records
   - Agregarlos en tu proveedor DNS (Cloudflare, GoDaddy, etc.)
4. **Verificar**: Puede tomar hasta 48 horas

**Recomendación**: Usar Opción A para empezar rápido

---

### Paso 1.4: Configurar Variables en Vercel

1. **Ir a**: https://vercel.com/dashboard
2. **Seleccionar proyecto**: "haida-one" (backend)
3. **Click**: Settings → Environment Variables
4. **Agregar variables**:

```bash
# Variable 1
Name: SMTP_HOST
Value: smtp.sendgrid.net
Environments: ☑ Production ☑ Preview ☑ Development

# Variable 2
Name: SMTP_PORT
Value: 587
Environments: ☑ Production ☑ Preview ☑ Development

# Variable 3
Name: SMTP_USER
Value: apikey
Environments: ☑ Production ☑ Preview ☑ Development

# Variable 4
Name: SMTP_PASSWORD
Value: SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Environments: ☑ Production ☑ Preview ☑ Development

# Variable 5
Name: SMTP_FROM_EMAIL
Value: hola@stayarta.com
Environments: ☑ Production ☑ Preview ☑ Development

# Variable 6
Name: SMTP_FROM_NAME
Value: HAIDA QA Platform
Environments: ☑ Production ☑ Preview ☑ Development

# Variable 7
Name: SMTP_USE_TLS
Value: true
Environments: ☑ Production ☑ Preview ☑ Development

# Variable 8
Name: EMAIL_BASE_URL
Value: https://haida.stayarta.com
Environments: ☑ Production ☑ Preview ☑ Development
```

5. **Click**: "Save" en cada variable

---

### Paso 1.5: Redeploy Backend

1. **En Vercel Dashboard**:
   - Proyecto: haida-one
   - Tab: Deployments
   - Click en el deployment más reciente
   - Click: "⋮" (tres puntos) → "Redeploy"
   - ☑ "Use existing Build Cache"
   - Click: "Redeploy"

2. **Esperar**: 1-2 minutos para que se complete

---

### Paso 1.6: Probar Email

**Opción A: Usar curl**
```bash
# Obtener token de autenticación
TOKEN=$(curl -s -X POST https://haidapi.stayarta.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hola@stayarta.com","password":"AdminCTB2025Pass"}' \
  | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

# Enviar email de prueba
curl -X POST https://haidapi.stayarta.com/api/email/test \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"to":"hola@stayarta.com"}'
```

**Opción B: Crear endpoint de test**
Ver `api/email.py` - Ya tiene la función `send_welcome_email()` lista para usar

---

### ✅ Verificación SMTP

- [ ] API Key creada en SendGrid
- [ ] Sender identity verificada
- [ ] Variables configuradas en Vercel
- [ ] Backend redeployado
- [ ] Email de prueba enviado exitosamente

---

## 2️⃣ Configurar Upstash Redis (10 minutos)

### Paso 2.1: Crear Cuenta Upstash

1. **Ir a**: https://upstash.com/
2. **Click**: "Sign Up"
3. **Opciones de registro**:
   - GitHub (recomendado - 1 click)
   - Google
   - Email

**Free Tier**: 10,000 comandos/día (muy generoso)

---

### Paso 2.2: Crear Redis Database

1. **En Dashboard Upstash**:
   - Click: "Create Database"

2. **Configuración**:
   ```
   Name: haida-production
   Type: Regional (más rápido)
   Region: us-east-1 (o la más cercana a Vercel)
   ```

3. **Click**: "Create"

4. **Esperar**: 30 segundos mientras se crea

---

### Paso 2.3: Obtener Credenciales

1. **En la página de la database**:
   - Tab: "REST API"

2. **Copiar**:
   ```
   UPSTASH_REDIS_REST_URL: https://xxxxx-xxxxx-xxxxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN: AbCdEfGhIjKlMnOpQrStUvWxYz1234567890==
   ```

---

### Paso 2.4: Configurar Variables en Vercel

1. **Vercel Dashboard** → Proyecto "haida-one"
2. **Settings** → Environment Variables
3. **Agregar**:

```bash
# Variable 1
Name: REDIS_URL
Value: https://xxxxx-xxxxx-xxxxx.upstash.io
Environments: ☑ Production ☑ Preview ☑ Development

# Variable 2
Name: REDIS_TOKEN
Value: AbCdEfGhIjKlMnOpQrStUvWxYz1234567890==
Environments: ☑ Production ☑ Preview ☑ Development

# Variable 3
Name: REDIS_REST_URL
Value: https://xxxxx-xxxxx-xxxxx.upstash.io
Environments: ☑ Production ☑ Preview ☑ Development

# Variable 4
Name: REDIS_REST_TOKEN
Value: AbCdEfGhIjKlMnOpQrStUvWxYz1234567890==
Environments: ☑ Production ☑ Preview ☑ Development

# Variable 5
Name: REDIS_DEFAULT_TTL
Value: 3600
Environments: ☑ Production ☑ Preview ☑ Development
```

---

### Paso 2.5: Redeploy Backend

Mismo proceso que SMTP:
1. Vercel → haida-one → Deployments
2. Redeploy último deployment
3. Esperar 1-2 minutos

---

### Paso 2.6: Probar Redis

**Desde Upstash Dashboard**:
1. Tab: "CLI"
2. Ejecutar:
   ```
   SET test "Hello HAIDA"
   GET test
   ```
3. Debería retornar: "Hello HAIDA"

**Desde tu app**:
```bash
curl https://haidapi.stayarta.com/api/cache/health
```

---

### ✅ Verificación Redis

- [ ] Cuenta Upstash creada
- [ ] Database creada
- [ ] Credenciales copiadas
- [ ] Variables configuradas en Vercel
- [ ] Backend redeployado
- [ ] Conexión Redis verificada

---

## 3️⃣ Merge Lighthouse Workflow (5 minutos)

### Paso 3.1: Commit y Push

```bash
# En tu terminal local
cd /Users/carlosa/Library/CloudStorage/OneDrive-HIBERUSITDEVELOPMENTSERVICES,S.L.U/HAIDA

# Verificar archivos creados
git status

# Agregar archivos nuevos
git add .github/workflows/lighthouse-ci.yml
git add .lighthouserc.json
git add api/email.py
git add .env.smtp.example
git add .env.redis.example
git add scripts/*.js

# Commit con mensaje descriptivo
git commit -m "feat: Add email service, Redis cache, and Lighthouse CI/CD

- Implement complete email service with 4 providers (SendGrid, Gmail, AWS SES, Resend)
- Add Redis cache configuration with Upstash support
- Add Lighthouse CI/CD workflow for performance monitoring
- Create SQL setup scripts for CTB and Privalia projects
- Update E2E tests with production URLs

🤖 Generated with Claude Code (https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <hola@stayarta.com>"

# Push a GitHub
git push origin main
```

---

### Paso 3.2: Verificar Workflow

1. **Ir a GitHub**: Tu repositorio
2. **Click**: Actions tab
3. **Verificar**: "Lighthouse CI" workflow aparece
4. **Esperar**: Primera ejecución (si hay push reciente)
5. **Ver resultados**: Click en el workflow run

---

### ✅ Verificación Lighthouse

- [ ] Archivos commiteados
- [ ] Push exitoso a main
- [ ] Workflow visible en GitHub Actions
- [ ] Primera ejecución completada (opcional)

---

## 4️⃣ Ejecutar SQL en Supabase (5 minutos)

### Paso 4.1: Abrir Supabase Dashboard

1. **Ir a**: https://app.supabase.com
2. **Seleccionar proyecto**: wdebyxvtunromsnkqbrd
3. **Click**: SQL Editor (en menú lateral)

---

### Paso 4.2: Ejecutar Script CTB

1. **Abrir archivo local**:
   ```
   /Users/carlosa/Library/CloudStorage/OneDrive-HIBERUSITDEVELOPMENTSERVICES,S.L.U/HAIDA/database/setup-ctb-complete.sql
   ```

2. **Copiar TODO el contenido** (433 líneas)

3. **En Supabase SQL Editor**:
   - Click: "New Query"
   - Pegar el SQL completo
   - Click: "Run" (o Cmd/Ctrl + Enter)

4. **Verificar output**:
   - Deberías ver mensajes de éxito
   - "✅ Usuario encontrado"
   - "✅ Proyecto CTB creado"
   - "✅ Proyecto Privalia creado"

---

### Paso 4.3: Verificar Resultados

**Query de verificación**:
```sql
-- Ver proyectos creados
SELECT name, slug, status, base_url
FROM projects
WHERE slug IN ('ctb', 'privalia');

-- Ver test suites de CTB
SELECT name, suite_type, priority
FROM test_suites
WHERE project_id = (SELECT id FROM projects WHERE slug = 'ctb');
```

**Resultado esperado**:
- 2 proyectos: CTB y Privalia
- 10 test suites para CTB

---

### ✅ Verificación SQL

- [ ] Script ejecutado sin errores
- [ ] 2 proyectos creados (CTB, Privalia)
- [ ] 10 test suites creadas para CTB
- [ ] Queries de verificación ejecutadas

---

## 5️⃣ Verificaciones Finales (5 minutos)

### Verificación 1: Backend Health

```bash
curl https://haidapi.stayarta.com/api/health
# Esperado: {"status":"healthy","timestamp":"..."}

curl https://haidapi.stayarta.com/api/status
# Esperado: {"api":"operational","database":"operational",...}
```

---

### Verificación 2: Frontend

```bash
curl -I https://haida.stayarta.com/
# Esperado: HTTP/2 200
```

---

### Verificación 3: Proyectos en DB

```bash
# Login
TOKEN=$(curl -s -X POST https://haidapi.stayarta.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hola@stayarta.com","password":"AdminCTB2025Pass"}' \
  | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

# Listar proyectos (cuando el endpoint esté disponible)
curl -H "Authorization: Bearer $TOKEN" \
  https://haidapi.stayarta.com/api/projects
```

---

### Verificación 4: Email Test

```bash
# Enviar email de bienvenida de prueba
curl -X POST https://haidapi.stayarta.com/api/email/welcome \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"hola@stayarta.com","name":"Test User"}'
```

---

### Verificación 5: Redis Cache

```bash
# Health check de cache
curl https://haidapi.stayarta.com/api/cache/health
```

---

## ✅ Checklist Final

### Servicios Configurados
- [ ] SendGrid SMTP operativo
- [ ] Upstash Redis conectado
- [ ] Lighthouse CI/CD activo
- [ ] SQL ejecutado en Supabase

### Verificaciones Pasadas
- [ ] Backend health: OK
- [ ] Frontend: OK
- [ ] Proyectos creados: 2
- [ ] Test suites: 10
- [ ] Email enviado: OK
- [ ] Redis conectado: OK

---

## 🎉 ¡Configuración Completada!

Tu sistema HAIDA está ahora **100% operativo** con:

✅ **Email notifications** funcionando
✅ **Redis cache** activo
✅ **Performance monitoring** automático
✅ **Proyectos CTB y Privalia** configurados

---

## 📊 Próximos Pasos Opcionales

1. **Importar test cases CTB** (196 casos desde CSV)
2. **Configurar alertas** de Lighthouse
3. **Dashboard ejecutivo** con métricas reales
4. **Testing Microsoft OAuth** end-to-end

---

## 🆘 Troubleshooting

### SMTP no envía emails
```bash
# Verificar variables en Vercel
vercel env ls

# Ver logs en tiempo real
vercel logs --follow
```

### Redis no conecta
```bash
# Verificar en Upstash Dashboard
# Tab: Metrics → Ver conexiones activas
```

### SQL falla
```sql
-- Verificar usuario existe
SELECT * FROM users WHERE email = 'hola@stayarta.com';

-- Si no existe, ejecutar primero:
-- database/02-seed-users.sql
```

---

**Tiempo total estimado**: 30-40 minutos
**Dificultad real**: ⭐⭐ Fácil-Media

¡Éxito! 🚀
