# HAIDA DATABASE - README

## 📊 Database Overview

**Database**: PostgreSQL 15+ (Supabase)
**Schema Version**: 1.0
**Purpose**: Store test cases, executions, results, and change detection data

## 🔗 Supabase Connection

### Connection String

```
postgresql://postgres:[YOUR-PASSWORD]@db.wdebyxvtunromsnkqbrd.supabase.co:5432/postgres
```

### Connection Details

- **Host**: `db.wdebyxvtunromsnkqbrd.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **User**: `postgres`
- **Password**: `[YOUR-PASSWORD]`

---

## 🗂️ Database Schema

### Tables

#### 1. **users**

Store user accounts for HAIDA system

- **Purpose**: User management and audit trail
- **Key Fields**: email, name, role, is_active
- **Relationships**: Owner of projects, trigger of executions

#### 2. **projects**

Projects/Applications being tested

- **Purpose**: Multi-tenant project management
- **Key Fields**: name, slug, base_url, status, settings
- **Relationships**: Has many test_suites, test_executions

#### 3. **test_suites**

Grouping of related test cases

- **Purpose**: Organize tests by type/functionality
- **Key Fields**: name, suite_type, priority, tags
- **Relationships**: Belongs to project, has many test_cases

#### 4. **test_cases**

Individual test case definitions (ISTQB compliant)

- **Purpose**: Store test documentation and traceability
- **Key Fields**: test_id, test_type, requirement_ids, test_steps, expected_result
- **Relationships**: Belongs to test_suite, has many test_results
- **ISTQB Fields**: preconditions, test_steps, expected_result, requirement_ids

#### 5. **change_detections**

Detected changes from changedetection.io

- **Purpose**: Track UI/API changes that trigger tests
- **Key Fields**: url, tag, previous_md5, current_md5, selected_test_profile
- **Relationships**: Belongs to project, triggers test_executions

#### 6. **test_executions**

Test execution runs

- **Purpose**: Track test runs and their overall results
- **Key Fields**: status, environment, browser, total_tests, passed_tests, failed_tests
- **Relationships**: Belongs to project, triggered by change_detection, has many test_results

#### 7. **test_results**

Individual test case results

- **Purpose**: Store detailed results of each test
- **Key Fields**: status, error_message, duration_ms, screenshot_url
- **Relationships**: Belongs to test_execution, references test_case

### Views

#### v_project_health

Dashboard view of project health metrics

```sql
SELECT * FROM v_project_health;
```

#### v_test_coverage

Test automation coverage by suite

```sql
SELECT * FROM v_test_coverage;
```

#### v_recent_executions

Recent test executions with context

```sql
SELECT * FROM v_recent_executions LIMIT 20;
```

---

## 🚀 Setup Instructions

### Option 1: Supabase SQL Editor (Recommended)

1. **Login to Supabase Dashboard**
   - Go to: https://app.supabase.com/
   - Navigate to your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in left sidebar
   - Click "New Query"

3. **Execute Schema**

   ```sql
   -- Copy and paste contents of 01-schema-haida.sql
   -- Click "Run" or press Ctrl+Enter
   ```

4. **Execute Test Data (Optional)**

   ```sql
   -- Copy and paste contents of 02-test-data.sql
   -- Click "Run"
   ```

5. **Verify**
   - Go to "Table Editor"
   - You should see 7 tables created
   - Check "users" table for 3 default users

### Option 2: psql CLI

1. **Install psql** (if not installed)
   - Windows: Include with PostgreSQL or pgAdmin
   - Mac: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql-client`

2. **Connect to Supabase**

   ```bash
   psql "postgresql://postgres:[YOUR-PASSWORD]@db.wdebyxvtunromsnkqbrd.supabase.co:5432/postgres"
   ```

3. **Execute Scripts**

   ```sql
   \i /path/to/HAIDA/database/01-schema-haida.sql
   \i /path/to/HAIDA/database/02-test-data.sql
   ```

4. **Verify**
   ```sql
   \dt  -- List tables
   SELECT * FROM users;
   SELECT * FROM projects;
   ```

### Option 3: Node.js Script (Automated)

Create `database/setup-db.js`:

```javascript
import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';

const client = new Client({
  connectionString:
    'postgresql://postgres:[YOUR-PASSWORD]@db.wdebyxvtunromsnkqbrd.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function setup() {
  try {
    await client.connect();
    console.log('✓ Connected to Supabase');

    // Execute schema
    const schema = fs.readFileSync('./01-schema-haida.sql', 'utf8');
    await client.query(schema);
    console.log('✓ Schema created');

    // Execute test data
    const testData = fs.readFileSync('./02-test-data.sql', 'utf8');
    await client.query(testData);
    console.log('✓ Test data inserted');

    console.log('\n✅ Database setup complete!');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.end();
  }
}

setup();
```

Run:

```bash
node database/setup-db.js
```

---

## 🔧 Configuration

### Update HAIDA .env

Add Supabase connection to `.env`:

```bash
# Supabase PostgreSQL
SUPABASE_URL=https://wdebyxvtunromsnkqbrd.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Direct PostgreSQL (for raw queries)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.wdebyxvtunromsnkqbrd.supabase.co:5432/postgres
DB_HOST=db.wdebyxvtunromsnkqbrd.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=[YOUR-PASSWORD]
DB_SSL=true
```

### Update HAIDA API Server

Update `haida/haida-api/server.js` to connect:

```javascript
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✓ Database connected:', res.rows[0]);
  }
});
```

---

## 📝 Common Queries

### Insert New Test Execution

