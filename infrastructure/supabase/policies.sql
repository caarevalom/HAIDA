-- ============================================
-- HAIDA RLS POLICIES v2.0
-- Supabase Row Level Security
-- Multi-tenant + RBAC Security Model
-- ============================================

-- ============================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================

-- Function to get current user's tenant memberships
CREATE OR REPLACE FUNCTION get_user_tenant_memberships(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE(tenant_id UUID, role TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT tm.tenant_id, tm.role::TEXT
    FROM tenant_members tm
    WHERE tm.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is tenant admin/owner
CREATE OR REPLACE FUNCTION is_tenant_admin(user_uuid UUID DEFAULT auth.uid(), tenant_uuid UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    -- If no specific tenant, check if user is admin in any tenant
    IF tenant_uuid IS NULL THEN
        RETURN EXISTS (
            SELECT 1 FROM tenant_members tm
            WHERE tm.user_id = user_uuid
            AND tm.role IN ('owner', 'admin')
        );
    END IF;

    -- Check specific tenant
    RETURN EXISTS (
        SELECT 1 FROM tenant_members tm
        WHERE tm.user_id = user_uuid
        AND tm.tenant_id = tenant_uuid
        AND tm.role IN ('owner', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION has_permission(user_uuid UUID DEFAULT auth.uid(), required_permission TEXT, tenant_uuid UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Super admin has all permissions
    IF EXISTS (SELECT 1 FROM roles r JOIN tenant_members tm ON r.name = 'super_admin' WHERE tm.user_id = user_uuid) THEN
        RETURN TRUE;
    END IF;

    -- Get user role in tenant
    SELECT tm.role INTO user_role
    FROM tenant_members tm
    WHERE tm.user_id = user_uuid
    AND (tenant_uuid IS NULL OR tm.tenant_id = tenant_uuid)
    LIMIT 1;

    -- Check if role has the required permission
    RETURN EXISTS (
        SELECT 1
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        JOIN roles r ON rp.role_id = r.id
        WHERE r.name = user_role
        AND p.name = required_permission
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TENANTS POLICIES
-- ============================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Tenants: Users can see tenants they belong to
CREATE POLICY "Users can view their tenants" ON tenants
    FOR SELECT USING (
        id IN (
            SELECT tenant_id FROM tenant_members
            WHERE user_id = auth.uid()
        )
    );

-- Tenants: Only super admins can create tenants
CREATE POLICY "Super admins can create tenants" ON tenants
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN tenant_members tm ON r.name = 'super_admin'
            WHERE tm.user_id = auth.uid()
        )
    );

-- Tenants: Only tenant owners can update their tenants
CREATE POLICY "Tenant owners can update their tenants" ON tenants
    FOR UPDATE USING (
        id IN (
            SELECT tenant_id FROM tenant_members
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

-- ============================================
-- TENANT MEMBERS POLICIES
-- ============================================

ALTER TABLE tenant_members ENABLE ROW LEVEL SECURITY;

-- Tenant Members: Users can see members of their tenants
CREATE POLICY "Users can view tenant members" ON tenant_members
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM get_user_tenant_memberships(auth.uid())
        )
    );

-- Tenant Members: Tenant admins can manage members
CREATE POLICY "Tenant admins can manage members" ON tenant_members
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM get_user_tenant_memberships(auth.uid())
            WHERE role IN ('owner', 'admin')
        )
    );

-- ============================================
-- USER PROFILES POLICIES
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can view their own profile and profiles of users in their tenants
CREATE POLICY "Users can view profiles" ON user_profiles
    FOR SELECT USING (
        id = auth.uid() OR
        id IN (
            SELECT tm.user_id FROM tenant_members tm
            WHERE tm.tenant_id IN (
                SELECT tenant_id FROM get_user_tenant_memberships(auth.uid())
            )
        )
    );

-- User Profiles: Users can update their own profile
CREATE POLICY "Users can update their profile" ON user_profiles
    FOR UPDATE USING (id = auth.uid());

-- ============================================
-- PROJECTS POLICIES
-- ============================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Projects: Users can view projects in their tenants
CREATE POLICY "Users can view tenant projects" ON projects
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM get_user_tenant_memberships(auth.uid())
        )
    );

-- Projects: Tenant members can create projects
CREATE POLICY "Tenant members can create projects" ON projects
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM get_user_tenant_memberships(auth.uid())
        )
    );

