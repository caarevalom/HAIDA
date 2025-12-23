# Microsoft Entra ID (Azure AD) - Configuración Completa

## 📋 Resumen

Esta guía te ayudará a registrar HAIDA en Azure AD para permitir el login con cuentas de Microsoft corporativas.

**Tiempo estimado:** 15 minutos
**Requisitos:** Cuenta de Microsoft con permisos de administrador en Azure AD

---

## 🔑 Paso 1: Registrar Aplicación en Azure Portal

### 1.1 Acceder al Portal

```bash
# Abrir Azure Portal
https://portal.azure.com
```

1. Ir a **Azure Active Directory** (o buscar "Entra ID")
2. En el menú lateral, seleccionar **App registrations**
3. Click en **+ New registration**

### 1.2 Configurar Registro

**Nombre de la aplicación:**
```
HAIDA - QA Automation Platform
```

**Supported account types:**
- ☑️ **Accounts in this organizational directory only** (Single tenant)
  - Usar esta opción si solo quieres que usuarios de tu empresa accedan

**Redirect URI:**
```
Type: Web
URI: https://haida-frontend.vercel.app/auth/callback
```

**IMPORTANTE:** Esta URL debe coincidir exactamente con la configurada en el backend.

4. Click en **Register**

---

## 🔐 Paso 2: Obtener Credenciales

### 2.1 Application (client) ID

Después del registro, verás la página de "Overview":

1. Copia el **Application (client) ID**
   ```
   Ejemplo: 12345678-1234-1234-1234-123456789abc
   ```

2. Este será tu `ENTRA_CLIENT_ID`

### 2.2 Directory (tenant) ID

1. En la misma página, copia el **Directory (tenant) ID**
   ```
   Ejemplo: 98765432-4321-4321-4321-9876543210xyz
   ```

2. Usarás esto para construir el `ENTRA_AUTHORITY`:
   ```
   https://login.microsoftonline.com/{TENANT_ID}
   ```

### 2.3 Client Secret

1. En el menú lateral, ir a **Certificates & secrets**
2. Click en **+ New client secret**
3. Configurar:
   - **Description:** `HAIDA Production Secret`
   - **Expires:** `24 months` (recomendado)
4. Click **Add**
5. **¡IMPORTANTE!** Copia el **Value** INMEDIATAMENTE
   ```
   Ejemplo: abC~1234567890aBcDeFgHiJkLmNoPqRsTuVwXyZ
   ```
6. Este será tu `ENTRA_CLIENT_SECRET`
7. ⚠️ **NO podrás volver a ver este valor**

---

## 🔧 Paso 3: Configurar Permisos API

### 3.1 API Permissions

1. En el menú lateral, ir a **API permissions**
2. Click en **+ Add a permission**
3. Seleccionar **Microsoft Graph**
4. Seleccionar **Delegated permissions**
5. Agregar estos permisos:
   - ☑️ `User.Read` (ya debería estar)
   - ☑️ `email`
   - ☑️ `profile`
   - ☑️ `openid`

6. Click **Add permissions**

### 3.2 Grant Admin Consent (Importante)

1. Click en **Grant admin consent for [Tu Organización]**
2. Confirmar el consentimiento
3. Verificar que todos los permisos muestren ✅ en "Status"

---

## 🌐 Paso 4: Configurar Redirect URIs

### 4.1 Authentication Settings

1. En el menú lateral, ir a **Authentication**
2. Verificar que esté la Redirect URI:
   ```
   https://haida-frontend.vercel.app/auth/callback
   ```

### 4.2 Agregar URI Adicional para Desarrollo (Opcional)

Si quieres probar localmente:

1. Click en **+ Add URI**
2. Agregar:
   ```
   http://localhost:5173/auth/callback
   ```

### 4.3 Implicit Grant y Hybrid Flows

En la sección **Implicit grant and hybrid flows**:
- ☐ Access tokens (NO)
- ☑️ ID tokens (SÍ)

4. Click **Save**

---

## ⚙️ Paso 5: Configurar Variables de Entorno en Vercel

### 5.1 Variables para Backend (haida)

```bash
cd HAIDA
vercel env add ENTRA_CLIENT_ID production
# Pegar el Application (client) ID

vercel env add ENTRA_CLIENT_SECRET production
# Pegar el Client Secret value

vercel env add ENTRA_AUTHORITY production
# Pegar: https://login.microsoftonline.com/{TENANT_ID}

vercel env add ENTRA_REDIRECT_URI production
# Pegar: https://haida-frontend.vercel.app/auth/callback
```

### 5.2 También Agregar para Preview y Development

