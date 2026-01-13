# 📊 ANÁLISIS: Alineación Datos Figma vs Schema Supabase

**Fecha**: ++34662652300
**Objetivo**: Validar compatibilidad entre el modelo de datos del frontend (Figma/React) y el schema de Supabase

---

## 🎯 RESUMEN EJECUTIVO

| Aspecto | Estado | Notas |
|---------|--------|-------|
| **Estructura Core** | ✅ COMPATIBLE | Projects, TestSuites, TestCases, Executions alineados |
| **Multi-tenancy** | ⚠️ GAP DETECTADO | Frontend no maneja `tenant_id` |
| **Internacionalización** | ✅ COMPATIBLE | i18n en frontend, `locale` en DB |
| **UI Config** | ❌ FALTA EN DB | Necesita tabla `ui_configs` |
| **Tipos de datos** | ✅ COMPATIBLE | Enums coinciden (Priority, Status, ExecutionStatus) |

---

## 📋 COMPARACIÓN DETALLADA

### 1️⃣ ENTIDAD: Project

#### Frontend (Figma DataContext.tsx)
```typescript
interface Project {
  id: string;
  key: string;              // e.g., "HAIDA"
  name: string;
  description?: string;
  owner: string;            // User name (string)
  status: Status;           // 'Active' | 'Draft' | 'Archived' | 'Deprecated'
  created_at: string;
}
```

#### Backend (Supabase schema.sql)
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,       -- ⚠️ NO EXISTE EN FRONTEND
    name TEXT NOT NULL,
    slug TEXT NOT NULL,             -- Similar a "key"
    description TEXT,
    base_url TEXT NOT NULL,         -- ⚠️ NO EXISTE EN FRONTEND
    repository_url TEXT,
    documentation_url TEXT,
    status TEXT ('active', 'inactive', 'archived'),  -- ⚠️ Valores diferentes
    type TEXT ('web', 'mobile', 'api', 'desktop'),  -- ⚠️ NO EXISTE EN FRONTEND
    created_by UUID,                -- ⚠️ UUID vs string
    created_at TIMESTAMPTZ
)
```

#### 🔍 GAPS DETECTADOS:
1. ❌ **Frontend NO maneja `tenant_id`** (multi-tenancy)
2. ⚠️ **Frontend usa `key` (string), DB usa `slug` (string)** → Compatible pero nombre diferente
3. ⚠️ **Frontend usa `owner` (string), DB usa `created_by` (UUID)** → Requiere JOIN con `user_profiles`
4. ❌ **Status values diferentes**:
   - Frontend: `'Active' | 'Draft' | 'Archived' | 'Deprecated'`
   - Backend: `'active' | 'inactive' | 'archived'`
5. ❌ **DB tiene campos extra**: `base_url`, `type`, `repository_url`, `documentation_url`

#### ✅ SOLUCIÓN PROPUESTA:
```typescript
// Frontend: Actualizar interface Project
export interface Project {
  id: string;
  tenant_id: string;              // ✅ AGREGAR
  key: string;                    // Mapear desde/hacia "slug"
  name: string;
  description?: string;
  owner: string;                  // Resolver desde user_profiles via created_by
  owner_id: string;               // ✅ AGREGAR (created_by UUID)
  status: Status;                 // Normalizar valores
  type?: 'Web' | 'API' | 'Mobile' | 'Desktop';  // ✅ AGREGAR
  base_url?: string;              // ✅ AGREGAR
  repository_url?: string;        // ✅ AGREGAR
  created_at: string;
}

