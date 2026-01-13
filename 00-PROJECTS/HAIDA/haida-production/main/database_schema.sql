-- HAIDA Database Schema for Supabase/PostgreSQL
-- Run this script in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'viewer',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Test Suites Table
CREATE TABLE IF NOT EXISTS test_suites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    test_type VARCHAR(50) NOT NULL, -- 'web', 'api', 'performance', 'accessibility'
    description TEXT,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Test Executions Table
CREATE TABLE IF NOT EXISTS test_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_suite_id UUID NOT NULL REFERENCES test_suites(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'passed', 'failed', 'skipped'
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    duration_seconds INTEGER,
    results JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'custom'
    content JSONB,
    pdf_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Jira Issues Table
CREATE TABLE IF NOT EXISTS jira_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    jira_key VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255),
    description TEXT,
    status VARCHAR(50),
    priority VARCHAR(50),
    assignee VARCHAR(255),
    synced_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- AI Chat History Table
CREATE TABLE IF NOT EXISTS ai_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    conversation_id VARCHAR(255),
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    model VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_test_suites_project ON test_suites(project_id);
CREATE INDEX IF NOT EXISTS idx_test_executions_suite ON test_executions(test_suite_id);
CREATE INDEX IF NOT EXISTS idx_test_executions_status ON test_executions(status);
CREATE INDEX IF NOT EXISTS idx_reports_project ON reports(project_id);
CREATE INDEX IF NOT EXISTS idx_jira_issues_project ON jira_issues(project_id);
CREATE INDEX IF NOT EXISTS idx_jira_issues_key ON jira_issues(jira_key);
CREATE INDEX IF NOT EXISTS idx_ai_chats_user ON ai_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chats_conversation ON ai_chats(conversation_id);

-- Insert demo users
INSERT INTO users (email, password_hash, full_name, role) VALUES
    ('admin@haida.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5uzEW.Qp2Y0p6', 'Admin User', 'admin'),
    ('qa@haida.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5uzEW.Qp2Y0p6', 'QA Engineer', 'qa_engineer'),
    ('dev@haida.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5uzEW.Qp2Y0p6', 'Developer', 'developer'),
    ('viewer@haida.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5uzEW.Qp2Y0p6', 'Viewer User', 'viewer')
ON CONFLICT (email) DO NOTHING;

-- Insert demo project
INSERT INTO projects (name, description, owner_id) VALUES
    ('Demo Project', 'Example HAIDA project for testing', (SELECT id FROM users WHERE email = 'hola@stayarta.com' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Insert demo test suites
INSERT INTO test_suites (project_id, name, test_type, description, config) VALUES
    ((SELECT id FROM projects WHERE name = 'Demo Project' LIMIT 1), 'Web E2E Tests', 'web', 'Playwright end-to-end tests', '{"browser": "chromium", "headless": true}'::jsonb),
    ((SELECT id FROM projects WHERE name = 'Demo Project' LIMIT 1), 'API Tests', 'api', 'Newman/Postman API tests', '{"collection": "api-tests.json"}'::jsonb),
    ((SELECT id FROM projects WHERE name = 'Demo Project' LIMIT 1), 'Performance Tests', 'performance', 'k6 load testing', '{"vus": 10, "duration": "30s"}'::jsonb),
    ((SELECT id FROM projects WHERE name = 'Demo Project' LIMIT 1), 'Accessibility Tests', 'accessibility', 'Lighthouse accessibility audits', '{"categories": ["accessibility", "best-practices"]}'::jsonb)
ON CONFLICT DO NOTHING;

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_suites ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE jira_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for projects
CREATE POLICY "Users can view projects they own or are members of" ON projects
    FOR SELECT USING (
        owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'qa_engineer'))
    );

CREATE POLICY "Users can create projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for test_suites
CREATE POLICY "Users can view test suites in their projects" ON test_suites
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects WHERE id = test_suites.project_id
            AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'qa_engineer')))
        )
    );

-- RLS Policies for test_executions
CREATE POLICY "Users can view test executions in their projects" ON test_executions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM test_suites ts
            JOIN projects p ON ts.project_id = p.id
            WHERE ts.id = test_executions.test_suite_id
            AND (p.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'qa_engineer')))
        )
    );

-- RLS Policies for reports
CREATE POLICY "Users can view reports in their projects" ON reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects WHERE id = reports.project_id
            AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'qa_engineer')))
        )
    );

-- RLS Policies for jira_issues
CREATE POLICY "Users can view jira issues in their projects" ON jira_issues
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects WHERE id = jira_issues.project_id
            AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'qa_engineer')))
        )
    );

-- RLS Policies for ai_chats
CREATE POLICY "Users can view their own chat history" ON ai_chats
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own chat messages" ON ai_chats
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_suites_updated_at BEFORE UPDATE ON test_suites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ HAIDA database schema created successfully!';
    RAISE NOTICE '👤 Demo users created (password: admin123 for all):';
    RAISE NOTICE '   - admin@haida.com (Admin)';
    RAISE NOTICE '   - qa@haida.com (QA Engineer)';
    RAISE NOTICE '   - dev@haida.com (Developer)';
    RAISE NOTICE '   - viewer@haida.com (Viewer)';
    RAISE NOTICE '📊 Demo project and test suites created';
    RAISE NOTICE '🔒 Row Level Security enabled';
END $$;
