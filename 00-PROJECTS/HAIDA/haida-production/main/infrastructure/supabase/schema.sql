-- ============================================
-- HAIDA DATABASE SCHEMA v2.0 - COMPLETE
-- Supabase PostgreSQL Database
-- Multi-tenant + RBAC + Feature Flags + Docs + Chat
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- CORE TABLES: Multi-tenant Foundation
-- ============================================

-- Tenants/Workspaces
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    industry TEXT,
    size TEXT CHECK (size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
    timezone TEXT DEFAULT 'Europe/Madrid',
    locale TEXT DEFAULT 'es',
    settings JSONB DEFAULT '{
        "allow_public_signup": false,
        "require_email_verification": true,
        "max_users": 100,
        "max_projects": 50,
        "features": {
            "chat_ia": true,
            "advanced_reporting": false,
            "api_access": false
        }
    }'::jsonb,
    subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'starter', 'professional', 'enterprise')),
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'suspended', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tenant Members (RBAC)
CREATE TABLE tenant_members (
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMPTZ DEFAULT now(),
    joined_at TIMESTAMPTZ,
    last_active_at TIMESTAMPTZ,
    permissions JSONB DEFAULT '[]'::jsonb,
    PRIMARY KEY (tenant_id, user_id)
);

-- ============================================
-- AUTHENTICATION & USERS
-- ============================================

-- Extended user profiles
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    job_title TEXT,
    department TEXT,
    phone TEXT,
    timezone TEXT DEFAULT 'Europe/Madrid',
    locale TEXT DEFAULT 'es',
    preferences JSONB DEFAULT '{
        "theme": "light",
        "notifications": {
            "email": true,
            "push": true,
            "reports": true
        },
        "dashboard_layout": "default"
    }'::jsonb,
    last_login_at TIMESTAMPTZ,
    login_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- SSO Providers (Microsoft Entra, etc.)
CREATE TABLE user_sso_providers (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('microsoft', 'google', 'github', 'saml')),
    provider_id TEXT NOT NULL,
    provider_data JSONB DEFAULT '{}'::jsonb,
    linked_at TIMESTAMPTZ DEFAULT now(),
    last_used_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, provider)
);

-- ============================================
-- RBAC SYSTEM
-- ============================================

-- Global roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT false,
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Global permissions
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Role-permission mappings
CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (role_id, permission_id)
);

-- ============================================
-- FEATURE FLAGS SYSTEM
-- ============================================

-- Global feature flags
CREATE TABLE feature_flags (
    key TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'boolean' CHECK (type IN ('boolean', 'string', 'number', 'json')),
    default_value JSONB DEFAULT false,
    rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    is_active BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tenant-specific flag overrides
CREATE TABLE tenant_feature_flags (
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    flag_key TEXT REFERENCES feature_flags(key) ON DELETE CASCADE,
    value JSONB,
    is_enabled BOOLEAN DEFAULT true,
    rollout_percentage INTEGER DEFAULT 100,
    set_by UUID REFERENCES auth.users(id),
    set_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (tenant_id, flag_key)
);

-- User-specific flag overrides
CREATE TABLE user_feature_flags (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    flag_key TEXT REFERENCES feature_flags(key) ON DELETE CASCADE,
    value JSONB,
    is_enabled BOOLEAN DEFAULT true,
    set_by UUID REFERENCES auth.users(id),
    set_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, flag_key)
);

-- ============================================
-- RATE LIMITING SYSTEM
-- ============================================

-- Rate limit counters
CREATE TABLE rate_limit_counters (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    window_start TIMESTAMPTZ NOT NULL,
    request_count INTEGER DEFAULT 0,
    blocked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, tenant_id, endpoint, window_start)
);

