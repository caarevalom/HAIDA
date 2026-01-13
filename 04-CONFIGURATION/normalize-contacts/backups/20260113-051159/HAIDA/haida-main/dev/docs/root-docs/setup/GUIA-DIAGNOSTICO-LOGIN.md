# 🔍 GUÍA DE DIAGNÓSTICO - PROBLEMAS DE LOGIN

**Fecha**: 30 Diciembre 2025
**URL**: https://haida.carlosarta.com

---

## ✅ Estado del Sistema

### Backend
- ✅ Supabase Auth: **OPERATIVO**
- ✅ Email Provider: **HABILITADO**
- ✅ Usuario admin existe: **SÍ**
- ✅ Usuario activo: **SÍ**
- ✅ Password correcto: **VERIFICADO**

### Tests Realizados
```bash
# Test de login directo con Supabase
node scripts/test-admin-login.js
✅ LOGIN EXITOSO

# Test de flujo completo
node scripts/test-frontend-login.js
✅ FLUJO COMPLETO EXITOSO
```

**Conclusión**: El problema NO es del backend. El login funciona correctamente desde el código.

---

## 🛠️ Pasos de Diagnóstico en el Navegador

### Paso 1: Limpiar Datos del Navegador

El problema más común es que hay datos antiguos en el navegador que causan conflicto.

#### Chrome/Edge:

1. Abre las **DevTools** (F12 o Ctrl+Shift+I)
2. Ve a la pestaña **Application**
3. En el panel izquierdo, expande **Storage**
4. Click derecho en el dominio `haida.carlosarta.com`
5. Selecciona **"Clear site data"** o **"Delete data"**
6. Confirma
7. **Cierra completamente el navegador** (todas las ventanas)
8. Vuelve a abrir y accede a https://haida.carlosarta.com

#### Firefox:

1. Abre las **DevTools** (F12 o Ctrl+Shift+I)
2. Ve a la pestaña **Storage**
3. Click derecho en el dominio
4. Selecciona **"Delete All"**
5. **Cierra completamente el navegador**
6. Vuelve a abrir y accede a https://haida.carlosarta.com

#### Safari:

1. Menú **Develop** → **Empty Caches**
2. Menú **Safari** → **Preferences** → **Privacy** → **Manage Website Data**
3. Busca `haida.carlosarta.com` y elimina
4. **Cierra completamente el navegador**
5. Vuelve a abrir y accede a https://haida.carlosarta.com

---

### Paso 2: Verificar Credenciales

Asegúrate de usar las credenciales **exactas**:

```
Email: hola@stayarta.com
Password: AdminCTB2025Pass
```

**Importante**:
- ✅ Email en minúsculas
- ✅ Password con mayúsculas en "A", "CTB" y "P"
- ✅ Sin espacios antes o después
- ❌ NO uses autofill (puede tener datos antiguos)

---

### Paso 3: Verificar en Consola del Navegador

1. Abre **DevTools** (F12)
2. Ve a la pestaña **Console**
3. Intenta hacer login
4. Busca mensajes en la consola

#### Mensajes Esperados (✅ CORRECTO):

```
Supabase session detected: hola@stayarta.com
Supabase auth state changed: SIGNED_IN
```

#### Mensajes de Error Comunes:

##### Error 1: "Invalid login credentials"
```
❌ Error: Invalid login credentials
```

**Solución**: Verifica que la contraseña sea exactamente `AdminCTB2025Pass`

##### Error 2: "Email logins are disabled"
```
❌ Error: Email logins are disabled
```

**Solución**: Ir a Supabase Dashboard → Authentication → Providers → Habilitar "Email"

##### Error 3: "User not found in database"
```
⚠️ User not found in database, using session data
```

**Solución**: Esto es solo un warning. El login debería funcionar de todas formas.

##### Error 4: CORS Error
```
❌ Access to fetch at 'https://...' from origin 'https://haida.carlosarta.com' has been blocked by CORS
```

**Solución**: Verificar configuración de Supabase. Ir a Dashboard → Settings → API → URL Configuration

---

### Paso 4: Verificar Network

1. Abre **DevTools** (F12)
2. Ve a la pestaña **Network**
3. Marca **"Preserve log"**
4. Intenta hacer login
5. Busca requests a Supabase

#### Request Exitoso (✅):

```
Request URL: https://wdebyxvtunromsnkqbrd.supabase.co/auth/v1/token?grant_type=password
Status: 200 OK
Response: {
  "access_token": "eyJhbGci...",
  "refresh_token": "...",
  "user": { "email": "hola@stayarta.com", ... }
}
```

#### Request Fallido (❌):

```
Status: 400 Bad Request
Response: {
  "error": "invalid_grant",
  "error_description": "Invalid login credentials"
}
```

**Solución**: Contraseña incorrecta. Verifica `AdminCTB2025Pass`

---

## 🔐 Funcionalidad "Remember Me"

### Cómo Funciona

- **✅ Checkbox marcado**: La sesión persiste por **30 días** en localStorage
- **❌ Checkbox NO marcado**: La sesión persiste hasta cerrar el navegador

### Verificar

1. Haz login con "Remember me" **marcado**
2. Abre **DevTools** → **Application** → **Local Storage**
3. Busca `sb-wdebyxvtunromsnkqbrd-auth-token`
4. Debería estar presente
5. **Cierra el navegador** completamente
6. **Abre de nuevo** y accede a https://haida.carlosarta.com
7. Deberías estar **automáticamente logueado** (no pide credenciales)

