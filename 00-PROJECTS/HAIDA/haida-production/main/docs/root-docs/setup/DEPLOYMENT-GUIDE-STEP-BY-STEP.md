# 🚀 HAIDA - Guía de Deployment PASO A PASO

**SIGUE ESTOS PASOS EXACTAMENTE** ⬇️

---

## 📋 PASO 1: PREPARACIÓN (YA HECHO ✅)

✅ Backend funcionando local
✅ CI/CD pasando
✅ Archivos de deployment listos
✅ Base de datos conectada

---

## 🚀 PASO 2: DEPLOY BACKEND A VERCEL

### 2.1. Abre tu navegador

**URL**: https://vercel.com/new

### 2.2. Login

- Click "Continue with GitHub"
- Autoriza Vercel si es necesario

### 2.3. Import Repository

- Busca: `HAIDA` o `caarevalom/HAIDA`
- Click **"Import"** en el repositorio HAIDA

### 2.4. Configure Project

**Copia y pega estos valores EXACTOS**:

```
┌─────────────────────────────────────────┐
│ Project Name:                           │
│ haida-backend                           │
├─────────────────────────────────────────┤
│ Framework Preset:                       │
│ Other                                   │
├─────────────────────────────────────────┤
│ Root Directory:                         │
│ ./                                      │
├─────────────────────────────────────────┤
│ Build Command:                          │
│ (DEJAR VACÍO)                          │
├─────────────────────────────────────────┤
│ Output Directory:                       │
│ (DEJAR VACÍO)                          │
├─────────────────────────────────────────┤
│ Install Command:                        │
│ pip install -r requirements.txt        │
└─────────────────────────────────────────┘
```

### 2.5. Environment Variables

**Click "Add" para cada variable**:

```env
# Variable 1:
Name: SUPABASE_URL
Value: https://wdebyxvtunromsnkqbrd.supabase.co

# Variable 2:
Name: SUPABASE_SERVICE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg5NTc1MSwiZXhwIjoyMDgxNDcxNzUxfQ.Jg6UBGpYDBBKvB4pgaKW_OJCTx0VOm9UMI18vqdUEJc

# Variable 3:
Name: DATABASE_URL
Value: postgresql://postgres:hola@stayarta.com:5432/postgres

# Variable 4:
Name: APP_NAME
Value: HAIDA

# Variable 5:
Name: CORS_ORIGINS
Value: https://haida-frontend.vercel.app,http://localhost:3000,http://localhost:5173
```

### 2.6. Deploy

**Click: "Deploy"**

⏳ **Espera 2-3 minutos** mientras Vercel:

- Instala dependencias
- Construye el proyecto
- Deploya a producción

### 2.7. Copia la URL del Backend

Cuando termine verás:

```
🎉 Your project is ready!
https://haida-backend-xxxxx.vercel.app
```

**📝 COPIA ESTA URL** - La necesitarás para el frontend

---

## 🎨 PASO 3: DEPLOY FRONTEND A VERCEL

### 3.1. Nueva pestaña

**URL**: https://vercel.com/new

### 3.2. Import nuevamente

- Busca: `HAIDA`
- Click **"Import"** (otra vez)

### 3.3. Configure Project

**IMPORTANTE: Root Directory diferente**:

```
┌─────────────────────────────────────────┐
│ Project Name:                           │
│ haida-frontend                          │
├─────────────────────────────────────────┤
│ Framework Preset:                       │
│ Vite                                    │
├─────────────────────────────────────────┤
│ Root Directory:                         │
│ Figma                                   │
│ (⚠️ IMPORTANTE: Escribe "Figma")       │
├─────────────────────────────────────────┤
│ Build Command:                          │
│ npm run build                           │
├─────────────────────────────────────────┤
│ Output Directory:                       │
│ dist                                    │
└─────────────────────────────────────────┘
```

### 3.4. Environment Variables

**Click "Add" para cada variable**:

```env
# Variable 1:
Name: VITE_SUPABASE_URL
Value: https://wdebyxvtunromsnkqbrd.supabase.co

# Variable 2:
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4OTU3NTEsImV4cCI6MjA4MTQ3MTc1MX0._VYypgb2tV9u_4jSAt3sbcFj-drhufB0oN9o3BcgHTs

# Variable 3:
Name: VITE_API_URL
Value: [PEGA AQUÍ LA URL DEL BACKEND DEL PASO 2.7]

# Variable 4:
Name: VITE_APP_NAME
Value: HAIDA
```

### 3.5. Deploy

**Click: "Deploy"**

⏳ **Espera 3-5 minutos** mientras Vercel:

- Instala npm dependencies
- Construye con Vite
- Deploya a producción

---

## ✅ PASO 4: VERIFICACIÓN

### 4.1. Verifica Backend

**Abre en navegador**:

```
https://[tu-backend-url].vercel.app/health
```

**Deberías ver**:

```json
{ "status": "healthy", "timestamp": "2025-12-17T..." }
```

**También prueba la documentación**:

```
https://[tu-backend-url].vercel.app/docs
```

### 4.2. Verifica Frontend

**Abre en navegador**:

```
https://[tu-frontend-url].vercel.app
```

**Deberías ver**:

- La aplicación HAIDA cargada
- Sin errores en consola (F12)
- Datos cargando del backend

---

## 🔧 PASO 5: ACTUALIZAR CORS (SI ES NECESARIO)

Si el frontend no puede conectar al backend:

1. Ve a tu proyecto backend en Vercel
2. Settings → Environment Variables
3. Encuentra `CORS_ORIGINS`
4. Añade la URL del frontend:
   ```
   https://[tu-frontend-url].vercel.app
   ```
5. Redeploy (click en "Redeploy" en el dashboard)

---

## 📊 RESULTADO ESPERADO

### Backend:

```
✅ URL: https://haida-backend-xxxxx.vercel.app
✅ Health: /health retorna 200 OK
✅ Docs: /docs muestra Swagger UI
✅ API: Todos los endpoints funcionando
```

### Frontend:

```
✅ URL: https://haida-frontend-xxxxx.vercel.app
✅ App: Carga sin errores
✅ API: Conecta con backend
✅ UI: Todo renderiza correctamente
```

---

## ⚠️ TROUBLESHOOTING

### Si el backend falla:

**Error**: "Module not found"

- Solución: Verifica que requirements.txt esté en la raíz
- Verifica que vercel.json esté configurado

**Error**: "Environment variables not set"

- Solución: Revisa que pegaste todas las variables
- Asegúrate de no tener espacios extras

### Si el frontend falla:

**Error**: "VITE\_\* undefined"

- Solución: Las variables DEBEN empezar con `VITE_`
- Redeploy después de añadirlas

**Error**: "CORS error"

- Solución: Añade la URL del frontend a CORS_ORIGINS del backend
- Redeploy el backend

---

## 🎉 ¡LISTO!

**HAIDA está ahora en producción** 🚀

### URLs Finales:

- Backend: `https://haida-backend-xxxxx.vercel.app`
- Frontend: `https://haida-frontend-xxxxx.vercel.app`
- Database: `wdebyxvtunromsnkqbrd.supabase.co` (ya estaba)

### Auto-deployment:

Cada vez que hagas `git push`, Vercel automáticamente:

- Construye la nueva versión
- Ejecuta los tests
- Deploya si todo está OK

---

## 📝 NOTAS IMPORTANTES

1. **Gratis**: Vercel es gratis para proyectos públicos
2. **HTTPS**: URLs HTTPS automáticas
3. **CDN**: Distribución global automática
4. **Serverless**: Escala automáticamente
5. **Logs**: Disponibles en Vercel dashboard

---

## 🔗 LINKS ÚTILES

- Dashboard: https://vercel.com/dashboard
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

---

**¿Todo listo? ¡Empieza ahora!** 👇

**PASO 1**: Abre https://vercel.com/new
**PASO 2**: Sigue esta guía paso a paso
**PASO 3**: ¡Disfruta tu app en producción!

🚀 **¡Éxito con el deployment!**
