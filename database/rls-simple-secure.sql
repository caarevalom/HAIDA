-- ============================================
-- SOLUCIÓN INTERMEDIA: RLS SEGURO PERO SIMPLE
-- ============================================
-- Lectura pública, escritura solo autenticados
-- Balance perfecto entre seguridad y funcionalidad
-- ============================================

-- 1. Limpiar todas las políticas existentes
-- ============================================

-- Projects
DROP POLICY IF EXISTS "projects_select_authenticated" ON public.projects;
DROP POLICY IF EXISTS "projects_select_anon" ON public.projects;
DROP POLICY IF EXISTS "projects_insert_authenticated" ON public.projects;
DROP POLICY IF EXISTS "projects_update_authenticated" ON public.projects;
DROP POLICY IF EXISTS "projects_delete_authenticated" ON public.projects;
DROP POLICY IF EXISTS "projects_all_public" ON public.projects;

-- Test Suites
DROP POLICY IF EXISTS "test_suites_select_authenticated" ON public.test_suites;
DROP POLICY IF EXISTS "test_suites_select_anon" ON public.test_suites;
DROP POLICY IF EXISTS "test_suites_insert_authenticated" ON public.test_suites;
DROP POLICY IF EXISTS "test_suites_update_authenticated" ON public.test_suites;
DROP POLICY IF EXISTS "test_suites_delete_authenticated" ON public.test_suites;
DROP POLICY IF EXISTS "test_suites_all_public" ON public.test_suites;

-- Test Cases
DROP POLICY IF EXISTS "test_cases_select_authenticated" ON public.test_cases;
DROP POLICY IF EXISTS "test_cases_select_anon" ON public.test_cases;
DROP POLICY IF EXISTS "test_cases_insert_authenticated" ON public.test_cases;
DROP POLICY IF EXISTS "test_cases_all_public" ON public.test_cases;

-- Test Executions
DROP POLICY IF EXISTS "test_executions_select_authenticated" ON public.test_executions;
DROP POLICY IF EXISTS "test_executions_select_anon" ON public.test_executions;
DROP POLICY IF EXISTS "test_executions_all_public" ON public.test_executions;

-- Test Execution Results
DROP POLICY IF EXISTS "test_execution_results_all_public" ON public.test_execution_results;

-- 2. Políticas SIMPLES: Lectura para todos, escritura para autenticados
-- ============================================

-- PROJECTS
-- Lectura: Todos (anon + authenticated)
CREATE POLICY "projects_select_all"
ON public.projects
FOR SELECT
USING (true);

-- Escritura: Solo autenticados
CREATE POLICY "projects_write_authenticated"
ON public.projects
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- TEST SUITES
-- Lectura: Todos
CREATE POLICY "test_suites_select_all"
ON public.test_suites
FOR SELECT
USING (true);

-- Escritura: Solo autenticados
CREATE POLICY "test_suites_write_authenticated"
ON public.test_suites
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- TEST CASES
-- Lectura: Todos
CREATE POLICY "test_cases_select_all"
ON public.test_cases
FOR SELECT
USING (true);

-- Escritura: Solo autenticados
CREATE POLICY "test_cases_write_authenticated"
ON public.test_cases
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- TEST EXECUTIONS
-- Lectura: Todos
CREATE POLICY "test_executions_select_all"
ON public.test_executions
FOR SELECT
USING (true);

-- Escritura: Solo autenticados
CREATE POLICY "test_executions_write_authenticated"
ON public.test_executions
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- TEST EXECUTION RESULTS
-- Lectura: Todos
CREATE POLICY "test_execution_results_select_all"
ON public.test_execution_results
FOR SELECT
USING (true);

-- Escritura: Solo autenticados
CREATE POLICY "test_execution_results_write_authenticated"
ON public.test_execution_results
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 3. Habilitar RLS
-- ============================================

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_suites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_execution_results ENABLE ROW LEVEL SECURITY;

-- 4. Verificación
-- ============================================

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'projects',
    'test_suites',
    'test_cases',
    'test_executions',
    'test_execution_results'
  )
ORDER BY tablename, policyname;

SELECT '✅ RLS configurado: Lectura pública, Escritura autenticada' as status;
