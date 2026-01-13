# HAIDA Database Schema & Security Audit Report
**Date:** January 13, 2026
**Location:** /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev/database/

---

## EXECUTIVE SUMMARY

The HAIDA database schema is well-structured with comprehensive table definitions, proper indexing, and functional cascading relationships. However, critical security vulnerabilities exist in RLS (Row-Level Security) implementation that create significant risks. Multiple conflicting RLS configuration files indicate unresolved security decisions. The system requires immediate attention to finalize a cohesive security posture.

**Overall Risk Level:** HIGH (RLS configuration conflicts + overly permissive policies)

---

## 1. DATABASE SCHEMA ANALYSIS

### 1.1 Core Tables Overview

| Table | Purpose | Records | Status |
|-------|---------|---------|--------|
| users | User accounts & auth | 3 default | ✓ Well-defined |
| projects | Application/Project configs | Demo data | ✓ Good structure |
| test_suites | Test suite groupings | Demo data | ✓ Proper indexes |
| test_cases | Individual test definitions | ISTQB compliant | ✓ Comprehensive |
| change_detections | Webhook detection events | Demo data | ✓ Flexible |
| test_executions | Test run records | Demo data | ✓ Complete |
| test_results | Individual test results | Demo data | ✓ Detailed |
| specifications | Collaborative specs | Demo data | ✓ New |
| messages | Realtime chat | Demo data | ✓ New |
| notifications | Progress updates | Demo data | ✓ New |
| user_sessions | Presence tracking | Demo data | ✓ New |

### 1.2 Strengths

✓ **Comprehensive Data Types**
- UUID primary keys with `gen_random_uuid()`
- JSONB for flexible metadata storage
- Proper TIMESTAMP WITH TIME ZONE for audit trails
- Array types for tags (TEXT[]) and relationships (UUID[])
- Enum-like VARCHAR with documented constraints

✓ **Strong Indexing Strategy**
- Appropriate indexes on foreign keys (FK columns)
- GIN indexes on JSONB and array columns
- Composite indexes for common queries
- Indexes on timestamp columns for sorting

✓ **Referential Integrity**
- Foreign key relationships defined with ON DELETE CASCADE/SET NULL
- Proper cascade delete for test_cases → test_suites → projects
- ON DELETE SET NULL for user references (audit trail preservation)

✓ **Trigger-Based Automation**
- `update_updated_at_column()` maintains timestamps
- `calculate_execution_duration()` computes duration_ms
- Broadcast triggers for realtime features

✓ **Documentation**
- Comments on all tables and important columns
- View definitions are well-documented
- ISTQB compliance noted for test_cases

### 1.3 Data Integrity Observations

**Positive:**
- Primary/foreign key constraints are complete
- CASCADE deletes maintain data consistency
- Timestamp triggers prevent manual manipulation

**Concerns:**
- No CHECK constraints on VARCHAR enums (risk of invalid values)
- No constraints on numeric ranges (e.g., duration_ms could be negative)
- email column not validated for format
- url columns (500 char) not validated for proper URL format

---

## 2. CRITICAL SECURITY ISSUES - RLS CONFIGURATION

### 2.1 RLS Configuration Conflict (CRITICAL)

**Problem:** Six different RLS configuration files exist with conflicting policies:

```
1. rls-simple-open.sql        - ALL PERMISSIONS FOR ALL USERS
2. rls-simple-secure.sql      - READ ALL, WRITE AUTHENTICATED
3. rls-simple-disable.sql     - RLS DISABLED
4. FIX-RLS-POLICIES.sql       - Service role bypass + targeted policies
5. fix-rls-allow-read-projects.sql - Public read, authenticated write
6. SOLUCION-FINAL-RLS.sql     - Unknown (not reviewed yet)
7. permissions-system.sql     - Granular role-based system
```

**Risk:** Which RLS config is actually applied? Unknown. Creates configuration drift and unpredictable security posture.

**Recommendation:** 
1. Document which file is the "source of truth"
2. Consolidate into single migration script
3. Delete redundant files
4. Add RLS configuration to CI/CD validation

### 2.2 RLS Policy Analysis

#### Current Policies (rls-simple-open.sql - MOST PERMISSIVE)

```sql
-- CRITICAL RISK: This grants full access to anonymous users
CREATE POLICY "projects_all_public"
ON public.projects
FOR ALL
USING (true)
WITH CHECK (true);
```

**Issues:**
- ❌ Anonymous users can READ all projects
- ❌ Anonymous users can CREATE projects
- ❌ Anonymous users can UPDATE projects
- ❌ Anonymous users can DELETE projects
- ❌ No row-level filtering whatsoever

**Attack Surface:**
```sql
-- Anonymous attacker can:
DELETE FROM projects WHERE id = '...'; -- Delete any project
UPDATE projects SET owner_id = attacker_id; -- Claim ownership
INSERT INTO projects (name, base_url) VALUES ('malicious-project', 'attacker.com');
```

