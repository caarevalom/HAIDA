-- HAIDA Database Initialization Script
-- PostgreSQL schema for test results storage

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para búsquedas full-text

-- ============================================
-- TABLES
-- ============================================

-- Test Runs - Información de cada ejecución de tests
CREATE TABLE IF NOT EXISTS test_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_id VARCHAR(100) UNIQUE NOT NULL,
    trigger_source VARCHAR(50) NOT NULL, -- 'changedetection', 'manual', 'scheduled', 'webhook'
    trigger_metadata JSONB,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'running', -- 'running', 'passed', 'failed', 'error'
    total_tests INTEGER DEFAULT 0,
    passed_tests INTEGER DEFAULT 0,
    failed_tests INTEGER DEFAULT 0,
    skipped_tests INTEGER DEFAULT 0,
    duration_ms INTEGER,
    environment VARCHAR(50),
    browser VARCHAR(50),
    test_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test Cases - Resultados individuales de cada test
CREATE TABLE IF NOT EXISTS test_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_run_id UUID NOT NULL REFERENCES test_runs(id) ON DELETE CASCADE,
    test_name VARCHAR(255) NOT NULL,
    test_file VARCHAR(255),
    test_project VARCHAR(100), -- 'form-validation', 'widget-rendering', etc.
    status VARCHAR(20) NOT NULL, -- 'passed', 'failed', 'skipped', 'timeout'
    duration_ms INTEGER,
    error_message TEXT,
    error_stack TEXT,
    retry_count INTEGER DEFAULT 0,
    screenshot_path TEXT,
    video_path TEXT,
    trace_path TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Change Detections - Registro de cambios detectados
CREATE TABLE IF NOT EXISTS change_detections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    watch_id VARCHAR(100) NOT NULL,
    watch_url TEXT NOT NULL,
    change_type VARCHAR(50), -- 'content', 'visual', 'structure'
    change_summary TEXT,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    test_run_id UUID REFERENCES test_runs(id) ON DELETE SET NULL,
    notified BOOLEAN DEFAULT FALSE,
    notification_channels TEXT[], -- ['slack', 'email', 'webhook']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications - Historial de notificaciones enviadas
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
    channel VARCHAR(50) NOT NULL, -- 'slack', 'email', 'teams', 'webhook'
    recipient TEXT NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test Metrics - Métricas agregadas para dashboards
CREATE TABLE IF NOT EXISTS test_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_date DATE NOT NULL,
    total_runs INTEGER DEFAULT 0,
    successful_runs INTEGER DEFAULT 0,
    failed_runs INTEGER DEFAULT 0,
    avg_duration_ms INTEGER,
    total_tests INTEGER DEFAULT 0,
    pass_rate DECIMAL(5,2),
    flaky_tests TEXT[], -- Array de nombres de tests flakey
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(metric_date)
);

-- ============================================
-- INDEXES
-- ============================================

-- Test Runs indexes
CREATE INDEX idx_test_runs_run_id ON test_runs(run_id);
CREATE INDEX idx_test_runs_status ON test_runs(status);
CREATE INDEX idx_test_runs_start_time ON test_runs(start_time DESC);
CREATE INDEX idx_test_runs_trigger_source ON test_runs(trigger_source);

-- Test Cases indexes
CREATE INDEX idx_test_cases_test_run_id ON test_cases(test_run_id);
CREATE INDEX idx_test_cases_status ON test_cases(status);
CREATE INDEX idx_test_cases_test_name ON test_cases(test_name);
CREATE INDEX idx_test_cases_test_project ON test_cases(test_project);

-- Change Detections indexes
CREATE INDEX idx_change_detections_watch_id ON change_detections(watch_id);
CREATE INDEX idx_change_detections_detected_at ON change_detections(detected_at DESC);
CREATE INDEX idx_change_detections_test_run_id ON change_detections(test_run_id);

-- Notifications indexes
CREATE INDEX idx_notifications_test_run_id ON notifications(test_run_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_channel ON notifications(channel);

-- Test Metrics indexes
CREATE INDEX idx_test_metrics_metric_date ON test_metrics(metric_date DESC);

-- ============================================
-- TRIGGERS
-- ============================================

-- Actualizar updated_at en test_runs
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_test_runs_updated_at BEFORE UPDATE ON test_runs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS
-- ============================================

-- Vista: Últimos test runs con estadísticas
CREATE OR REPLACE VIEW v_recent_test_runs AS
SELECT
    tr.id,
    tr.run_id,
    tr.trigger_source,
    tr.status,
    tr.start_time,
    tr.end_time,
    tr.duration_ms,
    tr.total_tests,
    tr.passed_tests,
    tr.failed_tests,
    tr.skipped_tests,
    CASE
        WHEN tr.total_tests > 0 THEN ROUND((tr.passed_tests::DECIMAL / tr.total_tests * 100), 2)
        ELSE 0
    END as pass_rate,
    tr.environment,
    tr.browser,
    COUNT(tc.id) as test_case_count,
    tr.created_at
FROM test_runs tr
LEFT JOIN test_cases tc ON tc.test_run_id = tr.id
GROUP BY tr.id
ORDER BY tr.start_time DESC;

-- Vista: Tests fallidos con detalles
CREATE OR REPLACE VIEW v_failed_tests AS
SELECT
    tc.id,
    tc.test_name,
    tc.test_file,
    tc.test_project,
    tc.error_message,
    tc.duration_ms,
    tc.retry_count,
    tc.screenshot_path,
    tr.run_id,
    tr.start_time as run_start_time,
    tr.browser,
    tr.environment
FROM test_cases tc
JOIN test_runs tr ON tc.test_run_id = tr.id
WHERE tc.status = 'failed'
ORDER BY tc.finished_at DESC;

-- Vista: Resumen diario de tests
CREATE OR REPLACE VIEW v_daily_test_summary AS
SELECT
    DATE(start_time) as test_date,
    COUNT(*) as total_runs,
    SUM(CASE WHEN status = 'passed' THEN 1 ELSE 0 END) as passed_runs,
    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_runs,
    SUM(total_tests) as total_tests,
    SUM(passed_tests) as total_passed,
    SUM(failed_tests) as total_failed,
    ROUND(AVG(duration_ms), 0) as avg_duration_ms,
    ROUND(
        (SUM(passed_tests)::DECIMAL / NULLIF(SUM(total_tests), 0) * 100),
        2
    ) as overall_pass_rate
FROM test_runs
WHERE start_time >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(start_time)
ORDER BY test_date DESC;

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insertar métricas iniciales
INSERT INTO test_metrics (metric_date, total_runs, successful_runs, failed_runs, pass_rate)
VALUES (CURRENT_DATE, 0, 0, 0, 0.00)
ON CONFLICT (metric_date) DO NOTHING;

-- ============================================
-- PERMISSIONS
-- ============================================

-- Otorgar permisos al usuario haida_user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO haida_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO haida_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO haida_user;

-- ============================================
-- COMPLETION
-- ============================================

-- Log de inicialización
DO $$
BEGIN
    RAISE NOTICE 'HAIDA Database initialized successfully';
    RAISE NOTICE 'Tables created: test_runs, test_cases, change_detections, notifications, test_metrics';
    RAISE NOTICE 'Views created: v_recent_test_runs, v_failed_tests, v_daily_test_summary';
END $$;
