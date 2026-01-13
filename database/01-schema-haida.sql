-- ============================================
-- HAIDA DATABASE SCHEMA v1.0
-- Supabase PostgreSQL Database
-- ============================================
-- Description: Complete schema for HAIDA QA Automation System
-- Host: db.wdebyxvtunromsnkqbrd.supabase.co
-- Port: 5432
-- Database: postgres
-- ============================================

-- Drop existing tables if they exist (for clean reinstall)
-- CAUTION: This will delete all data!
DROP TABLE IF EXISTS test_executions CASCADE;
DROP TABLE IF EXISTS test_results CASCADE;
DROP TABLE IF EXISTS change_detections CASCADE;
DROP TABLE IF EXISTS test_cases CASCADE;
DROP TABLE IF EXISTS test_suites CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- TABLE: users
-- Purpose: Store user information for audit and permissions
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer', -- admin, qa_engineer, developer, viewer
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

COMMENT ON TABLE users IS 'User accounts for HAIDA system';
COMMENT ON COLUMN users.metadata IS 'Additional user metadata (preferences, settings, etc)';

-- ============================================
-- TABLE: projects
-- Purpose: Store project/application configurations
-- ============================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL, -- URL-friendly identifier
    description TEXT,
    base_url VARCHAR(500) NOT NULL, -- Base URL of the application
    repository_url VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, archived, maintenance
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    settings JSONB DEFAULT '{}'::jsonb, -- Project-specific settings
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_owner_id ON projects(owner_id);

COMMENT ON TABLE projects IS 'Projects/Applications being tested by HAIDA';
COMMENT ON COLUMN projects.settings IS 'Project configuration (notification webhooks, thresholds, etc)';

-- ============================================
-- TABLE: test_suites
-- Purpose: Group related test cases together
-- ============================================
CREATE TABLE test_suites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    suite_type VARCHAR(50) NOT NULL, -- smoke, regression, integration, e2e, api, performance, accessibility, security
    priority VARCHAR(20) DEFAULT 'medium', -- critical, high, medium, low
    tags TEXT[], -- Array of tags for filtering
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_test_suites_project_id ON test_suites(project_id);
CREATE INDEX idx_test_suites_suite_type ON test_suites(suite_type);
CREATE INDEX idx_test_suites_is_active ON test_suites(is_active);
CREATE INDEX idx_test_suites_tags ON test_suites USING GIN(tags);

COMMENT ON TABLE test_suites IS 'Test suite definitions';

-- ============================================
-- TABLE: test_cases
-- Purpose: Store individual test case definitions (ISTQB compliant)
-- ============================================
CREATE TABLE test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_suite_id UUID NOT NULL REFERENCES test_suites(id) ON DELETE CASCADE,
    test_id VARCHAR(50) UNIQUE NOT NULL, -- TC_LOGIN_001, etc
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- ISTQB Fields
    test_type VARCHAR(50) NOT NULL, -- Unit, Integration, E2E, API, Smoke, etc
    component VARCHAR(100),
    module VARCHAR(100),
    requirement_ids TEXT[], -- Array of requirement IDs this test covers
    preconditions TEXT,
    test_steps TEXT NOT NULL,
    expected_result TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium', -- P0 (blocker), P1 (critical), P2 (high), P3 (medium), P4 (low)
    risk_level VARCHAR(20) DEFAULT 'medium', -- high, medium, low

    -- Automation
    is_automated BOOLEAN DEFAULT false,
    automation_script_path VARCHAR(500), -- Path to test file
    automation_framework VARCHAR(50), -- playwright, newman, k6, etc

    -- Status
    status VARCHAR(50) DEFAULT 'active', -- active, deprecated, archived
    tags TEXT[], -- Array of tags

    -- Audit
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Additional metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_test_cases_test_suite_id ON test_cases(test_suite_id);
CREATE INDEX idx_test_cases_test_id ON test_cases(test_id);
CREATE INDEX idx_test_cases_test_type ON test_cases(test_type);
CREATE INDEX idx_test_cases_status ON test_cases(status);
CREATE INDEX idx_test_cases_is_automated ON test_cases(is_automated);
CREATE INDEX idx_test_cases_tags ON test_cases USING GIN(tags);
CREATE INDEX idx_test_cases_requirement_ids ON test_cases USING GIN(requirement_ids);

COMMENT ON TABLE test_cases IS 'Individual test case definitions (ISTQB compliant)';
COMMENT ON COLUMN test_cases.requirement_ids IS 'Traceability to requirements';