#### Alternative: rls-simple-secure.sql (BALANCED)

```sql
-- Better: Public read, authenticated write
CREATE POLICY "projects_select_all"
ON public.projects
FOR SELECT
USING (true);

CREATE POLICY "projects_write_authenticated"
ON public.projects
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
```

**Improvements:**
- ✓ Anonymous users can READ
- ✓ Only authenticated users can WRITE
- ⚠ Still no owner-based filtering (test_suites → projects owner)

#### Recommended: Granular RLS with Permissions System

From `permissions-system.sql`:

```sql
-- Better approach: Role-based with permissions table
CREATE POLICY "projects_read_by_role"
ON public.projects
FOR SELECT
TO authenticated
USING (
  public.user_has_permission(auth.uid(), 'projects.read')
);

CREATE POLICY "projects_write_by_role"
ON public.projects
FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid() OR
  public.user_has_permission(auth.uid(), 'projects.manage')
)
WITH CHECK (
  owner_id = auth.uid() OR
  public.user_has_permission(auth.uid(), 'projects.manage')
);
```

**Advantages:**
- ✓ Fine-grained role-based access control (RBAC)
- ✓ Users can only modify own projects or if they have 'projects.manage' permission
- ✓ Scalable permission system
- ✓ Supports admin override without code changes

### 2.3 Sensitive Table RLS Issues

#### Users Table (HIGH RISK)

**Current File: FIX-RLS-POLICIES.sql**

```sql
-- Users can update own profile
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Problematic: Allows viewing all users
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id OR true); -- 'true' allows seeing all users!
```

**Issues:**
- ⚠ `OR true` defeats the purpose of auth.uid() = id check
- ⚠ Authenticated users can enumerate all user accounts
- ⚠ Email addresses exposed (PII)
- ⚠ Role information exposed (helps attackers identify admins)

**Attack:**
```sql
-- User can query all other users' details
SELECT id, email, role FROM users; -- Returns all users!
```

**Fix:**
```sql
-- Remove the 'OR true' clause
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);
```

#### Test Results Table (MEDIUM RISK)

**Issue:** No RLS policy defined in main schema
- ❌ Test execution results visible to anyone
- ❌ Could expose test failures, confidential bugs
- ❌ Could expose file paths, system information

**Recommended:**
```sql
-- Test results visible to project members only
CREATE POLICY "test_results_visible_to_project_members"
ON public.test_results
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM test_executions te
    JOIN projects p ON te.project_id = p.id
    WHERE te.id = test_results.test_execution_id
    AND (p.owner_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM user_sessions us 
                 WHERE us.user_id = auth.uid() 
                 AND us.project_id = p.id))
  )
);
```

---

## 3. ROW-LEVEL SECURITY (RLS) POLICY VERIFICATION

### 3.1 Affected Tables

| Table | RLS Enabled | Policy Status | Risk |
|-------|-------------|---------------|------|
| users | ✓ YES | Service role bypass + targeted | MEDIUM |
| projects | ✓ YES | Over-permissive (anon write) | HIGH |
| test_suites | ✓ YES | Over-permissive (anon write) | HIGH |
| test_cases | ✓ YES | Over-permissive (anon write) | MEDIUM |
| change_detections | ❌ NO | No RLS | HIGH |
| test_executions | ✓ YES | Over-permissive (anon write) | MEDIUM |
| test_results | ✓ YES | Over-permissive (anon write) | MEDIUM |
| specifications | ✓ YES | Granular (good) | LOW |
| messages | ✓ YES | Granular (good) | LOW |
| notifications | ✓ YES | Granular (good) | LOW |

### 3.2 RLS Bypass Vulnerabilities

#### Service Role Bypass (INTENTIONAL BUT RISKY)

```sql
CREATE POLICY "Service role bypass RLS"
ON public.users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

**Purpose:** Allow backend API to insert/update users
**Risk:** If service_role key is compromised, attacker has full database access

**Mitigation:**
- ✓ Service role key should be environment variable
- ✓ Never commit service role key to version control
- ⚠ Consider using Row-Level Security with careful role assignment instead
- ⚠ Document that backend must use service_role, not anon key

### 3.3 Missing RLS on Critical Tables

**change_detections Table (NO RLS):**
```sql
-- From 01-schema-haida.sql - NO POLICIES DEFINED
ALTER TABLE public.change_detections -- RLS NOT ENABLED

-- RISK: Anonymous users can:
SELECT * FROM change_detections; -- See all URL changes
-- This leaks information about what's being monitored!
```

**Fix Required:**
```sql
ALTER TABLE public.change_detections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "change_detections_project_visibility"
ON public.change_detections
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = change_detections.project_id
    AND (p.owner_id = auth.uid() OR /* project owner */
         EXISTS (SELECT 1 FROM user_sessions us 
                 WHERE us.user_id = auth.uid() 
                 AND us.project_id = p.id))
  )
);
```

---

## 4. DATA INTEGRITY & TRIGGERS

### 4.1 Implemented Triggers (POSITIVE)

```sql
-- Trigger 1: Auto-update timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
Create TRIGGER update_test_suites_updated_at BEFORE UPDATE ON test_suites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
Create TRIGGER update_test_cases_updated_at BEFORE UPDATE ON test_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger 2: Calculate execution duration
CREATE TRIGGER calculate_test_execution_duration BEFORE UPDATE ON test_executions
  FOR EACH ROW EXECUTE FUNCTION calculate_execution_duration();