```bash
# Preview
echo "CLIENT_ID_VALUE" | vercel env add ENTRA_CLIENT_ID preview
echo "CLIENT_SECRET_VALUE" | vercel env add ENTRA_CLIENT_SECRET preview
echo "https://login.microsoftonline.com/TENANT_ID" | vercel env add ENTRA_AUTHORITY preview
echo "https://haida-frontend.vercel.app/auth/callback" | vercel env add ENTRA_REDIRECT_URI preview

# Development (para testing local)
echo "CLIENT_ID_VALUE" | vercel env add ENTRA_CLIENT_ID development
echo "CLIENT_SECRET_VALUE" | vercel env add ENTRA_CLIENT_SECRET development
echo "https://login.microsoftonline.com/TENANT_ID" | vercel env add ENTRA_AUTHORITY development
echo "http://localhost:5173/auth/callback" | vercel env add ENTRA_REDIRECT_URI development
```

---

## 🚀 Paso 6: Redesplegar Aplicación

```bash
# Backend
cd HAIDA
vercel --prod

# Frontend
cd Figma
vercel --prod
```

---

## ✅ Paso 7: Probar el Login

### 7.1 Verificar Configuración

```bash
# Verificar que el backend tiene Entra configurado
curl https://haida-one.vercel.app/entra/status

# Debería devolver:
{
  "configured": true,
  "client_id_set": true,
  "client_secret_set": true,
  "redirect_uri": "https://haida-frontend.vercel.app/auth/callback",
  "authority": "https://login.microsoftonline.com/TENANT_ID"
}
```

### 7.2 Flujo de Login

1. Abrir https://haida-frontend.vercel.app
2. Click en botón **"Sign in with Microsoft"**
3. Serás redirigido a Microsoft login
4. Ingresar credenciales corporativas
5. Aceptar permisos (primera vez)
6. Serás redirigido de vuelta a HAIDA
7. Login automático completado ✅

---

## 🔒 Seguridad y Mejores Prácticas

### Renovación de Secrets

- Los Client Secrets expiran (24 meses recomendado)
- Crear calendario para renovar ANTES de expiración
- Azure enviará emails de aviso

### Usuarios Permitidos

Para restringir qué usuarios pueden acceder:

1. En Azure AD → **App registrations** → Tu App
2. Ir a **Enterprise applications**
3. **Properties** → **Assignment required** = Yes
4. En **Users and groups**, agregar solo usuarios autorizados

### Auditoría

- Revisar **Sign-in logs** en Azure AD regularmente
- Monitorear intentos fallidos de login
- Revisar permisos otorgados

---

## 📊 Diagrama de Flujo OAuth2

```
┌─────────┐                                  ┌──────────────┐
│ Usuario │                                  │   Azure AD   │
└────┬────┘                                  └──────┬───────┘
     │                                              │
     │ 1. Click "Sign in with Microsoft"           │
     ├─────────────────────────────────────────────►
     │                                              │
     │ 2. Redirect to Microsoft login page         │
     ◄─────────────────────────────────────────────┤
     │                                              │
     │ 3. User enters credentials                   │
     ├─────────────────────────────────────────────►
     │                                              │
     │ 4. Redirect with authorization code         │
     ◄─────────────────────────────────────────────┤
     │                                              │
     ▼                                              │
┌──────────────┐                                   │
│ HAIDA Backend│                                   │
└──────┬───────┘                                   │
       │ 5. Exchange code for tokens               │
       ├──────────────────────────────────────────►│
       │                                            │
       │ 6. Return access_token + id_token         │
       ◄────────────────────────────────────────────┤
       │                                            │
       │ 7. Validate token & create user           │
       │                                            │
       │ 8. Generate HAIDA JWT token               │
       │                                            │
       ▼                                            │
┌──────────────┐                                   │
│HAIDA Frontend│                                   │
└──────┬───────┘                                   │
       │ 9. Store JWT in localStorage               │
       │                                            │
       │ 10. Redirect to Dashboard                 │
       │                                            │
       ▼                                            │
   Dashboard ✅
```

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
**Solución:** La URI de callback en Azure AD NO coincide con la configurada en `ENTRA_REDIRECT_URI`

### Error: "invalid_client"
**Solución:** El Client Secret es incorrecto o ha expirado

### Error: "unauthorized_client"
**Solución:** Falta otorgar "Grant admin consent" para los permisos

### Error: "User not allowed"
**Solución:** El usuario no tiene permisos. Agregar en "Users and groups" en Enterprise applications

---

## 📞 Soporte

- Azure AD Documentation: https://docs.microsoft.com/azure/active-directory/
- Microsoft Graph API: https://docs.microsoft.com/graph/
- MSAL Python: https://msal-python.readthedocs.io/

---

## ✨ Siguientes Pasos

Una vez configurado el login de Microsoft:

1. ✅ Los usuarios pueden hacer login con sus cuentas corporativas
2. ✅ No necesitan crear contraseñas adicionales
3. ✅ Las credenciales de Microsoft se almacenan para llamadas a Graph API
4. ✅ Puedes usar Microsoft Graph para:
   - Obtener información del perfil
   - Acceder a OneDrive
   - Leer calendario
   - Enviar emails
   - Y más...

---

**¡Login de Microsoft listo para usar!** 🚀