-- Rate limit policies
CREATE TABLE rate_limit_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    requests_per_minute INTEGER DEFAULT 60,
    requests_per_hour INTEGER DEFAULT 1000,
    burst_limit INTEGER DEFAULT 10,
    applies_to TEXT DEFAULT 'user' CHECK (applies_to IN ('user', 'tenant', 'ip')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PROJECTS & TESTING
-- ============================================

-- Projects/Applications
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    base_url TEXT NOT NULL,
    repository_url TEXT,
    documentation_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    type TEXT DEFAULT 'web' CHECK (type IN ('web', 'mobile', 'api', 'desktop')),
    settings JSONB DEFAULT '{
        "test_framework": "playwright",
        "environments": ["staging", "production"],
        "notifications": {
            "slack_webhook": null,
            "email_recipients": []
        }
    }'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, slug)
);

-- Test Suites
CREATE TABLE test_suites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    suite_type TEXT NOT NULL CHECK (suite_type IN ('smoke', 'regression', 'integration', 'e2e', 'api', 'performance', 'accessibility', 'security')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    configuration JSONB DEFAULT '{
        "timeout": 30000,
        "retries": 2,
        "parallel": false,
        "browsers": ["chromium"]
    }'::jsonb,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Test Cases (ISTQB compliant)
CREATE TABLE test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_suite_id UUID NOT NULL REFERENCES test_suites(id) ON DELETE CASCADE,
    test_id TEXT UNIQUE NOT NULL, -- TC_LOGIN_001, etc.
    name TEXT NOT NULL,
    description TEXT,
    test_type TEXT NOT NULL CHECK (test_type IN ('unit', 'integration', 'e2e', 'api', 'smoke', 'manual')),
    component TEXT,
    module TEXT,
    requirement_ids TEXT[],
    preconditions TEXT,
    test_steps TEXT NOT NULL,
    expected_result TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('p0', 'p1', 'p2', 'p3', 'p4')),
    risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('high', 'medium', 'low')),
    is_automated BOOLEAN DEFAULT false,
    automation_script_path TEXT,
    automation_framework TEXT CHECK (automation_framework IN ('playwright', 'cypress', 'selenium', 'postman', 'k6')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'archived')),
    tags TEXT[] DEFAULT '{}',
    estimated_duration INTEGER, -- in seconds
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- EXECUTIONS & RESULTS
-- ============================================

-- Test Executions/Runs
CREATE TABLE test_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    test_suite_id UUID REFERENCES test_suites(id) ON DELETE SET NULL,
    change_detection_id UUID, -- Will reference change_detections table
    execution_type TEXT NOT NULL CHECK (execution_type IN ('manual', 'scheduled', 'webhook', 'api', 'ci_cd')),
    trigger_source TEXT, -- github_actions, jenkins, manual, api
    environment TEXT DEFAULT 'staging' CHECK (environment IN ('development', 'staging', 'production', 'qa')),
    browser TEXT CHECK (browser IN ('chromium', 'firefox', 'webkit', 'edge')),
    platform TEXT, -- Desktop Chrome, iPhone 14, etc.
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled', 'timeout')),
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    total_tests INTEGER DEFAULT 0,
    passed_tests INTEGER DEFAULT 0,
    failed_tests INTEGER DEFAULT 0,
    skipped_tests INTEGER DEFAULT 0,
    blocked_tests INTEGER DEFAULT 0,
    coverage_percentage DECIMAL(5,2),
    allure_report_url TEXT,
    playwright_report_url TEXT,
    artifacts_path TEXT,
    logs_summary TEXT,
    triggered_by UUID REFERENCES auth.users(id),
    configuration JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Individual Test Results
CREATE TABLE test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_execution_id UUID NOT NULL REFERENCES test_executions(id) ON DELETE CASCADE,
    test_case_id UUID REFERENCES test_cases(id) ON DELETE SET NULL,
    test_name TEXT NOT NULL,
    test_file TEXT,
    test_id_ref TEXT,
    status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'skipped', 'blocked', 'timeout', 'flaky')),
    error_message TEXT,
    error_stack TEXT,
    duration_ms INTEGER,
    retries INTEGER DEFAULT 0,
    browser TEXT,
    platform TEXT,
    screenshot_url TEXT,
    video_url TEXT,
    trace_url TEXT,
    logs TEXT,
    assertions_passed INTEGER DEFAULT 0,
    assertions_failed INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    step_details JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CHANGE DETECTION & AUTOMATION
