-- ============================================
-- MIGRATION: Migrar test_steps de TEXT a JSONB
-- Fecha: 2025-12-17
-- Descripción: Convertir test_steps para soportar estructura JSON
-- ============================================

-- Paso 1: Crear columna temporal
ALTER TABLE public.test_cases
ADD COLUMN IF NOT EXISTS test_steps_new JSONB;

-- Paso 2: Migrar datos existentes
-- Si test_steps es NULL o vacío, usar array vacío
-- Si test_steps es TEXT, intentar parsear como JSON, si falla, crear objeto básico
UPDATE public.test_cases
SET test_steps_new =
    CASE
        WHEN test_steps IS NULL OR test_steps = '' THEN '[]'::jsonb
        WHEN test_steps::text ~ '^\[.*\]$' THEN test_steps::jsonb  -- Ya es JSON array
        ELSE
            jsonb_build_array(
                jsonb_build_object(
                    'action', test_steps,
                    'expected', expected_result
                )
            )
    END
WHERE test_steps_new IS NULL;

-- Paso 3: Eliminar columna vieja
ALTER TABLE public.test_cases DROP COLUMN IF EXISTS test_steps;

-- Paso 4: Renombrar columna nueva
ALTER TABLE public.test_cases
RENAME COLUMN test_steps_new TO test_steps;

-- Paso 5: Agregar constraint NOT NULL
ALTER TABLE public.test_cases
ALTER COLUMN test_steps SET DEFAULT '[]'::jsonb;

ALTER TABLE public.test_cases
ALTER COLUMN test_steps SET NOT NULL;

-- Paso 6: Crear índice GIN para búsquedas JSON
CREATE INDEX IF NOT EXISTS idx_test_cases_test_steps_gin
ON public.test_cases USING GIN (test_steps);

-- Comentarios
COMMENT ON COLUMN public.test_cases.test_steps IS 'Array JSON de pasos: [{"action": "...", "expected": "..."}]';

-- Migración completada
SELECT 'Migration 002: test_steps migrado a JSONB exitosamente' AS status;
