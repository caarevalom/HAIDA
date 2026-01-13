# 🚀 GUÍA DE OPERACIONALIZACIÓN - HAIDA

**Estado**: Ready for Deployment
**Versión**: 1.0
**Fecha**: 10 de Enero 2026

---

## 📋 ÍNDICE

1. [Pre-requisitos](#pre-requisitos)
2. [Setup del Entorno](#setup-del-entorno)
3. [Configuración de Servicios](#configuración-de-servicios)
4. [Instalación de Dependencias](#instalación-de-dependencias)
5. [Inicialización de Base de Datos](#inicialización-de-base-de-datos)
6. [Verificación de Componentes](#verificación-de-componentes)
7. [Deployment](#deployment)
8. [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)

---

## 📋 PRE-REQUISITOS

### Herramientas Necesarias

```bash
# Node.js y npm (para frontend)
node --version  # v18+
npm --version   # v9+

# Python (para backend)
python3 --version  # v3.9+

# Docker (para desarrollo local)
docker --version
docker-compose --version

# Git (control de versiones)
git --version

# Vercel CLI (para deployment)
vercel --version
```

### Credenciales Necesarias

- [ ] Supabase API credentials (ANON_KEY, SERVICE_ROLE_KEY)
- [ ] Vercel project settings
- [ ] Azure Entra (Microsoft) OAuth credentials
- [ ] Jira API token
- [ ] Slack webhook (si aplica)
- [ ] Figma API token

---

## ⚙️ SETUP DEL ENTORNO

### Paso 1: Seleccionar Rama de Trabajo

```bash
# Para DESARROLLO (recomendado para testing)
cd /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev

# Para PRODUCCIÓN (usar con cuidado)
cd /Users/carlosa/00-PROJECTS/HAIDA/haida-production/main
```

### Paso 2: Crear Archivos .env

**Backend (.env)**:
```bash
# Copiar template
cp .env.example .env

# Editar con valores reales
nano .env
```

**Variables Requeridas**:
```
# Database
DATABASE_URL=postgresql://user:password@host:5432/haida
SUPABASE_URL=https://project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Authentication
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=86400

# Azure Entra OAuth
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_TENANT_ID=your-tenant-id

# Vercel
VERCEL_TOKEN=your-vercel-token
VERCEL_PROJECT_ID=your-project-id

# Redis (opcional)
REDIS_URL=redis://localhost:6379

# SMTP (para emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=hola@stayarta.com
SMTP_PASSWORD=your-app-password

# API Configuration
API_PORT=8000
API_HOST=0.0.0.0
DEBUG=false
```

**Frontend (.env.local)**:
```bash
# Copiar template
cd Figma
cp .env.example .env.local

# Editar con valores reales
nano .env.local
```

**Variables Requeridas**:
```
REACT_APP_SUPABASE_URL=https://project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REACT_APP_API_URL=http://localhost:8000
REACT_APP_JWT_SECRET=your-secret-key
```

### Paso 3: Crear Archivo .env.local para Chat SDK

```bash
cd chat-sdk
cp .env.example .env.local
nano .env.local
```

---

## 🔌 CONFIGURACIÓN DE SERVICIOS

### Supabase Setup

```bash
# 1. Crear proyecto en Supabase (https://supabase.com)
# 2. Obtener credenciales
# 3. Guardar en archivo .env

# 4. Ejecutar schema inicial
psql "$DATABASE_URL" < database/01-schema-haida.sql

# 5. Insertar datos de test (SOLO en desarrollo)
psql "$DATABASE_URL" < database/02-test-data.sql

# 6. Ejecutar migraciones
psql "$DATABASE_URL" < database/03-migration-add-full-name.sql
```

### Azure Entra OAuth Setup

```bash
# 1. Ir a Azure Portal (https://portal.azure.com)
# 2. Crear App Registration
# 3. Configurar Redirect URIs:
#    - Desarrollo: http://localhost:8000/auth/callback
#    - Producción: https://haida.stayarta.com/auth/callback
# 4. Crear Client Secret
# 5. Guardar en .env
```

### Vercel Configuration

```bash
# 1. Verificar vercel.json existe
cat vercel.json

# 2. Asegurarse que tiene:
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "outputDirectory": ".next"
}

# 3. Configurar environment variables en Vercel dashboard
# Variables: DATABASE_URL, SUPABASE_*, AZURE_*
```

---

## 📦 INSTALACIÓN DE DEPENDENCIAS

### Backend (Python/FastAPI)

```bash
# Crear virtual environment
python3 -m venv venv
source venv/bin/activate  # En macOS/Linux
# o venv\Scripts\activate (en Windows)

# Instalar dependencias
pip install -r requirements.txt

# Verificar instalación
python -c "import fastapi; print(fastapi.__version__)"
```

### Frontend (Node.js/React)

```bash
cd Figma

# Instalar dependencias
npm install

# Verificar instalación
npm list react
```

### Chat SDK

```bash
cd chat-sdk

# Instalar dependencias
npm install

# Verificar
npm list
```

### Raíz del Proyecto

```bash
cd ..

# Instalar dependencias
npm install

# Verificar
npm list
```

---

## 🗄️ INICIALIZACIÓN DE BASE DE DATOS

### Crear Base de Datos

```bash
# Si no existe, crear en Supabase
# 1. Ir a https://supabase.com
# 2. Crear nuevo proyecto
# 3. Seleccionar región más cercana
# 4. Esperar a que esté listo (5-10 minutos)
```

### Crear Esquema

```bash
# Método 1: Usando psql directamente
psql $DATABASE_URL < database/01-schema-haida.sql

# Método 2: Usando script Python
python apply-schema.py

# Método 3: Usando script PowerShell
pwsh apply-schema.ps1
```

### Insertar Datos de Prueba

```bash
# SOLO en desarrollo
psql $DATABASE_URL < database/02-test-data.sql

# Usuarios de prueba creados:
# - hola@stayarta.com / password123
# - hola@stayarta.com / password123
# - hola@stayarta.com / password123
```

### Ejecutar Migraciones

```bash
# Agregar campos nuevos, actualizar schema, etc.
psql $DATABASE_URL < database/03-migration-add-full-name.sql
```

### Verificar Base de Datos

```bash
# Conectar a Supabase SQL Editor
# 1. Ir a Supabase dashboard
# 2. Seleccionar proyecto
# 3. SQL Editor
# 4. Ejecutar queries:

SELECT table_name FROM information_schema.tables;
SELECT * FROM users LIMIT 5;
SELECT * FROM projects LIMIT 5;
```

---

## ✅ VERIFICACIÓN DE COMPONENTES

### Backend Verification

```bash
# 1. Verificar que app/main.py existe
ls -la app/main.py

# 2. Verificar que api/index.py existe
ls -la api/index.py

# 3. Verificar structure
python app/main.py --help  # Si tiene CLI

# 4. Ejecutar localmente
python -m uvicorn app.main:app --reload
# Debería estar en http://localhost:8000

# 5. Verificar health check
curl http://localhost:8000/health
```

### Frontend Verification

```bash
# 1. Ir a directorio frontend
cd Figma

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Debería estar en http://localhost:3000

# 4. Verificar que carga sin errores
curl http://localhost:3000
```

### Database Verification

```bash
# 1. Verificar conexión
psql $DATABASE_URL -c "SELECT version();"

# 2. Listar tablas
psql $DATABASE_URL -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public';"

# 3. Contar registros
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

### API Verification

```bash
# 1. Listar endpoints
curl http://localhost:8000/docs  # Swagger UI

# 2. Probar endpoint de salud
curl http://localhost:8000/health

# 3. Probar autenticación
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hola@stayarta.com","password":"password"}'

# 4. Probar con token
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/projects
```

---

## 🚀 DEPLOYMENT

### Deployment a Vercel (Desarrollo)

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login a Vercel
vercel login

# 3. Link proyecto
vercel link

# 4. Deployment
vercel deploy --prod

# 5. Verificar
# El proyecto estará en: https://[project].vercel.app
```

### Deployment Manual (Local)

```bash
# 1. Build frontend
cd Figma
npm run build

# 2. Build backend (si aplica)
cd ../
npm run build

# 3. Start production
npm run start
```

### Deployment con Docker

```bash
# 1. Build imagen
docker build -t haida:latest .

# 2. Ejecutar container
docker run -p 8000:8000 \
  -e DATABASE_URL=$DATABASE_URL \
  -e SUPABASE_URL=$SUPABASE_URL \
  -e SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY \
  haida:latest

# 3. Verificar
curl http://localhost:8000/health
```

### Deployment con Docker Compose

```bash
# 1. Editar docker-compose.yml con valores reales
nano docker-compose.yml

# 2. Start services
docker-compose up -d

# 3. Logs
docker-compose logs -f

# 4. Stop
docker-compose down
```

---

## 🔍 MONITOREO Y MANTENIMIENTO

### Logs y Debugging

```bash
# Backend logs
tail -f app.log

# Frontend logs (en browser console)
console.log()

# Docker logs
docker-compose logs -f [service-name]

# Vercel logs
vercel logs
```

### Health Checks

```bash
# Crear script de health check
cat > check-health.sh << 'EOF'
#!/bin/bash

echo "Checking API..."
curl -s http://localhost:8000/health

echo "Checking Database..."
psql $DATABASE_URL -c "SELECT 1;"

echo "Checking Frontend..."
curl -s http://localhost:3000 | head -c 100

echo "✓ All checks passed"
EOF

chmod +x check-health.sh
./check-health.sh
```

### Monitoreo Continuo

```bash
# Usar script de monitoreo
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/consolidation/monitor-claude-config.sh --daemon

# Ver status
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/consolidation/monitor-claude-config.sh --status

# Ver alertas
tail -f ~/.claude-monitor/alerts.log
```

### Validación de Seguridad

```bash
# Ejecutar validación
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/consolidation/validate-claude-config.sh

# Verificar que no hay secretos en git
bash /Users/carlosa/.validate-no-secrets $(pwd)
```

---

## 🎯 CHECKLIST DE OPERACIONALIZACIÓN

### Antes de Deploy

- [ ] Archivo `.env` creado con valores reales
- [ ] Base de datos creada y schema aplicado
- [ ] Dependencias instaladas (npm install, pip install)
- [ ] Backend verifica sin errores
- [ ] Frontend compila sin errores
- [ ] Tests pasan localmente
- [ ] Variables de Supabase verificadas
- [ ] Azure OAuth configurado
- [ ] Vercel project vinculado

### Durante Deploy

- [ ] Enviroment variables en Vercel configuradas
- [ ] Build command funciona (vercel deploy --prod)
- [ ] No hay errores en deploy logs
- [ ] API responde desde Vercel URL
- [ ] Frontend carga desde Vercel URL
- [ ] Database connectivity verified

### Después de Deploy

- [ ] Health check pasa
- [ ] Login funciona
- [ ] Crear proyecto funciona
- [ ] Queries a database funcionan
- [ ] Alertas no activadas
- [ ] Logs sin errores
- [ ] Monitoreo activo

---

## 📞 SOPORTE

### Errores Comunes

**Error: "Cannot connect to database"**
```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Verificar credenciales Supabase
# 1. Ir a Supabase dashboard
# 2. Seleccionar proyecto
# 3. Settings > Database
# 4. Copiar URI correcta
```

**Error: "Invalid JWT token"**
```bash
# Verificar SUPABASE_ANON_KEY
echo $SUPABASE_ANON_KEY

# Debe ser formato JWT (ey...)
# Si no es, copiar desde Supabase dashboard
```

**Error: "Port 8000 already in use"**
```bash
# Encontrar proceso
lsof -i :8000

# Matar proceso
kill -9 PID

# O usar puerto diferente
python -m uvicorn app.main:app --port 8001
```

### Documentación Relacionada

- `/Users/carlosa/NAVIGATION_GUIDE.md` - Estructura del filesystem
- `/Users/carlosa/COMPREHENSIVE_EVALUATION.md` - Evaluación completa
- `/Users/carlosa/01-DOCUMENTATION/CONSOLIDATION/audits/` - Auditorías
- `/Users/carlosa/01-DOCUMENTATION/TECHNICAL/` - Docs técnicos

---

## ✅ ESTADO FINAL

**HAIDA está listo para ser operacionalizado.**

Sigue los pasos en orden:
1. Setup del Entorno
2. Configuración de Servicios
3. Instalación de Dependencias
4. Inicialización de Base de Datos
5. Verificación de Componentes
6. Deployment

**Tiempo estimado**: 30-60 minutos para setup completo.

---

*Generado: 10 de Enero 2026*
*Versión: 1.0 - HAIDA Operational Setup*
