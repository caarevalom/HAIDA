# INSTALACIÓN SIN PERMISOS DE ADMINISTRADOR

## 🔒 Problema: No tienes permisos de administrador

No te preocupes, hay varias soluciones:

---

## ✅ SOLUCIÓN 1: Usar NVM for Windows (RECOMENDADO)

NVM permite instalar Node.js en tu carpeta de usuario sin necesidad de admin.

### Pasos:

1. **Descargar NVM for Windows**
   - Ve a: https://github.com/coreybutler/nvm-windows/releases
   - Busca el archivo: `nvm-noinstall.zip` (NO el .exe)
   - Descárgalo

2. **Extraer a tu carpeta de usuario**

   ```powershell
   # Crear carpeta para NVM
   New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\nvm"

   # Extraer el ZIP descargado a esa carpeta
   # (Hazlo manualmente con clic derecho → Extraer)
   ```

3. **Configurar variables de entorno de usuario**

   ```powershell
   # Configurar NVM_HOME
   [Environment]::SetEnvironmentVariable("NVM_HOME", "$env:USERPROFILE\nvm", "User")

   # Configurar NVM_SYMLINK
   [Environment]::SetEnvironmentVariable("NVM_SYMLINK", "$env:USERPROFILE\nodejs", "User")

   # Agregar al PATH de usuario
   $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
   $newPath = "$env:USERPROFILE\nvm;$env:USERPROFILE\nodejs;$userPath"
   [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
   ```

4. **Cerrar y reabrir PowerShell**

5. **Instalar Node.js con NVM**
   ```powershell
   nvm install 20.10.0
   nvm use 20.10.0
   node --version
   npm --version
   ```

---

## ✅ SOLUCIÓN 2: Usar Node.js Portable (MÁS FÁCIL)

Esta es la opción más simple sin instalación.

### Pasos:

1. **Descargar Node.js Portable**
   - Ve a: https://nodejs.org/dist/v20.10.0/node-v20.10.0-win-x64.zip
   - Descarga el ZIP

2. **Extraer a tu carpeta de documentos**

   ```powershell
   # Crear carpeta
   New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\Documents\nodejs"

   # Extraer el ZIP descargado a: C:\Users\CarlosArturoArevaloM\Documents\nodejs
   # (Hazlo manualmente)
   ```

3. **Agregar al PATH de usuario**

   ```powershell
   # Agregar Node.js al PATH
   $nodePath = "$env:USERPROFILE\Documents\nodejs\node-v20.10.0-win-x64"
   $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
   $newPath = "$nodePath;$userPath"
   [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
   ```

4. **Cerrar y reabrir PowerShell**

5. **Verificar**
   ```powershell
   node --version
   npm --version
   ```

---

## ✅ SOLUCIÓN 3: Usar Scoop (Package Manager sin Admin)

Scoop es un package manager que NO requiere admin.

### Pasos:

1. **Instalar Scoop**

   ```powershell
   # Permitir scripts
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

   # Instalar Scoop
   irm get.scoop.sh | iex
   ```

2. **Instalar Node.js con Scoop**

   ```powershell
   scoop install nodejs-lts
   ```

3. **Verificar**
   ```powershell
   node --version
   npm --version
   ```

---

## ✅ SOLUCIÓN 4: Pedir permisos temporales a IT

Si trabajas en Hiberus, puedes:

1. **Abrir ticket a IT/Soporte**
   - Solicitar permisos de administrador local temporales
   - O pedir que IT instale Node.js 20 LTS y Java 17 LTS por ti
   - Mencionar que es para desarrollo de HAIDA (proyecto interno)

2. **Alternativa**: Pedir que IT te habilite en el grupo de administradores locales

---

## 🎯 MI RECOMENDACIÓN: Solución 2 (Node.js Portable)

Es la más rápida y no requiere ningún permiso especial.

### Pasos detallados:

```powershell
# 1. Descargar Node.js portable
# Ve a: https://nodejs.org/dist/v20.10.0/node-v20.10.0-win-x64.zip
# Guárdalo en Descargas

# 2. Crear carpeta en tu perfil
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\Apps\nodejs"

# 3. Extraer ZIP
# Clic derecho en el archivo descargado → Extraer todo
# Extraer a: C:\Users\CarlosArturoArevaloM\Apps\nodejs

# 4. Agregar al PATH (permanente)
$nodePath = "$env:USERPROFILE\Apps\nodejs\node-v20.10.0-win-x64"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath -notlike "*$nodePath*") {
    [Environment]::SetEnvironmentVariable("Path", "$nodePath;$currentPath", "User")
    Write-Host "✓ Node.js agregado al PATH" -ForegroundColor Green
}

# 5. CERRAR Y REABRIR PowerShell

# 6. Verificar
node --version
npm --version
```

---

## ☕ JAVA SIN PERMISOS DE ADMIN

### Opción 1: Java Portable

1. **Descargar JDK Portable**
   - Ve a: https://adoptium.net/temurin/releases/?version=17
   - En "Archive" selecciona **.zip** (no .msi)
   - Descarga el ZIP

