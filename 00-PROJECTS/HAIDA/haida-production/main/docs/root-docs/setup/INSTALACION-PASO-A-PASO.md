# INSTALACIÓN PASO A PASO - HAIDA

## ✅ Estado Actual

**Git configurado correctamente**:

- ✅ user.email: hola@stayarta.com
- ✅ user.name: caarevalo

---

## 📥 PASO 1: Instalar Node.js 20 LTS

### Opción A: Descarga Manual (Recomendado)

1. **Abrir navegador**
   - Ve a: https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi

2. **Descargar el instalador**
   - Se descargará el archivo `node-v20.10.0-x64.msi`

3. **Ejecutar el instalador**
   - Doble clic en el archivo descargado
   - Aceptar la licencia
   - Dejar la ruta por defecto (C:\Program Files\nodejs)
   - **IMPORTANTE**: Marcar la opción "Automatically install the necessary tools"
   - Hacer clic en "Install"
   - Esperar a que termine (2-3 minutos)

4. **Verificar instalación**
   - **Cerrar PowerShell actual**
   - Abrir nuevo PowerShell
   - Ejecutar:
   ```powershell
   node --version
   npm --version
   ```

   - Debería mostrar:
   ```
   v20.10.0
   10.x.x
   ```

### Opción B: Con Winget (Windows Package Manager)

```powershell
# Abrir PowerShell como Administrador
winget install OpenJS.NodeJS.LTS

# Cerrar y reabrir PowerShell
node --version
npm --version
```

---

## ☕ PASO 2: Instalar Java 17 LTS

### Opción A: Descarga Manual (Recomendado)

1. **Abrir navegador**
   - Ve a: https://adoptium.net/temurin/releases/?version=17

2. **Descargar**
   - Operating System: **Windows**
   - Architecture: **x64**
   - Package Type: **JDK**
   - Hacer clic en **.msi** (Windows Installer)

3. **Ejecutar instalador**
   - Doble clic en el archivo descargado
   - Aceptar licencia
   - **IMPORTANTE**: Marcar opciones:
     - ✅ Set JAVA_HOME variable
     - ✅ JavaSoft (Oracle) registry keys
     - ✅ Add to PATH
   - Hacer clic en "Install"
   - Esperar a que termine

4. **Verificar instalación**
   - **Cerrar PowerShell actual**
   - Abrir nuevo PowerShell
   - Ejecutar:
   ```powershell
   java -version
   echo $env:JAVA_HOME
   ```

   - Debería mostrar:
   ```
   openjdk version "17.0.x"
   C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot
   ```

### Opción B: Con Winget

```powershell
# Abrir PowerShell como Administrador
winget install EclipseAdoptium.Temurin.17.JDK

# Cerrar y reabrir PowerShell
java -version
```

---

## 🔧 PASO 3: Verificar PowerShell 7

```powershell
# Verificar versión actual
$PSVersionTable.PSVersion
```

Si muestra **5.x**, instalar PowerShell 7:

### Instalar PowerShell 7

**Opción A: Con Winget**

```powershell
winget install Microsoft.PowerShell
```

**Opción B: Descarga Manual**

1. Ve a: https://github.com/PowerShell/PowerShell/releases/latest
2. Buscar archivo: `PowerShell-7.x.x-win-x64.msi`
3. Descargar y ejecutar

**Después de instalar**:

- Buscar "PowerShell 7" en el menú inicio
- O ejecutar: `pwsh` en el terminal

---

## 📦 PASO 4: Instalar Dependencias NPM de HAIDA

**⚠️ IMPORTANTE: Ejecutar DESPUÉS de instalar Node.js**

```powershell
# Navegar a HAIDA
cd C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA

# Instalar dependencias
npm ci

# Instalar pg para Supabase
npm install pg

# Instalar browsers de Playwright
npx playwright install --with-deps
```

**Tiempo estimado**: 5-10 minutos

**Salida esperada**:

```
✔ Installing dependencies...
✔ Downloading browsers...
✔ Success! Installed 369 packages
```

---

## 🎯 PASO 5: Instalar k6 (OPCIONAL pero recomendado)

### Opción A: Con Chocolatey

```powershell
# Instalar Chocolatey si no lo tienes
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Instalar k6
choco install k6
```

### Opción B: Descarga Manual

1. Ve a: https://dl.k6.io/msi/k6-latest-amd64.msi
2. Descargar y ejecutar
3. Verificar:

```powershell
k6 version
```

---

## ✅ PASO 6: Verificación Completa

Ejecuta este script para verificar todo:

```powershell
Write-Host "`n=== HAIDA Prerequisites Check ===" -ForegroundColor Cyan
Write-Host ""

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
    $javaOutput = java -version 2>&1
    $javaVersion = ($javaOutput | Select-Object -First 1)
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
    $k6Version = k6 version 2>&1
    Write-Host "✓ k6: $k6Version" -ForegroundColor Green
} catch {
    Write-Host "⚠ k6: NOT INSTALLED (Optional)" -ForegroundColor Yellow
}

