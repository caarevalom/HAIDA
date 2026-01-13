# 🚀 HAIDA - Guía de Deployment

**Última actualización**: 10 Enero 2026
**Status**: ✅ Ready for Deployment

---

## 🎯 Overview

Esta guía explica cómo desplegar HAIDA correctamente después de las correcciones de sincronización realizadas.

### Cambios Realizados (10 Enero 2026)

✅ **Consolidación .env**: Todos los archivos .env unificados en `/Users/carlosa/04-CONFIGURATION/.env`
✅ **Symlinks**: Ambas ramas (dev/prod) enlazan al archivo .env maestro
✅ **Load Dotenv**: Agregado `load_dotenv()` a `app/main.py` en ambas ramas
✅ **Scripts Automatizados**: Creados 3 scripts para fix, deployment y local development

---

## 📋 Prerequisitos

- ✅ Vercel CLI instalado: `vercel --version`
- ✅ Node.js v25.2.1 o superior
- ✅ Python 3.14.2 o superior
- ✅ Credenciales de Vercel configuradas

---

## 🔧 Scripts Disponibles

### 1. **Fix & Deploy Script** (Corrección Inicial)

**Ubicación**: `/Users/carlosa/02-AUTOMATION-SCRIPTS/deployment/fix-and-deploy-haida.sh`

**Propósito**: Verifica y corrige toda la configuración

**Uso**:
```bash
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/deployment/fix-and-deploy-haida.sh
```

**Qué hace**:
- ✓ Verifica .env maestro
- ✓ Crea/verifica symlinks
- ✓ Instala dependencias (Python + Node)
- ✓ Prueba startup del backend
- ✓ Prepara para Vercel deployment

**Cuándo usarlo**: Después de cambios en dependencias o configuración

---

### 2. **Local Development Script**

**Ubicación**: `/Users/carlosa/02-AUTOMATION-SCRIPTS/utilities/run-haida-local.sh`

**Propósito**: Ejecuta tanto backend como frontend localmente

**Uso**:
```bash
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/utilities/run-haida-local.sh
```

**Qué hace**:
- Inicia FastAPI backend en http://127.0.0.1:8000
- Inicia React frontend en http://localhost:5173
- Automatiza ambos servidores
- Facilita testing y debugging

**Acceso**:
- API: http://127.0.0.1:8000
- API Docs: http://127.0.0.1:8000/docs
- Frontend: http://localhost:5173

**Cuándo usarlo**: Para desarrollo local y testing

---

### 3. **Vercel Deploy Script**

**Ubicación**: `/Users/carlosa/02-AUTOMATION-SCRIPTS/deployment/deploy-to-vercel.sh`

**Propósito**: Deploy automático a Vercel con seguridad

**Uso**:
```bash
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/deployment/deploy-to-vercel.sh
```

**Qué hace**:
- Verifica autenticación Vercel
- Pregunta: staging o production
- Confirma antes de producción
- Ejecuta deployment

**Cuándo usarlo**: Para desplegar a Vercel (staging o production)

---

## 📊 Flujo de Deployment Paso a Paso

### Opción A: Deployment desde cero (Recomendado)

```bash
# Paso 1: Corregir y preparar todo
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/deployment/fix-and-deploy-haida.sh

# Paso 2: Probar localmente (opcional pero recomendado)
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/utilities/run-haida-local.sh
# (Presionar CTRL+C para detener)

# Paso 3: Desplegar a Vercel
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/deployment/deploy-to-vercel.sh
```

### Opción B: Manual (Si los scripts no funcionan)

```bash
# Paso 1: Navegar a directorio correcto
cd /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev

# Paso 2: Activar virtual environment
source venv/bin/activate

# Paso 3: Instalar dependencias
pip install -r requirements.txt
cd Figma && npm install && cd ..

# Paso 4: Probar backend
python -m uvicorn app.main:app --reload

# Paso 5: En otra terminal, probar frontend
cd Figma && npm run dev

# Paso 6: Desplegar
vercel deploy --prod
```

---

## 🧪 Testing Pre-Deployment

### Backend Test

```bash
cd /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev
source venv/bin/activate
python -c "from app.main import app; print('✅ Backend loads correctly')"
```

**Resultado esperado**: `✅ Backend loads correctly`

### Frontend Test

