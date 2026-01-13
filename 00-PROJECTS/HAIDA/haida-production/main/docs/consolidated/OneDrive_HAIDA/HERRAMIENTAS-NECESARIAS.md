# HERRAMIENTAS NECESARIAS PARA HAIDA

## Estado de Herramientas

### ✅ YA TIENES (Confirmadas)

- Visual Studio Code
- Docker Desktop
- Postman
- Claude AI
- Microsoft 365 Copilot
- Figma
- Supabase

---

## 🔴 HERRAMIENTAS CRÍTICAS (Obligatorias)

### 1. Node.js & NPM

**Estado**: ❌ NECESITAS INSTALAR
**Versión requerida**: Node.js 18+ (recomendado 20 LTS)
**Propósito**: Runtime para ejecutar tests, API server, scripts
**Descarga**: https://nodejs.org/
**Instalación**:

```bash
# Verificar instalación
node --version   # Debe mostrar v18.x o superior
npm --version    # Debe mostrar 9.x o superior
```

**Uso en HAIDA**:

- Ejecutar Playwright tests
- HAIDA API server (Express)
- Newman (Postman CLI)
- Scripts de generación de tests

---

### 2. Git

**Estado**: ⚠️ VERIFICAR
**Versión requerida**: 2.30+
**Propósito**: Control de versiones, clonación de repositorios
**Descarga**: https://git-scm.com/
**Instalación**:

```bash
# Verificar instalación
git --version
```

**Uso en HAIDA**:

- Clonar repositorio
- Control de versiones
- CI/CD con GitHub Actions

---

### 3. PowerShell 7+

**Estado**: ⚠️ VERIFICAR (Windows 11 trae PowerShell 5, necesitas 7+)
**Versión requerida**: PowerShell 7.0+
**Propósito**: Scripts de automatización HAIDA
**Descarga**: https://github.com/PowerShell/PowerShell/releases
**Instalación**:

```powershell
# Verificar versión
$PSVersionTable.PSVersion
# Debe mostrar 7.x
```

**Uso en HAIDA**:

- Scripts de generación de test cases
- Automatización de workflows
- Análisis de resultados

---

### 4. Docker Compose

**Estado**: ✅ INCLUIDO CON DOCKER DESKTOP
**Versión requerida**: 2.0+
**Propósito**: Orquestación de servicios HAIDA
**Verificación**:

```bash
docker-compose --version
```

**Uso en HAIDA**:

- 6 servicios Docker: changedetection.io, selenium, haida-api, postgres, redis, allure

---

### 5. Java (JDK/JRE)

**Estado**: ❌ NECESITAS INSTALAR
**Versión requerida**: Java 8+ (recomendado 11 o 17)
**Propósito**: Allure Framework reporting
**Descarga**: https://adoptium.net/ (Eclipse Temurin)
**Instalación**:

```bash
# Verificar instalación
java -version
```

**Uso en HAIDA**:

- Generar reportes Allure
- Visualizar reportes HTML

---

## 🟡 HERRAMIENTAS IMPORTANTES (Muy recomendadas)

### 6. k6 (Load Testing)

**Estado**: ❌ NECESITAS INSTALAR
**Versión requerida**: Latest stable
**Propósito**: Performance y load testing
**Descarga**: https://k6.io/docs/get-started/installation/
**Instalación (Windows)**:

```powershell
# Con Chocolatey
choco install k6

# O descargar MSI desde sitio oficial
```

**Uso en HAIDA**:

- Tests de carga HTTP
- Performance testing
- Stress testing

---

### 7. PostgreSQL Client (pgAdmin o psql)

**Estado**: ❌ NECESITAS INSTALAR
**Versión requerida**: 15+
**Propósito**: Gestionar base de datos HAIDA
**Descarga**: https://www.pgadmin.org/
**Instalación**:

```bash
# Verificar conexión al contenedor Docker
psql -h localhost -p 5432 -U haida -d haida_tests
```

**Uso en HAIDA**:

- Consultar histórico de tests
- Análisis de métricas
- Troubleshooting

---

### 8. Redis Client (RedisInsight)

**Estado**: ❌ OPCIONAL PERO RECOMENDADO
**Versión requerida**: Latest
**Propósito**: Visualizar cache de tests
**Descarga**: https://redis.io/insight/
**Uso en HAIDA**:

- Monitorear cache
- Debug de datos temporales

---

### 9. GitHub CLI (gh)

**Estado**: ❌ OPCIONAL
**Versión requerida**: Latest
**Propósito**: Integración con GitHub desde CLI
**Descarga**: https://cli.github.com/
**Instalación**:

```bash
# Windows con winget
winget install --id GitHub.cli

# Verificar
gh --version
```

**Uso en HAIDA**:

- Crear PRs automáticamente
- Gestionar Issues
- CI/CD workflows

---

### 10. Slack CLI / Webhook Tester

**Estado**: ❌ OPCIONAL
**Propósito**: Probar notificaciones de Slack
**Descarga**: https://api.slack.com/tools/cli
**Uso en HAIDA**:

- Configurar webhooks
- Probar notificaciones

---

