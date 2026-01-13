# 🎯 COMIENZA AQUÍ - Instrucciones de Deployment

**Fecha**: 10 Enero 2026
**Tu próximo paso**: Ejecuta UNO de estos comandos

---

## 🚀 Pick One Option & Run

### ✅ OPCIÓN 1: Automático (HAZLO ASÍ PRIMERO)

**Ejecuta este comando exactamente:**

```bash
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/deployment/fix-and-deploy-haida.sh
```

**Qué hace**:
- ✓ Verifica todas las configuraciones
- ✓ Instala dependencias si falta
- ✓ Prueba que el backend funciona
- ✓ Te dice si está listo para Vercel

**Tiempo**: 5 minutos
**Después**: Ve a la sección "Vercel Deploy" abajo

---

### 🔧 OPCIÓN 2: Prueba Local Primero

**Ejecuta este comando para probar localmente:**

```bash
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/utilities/run-haida-local.sh
```

**Qué hace**:
- Inicia FastAPI backend (puerto 8000)
- Inicia React frontend (puerto 5173)
- Abre ambos automáticamente

**Prueba en tu navegador**:
- Backend: http://127.0.0.1:8000/docs
- Frontend: http://localhost:5173

**Cuando termines**: Presiona `CTRL+C` para detener

**Después**: Ve a la sección "Vercel Deploy" abajo

---

### 📦 OPCIÓN 3: Manual (Si los scripts no funcionan)

```bash
# Navega al directorio CORRECTO
cd /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev

# Activa Python
source venv/bin/activate

# Inicia backend
python -m uvicorn app.main:app --reload
```

**Si esto dice `Uvicorn running on http://127.0.0.1:8000`**: ✓ OK

**Después**: Ve a la sección "Vercel Deploy" abajo

---

## ✅ Vercel Deploy

### Después de completar opción 1, 2, o 3, ejecuta:

```bash
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/deployment/deploy-to-vercel.sh
```

**Qué hace**:
- Verifica que estés logged en Vercel
- Te pregunta si quieres staging o production
- Desploya automáticamente

**Responde**:
- `1` para staging (preview)
- `2` para production

**Después de deployment**:
- Vercel te da una URL
- Prueba esa URL en tu navegador
- ¡Listo!

---

## 🆘 Algo Falló?

### Error: "SUPABASE_URL must be set"
Ejecuta de nuevo:
```bash
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/deployment/fix-and-deploy-haida.sh
```

### Error: "No such file or directory"
Asegúrate de estar en el directorio correcto:
```bash
cd /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev
# Luego re-ejecuta el comando
```

### Error: "Command not found: npm"
Los scripts lo instalan automáticamente. Si aún falla:
```bash
cd /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev/Figma
npm install
```

---

## 📚 Documentación Disponible

Si necesitas MÁS INFORMACIÓN:

| Documento | Para... |
|-----------|---------|
| `HAIDA_QUICK_START.md` | Resumen de 3 opciones |
| `HAIDA_DEPLOYMENT_GUIDE.md` | Guía completa detallada |
| `HAIDA_SYNC_FIX_SUMMARY.md` | Qué se corrigió técnicamente |
| `HAIDA_OPERATIONALIZATION_REPORT.md` | Estado completo del sistema |

---

## ⏱️ Timeline Estimado

```
Opción 1 (Automático)
├─ Fix script: 3-5 minutos
├─ Deploy script: 2-3 minutos
└─ Total: 5-8 minutos

Opción 2 (Con prueba local)
├─ Fix script: 3-5 minutos
├─ Local run: 5-10 minutos
├─ Deploy script: 2-3 minutos
└─ Total: 10-18 minutos

Opción 3 (Manual)
├─ Setup: 5-10 minutos
├─ Deploy: 2-3 minutos
└─ Total: 7-13 minutos
```

---

## ✨ Qué Esperar

### Opción 1/2
```
✓ .env configuration verified
✓ .env symlinks verified
✓ Dependencies installed
✓ Backend startup verified
✓ Ready for Vercel deployment
```

### Opción 3
```
INFO: Uvicorn running on http://127.0.0.1:8000
INFO: Application startup complete
```

---

## 🎉 Éxito!

Cuando veas estas URLs:
- **Backend**: http://127.0.0.1:8000
- **Frontend**: http://localhost:5173
- **API Docs**: http://127.0.0.1:8000/docs

✅ **¡Está funcionando!**

---

## 🔐 Importante

Nunca ejecutes comandos de deployment desde:
- ❌ `/Users/carlosa` (home directory)
- ❌ `/Users/carlosa/Figma` (frontend directory)

Siempre desde:
- ✅ `/Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev`

---

## 📞 Quick Links

```
Scripts:
  Fix: /Users/carlosa/02-AUTOMATION-SCRIPTS/deployment/fix-and-deploy-haida.sh
  Local: /Users/carlosa/02-AUTOMATION-SCRIPTS/utilities/run-haida-local.sh
  Deploy: /Users/carlosa/02-AUTOMATION-SCRIPTS/deployment/deploy-to-vercel.sh

Config:
  Master .env: /Users/carlosa/04-CONFIGURATION/.env

Docs:
  Quick Start: /Users/carlosa/HAIDA_QUICK_START.md
  Full Guide: /Users/carlosa/HAIDA_DEPLOYMENT_GUIDE.md
```

---

## 🚀 Comienza Ahora

**Pick one, copy it, paste it:**

```bash
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/deployment/fix-and-deploy-haida.sh
```

or

```bash
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/utilities/run-haida-local.sh
```

or

```bash
cd /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev && source venv/bin/activate && python -m uvicorn app.main:app --reload
```

---

**¡Sistema listo para producción!** 🌟
