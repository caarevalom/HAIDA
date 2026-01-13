# ⚡ HAIDA - Quick Start (Después de Correcciones)

**Estado**: ✅ Ready to Deploy

---

## 🚀 3 Opciones Rápidas

### Opción 1: Todo Automático (RECOMENDADO)

```bash
# Paso 1: Arregla todo
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/deployment/fix-and-deploy-haida.sh

# Paso 2 (Opcional): Prueba localmente
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/utilities/run-haida-local.sh
# (Presiona CTRL+C para detener)

# Paso 3: Deploya a Vercel
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/deployment/deploy-to-vercel.sh
```

✅ **Tiempo**: ~5 minutos
✅ **Complejidad**: Mínima
✅ **Riesgo**: Bajo

---

### Opción 2: Local Primero, Luego Deploy

```bash
# Paso 1: Inicia ambos servidores (backend + frontend)
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/utilities/run-haida-local.sh

# Paso 2: Prueba en navegador
# Backend: http://127.0.0.1:8000/docs
# Frontend: http://localhost:5173
# (Presiona CTRL+C para detener)

# Paso 3: Arregla y deploya
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/deployment/fix-and-deploy-haida.sh
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/deployment/deploy-to-vercel.sh
```

✅ **Tiempo**: ~10 minutos
✅ **Complejidad**: Media
✅ **Ventaja**: Pruebas antes de producción

---

### Opción 3: Manual Completo

```bash
# Navega al directorio CORRECTO
cd /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev

# Activa Python environment
source venv/bin/activate

# Instala dependencias (si es necesario)
pip install python-dotenv fastapi uvicorn pydantic supabase pyjwt httpx

# Inicia backend
python -m uvicorn app.main:app --reload

# En otra terminal:
cd /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev/Figma
npm run dev

# Para desplegar (desde otra terminal):
cd /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev
vercel deploy --prod
```

✅ **Tiempo**: ~15 minutos
✅ **Complejidad**: Alta
✅ **Ventaja**: Control total

---

## 🔍 ¿Qué se Corrigió?

❌ **Antes**: Backend no iniciaba (error de variables de entorno)
✅ **Después**: Backend inicia automáticamente

❌ **Antes**: Usuario se perdía con rutas
✅ **Después**: Scripts automatizan todo

❌ **Antes**: Deployment fallaba desde home directory
✅ **Después**: Deployment seguro desde directorio correcto

---

## ✅ Verificación Rápida

```bash
# ¿Backend funciona?
cd /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev
source venv/bin/activate
python -c "from app.main import app; print('✅ OK')"

# ¿Frontend funciona?
cd Figma
npm run build
# Si ve "built in 3.09s" = OK

# ¿Database conecta?
python << 'EOF'
from supabase import create_client
import os
from dotenv import load_dotenv
load_dotenv()
create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
print("✅ OK")
EOF
```

---

## 📚 Documentación Disponible

| Doc | Para Qué |
|-----|----------|
| `/Users/carlosa/HAIDA_DEPLOYMENT_GUIDE.md` | Guía completa de deployment |
| `/Users/carlosa/HAIDA_SYNC_FIX_SUMMARY.md` | Resumen de correcciones |
| `/Users/carlosa/HAIDA_OPERATIONALIZATION_REPORT.md` | Estado completo del sistema |
| `/Users/carlosa/00-PROJECTS/HAIDA/OPERATIONAL_SETUP.md` | Setup y pre-requisitos |

---

## 🎯 Siguientes Pasos

1. **Ahora**: Ejecuta opción 1 (automático)
2. **Luego**: Verifica que Vercel deployment funcionó
3. **Después**: Prueba endpoints en URL deployment
4. **Final**: Monitorea logs en Vercel dashboard

---

## ⚠️ Si Algo Falla

### "SUPABASE_URL must be set"
→ Ejecuta: `bash /Users/carlosa/02-AUTOMATION-SCRIPTS/deployment/fix-and-deploy-haida.sh`

### "No such file: Figma"
→ Asegúrate de estar en: `/Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev`

### "Vercel permission denied"
→ Asegúrate de estar en: `/Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev`

### "npm command not found"
→ Ejecuta: `npm install` en el directorio `Figma/`

---

## 🎊 ¡Listo!

**Sistema completamente operacional y listo para producción.**

Elige tu opción arriba y ejecuta los comandos.

¿Preguntas? Ver documentación en `/Users/carlosa/HAIDA_DEPLOYMENT_GUIDE.md`
