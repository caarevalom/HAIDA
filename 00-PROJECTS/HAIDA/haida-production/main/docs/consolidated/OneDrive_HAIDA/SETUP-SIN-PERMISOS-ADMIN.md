# 🚀 HAIDA Backend - Setup SIN Permisos de Administrador

**Fecha**: ++34662652300
**Objetivo**: Ejecutar el backend FastAPI usando Docker Desktop (no requiere permisos de admin)

---

## 📋 PREREQUISITOS

### ✅ Ya tienes instalado (verificar):

- **Docker Desktop** (ya debería estar instalado sin admin)
- **Git** (para clonar/trabajar con el repo)

### 🔍 Verificar instalación:

```powershell
# En PowerShell o Git Bash
docker --version
docker-compose --version
```

**Salida esperada**:

```
Docker version 24.x.x
Docker Compose version v2.x.x
```

---

## 🏗️ PASO 1: Configurar Variables de Entorno

### 1.1 Verificar archivo `.env`

```bash
cd C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA
cat .env
```

### 1.2 Variables requeridas en `.env`:

```bash
# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-anon-key
SUPABASE_SERVICE_KEY=tu-service-role-key

# Database Direct Connection
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres

# Redis (opcional, Docker lo maneja)
REDIS_URL=redis://redis:6379

# Microsoft Entra ID
AZURE_CLIENT_ID=tu-client-id
AZURE_TENANT_ID=tu-tenant-id
AZURE_CLIENT_SECRET=tu-client-secret

# JWT
JWT_SECRET=tu-secret-super-seguro-cambiar-en-produccion
```

---

## 🐳 PASO 2: Construir y Ejecutar con Docker

### 2.1 Construir imagen Docker

```bash
cd C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA

# Construir imagen
docker build -t haida-backend:latest .
```

**Tiempo estimado**: 2-3 minutos (primera vez)

### 2.2 Ejecutar con Docker Compose (RECOMENDADO)

```bash
# Iniciar backend + Redis
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f backend
```

### 2.3 Verificar que está corriendo

```bash
# Ver contenedores activos
docker ps

# Debería mostrar:
# - haida-backend (puerto 8000)
# - haida-redis (puerto 6379)
```

---

## 🧪 PASO 3: Testear el Backend

### 3.1 Health Check

```bash
# En Git Bash o PowerShell
curl http://localhost:8000/health

# O abrir en navegador:
# http://localhost:8000/health
```

**Respuesta esperada**:

```json
{
  "status": "healthy",
  "version": "2.0.0"
}
```

### 3.2 Ver documentación interactiva

Abrir en navegador:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 3.3 Testear endpoints

```bash
# GET /api/system/info
curl http://localhost:8000/api/system/info

# GET /api/projects (requiere auth)
curl -H "Authorization: Bearer tu-token" http://localhost:8000/api/projects
```

---

## 🔧 COMANDOS ÚTILES

### Ver logs

```bash
# Logs en tiempo real
docker-compose logs -f backend

# Últimas 100 líneas
docker-compose logs --tail=100 backend
```

### Reiniciar servicios

```bash
# Reiniciar todo
docker-compose restart

# Solo backend
docker-compose restart backend
```

### Detener servicios

```bash
# Detener pero mantener datos
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Detener y eliminar TODO (incluyendo volúmenes)
docker-compose down -v
```

### Ejecutar comandos dentro del contenedor

```bash
# Abrir shell interactivo
docker-compose exec backend bash

# Ejecutar pytest
docker-compose exec backend pytest

# Ver variables de entorno
docker-compose exec backend env | grep SUPABASE
```

### Reconstruir imagen (después de cambios)

```bash
# Reconstruir y reiniciar
docker-compose up -d --build

# Solo reconstruir backend
docker-compose build backend
```

---

## 🐛 TROUBLESHOOTING

### ❌ Error: "Cannot connect to Docker daemon"

**Causa**: Docker Desktop no está corriendo
**Solución**:

1. Abrir Docker Desktop desde el menú inicio
2. Esperar a que muestre "Engine running"
3. Reintentar comando

### ❌ Error: "Port 8000 already in use"

**Causa**: Otro proceso usa el puerto 8000
**Solución**:

```bash
# Ver qué está usando el puerto
netstat -ano | findstr :8000

# Cambiar puerto en docker-compose.yml:
# ports:
#   - "8001:8000"  # <-- usa 8001 en lugar de 8000
```

### ❌ Error: "Supabase connection failed"

**Causa**: Variables `.env` incorrectas
**Solución**:

1. Verificar `.env` tiene valores correctos
2. Reiniciar contenedor: `docker-compose restart backend`
3. Ver logs: `docker-compose logs backend`

### ❌ Error: "ModuleNotFoundError: No module named 'app'"

**Causa**: Estructura de directorios incorrecta
**Solución**:

```bash
# Verificar que exista:
ls app/main.py
ls app/core/
ls app/routes/

# Si falta, revisar Dockerfile
```

### 🔍 Ver logs detallados

```bash
# Todos los logs
docker-compose logs

# Solo errores
docker-compose logs backend 2>&1 | grep -i error

# Logs de inicio
docker-compose logs backend | head -50
```

---

## 🎯 ALTERNATIVAS SIN DOCKER

Si Docker no funciona, tienes estas opciones:

### Opción A: Python Portable (sin admin)

1. Descargar **WinPython** o **Anaconda Individual**
2. Extraer en tu carpeta de usuario
3. Usar su Python sin necesidad de instalación global

### Opción B: GitHub Codespaces (en la nube)

1. Abrir el repo en GitHub
2. Click en "Code" → "Codespaces" → "New codespace"
3. Ejecutar directamente en el navegador

### Opción C: WSL2 (Windows Subsystem for Linux)

Si tienes WSL2 habilitado:

```bash
# En WSL2 terminal
cd /mnt/c/Users/CarlosArturoArevaloM/Documents/Proyectos/HAIDA

# Instalar Python en WSL2
sudo apt update
sudo apt install python3.11 python3-pip

# Ejecutar normalmente
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## 📊 ESTADO DE IMPLEMENTACIÓN

| Componente         | Estado       | Notas                                |
| ------------------ | ------------ | ------------------------------------ |
| Docker setup       | ✅ COMPLETO  | Dockerfile + docker-compose.yml      |
| Variables .env     | ⏳ PENDIENTE | Necesitas completar tus credenciales |
| Routes (skeleton)  | ✅ COMPLETO  | Estructura básica funcional          |
| DB queries         | ⏳ PENDIENTE | Implementación de lógica real        |
| Tests pytest       | ❌ PENDIENTE | Crear estructura de tests            |
| RBAC/Multi-tenancy | ⏳ PENDIENTE | Implementar validaciones             |

---

## 🚀 PRÓXIMOS PASOS

1. ✅ **[AHORA]** Ejecutar `docker-compose up -d`
2. ✅ **[AHORA]** Verificar http://localhost:8000/health
3. ✅ **[AHORA]** Explorar http://localhost:8000/docs
4. ⏳ **[DESPUÉS]** Completar variables .env con tus credenciales reales
5. ⏳ **[DESPUÉS]** Implementar lógica DB en routes
6. ⏳ **[DESPUÉS]** Crear tests con pytest
7. ⏳ **[DESPUÉS]** Integrar con frontend Next.js

---

## 📚 REFERENCIAS

- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Docker Compose**: https://docs.docker.com/compose/
- **Supabase Python**: https://supabase.com/docs/reference/python
- **MSAL Python**: https://github.com/AzureAD/microsoft-authentication-library-for-python

---

**✅ Listo para empezar sin permisos de administrador**
