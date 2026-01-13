# CLI TOOLS GUIDE - HAIDA

## 📋 Resumen de Verificación de Herramientas

### ✅ INSTALADAS
- **Git**: v2.52.0.windows.1 ✓
- **Docker**: v29.1.3 ✓
- **Docker Compose**: v2.40.3 ✓

### ❌ FALTANTES (CRÍTICAS)
- **Node.js**: NO INSTALADO
- **NPM**: NO INSTALADO (viene con Node.js)
- **Java**: NO INSTALADO

### ⚠️ OPCIONALES NO INSTALADAS
- **k6**: NO INSTALADO

---

## 🔧 CLI TOOLS - GUÍA COMPLETA DE COMANDOS

### 1. Node.js & NPM CLI

#### Instalación
**Link**: https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi

#### Comandos Esenciales
```bash
# Verificar instalación
node --version
npm --version

# Actualizar NPM
npm install -g npm@latest

# Instalar dependencias del proyecto
npm install
# o para instalación limpia
npm ci

# Instalar paquete global
npm install -g <package-name>

# Ver paquetes instalados globalmente
npm list -g --depth=0

# Limpiar cache
npm cache clean --force

# Ver configuración
npm config list

# Crear package.json
npm init -y

# Ejecutar scripts
npm run <script-name>
npm test
npm start

# Auditar vulnerabilidades
npm audit
npm audit fix
```

#### NPM Packages Globales Recomendados para HAIDA
```bash
# Playwright CLI
npm install -g @playwright/test

# Newman (Postman CLI)
npm install -g newman

# Allure CLI
npm install -g allure-commandline

# Lighthouse CLI
npm install -g lighthouse

# TypeScript
npm install -g typescript

# Nodemon (dev server)
npm install -g nodemon

# Prettier (code formatter)
npm install -g prettier

# ESLint (linter)
npm install -g eslint
```

---

### 2. Java CLI

#### Instalación
**Link**: https://adoptium.net/temurin/releases/?version=17

#### Comandos Esenciales
```bash
# Verificar instalación
java -version
javac -version

# Ver información del JVM
java -XshowSettings:properties -version

# Ejecutar JAR
java -jar <file.jar>

# Ver variables de entorno
echo $JAVA_HOME       # Linux/Mac
echo %JAVA_HOME%      # Windows

# Allure específico (necesita Java)
allure --version
allure serve <allure-results-dir>
allure generate <results-dir> -o <report-dir>
allure open <report-dir>
```

#### Configurar JAVA_HOME (Windows)
```powershell
# PowerShell (temporal)
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.9.9-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Permanente (System Properties)
# 1. Buscar "Environment Variables" en Windows
# 2. Agregar JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot
# 3. Agregar %JAVA_HOME%\bin a PATH
```

---

### 3. Git CLI

#### Estado: ✅ INSTALADO (v2.52.0)

#### Comandos Esenciales para HAIDA
```bash
# Configuración inicial
git config --global user.name "Tu Nombre"
git config --global user.email "hola@stayarta.com"

# Clonar repositorio
git clone <url> <directory>

# Estado del repositorio
git status
git status -s    # short format

# Crear rama
git checkout -b <branch-name>
git switch -c <branch-name>   # nuevo comando

# Commits
git add .
git add <file>
git commit -m "mensaje"
git commit -am "mensaje"   # add + commit

# Push/Pull
git push origin <branch>
git pull origin <branch>

# Ver historial
git log
git log --oneline --graph --all

# Branches
git branch                  # listar locales
git branch -a               # listar todas
git branch -d <branch>      # eliminar local
git push origin --delete <branch>  # eliminar remota

# Revertir cambios
git restore <file>          # descartar cambios
git restore --staged <file> # unstage
git reset --hard HEAD       # resetear todo

# Tags
git tag v1.0.0
git push origin v1.0.0

# Stash (guardar temporal)
git stash
git stash list
git stash pop
git stash apply

# Útil para HAIDA
git log --grep="HAIDA"      # buscar commits
git diff HEAD~1             # ver cambios último commit
git blame <file>            # ver quien cambió qué
```

---

### 4. Docker & Docker Compose CLI

#### Estado: ✅ INSTALADO (v29.1.3 / v2.40.3)