```sql
INSERT INTO test_executions (
  project_id,
  execution_type,
  environment,
  browser,
  status
) VALUES (
  (SELECT id FROM projects WHERE slug = 'ctb-barcelona'),
  'webhook_triggered',
  'staging',
  'chromium',
  'running'
) RETURNING id;
```

### Record Test Result

```sql
INSERT INTO test_results (
  test_execution_id,
  test_case_id,
  test_name,
  status,
  duration_ms
) VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  (SELECT id FROM test_cases WHERE test_id = 'TC_LOGIN_001'),
  'Valid Login with Email',
  'passed',
  1250
);
```

### Get Project Health

```sql
SELECT * FROM v_project_health
WHERE project_name = 'CTB Barcelona';
```

### Get Test Coverage

```sql
SELECT * FROM v_test_coverage
WHERE test_suite_name LIKE '%Login%';
```

### Recent Failed Tests

```sql
SELECT
  te.started_at,
  tr.test_name,
  tr.error_message,
  p.name AS project_name
FROM test_results tr
JOIN test_executions te ON tr.test_execution_id = te.id
JOIN projects p ON te.project_id = p.id
WHERE tr.status = 'failed'
ORDER BY te.started_at DESC
LIMIT 20;
```

### Test Flakiness Report

```sql
SELECT
  tc.test_id,
  tc.name,
  COUNT(*) AS total_runs,
  COUNT(*) FILTER (WHERE tr.status = 'passed') AS passed,
  COUNT(*) FILTER (WHERE tr.status = 'failed') AS failed,
  ROUND(
    (COUNT(*) FILTER (WHERE tr.status = 'passed')::NUMERIC / COUNT(*)::NUMERIC) * 100,
    2
  ) AS pass_rate
FROM test_results tr
JOIN test_cases tc ON tr.test_case_id = tc.id
GROUP BY tc.test_id, tc.name
HAVING COUNT(*) >= 10
ORDER BY pass_rate ASC;
```

---

## 🔐 Security & Permissions

### Row Level Security (RLS)

Supabase uses RLS by default. Enable policies if needed:

```sql
-- Enable RLS on tables
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Example policy: Users can only see their own executions
CREATE POLICY "Users view own executions"
ON test_executions FOR SELECT
USING (auth.uid() = triggered_by);
```

### API Keys

- **Anon Key**: Use in client-side code (public)
- **Service Key**: Use in server-side code (private, full access)

---

## 🧪 Testing the Database

### 1. Create Test Execution

```javascript
// HAIDA API
const execution = await pool.query(
  `
  INSERT INTO test_executions (project_id, execution_type, environment, status)
  VALUES ($1, $2, $3, $4)
  RETURNING id, started_at
`,
  [projectId, 'manual', 'staging', 'running']
);

console.log('Execution started:', execution.rows[0].id);
```

### 2. Record Results

```javascript
const result = await pool.query(
  `
  INSERT INTO test_results (test_execution_id, test_name, status, duration_ms)
  VALUES ($1, $2, $3, $4)
`,
  [executionId, 'Login Test', 'passed', 1500]
);
```

### 3. Update Execution Status

```javascript
await pool.query(
  `
  UPDATE test_executions
  SET
    status = 'completed',
    completed_at = NOW(),
    total_tests = 10,
    passed_tests = 9,
    failed_tests = 1
  WHERE id = $1
`,
  [executionId]
);
```

---

## 📊 Backup & Restore

### Backup

```bash
# Full backup
pg_dump "postgresql://postgres:[YOUR-PASSWORD]@db.wdebyxvtunromsnkqbrd.supabase.co:5432/postgres" > haida-backup.sql

# Schema only
pg_dump --schema-only "postgresql://..." > haida-schema.sql

# Data only
pg_dump --data-only "postgresql://..." > haida-data.sql
```

### Restore

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.wdebyxvtunromsnkqbrd.supabase.co:5432/postgres" < haida-backup.sql
```

---

## 🐛 Troubleshooting

### Connection Issues

```bash
# Test connection
psql "postgresql://postgres:[YOUR-PASSWORD]@db.wdebyxvtunromsnkqbrd.supabase.co:5432/postgres" -c "SELECT 1"
```

### Common Errors

1. **SSL required**
   - Add `?sslmode=require` to connection string
   - Or set `ssl: { rejectUnauthorized: false }` in Node.js

2. **Permission denied**
   - Check if using correct password
   - Verify Supabase project is active

3. **Table not found**
   - Run schema script first
   - Check if connected to correct database

### Reset Database

⚠️ **WARNING: This will delete all data!**

```sql
-- Drop all HAIDA tables
DROP TABLE IF EXISTS test_results CASCADE;
DROP TABLE IF EXISTS test_executions CASCADE;
DROP TABLE IF EXISTS change_detections CASCADE;
DROP TABLE IF EXISTS test_cases CASCADE;
DROP TABLE IF EXISTS test_suites CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Then re-run 01-schema-haida.sql
```

---

## 📚 Next Steps

1. ✅ Setup database schema
2. ✅ Insert test data
3. ⬜ Update HAIDA API to use Supabase
4. ⬜ Create data seeding scripts
5. ⬜ Setup automated backups
6. ⬜ Configure RLS policies
7. ⬜ Create database documentation

---

## 🔗 Resources

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Supabase SQL Editor**: https://app.supabase.com/project/_/sql
- **Connection Pooling**: https://supabase.com/docs/guides/database/connecting-to-postgres

---

**Created**: 2024-12-16
**Version**: 1.0
**Maintainer**: HAIDA Team
