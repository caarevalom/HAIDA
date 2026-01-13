# 🚀 INICIO RÁPIDO - HAIDA Backend

**Última actualización**: ++34662652300

---

## ⚡ 3 PASOS PARA EJECUTAR

### 1️⃣ Abrir Terminal en el Proyecto
```powershell
cd C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA
```

### 2️⃣ Ejecutar Script de Inicio
```powershell
.\start-backend.ps1
```

### 3️⃣ Abrir en Navegador
- **Health Check**: http://localhost:8000/health
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## ✅ REQUISITOS

- ✅ **Docker Desktop** instalado y corriendo
- ⚠️ **Archivo `.env`** con credenciales (opcional para testing)

---

## 🔧 COMANDOS ÚTILES

### Ver Logs
```bash
docker-compose logs -f backend
```

### Reiniciar Backend
```bash
docker-compose restart backend
```

### Detener Todo
```bash
docker-compose down
```

### Reconstruir Imagen
```bash
docker-compose up -d --build
```

---

## 📋 ENDPOINTS DISPONIBLES

### Sistema
- `GET /health` - Health check
- `GET /api/system/info` - Información del sistema

### Autenticación
- `POST /auth/login` - Login con email/password
- `POST /auth/microsoft` - Login con Microsoft Entra ID
- `POST /auth/refresh` - Renovar token

### Proyectos
- `GET /api/projects` - Listar proyectos
- `POST /api/projects` - Crear proyecto
- `GET /api/projects/{id}` - Obtener proyecto
- `PUT /api/projects/{id}` - Actualizar proyecto
- `DELETE /api/projects/{id}` - Eliminar proyecto

### Test Suites
- `GET /api/test-suites` - Listar suites
- `POST /api/test-suites` - Crear suite
- `GET /api/test-suites/{id}` - Obtener suite

### Test Cases
- `GET /api/test-cases` - Listar casos
- `POST /api/test-cases` - Crear caso
- `GET /api/test-cases/{id}` - Obtener caso

### Executions
- `GET /api/executions` - Listar ejecuciones
- `POST /api/executions` - Crear ejecución
- `GET /api/executions/{id}` - Obtener ejecución

*(Ver documentación completa en http://localhost:8000/docs)*

---

## ⚠️ TROUBLESHOOTING

### Error: "Cannot connect to Docker daemon"
**Solución**: Abre Docker Desktop y espera a que muestre "Engine running"

### Error: "Port 8000 already in use"
**Solución**:
```bash
# Detener contenedor previo
docker-compose down

# O cambiar puerto en docker-compose.yml
ports:
  - "8001:8000"
```

### Error: "Supabase connection failed"
**Solución**: Verifica variables `.env`:
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `DATABASE_URL`

### Backend no responde después de iniciar
**Solución**:
```bash
# Ver logs para diagnosticar
docker-compose logs backend

# Reintentar después de 10-15 segundos
# (primera vez puede tardar más)
```

---

## 📚 DOCUMENTACIÓN COMPLETA

- `SETUP-SIN-PERMISOS-ADMIN.md` - Guía completa Docker
- `GAPS-INCIDENCIAS.md` - Issues conocidos
- `ANALISIS-ALINEACION-DATOS-FIGMA-DB.md` - Compatibilidad Frontend-Backend
- `RESUMEN-SESION-++34662652300.md` - Resumen completo de setup

---

## 🎯 ESTADO ACTUAL

| Componente | Estado |
|------------|--------|
| Docker Setup | ✅ Completo |
| Backend Structure | ✅ Completo |
| Endpoints (Skeleton) | ✅ Funcionales |
| Database Logic | ⏳ Pendiente |
| Tests | ❌ Pendiente |

**Progreso**: ~50% completado
**Listo para**: Testing básico de endpoints

---

## 🚀 SIGUIENTE PASO

1. **Completar `.env`** con tus credenciales Supabase/Azure
2. **Implementar lógica DB** en routes
3. **Crear tests** con pytest
4. **Integrar Frontend** (React/Vite)

---

**¿Necesitas ayuda?** Consulta `SETUP-SIN-PERMISOS-ADMIN.md`