// Backend: Actualizar enum status para coincidir
-- ALTER TYPE si es enum, o ajustar CHECK constraint:
-- status TEXT CHECK (status IN ('active', 'draft', 'archived', 'deprecated'))
```

---

### 2️⃣ ENTIDAD: TestSuite

#### Frontend (Figma)
```typescript
interface TestSuite {
  id: string;
  project_id: string;
  name: string;
  type: TestType;           // 'Web' | 'API' | 'Mobile' | 'Desktop'
  case_count: number;       // ⚠️ Calculado, no en DB
}
```

#### Backend (Supabase)
```sql
CREATE TABLE test_suites (
    id UUID,
    project_id UUID,
    name TEXT,
    description TEXT,                    -- ⚠️ NO EXISTE EN FRONTEND
    suite_type TEXT ('smoke', 'regression', 'e2e', 'api', ...),  -- ⚠️ Valores diferentes
    priority TEXT ('critical', 'high', 'medium', 'low'),
    tags TEXT[],
    is_active BOOLEAN,
    configuration JSONB,
    created_by UUID
)
```

#### 🔍 GAPS DETECTADOS:
1. ⚠️ **Frontend `type` vs Backend `suite_type`** → Valores completamente diferentes
   - Frontend: `'Web' | 'API' | 'Mobile' | 'Desktop'` (por plataforma)
   - Backend: `'smoke' | 'regression' | 'e2e' | 'api' | 'performance'` (por tipo de test)
2. ❌ **Frontend `case_count` es calculado** → Requiere query: `SELECT COUNT(*) FROM test_cases WHERE suite_id = ?`
3. ❌ **DB tiene campos no usados en frontend**: `description`, `priority`, `tags`, `configuration`

#### ✅ SOLUCIÓN PROPUESTA:
```typescript
// Opción A: Frontend adopta suite_type del backend
export type SuiteType = 'smoke' | 'regression' | 'integration' | 'e2e' | 'api' | 'performance';

export interface TestSuite {
  id: string;
  project_id: string;
  name: string;
  description?: string;           // ✅ AGREGAR
  suite_type: SuiteType;          // ✅ CAMBIAR (era "type")
  priority?: Priority;            // ✅ AGREGAR
  tags?: string[];                // ✅ AGREGAR
  is_active: boolean;             // ✅ AGREGAR
  case_count: number;             // ✅ Mantener como computed property
}

// Backend: Agregar computed column (view o function)
CREATE OR REPLACE VIEW test_suites_with_counts AS
SELECT
  ts.*,
  COUNT(tc.id) as case_count
FROM test_suites ts
LEFT JOIN test_cases tc ON tc.test_suite_id = ts.id
GROUP BY ts.id;
```

---

### 3️⃣ ENTIDAD: TestCase

#### Frontend (Figma)
```typescript
interface TestCase {
  id: string;
  project_id: string;
  suite_id: string;
  title: string;
  description?: string;
  priority: Priority;           // 'Critical' | 'High' | 'Medium' | 'Low'
  linked_req_id?: string;       // Traceability
  steps: { action: string; expected: string }[];
}
```

#### Backend (Supabase)
```sql
CREATE TABLE test_cases (
    id UUID,
    test_suite_id UUID,           -- ✅ Coincide (suite_id)
    test_id TEXT UNIQUE,          -- ⚠️ NO EXISTE EN FRONTEND (ej: TC_LOGIN_001)
    name TEXT,                    -- ✅ Coincide (title)
    description TEXT,
    test_type TEXT,               -- ⚠️ NO EXISTE EN FRONTEND
    component TEXT,
    module TEXT,
    requirement_ids TEXT[],       -- ✅ Similar a linked_req_id
    preconditions TEXT,
    test_steps TEXT,              -- ⚠️ TEXT vs JSON array
    expected_result TEXT,
    priority TEXT ('p0', 'p1', 'p2', 'p3', 'p4'),  -- ⚠️ Valores diferentes
    risk_level TEXT,
    is_automated BOOLEAN,
    automation_script_path TEXT,
    status TEXT,
    tags TEXT[]
)
```

#### 🔍 GAPS DETECTADOS:
1. ❌ **Frontend NO tiene `test_id`** (identificador único legible como "TC_LOGIN_001")
2. ⚠️ **Frontend `title` vs Backend `name`** → Nombres diferentes
3. ❌ **Frontend `steps` es JSON array, Backend `test_steps` es TEXT**
4. ⚠️ **Priority values diferentes**:
   - Frontend: `'Critical' | 'High' | 'Medium' | 'Low'`
   - Backend: `'p0' | 'p1' | 'p2' | 'p3' | 'p4'`
5. ❌ **Frontend NO tiene**: `test_type`, `component`, `module`, `preconditions`, `is_automated`, `risk_level`, `status`, `tags`

#### ✅ SOLUCIÓN PROPUESTA:
```typescript
// Frontend: Actualizar interface
export type Priority = 'p0' | 'p1' | 'p2' | 'p3' | 'p4';  // ✅ Adoptar nomenclatura backend