-- Triggers 3-6: Broadcast changes for realtime
CREATE TRIGGER specifications_broadcast_trigger AFTER INSERT OR UPDATE OR DELETE ON specifications
CREATE TRIGGER messages_broadcast_trigger AFTER INSERT ON messages
CREATE TRIGGER test_executions_broadcast_trigger AFTER UPDATE ON test_executions
CREATE TRIGGER user_sessions_broadcast_trigger AFTER INSERT OR UPDATE ON user_sessions
```

✓ **Strengths:**
- Automatic timestamp maintenance prevents stale data
- Duration calculation prevents manual errors
- Realtime broadcast enables reactive UI updates

⚠ **Gaps:**
- No audit trail triggers (no history table)
- No validation triggers (e.g., ensure email is valid on insert)
- No soft delete mechanism (physical deletes only)

### 4.2 Recommended Audit Trigger

```sql
-- Create audit table
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(100),
    operation VARCHAR(10), -- INSERT, UPDATE, DELETE
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_table_id ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_user_time ON audit_log(changed_by, changed_at DESC);

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (table_name, operation, record_id, old_values, new_values, changed_by)
    VALUES (
        TG_TABLE_NAME,
        TG_OP,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
        auth.uid()
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to all tables
CREATE TRIGGER users_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER projects_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();
-- ... repeat for all tables
```

---

## 5. MIGRATION MANAGEMENT & ORDERING

### 5.1 Migration Files (Current Order)

```
01-schema-haida.sql              ← Base schema (7 tables)
02-test-data.sql                 ← Sample data
03-migration-add-full-name.sql   ← Add full_name to users
04-realtime-features.sql         ← Add 4 new tables + triggers
permissions-system.sql            ← Permission/role system
FIX-RLS-POLICIES.sql             ← Fix RLS conflicts
fix-rls-allow-read-projects.sql  ← More RLS fixes
rls-simple-*.sql                 ← Multiple conflicting versions
SOLUCION-FINAL-RLS.sql           ← Unknown final state
```

**Issues:**
1. ❌ **No Migration Versioning** - No timestamps or sequence numbers
2. ❌ **Conflicting Migrations** - RLS files conflict with each other
3. ❌ **No Down Migrations** - Can't rollback safely
4. ❌ **Dependencies Unclear** - No documentation of prerequisites
5. ❌ **No Idempotent Checks** - Files use DROP, not DROP IF EXISTS everywhere

### 5.2 Recommended Migration Structure

```sql
-- File: 001_create_base_schema.sql
-- Description: Create core tables (users, projects, test_suites, etc)
-- Version: 1.0
-- Applied: ++34662652300

CREATE TABLE IF NOT EXISTS migration_history (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(100) UNIQUE NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'success' -- success, failed, reverted
);

CREATE TABLE users (...)
CREATE TABLE projects (...)
-- ... all core tables ...

-- Record migration
INSERT INTO migration_history (migration_name, status) VALUES ('001_create_base_schema', 'success');

-- File: 002_add_audit_system.sql
-- Description: Add audit tables and triggers
-- Depends: 001_create_base_schema
-- Version: 1.1

CREATE TABLE audit_log (...)
CREATE FUNCTION audit_trigger() ...
-- Apply triggers to all tables
INSERT INTO migration_history (migration_name) VALUES ('002_add_audit_system');

-- File: 003_setup_rls_policies.sql  ← SINGLE CANONICAL RLS FILE
-- Description: Configure Row-Level Security (CHOOSE ONE APPROACH)
-- Depends: 001_create_base_schema
-- IMPORTANT: This replaces all rls-simple-*.sql files

-- Approach: Granular role-based (RECOMMENDED)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ... all RLS policies ...
INSERT INTO migration_history (migration_name) VALUES ('003_setup_rls_policies');
```

### 5.3 Down Migration Example

```sql
-- File: 001_create_base_schema.down.sql
-- Rollback: 001_create_base_schema

DROP TRIGGER IF EXISTS users_audit_trigger ON users;
DROP TRIGGER IF EXISTS projects_audit_trigger ON projects;
-- ... etc ...

DROP TABLE IF EXISTS test_results CASCADE;
DROP TABLE IF EXISTS test_executions CASCADE;
DROP TABLE IF EXISTS change_detections CASCADE;
DROP TABLE IF EXISTS test_cases CASCADE;
DROP TABLE IF EXISTS test_suites CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DELETE FROM migration_history WHERE migration_name = '001_create_base_schema';
```

---

## 6. PERFORMANCE & INDEXING ANALYSIS

### 6.1 Index Coverage (GOOD)

✓ **Foreign Key Indexes:**
```sql
CREATE INDEX idx_test_suites_project_id ON test_suites(project_id);
CREATE INDEX idx_test_cases_test_suite_id ON test_cases(test_suite_id);
CREATE INDEX idx_test_executions_project_id ON test_executions(project_id);
```

✓ **Array/JSONB Indexes:**
```sql
CREATE INDEX idx_test_cases_tags ON test_cases USING GIN(tags);
CREATE INDEX idx_test_cases_requirement_ids ON test_cases USING GIN(requirement_ids);
CREATE INDEX idx_change_detections_test_suite_ids ON change_detections USING GIN(test_suite_ids);
```

✓ **Timestamp Indexes:**
```sql
CREATE INDEX idx_change_detections_detected_at ON change_detections(detected_at DESC);
CREATE INDEX idx_test_executions_started_at ON test_executions(started_at DESC);
```

### 6.2 Missing Indexes (PERFORMANCE RISK)

**Problem 1: No composite indexes for common filters**
```sql
-- Users might frequently query by email + role
-- But there's only single-column indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- MISSING: Composite index for common query patterns
CREATE INDEX idx_users_email_role ON users(email, role); -- Would help:
-- SELECT * FROM users WHERE email = '...' AND role = 'admin';
```

**Problem 2: Missing index on status + timestamp combinations**
```sql
-- Slow query: "Get recent completed test executions"
SELECT * FROM test_executions 
WHERE status = 'completed' 
AND started_at > NOW() - INTERVAL '7 days'
ORDER BY started_at DESC;

-- Missing index
CREATE INDEX idx_test_executions_status_started_at ON test_executions(status, started_at DESC);
```

**Problem 3: No partial indexes for active records**
```sql
-- Application probably filters by is_active = true often
-- Partial index would be more efficient
CREATE INDEX idx_test_suites_active ON test_suites(project_id)
WHERE is_active = true; -- Only index active suites
```

### 6.3 Query Optimization Examples

**Before (SLOW):**
```sql
-- Requires full table scan
SELECT COUNT(*) FROM test_cases 
WHERE test_suite_id = $1 AND is_automated = true;
```

**After (FAST):**
```sql
-- Add missing index
CREATE INDEX idx_test_cases_suite_automated ON test_cases(test_suite_id, is_automated);
```

**Recommended Missing Indexes:**
```sql
-- Composite indexes for common WHERE + ORDER BY patterns
CREATE INDEX idx_test_executions_project_status_started ON test_executions(project_id, status, started_at DESC);
CREATE INDEX idx_test_results_execution_status ON test_results(test_execution_id, status);
CREATE INDEX idx_messages_project_created ON messages(project_id, created_at DESC);
CREATE INDEX idx_notifications_user_read_created ON notifications(user_id, is_read, created_at DESC);

-- Partial indexes for active/recent records
CREATE INDEX idx_projects_active ON projects(id) WHERE status = 'active';
CREATE INDEX idx_test_cases_active ON test_cases(test_suite_id) WHERE status = 'active' AND is_automated = true;
CREATE INDEX idx_user_sessions_active ON user_sessions(user_id) WHERE is_active = true;

-- Expression indexes for common filtering
CREATE INDEX idx_test_executions_not_running ON test_executions(project_id, started_at DESC) 
WHERE status != 'running';
```

---

## 7. DATA PROTECTION & SENSITIVE FIELD HANDLING

### 7.1 Encryption at Rest

**Current State:** ❌ NO ENCRYPTION
- User emails stored in plaintext in users.email
- URLs stored in plaintext in projects.base_url, change_detections.url
- Test names/descriptions stored unencrypted

**Recommendation:**
```sql
-- Approach 1: Column encryption with pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- For sensitive fields, encrypt at application level (better approach)
-- Or use Supabase Vault for encryption

-- Create encrypted column migration
ALTER TABLE users ADD COLUMN email_encrypted TEXT;
UPDATE users SET email_encrypted = pgp_pub_encrypt(email, pgp_key_create());
-- Migrate application to use email_encrypted
ALTER TABLE users DROP COLUMN email;
ALTER TABLE users RENAME COLUMN email_encrypted TO email;
```

**Supabase Vault (RECOMMENDED):**
```sql
-- Supabase provides native encryption
SELECT pgsodium.crypto_secretbox_keygen() as key; -- Generate encryption key

-- Store keys in Vault, not in code
-- Application decrypts when needed
```

### 7.2 PII Protection Status

| Field | Sensitivity | Current | Risk | Recommendation |
|-------|-------------|---------|------|-----------------|
| users.email | HIGH (PII) | Plaintext | HIGH | Encrypt or hash |
| users.name | MEDIUM (PII) | Plaintext | MEDIUM | Consider hashing |
| users.metadata | MEDIUM | Plaintext JSONB | MEDIUM | Validate before storing |
| projects.base_url | MEDIUM | Plaintext | MEDIUM | Encrypt if sensitive |
| test_cases.automation_script_path | LOW | Plaintext | LOW | Keep plaintext (internal) |
| notifications.data | MEDIUM | JSONB | MEDIUM | Don't store sensitive data |

### 7.3 Audit Logging

**Current:** ❌ NO AUDIT TRAIL
- No way to track who deleted what
- No way to audit permission changes
- No way to track sensitive data access

**Required Audit Points:**
```sql
-- Critical operations that need audit logs:
-- 1. User creation/deletion
-- 2. Permission changes (role assignments)
-- 3. Project ownership changes
-- 4. Sensitive field updates (email, API keys)
-- 5. Access to test execution results
-- 6. Deletion of projects or test suites

-- Implement audit_log table (see section 4.2 above)
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(100),
    operation VARCHAR(10),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    changed_by UUID,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET, -- Optional: capture client IP
    user_agent TEXT  -- Optional: capture browser info
);
```

---

## 8. DATABASE CREDENTIALS & ACCESS MANAGEMENT

### 8.1 Service Role Key Exposure Risk

**Current Code:**
```sql
-- From 01-schema-haida.sql
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
```

**Issues:**
- ❌ Grants are too permissive for anon user
- ❌ anon role given SELECT on everything (oversharing)
- ❌ No distinction between read/write operations
- ❌ Service role key likely stored in code or .env files

**Current Risk:**
```
.env file (EXPOSED): SUPABASE_SERVICE_KEY=eyJ...
↓
Attacker obtains key
↓
Full database access with no RLS restrictions
↓
Total data breach
```

### 8.2 Credential Management Best Practices

**For Supabase:**
```
✓ DO:
  - Store service_role key in environment variables
  - Use separate keys for different environments (prod vs dev)
  - Rotate keys regularly
  - Use service_role only on backend, never expose to frontend
  - Use anon key only for read operations in frontend
  - Monitor key usage for anomalies