-- ============================================

-- Change Detections (from changedetection.io)
CREATE TABLE change_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    tag TEXT,
    change_type TEXT CHECK (change_type IN ('html', 'css', 'javascript', 'api', 'visual', 'content')),
    previous_md5 TEXT,
    current_md5 TEXT,
    diff_summary TEXT,
    diff_details JSONB DEFAULT '{}'::jsonb,
    webhook_payload JSONB,
    selected_test_profile TEXT,
    test_suite_ids UUID[],
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    processed_at TIMESTAMPTZ,
    detected_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Update foreign key reference
ALTER TABLE test_executions
ADD CONSTRAINT fk_test_executions_change_detection
FOREIGN KEY (change_detection_id) REFERENCES change_detections(id) ON DELETE SET NULL;

-- ============================================
-- DOCUMENTATION SYSTEM
-- ============================================

-- Documentation entries
CREATE TABLE docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    current_version_id UUID,
    tags TEXT[] DEFAULT '{}',
    category TEXT CHECK (category IN ('user_guide', 'api_docs', 'technical', 'process', 'requirements')),
    is_published BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    published_at TIMESTAMPTZ
);

-- Documentation versions
CREATE TABLE doc_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_id UUID NOT NULL REFERENCES docs(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    title TEXT NOT NULL,
    content_md TEXT NOT NULL,
    content_html TEXT,
    author_id UUID REFERENCES auth.users(id),
    change_summary TEXT,
    is_minor_version BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key constraint
ALTER TABLE docs
ADD CONSTRAINT fk_docs_current_version
FOREIGN KEY (current_version_id) REFERENCES doc_versions(id) ON DELETE SET NULL;

-- Documentation search index
CREATE TABLE doc_search_index (
    doc_id UUID REFERENCES docs(id) ON DELETE CASCADE,
    version_id UUID REFERENCES doc_versions(id) ON DELETE CASCADE,
    search_vector TSVECTOR,
    last_indexed_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (doc_id, version_id)
);

-- ============================================
-- CHAT/IA SYSTEM
-- ============================================

-- Chat threads/conversations
CREATE TABLE chat_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    title TEXT,
    provider TEXT DEFAULT 'copilot-studio' CHECK (provider IN ('copilot-studio', 'openai', 'anthropic')),
    thread_id TEXT UNIQUE, -- External provider thread ID
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Chat messages
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'markdown', 'json', 'error')),
    attachments JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Chat providers configuration