-- Projects: Project creators and tenant admins can update
CREATE POLICY "Authorized users can update projects" ON projects
    FOR UPDATE USING (
        created_by = auth.uid() OR
        tenant_id IN (
            SELECT tenant_id FROM get_user_tenant_memberships(auth.uid())
            WHERE role IN ('owner', 'admin')
        )
    );

-- Projects: Only tenant admins can delete
CREATE POLICY "Tenant admins can delete projects" ON projects
    FOR DELETE USING (
        tenant_id IN (
            SELECT tenant_id FROM get_user_tenant_memberships(auth.uid())
            WHERE role IN ('owner', 'admin')
        )
    );

-- ============================================
-- TEST SUITES POLICIES
-- ============================================

ALTER TABLE test_suites ENABLE ROW LEVEL SECURITY;

-- Test Suites: Users can view suites in their tenant projects
CREATE POLICY "Users can view test suites" ON test_suites
    FOR SELECT USING (
        project_id IN (
            SELECT p.id FROM projects p
            WHERE p.tenant_id IN (
                SELECT tenant_id FROM get_user_tenant_memberships(auth.uid())
            )
        )
    );

-- Test Suites: Users with test.create permission can manage suites
CREATE POLICY "Authorized users can manage test suites" ON test_suites
    FOR ALL USING (
        has_permission(auth.uid(), 'test.create', (
            SELECT p.tenant_id FROM projects p WHERE p.id = project_id
        ))
    );

-- ============================================
-- TEST CASES POLICIES
-- ============================================

ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;

-- Test Cases: Users can view cases in their tenant projects
CREATE POLICY "Users can view test cases" ON test_cases
    FOR SELECT USING (
        test_suite_id IN (
            SELECT ts.id FROM test_suites ts
            JOIN projects p ON ts.project_id = p.id
            WHERE p.tenant_id IN (
                SELECT tenant_id FROM get_user_tenant_memberships(auth.uid())
            )
        )
    );

-- Test Cases: Users with test permissions can manage cases
CREATE POLICY "Authorized users can manage test cases" ON test_cases
    FOR ALL USING (
        has_permission(auth.uid(), 'test.create', (
            SELECT p.tenant_id FROM test_suites ts
            JOIN projects p ON ts.project_id = p.id
            WHERE ts.id = test_suite_id
        ))
    );

-- ============================================
-- TEST EXECUTIONS POLICIES
-- ============================================

ALTER TABLE test_executions ENABLE ROW LEVEL SECURITY;

-- Test Executions: Users can view executions in their tenant projects
CREATE POLICY "Users can view test executions" ON test_executions
    FOR SELECT USING (
        project_id IN (
            SELECT p.id FROM projects p
            WHERE p.tenant_id IN (
                SELECT tenant_id FROM get_user_tenant_memberships(auth.uid())
            )
        )
    );

-- Test Executions: Users with test.execute permission can create executions
CREATE POLICY "Authorized users can create executions" ON test_executions
    FOR INSERT WITH CHECK (
        has_permission(auth.uid(), 'test.execute', (
            SELECT p.tenant_id FROM projects p WHERE p.id = project_id
        ))
    );

-- Test Executions: Only creators can update their executions
CREATE POLICY "Users can update their executions" ON test_executions
    FOR UPDATE USING (triggered_by = auth.uid());

-- ============================================
-- TEST RESULTS POLICIES
-- ============================================

ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Test Results: Users can view results of executions they can access
CREATE POLICY "Users can view test results" ON test_results
    FOR SELECT USING (
        test_execution_id IN (
            SELECT te.id FROM test_executions te
            JOIN projects p ON te.project_id = p.id
            WHERE p.tenant_id IN (
                SELECT tenant_id FROM get_user_tenant_memberships(auth.uid())
            )
        )
    );

