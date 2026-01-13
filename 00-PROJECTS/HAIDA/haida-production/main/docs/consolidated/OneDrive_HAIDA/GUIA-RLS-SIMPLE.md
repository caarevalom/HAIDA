# 🔒 Guía Simplificada: Row Level Security (RLS)

**Fecha**: 30 Diciembre 2025
**Objetivo**: Elegir la configuración RLS más adecuada y aplicarla fácilmente

---

## 🎯 ¿Qué es RLS y por qué te afecta?

**RLS (Row Level Security)** es un sistema de seguridad de PostgreSQL/Supabase que controla **quién puede ver qué datos**.

**Tu problema actual**:
- ✅ Los proyectos **existen** en la base de datos
- ❌ Pero RLS los **oculta** de usuarios normales
- ✅ Solo el service role (admin) puede verlos

**Resultado**: Frontend y API no funcionan porque no ven los datos.

---

## 📊 3 Soluciones Simples (Elige 1)

### Opción 1: 🟢 DESHABILITAR RLS (Más Simple)

**Archivo**: `database/rls-simple-disable.sql`

#### ¿Qué hace?
Desactiva completamente RLS. **Todo el mundo puede ver y modificar todo**.

#### Ventajas ✅
- ⚡ **Más rápido de aplicar** (6 líneas de SQL)
- 💯 **100% garantizado que funciona**
- 🚀 **Cero problemas de permisos**
- 🛠️ **Perfecto para desarrollo/testing**

#### Desventajas ❌
- 🔓 **Sin seguridad** (cualquiera puede modificar datos)
- ⚠️ **No recomendado para producción pública**

#### ¿Cuándo usar?
- ✅ Aplicación interna (solo tu equipo)
- ✅ Desarrollo/staging/testing
- ✅ Prototipo o MVP
- ✅ Ya tienes seguridad en el backend (FastAPI)
- ❌ Aplicación pública en producción

#### SQL (6 líneas):
```sql
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_suites DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_executions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_execution_results DISABLE ROW LEVEL SECURITY;
```

**Tiempo**: ⏱️ 2 minutos

---

### Opción 2: 🟡 RLS ABIERTO (Simple pero con RLS)

**Archivo**: `database/rls-simple-open.sql`

#### ¿Qué hace?
Mantiene RLS activo pero con **1 política súper permisiva** por tabla:
```sql
-- Política: Permite TODO (SELECT, INSERT, UPDATE, DELETE)
FOR ALL USING (true) WITH CHECK (true)
```

#### Ventajas ✅
- ⚡ **Casi tan simple como deshabilitar**
- 🔐 **RLS técnicamente activo** (por si lo requieren)
- 💯 **Funciona igual de bien que deshabilitar**
- 🛠️ **Fácil de modificar después**

#### Desventajas ❌
- 🔓 **Seguridad idéntica a deshabilitado** (todo público)
- 🤷 **RLS activo sin beneficio real**

#### ¿Cuándo usar?
- ✅ Necesitas RLS "activo" por política corporativa
- ✅ Planeas agregar seguridad más adelante
- ✅ Quieres flexibilidad para cambiar políticas
- ❌ Necesitas seguridad real ahora

#### SQL (1 política por tabla):
```sql
-- Ejemplo para projects
CREATE POLICY "projects_all_public"
ON public.projects
FOR ALL
USING (true)
WITH CHECK (true);
```

**Tiempo**: ⏱️ 3 minutos

---

### Opción 3: 🟢 RLS SEGURO (Recomendado para Producción)

**Archivo**: `database/rls-simple-secure.sql`

#### ¿Qué hace?
**Lectura pública** (todos pueden ver) + **Escritura autenticada** (solo usuarios logueados pueden modificar).

```sql
-- Lectura: Todos
FOR SELECT USING (true)

-- Escritura: Solo autenticados
FOR ALL USING (auth.role() = 'authenticated')
```

#### Ventajas ✅
- 🔐 **Seguridad real**: Protege contra modificaciones no autorizadas
- 👁️ **Lectura pública**: API y frontend pueden ver datos
- ✍️ **Escritura controlada**: Solo usuarios logueados modifican
- 🏢 **Listo para producción**
- ⚖️ **Balance perfecto**: Funcionalidad + Seguridad

