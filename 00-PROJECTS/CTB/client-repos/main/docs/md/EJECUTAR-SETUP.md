# 🚀 EJECUTAR SETUP COMPLETO - HAIDA

## ✅ Script de Instalación Automática

He creado un script que instala y configura TODO automáticamente.

---

## 📋 OPCIÓN 1: Setup Completo con Supabase

Si tienes tu password de Supabase:

```powershell
cd C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA

# Ejecutar con password de Supabase
.\setup-all-tools.ps1 -SupabasePassword "TU_PASSWORD_AQUI"
```

---

## 📋 OPCIÓN 2: Setup Sin Supabase (configurar después)

Si NO tienes el password ahora:

```powershell
cd C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA

# Ejecutar sin password
.\setup-all-tools.ps1
```

---

## 🎯 ¿Qué hace el script?

El script `setup-all-tools.ps1` hace TODO esto automáticamente:

### ✅ FASE 1: Verificación
- Verifica Git instalado
- Verifica Docker (opcional)

### ✅ FASE 2: Directorios
- Crea `C:\Users\CarlosArturoArevaloM\Apps`
- Crea subcarpetas: nodejs, java, tools

### ✅ FASE 3: Descarga
- Descarga Node.js 20.10.0 (portable)
- Descarga Java JDK 17 (portable)

### ✅ FASE 4: Extracción
- Extrae Node.js a Apps\nodejs
- Extrae Java a Apps\java

### ✅ FASE 5: Variables de Entorno
- Agrega Node.js al PATH
- Configura JAVA_HOME
- Agrega Java al PATH

### ✅ FASE 6: Verificación
- Verifica node --version
- Verifica npm --version
- Verifica java -version

### ✅ FASE 7: NPM Global
- Instala allure-commandline
- Instala lighthouse
- Instala newman

### ✅ FASE 8: HAIDA Dependencies
- Ejecuta npm ci
- Instala pg (Supabase)
- Instala Playwright browsers

### ✅ FASE 9: .env
- Crea .env desde .env.example
- Configura Supabase (si password provided)

### ✅ FASE 10: Supabase Database
- Ejecuta setup-database.js
- Crea tablas y vistas
- Inserta datos de prueba

### ✅ FASE 11: Scripts
- Crea verify-tools.ps1
- Scripts de verificación

---

## ⏱️ Tiempo Estimado

- **Con internet rápida**: 15-20 minutos
- **Con internet lenta**: 30-40 minutos

### Desglose:
- Descarga Node.js: ~2-5 minutos (50 MB)
- Descarga Java: ~5-10 minutos (180 MB)
- Extracción: ~1 minuto
- NPM packages: ~3-5 minutos
- Playwright browsers: ~5-10 minutos (500 MB)
- Database setup: ~30 segundos

---

## 🖥️ EJECUTAR PASO A PASO

### Paso 1: Abrir PowerShell

```powershell
# Presiona Win + X
# Selecciona "Windows PowerShell"
```

### Paso 2: Navegar a HAIDA

```powershell
cd C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA
```

### Paso 3: Permitir ejecución de scripts (si es necesario)

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Paso 4: Ejecutar setup

**CON password de Supabase**:
```powershell
.\setup-all-tools.ps1 -SupabasePassword "tu_password_real"
```

**SIN password** (configurar después):
```powershell
.\setup-all-tools.ps1
```

### Paso 5: Esperar a que termine

Verás output como este:

```
========================================
PHASE 1: Checking Prerequisites
========================================

✓ Git installed: git version 2.52.0.windows.1

========================================
PHASE 2: Creating Directory Structure
========================================

✓ Directories created in: C:\Users\CarlosArturoArevaloM\Apps

========================================
PHASE 3: Downloading Tools
========================================

ℹ Downloading Node.js...
✓ Node.js downloaded
...
```

### Paso 6: Cerrar y Reabrir PowerShell

Después de que termine:
1. **CIERRA** este PowerShell
2. **ABRE** un nuevo PowerShell

### Paso 7: Verificar instalación

```powershell
cd C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA
.\verify-tools.ps1
```

Deberías ver:

```
=== HAIDA Tools Verification ===

✓ Node.js: v20.10.0
✓ NPM: v10.2.4
✓ Java: openjdk version "17.0.9"
✓ Git: git version 2.52.0
✓ Docker: Docker version 29.1.3
✓ Playwright: Version 1.48.0
✓ Allure: 2.24.0

=== Environment Variables ===
JAVA_HOME: C:\Users\CarlosArturoArevaloM\Apps\java\jdk-17.0.9+9

=== HAIDA Project ===
✓ HAIDA directory found
```

---

## 🧪 Paso 8: Ejecutar Primer Test

```powershell
# Test rápido de smoke
npm run test:web -- --project=chromium tests/web-e2e/smoke.spec.ts

# Ver reporte
npm run report
```

---

## ❓ TROUBLESHOOTING

### Error: "no se puede ejecutar porque la ejecución de scripts está deshabilitada"

**Solución**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "No se encuentra node/npm después de la instalación"

**Solución**:
1. Cierra TODAS las ventanas de PowerShell
2. Abre un NUEVO PowerShell
3. Intenta de nuevo

### Error: "Fallo la descarga de Node.js/Java"

**Solución Manual**:

1. **Node.js**:
   - Ve a: https://nodejs.org/dist/v20.10.0/node-v20.10.0-win-x64.zip
   - Descarga el ZIP
   - Guárdalo en: `C:\Users\CarlosArturoArevaloM\Downloads`
   - Vuelve a ejecutar el script

2. **Java**:
   - Ve a: https://adoptium.net/temurin/releases/?version=17
   - Descarga el ZIP (Archive)
   - Guárdalo en: `C:\Users\CarlosArturoArevaloM\Downloads`
   - Renombra a: `jdk-17.0.9_9.zip`
   - Vuelve a ejecutar el script

### El script se queda en "Downloading..."

**Solución**:
- Presiona Ctrl+C
- Descarga manualmente (ver arriba)
- Vuelve a ejecutar el script (detectará los archivos ya descargados)

---

## 🔄 Si algo falla: Reset completo

```powershell
# Borrar instalación anterior
Remove-Item -Recurse -Force "$env:USERPROFILE\Apps\nodejs" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$env:USERPROFILE\Apps\java" -ErrorAction SilentlyContinue

# Volver a ejecutar
cd C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA
.\setup-all-tools.ps1 -SupabasePassword "TU_PASSWORD"
```

---

## 📊 Verificar que todo funciona

```powershell
# 1. Verificar herramientas
.\verify-tools.ps1

# 2. Verificar dependencias HAIDA
npm list --depth=0

# 3. Verificar conexión Supabase (si configurado)
cd database
node -e "const {Pool}=require('pg'); const pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}}); pool.query('SELECT NOW()').then(r=>console.log('✓ Supabase:',r.rows[0].now)).catch(e=>console.error('✗',e.message))"

# 4. Ejecutar test de prueba
cd ..
npm run test:web -- --project=chromium tests/web-e2e/smoke.spec.ts
```

---

## 🎯 COMANDO ÚNICO - COPY & PASTE

Copia y pega TODO esto en PowerShell:

```powershell
# Navegar a HAIDA
cd C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA

# Permitir scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# Ejecutar setup (REEMPLAZA "TU_PASSWORD" con tu password real de Supabase)
.\setup-all-tools.ps1 -SupabasePassword "TU_PASSWORD"
```

O sin password de Supabase:

```powershell
cd C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
.\setup-all-tools.ps1
```

---

## 📞 Después del Setup

Una vez que todo termine y verifiques que funciona:

1. ✅ Ejecutar verify-tools.ps1
2. ✅ Ejecutar primer test
3. ✅ Ver reporte de Playwright
4. ✅ Configurar Docker services (opcional)
5. ✅ Leer documentación de HAIDA

---

**Tiempo total estimado**: 20-40 minutos
**Nivel de automatización**: 95%
**Interacción requerida**: Mínima (solo ejecutar el comando)

---

¿Listo para ejecutar? Copia el comando y pégalo en PowerShell! 🚀
