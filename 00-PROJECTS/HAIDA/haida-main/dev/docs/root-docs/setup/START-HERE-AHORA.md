# 🚀 EMPIEZA AQUÍ - CONFIGURACIÓN HAIDA

**Fecha**: +34662652300:15
**Tiempo total**: 5 minutos
**Urgencia**: 🔴 CRÍTICO

---

## ⚡ ACCIÓN RÁPIDA (2 minutos)

### Opción A: Supabase AI Assistant (Más fácil)

1. **Abre**: https://supabase.com/dashboard/project/wdebyxvtunromsnkqbrd

2. **Busca el botón de AI o Chat** (si existe)

3. **Copia y pega** TODO el contenido de este archivo:
   ```
   PROMPT-PARA-SUPABASE-AI.md
   ```

4. **Presiona Enter** y espera que ejecute

5. **Verifica** que dice "9 usuarios con full_name"

### Opción B: SQL Editor Manual (Más control)

1. **Abre**: https://supabase.com/dashboard/project/wdebyxvtunromsnkqbrd/sql/new

2. **Copia y pega** este SQL:

```sql
-- MIGRACIÓN CRÍTICA HAIDA
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);

UPDATE public.users SET full_name = name WHERE full_name IS NULL;

INSERT INTO public.users (id, email, name, full_name, role, created_at, is_active)
SELECT
    au.id, au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', SPLIT_PART(au.email, '@', 1)),
    COALESCE(au.raw_user_meta_data->>'full_name', SPLIT_PART(au.email, '@', 1)),
    COALESCE(au.raw_user_meta_data->>'role', 'viewer'),
    au.created_at,
    CASE WHEN au.email_confirmed_at IS NOT NULL THEN true ELSE false END
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.users pu WHERE pu.id = au.id)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, updated_at = CURRENT_TIMESTAMP;

SELECT id, email, name, full_name, role FROM public.users ORDER BY created_at DESC;
```

3. **Click RUN** (o Cmd+Enter)

4. **Verifica** que muestra 9 usuarios

---

## 🎯 DESPUÉS DE LA MIGRACIÓN (3 minutos)

### Resetear Password de Usuario de Prueba

1. **Abre**: https://supabase.com/dashboard/project/wdebyxvtunromsnkqbrd/auth/users

2. **Busca**: `hola@stayarta.com`

3. **Click** en el usuario

4. **Click** "Send password recovery" o "Reset password"

5. **Abre el link** que se genera (cópialo del email o de la pantalla)

6. **Establece password**: `HaidaTest2025Pass!`

---

## ✅ VERIFICACIÓN (1 minuto)

```bash
# Verificar que la migración funcionó
python3 /tmp/supabase-rest-audit.py

# Ejecutar tests
npx playwright test tests/web-e2e/auth-api.spec.ts --project="Desktop Chrome"
```

**Resultado esperado**:
```
✅ 11 passed
❌ 1 failed (Microsoft OAuth - esperado)
```

---

## 📁 ARCHIVOS IMPORTANTES

**PARA USAR AHORA**:
- 🔴 **ESTE ARCHIVO** (START-HERE-AHORA.md)
- 🔴 [PROMPT-PARA-SUPABASE-AI.md](PROMPT-PARA-SUPABASE-AI.md)
- 🔴 [database/APPLY-THIS-IN-SUPABASE-DASHBOARD.sql](database/APPLY-THIS-IN-SUPABASE-DASHBOARD.sql)

**PARA LEER DESPUÉS**:
- 📘 [CONFIGURATION-COMPLETE-CHECKLIST.md](CONFIGURATION-COMPLETE-CHECKLIST.md)
- 📘 [SUPABASE-AUDIT-REPORT.md](SUPABASE-AUDIT-REPORT.md)
- 📘 [AUTH-TESTING-REPORT.md](AUTH-TESTING-REPORT.md)

---

## 🆘 SI ALGO FALLA

### "Permission denied"
→ Asegúrate de estar en el proyecto correcto (wdebyxvtunromsnkqbrd)

### "Column already exists"
→ Perfecto! Salta a la parte de sincronizar usuarios

### "Tests siguen fallando"
→ Verifica que reseteaste la password correctamente

### "No encuentro AI Assistant en Supabase"
→ Usa la Opción B (SQL Editor Manual)

---

## 🎉 DESPUÉS DE COMPLETAR

Deberías tener:
- ✅ 9 usuarios en public.users
- ✅ Todos con columna full_name
- ✅ Password conocida para hola@stayarta.com
- ✅ 11/12 tests pasando (92%)

**¡Ya está!** El resto es opcional (Azure AD para Microsoft OAuth).

---

**Siguiente paso**: Ejecuta `npx playwright test` y disfruta viendo los tests en verde ✅
