-- FIX RLS: Permitir lectura pública de proyectos
-- Problema: Los proyectos existen pero RLS los oculta del usuario anon
-- Solución: Políticas más permisivas para lectura

-- ============================================
-- POLÍTICA: Lectura pública de proyectos
-- ============================================

-- Eliminar política restrictiva existente si existe
DROP POLICY IF EXISTS "projects_read_policy" ON public.projects;
DROP POLICY IF EXISTS "Users can view projects they have access to" ON public.projects;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.projects;

-- Crear política permisiva para SELECT
-- Permite a usuarios autenticados ver todos los proyectos
CREATE POLICY "projects_select_authenticated"
ON public.projects
FOR SELECT
TO authenticated
USING (true);

-- Permitir también a anon ver proyectos (para API pública)
CREATE POLICY "projects_select_anon"
ON public.projects
FOR SELECT
TO anon
USING (true);

-- ============================================
-- POLÍTICA: Lectura pública de test_suites
-- ============================================

DROP POLICY IF EXISTS "test_suites_read_policy" ON public.test_suites;
DROP POLICY IF EXISTS "Users can view test suites they have access to" ON public.test_suites;

CREATE POLICY "test_suites_select_authenticated"
ON public.test_suites
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "test_suites_select_anon"
ON public.test_suites
FOR SELECT
TO anon
USING (true);

-- ============================================
-- POLÍTICA: Lectura pública de test_cases
-- ============================================

DROP POLICY IF EXISTS "test_cases_read_policy" ON public.test_cases;

CREATE POLICY "test_cases_select_authenticated"
ON public.test_cases
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "test_cases_select_anon"
ON public.test_cases
FOR SELECT
TO anon
USING (true);

-- ============================================
-- POLÍTICA: Lectura pública de test_executions
-- ============================================

DROP POLICY IF EXISTS "test_executions_read_policy" ON public.test_executions;

CREATE POLICY "test_executions_select_authenticated"
ON public.test_executions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "test_executions_select_anon"
ON public.test_executions
FOR SELECT
TO anon
USING (true);

-- ============================================
-- POLÍTICA: INSERT para usuarios autenticados
-- ============================================

-- Projects
DROP POLICY IF EXISTS "projects_insert_policy" ON public.projects;

CREATE POLICY "projects_insert_authenticated"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Test Suites
DROP POLICY IF EXISTS "test_suites_insert_policy" ON public.test_suites;

CREATE POLICY "test_suites_insert_authenticated"
ON public.test_suites
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Test Cases
DROP POLICY IF EXISTS "test_cases_insert_policy" ON public.test_cases;

CREATE POLICY "test_cases_insert_authenticated"
ON public.test_cases
FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================
-- POLÍTICA: UPDATE para usuarios autenticados
-- ============================================

-- Projects
DROP POLICY IF EXISTS "projects_update_policy" ON public.projects;

CREATE POLICY "projects_update_authenticated"
ON public.projects
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Test Suites
DROP POLICY IF EXISTS "test_suites_update_policy" ON public.test_suites;

CREATE POLICY "test_suites_update_authenticated"
ON public.test_suites
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- POLÍTICA: DELETE para usuarios autenticados
-- ============================================

-- Projects
DROP POLICY IF EXISTS "projects_delete_policy" ON public.projects;

CREATE POLICY "projects_delete_authenticated"
ON public.projects
FOR DELETE
TO authenticated
USING (true);

-- Test Suites
DROP POLICY IF EXISTS "test_suites_delete_policy" ON public.test_suites;

CREATE POLICY "test_suites_delete_authenticated"
ON public.test_suites
FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT 'RLS Policies updated successfully' as status;

-- Mostrar políticas actuales
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('projects', 'test_suites', 'test_cases', 'test_executions')
ORDER BY tablename, policyname;