#### Docker CLI
```bash
# Verificar instalación
docker --version
docker info

# Imágenes
docker images                   # listar imágenes
docker pull <image>:<tag>       # descargar imagen
docker build -t <name>:<tag> .  # construir imagen
docker rmi <image-id>           # eliminar imagen
docker image prune              # limpiar imágenes no usadas

# Contenedores
docker ps                       # contenedores corriendo
docker ps -a                    # todos los contenedores
docker run <image>              # crear y ejecutar
docker run -d -p 8080:80 <image>  # detached + port mapping
docker start <container-id>     # iniciar
docker stop <container-id>      # detener
docker restart <container-id>   # reiniciar
docker rm <container-id>        # eliminar
docker logs <container-id>      # ver logs
docker logs -f <container-id>   # seguir logs
docker exec -it <container-id> bash  # entrar al contenedor
docker inspect <container-id>   # ver detalles

# Volumes
docker volume ls                # listar volúmenes
docker volume create <name>     # crear volumen
docker volume rm <name>         # eliminar volumen
docker volume prune             # limpiar volúmenes no usados

# Networks
docker network ls               # listar redes
docker network create <name>    # crear red
docker network rm <name>        # eliminar red

# System
docker system df                # uso de espacio
docker system prune             # limpiar todo no usado
docker system prune -a --volumes  # limpieza completa
```

#### Docker Compose CLI
```bash
# Verificar instalación
docker-compose --version

# Proyecto HAIDA
cd haida/change-detection

# Iniciar servicios
docker-compose up               # foreground
docker-compose up -d            # background (detached)
docker-compose up --build       # rebuild images
docker-compose up -d --force-recreate  # recrear todo

# Detener servicios
docker-compose stop             # detener sin eliminar
docker-compose down             # detener y eliminar
docker-compose down -v          # incluir volúmenes

# Estado
docker-compose ps               # listar servicios
docker-compose top              # procesos corriendo

# Logs
docker-compose logs             # todos los servicios
docker-compose logs -f          # seguir logs
docker-compose logs -f haida-api  # servicio específico
docker-compose logs --tail=100 haida-api  # últimas 100 líneas

# Ejecutar comandos
docker-compose exec haida-api bash     # entrar al contenedor
docker-compose exec postgres psql -U haida  # entrar a PostgreSQL

# Restart
docker-compose restart          # reiniciar todos
docker-compose restart haida-api  # reiniciar uno

# Build
docker-compose build            # construir imágenes
docker-compose build --no-cache # sin cache

# Scale
docker-compose up -d --scale haida-api=3  # escalar servicio

# Configuración
docker-compose config           # validar y ver config
docker-compose config --services  # listar servicios
```

#### Comandos HAIDA Específicos
```bash
# Setup completo
cd /c/Users/CarlosArturoArevaloM/Documents/Proyectos/HAIDA
cd haida/change-detection
docker-compose up -d

# Verificar salud
curl http://localhost:3001/health
curl http://localhost:5000

# Ver logs de servicios críticos
docker-compose logs -f haida-api changedetection selenium

# Reiniciar después de cambios
docker-compose restart haida-api

# Backup de base de datos
docker-compose exec postgres pg_dump -U haida haida_tests > backup.sql

# Restore
docker-compose exec -T postgres psql -U haida haida_tests < backup.sql

# Limpiar y reiniciar
docker-compose down -v
docker-compose up -d --build
```

---

### 5. Playwright CLI

#### Instalación (después de instalar Node.js)
```bash
npm install -g @playwright/test
npx playwright install --with-deps
```

#### Comandos Esenciales
```bash
# Ejecutar tests
npx playwright test                    # todos los tests
npx playwright test <file>             # test específico
npx playwright test --headed           # con browser visible
npx playwright test --debug            # modo debug
npx playwright test --ui               # modo UI interactivo

# Proyectos (browsers)
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Reportes
npx playwright show-report             # abrir último reporte
npx playwright show-report <dir>       # reporte específico

# Code generation
npx playwright codegen <url>           # generar código
npx playwright codegen --target=javascript <url>

# Instalación de browsers
npx playwright install                 # todos
npx playwright install chromium        # específico
npx playwright install --with-deps     # con dependencias del sistema

# Info
npx playwright --version
npx playwright install --help

# HAIDA específico
cd /c/Users/CarlosArturoArevaloM/Documents/Proyectos/HAIDA
npm run test:web                       # ejecutar tests web
npm run test:web:ui                    # modo UI
npx playwright test tests/web-e2e/smoke.spec.ts  # test específico
```

---

### 6. Newman CLI (Postman)

#### Instalación
```bash
npm install -g newman
```

