# Problema: Datos Pre-Poblados (Seed Data)

**Fecha**: ++34662652300
**Usuario afectado**: hola@stayarta.com
**Síntoma**: Usuario recién creado muestra información relacionada cuando no debería tener nada

---

## 🔍 DIAGNÓSTICO

### Problema Identificado

Cuando creas un nuevo usuario en el sistema, **automáticamente ve datos de ejemplo** que pertenecen a otros usuarios de demostración:

- Proyecto de ejemplo: "HAIDA Demo Project"
- Usuario demo: hola@stayarta.com, hola@stayarta.com, hola@stayarta.com
- Test suites de ejemplo
- Test cases de ejemplo

### Causa Raíz

**Archivo**: `database/01-schema-haida.sql`

**Líneas 399-419**: El schema incluye datos de ejemplo (seed data) que se insertan automáticamente:

```sql
-- Insert default admin user (líneas 399-403)
INSERT INTO users (email, name, role) VALUES
('hola@stayarta.com', 'HAIDA Admin', 'admin'),
('hola@stayarta.com', 'QA Engineer', 'qa_engineer'),
('hola@stayarta.com', 'Developer', 'developer')
ON CONFLICT (email) DO NOTHING;

-- Insert example project (líneas 406-409)
INSERT INTO projects (name, slug, description, base_url, status, owner_id) VALUES
('HAIDA Demo Project', 'haida-demo', 'Demo project for HAIDA testing',
 'https://mcprod.thisisbarcelona.com', 'active',
(SELECT id FROM users WHERE email = 'hola@stayarta.com' LIMIT 1))
ON CONFLICT (slug) DO NOTHING;

-- Insert example test suite (líneas 412-419)
INSERT INTO test_suites (project_id, name, description, suite_type, priority, tags) VALUES
((SELECT id FROM projects WHERE slug = 'haida-demo' LIMIT 1),
'Smoke Tests',
'Critical smoke tests for main functionality',
'smoke',
'critical',
ARRAY['smoke', 'critical', 'regression'])
ON CONFLICT DO NOTHING;
```

### Por Qué el Usuario Ve Estos Datos

**IMPORTANTE**: Estos datos NO están asignados al usuario `hola@stayarta.com`.

El frontend **muestra TODOS los proyectos de la base de datos** sin filtrar por usuario. Esto es normal en fase de desarrollo/demo, pero en producción debería filtrar por:

1. **Proyectos propios** (`owner_id = current_user.id`)
2. **Proyectos asignados** (tabla de relación user_projects)
3. **Proyectos públicos** (si existe esa feature)

---

## ✅ SOLUCIÓN IMPLEMENTADA

### Para el Usuario hola@stayarta.com

He creado un script SQL que:

1. ✅ Verifica el usuario en la base de datos
2. ✅ Actualiza su rol a `admin` (si no lo era)
3. ✅ Crea proyecto **CTB** asignado al usuario
4. ✅ Crea proyecto **Privalia** asignado al usuario

**Archivo**: `database/setup-carlosadmin-projects.sql`

**Cómo ejecutarlo**:
1. Ve a Supabase Dashboard → SQL Editor
2. Copia el contenido del archivo `setup-carlosadmin-projects.sql`
3. Pega y ejecuta
4. Verifica los mensajes de NOTICE para confirmar creación

### Verificación Post-Ejecución

Después de ejecutar el script, el usuario `hola@stayarta.com` tendrá:

- ✅ Rol: `admin`
- ✅ Proyecto 1: **CTB** (owner)
- ✅ Proyecto 2: **Privalia** (owner)
- ⚠️ Todavía verá el proyecto "HAIDA Demo Project" (a menos que filtres en frontend)

---

## 🛠️ SOLUCIONES A LARGO PLAZO

### Opción 1: Eliminar Datos de Ejemplo (Recomendado para Producción)

**Ejecutar en Supabase SQL Editor**:

```sql
-- Eliminar proyecto de demo
DELETE FROM public.projects WHERE slug = 'haida-demo';

-- Eliminar usuarios de demo
DELETE FROM public.users WHERE email IN ('hola@stayarta.com', 'hola@stayarta.com', 'hola@stayarta.com');

-- Resultado: Base de datos limpia, solo usuarios reales
```

**ADVERTENCIA**: Esto eliminará TODOS los test suites, test cases y executions relacionados con el proyecto demo (CASCADE).

### Opción 2: Modificar Frontend para Filtrar (Recomendado)

**Archivo a modificar**: `Figma/src/app/pages/Projects.tsx` o `src/lib/apiService.ts`

**Cambiar**:
```typescript
// ANTES (muestra TODOS los proyectos)
const { data: projects } = await supabase
  .from('projects')
  .select('*');
```

**Por**:
```typescript
// DESPUÉS (solo proyectos del usuario actual)
const { data: projects } = await supabase
  .from('projects')
  .select('*')
  .eq('owner_id', currentUser.id);
```

O mejor aún, crear una vista SQL:

```sql
CREATE OR REPLACE VIEW user_projects AS
SELECT p.*
FROM projects p
WHERE p.owner_id = auth.uid()  -- Supabase auth user ID
   OR p.id IN (
       SELECT project_id FROM project_members WHERE user_id = auth.uid()
   );
```

### Opción 3: Mantener Datos de Demo Pero Marcarlos

**Agregar campo `is_demo` a la tabla projects**:

```sql
ALTER TABLE public.projects
ADD COLUMN is_demo BOOLEAN DEFAULT false;

UPDATE public.projects
SET is_demo = true
WHERE slug = 'haida-demo';
```

**Filtrar en frontend**:
```typescript
const { data: projects } = await supabase
  .from('projects')
  .select('*')
  .or(`owner_id.eq.${currentUser.id},is_demo.eq.true`);
```

---

## 📋 RESUMEN

### Problema
- Usuario nuevo ve datos de otros usuarios (proyecto demo, usuarios demo)
- **NO** es un bug de seguridad (datos no están asignados al usuario)
- **ES** un problema de UX (frontend muestra todo en lugar de filtrar)

### Solución Inmediata
- Script SQL ejecutado para crear proyectos CTB y Privalia
- Proyectos asignados a hola@stayarta.com como owner
- Rol actualizado a `admin`

### Solución Definitiva (Pendiente)
- **Opción A**: Eliminar datos seed en producción
- **Opción B**: Modificar frontend para filtrar por usuario
- **Opción C**: Marcar datos demo y filtrar apropiadamente

---

## 🎯 SIGUIENTE PASO

**EJECUTAR AHORA** en Supabase Dashboard:

1. Ir a: https://supabase.com/dashboard/project/wdebyxvtunromsnkqbrd/sql
2. Copiar contenido de: `database/setup-carlosadmin-projects.sql`
3. Pegar en SQL Editor
4. Click en "Run"
5. Verificar mensajes de éxito en Output

**Resultado esperado**:
```
✅ Usuario encontrado: hola@stayarta.com
✅ Rol actualizado a: admin
✅ Proyecto CTB creado
✅ Proyecto Privalia creado
✅ CONFIGURACIÓN COMPLETADA EXITOSAMENTE
```

---

**Generado por**: HAIDA System Analysis
**Archivo SQL**: `database/setup-carlosadmin-projects.sql`
**Estado**: Listo para ejecutar