export interface TestCase {
  id: string;
  test_id: string;                // ✅ AGREGAR (TC_LOGIN_001)
  project_id: string;
  suite_id: string;
  title: string;                  // Mapear desde/hacia "name"
  description?: string;
  test_type?: TestType;           // ✅ AGREGAR
  component?: string;             // ✅ AGREGAR
  module?: string;                // ✅ AGREGAR
  priority: Priority;             // ✅ Cambiar valores
  risk_level?: 'high' | 'medium' | 'low';  // ✅ AGREGAR
  linked_req_ids?: string[];      // ✅ Cambiar a array (era linked_req_id)
  preconditions?: string;         // ✅ AGREGAR
  steps: { action: string; expected: string }[];  // ✅ Mantener
  is_automated: boolean;          // ✅ AGREGAR
  automation_script_path?: string;  // ✅ AGREGAR
  status: Status;                 // ✅ AGREGAR
  tags?: string[];                // ✅ AGREGAR
}

// Backend: Cambiar test_steps de TEXT a JSONB
ALTER TABLE test_cases
  ALTER COLUMN test_steps TYPE JSONB
  USING test_steps::jsonb;

-- Migración de datos existentes (si hay):
UPDATE test_cases
SET test_steps = '[]'::jsonb
WHERE test_steps IS NULL OR test_steps = '';
```

---

### 4️⃣ ENTIDAD: Execution

#### Frontend (Figma)
```typescript
interface Execution {
  id: string;
  project_id: string;
  suite_id: string;
  status: ExecutionStatus;      // 'passed' | 'failed' | 'running' | 'queued' | 'skipped'
  started_at: string;           // ISO Date
  duration_ms: number;
  passed_count: number;
  failed_count: number;
  defect_id?: string;           // Linked defect if failed
}
```

#### Backend (Supabase)
```sql
CREATE TABLE test_executions (
    id UUID,
    project_id UUID,
    test_suite_id UUID,           -- ✅ Coincide (suite_id)
    status TEXT ('pending', 'running', 'completed', 'failed', 'cancelled', 'timeout'),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,     -- ⚠️ seconds vs ms
    total_tests INTEGER,
    passed_tests INTEGER,
    failed_tests INTEGER,
    skipped_tests INTEGER,
    blocked_tests INTEGER,
    -- ⚠️ NO TIENE defect_id directo
    execution_type TEXT,
    environment TEXT,
    browser TEXT,
    trigger_source TEXT,
    error_message TEXT
)
```

#### 🔍 GAPS DETECTADOS:
1. ⚠️ **Status values diferentes**:
   - Frontend: `'passed' | 'failed' | 'running' | 'queued' | 'skipped'`
   - Backend: `'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout'`
2. ⚠️ **Frontend `duration_ms` vs Backend `duration_seconds`** → Factor 1000x
3. ⚠️ **Frontend `passed_count` vs Backend `passed_tests`** → Nombres diferentes
4. ❌ **Frontend `defect_id` no existe en backend** → Requiere JOIN con tabla defects
5. ❌ **Frontend NO tiene**: `execution_type`, `environment`, `browser`, `skipped_tests`, `blocked_tests`

#### ✅ SOLUCIÓN PROPUESTA:
```typescript
// Frontend: Actualizar interface
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout';

export interface Execution {
  id: string;
  project_id: string;
  suite_id: string;
  status: ExecutionStatus;        // ✅ Adoptar valores backend
  execution_type?: string;        // ✅ AGREGAR
  environment?: string;           // ✅ AGREGAR
  browser?: string;               // ✅ AGREGAR
  started_at: string;
  completed_at?: string;          // ✅ AGREGAR
  duration_ms: number;            // Computar: duration_seconds * 1000
  total_tests?: number;           // ✅ AGREGAR
  passed_count: number;           // Mapear desde passed_tests
  failed_count: number;           // Mapear desde failed_tests
  skipped_count?: number;         // ✅ AGREGAR
  blocked_count?: number;         // ✅ AGREGAR
  defect_ids?: string[];          // ✅ Cambiar a array (relacionar vía test_execution_results)
}

