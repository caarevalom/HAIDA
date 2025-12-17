# 🔐 SSH Passphrase - HAIDA

## Problema Detectado

Tu clave SSH `HAIDA-Deploy` tiene una **passphrase** (contraseña). Esto significa que cada vez que uses Git push/pull, te pedirá la contraseña.

```
Enter passphrase for key 'C:/Users/CarlosArturoArevaloM/Documents/Proyectos/HAIDA/Pro/HAIDA-Deploy':
```

---

## 🎯 Soluciones

### Opción 1: Usar SSH Agent (RECOMENDADO)

Guarda la passphrase en memoria para no tenerla que escribir cada vez.

#### En PowerShell:

```powershell
# Iniciar SSH Agent
Start-Service ssh-agent

# Agregar tu clave (te pedirá la passphrase UNA VEZ)
ssh-add C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA\Pro\HAIDA-Deploy

# Verificar que se agregó
ssh-add -l
```

#### En Git Bash:

```bash
# Iniciar SSH Agent
eval $(ssh-agent -s)

# Agregar clave
ssh-add ~/Documents/Proyectos/HAIDA/Pro/HAIDA-Deploy

# Verificar
ssh-add -l
```

Ahora podrás hacer `git push` sin ingresar la passphrase cada vez.

---

### Opción 2: Crear Clave Nueva SIN Passphrase

Si prefieres no tener passphrase (menos seguro pero más conveniente):

```powershell
cd C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA\Pro

# Crear nueva clave SIN passphrase
ssh-keygen -t ed25519 -C "caarevalo@hiberus.com" -f HAIDA-Deploy-NoPass

# Cuando pregunte "Enter passphrase", solo presiona Enter (vacío)
```

**Luego**:

1. Ve a GitHub: https://github.com/CarlosArturoArevaloM/HAIDA/settings/keys
2. Elimina la clave antigua "HAIDA-Deploy"
3. Agrega la nueva clave pública:
   ```powershell
   cat C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA\Pro\HAIDA-Deploy-NoPass.pub
   ```
4. Actualiza la configuración:
   ```powershell
   # Editar .git/config-ssh
   # Cambiar: IdentityFile C:/Users/.../HAIDA-Deploy
   # Por:     IdentityFile C:/Users/.../HAIDA-Deploy-NoPass
   ```

---

### Opción 3: Usar HTTPS en lugar de SSH

Si SSH es complicado, puedes usar HTTPS con token de GitHub:

```powershell
# Cambiar a HTTPS
git remote set-url origin https://github.com/CarlosArturoArevaloM/HAIDA.git

# Al hacer push, te pedirá username y password
# Username: CarlosArturoArevaloM
# Password: [Personal Access Token de GitHub]
```

**Crear Personal Access Token**:
1. Ve a: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Selecciona permisos: `repo` (todos)
4. Copia el token generado
5. Úsalo como password al hacer push

---

## 🚀 Recomendación: Opción 1 (SSH Agent)

Es la más segura y conveniente. Ejecuta esto AHORA:

```powershell
# 1. Iniciar SSH Agent
Start-Service ssh-agent

# 2. Agregar tu clave (ingresa tu passphrase cuando lo pida)
ssh-add C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA\Pro\HAIDA-Deploy

# 3. Verificar
ssh-add -l

# 4. Probar conexión (NO debe pedir passphrase)
ssh -F .git/config-ssh -T git@github.com

# 5. Hacer push (NO debe pedir passphrase)
git push -u origin main
```

---

## 📝 Automatizar SSH Agent (Opcional)

Para que SSH Agent inicie automáticamente con Windows:

### PowerShell Profile

```powershell
# Editar profile
notepad $PROFILE

# Agregar estas líneas:
# Start SSH Agent automatically
if ((Get-Service ssh-agent).Status -ne 'Running') {
    Start-Service ssh-agent
}

# Auto-add HAIDA key
$keyPath = "$env:USERPROFILE\Documents\Proyectos\HAIDA\Pro\HAIDA-Deploy"
if (Test-Path $keyPath) {
    ssh-add $keyPath 2>$null
}

# Guardar y cerrar
```

---

## 🔍 Verificar Estado

### Ver claves cargadas:

```powershell
ssh-add -l
```

Salida esperada:
```
256 SHA256:9um1TTWmdzu/woGrJmJQ+m9mTSwkPkmBmuHDX4IrPb8 caarevalo@hiberus.com (ED25519)
```

### Probar conexión:

```powershell
ssh -F .git/config-ssh -T git@github.com
```

Salida esperada:
```
Hi CarlosArturoArevaloM! You've successfully authenticated, but GitHub does not provide shell access.
```

---

## ❓ FAQ

### ¿Por qué mi clave tiene passphrase?

Porque cuando la creaste, GitHub Desktop o ssh-keygen te pidió una contraseña por seguridad.

### ¿Es seguro quitar la passphrase?

- **Con passphrase**: Más seguro. Si alguien roba tu clave, necesita la contraseña.
- **Sin passphrase**: Menos seguro. Si alguien roba tu clave, puede usarla directamente.

Para proyectos personales/internos en PC segura → OK sin passphrase
Para proyectos críticos/servers → Mejor CON passphrase + SSH Agent

### ¿Puedo usar GitHub Desktop?

Sí! GitHub Desktop maneja SSH automáticamente. Descárgalo de: https://desktop.github.com/

---

## 🎯 SIGUIENTE PASO

Elige tu opción:

### A) SSH Agent (RECOMENDADO)

```powershell
Start-Service ssh-agent
ssh-add C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA\Pro\HAIDA-Deploy
git push -u origin main
```

### B) Clave sin passphrase

```powershell
cd Pro
ssh-keygen -t ed25519 -C "caarevalo@hiberus.com" -f HAIDA-Deploy-NoPass
# (presiona Enter para passphrase vacía)
# Actualiza en GitHub y .git/config-ssh
```

### C) HTTPS con token

```powershell
git remote set-url origin https://github.com/CarlosArturoArevaloM/HAIDA.git
# Crea token en: https://github.com/settings/tokens
git push -u origin main
# Username: CarlosArturoArevaloM
# Password: [tu token]
```

---

**Recomendación**: Usa **Opción A** (SSH Agent) ahora mismo para hacer el push inicial. 🚀
