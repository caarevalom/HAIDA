# 🔧 INSTRUCCIONES: Agregar Variable de Entorno en Vercel

## ⚠️ PROBLEMA IDENTIFICADO

El backend en Vercel está fallando al crear usuarios porque busca la variable `SUPABASE_SERVICE_ROLE_KEY` pero no está configurada en Vercel.

**Error actual:**
```
new row violates row-level security policy for table "users"
```

**Causa raíz:**
El código del backend (`api/auth.py`) busca:
```python
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
```

Pero en Vercel solo existe `SUPABASE_SERVICE_KEY` (sin `_ROLE`).

---

## ✅ SOLUCIÓN: Agregar Variable en Vercel Dashboard

### **Opción A: Desde Vercel Dashboard (Recomendado)**

1. **Abre** Vercel Dashboard:
   ```
   https://vercel.com/carlos-arevalos-projects-cf7340ea/haida-one/settings/environment-variables
   ```

2. **Click en "Add New"**

3. **Completa el formulario:**
   ```
   Key:   SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg5NTc1MSwiZXhwIjoyMDgxNDcxNzUxfQ.Jg6UBGpYDBBKvB4pgaKW_OJCTx0VOm9UMI18vqdUEJc

   Environments:
   ✅ Production
   ✅ Preview
   ✅ Development
   ```

4. **Click "Save"**

5. **Re-deploy** el proyecto:
   - Ve a: https://vercel.com/carlos-arevalos-projects-cf7340ea/haida-one
   - Click en "Deployments"
   - Click en el último deployment
   - Click en "⋯" (tres puntos) → "Redeploy"
   - Confirma "Redeploy"

---

### **Opción B: Desde CLI de Vercel**

Si prefieres usar la línea de comandos:

```bash
# Agregar variable para Production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Cuando te pregunte el valor, pega:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg5NTc1MSwiZXhwIjoyMDgxNDcxNzUxfQ.Jg6UBGpYDBBKvB4pgaKW_OJCTx0VOm9UMI18vqdUEJc

# Agregar para Preview (opcional)
vercel env add SUPABASE_SERVICE_ROLE_KEY preview

# Agregar para Development (opcional)
vercel env add SUPABASE_SERVICE_ROLE_KEY development

# Re-deploy
vercel --prod
```

---

## 🧪 Verificación después de agregar la variable

### 1. Esperar a que termine el re-deploy

Vercel tarda aproximadamente 1-2 minutos en re-desplegar.

### 2. Verificar que la variable está disponible

```bash
curl https://haida-one.vercel.app/health | python3 -m json.tool
```

**Esperado:**
```json
{
  "status": "healthy",
  "service": "HAIDA Backend",
  "version": "2.0.0"
}
```

### 3. Probar el registro de usuario

```bash
python3 << 'EOF'
import requests
import json

url = "https://haida-one.vercel.app/auth/register"
data = {
    "email": "hola@stayarta.com",
    "password": "Password2025!",
    "full_name": "Test Vercel Fix",
    "role": "viewer"
}

response = requests.post(url, headers={"Content-Type": "application/json"}, json=data)
print(f"Status: {response.status_code}")
print(json.dumps(response.json(), indent=2))

if response.status_code == 200:
    print("\n✅ ¡REGISTRO EXITOSO! Variable configurada correctamente.")
else:
    print(f"\n❌ Error {response.status_code}")
EOF
```

**Resultado esperado:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": "...",
    "email": "hola@stayarta.com",
    "name": "Test Vercel Fix",
    "role": "viewer"
  }
}
```

### 4. Ejecutar tests completos

```bash
npx playwright test tests/web-e2e/auth-api.spec.ts --project="Desktop Chrome"
```

**Esperado:**
```
12 passed (18-20s)
```

---

## 📝 Resumen de cambios necesarios

| Ubicación | Variable | Valor | Estado |
|-----------|----------|-------|--------|
| `.env` local | SUPABASE_SERVICE_ROLE_KEY | eyJhbGciOiJI... | ✅ AGREGADO |
| Vercel (Production) | SUPABASE_SERVICE_ROLE_KEY | eyJhbGciOiJI... | ⏳ PENDIENTE |
| Vercel (Preview) | SUPABASE_SERVICE_ROLE_KEY | eyJhbGciOiJI... | ⏳ OPCIONAL |
| Vercel (Development) | SUPABASE_SERVICE_ROLE_KEY | eyJhbGciOiJI... | ⏳ OPCIONAL |

---

## ⚠️ Notas Importantes

1. **No commitees el `.env` a Git**: El archivo `.env` debe estar en `.gitignore` para proteger las credenciales.

2. **Service Role Key es sensible**: Esta key tiene permisos completos en Supabase. Solo debe usarse en el backend, nunca exponerla al frontend.

3. **Re-deploy es obligatorio**: Después de agregar la variable, **debes** re-desplegar para que Vercel la cargue.

4. **Verificación de variables**: Puedes ver todas las variables configuradas en:
   ```
   https://vercel.com/carlos-arevalos-projects-cf7340ea/haida-one/settings/environment-variables
   ```

---

## 🔍 Troubleshooting

### Error: "Variable not found"
- Asegúrate de escribir exactamente `SUPABASE_SERVICE_ROLE_KEY` (con `_ROLE`)
- Verifica que guardaste la variable en el ambiente correcto (Production)

### Error: "Unauthorized"
- Verifica que el valor de la key es exactamente el service_role key de Supabase
- No incluyas espacios al inicio o final

### El error de RLS persiste
- Espera 2-3 minutos después del re-deploy
- Verifica que el deployment terminó exitosamente
- Revisa los logs de Vercel: https://vercel.com/carlos-arevalos-projects-cf7340ea/haida-one/logs

---

**Generado**: +34662652300
**Acción requerida**: Agregar `SUPABASE_SERVICE_ROLE_KEY` en Vercel Dashboard y re-desplegar
**Tiempo estimado**: 3-5 minutos