2. **Extraer a tu perfil**

   ```powershell
   New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\Apps\java"
   # Extraer ZIP a esta carpeta
   ```

3. **Configurar JAVA_HOME y PATH**

   ```powershell
   $javaPath = "$env:USERPROFILE\Apps\java\jdk-17.0.9+9"

   [Environment]::SetEnvironmentVariable("JAVA_HOME", $javaPath, "User")

   $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
   $newPath = "$javaPath\bin;$currentPath"
   [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
   ```

4. **Cerrar y reabrir PowerShell**

5. **Verificar**
   ```powershell
   java -version
   echo $env:JAVA_HOME
   ```

---

## 🚀 SCRIPT COMPLETO: Instalación Portable Automática

Copia y ejecuta este script completo:

```powershell
Write-Host "`n=== HAIDA - Instalación Sin Admin ===" -ForegroundColor Cyan
Write-Host ""

# Crear carpeta Apps
$appsFolder = "$env:USERPROFILE\Apps"
New-Item -ItemType Directory -Force -Path $appsFolder | Out-Null
Write-Host "✓ Carpeta Apps creada: $appsFolder" -ForegroundColor Green

# Instrucciones
Write-Host "`nPASOS MANUALES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. DESCARGAR NODE.JS:" -ForegroundColor Cyan
Write-Host "   https://nodejs.org/dist/v20.10.0/node-v20.10.0-win-x64.zip"
Write-Host "   Guardar en: Descargas"
Write-Host ""
Write-Host "2. EXTRAER NODE.JS:" -ForegroundColor Cyan
Write-Host "   Clic derecho en el ZIP → Extraer todo"
Write-Host "   Extraer a: $appsFolder\nodejs"
Write-Host ""
Write-Host "3. DESCARGAR JAVA:" -ForegroundColor Cyan
Write-Host "   https://adoptium.net/temurin/releases/?version=17"
Write-Host "   Seleccionar: Windows x64, Archive (.zip)"
Write-Host ""
Write-Host "4. EXTRAER JAVA:" -ForegroundColor Cyan
Write-Host "   Extraer a: $appsFolder\java"
Write-Host ""

# Esperar confirmación
Read-Host "Presiona Enter cuando hayas descargado y extraído ambos..."

# Detectar carpetas extraídas
$nodeFolder = Get-ChildItem "$appsFolder\nodejs" -Directory | Where-Object { $_.Name -like "node-*" } | Select-Object -First 1
$javaFolder = Get-ChildItem "$appsFolder\java" -Directory | Where-Object { $_.Name -like "jdk-*" } | Select-Object -First 1

if ($nodeFolder) {
    $nodePath = $nodeFolder.FullName
    Write-Host "✓ Node.js encontrado: $nodePath" -ForegroundColor Green

    # Configurar PATH
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($currentPath -notlike "*$nodePath*") {
        [Environment]::SetEnvironmentVariable("Path", "$nodePath;$currentPath", "User")
        Write-Host "✓ Node.js agregado al PATH" -ForegroundColor Green
    }
} else {
    Write-Host "✗ Node.js no encontrado en $appsFolder\nodejs" -ForegroundColor Red
}

if ($javaFolder) {
    $javaPath = $javaFolder.FullName
    Write-Host "✓ Java encontrado: $javaPath" -ForegroundColor Green

    # Configurar JAVA_HOME
    [Environment]::SetEnvironmentVariable("JAVA_HOME", $javaPath, "User")
    Write-Host "✓ JAVA_HOME configurado" -ForegroundColor Green

    # Configurar PATH
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($currentPath -notlike "*$javaPath\bin*") {
        [Environment]::SetEnvironmentVariable("Path", "$javaPath\bin;$currentPath", "User")
        Write-Host "✓ Java agregado al PATH" -ForegroundColor Green
    }
} else {
    Write-Host "✗ Java no encontrado en $appsFolder\java" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Configuración Completa ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Yellow
Write-Host "1. CIERRA este PowerShell"
Write-Host "2. ABRE un nuevo PowerShell"
Write-Host "3. Ejecuta: node --version"
Write-Host "4. Ejecuta: java -version"
Write-Host ""
```

---

## 📝 RESUMEN DE LINKS DE DESCARGA

### Node.js Portable (ZIP):

```
https://nodejs.org/dist/v20.10.0/node-v20.10.0-win-x64.zip
```

### Java 17 Portable (ZIP):

```
https://adoptium.net/temurin/releases/?version=17
→ Seleccionar: Windows, x64, JDK, Archive (.zip)
```

---

## ❓ ¿Cuál método prefieres?

Dime cuál de estos métodos quieres usar y te guío paso a paso:

1. **Node.js Portable** (más fácil, 5 minutos)
2. **NVM for Windows** (más profesional, 10 minutos)
3. **Scoop** (package manager, 10 minutos)
4. **Pedir a IT** (más lento pero oficial)

Te recomiendo la **Opción 1: Node.js Portable** 👍

---

**Creado**: 2024-12-16
**Para**: caarevalo@hiberus.com (sin permisos admin)