#### Comandos Esenciales
```bash
# Ejecutar collection
newman run <collection.json>
newman run tests/api/collection.json

# Con environment
newman run <collection.json> -e <environment.json>

# Reportes
newman run <collection.json> --reporters cli,html
newman run <collection.json> --reporters cli,junit --reporter-junit-export results.xml

# Iteraciones
newman run <collection.json> -n 10     # 10 iteraciones

# Delay entre requests
newman run <collection.json> --delay-request 1000  # 1 segundo

# Timeout
newman run <collection.json> --timeout-request 5000

# Variables globales
newman run <collection.json> --global-var "key=value"

# HAIDA específico
cd /c/Users/CarlosArturoArevaloM/Documents/Proyectos/HAIDA
npm run test:api
newman run tests/api/collection.json --reporters cli,html --reporter-html-export reports/newman/report.html
```

---

### 7. Lighthouse CLI

#### Instalación
```bash
npm install -g lighthouse
```

#### Comandos Esenciales
```bash
# Básico
lighthouse <url>

# Con opciones
lighthouse <url> --output html --output json --output-path ./reports/lighthouse

# Modo headless
lighthouse <url> --chrome-flags="--headless=new"

# Solo ciertas auditorías
lighthouse <url> --only-categories=performance,accessibility

# Dispositivo móvil
lighthouse <url> --emulated-form-factor=mobile
lighthouse <url> --preset=desktop

# Throttling
lighthouse <url> --throttling-method=simulate
lighthouse <url> --throttling.cpuSlowdownMultiplier=4

# Config file
lighthouse <url> --config-path=./lighthouse-config.js

# HAIDA específico
cd /c/Users/CarlosArturoArevaloM/Documents/Proyectos/HAIDA
export BASE_URL=https://mcprod.thisisbarcelona.com
npm run lighthouse
lighthouse $BASE_URL --quiet --chrome-flags="--headless=new" --output html --output json --output-path reports/lighthouse
```

---

### 8. k6 CLI (Load Testing)

#### Instalación
**Windows**: https://dl.k6.io/msi/k6-latest-amd64.msi
**Mac**: `brew install k6`
**Linux**: https://k6.io/docs/get-started/installation/

#### Comandos Esenciales
```bash
# Ejecutar test
k6 run <script.js>

# Con VUs (Virtual Users)
k6 run --vus 10 --duration 30s <script.js>

# Con stages
k6 run --stage 5s:10,10s:20,5s:0 <script.js>

# Output a JSON
k6 run --out json=results.json <script.js>

# Output a InfluxDB
k6 run --out influxdb=http://localhost:8086/k6 <script.js>

# Cloud (k6 cloud)
k6 cloud <script.js>

# Thresholds
k6 run --threshold http_req_duration=p(95)<500 <script.js>

# HAIDA específico
cd /c/Users/CarlosArturoArevaloM/Documents/Proyectos/HAIDA
npm run test:perf
k6 run tests/perf/k6-smoke.js
k6 run --vus 50 --duration 2m tests/perf/k6-load.js
```

---

### 9. Allure CLI

#### Instalación
```bash
npm install -g allure-commandline
# O con Scoop (Windows): scoop install allure
```

#### Comandos Esenciales
```bash
# Generar reporte
allure generate <results-dir> -o <report-dir>
allure generate allure-results -o allure-report

# Clean generate
allure generate <results-dir> -o <report-dir> --clean

# Servir reporte
allure serve <results-dir>
allure open <report-dir>

# History
allure generate <results-dir> -o <report-dir> --clean
# Mantener history: copiar allure-report/history a allure-results antes de generar

# HAIDA específico
cd /c/Users/CarlosArturoArevaloM/Documents/Proyectos/HAIDA
npm run allure:clean
npm run allure:generate
npm run allure:open

# Manual
allure generate reports/allure-results -o reports/allure-report --clean
allure open reports/allure-report
```

---

### 10. PostgreSQL CLI (psql)

#### Instalación
Incluido con pgAdmin o standalone: https://www.postgresql.org/download/

#### Comandos Esenciales
```bash
# Conectar
psql -h <host> -p <port> -U <user> -d <database>
psql -h localhost -p 5432 -U postgres -d postgres

# HAIDA Supabase
psql "postgresql://postgres:[PASSWORD]@db.wdebyxvtunromsnkqbrd.supabase.co:5432/postgres"

# Comandos internos psql
\l                  # listar bases de datos
\c <database>       # conectar a BD
\dt                 # listar tablas
\d <table>          # describir tabla
\du                 # listar usuarios
\q                  # salir

# Ejecutar SQL
SELECT * FROM users;

# Ejecutar archivo SQL
\i /path/to/file.sql
psql -h localhost -U postgres -d haida_tests -f migration.sql

# Dump
pg_dump -h localhost -U postgres haida_tests > backup.sql

# Restore
psql -h localhost -U postgres haida_tests < backup.sql

# HAIDA Docker específico
docker-compose exec postgres psql -U haida haida_tests
```