# Playwright
try {
    $playwrightVersion = npx playwright --version 2>&1
    Write-Host "✓ Playwright: $playwrightVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠ Playwright: NOT INSTALLED (run: npx playwright install)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Check Complete ===" -ForegroundColor Cyan
Write-Host ""
```

---

## 🗄️ PASO 7: Configurar Base de Datos Supabase

### 7.1 Obtener Password de Supabase

1. Ve a: https://app.supabase.com/
2. Inicia sesión
3. Selecciona tu proyecto
4. Ve a: **Settings** → **Database**
5. Busca: **Database password** o **Connection string**
6. Copia tu password

### 7.2 Configurar .env

```powershell
# Navegar a HAIDA
cd C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA

# Copiar template si no existe
if (!(Test-Path .env)) {
    Copy-Item .env.example .env
}

# Abrir .env en VS Code
code .env
```

**Agregar en .env**:

```bash
# Supabase Database
DB_HOST=db.wdebyxvtunromsnkqbrd.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD_AQUI
DB_SSL=true

# Base URL
BASE_URL=https://mcprod.thisisbarcelona.com
```

### 7.3 Ejecutar Setup de Base de Datos

```powershell
# Navegar a database
cd C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA\database

# Configurar password
$env:DB_PASSWORD="TU_PASSWORD_AQUI"

# Ejecutar setup
node setup-database.js
```

**Salida esperada**:

```
===================================================
HAIDA Database Setup
===================================================

ℹ Connecting to Supabase...
✓ Connected to PostgreSQL
✓ 01-schema-haida.sql executed successfully
✓ 02-test-data.sql executed successfully

===================================================
Verification
===================================================

ℹ Tables created: 7
  - users
  - projects
  - test_suites
  ...

✓ HAIDA database setup completed successfully!
```

---

## 🧪 PASO 8: Ejecutar Tests de Prueba

```powershell
# Volver a directorio principal
cd C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA

# Ejecutar smoke tests
npm run test:web -- --project=chromium tests/web-e2e/smoke.spec.ts

# Ver reporte
npm run report
```

---

## 🐳 PASO 9: Levantar Servicios Docker (OPCIONAL)

```powershell
# Navegar a change-detection
cd C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA\haida\change-detection

# Verificar que Docker Desktop está corriendo
docker --version

# Levantar servicios
docker-compose up -d

# Verificar servicios
docker-compose ps

# Ver logs
docker-compose logs -f haida-api
```

**Servicios disponibles**:

- HAIDA API: http://localhost:3001
- Changedetection.io: http://localhost:5000
- Allure Reports: http://localhost:4040
- PostgreSQL: localhost:5432
- Redis: localhost:6379

---

## ❓ TROUBLESHOOTING

### Error: "node: command not found" después de instalar

**Solución**:

1. Cerrar TODAS las ventanas de PowerShell
2. Abrir nuevo PowerShell
3. Intentar de nuevo

### Error: "Cannot find module 'pg'"

**Solución**:

```powershell
cd C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA
npm install pg
```

### Error: "Execution policy" al ejecutar scripts

**Solución**:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "JAVA_HOME not set"

**Solución**:

```powershell
# Buscar instalación de Java
$javaPath = "C:\Program Files\Eclipse Adoptium\jdk-17.0.9.9-hotspot"

# Configurar JAVA_HOME (temporal)
$env:JAVA_HOME = $javaPath
$env:PATH = "$javaPath\bin;$env:PATH"

# Verificar
echo $env:JAVA_HOME
java -version
```

Para hacerlo permanente:

1. Buscar "Environment Variables" en Windows
2. Agregar variable de sistema:
   - Nombre: `JAVA_HOME`
   - Valor: `C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot`
3. Editar `Path` y agregar: `%JAVA_HOME%\bin`

---

## 📋 CHECKLIST FINAL

Marca cada item cuando lo completes:

```
□ Node.js 20 LTS instalado y verificado
□ NPM funcionando
□ Java 17 LTS instalado y verificado
□ JAVA_HOME configurado
□ PowerShell 7 instalado (opcional)
□ Git configurado (✅ YA HECHO)
□ Docker verificado (✅ YA HECHO)
□ Dependencias NPM instaladas (npm ci)
□ pg package instalado
□ Playwright browsers instalados
□ .env configurado con Supabase
□ Base de datos creada en Supabase
□ Tests ejecutados con éxito
□ Docker services levantados (opcional)
```

---

## 🎯 COMANDOS RÁPIDOS DE RESUMEN

```powershell
# Después de instalar Node.js y Java, ejecutar TODO de una vez:

# 1. Navegar a HAIDA
cd C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA

# 2. Instalar dependencias
npm ci
npm install pg
npx playwright install --with-deps

# 3. Configurar base de datos
cd database
$env:DB_PASSWORD="TU_PASSWORD"
node setup-database.js

# 4. Volver y ejecutar tests
cd ..
npm run test:web -- --project=chromium tests/web-e2e/smoke.spec.ts

# 5. Ver reporte
npm run report
```

---

## 📞 SIGUIENTE PASO

Cuando termines la instalación, ejecuta:

```powershell
# Verificar todo está correcto
cd C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA
node --version
java -version
npm --version
git config --list

# Luego avísame y continuamos con la estructura profesional de HAIDA
```

---

**Creado**: ++34662652300
**Para**: hola@stayarta.com
**Tiempo estimado total**: 30-45 minutos
