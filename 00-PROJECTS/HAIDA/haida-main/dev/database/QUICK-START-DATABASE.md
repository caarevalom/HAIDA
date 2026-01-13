# QUICK START - HAIDA Database Setup

## ⚡ 5-Minute Setup

### Step 1: Install Required Tools (if not installed)

```bash
# Check if Node.js is installed
node --version  # Should be v18+ or v20+

# If not installed, download from:
# https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi
```

### Step 2: Set Your Password

**Option A: Environment Variable**

```powershell
# PowerShell (Windows)
$env:DB_PASSWORD="YOUR_SUPABASE_PASSWORD"
```

```bash
# Bash (Mac/Linux)
export DB_PASSWORD="YOUR_SUPABASE_PASSWORD"
```

**Option B: Update Script Directly**

Edit `database/setup-database.js` line 30:

```javascript
password: process.env.DB_PASSWORD || 'YOUR_PASSWORD_HERE',
```

### Step 3: Install pg Package

```bash
cd C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA
npm install pg
```

### Step 4: Run Setup Script

```bash
cd database
node setup-database.js
```

**Expected Output:**

```
===================================================
HAIDA Database Setup
===================================================

ℹ Connecting to Supabase...
✓ Connected to PostgreSQL
ℹ Time: ++34662652300...
ℹ Version: PostgreSQL 15.x

===================================================
Executing SQL Scripts
===================================================

ℹ Executing 01-schema-haida.sql...
✓ 01-schema-haida.sql executed successfully
ℹ Executing 02-test-data.sql...
✓ 02-test-data.sql executed successfully

===================================================
Verification
===================================================

ℹ Tables created: 7
  - change_detections
  - projects
  - test_cases
  - test_executions
  - test_results
  - test_suites
  - users

ℹ Views created: 3
  - v_project_health
  - v_recent_executions
  - v_test_coverage

ℹ Record counts:
  - users: 3 records
  - projects: 2 records
  - test_suites: 8 records
  - test_cases: 10 records

===================================================
Setup Complete
===================================================

✓ HAIDA database setup completed successfully!
```

---

## 🔍 Verify in Supabase Dashboard

1. **Go to Supabase**
   - https://app.supabase.com/
   - Select your project

2. **Table Editor**
   - Click "Table Editor" in left sidebar
   - You should see 7 tables:
     - users
     - projects
     - test_suites
     - test_cases
     - change_detections
     - test_executions
     - test_results

3. **Run Test Query**
   - Click "SQL Editor"
   - Run:
   ```sql
   SELECT * FROM users;
   SELECT * FROM v_project_health;
   ```

---

## 🔌 Connect HAIDA API to Supabase

### Update .env File

Add to `C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA\.env`:

```bash
# Supabase Database
DB_HOST=db.wdebyxvtunromsnkqbrd.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=YOUR_PASSWORD_HERE
DB_SSL=true

# Supabase API (optional)
SUPABASE_URL=https://wdebyxvtunromsnkqbrd.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### Test Connection from HAIDA

Create `haida/haida-api/test-db-connection.js`:

```javascript
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

