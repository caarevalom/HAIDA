-- ============================================
-- MIGRATION: Crear tabla defects
-- Fecha: 2025-12-17
-- Descripción: Tabla para gestión de defectos/bugs
-- ============================================

-- Crear tabla defects
CREATE TABLE IF NOT EXISTS public.defects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    test_execution_id UUID REFERENCES public.test_executions(id) ON DELETE SET NULL,
    test_result_id UUID REFERENCES public.test_execution_results(id) ON DELETE SET NULL,

    -- Información básica
    title TEXT NOT NULL,
    description TEXT,

    -- Clasificación
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',
    priority TEXT CHECK (priority IN ('p0', 'p1', 'p2', 'p3', 'p4')) DEFAULT 'p2',
    status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'wont_fix', 'duplicate')) DEFAULT 'open',

    -- Enlaces externos
    external_issue_id TEXT, -- Link to Jira, Azure DevOps, GitHub Issues, etc.
    external_url TEXT,

    -- Asignación
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reported_by UUID REFERENCES auth.users(id),

    -- Steps to reproduce
    steps_to_reproduce TEXT,
    expected_behavior TEXT,
    actual_behavior TEXT,

    -- Environment
    environment TEXT,
    browser TEXT,
    os_version TEXT,

    -- Adjuntos
    attachments JSONB DEFAULT '[]'::jsonb,

    -- Metadata
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Timestamps
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_defects_tenant_id ON public.defects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_defects_project_id ON public.defects(project_id);
CREATE INDEX IF NOT EXISTS idx_defects_status ON public.defects(status);
CREATE INDEX IF NOT EXISTS idx_defects_severity ON public.defects(severity);
CREATE INDEX IF NOT EXISTS idx_defects_assigned_to ON public.defects(assigned_to);
CREATE INDEX IF NOT EXISTS idx_defects_test_execution_id ON public.defects(test_execution_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_defects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER defects_updated_at
    BEFORE UPDATE ON public.defects
    FOR EACH ROW
    EXECUTE FUNCTION update_defects_updated_at();

-- RLS Policies
ALTER TABLE public.defects ENABLE ROW LEVEL SECURITY;

-- Policy: Los usuarios solo ven defects de su tenant
CREATE POLICY defects_tenant_isolation ON public.defects
    FOR ALL
    USING (tenant_id = auth.uid()::text::uuid)
    WITH CHECK (tenant_id = auth.uid()::text::uuid);

-- Comentarios
COMMENT ON TABLE public.defects IS 'Gestión de defectos/bugs encontrados en testing';
COMMENT ON COLUMN public.defects.external_issue_id IS 'ID del issue en sistema externo (Jira, Azure DevOps, etc.)';
COMMENT ON COLUMN public.defects.attachments IS 'Array JSON de URLs de screenshots/videos adjuntos';
