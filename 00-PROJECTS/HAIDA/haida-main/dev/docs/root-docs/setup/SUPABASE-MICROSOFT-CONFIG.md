# Configuración de Microsoft en Supabase

## Información de tu App Azure

```
Application (client) ID: 93dae11f-417c-49ff-8d66-d642afb66327
Directory (tenant) ID: 9b7594d6-2c7d-4fe2-b248-213f64996877
Client Secret: SSp8Q~Ozoqcwnep-H~0v~reV27ehg7JNB-SAbc9l
```

## Pasos en Supabase Dashboard

### 1. Acceder a Supabase

```
https://supabase.com/dashboard
```

### 2. Ir a Authentication

1. Seleccionar proyecto HAIDA
2. Click en **Authentication** en menú lateral
3. Click en pestaña **Providers**

### 3. Configurar Azure (Microsoft)

1. Buscar **Azure** en la lista de providers
2. Click en **Azure**
3. **Enable Azure Provider** (toggle ON)

### 4. Ingresar Credenciales

```
Azure Client ID:
93dae11f-417c-49ff-8d66-d642afb66327

Azure Secret:
SSp8Q~Ozoqcwnep-H~0v~reV27ehg7JNB-SAbc9l

Azure Tenant ID (opcional - dejar en blanco para 'common'):
[Dejar vacío para permitir todas las cuentas Microsoft]

O si solo quieres tu organización:
9b7594d6-2c7d-4fe2-b248-213f64996877
```

**IMPORTANTE:**

- Si dejas el Tenant ID **vacío** o usas "common", permite cuentas personales Y organizacionales
- Si pones tu Tenant ID específico, solo permite cuentas de tu organización

### 5. Configurar Scopes (Permisos)

Supabase debería tener estos scopes por defecto:

```
openid email profile
```

Si no están, agrégalos manualmente.

### 6. Guardar

Click en **Save** al final de la página.

---

## ✅ Verificación en Azure

Asegúrate de tener estos permisos en Azure AD:

1. **API permissions**:
   - ✅ Microsoft Graph → User.Read
   - ✅ Microsoft Graph → email
   - ✅ Microsoft Graph → profile
   - ✅ Microsoft Graph → openid

2. **Grant admin consent** (importante):
   - Click en "Grant admin consent for [Organization]"

---

## 🧪 Probar Configuración

### Desde Supabase Dashboard

1. En **Authentication** → **Providers** → **Azure**
2. Debería mostrar **Enabled** ✅
3. Copiar la **Callback URL** que Supabase muestra:
   ```
   https://wdebyxvtunromsnkqbrd.supabase.co/auth/v1/callback
   ```
4. Verificar que esta URL esté en Azure → Authentication → Redirect URIs

---

## 🔐 URLs Importantes

```
Authority: https://login.microsoftonline.com/common
Authorize: https://login.microsoftonline.com/common/oauth2/v2.0/authorize
Token: https://login.microsoftonline.com/common/oauth2/v2.0/token
Callback: https://wdebyxvtunromsnkqbrd.supabase.co/auth/v1/callback
```

---

## ✨ Una vez configurado

Los usuarios podrán:

- Hacer click en "Sign in with Microsoft"
- Ser redirigidos a Microsoft login
- Autenticarse con credenciales Microsoft
- Volver automáticamente a HAIDA
- Quedar logueados ✅

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"

- Verificar que la callback URL de Supabase esté en Azure → Redirect URIs

### Error: "invalid_client"

- Verificar Client ID y Secret en Supabase

### Error: "unauthorized_client"

- Hacer "Grant admin consent" en Azure → API permissions

### Error: "AADSTS700016"

- Verificar que la app esté disponible en el tenant correcto