```bash
cd /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev/Figma
npm run build
```

**Resultado esperado**: Build successful (0 errors)

### Database Test

```bash
cd /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev
source venv/bin/activate
python << 'EOF'
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

client = create_client(url, key)
print("✅ Database connection OK")
EOF
```

**Resultado esperado**: `✅ Database connection OK`

---

## 📁 Archivos de Configuración

### Master .env
**Ubicación**: `/Users/carlosa/04-CONFIGURATION/.env`
**Contiene**: 110+ variables de configuración
**Uso**: Central de todas las credenciales y configuración

### Symlinks
- Dev: `/Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev/.env` → Master
- Prod: `/Users/carlosa/00-PROJECTS/HAIDA/haida-production/main/.env` → Master

### vercel.json
**Ubicación**: `/Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev/vercel.json`
**Propósito**: Configuración de Vercel deployment

---

## 🔐 Variables de Entorno Críticas

Las siguientes variables **DEBEN** estar en `.env`:

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_KEY
DATABASE_URL
JWT_SECRET
ENTRA_CLIENT_ID
ENTRA_TENANT_ID
ENTRA_CLIENT_SECRET
VERCEL_TOKEN
```

**Verificar**:
```bash
grep "SUPABASE_URL\|SUPABASE_SERVICE_ROLE_KEY\|JWT_SECRET" /Users/carlosa/04-CONFIGURATION/.env
```

---

## ⚠️ Troubleshooting

### Error: "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"

**Causa**: El .env no se carga correctamente

**Solución**:
```bash
# Verificar que .env existe
ls -lh /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev/.env

# Verificar que es symlink
file /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev/.env

# Recrear symlink
cd /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev
rm -f .env
ln -s /Users/carlosa/04-CONFIGURATION/.env .env

# Reintentar
python -m uvicorn app.main:app --reload
```

### Error: "cd: no such file or directory: Figma"

**Causa**: Estás en el directorio incorrecto

**Solución**:
```bash
# Asegúrate de estar en el directorio correcto
cd /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev

# Luego ir a Figma
cd Figma
npm run dev
```

### Error: "Vercel: operation not permitted"

**Causa**: Vercel intenta desplegar desde home directory

**Solución**:
```bash
# Asegúrate de estar en el directorio del proyecto
cd /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev

# Luego desplegar
vercel deploy --prod
```

---

## 📊 Estado de Verificación

Ejecutar este comando para verificar todo:

```bash
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/deployment/fix-and-deploy-haida.sh
```

Resultado esperado:
```
✓ .env configuration verified
✓ .env symlinks verified
✓ Dependencies installed
✓ Backend startup verified
✓ Ready for Vercel deployment
```

---

## 🚀 Próximos Pasos

### Inmediato (Hoy)
1. ✅ Ejecutar fix script
2. ✅ Probar localmente
3. ✅ Verificar backend y frontend

### Hoy/Mañana
1. Desplegar a Vercel (staging)
2. Verificar en URL staging
3. Hacer tests finales

### Luego de Staging
1. Desplegar a producción
2. Verificar en URL de producción
3. Monitorear logs

---

## 📞 Recursos

- **Operacionalization Report**: `/Users/carlosa/HAIDA_OPERATIONALIZATION_REPORT.md`
- **Operational Setup Guide**: `/Users/carlosa/00-PROJECTS/HAIDA/OPERATIONAL_SETUP.md`
- **Navigation Guide**: `/Users/carlosa/NAVIGATION_GUIDE.md`
- **Quick Reference**: `/Users/carlosa/QUICK_REFERENCE.md`

---

## ✅ Checklist Final Pre-Deployment

- [ ] Ejecutar `fix-and-deploy-haida.sh`
- [ ] Verificar que backend inicia sin errores
- [ ] Verificar que frontend compila sin errores
- [ ] Probar localmente con `run-haida-local.sh`
- [ ] Verificar variables de entorno en Vercel dashboard
- [ ] Ejecutar `deploy-to-vercel.sh`
- [ ] Verificar deployment en Vercel dashboard
- [ ] Probar endpoints en URL deployment

---

**Sistema listo para producción ✅**

*Para soporte, revisar `/Users/carlosa/00-PROJECTS/HAIDA/OPERATIONAL_SETUP.md`*