// Backend: Agregar columna defect_id si es necesario
-- O mejor: usar la relación existente test_execution_results -> test_cases -> (potential defects)
```

---

### 5️⃣ ENTIDAD: Defect (⚠️ SOLO EN FRONTEND)

#### Frontend (Figma)
```typescript
interface Defect {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  created_at: string;
}
```

#### Backend (Supabase)
```sql
-- ❌ NO EXISTE tabla "defects" explícita
-- Posiblemente mapeado a issues o test_execution_results con status=failed
```

#### 🔍 GAPS DETECTADOS:
1. ❌ **Backend NO tiene tabla `defects`** separada
2. ⚠️ Posiblemente mapeado a registros de `test_execution_results` con `status='failed'`

#### ✅ SOLUCIÓN PROPUESTA:
```sql
-- Opción A: Crear tabla defects
CREATE TABLE defects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    execution_result_id UUID REFERENCES test_execution_results(id),
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    status TEXT CHECK (status IN ('open', 'in_progress', 'fixed', 'wont_fix', 'duplicate')),
    assigned_to UUID REFERENCES auth.users(id),
    external_issue_id TEXT,  -- Link to Jira, Azure DevOps, etc.
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

-- Opción B: Usar test_execution_results con failed status como defects
-- y agregar campos adicionales
ALTER TABLE test_execution_results
  ADD COLUMN defect_severity TEXT,
  ADD COLUMN defect_assigned_to UUID REFERENCES auth.users(id);
```

---

### 6️⃣ ENTIDAD: UiConfig (❌ SOLO EN FRONTEND)

#### Frontend (Figma UiContext.tsx)
```typescript
interface UiConfig {
  login: LoginConfig;
  header: HeaderConfig;
  dashboard: DashboardConfig;
}

interface LoginConfig {
  title: string;
  subtitle: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  rememberMeText: string;
  signInButtonText: string;
  forgotPasswordText: string;
  signUpText: string;
  microsoftButtonText: string;
  footerText: string;
  showMicrosoftLogin: boolean;
  showFooter: boolean;
  backgroundImage: string;
}
// ... (HeaderConfig, DashboardConfig similares)
```

#### Backend (Supabase)
```sql
-- ❌ NO EXISTE en schema actual
```

#### ✅ SOLUCIÓN PROPUESTA:
```sql
-- Crear tabla ui_configs (CMS-like approach)
CREATE TABLE ui_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    section TEXT NOT NULL CHECK (section IN ('login', 'header', 'dashboard', 'footer')),
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, section)
);

-- Seed data ejemplo:
INSERT INTO ui_configs (tenant_id, section, config) VALUES
(
  'tenant-uuid-here',
  'login',
  '{
    "title": "Welcome Back",
    "subtitle": "Enter your credentials to access your QA workspace",
    "emailPlaceholder": "hola@stayarta.com",
    "showMicrosoftLogin": true,
    "showFooter": true
  }'::jsonb
);
```

---

### 7️⃣ INTERNACIONALIZACIÓN (i18n)

#### Frontend (Figma LanguageContext.tsx)
```typescript
type Language = "es" | "en" | "fr";

const translations: Translations = {
  en: { "dashboard.title": "Quality Assurance Dashboard", ... },
  es: { "dashboard.title": "Panel de Control QA", ... },
  fr: { "dashboard.title": "Tableau de Bord QA", ... }
};
```

#### Backend (Supabase)
```sql
-- ✅ user_profiles.locale TEXT DEFAULT 'es'
-- ✅ tenants.locale TEXT DEFAULT 'es'
```

#### ✅ COMPATIBLE - Recomendaciones:
1. ✅ **Frontend maneja traducciones client-side** (correcto para UX)
2. ✅ **Backend almacena preferencia de usuario** en `user_profiles.locale`
3. 💡 **Opcional**: Crear tabla `i18n_translations` para gestionar traducciones desde DB
```sql
CREATE TABLE i18n_translations (
    key TEXT,
    locale TEXT,
    value TEXT NOT NULL,
    section TEXT,  -- 'dashboard', 'login', etc.
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (key, locale)
);

