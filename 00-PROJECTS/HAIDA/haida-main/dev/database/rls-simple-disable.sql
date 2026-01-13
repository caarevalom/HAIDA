-- ============================================
-- SOLUCIÓN SIMPLE: DESHABILITAR RLS
-- ============================================
-- Para aplicaciones internas o en desarrollo,
-- es más simple deshabilitar RLS completamente
-- ============================================

-- Deshabilitar RLS en todas las tablas principales
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_suites DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_executions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_execution_results DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS está deshabilitado
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'users',
    'projects',
    'test_suites',
    'test_cases',
    'test_executions',
    'test_execution_results'
  )
ORDER BY tablename;

-- Resultado esperado: rls_enabled = false para todas las tablas

SELECT '✅ RLS deshabilitado en todas las tablas' as status;