-- ============================================
-- TABLE: change_detections
-- Purpose: Store detected changes from changedetection.io
-- ============================================
CREATE TABLE change_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- Change Detection Info
    url VARCHAR(500) NOT NULL,
    tag VARCHAR(100), -- Tag from changedetection.io
    change_type VARCHAR(50), -- html, css, javascript, api, visual
    previous_md5 VARCHAR(32),
    current_md5 VARCHAR(32),
    diff_summary TEXT,

    -- Webhook Info
    webhook_payload JSONB, -- Full webhook payload

    -- Test Selection
    selected_test_profile VARCHAR(100), -- Which test profile was selected
    test_suite_ids UUID[], -- Array of test suite IDs to execute

    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    processed_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_change_detections_project_id ON change_detections(project_id);
CREATE INDEX idx_change_detections_url ON change_detections(url);
CREATE INDEX idx_change_detections_status ON change_detections(status);
CREATE INDEX idx_change_detections_detected_at ON change_detections(detected_at DESC);
CREATE INDEX idx_change_detections_test_suite_ids ON change_detections USING GIN(test_suite_ids);

COMMENT ON TABLE change_detections IS 'Detected changes from changedetection.io webhook';

-- ============================================
-- TABLE: test_executions
-- Purpose: Store test execution runs
-- ============================================
CREATE TABLE test_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    change_detection_id UUID REFERENCES change_detections(id) ON DELETE SET NULL,

    -- Execution Info
    execution_type VARCHAR(50) NOT NULL, -- manual, scheduled, webhook_triggered, ci_cd
    trigger_source VARCHAR(100), -- github_actions, changedetection, manual, cron

    -- Environment
    environment VARCHAR(50) DEFAULT 'staging', -- production, staging, qa, dev
    browser VARCHAR(50), -- chromium, firefox, webkit, mobile
    platform VARCHAR(50), -- Desktop Chrome, iPhone 14, etc

    -- Status
    status VARCHAR(50) DEFAULT 'running', -- pending, running, completed, failed, cancelled
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER, -- Execution duration in milliseconds

    -- Stats
    total_tests INTEGER DEFAULT 0,
    passed_tests INTEGER DEFAULT 0,
    failed_tests INTEGER DEFAULT 0,
    skipped_tests INTEGER DEFAULT 0,

    -- Results
    allure_report_url VARCHAR(500),
    playwright_report_url VARCHAR(500),
    artifacts_path VARCHAR(500),

    -- Triggered by
    triggered_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_test_executions_project_id ON test_executions(project_id);
CREATE INDEX idx_test_executions_change_detection_id ON test_executions(change_detection_id);
CREATE INDEX idx_test_executions_status ON test_executions(status);
CREATE INDEX idx_test_executions_started_at ON test_executions(started_at DESC);
CREATE INDEX idx_test_executions_environment ON test_executions(environment);
CREATE INDEX idx_test_executions_execution_type ON test_executions(execution_type);

COMMENT ON TABLE test_executions IS 'Test execution runs';

-- ============================================
-- TABLE: test_results
-- Purpose: Store individual test case results
-- ============================================
CREATE TABLE test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_execution_id UUID NOT NULL REFERENCES test_executions(id) ON DELETE CASCADE,
    test_case_id UUID REFERENCES test_cases(id) ON DELETE SET NULL,

    -- Test Info
    test_name VARCHAR(255) NOT NULL,
    test_file VARCHAR(500),
    test_id_ref VARCHAR(50), -- Reference to test_cases.test_id

    -- Result
    status VARCHAR(50) NOT NULL, -- passed, failed, skipped, flaky
    error_message TEXT,
    error_stack TEXT,
    duration_ms INTEGER,
    retries INTEGER DEFAULT 0,

    -- Evidence
    screenshot_url VARCHAR(500),
    video_url VARCHAR(500),
    trace_url VARCHAR(500),
    logs TEXT,

    -- Assertions
    assertions_passed INTEGER DEFAULT 0,
    assertions_failed INTEGER DEFAULT 0,

    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_test_results_test_execution_id ON test_results(test_execution_id);
CREATE INDEX idx_test_results_test_case_id ON test_results(test_case_id);
CREATE INDEX idx_test_results_status ON test_results(status);
CREATE INDEX idx_test_results_test_id_ref ON test_results(test_id_ref);

COMMENT ON TABLE test_results IS 'Individual test case execution results';

-- ============================================
-- VIEWS: Useful aggregations
-- ============================================

-- View: Project Health Dashboard
CREATE OR REPLACE VIEW v_project_health AS
SELECT
    p.id AS project_id,
    p.name AS project_name,
    p.status AS project_status,
    COUNT(DISTINCT te.id) AS total_executions,
    COUNT(DISTINCT te.id) FILTER (WHERE te.status = 'completed') AS completed_executions,
    COUNT(DISTINCT te.id) FILTER (WHERE te.status = 'failed') AS failed_executions,
    AVG(te.duration_ms) AS avg_duration_ms,
    SUM(te.passed_tests) AS total_passed,
    SUM(te.failed_tests) AS total_failed,
    CASE
        WHEN SUM(te.total_tests) > 0
        THEN ROUND((SUM(te.passed_tests)::NUMERIC / SUM(te.total_tests)::NUMERIC) * 100, 2)
        ELSE 0
    END AS pass_rate_percentage,
    MAX(te.started_at) AS last_execution_at