async function test() {
  try {
    console.log('Testing Supabase connection...');

    const result = await pool.query('SELECT NOW(), version()');
    console.log('✓ Connection successful!');
    console.log('Time:', result.rows[0].now);

    const users = await pool.query('SELECT * FROM users');
    console.log(`✓ Found ${users.rows.length} users`);

    await pool.end();
    console.log('\n✓ Test complete!');
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
}

test();
```

Run:

```bash
cd haida/haida-api
node test-db-connection.js
```

---

## 📋 Common Tasks

### Insert Test Execution

```javascript
// In your HAIDA API
const execution = await pool.query(
  `
  INSERT INTO test_executions (
    project_id,
    execution_type,
    environment,
    browser,
    status
  ) VALUES (
    $1, $2, $3, $4, $5
  ) RETURNING id, started_at
`,
  [projectId, 'webhook_triggered', 'staging', 'chromium', 'running']
);

console.log('Execution ID:', execution.rows[0].id);
```

### Record Test Result

```javascript
await pool.query(
  `
  INSERT INTO test_results (
    test_execution_id,
    test_name,
    status,
    duration_ms,
    screenshot_url
  ) VALUES ($1, $2, $3, $4, $5)
`,
  [executionId, 'Login Test', 'passed', 1500, '/screenshots/test.png']
);
```

### Query Recent Executions

```javascript
const recent = await pool.query(`
  SELECT * FROM v_recent_executions
  LIMIT 10
`);

console.log('Recent executions:', recent.rows);
```

---

## 🛠️ Troubleshooting

### Error: "node: command not found"

**Solution**: Install Node.js

- https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi

### Error: "Cannot find module 'pg'"

**Solution**: Install pg package

```bash
npm install pg
```

### Error: "Connection refused"

**Check**:

- Is your internet connected?
- Is Supabase host correct?
- Is Supabase project active?

### Error: "Authentication failed"

**Check**:

- Is password correct?
- Did you set DB_PASSWORD environment variable?

### Error: "SSL required"

**Solution**: Already configured in script with:

```javascript
ssl: {
  rejectUnauthorized: false;
}
```

---

## 🔄 Reset Database

⚠️ **WARNING: This deletes ALL data!**

### Option 1: SQL Script

Create `database/reset-database.sql`:

```sql
-- Drop all tables
DROP TABLE IF EXISTS test_results CASCADE;
DROP TABLE IF EXISTS test_executions CASCADE;
DROP TABLE IF EXISTS change_detections CASCADE;
DROP TABLE IF EXISTS test_cases CASCADE;
DROP TABLE IF EXISTS test_suites CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop views
DROP VIEW IF EXISTS v_project_health CASCADE;
DROP VIEW IF EXISTS v_test_coverage CASCADE;
DROP VIEW IF EXISTS v_recent_executions CASCADE;
```

Run in Supabase SQL Editor or:

```bash
psql "postgresql://postgres:[PASSWORD]@db.wdebyxvtunromsnkqbrd.supabase.co:5432/postgres" -f reset-database.sql
```

### Option 2: Supabase Dashboard

1. Go to Table Editor
2. Select each table
3. Click "..." → "Delete table"
4. Confirm deletion

Then re-run setup script.

---

## 📊 Useful Queries

### View All Tables

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';
```

### Count Records in All Tables

```sql
SELECT
  table_name,
  (SELECT COUNT(*) FROM users) AS users,
  (SELECT COUNT(*) FROM projects) AS projects,
  (SELECT COUNT(*) FROM test_suites) AS test_suites,
  (SELECT COUNT(*) FROM test_cases) AS test_cases,
  (SELECT COUNT(*) FROM test_executions) AS test_executions,
  (SELECT COUNT(*) FROM test_results) AS test_results,
  (SELECT COUNT(*) FROM change_detections) AS change_detections
FROM information_schema.tables
WHERE table_schema = 'public'
LIMIT 1;
```

### Project Health Dashboard

```sql
SELECT * FROM v_project_health;
```

### Test Coverage Report

```sql
SELECT
  test_suite_name,
  total_test_cases,
  automated_test_cases,
  automation_percentage
FROM v_test_coverage
ORDER BY automation_percentage ASC;
```

### Failed Tests Last 7 Days

```sql
SELECT
  te.started_at,
  p.name AS project,
  tr.test_name,
  tr.error_message
FROM test_results tr
JOIN test_executions te ON tr.test_execution_id = te.id
JOIN projects p ON te.project_id = p.id
WHERE tr.status = 'failed'
AND te.started_at >= NOW() - INTERVAL '7 days'
ORDER BY te.started_at DESC;
```

---

## 🎯 Next Steps

1. ✅ Database schema created
2. ✅ Test data inserted
3. ⬜ Update HAIDA API to use Supabase
4. ⬜ Test webhook → database flow
5. ⬜ Create data seeding scripts
6. ⬜ Setup scheduled backups
7. ⬜ Configure Row Level Security (RLS)
8. ⬜ Create dashboards/visualizations

---

## 📞 Need Help?

- **Database Schema**: See `database/README-DATABASE.md`
- **CLI Guide**: See `CLI-TOOLS-GUIDE.md`
- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

**Created**: ++34662652300
**Version**: 1.0
**Estimated Time**: 5-10 minutes
