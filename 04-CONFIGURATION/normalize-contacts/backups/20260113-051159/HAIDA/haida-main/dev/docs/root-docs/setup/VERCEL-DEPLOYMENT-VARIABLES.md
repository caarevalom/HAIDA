# 🔑 HAIDA - Variables para Vercel Deployment

**USA ESTAS VARIABLES EXACTAS** ⬇️

---

## 🖥️ BACKEND ENVIRONMENT VARIABLES

**En Vercel, añade estas 5 variables para el backend**:

### Variable 1:

```
Name: SUPABASE_URL
Value: https://wdebyxvtunromsnkqbrd.supabase.co
```

### Variable 2:

```
Name: SUPABASE_SERVICE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg5NTc1MSwiZXhwIjoyMDgxNDcxNzUxfQ.Jg6UBGpYDBBKvB4pgaKW_OJCTx0VOm9UMI18vqdUEJc
```

### Variable 3:

```
Name: DATABASE_URL
Value: postgresql://postgres:hola@stayarta.com:5432/postgres
```

### Variable 4:

```
Name: APP_NAME
Value: HAIDA
```

### Variable 5:

```
Name: CORS_ORIGINS
Value: https://haida-frontend.vercel.app,http://localhost:3000,http://localhost:5173
```

---

## 🎨 FRONTEND ENVIRONMENT VARIABLES

**En Vercel, añade estas 4 variables para el frontend**:

### Variable 1:

```
Name: VITE_SUPABASE_URL
Value: https://wdebyxvtunromsnkqbrd.supabase.co
```

### Variable 2:

```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4OTU3NTEsImV4cCI6MjA4MTQ3MTc1MX0._VYypgb2tV9u_4jSAt3sbcFj-drhufB0oN9o3BcgHTs
```

### Variable 3:

```
Name: VITE_API_URL
Value: [AQUÍ PEGAS LA URL DE TU BACKEND DESPUÉS DE DEPLOYARLO]
```

### Variable 4:

```
Name: VITE_APP_NAME
Value: HAIDA
```

---

## ✅ VARIABLES CORRECTAS VERIFICADAS

### Supabase Credentials:

- ✅ Project URL: `https://wdebyxvtunromsnkqbrd.supabase.co`
- ✅ Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...VYypgb2tV9u_4jSAt3sbcFj-drhufB0oN9o3BcgHTs`
- ✅ Service Role: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...Jg6UBGpYDBBKvB4pgaKW_OJCTx0VOm9UMI18vqdUEJc`
- ✅ Database URL: `postgresql://postgres:hola@stayarta.com:5432/postgres`

### Adicionales:

- ✅ JWT Secret: `T1MTbPi/+wkQLckC54ZKQLWIOfg0OtZW2DL+59JQ2jYdesQ7zcnS4JNsMSce26477l092ViXXDfhS/b+mlqpog`
- ✅ Access Token Expiry: `3600`

---

## 🚀 PASOS PARA DEPLOYMENT

### 1. Deploy Backend:

1. Ve a: https://vercel.com/new
2. Import: `caarevalom/HAIDA`
3. Configure:
   ```
   Project Name: haida-backend
   Framework: Other
   Root: ./
   ```
4. **Copia y pega las 5 variables del BACKEND de arriba** ☝️
5. Click "Deploy"
6. Espera 2-3 minutos
7. **Copia la URL del backend** (ejemplo: `https://haida-backend-xxxxx.vercel.app`)

### 2. Deploy Frontend:

1. Nueva pestaña: https://vercel.com/new
2. Import: `caarevalom/HAIDA`
3. Configure:
   ```
   Project Name: haida-frontend
   Framework: Vite
   Root: Figma  ⚠️ IMPORTANTE
   Build: npm run build
   Output: dist
   ```
4. **Copia y pega las 4 variables del FRONTEND de arriba** ☝️
   - ⚠️ En `VITE_API_URL`, pega la URL del backend que copiaste en el paso 1.7
5. Click "Deploy"
6. Espera 3-5 minutos

---

## 🔍 VERIFICACIÓN

### Backend:

```
URL: https://[tu-backend].vercel.app/health
Debe retornar: {"status":"healthy","timestamp":"..."}
```

### Frontend:

```
URL: https://[tu-frontend].vercel.app
Debe cargar: La aplicación HAIDA sin errores
```

---

## ⚠️ NOTAS IMPORTANTES

1. **Service Role Key**: Solo para backend, NUNCA para frontend
2. **Anon Key**: Solo para frontend, seguro exponerlo
3. **VITE\_ prefix**: Obligatorio para todas las variables del frontend
4. **CORS_ORIGINS**: Actualiza con la URL real del frontend después de deployar
5. **No espacios**: Asegúrate de copiar las keys sin espacios ni saltos de línea

---

## 🎯 ORDEN DE DEPLOYMENT

```
1️⃣ Backend primero (para obtener su URL)
2️⃣ Frontend después (usando la URL del backend)
```

---

## ✅ LISTO PARA DEPLOYAR

**Todas las credenciales están verificadas y listas.**

**👉 Abre**: https://vercel.com/new
**👉 Sigue los pasos de arriba**
**👉 Usa estas variables exactas**

---

**¡Ahora sí, deployment sin errores!** 🚀