#### Desventajas ❌
- ⏱️ Ligeramente más complejo (2 políticas por tabla)
- 🔑 Requiere autenticación para crear/modificar datos

#### ¿Cuándo usar?
- ✅ **Aplicación en producción** (RECOMENDADO)
- ✅ Necesitas seguridad real
- ✅ Tienes sistema de login funcionando
- ✅ API pública que solo lee datos

#### SQL (2 políticas por tabla):
```sql
-- Ejemplo para projects
-- Política 1: Lectura pública
CREATE POLICY "projects_select_all"
ON public.projects
FOR SELECT
USING (true);

-- Política 2: Escritura solo autenticados
CREATE POLICY "projects_write_authenticated"
ON public.projects
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
```

**Tiempo**: ⏱️ 5 minutos

---

## 🎯 ¿Cuál elegir? - Tabla de Decisión

| Situación | Opción Recomendada | Archivo |
|-----------|-------------------|---------|
| **Desarrollo local / Testing** | 🟢 Opción 1: Deshabilitar | `rls-simple-disable.sql` |
| **Staging / Pre-producción** | 🟡 Opción 2: RLS Abierto | `rls-simple-open.sql` |
| **Producción interna (solo tu equipo)** | 🟡 Opción 2: RLS Abierto | `rls-simple-open.sql` |
| **Producción pública** | 🟢 Opción 3: RLS Seguro | `rls-simple-secure.sql` |
| **No sé qué elegir / Quiero lo más simple** | 🟢 Opción 1: Deshabilitar | `rls-simple-disable.sql` |
| **Necesito pasar auditoría de seguridad** | 🟢 Opción 3: RLS Seguro | `rls-simple-secure.sql` |

---

## 🚀 Cómo Aplicar (3 pasos)

### Paso 1: Elegir archivo SQL

Según tu situación, elige **UNO** de estos archivos:

- `database/rls-simple-disable.sql` ← **Más simple (recomendado para empezar)**
- `database/rls-simple-open.sql` ← Intermedio
- `database/rls-simple-secure.sql` ← **Más seguro (recomendado para producción)**

### Paso 2: Abrir Supabase Dashboard

1. Ir a: **https://app.supabase.com**
2. Seleccionar proyecto: **wdebyxvtunromsnkqbrd**
3. Menú lateral → **SQL Editor**
4. Click: **"New Query"**

### Paso 3: Copiar, Pegar y Ejecutar