✗ DON'T:
  - Hardcode keys in source code
  - Commit .env files to git
  - Reuse keys across projects
  - Log full key values
  - Give all users access to service role key
```

### 8.3 Connection Pooling

**Current:** Not configured in schema (handled by Supabase)

**Recommendation for Self-Hosted:**
```
# If using self-hosted PostgreSQL (not Supabase)
PgBouncer Configuration:
- Set pool_mode = transaction (safest for most apps)
- Set max_client_conn = 1000
- Set default_pool_size = 25 per user

Environment:
DATABASE_URL=postgres://user:pass@pgbouncer-host:6432/haida
```

### 8.4 Backup & Disaster Recovery

**Current:** ❌ NOT CONFIGURED IN SCHEMA

**Supabase Backup:**
- Automatic daily backups (included in paid plan)
- Point-in-time recovery available
- Backups stored separately from production

**Recommended Setup:**
```sql
-- Create backup schedule documentation
/*
BACKUP POLICY:
- Frequency: Daily at 2:00 AM UTC
- Retention: 30 days
- Location: US-East-1 (separate from primary)
- RTO (Recovery Time Objective): 1 hour
- RPO (Recovery Point Objective): 24 hours

DISASTER RECOVERY:
1. Automated failover to standby database
2. Application automatically switches connection
3. Manual verification before marking "recovered"
4. Post-incident: Analyze root cause, update runbook
*/