-- Seed ejemplo:
INSERT INTO i18n_translations (key, locale, value, section) VALUES
('dashboard.title', 'es', 'Panel de Control QA', 'dashboard'),
('dashboard.title', 'en', 'Quality Assurance Dashboard', 'dashboard'),
('dashboard.title', 'fr', 'Tableau de Bord QA', 'dashboard');
```

---

## 🚨 GAPS CRÍTICOS RESUMEN

| # | Gap | Impacto | Solución | Prioridad |
|---|-----|---------|----------|-----------|
| 1 | Frontend NO maneja `tenant_id` (multi-tenancy) | 🔴 CRÍTICO | Agregar tenant_id a todos los interfaces | P0 |
| 2 | Enums con valores diferentes (Status, Priority, etc.) | 🟠 ALTO | Normalizar valores en ambos lados | P0 |
| 3 | Frontend `steps` es JSON, Backend `test_steps` es TEXT | 🟠 ALTO | Migrar columna a JSONB | P1 |
| 4 | No existe tabla `defects` en backend | 🟡 MEDIO | Crear tabla defects | P1 |
| 5 | No existe tabla `ui_configs` en backend | 🟡 MEDIO | Crear tabla ui_configs | P2 |
| 6 | Duration en ms vs seconds | 🟢 BAJO | Convertir en backend API | P2 |
| 7 | Nombres de campos diferentes (title/name, etc.) | 🟢 BAJO | Mapear en API layer | P3 |

---

## 📋 PLAN DE ACCIÓN

### FASE 1: Correcciones Críticas (P0)
1. ✅ Agregar `tenant_id` a interfaces frontend
2. ✅ Normalizar enums (Status, Priority, ExecutionStatus, TestType)
3. ✅ Actualizar schema.sql con valores normalizados
4. ✅ Crear migration scripts

### FASE 2: Schema Migrations (P1)
1. ✅ Migrar `test_steps` de TEXT a JSONB
2. ✅ Crear tabla `defects`
3. ✅ Actualizar constraints de enums
4. ✅ Crear views computadas (test_suites_with_counts)

### FASE 3: Features Adicionales (P2)
1. ✅ Crear tabla `ui_configs`
2. ✅ Crear tabla `i18n_translations` (opcional)
3. ✅ Implementar computed properties en API

### FASE 4: Refinamiento (P3)
1. ✅ Normalizar nombres de campos (title→name mapeo)
2. ✅ Documentar mapping layer en FastAPI
3. ✅ Crear tests de integración

---

## 🔧 ARCHIVOS A MODIFICAR

### Frontend (TypeScript)
- ✅ `contexts/DataContext.tsx` → Actualizar interfaces
- ✅ `contexts/UiContext.tsx` → Mantener (agregar sync con DB opcional)
- ✅ `contexts/LanguageContext.tsx` → Mantener (agregar sync con DB opcional)

### Backend (Python + SQL)
- ✅ `infrastructure/supabase/schema.sql` → Normalizar enums, agregar tablas
- ✅ `infrastructure/supabase/migrations/` → Crear migration scripts
- ✅ `app/routes/projects.py` → Implementar mapping layer
- ✅ `app/routes/test_suites.py` → Implementar computed properties
- ✅ `app/routes/test_cases.py` → Handle JSON steps
- ✅ `app/routes/executions.py` → Convertir duration ms/s

---

## ✅ PRÓXIMOS PASOS INMEDIATOS

1. **[AHORA]** Ejecutar Docker para testear backend actual
2. **[AHORA]** Crear migration SQL con correcciones P0 + P1
3. **[DESPUÉS]** Implementar mapping layer en FastAPI routes
4. **[DESPUÉS]** Actualizar interfaces TypeScript frontend
5. **[DESPUÉS]** Testear integración completa frontend-backend

---

**Última actualización**: ++34662652300:15 UTC
