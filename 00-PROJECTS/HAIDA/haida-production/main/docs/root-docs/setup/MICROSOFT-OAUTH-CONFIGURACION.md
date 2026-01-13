# 🔐 Configuración de Microsoft OAuth (Entra ID)

**Problema actual**: El callback de Microsoft OAuth está redirigiendo a `localhost` en lugar de tu dominio de producción.

**Error**: `ERR_CONNECTION_REFUSED` cuando intentas hacer login con Microsoft.

---

## 🎯 Solución Paso a Paso

### Paso 1: Identificar URLs Correctas

Según tu configuración de Vercel, tienes:

- **Backend API**: `https://haida-one.vercel.app`
- **Frontend**: `https://haida-frontend.vercel.app` (o un dominio personalizado)

**URLs necesarias para Microsoft OAuth**:
- **Redirect URI**: `https://haida.stayarta.com/auth`
- **Logout URI**: `https://haida-frontend.vercel.app`

### Paso 2: Configurar en Azure AD (Entra ID)

#### 2.1 Acceder al Portal de Azure

1. Ve a: https://portal.azure.com
2. Busca "Azure Active Directory" o "Microsoft Entra ID"
3. En el menú lateral, haz clic en **"App registrations"** (Registros de aplicaciones)

#### 2.2 Encontrar tu Aplicación

1. Busca tu aplicación HAIDA en la lista
2. Si no existe, créala:
   - Haz clic en **"New registration"**
   - Nombre: `HAIDA Production`
   - Supported account types: **"Accounts in any organizational directory (Any Azure AD directory - Multitenant)"**
   - Redirect URI: **Web** → `https://haida.stayarta.com/auth`
   - Haz clic en **"Register"**

#### 2.3 Configurar Redirect URIs

1. En tu aplicación, ve a **"Authentication"** (Autenticación)
2. En la sección **"Platform configurations"** → **"Web"**
3. Agrega las siguientes URIs de redirección:
   ```
   https://haida.stayarta.com/auth
   https://haida-one.vercel.app/entra/callback
   http://localhost:5173/auth/callback (solo para desarrollo local)
   ```
4. En **"Logout URL"** (URL de cierre de sesión):
   ```
   https://haida-frontend.vercel.app
   ```
5. Habilita **"ID tokens"** (tokens de identificador) si no está habilitado
6. Haz clic en **"Save"** (Guardar)

#### 2.4 Obtener Client ID y Client Secret

**Client ID**:
1. Ve a **"Overview"** (Información general)
2. Copia el valor de **"Application (client) ID"**
3. Ejemplo: `12345678-1234-1234-1234-123456789abc`

**Client Secret**:
1. Ve a **"Certificates & secrets"** (Certificados y secretos)
2. En **"Client secrets"** haz clic en **"New client secret"**
3. Descripción: `HAIDA Production Secret`
4. Expira: `24 months` (recomendado)
5. Haz clic en **"Add"**
6. **¡IMPORTANTE!** Copia el **Value** inmediatamente (solo se muestra una vez)
7. Ejemplo: `abC~xyz123456789~AbCdEfGhIjKlMnOpQrStUvWx`

#### 2.5 Configurar Permisos (API Permissions)

1. Ve a **"API permissions"** (Permisos de API)
2. Asegúrate de tener estos permisos de **Microsoft Graph**:
   - `User.Read` (Delegated)
   - `email` (Delegated)
   - `profile` (Delegated)
   - `openid` (Delegated)
3. Si faltan, haz clic en **"Add a permission"** → **"Microsoft Graph"** → **"Delegated permissions"**
4. Haz clic en **"Grant admin consent for [tu organización]"** (Conceder consentimiento de administrador)

### Paso 3: Configurar Variables de Entorno en Vercel

#### 3.1 Backend (haida)

```bash
# Configurar en Vercel Dashboard o por CLI
vercel env add ENTRA_CLIENT_ID production
# Pegar el Client ID cuando te lo pida

vercel env add ENTRA_CLIENT_SECRET production
# Pegar el Client Secret cuando te lo pida

vercel env add ENTRA_REDIRECT_URI production
# Valor: https://haida.stayarta.com/auth

vercel env add ENTRA_AUTHORITY production
# Valor: https://login.microsoftonline.com/common
```

**O mediante el Dashboard de Vercel**:

1. Ve a: https://vercel.com/carlos-arevalos-projects-cf7340ea/haida/settings/environment-variables
2. Agrega las siguientes variables para **Production**:

| Name | Value | Environment |
|------|-------|-------------|
| `ENTRA_CLIENT_ID` | `[tu-client-id]` | Production |
| `ENTRA_CLIENT_SECRET` | `[tu-client-secret]` | Production |
| `ENTRA_REDIRECT_URI` | `https://haida.stayarta.com/auth` | Production |
| `ENTRA_AUTHORITY` | `https://login.microsoftonline.com/common` | Production |

3. Haz clic en **"Save"** en cada variable

#### 3.2 Re-desplegar Backend

```bash
# Desde la raíz del proyecto
vercel --prod --yes
```

### Paso 4: Configurar Frontend

#### 4.1 Verificar Callback Route

El frontend debe tener una ruta `/auth/callback` que maneje el código de autorización de Microsoft.

**Ejemplo de implementación** (crear si no existe):