-- Test disaster recovery quarterly
-- Restore from backup to staging environment
-- Run full test suite against restored backup
-- Verify no data loss
```

---

## 9. PERMISSION SYSTEM ANALYSIS

### 9.1 Role-Based Access Control (permissions-system.sql)

**Positive:**
✓ Four system roles defined: admin, qa_engineer, developer, viewer
✓ Granular permissions table (19 different permissions)
✓ Role-permission mapping with no hardcoding
✓ User-level permission overrides
✓ Helper functions: user_has_permission(), get_user_permissions()

**Good Example:**
```sql
-- QA Engineer role permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'qa_engineer'
  AND p.name IN (
    'projects.read',
    'test_suites.create', 'test_suites.read', 'test_suites.update', 'test_suites.delete', 'test_suites.execute',
    'test_cases.create', 'test_cases.read', 'test_cases.update', 'test_cases.delete',
    'executions.read', 'executions.delete',
    'reports.read', 'reports.export', 'reports.create'
  );

-- User checking their permissions
SELECT * FROM public.user_has_permission(user_id, 'test_suites.execute');
```

### 9.2 Permission-RLS Integration Gap

**Problem:** Permission system exists but RLS policies don't use it!

```sql
-- From permissions-system.sql (GOOD):
CREATE FUNCTION public.user_has_permission(p_user_id UUID, p_permission_name VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Checks user's role and custom permissions
  ...
END;
$$;

-- From rls-simple-open.sql (BAD - doesn't use permission function):
CREATE POLICY "projects_all_public"
ON public.projects
FOR ALL
USING (true)  -- ← IGNORES user_has_permission()!
WITH CHECK (true);

-- MISSING: RLS policy should use permission function
CREATE POLICY "projects_read_by_permission"
ON public.projects
FOR SELECT
TO authenticated
USING (public.user_has_permission(auth.uid(), 'projects.read'));
```

**Recommendation:** Rewrite all RLS policies to use `user_has_permission()`:

```sql
-- Recommended approach
CREATE POLICY "projects_read"
ON public.projects
FOR SELECT
TO authenticated
USING (public.user_has_permission(auth.uid(), 'projects.read'));

CREATE POLICY "projects_write"
ON public.projects
FOR INSERT TO authenticated
WITH CHECK (public.user_has_permission(auth.uid(), 'projects.create'));

CREATE POLICY "projects_update"
ON public.projects
FOR UPDATE TO authenticated
USING (public.user_has_permission(auth.uid(), 'projects.update'))
WITH CHECK (public.user_has_permission(auth.uid(), 'projects.update'));

CREATE POLICY "projects_delete"
ON public.projects
FOR DELETE TO authenticated
USING (public.user_has_permission(auth.uid(), 'projects.delete'));
```

---

## 10. SCHEMA CONSTRAINTS & DATA VALIDATION

### 10.1 Missing Check Constraints

**Problem:** VARCHAR enums have no validation

```sql
-- users.role can contain invalid values
INSERT INTO users (email, name, role) VALUES ('hola@stayarta.com', 'Test', 'invalid_role_xxxx');
-- ✗ Succeeds! Should fail.

-- test_cases.priority can be invalid
INSERT INTO test_cases (..., priority) VALUES (..., 'INVALID');
-- ✗ Succeeds! Should fail with enum-like values.
```

**Recommendation:**
```sql
-- Add check constraints for enums
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'qa_engineer', 'developer', 'viewer'));

