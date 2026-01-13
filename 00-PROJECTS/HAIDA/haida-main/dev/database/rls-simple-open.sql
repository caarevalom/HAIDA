-- ============================================
-- SOLUCIÓN SIMPLE: RLS ABIERTO (TODO PÚBLICO)
-- ============================================
-- Mantiene RLS habilitado pero con políticas
-- completamente abiertas (lectura/escritura para todos)
-- ============================================

-- 1. Limpiar todas las políticas existentes
-- ============================================

-- Projects
DROP POLICY IF EXISTS "projects_select_authenticated" ON public.projects;
DROP POLICY IF EXISTS "projects_select_anon" ON public.projects;
DROP POLICY IF EXISTS "projects_insert_authenticated" ON public.projects;
DROP POLICY IF EXISTS "projects_update_authenticated" ON public.projects;
DROP POLICY IF EXISTS "projects_delete_authenticated" ON public.projects;
DROP POLICY IF EXISTS "projects_read_policy" ON public.projects;
DROP POLICY IF EXISTS "projects_insert_policy" ON public.projects;
DROP POLICY IF EXISTS "projects_update_policy" ON public.projects;
DROP POLICY IF EXISTS "projects_delete_policy" ON public.projects;

-- Test Suites
DROP POLICY IF EXISTS "test_suites_select_authenticated" ON public.test_suites;
DROP POLICY IF EXISTS "test_suites_select_anon" ON public.test_suites;
DROP POLICY IF EXISTS "test_suites_insert_authenticated" ON public.test_suites;
DROP POLICY IF EXISTS "test_suites_update_authenticated" ON public.test_suites;
DROP POLICY IF EXISTS "test_suites_delete_authenticated" ON public.test_suites;
DROP POLICY IF EXISTS "test_suites_read_policy" ON public.test_suites;

-- Test Cases
DROP POLICY IF EXISTS "test_cases_select_authenticated" ON public.test_cases;
DROP POLICY IF EXISTS "test_cases_select_anon" ON public.test_cases;
DROP POLICY IF EXISTS "test_cases_insert_authenticated" ON public.test_cases;
DROP POLICY IF EXISTS "test_cases_read_policy" ON public.test_cases;

-- Test Executions
DROP POLICY IF EXISTS "test_executions_select_authenticated" ON public.test_executions;
DROP POLICY IF EXISTS "test_executions_select_anon" ON public.test_executions;

-- 2. Crear políticas SÚPER SIMPLES (todo público)
-- ============================================

-- PROJECTS: Todo el mundo puede hacer todo
CREATE POLICY "projects_all_public"
ON public.projects
FOR ALL
USING (true)
WITH CHECK (true);

-- TEST SUITES: Todo el mundo puede hacer todo
CREATE POLICY "test_suites_all_public"
ON public.test_suites
FOR ALL
USING (true)
WITH CHECK (true);

-- TEST CASES: Todo el mundo puede hacer todo
CREATE POLICY "test_cases_all_public"
ON public.test_cases
FOR ALL
USING (true)
WITH CHECK (true);

-- TEST EXECUTIONS: Todo el mundo puede hacer todo
CREATE POLICY "test_executions_all_public"
ON public.test_executions
FOR ALL
USING (true)
WITH CHECK (true);

-- TEST EXECUTION RESULTS: Todo el mundo puede hacer todo
CREATE POLICY "test_execution_results_all_public"
ON public.test_execution_results
FOR ALL
USING (true)
WITH CHECK (true);

-- 3. Asegurar que RLS está habilitado
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

SELECT '✅ RLS configurado con políticas abiertas (todo público)' as status;