```typescript
// Figma/src/app/pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      navigate('/login?error=' + error);
      return;
    }

    if (code) {
      // Enviar código al backend
      fetch('https://haida-one.vercel.app/entra/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
        .then(res => res.json())
        .then(data => {
          // Guardar token
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('user', JSON.stringify(data.user));
          // Redirigir a dashboard
          navigate('/dashboard');
        })
        .catch(err => {
          console.error('Callback error:', err);
          navigate('/login?error=callback_failed');
        });
    } else {
      navigate('/login?error=no_code');
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Autenticando con Microsoft...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
}
```

#### 4.2 Actualizar Router

Asegúrate de que tu router incluya la ruta de callback:

```typescript
// En tu archivo de rutas (App.tsx o similar)
import { AuthCallback } from './pages/AuthCallback';

// ...en tus routes:
<Route path="/auth/callback" element={<AuthCallback />} />
```

#### 4.3 Botón de Login con Microsoft

```typescript
// En tu página de Login
const handleMicrosoftLogin = async () => {
  try {
    const response = await fetch('https://haida-one.vercel.app/entra/login');
    const data = await response.json();

    if (data.auth_url) {
      // Redirigir a Microsoft
      window.location.href = data.auth_url;
    }
  } catch (error) {
    console.error('Failed to initiate Microsoft login:', error);
  }
};

// Botón:
<button onClick={handleMicrosoftLogin} className="...">
  <svg>...</svg> {/* Microsoft logo */}
  Continuar con Microsoft
</button>
```

### Paso 5: Verificar Configuración

#### 5.1 Verificar Backend

```bash
curl https://haida-one.vercel.app/entra/status | python3 -m json.tool
```

**Resultado esperado**:
```json
{
  "configured": true,
  "client_id_set": true,
  "client_secret_set": true,
  "redirect_uri": "https://haida.stayarta.com/auth",
  "authority": "https://login.microsoftonline.com/common"
}
```

Si `configured: false`, las variables de entorno no están configuradas correctamente.

#### 5.2 Probar Flujo Completo

1. Ve a tu frontend: `https://haida-frontend.vercel.app/login`
2. Haz clic en "Continuar con Microsoft"
3. Deberías ser redirigido a la página de login de Microsoft
4. Después de autenticarte, deberías volver a `/auth/callback`
5. El callback debe procesar el código y redirigirte al dashboard

### Paso 6: Troubleshooting

#### Error: "AADSTS50011: The redirect URI specified does not match"

**Causa**: La URL de redirección no está registrada en Azure AD.

**Solución**:
1. Ve a Azure AD → Tu app → Authentication
2. Verifica que la URL exacta esté en la lista (con/sin trailing slash)
3. Espera 5 minutos para que los cambios se propaguen

#### Error: "ERR_CONNECTION_REFUSED" (localhost)

**Causa**: La variable `ENTRA_REDIRECT_URI` no está configurada en Vercel.

**Solución**:
1. Verifica que la variable esté en Vercel Dashboard
2. Re-despliega el backend: `vercel --prod --yes`
3. Verifica con: `curl https://haida-one.vercel.app/entra/status`

#### Error: "Invalid client secret"

**Causa**: El Client Secret expiró o es incorrecto.

**Solución**:
1. Genera un nuevo Client Secret en Azure AD
2. Actualiza la variable en Vercel
3. Re-despliega

#### Error: "User does not have access"

**Causa**: El usuario no está en el directorio permitido.

**Solución**:
1. Cambia "Supported account types" a "Multitenant" en Azure AD
2. O agrega al usuario específico en tu Azure AD

---

## 📋 Checklist de Configuración

- [ ] Aplicación creada en Azure AD (Entra ID)
- [ ] Redirect URI configurado: `https://haida.stayarta.com/auth`
- [ ] Client ID copiado
- [ ] Client Secret generado y copiado
- [ ] Permisos API configurados (User.Read, email, profile, openid)
- [ ] Admin consent otorgado
- [ ] Variables de entorno en Vercel (ENTRA_CLIENT_ID, ENTRA_CLIENT_SECRET, ENTRA_REDIRECT_URI, ENTRA_AUTHORITY)
- [ ] Backend re-desplegado
- [ ] Ruta `/auth/callback` implementada en frontend
- [ ] Botón de login con Microsoft implementado
- [ ] Flujo probado end-to-end

---

## 🔍 Verificación Final

**Comando de verificación**:
```bash
# 1. Verificar configuración del backend
curl https://haida-one.vercel.app/entra/status | python3 -m json.tool

# 2. Obtener URL de autenticación
curl https://haida-one.vercel.app/entra/login | python3 -m json.tool

# 3. El resultado debería incluir auth_url válida
# {
#   "auth_url": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?...",
#   "configured": true
# }
```

**Si todo está bien configurado**:
- `configured: true`
- `auth_url` empieza con `https://login.microsoftonline.com/`
- No hay errores 501 (Not Implemented)

---

## 📞 Soporte

Si después de seguir estos pasos aún tienes problemas:

1. **Verifica logs de Vercel**:
   ```bash
   vercel logs https://haida-one.vercel.app --follow
   ```

2. **Verifica variables de entorno**:
   ```bash
   vercel env ls
   ```

3. **Verifica que el deployment usó las variables**:
   ```bash
   vercel inspect [deployment-url] --logs
   ```

---

**Fecha**: ++34662652300
**Estado**: Pendiente de configuración
**Prioridad**: Media (OAuth funcional es nice-to-have, el sistema ya funciona con email/password)