---

## 🚨 Problemas Comunes y Soluciones

### Problema 1: "Authentication Failed" sin más detalles

**Causas**:
- Datos antiguos en localStorage
- Sesión corrupta de login anterior
- Cookies de dominio anterior

**Solución**:
1. Limpiar **completamente** los datos del sitio (Paso 1)
2. Abrir el sitio en **modo incógnito/privado**
3. Intentar login

---

### Problema 2: Login se queda "cargando" infinitamente

**Causas**:
- Request bloqueado por firewall/proxy
- CORS no configurado correctamente
- Supabase URL incorrecta

**Solución**:
1. Abrir **DevTools** → **Network**
2. Ver si hay requests **pendientes** (en rojo)
3. Ver detalles del error
4. Si es CORS, contactar admin de Supabase

---

### Problema 3: Login exitoso pero redirige inmediatamente al login

**Causas**:
- Session no se guarda en localStorage
- ProtectedRoute falla verificación
- Token inválido

**Solución**:
1. Abrir **DevTools** → **Application** → **Local Storage**
2. Verificar que existe `sb-wdebyxvtunromsnkqbrd-auth-token`
3. Si NO existe, hay problema con permisos de localStorage
4. Verificar configuración de privacidad del navegador

---

### Problema 4: Error "Failed to fetch"

**Causas**:
- Sin conexión a Internet
- Supabase URL incorrecta
- Firewall bloqueando Supabase

**Solución**:
1. Verificar conexión a Internet
2. Intentar acceder directamente a: https://wdebyxvtunromsnkqbrd.supabase.co
3. Si no carga, problema de red/firewall

---

## 📱 Prueba en Modo Incógnito

**Mejor forma de verificar si el problema es de datos del navegador**:

### Chrome/Edge:
- Windows: `Ctrl + Shift + N`
- Mac: `Cmd + Shift + N`

### Firefox:
- Windows: `Ctrl + Shift + P`
- Mac: `Cmd + Shift + P`

### Safari:
- Menú **File** → **New Private Window**

**Si funciona en modo incógnito** → El problema es datos antiguos en el navegador normal
**Si NO funciona en modo incógnito** → El problema es de configuración

---

## 🔧 Solución Rápida (90% de los casos)

```bash
# Paso 1: Limpia localStorage
1. F12 → Application → Storage → Clear site data

# Paso 2: Cierra TODAS las ventanas del navegador

# Paso 3: Abre modo incógnito
Ctrl+Shift+N (Chrome) o Ctrl+Shift+P (Firefox)

# Paso 4: Accede a https://haida.carlosarta.com

# Paso 5: Login con credenciales exactas
Email: hola@stayarta.com
Password: AdminCTB2025Pass

# Paso 6: Si funciona, repite en navegador normal después de limpiar
```

---

## 📊 Credenciales de Test

Si `hola@stayarta.com` no funciona, prueba con otros usuarios:

### Admin Alternativo
```
Email: hola@stayarta.com
Password: AdminCTB2025Pass
Rol: admin
```

### QA Engineer
```
Email: hola@stayarta.com
Password: QA2025Pass
Rol: qa_engineer
```

### Developer
```
Email: hola@stayarta.com
Password: Dev2025Pass
Rol: developer
```

### Viewer
```
Email: hola@stayarta.com
Password: HaidaTest2025Pass
Rol: viewer
```

---

## 🆘 Si Nada Funciona

### Opción 1: Crear Nuevo Usuario

1. En la página de login, click en **"Sign Up"**
2. Ingresa:
   - Email: `hola@stayarta.com`
   - Password: `TuPassword123!`
   - Full Name: `Tu Nombre`
3. Se creará con rol `viewer` por defecto
4. Puedes cambiar el rol después desde gestión de usuarios (si eres admin)

### Opción 2: Reset de Contraseña

1. En la página de login, click en **"Forgot Password?"**
2. Ingresa: `hola@stayarta.com`
3. Recibirás un email con link de reset
4. Crea nueva contraseña
5. Intenta login con nueva contraseña

### Opción 3: Contactar Administrador

Si ninguna solución funciona, contacta al administrador del sistema con:

1. **Screenshot** del error en consola
2. **Screenshot** de Network tab mostrando el request fallido
3. **Navegador y versión** que estás usando
4. **Sistema operativo**

---

## ✅ Checklist de Verificación

Antes de reportar un problema, verifica:

- [ ] Limpiaste localStorage completamente
- [ ] Cerraste TODAS las ventanas del navegador
- [ ] Probaste en modo incógnito
- [ ] Verificaste que el email es `hola@stayarta.com` (minúsculas)
- [ ] Verificaste que el password es `AdminCTB2025Pass` (con mayúsculas)
- [ ] Verificaste en DevTools → Console que no hay errores
- [ ] Verificaste en DevTools → Network que el request llega a Supabase
- [ ] Probaste con otro navegador (Chrome, Firefox, Safari, Edge)
- [ ] Verificaste que tienes conexión a Internet
- [ ] Probaste con otro usuario de test

---

## 📞 Soporte

**URL Frontend**: https://haida.carlosarta.com
**Supabase URL**: https://wdebyxvtunromsnkqbrd.supabase.co
**Documentación**: [LOGIN-REPARADO.md](LOGIN-REPARADO.md)

**Última actualización**: 30 Diciembre 2025, 11:40 UTC