ALTER TABLE test_cases ADD CONSTRAINT test_cases_priority_check 
CHECK (priority IN ('P0', 'P1', 'P2', 'P3', 'P4'));

ALTER TABLE test_cases ADD CONSTRAINT test_cases_risk_level_check 
CHECK (risk_level IN ('high', 'medium', 'low'));

ALTER TABLE test_suites ADD CONSTRAINT test_suites_priority_check 
CHECK (priority IN ('critical', 'high', 'medium', 'low'));

ALTER TABLE test_executions ADD CONSTRAINT test_executions_status_check 
CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled'));

-- Domain-specific validation
ALTER TABLE change_detections ADD CONSTRAINT change_detections_status_check 
CHECK (status IN ('pending', 'processing', 'completed', 'failed'));

ALTER TABLE test_results ADD CONSTRAINT test_results_status_check 
CHECK (status IN ('passed', 'failed', 'skipped', 'flaky'));
```

### 10.2 Missing NOT NULL Constraints

**Problem:** Some fields should never be null

```sql
-- These should be NOT NULL
test_cases.expected_result   -- Currently allows NULL
test_cases.test_steps        -- Currently allows NULL
projects.name                -- Currently allows NULL
test_suites.name             -- Currently allows NULL
test_executions.project_id   -- Currently allows NULL ❌ Foreign Key!
```

**Fix:**
```sql
ALTER TABLE test_cases ALTER COLUMN expected_result SET NOT NULL;
ALTER TABLE test_cases ALTER COLUMN test_steps SET NOT NULL;
ALTER TABLE projects ALTER COLUMN name SET NOT NULL;
ALTER TABLE test_suites ALTER COLUMN name SET NOT NULL;

-- Critical: Ensure foreign keys are NOT NULL
ALTER TABLE test_executions ALTER COLUMN project_id SET NOT NULL;
ALTER TABLE test_results ALTER COLUMN test_execution_id SET NOT NULL;
ALTER TABLE test_suites ALTER COLUMN project_id SET NOT NULL;
```

### 10.3 URL and Email Validation

**Problem:** No validation of URL format

```sql
-- Invalid URLs accepted
INSERT INTO projects (name, slug, base_url) VALUES 
  ('Bad', 'bad', 'not a url at all');
INSERT INTO projects (name, slug, base_url) VALUES
  ('Bad2', 'bad2', 'javascript:alert(1)'); -- XSS risk!
```

**Solution: Application-level validation**
```
// Node.js validation (recommended - do this BEFORE inserting)
const url = require('url');

function validateUrl(urlString) {
  try {
    const parsed = new URL(urlString);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Only http/https allowed');
    }
    return true;
  } catch {
    return false;
  }
}