FROM projects p
LEFT JOIN test_executions te ON p.id = te.project_id
GROUP BY p.id, p.name, p.status;

COMMENT ON VIEW v_project_health IS 'Project health metrics dashboard';

-- View: Test Case Coverage
CREATE OR REPLACE VIEW v_test_coverage AS
SELECT
    ts.id AS test_suite_id,
    ts.name AS test_suite_name,
    ts.suite_type,
    COUNT(DISTINCT tc.id) AS total_test_cases,
    COUNT(DISTINCT tc.id) FILTER (WHERE tc.is_automated = true) AS automated_test_cases,
    COUNT(DISTINCT tc.id) FILTER (WHERE tc.is_automated = false) AS manual_test_cases,
    CASE
        WHEN COUNT(DISTINCT tc.id) > 0
        THEN ROUND((COUNT(DISTINCT tc.id) FILTER (WHERE tc.is_automated = true)::NUMERIC / COUNT(DISTINCT tc.id)::NUMERIC) * 100, 2)
        ELSE 0
    END AS automation_percentage
FROM test_suites ts
LEFT JOIN test_cases tc ON ts.id = tc.test_suite_id
WHERE ts.is_active = true AND tc.status = 'active'
GROUP BY ts.id, ts.name, ts.suite_type;

COMMENT ON VIEW v_test_coverage IS 'Test automation coverage metrics';

-- View: Recent Test Executions
CREATE OR REPLACE VIEW v_recent_executions AS
SELECT
    te.id,
    te.started_at,
    te.completed_at,
    te.status,
    te.duration_ms,
    te.total_tests,
    te.passed_tests,
    te.failed_tests,
    p.name AS project_name,
    te.environment,
    te.browser,
    cd.url AS changed_url,
    u.name AS triggered_by_name
FROM test_executions te
LEFT JOIN projects p ON te.project_id = p.id
LEFT JOIN change_detections cd ON te.change_detection_id = cd.id
LEFT JOIN users u ON te.triggered_by = u.id
ORDER BY te.started_at DESC
LIMIT 100;

COMMENT ON VIEW v_recent_executions IS 'Recent test executions with context';

-- ============================================
-- FUNCTIONS: Helper functions
-- ============================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_test_suites_updated_at BEFORE UPDATE ON test_suites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_test_cases_updated_at BEFORE UPDATE ON test_cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Calculate execution duration
CREATE OR REPLACE FUNCTION calculate_execution_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.completed_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
        NEW.duration_ms = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) * 1000;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_test_execution_duration BEFORE UPDATE ON test_executions FOR EACH ROW EXECUTE FUNCTION calculate_execution_duration();

-- ============================================
-- SEED DATA: Initial data for testing
-- ============================================

-- Insert default admin user
INSERT INTO users (email, name, role) VALUES
('admin@haida.com', 'HAIDA Admin', 'admin'),
('qa@haida.com', 'QA Engineer', 'qa_engineer'),
('dev@haida.com', 'Developer', 'developer')
ON CONFLICT (email) DO NOTHING;

-- Insert example project
INSERT INTO projects (name, slug, description, base_url, status, owner_id) VALUES
('HAIDA Demo Project', 'haida-demo', 'Demo project for HAIDA testing', 'https://mcprod.thisisbarcelona.com', 'active',
(SELECT id FROM users WHERE email = 'admin@haida.com' LIMIT 1))
ON CONFLICT (slug) DO NOTHING;

-- Insert example test suite
INSERT INTO test_suites (project_id, name, description, suite_type, priority, tags) VALUES
((SELECT id FROM projects WHERE slug = 'haida-demo' LIMIT 1),
'Smoke Tests',
'Critical smoke tests for main functionality',
'smoke',
'critical',
ARRAY['smoke', 'critical', 'regression'])
ON CONFLICT DO NOTHING;

-- ============================================
-- GRANTS: Set permissions (adjust as needed)
-- ============================================

-- Grant permissions to authenticated users (Supabase)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '
    ============================================
    HAIDA DATABASE SCHEMA CREATED SUCCESSFULLY
    ============================================

    Tables Created:
    - users
    - projects
    - test_suites
    - test_cases
    - change_detections
    - test_executions
    - test_results

    Views Created:
    - v_project_health
    - v_test_coverage
    - v_recent_executions

    Functions Created:
    - update_updated_at_column()
    - calculate_execution_duration()

    Seed Data:
    - 3 default users
    - 1 demo project
    - 1 demo test suite

    Next Steps:
    1. Test connection from HAIDA API
    2. Configure .env with Supabase credentials
    3. Run test data population scripts
    4. Verify in Supabase dashboard

    ============================================
    ';
END $$;
