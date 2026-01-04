# 🚀 Inicio Rápido - Autenticación HAIDA

## Configuración Inmediata (5 minutos)

### Paso 1: Desactivar Confirmación de Email

1. **Ir a Supabase Dashboard**

   ```
   https://supabase.com/dashboard
   ```

2. **Seleccionar tu proyecto HAIDA**

3. **Navegar a Authentication**
   - En el menú lateral: `Authentication`

4. **Ir a Providers**
   - Click en la pestaña `Providers`
   - Buscar `Email` en la lista

5. **Desactivar "Confirm email"**

   ```
   [ ] Confirm email
   ```

   - Desmarcar esta casilla
   - Esto permite que los usuarios hagan login SIN confirmar su email

6. **Guardar cambios**
   - Click en `Save` al final de la página

### Paso 2: Probar Registro y Login

```bash
# 1. Registrar nuevo usuario
curl -X POST https://haida-one.vercel.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tu-email@gmail.com",
    "password": "TuPassword123",
    "full_name": "Tu Nombre",
    "role": "viewer"
  }'

# Respuesta esperada:
# {
#   "access_token": "eyJhbGci...",
#   "user": {
#     "id": "...",
#     "email": "tu-email@gmail.com",
#     "name": "Tu Nombre",
#     "role": "viewer"
#   }
# }

# 2. Login con el usuario creado
curl -X POST https://haida-one.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tu-email@gmail.com",
    "password": "TuPassword123"
  }'

# Respuesta esperada:
# {
#   "access_token": "eyJhbGci...",
#   "user": { ... }
# }
```

### Paso 3: Probar en el Frontend

1. **Ir a:**

   ```
   https://haida-frontend.vercel.app
   ```

2. **Hacer login:**
   - Email: tu-email@gmail.com
   - Password: TuPassword123

3. **Deberías ser redirigido al Dashboard** ✅

---

## 🎯 Ya Funciona!

Con estos pasos, la autenticación estará completamente funcional:

- ✅ Registro de usuarios
- ✅ Login sin confirmación de email
- ✅ JWT tokens
- ✅ Protección de rutas
- ✅ Dashboard funcional

---

## 🔜 Más Tarde (Opcional)

Cuando quieras habilitar confirmación de email:

1. **Configurar SMTP** (ver `SMTP-CONFIG.md`)
   - Recomendación: Resend (5 min)

2. **Habilitar "Confirm email" en Supabase**

3. **Los usuarios recibirán email de confirmación**

---

## 📊 Usuarios de Prueba Pre-creados

Ya existen estos usuarios en la base de datos:

```
Admin:
- Email: admin@haida.com
- Password: admin123
- Role: admin

QA Engineer:
- Email: qa@haida.com
- Password: qa123
- Role: qa_engineer

Developer:
- Email: dev@haida.com
- Password: dev123
- Role: developer
```

**NOTA:** Estos usuarios podrían necesitar confirmación de email si Supabase Auth los creó con ese requisito. Si no funcionan, crea un usuario nuevo con el registro.

---

## ✅ Checklist Rápido

- [ ] Desactivar "Confirm email" en Supabase
- [ ] Probar registro con curl
- [ ] Probar login con curl
- [ ] Probar login en frontend
- [ ] Verificar redirección al dashboard
- [ ] ✨ ¡Listo para usar!

**Tiempo total:** 5 minutos