## 🟢 EXTENSIONES DE VS CODE (Recomendadas)

### 11. Playwright Test for VS Code

**ID**: ms-playwright.playwright
**Propósito**: Ejecutar y debuggear tests Playwright desde VS Code
**Instalación**:

```
Ext + P → ext install ms-playwright.playwright
```

### 12. Docker Extension

**ID**: ms-azuretools.vscode-docker
**Propósito**: Gestionar contenedores Docker desde VS Code

### 13. PowerShell Extension

**ID**: ms-vscode.powershell
**Propósito**: Editar y ejecutar scripts PowerShell

### 14. REST Client

**ID**: humao.rest-client
**Propósito**: Probar APIs directamente desde VS Code

### 15. GitHub Copilot (Ya lo tienes)

**ID**: GitHub.copilot
**Propósito**: Generación de código AI

### 16. Thunder Client (Alternativa a Postman)

**ID**: rangav.vscode-thunder-client
**Propósito**: Cliente REST integrado en VS Code

### 17. Markdown All in One

**ID**: yzhang.markdown-all-in-one
**Propósito**: Edición de documentación Markdown

### 18. Better Comments

**ID**: aaron-bond.better-comments
**Propósito**: Mejorar legibilidad de comentarios

---

## 🔵 HERRAMIENTAS ONLINE/SAAS (Opcionales)

### 19. Allure TestOps (Opcional - Paid)

**Propósito**: Gestión avanzada de tests
**Alternativa gratuita**: Allure Docker Service (ya incluido en docker-compose)

### 20. TestRail / qTest / Xray (Opcional - Paid)

**Propósito**: Test management system
**Alternativa gratuita**: CSV exports de HAIDA

### 21. Slack Workspace

**Estado**: ⚠️ NECESITAS CONFIGURAR
**Propósito**: Notificaciones en tiempo real
**Setup**:

1. Crear workspace o usar existente
2. Crear Incoming Webhook
3. Añadir URL al .env de HAIDA

### 22. GitHub/GitLab/Azure DevOps

**Estado**: ⚠️ NECESITAS CONFIGURAR
**Propósito**: Repositorio de código, CI/CD
**Recomendación**: GitHub (mejor integración con HAIDA)

---

## 📦 DEPENDENCIAS NPM (Se instalan automáticamente)

Estas se instalan con `npm install`:

### Testing Frameworks

- @playwright/test (v1.48.0)
- newman (v6.0.0)
- allure-playwright (v2.0.0)
- axe-core (v4.9.0)
- lighthouse (v12.0.0)

### HAIDA API Dependencies

- express (v4.18.2)
- axios (v1.6.0)
- dotenv (v16.3.1)

### Build Tools

- rimraf (v5.0.0)
- allure-commandline (v2.24.0)

---

## 🛠️ INSTALACIÓN RÁPIDA - CHECKLIST

### Paso 1: Software Base

```powershell
# 1. Node.js 20 LTS
# Descargar: https://nodejs.org/
# Verificar:
node --version
npm --version

# 2. Java 17 LTS
# Descargar: https://adoptium.net/
# Verificar:
java -version

# 3. PowerShell 7
# Descargar: https://github.com/PowerShell/PowerShell
# Verificar:
pwsh --version

# 4. Git
# Descargar: https://git-scm.com/
# Verificar:
git --version

# 5. k6 (Opcional pero recomendado)
# Descargar: https://k6.io/
# Verificar:
k6 version
```

### Paso 2: VS Code Extensions

```bash
# Abrir VS Code
# Ir a Extensions (Ctrl+Shift+X)
# Buscar e instalar:
- Playwright Test for VS Code
- Docker
- PowerShell
- REST Client
- Thunder Client
- Markdown All in One
```

### Paso 3: Docker Desktop

```bash
# Ya lo tienes instalado ✅
# Verificar que esté corriendo:
docker --version
docker-compose --version
```

### Paso 4: Verificación Completa