// Supabase validation
const isValidUrl = (url) => {
  const urlRegex = /^https?:\/\/.+\..+/;
  return urlRegex.test(url);
};
```

### 10.4 Duration Range Validation

**Problem:** duration_ms can be negative or unreasonably large

```sql
-- Invalid duration values
UPDATE test_executions SET duration_ms = -1000; -- ✗ Allowed
UPDATE test_executions SET duration_ms = ++34662652300; -- ✗ Allowed
```

**Fix:**
```sql
-- Add check constraint for reasonable ranges
ALTER TABLE test_executions ADD CONSTRAINT test_executions_duration_check
CHECK (duration_ms >= 0 AND duration_ms < ++34662652300); -- 0 to 24 hours

ALTER TABLE test_results ADD CONSTRAINT test_results_duration_check
CHECK (duration_ms >= 0 AND duration_ms < 3600000); -- 0 to 1 hour per test

-- Add checks for passed/failed/skipped counts
ALTER TABLE test_executions ADD CONSTRAINT test_executions_counts_check
CHECK (passed_tests >= 0 AND failed_tests >= 0 AND skipped_tests >= 0
       AND total_tests = passed_tests + failed_tests + skipped_tests);
```

---

## 11. SUMMARY OF FINDINGS

### Critical Issues (Fix Immediately)

| Issue | File(s) | Severity | Impact |
|-------|---------|----------|--------|
| RLS Config Conflicts | 6 different rls-*.sql files | CRITICAL | Unknown actual security posture |
| Over-Permissive RLS | rls-simple-open.sql | CRITICAL | Anon users can delete projects |
| Missing RLS on change_detections | 01-schema-haida.sql | CRITICAL | Data leaks about monitoring |
| Service Role Key Exposure | .env (not tracked) | CRITICAL | Complete database compromise |
| No Audit Trail | All migrations | CRITICAL | Can't track who did what |
| Permission System Not Used in RLS | permissions-system.sql + RLS files | HIGH | Permission system has no effect |

### High-Priority Issues (Fix Soon)

| Issue | Impact | Fix Effort |
|-------|--------|-----------|
| User email PII exposed via RLS | Privacy violation | Medium |
| Missing indexes for common queries | Performance degradation | Medium |
| No check constraints on enums | Data corruption risk | Low |
| Missing NOT NULL constraints | Unexpected nulls in queries | Low |
| No encryption at rest | Data breach if DB accessed | High |
| No disaster recovery documented | Extended downtime risk | Low |

### Medium-Priority Issues (Fix Next Sprint)

| Issue | Impact |
|-------|--------|
| Missing down migrations | Can't rollback safely |
| Incomplete test_results RLS | Test data exposed |
| No soft deletes | Can't recover deleted data |
| Migration versioning absent | Drift between environments |
| Missing composite indexes | Slow reports/dashboards |

---

## 12. RECOMMENDATIONS & REMEDIATION

### Phase 1: Immediate (This Week)

```sql
-- 1. Consolidate RLS configuration
-- Delete: rls-simple-open.sql, rls-simple-disable.sql, rls-simple-*.sql
-- Keep: FIX-RLS-POLICIES.sql + permissions-system.sql
-- Create: 003_setup_rls_policies_canonical.sql (single source of truth)

-- 2. Add check constraints
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'qa_engineer', 'developer', 'viewer'));
-- ... (all enums, see section 10.1)

-- 3. Fix user email RLS
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);  -- ← Remove the 'OR true'

-- 4. Enable RLS on change_detections
ALTER TABLE public.change_detections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "change_detections_project_visibility" ...
-- (see section 3.3)

-- 5. Document which RLS is canonical
-- Create: docs/RLS-CONFIGURATION.md
-- Content: Which file is applied, when it was deployed, change log
```

### Phase 2: Short-term (This Month)

```sql
-- 1. Implement audit logging
CREATE TABLE audit_log (...); -- see section 4.2
-- Apply triggers to all tables

-- 2. Integrate permissions system with RLS
-- Rewrite all RLS policies to use user_has_permission()
-- Test role-based access with multiple users

-- 3. Add missing indexes
CREATE INDEX idx_test_executions_project_status_started ON test_executions(...);
-- ... (see section 6.3)

-- 4. Add validation constraints
ALTER TABLE test_executions ADD CONSTRAINT test_executions_duration_check (...);
-- ... (see section 10.4)

-- 5. Set up automated backups
-- Verify daily backups are running
-- Test restore procedure to staging
```

### Phase 3: Medium-term (Next Quarter)

```sql
-- 1. Encryption at rest for PII
-- Evaluate Supabase Vault or pgcrypto
-- Encrypt: users.email, projects.base_url
-- Rotate encryption keys

-- 2. Implement soft deletes
ALTER TABLE projects ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE test_suites ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
-- Update views to filter WHERE deleted_at IS NULL

-- 3. Add comprehensive monitoring
-- Set up database logging for:
--   - Slow queries (> 1 second)
--   - Lock contention
--   - Replication lag
--   - Disk space usage

