-- ============================================
-- HAIDA TEST DATA v1.0
-- Sample data for development and testing
-- ============================================

-- ============================================
-- PROJECTS
-- ============================================
INSERT INTO projects (name, slug, description, base_url, repository_url, status, settings) VALUES
('CTB Barcelona', 'ctb-barcelona', 'Catalan Tourist Board main website testing', 'https://mcprod.thisisbarcelona.com', 'https://github.com/hiberus/ctb', 'active',
'{"notification_webhooks": {"slack": "https://hooks.slack.com/services/xxx"}, "thresholds": {"min_pass_rate": 80}}'::jsonb),

('HAIDA Internal', 'haida-internal', 'HAIDA system self-testing', 'http://localhost:3001', 'https://github.com/hiberus/haida', 'active',
'{"notification_webhooks": {}, "thresholds": {"min_pass_rate": 95}}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- TEST SUITES
-- ============================================
INSERT INTO test_suites (project_id, name, description, suite_type, priority, tags) VALUES
-- CTB Barcelona suites
((SELECT id FROM projects WHERE slug = 'ctb-barcelona'), 'Login Flow Tests', 'Authentication and login functionality', 'e2e', 'critical', ARRAY['auth', 'login', 'e2e']),
((SELECT id FROM projects WHERE slug = 'ctb-barcelona'), 'Navigation Tests', 'Main navigation and routing', 'e2e', 'high', ARRAY['navigation', 'routing']),
((SELECT id FROM projects WHERE slug = 'ctb-barcelona'), 'Form Validation Tests', 'Form input validation', 'integration', 'high', ARRAY['forms', 'validation']),
((SELECT id FROM projects WHERE slug = 'ctb-barcelona'), 'API Tests', 'Backend API endpoints', 'api', 'critical', ARRAY['api', 'backend']),
((SELECT id FROM projects WHERE slug = 'ctb-barcelona'), 'Accessibility Tests', 'WCAG 2.0 AA compliance', 'accessibility', 'medium', ARRAY['a11y', 'wcag']),
((SELECT id FROM projects WHERE slug = 'ctb-barcelona'), 'Performance Tests', 'Load and performance', 'performance', 'medium', ARRAY['performance', 'load']),

-- HAIDA Internal suites
((SELECT id FROM projects WHERE slug = 'haida-internal'), 'Webhook Tests', 'Webhook receiver functionality', 'api', 'critical', ARRAY['api', 'webhook']),
((SELECT id FROM projects WHERE slug = 'haida-internal'), 'Change Detection Tests', 'Change detection logic', 'integration', 'critical', ARRAY['change-detection'])
ON CONFLICT DO NOTHING;

-- ============================================
-- TEST CASES
-- ============================================

-- CTB Barcelona - Login Flow
INSERT INTO test_cases (test_suite_id, test_id, name, description, test_type, component, module, requirement_ids, preconditions, test_steps, expected_result, priority, risk_level, is_automated, automation_script_path, automation_framework, tags) VALUES
((SELECT id FROM test_suites WHERE name = 'Login Flow Tests' LIMIT 1),
'TC_LOGIN_001',
'Valid Login with Email',
'User can login with valid email and password',
'E2E',
'Auth',
'Login',
ARRAY['REQ-001', 'REQ-002'],
'User account exists, application is running',
'1. Navigate to /login
2. Enter valid email
3. Enter valid password
4. Click Sign In button',
'User is redirected to dashboard, session is created, HTTP 200 response',
'P0',
'high',
true,
'tests/web-e2e/auth/login.spec.ts',
'playwright',
ARRAY['e2e', 'auth', 'login', 'smoke']),

((SELECT id FROM test_suites WHERE name = 'Login Flow Tests' LIMIT 1),
'TC_LOGIN_002',
'Invalid Login - Wrong Password',
'System rejects login with invalid password',
'E2E',
'Auth',
'Login',
ARRAY['REQ-001', 'REQ-003'],
'User account exists',
'1. Navigate to /login
2. Enter valid email
3. Enter invalid password
4. Click Sign In',
'Error message displayed, user remains on login page, HTTP 401',
'P1',
'high',
true,
'tests/web-e2e/auth/login.spec.ts',
'playwright',
ARRAY['e2e', 'auth', 'negative']),

((SELECT id FROM test_suites WHERE name = 'Login Flow Tests' LIMIT 1),
'TC_LOGIN_003',
'Login - Empty Fields Validation',
'System validates required fields',
'E2E',
'Auth',
'Login',
ARRAY['REQ-004'],
'Login page is accessible',
'1. Navigate to /login
2. Leave email empty
3. Leave password empty
4. Click Sign In',
'Validation errors shown for both fields, submit button disabled or blocked',
'P2',
'medium',
true,
'tests/web-e2e/auth/login.spec.ts',
'playwright',
ARRAY['e2e', 'validation', 'forms']);

-- CTB Barcelona - Form Validation
INSERT INTO test_cases (test_suite_id, test_id, name, description, test_type, component, module, requirement_ids, preconditions, test_steps, expected_result, priority, risk_level, is_automated, tags) VALUES
((SELECT id FROM test_suites WHERE name = 'Form Validation Tests' LIMIT 1),
'TC_FORM_001',
'Email Format Validation',
'Email input validates format',
'Integration',
'Forms',
'Validation',
ARRAY['REQ-010'],
'Form is loaded',
'1. Enter invalid email format
2. Tab out of field',
'Error message shows: "Invalid email format"',
'P2',
'low',
false,
ARRAY['forms', 'validation']);

-- CTB Barcelona - API Tests
INSERT INTO test_cases (test_suite_id, test_id, name, description, test_type, component, module, requirement_ids, preconditions, test_steps, expected_result, priority, risk_level, is_automated, automation_script_path, automation_framework, tags) VALUES
((SELECT id FROM test_suites WHERE name = 'API Tests' LIMIT 1),
'TC_API_001',
'GET /api/users - Success',
'Retrieve user list',
'API',
'API',
'Users',
ARRAY['REQ-020'],
'API is running, auth token is valid',
'1. Send GET request to /api/users with valid token
2. Verify response',
'HTTP 200, JSON array of users returned',
'P1',
'high',
true,
'tests/api/collection.json',
'newman',
ARRAY['api', 'get', 'smoke']),

((SELECT id FROM test_suites WHERE name = 'API Tests' LIMIT 1),
'TC_API_002',
'POST /api/users - Create User',
'Create new user via API',
'API',
'API',
'Users',
ARRAY['REQ-021'],
'API is running, admin token is valid',
'1. Send POST to /api/users with user data
2. Verify response
3. Verify user exists',
'HTTP 201, user created, ID returned',
'P1',
'high',
true,
'tests/api/collection.json',
'newman',
ARRAY['api', 'post', 'crud']);

-- CTB Barcelona - Accessibility
INSERT INTO test_cases (test_suite_id, test_id, name, description, test_type, component, module, requirement_ids, preconditions, test_steps, expected_result, priority, risk_level, is_automated, automation_script_path, automation_framework, tags) VALUES
((SELECT id FROM test_suites WHERE name = 'Accessibility Tests' LIMIT 1),
'TC_A11Y_001',
'WCAG 2.0 AA Compliance - Home Page',
'Home page meets WCAG 2.0 AA standards',
'Accessibility',
'UI',
'Home',
ARRAY['REQ-030'],
'Application is running',
'1. Load home page
2. Run axe-core analysis
3. Check for violations',
'Zero WCAG 2.0 AA violations',
'P2',
'medium',
true,
'tests/web-e2e/accessibility.spec.ts',
'playwright',
ARRAY['a11y', 'wcag', 'smoke']);

-- CTB Barcelona - Performance
INSERT INTO test_cases (test_suite_id, test_id, name, description, test_type, component, module, requirement_ids, preconditions, test_steps, expected_result, priority, risk_level, is_automated, tags) VALUES
((SELECT id FROM test_suites WHERE name = 'Performance Tests' LIMIT 1),
'TC_PERF_001',
'Load Test - 100 Concurrent Users',
'System handles 100 concurrent users',
'Performance',
'System',
'Load',
ARRAY['REQ-040'],
'Staging environment available',
'1. Configure k6 for 100 VUs
2. Run for 5 minutes
3. Monitor response times',
'95th percentile response time < 2s, error rate < 1%',
'P2',
'medium',
false,
ARRAY['performance', 'load']);

-- HAIDA Internal - Webhook Tests
INSERT INTO test_cases (test_suite_id, test_id, name, description, test_type, component, module, requirement_ids, preconditions, test_steps, expected_result, priority, risk_level, is_automated, automation_script_path, automation_framework, tags) VALUES
((SELECT id FROM test_suites WHERE name = 'Webhook Tests' LIMIT 1),
'TC_WEBHOOK_001',
'Receive Change Detection Webhook',
'API receives and processes webhook',
'API',
'API',
'Webhook',
ARRAY['REQ-100'],
'HAIDA API is running',
'1. Send POST to /webhook/change-detected
2. Verify response
3. Check database entry',
'HTTP 200, change_detection record created',
'P0',
'high',
true,
'tests/api/haida-webhook.spec.ts',
'playwright',
ARRAY['api', 'webhook', 'smoke']);

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '
    ============================================
    TEST DATA INSERTED SUCCESSFULLY
    ============================================

    Projects: 2
    Test Suites: 8
    Test Cases: 10

    You can now:
    1. View data in Supabase dashboard
    2. Query with: SELECT * FROM v_test_coverage;
    3. Add more test cases as needed

    ============================================
    ';
END $$;