```powershell
# Ejecutar este script de verificación
Write-Host "=== HAIDA Prerequisites Check ===" -ForegroundColor Cyan

# Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js: NOT INSTALLED" -ForegroundColor Red
}

# NPM
try {
    $npmVersion = npm --version
    Write-Host "✓ NPM: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ NPM: NOT INSTALLED" -ForegroundColor Red
}

# Java
try {
    $javaVersion = java -version 2>&1 | Select-Object -First 1
    Write-Host "✓ Java: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Java: NOT INSTALLED" -ForegroundColor Red
}

# Git
try {
    $gitVersion = git --version
    Write-Host "✓ Git: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git: NOT INSTALLED" -ForegroundColor Red
}

# Docker
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker: NOT INSTALLED" -ForegroundColor Red
}

# Docker Compose
try {
    $composeVersion = docker-compose --version
    Write-Host "✓ Docker Compose: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker Compose: NOT INSTALLED" -ForegroundColor Red
}

# PowerShell
Write-Host "✓ PowerShell: $($PSVersionTable.PSVersion)" -ForegroundColor Green

# k6 (Optional)
try {
    $k6Version = k6 version
    Write-Host "✓ k6: $k6Version" -ForegroundColor Green
} catch {
    Write-Host "⚠ k6: NOT INSTALLED (Optional)" -ForegroundColor Yellow
}

Write-Host "`n=== Check Complete ===" -ForegroundColor Cyan
```

---

## 🎯 PRIORIZACIÓN DE INSTALACIÓN

### NIVEL 1 - CRÍTICO (Instalar AHORA)

1. ✅ Node.js 20 LTS
2. ✅ Java 17 LTS
3. ✅ PowerShell 7
4. ✅ Git

### NIVEL 2 - IMPORTANTE (Instalar esta semana)

5. ✅ k6
6. ✅ PostgreSQL Client (pgAdmin)
7. ✅ VS Code Extensions (Playwright, Docker)

### NIVEL 3 - RECOMENDADO (Instalar cuando necesites)

8. ⚪ Redis Client
9. ⚪ GitHub CLI
10. ⚪ Slack Workspace setup

### NIVEL 4 - OPCIONAL (Instalar si quieres)

11. ⚪ Thunder Client
12. ⚪ Allure TestOps (Paid)
13. ⚪ TestRail (Paid)

---

## 📋 CONFIGURACIÓN POST-INSTALACIÓN

### Después de instalar las herramientas críticas:

1. **Clonar HAIDA (si no está clonado)**

```bash
cd C:\Users\CarlosArturoArevaloM\Documents\Proyectos
git clone <tu-repo-haida> HAIDA
cd HAIDA
```

2. **Instalar dependencias NPM**

```bash
npm ci
npx playwright install --with-deps
```

3. **Configurar environment**

```bash
cp .env.example .env
# Editar .env con tus valores
```

4. **Iniciar HAIDA Change Detection System**

```bash
cd haida/change-detection
docker-compose up -d
```

5. **Verificar servicios**

```bash
docker-compose ps
curl http://localhost:3001/health
```

6. **Ejecutar tests de prueba**

```bash
cd ../..
npm run test:web
```

---

## 🔗 LINKS DE DESCARGA RÁPIDA

| Herramienta     | Link Directo                                           | Prioridad     |
| --------------- | ------------------------------------------------------ | ------------- |
| Node.js 20 LTS  | https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi | 🔴 CRÍTICO    |
| Java 17 LTS     | https://adoptium.net/temurin/releases/?version=17      | 🔴 CRÍTICO    |
| PowerShell 7    | https://github.com/PowerShell/PowerShell/releases      | 🔴 CRÍTICO    |
| Git for Windows | https://git-scm.com/download/win                       | 🔴 CRÍTICO    |
| k6              | https://dl.k6.io/msi/k6-latest-amd64.msi               | 🟡 IMPORTANTE |
| pgAdmin 4       | https://www.pgadmin.org/download/pgadmin-4-windows/    | 🟡 IMPORTANTE |
| RedisInsight    | https://redis.com/redis-enterprise/redis-insight/      | 🟢 OPCIONAL   |
| GitHub CLI      | https://github.com/cli/cli/releases                    | 🟢 OPCIONAL   |

---

## ❓ FAQ - Preguntas Frecuentes

### ¿Necesito instalar PostgreSQL Server?

**No**. PostgreSQL corre en Docker. Solo necesitas el cliente (pgAdmin) para conectarte al contenedor.

### ¿Necesito instalar Redis Server?

**No**. Redis corre en Docker. RedisInsight es solo para visualización (opcional).

### ¿Puedo usar Postman en lugar de Newman?

**Sí**. Newman es Postman CLI. Ya tienes Postman, así que puedes crear collections allí y exportarlas a `tests/api/collection.json`.

### ¿Necesito Allure TestOps (paid)?

**No**. HAIDA usa Allure Framework (gratuito) que corre en Docker. TestOps es opcional para equipos enterprise.

### ¿Funciona en Mac/Linux?

**Sí**. Todas las herramientas son multiplataforma. Los scripts PowerShell se pueden convertir a Bash si es necesario.

### ¿Cuánto espacio en disco necesito?

- Node.js: ~200 MB
- Java: ~300 MB
- Docker images HAIDA: ~2 GB
- Playwright browsers: ~1 GB
- **Total**: ~4-5 GB

### ¿Cuánta RAM necesito?

- Mínimo: 8 GB
- Recomendado: 16 GB
- Ideal: 32 GB (para correr todos los servicios Docker + tests en paralelo)

---

## 🚀 PRÓXIMOS PASOS

Una vez instaladas las herramientas críticas:

1. ✅ Ejecutar script de verificación (arriba)
2. ✅ Instalar dependencias NPM
3. ✅ Configurar .env
4. ✅ Levantar Docker services
5. ✅ Ejecutar primer test
6. ✅ Ver reportes en Allure

**Documentación de ayuda**:

- `README.md` - Overview general
- `QA-SETUP-GUIDE.md` - Guía de setup detallada
- `haida/QUICK-START.md` - Inicio rápido HAIDA
- `TROUBLESHOOTING.md` - Solución de problemas

---

**Creado**: ++34662652300
**Versión**: 1.0
**Mantenedor**: Equipo HAIDA
