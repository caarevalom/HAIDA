# 🚀 HAIDA - QA Automation Platform v2.0

**HAIDA** (Hiberus AI-Driven Automation) es una plataforma completa de automatización QA con AI, multi-tenant y gestión completa de testing.

**Estado**: ✅ **Deployment Ready** (85% Completado)
**Versión**: 2.0.0
**Última actualización**: +34662652300

---

## 📋 Quick Start

### 1. Iniciar Backend (Docker)
```bash
docker-compose up -d
curl http://localhost:8000/health
# Swagger: http://localhost:8000/docs
```

### 2. Aplicar Schema a Supabase
**Lee**: `INSTRUCCIONES-FINALES.md` o `GUIA-APLICAR-SCHEMA-SUPABASE.md`

### 3. Deploy Frontend
```bash
cd Figma && vercel --prod
```

---

## 📁 Estructura del Proyecto

```
HAIDA/
├── app/                   # Backend FastAPI (14 routers)
├── Figma/                 # Frontend React (10 pages)
├── infrastructure/        # SQL Schemas & Migrations
├── .env                   # ✅ Configurado
├── Dockerfile             # ✅ Optimizado
└── docker-compose.yml     # ✅ Backend + Redis
```

---

## 🌐 URLs

- **Backend API**: http://localhost:8000
- **Swagger**: http://localhost:8000/docs
- **Supabase**: https://wdebyxvtunromsnkqbrd.supabase.co

---

## 📚 Documentación

- **👉 LEER PRIMERO**: `INSTRUCCIONES-FINALES.md`
- Schema Guide: `GUIA-APLICAR-SCHEMA-SUPABASE.md`
- Estado Proyecto: `RESUMEN-FINAL-DEPLOYMENT.md`
- Análisis Técnico: `ANALISIS-ALINEACION-DATOS-FIGMA-DB.md`

---

## ✅ Status

- Backend: ✅ Funcionando (Docker)
- Database: ⏳ Aplicar schema (10 min)
- Frontend: ⏳ Deploy Vercel (5 min)

**Próxima acción**: Leer `INSTRUCCIONES-FINALES.md`

---

**Made with ❤️ by Hiberus QA Team**