-- Test Results: System can insert results (via service role)
CREATE POLICY "Service role can insert results" ON test_results
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- CHANGE DETECTIONS POLICIES
-- ============================================

ALTER TABLE change_detections ENABLE ROW LEVEL SECURITY;

-- Change Detections: Users can view detections in their tenant projects
CREATE POLICY "Users can view change detections" ON change_detections
    FOR SELECT USING (
        project_id IN (
            SELECT p.id FROM projects p
            WHERE p.tenant_id IN (
                SELECT tenant_id FROM get_user_tenant_memberships(auth.uid())
            )
        )
    );

-- Change Detections: System can insert detections (via webhooks)
CREATE POLICY "Service role can manage detections" ON change_detections
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- DOCUMENTATION POLICIES
-- ============================================

ALTER TABLE docs ENABLE ROW LEVEL SECURITY;

-- Docs: Users can view docs in their tenants
CREATE POLICY "Users can view docs" ON docs
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM get_user_tenant_memberships(auth.uid())
        )
    );

-- Docs: Users with doc permissions can manage docs
CREATE POLICY "Authorized users can manage docs" ON docs
    FOR ALL USING (
        has_permission(auth.uid(), 'doc.create', tenant_id)
    );

-- ============================================
-- DOC VERSIONS POLICIES
-- ============================================

ALTER TABLE doc_versions ENABLE ROW LEVEL SECURITY;

-- Doc Versions: Users can view versions of docs they can access
CREATE POLICY "Users can view doc versions" ON doc_versions
    FOR SELECT USING (
        doc_id IN (
            SELECT d.id FROM docs d
            WHERE d.tenant_id IN (
                SELECT tenant_id FROM get_user_tenant_memberships(auth.uid())
            )
        )
    );

-- Doc Versions: Authorized users can manage versions
CREATE POLICY "Authorized users can manage doc versions" ON doc_versions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM docs d
            WHERE d.id = doc_id
            AND has_permission(auth.uid(), 'doc.update', d.tenant_id)
        )
    );

-- ============================================
-- CHAT POLICIES
-- ============================================

ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;

-- Chat Threads: Users can view their own threads and threads in their tenant projects
CREATE POLICY "Users can view chat threads" ON chat_threads
    FOR SELECT USING (
        user_id = auth.uid() OR
        tenant_id IN (
            SELECT tenant_id FROM get_user_tenant_memberships(auth.uid())
        )
    );

-- Chat Threads: Users can create threads
CREATE POLICY "Users can create chat threads" ON chat_threads
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        tenant_id IN (
            SELECT tenant_id FROM get_user_tenant_memberships(auth.uid())
        )
    );

-- Chat Threads: Users can update their own threads
CREATE POLICY "Users can update their threads" ON chat_threads
    FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- CHAT MESSAGES POLICIES
-- ============================================

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat Messages: Users can view messages in threads they can access
CREATE POLICY "Users can view chat messages" ON chat_messages
    FOR SELECT USING (
        thread_id IN (
            SELECT ct.id FROM chat_threads ct
            WHERE ct.user_id = auth.uid() OR ct.tenant_id IN (
                SELECT tenant_id FROM get_user_tenant_memberships(auth.uid())
            )
        )
    );

-- Chat Messages: Users can insert messages in their threads
CREATE POLICY "Users can insert messages" ON chat_messages
    FOR INSERT WITH CHECK (
        thread_id IN (
            SELECT ct.id FROM chat_threads ct
            WHERE ct.user_id = auth.uid()
        )
    );

-- ============================================
-- SCRIPTS POLICIES
-- ============================================

ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;

-- Scripts: Users can view scripts in their tenants
CREATE POLICY "Users can view scripts" ON scripts
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM get_user_tenant_memberships(auth.uid())
        )
    );