CREATE TABLE chat_providers (
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('copilot-studio', 'openai', 'anthropic')),
    is_active BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}'::jsonb, -- API keys, endpoints, etc.
    usage_limits JSONB DEFAULT '{
        "requests_per_minute": 60,
        "requests_per_hour": 1000,
        "tokens_per_month": 100000
    }'::jsonb,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (tenant_id, provider)
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_tenant_id ON notifications(tenant_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- ============================================
-- SCRIPTS & AUTOMATION
-- ============================================

-- Scripts repository
CREATE TABLE scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    script_type TEXT NOT NULL CHECK (script_type IN ('playwright', 'postman', 'k6', 'python', 'bash', 'powershell')),
    content TEXT NOT NULL,
    version TEXT DEFAULT '1.0.0',
    tags TEXT[] DEFAULT '{}',
    parameters JSONB DEFAULT '[]'::jsonb,
    outputs JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    is_template BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Script executions (queue system)
CREATE TABLE script_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
    execution_id TEXT UNIQUE, -- For external queue systems
    status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
    parameters JSONB DEFAULT '{}'::jsonb,
    environment TEXT DEFAULT 'staging',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    exit_code INTEGER,
    stdout TEXT,
    stderr TEXT,
    artifacts JSONB DEFAULT '{}'::jsonb,
    triggered_by UUID REFERENCES auth.users(id),
    worker_id TEXT, -- For queue system identification
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- REPORTS & ANALYTICS
-- ============================================

-- Report templates
CREATE TABLE report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    template_type TEXT NOT NULL CHECK (template_type IN ('test_execution', 'coverage', 'performance', 'custom')),
    config JSONB DEFAULT '{}'::jsonb,
    is_public BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Generated reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    template_id UUID REFERENCES report_templates(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    report_type TEXT NOT NULL,
    status TEXT DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed')),
    format TEXT DEFAULT 'pdf' CHECK (format IN ('pdf', 'html', 'json', 'xlsx')),
    file_url TEXT,
    parameters JSONB DEFAULT '{}'::jsonb,
    data JSONB DEFAULT '{}'::jsonb,
    generated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- AUDIT & LOGGING
-- ============================================

-- Audit log
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- System events
CREATE TABLE system_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Core indexes
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_status ON tenants(subscription_status);
CREATE INDEX idx_tenant_members_user_id ON tenant_members(user_id);
CREATE INDEX idx_tenant_members_role ON tenant_members(role);

CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_full_name ON user_profiles(full_name);

CREATE INDEX idx_projects_tenant_id ON projects(tenant_id);
CREATE INDEX idx_projects_slug ON projects(tenant_id, slug);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_type ON projects(type);

CREATE INDEX idx_test_suites_project_id ON test_suites(project_id);
CREATE INDEX idx_test_suites_type ON test_suites(suite_type);
CREATE INDEX idx_test_suites_active ON test_suites(is_active);
CREATE INDEX idx_test_suites_tags ON test_suites USING GIN(tags);

CREATE INDEX idx_test_cases_suite_id ON test_cases(test_suite_id);
CREATE INDEX idx_test_cases_test_id ON test_cases(test_id);
CREATE INDEX idx_test_cases_type ON test_cases(test_type);
CREATE INDEX idx_test_cases_status ON test_cases(status);
CREATE INDEX idx_test_cases_automated ON test_cases(is_automated);
CREATE INDEX idx_test_cases_tags ON test_cases USING GIN(tags);
CREATE INDEX idx_test_cases_requirements ON test_cases USING GIN(requirement_ids);

CREATE INDEX idx_test_executions_project_id ON test_executions(project_id);
CREATE INDEX idx_test_executions_status ON test_executions(status);
CREATE INDEX idx_test_executions_started ON test_executions(started_at DESC);
CREATE INDEX idx_test_executions_type ON test_executions(execution_type);
CREATE INDEX idx_test_executions_environment ON test_executions(environment);

CREATE INDEX idx_test_results_execution_id ON test_results(test_execution_id);
CREATE INDEX idx_test_results_case_id ON test_results(test_case_id);
CREATE INDEX idx_test_results_status ON test_results(status);
CREATE INDEX idx_test_results_started ON test_results(started_at DESC);

CREATE INDEX idx_change_detections_project_id ON change_detections(project_id);
CREATE INDEX idx_change_detections_url ON change_detections(url);
CREATE INDEX idx_change_detections_status ON change_detections(status);
CREATE INDEX idx_change_detections_detected ON change_detections(detected_at DESC);

CREATE INDEX idx_docs_tenant_id ON docs(tenant_id);
CREATE INDEX idx_docs_project_id ON docs(project_id);
CREATE INDEX idx_docs_slug ON docs(slug);
CREATE INDEX idx_docs_published ON docs(is_published);
CREATE INDEX idx_docs_tags ON docs USING GIN(tags);

CREATE INDEX idx_doc_versions_doc_id ON doc_versions(doc_id);
CREATE INDEX idx_doc_versions_created ON doc_versions(created_at DESC);

CREATE INDEX idx_chat_threads_tenant_id ON chat_threads(tenant_id);
CREATE INDEX idx_chat_threads_user_id ON chat_threads(user_id);
CREATE INDEX idx_chat_threads_status ON chat_threads(status);
CREATE INDEX idx_chat_threads_thread_id ON chat_threads(thread_id);

CREATE INDEX idx_chat_messages_thread_id ON chat_messages(thread_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at DESC);

CREATE INDEX idx_scripts_tenant_id ON scripts(tenant_id);
CREATE INDEX idx_scripts_project_id ON scripts(project_id);
CREATE INDEX idx_scripts_type ON scripts(script_type);
CREATE INDEX idx_scripts_active ON scripts(is_active);
CREATE INDEX idx_scripts_tags ON scripts USING GIN(tags);

CREATE INDEX idx_script_runs_script_id ON script_runs(script_id);
CREATE INDEX idx_script_runs_status ON script_runs(status);
CREATE INDEX idx_script_runs_started ON script_runs(started_at DESC);

CREATE INDEX idx_reports_tenant_id ON reports(tenant_id);
CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_generated ON reports(generated_at DESC);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_test_suites_updated_at BEFORE UPDATE ON test_suites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_test_cases_updated_at BEFORE UPDATE ON test_cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_test_executions_updated_at BEFORE UPDATE ON test_executions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_docs_updated_at BEFORE UPDATE ON docs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_threads_updated_at BEFORE UPDATE ON chat_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scripts_updated_at BEFORE UPDATE ON scripts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_script_runs_updated_at BEFORE UPDATE ON script_runs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to calculate execution duration
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

-- Function to calculate script run duration
CREATE OR REPLACE FUNCTION calculate_script_run_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.completed_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
        NEW.duration_ms = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) * 1000;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_script_run_duration BEFORE UPDATE ON script_runs FOR EACH ROW EXECUTE FUNCTION calculate_script_run_duration();

-- ============================================
-- DEFAULT DATA
-- ============================================

-- Default roles
INSERT INTO roles (name, display_name, description, is_system_role, permissions) VALUES
('super_admin', 'Super Administrator', 'Full system access', true, '["*"]'::jsonb),
('tenant_owner', 'Tenant Owner', 'Full tenant access', true, '["tenant.*", "project.*", "user.*"]'::jsonb),
('tenant_admin', 'Tenant Admin', 'Administrative access', true, '["project.*", "user.manage"]'::jsonb),
('qa_engineer', 'QA Engineer', 'Quality assurance access', true, '["project.read", "test.*", "report.*"]'::jsonb),
('developer', 'Developer', 'Development access', true, '["project.read", "script.read", "doc.*"]'::jsonb),
('viewer', 'Viewer', 'Read-only access', true, '["*.read"]'::jsonb);

-- Default permissions
INSERT INTO permissions (name, resource, action, description) VALUES
('tenant.create', 'tenant', 'create', 'Create new tenants'),
('tenant.read', 'tenant', 'read', 'View tenant information'),
('tenant.update', 'tenant', 'update', 'Update tenant settings'),
('tenant.delete', 'tenant', 'delete', 'Delete tenants'),
('project.create', 'project', 'create', 'Create new projects'),
('project.read', 'project', 'read', 'View project information'),
('project.update', 'project', 'update', 'Update project settings'),
('project.delete', 'project', 'delete', 'Delete projects'),
('user.manage', 'user', 'manage', 'Manage users in tenant'),
('test.create', 'test', 'create', 'Create test cases and suites'),
('test.read', 'test', 'read', 'View test cases and executions'),
('test.update', 'test', 'update', 'Update test cases and suites'),
('test.execute', 'test', 'execute', 'Execute tests'),
('test.delete', 'test', 'delete', 'Delete test cases and suites'),
('script.create', 'script', 'create', 'Create automation scripts'),
('script.read', 'script', 'read', 'View automation scripts'),
('script.update', 'script', 'update', 'Update automation scripts'),
('script.execute', 'script', 'execute', 'Execute automation scripts'),
('script.delete', 'script', 'delete', 'Delete automation scripts'),
('report.create', 'report', 'create', 'Create reports'),
('report.read', 'report', 'read', 'View reports'),
('report.update', 'report', 'update', 'Update reports'),
('report.delete', 'report', 'delete', 'Delete reports'),
('doc.create', 'doc', 'create', 'Create documentation'),
('doc.read', 'doc', 'read', 'View documentation'),
('doc.update', 'doc', 'update', 'Update documentation'),
('doc.publish', 'doc', 'publish', 'Publish documentation'),
('doc.delete', 'doc', 'delete', 'Delete documentation'),
('chat.use', 'chat', 'use', 'Use chat functionality'),
('flag.manage', 'flag', 'manage', 'Manage feature flags');

-- Default feature flags
INSERT INTO feature_flags (key, name, description, default_value) VALUES
('chat_ia', 'Chat IA', 'Enable Copilot Studio integration', true),
('advanced_reporting', 'Advanced Reporting', 'Enable advanced report features', false),
('api_access', 'API Access', 'Enable external API access', false),
('multi_tenant', 'Multi-tenant', 'Enable multi-tenant features', true),
('rate_limiting', 'Rate Limiting', 'Enable rate limiting', true),
('audit_logging', 'Audit Logging', 'Enable detailed audit logging', true);

-- Default rate limit policies
INSERT INTO rate_limit_policies (name, description, requests_per_minute, requests_per_hour) VALUES
('default', 'Default rate limit', 60, 1000),
('api', 'API endpoints rate limit', 120, 5000),
('auth', 'Authentication endpoints rate limit', 10, 100);

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- Project health dashboard
CREATE OR REPLACE VIEW v_project_health AS
SELECT
    p.id AS project_id,
    p.name AS project_name,
    p.tenant_id,
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
GROUP BY p.id, p.name, p.tenant_id, p.status;

-- Test coverage metrics
CREATE OR REPLACE VIEW v_test_coverage AS
SELECT
    ts.project_id,
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
GROUP BY ts.project_id;

-- Recent executions with context
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
    t.name AS tenant_name,
    te.environment,
    te.browser,
    cd.url AS changed_url,
    up.full_name AS triggered_by_name
FROM test_executions te
LEFT JOIN projects p ON te.project_id = p.id
LEFT JOIN tenants t ON p.tenant_id = t.id
LEFT JOIN change_detections cd ON te.change_detection_id = cd.id
LEFT JOIN user_profiles up ON te.triggered_by = up.id
ORDER BY te.started_at DESC
LIMIT 100;

-- System health metrics
CREATE OR REPLACE VIEW v_system_health AS
SELECT
    'total_tenants' as metric,
    COUNT(*) as value
FROM tenants
WHERE subscription_status = 'active'
UNION ALL
SELECT
    'total_projects' as metric,
    COUNT(*) as value
FROM projects
WHERE status = 'active'
UNION ALL
SELECT
    'total_test_executions_today' as metric,
    COUNT(*) as value
FROM test_executions
WHERE started_at >= CURRENT_DATE
UNION ALL
SELECT
    'avg_response_time' as metric,
    ROUND(AVG(duration_ms)) as value
FROM test_executions
WHERE status = 'completed' AND started_at >= CURRENT_DATE - INTERVAL '7 days';

-- ============================================
-- SCHEMA COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '

    ============================================
    HAIDA DATABASE SCHEMA v2.0 COMPLETED
    ============================================

    ✅ Multi-tenant Architecture
    ✅ RBAC System (Roles & Permissions)
    ✅ Feature Flags System
    ✅ Rate Limiting Infrastructure
    ✅ Complete Testing Framework
    ✅ Documentation System
    ✅ Chat/IA Integration Ready
    ✅ Scripts & Automation
    ✅ Audit & Logging
    ✅ Analytics Views

    Tables Created: 25
    Views Created: 4
    Indexes Created: 50+
    Functions Created: 3
    Default Data: Roles, Permissions, Feature Flags

    Next Steps:
    1. Execute policies.sql for RLS
    2. Test connections from FastAPI
    3. Implement authentication flows
    4. Configure Copilot Studio integration

    ============================================
    ';
END $$;