-- 4. Data retention policy
-- Delete test results older than 1 year
-- Archive old execution logs to cold storage
-- Document retention in docs/DATA-RETENTION.md
```

### Phase 4: Long-term (Quarterly Reviews)

- [ ] Quarterly security audit of RLS policies
- [ ] Annual encryption key rotation
- [ ] Database performance optimization (query plans)
- [ ] Disaster recovery drill (restore from backup)
- [ ] Permission system audit (identify unused permissions)
- [ ] PII audit (identify new sensitive fields)

---

## 13. TESTING RECOMMENDATIONS

### Test Case: RLS Enforcement

```sql
-- Test 1: Anonymous users cannot write
BEGIN;
SET ROLE anon;
INSERT INTO projects (name, slug, base_url) VALUES ('Test', 'test', 'http://test.com');
-- Expected: ERROR new row violates row-level security policy
ROLLBACK;

-- Test 2: Authenticated users cannot delete other's projects
BEGIN;
SET ROLE authenticated;
SET LOCAL user_id = 'user-2-id'; -- Simulate user 2
DELETE FROM projects WHERE owner_id = 'user-1-id'; -- Try to delete user 1's project
-- Expected: ERROR new row violates row-level security policy
ROLLBACK;

-- Test 3: Admins can do everything (with proper permission)
BEGIN;
SET ROLE authenticated;
SET LOCAL user_id = 'admin-id';
DELETE FROM projects WHERE id = 'any-project-id';
-- Expected: DELETE successfully if user has 'projects.delete' permission
COMMIT;
```

### Test Case: Data Integrity

```sql
-- Test cascade deletes
BEGIN;
DELETE FROM projects WHERE id = 'test-project-id';
-- Verify: All test_suites, test_cases, test_executions, test_results deleted
SELECT COUNT(*) FROM test_suites WHERE project_id = 'test-project-id';
-- Expected: 0
ROLLBACK;

-- Test timestamp triggers
UPDATE projects SET name = 'Updated' WHERE id = 'test-id';
SELECT updated_at FROM projects WHERE id = 'test-id';
-- Expected: updated_at = CURRENT_TIMESTAMP (automatic)

-- Test duration calculation
UPDATE test_executions SET started_at = NOW(), completed_at = NOW() + INTERVAL '5 minutes'
WHERE id = 'test-exec-id';
SELECT duration_ms FROM test_executions WHERE id = 'test-exec-id';
-- Expected: duration_ms = 300000 (5 minutes in milliseconds)
```

---

## 14. COMPLIANCE & DOCUMENTATION

### Files to Create

1. **docs/RLS-CONFIGURATION.md**
   - Which RLS file is currently deployed
   - When it was changed last
   - Changelog of RLS policy updates
   - How to test RLS policies

2. **docs/SECURITY-POLICY.md**
   - Encryption requirements
   - Key rotation schedule
   - Access control rules
   - Data classification
   - PII handling procedures

3. **docs/BACKUP-RECOVERY.md**
   - Backup schedule
   - RTO/RPO targets
   - Restore procedure
   - Disaster recovery test calendar

4. **docs/MIGRATIONS.md**
   - Migration versioning scheme
   - How to create new migrations
   - Rollback procedures
   - Testing migrations before production

5. **.env.example**
   - SUPABASE_URL=https://...
   - SUPABASE_ANON_KEY=eyJ... (safe, read-only)
   - SUPABASE_SERVICE_KEY=*** (NEVER commit this)
   - BACKUP_ENCRYPTION_KEY=*** (if applicable)

---

## FINAL CHECKLIST

### Before Production Deployment

- [ ] Consolidate RLS config (single canonical file)
- [ ] Verify RLS policies with test account
- [ ] Add check constraints to all enums
- [ ] Implement audit logging
- [ ] Test permission system integration
- [ ] Add missing indexes for performance
- [ ] Set up automated backups
- [ ] Document all security policies
- [ ] Encrypt sensitive fields (email, URLs)
- [ ] Configure key rotation
- [ ] Set up monitoring/alerting
- [ ] Disaster recovery test
- [ ] Security code review
- [ ] Load testing with indexes
- [ ] Documentation complete

---

## APPENDIX: SQL SNIPPETS FOR COMMON OPERATIONS

### Create All Missing Indexes

```sql
-- Run this script to add all recommended indexes
CREATE INDEX IF NOT EXISTS idx_test_executions_project_status_started 
    ON test_executions(project_id, status, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_results_execution_status 
    ON test_results(test_execution_id, status);
CREATE INDEX IF NOT EXISTS idx_messages_project_created 
    ON messages(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created 
    ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_active 
    ON projects(id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_test_cases_active 
    ON test_cases(test_suite_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_user_sessions_active 
    ON user_sessions(user_id) WHERE is_active = true;
```

### Enable Audit Logging

```sql
-- See section 4.2 and 7.2 for complete implementation
```

### Verify RLS Setup

```sql
-- Check which RLS policies are active
SELECT 
    schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check which tables have RLS enabled
SELECT 
    schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

**Report Generated:** January 13, 2026
**Audit Scope:** /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev/database/
**Status:** Complete
