# Prompt para IA de Supabase - Solución RLS

## Instrucción para copiar y pegar en Supabase AI Assistant

```
Necesito resolver un problema de seguridad RLS que está bloqueando el registro de usuarios en mi aplicación.

CONTEXTO:
- Tengo una tabla public.users que almacena información de usuarios
- Tengo un backend en Vercel que usa Supabase Python client con service_role_key
- El registro falla con error: "new row violates row-level security policy for table users"
- El problema es que RLS está bloqueando INSERT incluso con service_role_key

SOLUCIÓN REQUERIDA:
1. Deshabilitar RLS en la tabla public.users
2. Verificar que existe un trigger para auto-sincronizar usuarios desde auth.users
3. Si el trigger no existe, crearlo

Por favor ejecuta los siguientes comandos SQL en orden:

-- 1. Deshabilitar RLS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. Verificar trigger existente
SELECT tgname, tgenabled, pg_get_triggerdef(oid)
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- 3. Si el trigger no existe, crear función y trigger
CREATE OR REPLACE FUNCTION sync_auth_user_to_public()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id, email, name, full_name, role, is_active, created_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'viewer'),
        true,
        NEW.created_at
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_auth_user_to_public();

-- 4. Verificar que todo está correcto
SELECT
    'RLS Status' as check_type,
    CASE WHEN relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as status
FROM pg_class
WHERE relname = 'users' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
UNION ALL
SELECT 'Trigger Status',
    CASE WHEN COUNT(*) > 0 THEN 'EXISTS' ELSE 'NOT FOUND' END
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

RESULTADO ESPERADO:
- RLS Status: DISABLED
- Trigger Status: EXISTS

Por favor ejecuta todo esto y muéstrame los resultados de cada paso.
```

## Pasos para ejecutar

1. **Abre Supabase Dashboard**: https://supabase.com/dashboard/project/wdebyxvtunromsnkqbrd
2. **Ve a SQL Editor** (icono de base de datos en el menú lateral)
3. **Haz clic en "AI Assistant"** (botón con icono de ✨)
4. **Copia y pega** el prompt completo de arriba
5. **Envía** el prompt
6. **Espera** a que la IA ejecute todos los comandos
7. **Verifica** los resultados finales

## Qué esperar

La IA de Supabase debería:
1. ✅ Deshabilitar RLS en public.users
2. ✅ Verificar si existe el trigger (probablemente no existe)
3. ✅ Crear la función sync_auth_user_to_public()
4. ✅ Crear el trigger on_auth_user_created
5. ✅ Mostrar verificación final con ambos checks en verde

## Después de ejecutar

Una vez completado, ejecuta este comando en tu terminal local para verificar que el registro funciona:

```bash
python3 << 'EOF'
import requests
import json

url = "https://haida-one.vercel.app/auth/register"
data = {
    "email": "hola@stayarta.com",
    "password": "TestPass123!",
    "full_name": "Usuario de Verificación"
}

print("🧪 Testing registration after fix...")
response = requests.post(url, json=data, timeout=10)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

if response.status_code in [200, 201]:
    print("\n✅ REGISTRO FUNCIONANDO CORRECTAMENTE")
else:
    print("\n❌ REGISTRO AÚN FALLANDO")
EOF
```

## Troubleshooting

Si después de aplicar la solución el registro aún falla:

1. Verifica que RLS esté realmente deshabilitado:
```sql
SELECT relrowsecurity FROM pg_class
WHERE relname = 'users' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
```
Debe devolver `false` o `f`.

2. Verifica que el trigger exista y esté habilitado:
```sql
SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```
Debe devolver una fila con tgenabled = 'O' (enabled).

3. Si todo está correcto pero sigue fallando, es posible que necesites hacer un re-deploy en Vercel para que tome los cambios.
