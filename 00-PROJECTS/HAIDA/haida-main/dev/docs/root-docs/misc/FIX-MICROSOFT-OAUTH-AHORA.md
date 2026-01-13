# 🚀 Fix Microsoft OAuth - Pasos Rápidos

**Problema**: Al hacer login con Microsoft, redirige a `localhost` → `ERR_CONNECTION_REFUSED`

**Causa**: La variable `ENTRA_REDIRECT_URI` no está configurada en Vercel

---

## ✅ Solución Rápida (5 minutos)

### Opción A: Configurar via Vercel CLI (Más Rápido)

```bash
# 1. Configurar Redirect URI correcto
vercel env add ENTRA_REDIRECT_URI production
# Cuando te pregunte el valor, pega:
# https://haida-frontend.vercel.app/auth/callback

# 2. Re-desplegar backend
vercel --prod --yes

# 3. Verificar que se aplicó
curl https://haida-one.vercel.app/entra/status | python3 -m json.tool
```

### Opción B: Configurar via Vercel Dashboard

1. **Ir a**: https://vercel.com/carlos-arevalos-projects-cf7340ea/haida/settings/environment-variables

2. **Agregar variable**:
   - Click en **"Add New"**
   - Name: `ENTRA_REDIRECT_URI`
   - Value: `https://haida-frontend.vercel.app/auth/callback`
   - Environment: **Production** ✅
   - Click **"Save"**

3. **Re-desplegar**:
   ```bash
   vercel --prod --yes
   ```

---

## 🔍 Verificar que Funciona

```bash
curl https://haida-one.vercel.app/entra/status | python3 -m json.tool
```

**Resultado esperado**:
```json
{
  "configured": false,  // ← Puede ser false si no tienes ENTRA_CLIENT_ID/SECRET
  "client_id_set": false,
  "client_secret_set": false,
  "redirect_uri": "https://haida-frontend.vercel.app/auth/callback"  // ← ¡Esto es lo importante!
}
```

Si `redirect_uri` muestra la URL correcta (`haida-frontend.vercel.app` en lugar de `localhost`), el problema está resuelto parcialmente.

---

## ⚠️ Configuración Completa de Azure AD (Opcional)

**Si quieres que Microsoft OAuth funcione completamente**, necesitas también:

### 1. Crear App en Azure AD

1. Ve a: https://portal.azure.com
2. Azure Active Directory → **App registrations** → **New registration**
3. Configuración:
   - Name: `HAIDA Production`
   - Supported accounts: **Multitenant**
   - Redirect URI (Web): `https://haida-frontend.vercel.app/auth/callback`
4. Click **Register**

### 2. Obtener Credenciales

**Client ID**:
- Copia el **Application (client) ID** de la página Overview

**Client Secret**:
- Ve a **Certificates & secrets** → **New client secret**
- Description: `HAIDA Prod Secret`
- Expires: `24 months`
- **¡Copia el Value inmediatamente!** (solo se muestra una vez)

### 3. Configurar Permisos

- Ve a **API permissions**
- Add permission → Microsoft Graph → Delegated:
  - `User.Read`
  - `email`
  - `profile`
  - `openid`
- Click **Grant admin consent**

### 4. Agregar Credenciales a Vercel

```bash
vercel env add ENTRA_CLIENT_ID production
# Pegar el Client ID

vercel env add ENTRA_CLIENT_SECRET production
# Pegar el Client Secret

vercel env add ENTRA_AUTHORITY production
# Valor: https://login.microsoftonline.com/common

# Re-desplegar
vercel --prod --yes
```

### 5. Verificar Configuración Completa

```bash
curl https://haida-one.vercel.app/entra/status | python3 -m json.tool
```

**Resultado esperado con configuración completa**:
```json
{
  "configured": true,  // ← Ahora debe ser true
  "client_id_set": true,
  "client_secret_set": true,
  "redirect_uri": "https://haida-frontend.vercel.app/auth/callback",
  "authority": "https://login.microsoftonline.com/common"
}
```

### 6. Probar Login

```bash
curl https://haida-one.vercel.app/entra/login | python3 -m json.tool
```

**Resultado esperado**:
```json
{
  "auth_url": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?...",
  "redirect_uri": "https://haida-frontend.vercel.app/auth/callback",
  "configured": true
}
```

Copia el `auth_url` y ábrelo en tu navegador para probar el flujo completo.

---

## 📊 Resumen de URLs

| Componente | URL | Estado |
|------------|-----|--------|
| **Backend API** | `https://haida-one.vercel.app` | ✅ Funcionando |
| **Frontend** | `https://haida-frontend.vercel.app` | ✅ Funcionando |
| **OAuth Callback** | `https://haida-frontend.vercel.app/auth/callback` | ⚠️ Verificar implementación |
| **OAuth Login** | `https://haida-one.vercel.app/entra/login` | ⚠️ Requiere credenciales Azure |

---

## 🎯 Prioridad

**BAJA** - El sistema ya funciona completamente con email/password (60/60 tests pasando).

Microsoft OAuth es un **nice-to-have** para:
- Single Sign-On (SSO) corporativo
- Login más rápido para usuarios de Hiberus
- Integración con servicios de Microsoft (Teams, OneDrive, etc.)

**Puedes configurarlo más tarde sin afectar la funcionalidad actual.**

---

## ✅ Checklist Mínimo (para quitar error localhost)

- [ ] Agregar variable `ENTRA_REDIRECT_URI` en Vercel
- [ ] Re-desplegar backend
- [ ] Verificar con `/entra/status`

## ✅ Checklist Completo (para OAuth funcional)

- [ ] Crear app en Azure AD
- [ ] Configurar redirect URI en Azure
- [ ] Obtener Client ID y Secret
- [ ] Configurar permisos API
- [ ] Agregar variables en Vercel (CLIENT_ID, CLIENT_SECRET, AUTHORITY, REDIRECT_URI)
- [ ] Re-desplegar backend
- [ ] Implementar `/auth/callback` en frontend
- [ ] Probar flujo completo

---

**Recomendación**: Por ahora, solo ejecuta la **Opción A o B** para quitar el error de localhost. La configuración completa de Azure AD puede hacerse más adelante cuando sea necesario.