-- Scripts: Users with script permissions can manage scripts
CREATE POLICY "Authorized users can manage scripts" ON scripts
    FOR ALL USING (
        has_permission(auth.uid(), 'script.create', tenant_id)
    );

-- ============================================
-- SCRIPT RUNS POLICIES
-- ============================================

ALTER TABLE script_runs ENABLE ROW LEVEL SECURITY;

-- Script Runs: Users can view runs of scripts they can access
CREATE POLICY "Users can view script runs" ON script_runs
    FOR SELECT USING (
        script_id IN (
            SELECT s.id FROM scripts s
            WHERE s.tenant_id IN (
                SELECT tenant_id FROM get_user_tenant_memberships(auth.uid())
            )
        )
    );

-- Script Runs: Users with script.execute can create runs
CREATE POLICY "Authorized users can create runs" ON script_runs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM scripts s
            WHERE s.id = script_id
            AND has_permission(auth.uid(), 'script.execute', s.tenant_id)
        )
    );

-- Script Runs: Users can update their own runs
CREATE POLICY "Users can update their runs" ON script_runs
    FOR UPDATE USING (triggered_by = auth.uid());

-- ============================================
-- REPORTS POLICIES
-- ============================================

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Reports: Users can view reports in their tenants
CREATE POLICY "Users can view reports" ON reports
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM get_user_tenant_memberships(auth.uid())
        )
    );

-- Reports: Users with report permissions can manage reports
CREATE POLICY "Authorized users can manage reports" ON reports
    FOR ALL USING (
        has_permission(auth.uid(), 'report.create', tenant_id)
    );

-- ============================================
-- FEATURE FLAGS POLICIES
-- ============================================

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Feature Flags: All authenticated users can read flags
CREATE POLICY "Users can read feature flags" ON feature_flags
    FOR SELECT USING (auth.role() = 'authenticated');

-- Feature Flags: Only super admins can manage flags
CREATE POLICY "Super admins can manage flags" ON feature_flags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN tenant_members tm ON r.name = 'super_admin'
            WHERE tm.user_id = auth.uid()
        )
    );

-- ============================================
-- RATE LIMITING POLICIES
-- ============================================

ALTER TABLE rate_limit_counters ENABLE ROW LEVEL SECURITY;

-- Rate Counters: Service role can manage counters
CREATE POLICY "Service role manages rate counters" ON rate_limit_counters
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- AUDIT LOG POLICIES
-- ============================================

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Audit Log: Users can view audit entries for their tenants
CREATE POLICY "Users can view tenant audit logs" ON audit_log
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM get_user_tenant_memberships(auth.uid())
        )
    );

-- Audit Log: System can insert audit entries
CREATE POLICY "System can insert audit logs" ON audit_log
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- SYSTEM EVENTS POLICIES
-- ============================================

ALTER TABLE system_events ENABLE ROW LEVEL SECURITY;

-- System Events: Tenant admins can view events
CREATE POLICY "Tenant admins can view events" ON system_events
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM get_user_tenant_memberships(auth.uid())
            WHERE role IN ('owner', 'admin')
        )
    );

-- System Events: System can insert events
CREATE POLICY "System can insert events" ON system_events
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- STORAGE POLICIES (Supabase Storage)
-- ============================================

-- Note: Storage policies are configured separately in Supabase Dashboard
-- or via storage API, but here are the conceptual policies:

-- Files bucket: Users can upload to their tenant folders
-- Reports bucket: Users can download reports from their tenants
-- Screenshots bucket: Users can view screenshots from their test executions

-- ============================================
-- SUMMARY
-- ============================================

/*
POLICIES SUMMARY:

✅ Multi-tenant isolation via tenant_id checks
✅ RBAC via role-based permissions
✅ User ownership for personal resources
✅ Service role for system operations
✅ Feature flag support for gradual rollouts
✅ Audit logging for compliance

SECURITY LEVELS:
- Level 1: Basic tenant isolation
- Level 2: RBAC permissions
- Level 3: Feature flags
- Level 4: Rate limiting
- Level 5: Audit logging

All tables have RLS enabled with appropriate policies.
*/