---

### 11. GitHub CLI (gh)

#### Instalación
```bash
# Windows
winget install --id GitHub.cli

# Mac
brew install gh

# Linux
# Ver: https://github.com/cli/cli/blob/trunk/docs/install_linux.md
```

#### Comandos Esenciales
```bash
# Autenticación
gh auth login
gh auth status

# Repos
gh repo create <name>
gh repo clone <owner>/<repo>
gh repo view

# Issues
gh issue list
gh issue create
gh issue view <number>
gh issue close <number>

# Pull Requests
gh pr list
gh pr create
gh pr view <number>
gh pr checkout <number>
gh pr merge <number>
gh pr status

# Workflows
gh workflow list
gh workflow view <workflow>
gh workflow run <workflow>
gh run list
gh run view <run-id>

# HAIDA específico
cd /c/Users/CarlosArturoArevaloM/Documents/Proyectos/HAIDA
gh repo view
gh pr create --title "feat: Add new test profile" --body "Description"
gh workflow run qa-pipeline.yml
```

---

### 12. PowerShell 7 CLI

#### Instalación
https://github.com/PowerShell/PowerShell/releases

#### Comandos Esenciales
```powershell
# Versión
$PSVersionTable

# Ejecución de scripts
pwsh -File script.ps1
pwsh -Command "Get-Process"

# Execution Policy
Get-ExecutionPolicy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# HAIDA específico
cd C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA
pwsh -File haida/generators/generate-tests.ps1 -DocPath "haida/docs/spec.md"
pwsh -File haida/generators/ValidateCSVStructure.ps1 -CsvPath "output.csv"
```

---

## 📊 RESUMEN RÁPIDO - HAIDA WORKFLOW

```bash
# 1. Setup inicial (una vez)
cd /c/Users/CarlosArturoArevaloM/Documents/Proyectos/HAIDA
npm ci
npx playwright install --with-deps

# 2. Configurar environment
cp .env.example .env
# Editar .env

# 3. Levantar servicios Docker
cd haida/change-detection
docker-compose up -d

# 4. Ejecutar tests
cd ../..
npm run test:web               # Playwright
npm run test:api               # Newman
npm run lighthouse             # Lighthouse
npm run test:perf              # k6

# 5. Ver reportes
npm run report                 # Playwright
npm run allure:generate        # Allure
npm run allure:open

# 6. Generar test cases con IA
pwsh -File haida/generators/generate-tests.ps1 -DocPath "haida/docs/my-spec.md"

# 7. Verificar salud
curl http://localhost:3001/health
docker-compose ps

# 8. Ver logs
docker-compose logs -f haida-api

# 9. Detener servicios
docker-compose down
```

---

## 🔗 LINKS DE REFERENCIA

| Tool | Docs | CLI Reference |
|------|------|---------------|
| Node.js | https://nodejs.org/docs/ | https://nodejs.dev/learn/the-nodejs-cli |
| NPM | https://docs.npmjs.com/ | https://docs.npmjs.com/cli/ |
| Git | https://git-scm.com/doc | https://git-scm.com/docs |
| Docker | https://docs.docker.com/ | https://docs.docker.com/engine/reference/commandline/cli/ |
| Docker Compose | https://docs.docker.com/compose/ | https://docs.docker.com/compose/reference/ |
| Playwright | https://playwright.dev/ | https://playwright.dev/docs/test-cli |
| Newman | https://learning.postman.com/docs/running-collections/using-newman-cli/command-line-integration-with-newman/ | https://www.npmjs.com/package/newman |
| Lighthouse | https://developer.chrome.com/docs/lighthouse/ | https://github.com/GoogleChrome/lighthouse#cli-options |
| k6 | https://k6.io/docs/ | https://k6.io/docs/using-k6/k6-options/reference/ |
| Allure | https://docs.qameta.io/allure/ | https://docs.qameta.io/allure/#_commandline |
| PostgreSQL | https://www.postgresql.org/docs/ | https://www.postgresql.org/docs/current/app-psql.html |

---

**Creado**: +34662652300
**Versión**: 1.0
**Proyecto**: HAIDA QA Automation