1. **Copiar** el archivo SQL completo que elegiste
2. **Pegar** en el SQL Editor de Supabase
3. **Ejecutar**: Click "Run" o presionar `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)

**Resultado esperado**:
```
✅ RLS deshabilitado en todas las tablas
```
(o mensaje similar dependiendo del archivo)

---

## ✅ Verificar que Funcionó

### Opción A: Comando rápido

```bash
node scripts/check-db-connection.js
```

**Antes del fix**:
```
⚠️  Proyectos:         0
⚠️  Test Suites:       0
```

**Después del fix**:
```
✅ Proyectos:          3  ← ¡Funciona!
✅ Test Suites:        3
```

### Opción B: Verificar en Supabase Dashboard

1. Supabase Dashboard → **Table Editor**
2. Click en tabla **"projects"**
3. Deberías ver: **CTB, Privalia, HAIDA Demo**

### Opción C: Verificar via API

```bash
curl https://haidapi.stayarta.com/api/projects
```

**Antes**: Error o `[]` (vacío)
**Después**: JSON con 3 proyectos ✅

---

## 🔄 Cambiar de Opción Más Tarde

Puedes cambiar de opción en cualquier momento:

### De "Deshabilitar" a "RLS Seguro":
1. Ejecutar `database/rls-simple-secure.sql`
2. Listo ✅

### De "RLS Abierto" a "Deshabilitar":
1. Ejecutar `database/rls-simple-disable.sql`
2. Listo ✅

**No hay problema en cambiar**, los datos no se afectan.

---

## 💡 Recomendación Personal

### Para EMPEZAR AHORA (hoy):
**🟢 Opción 1: Deshabilitar RLS** (`rls-simple-disable.sql`)

**Por qué**:
- ⚡ 2 minutos y funciona 100%
- 🚀 Puedes probar HAIDA inmediatamente
- 🔄 Cambias a seguro cuando quieras

### Para PRODUCCIÓN (después):
**🟢 Opción 3: RLS Seguro** (`rls-simple-secure.sql`)

**Por qué**:
- 🔐 Seguridad real
- 👁️ API pública puede leer
- ✍️ Solo usuarios logueados modifican

### Flujo Ideal:
```
1. HOY:      Aplicar "Deshabilitar" → Probar HAIDA → Todo funciona ✅
2. MAÑANA:   Aplicar "RLS Seguro" → Tener seguridad real ✅
```

---

## 📋 Comparación Completa

| Feature | Deshabilitar | RLS Abierto | RLS Seguro |
|---------|--------------|-------------|------------|
| **Lectura anónima** | ✅ Sí | ✅ Sí | ✅ Sí |
| **Escritura anónima** | ✅ Sí | ✅ Sí | ❌ No |
| **Requiere login para modificar** | ❌ No | ❌ No | ✅ Sí |
| **Líneas de SQL** | 6 | ~40 | ~80 |
| **Tiempo de aplicación** | 2 min | 3 min | 5 min |
| **Complejidad** | ⭐ Simple | ⭐⭐ Media | ⭐⭐⭐ Media-Alta |
| **Seguridad** | ❌ Ninguna | ❌ Ninguna | ✅ Alta |
| **Producción pública** | ❌ No | ⚠️ Con cuidado | ✅ Sí |
| **Desarrollo local** | ✅ Perfecto | ✅ OK | ⚠️ Sobra |

---

## 🆘 Troubleshooting

### "Sigo viendo 0 proyectos después de ejecutar SQL"

1. **Verificar con service role**:
   ```bash
   node scripts/check-db-with-service-role.js
   ```
   Si aquí aparecen proyectos → Problema de RLS aún

2. **Verificar que SQL se ejecutó**:
   En Supabase Dashboard → SQL Editor → History
   Debe aparecer el SQL ejecutado recientemente

3. **Re-ejecutar el SQL**:
   Volver a copiar/pegar el archivo y ejecutar

### "Error al ejecutar SQL"

**Error común**: `permission denied`

**Solución**: Asegúrate de estar logueado como **Owner** del proyecto en Supabase.

### "No sé si aplicar o no"

**Respuesta corta**: Aplica **Opción 1: Deshabilitar** ahora.

**Por qué**: Es reversible, rápido, y te permite avanzar. Cambias después si lo necesitas.

---

## 📞 Resumen Ejecutivo

### ❓ ¿Qué necesito hacer?

Ejecutar **1 archivo SQL** en Supabase Dashboard.

### ❓ ¿Cuál archivo?

**Para empezar hoy**: `database/rls-simple-disable.sql` (2 minutos)

### ❓ ¿Dónde lo ejecuto?

1. https://app.supabase.com
2. Proyecto: wdebyxvtunromsnkqbrd
3. SQL Editor → New Query
4. Copiar/Pegar → Run

### ❓ ¿Cómo sé que funcionó?

```bash
node scripts/check-db-connection.js
```

Debe mostrar: `✅ Proyectos: 3`

---

## 🎯 Acción Inmediata Recomendada

**AHORA (2 minutos)**:

1. Abrir `database/rls-simple-disable.sql`
2. Copiar todo el contenido
3. Ir a Supabase Dashboard → SQL Editor
4. Pegar y ejecutar
5. Verificar: `node scripts/check-db-connection.js`

**Resultado**: HAIDA funcionando al 100% ✅

**DESPUÉS (cuando quieras más seguridad)**:

1. Ejecutar `database/rls-simple-secure.sql`
2. Listo, ahora con seguridad real ✅

---

**Archivos creados**:
- ✅ `database/rls-simple-disable.sql` - Deshabilitar RLS (MÁS SIMPLE)
- ✅ `database/rls-simple-open.sql` - RLS con políticas abiertas
- ✅ `database/rls-simple-secure.sql` - RLS seguro (PRODUCCIÓN)

**Próxima acción**: Elegir un archivo y ejecutarlo en Supabase Dashboard (2-5 min)

---

*Generado: 30 Diciembre 2025, 09:30 UTC*
