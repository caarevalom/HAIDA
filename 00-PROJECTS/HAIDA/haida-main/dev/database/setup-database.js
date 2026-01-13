#!/usr/bin/env node

/**
 * HAIDA Database Setup Script
 * Automatically creates schema and populates test data in Supabase
 */

import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.blue}${msg}${colors.reset}\n${'='.repeat(50)}`),
};

// Configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || 'db.wdebyxvtunromsnkqbrd.supabase.co',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || null,
  ssl: {
    rejectUnauthorized: false,
  },
};

// Files to execute
const SQL_FILES = ['01-schema-haida.sql', '02-test-data.sql'];

/**
 * Read SQL file
 */
function readSQLFile(filename) {
  const filePath = path.join(__dirname, filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  return fs.readFileSync(filePath, 'utf8');
}

/**
 * Test database connection
 */
async function testConnection(client) {
  try {
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    log.success('Connected to PostgreSQL');
    log.info(`Time: ${result.rows[0].current_time}`);
    log.info(`Version: ${result.rows[0].pg_version.split(',')[0]}`);
    return true;
  } catch (err) {
    log.error('Connection failed');
    throw err;
  }
}

/**
 * Execute SQL file
 */
async function executeSQLFile(client, filename) {
  try {
    log.info(`Executing ${filename}...`);
    const sql = readSQLFile(filename);

    // Execute SQL
    await client.query(sql);

    log.success(`${filename} executed successfully`);
    return true;
  } catch (err) {
    log.error(`Failed to execute ${filename}`);
    throw err;
  }
}

/**
 * Verify tables created
 */
async function verifyTables(client) {
  const query = `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `;

  const result = await client.query(query);
  const tables = result.rows.map((row) => row.table_name);

  log.info(`Tables created: ${tables.length}`);
  tables.forEach((table) => console.log(`  - ${table}`));

  return tables;
}

/**
 * Verify views created
 */
async function verifyViews(client) {
  const query = `
    SELECT table_name
    FROM information_schema.views
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;

  const result = await client.query(query);
  const views = result.rows.map((row) => row.table_name);

  log.info(`Views created: ${views.length}`);
  views.forEach((view) => console.log(`  - ${view}`));

  return views;
}

/**
 * Count records in key tables
 */
async function countRecords(client) {
  const tables = ['users', 'projects', 'test_suites', 'test_cases'];

  log.info('Record counts:');

  for (const table of tables) {
    try {
      const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
      const count = result.rows[0].count;
      console.log(`  - ${table}: ${count} records`);
    } catch (err) {
      console.log(`  - ${table}: Error querying`);
    }
  }
}

/**
 * Display connection info
 */
function displayConnectionInfo() {
  log.header('Supabase Connection Info');
  console.log(`Host:     ${DB_CONFIG.host}`);
  console.log(`Port:     ${DB_CONFIG.port}`);
  console.log(`Database: ${DB_CONFIG.database}`);
  console.log(`User:     ${DB_CONFIG.user}`);
  console.log(`SSL:      Enabled`);
}

/**
 * Display next steps
 */
function displayNextSteps() {
  log.header('Next Steps');
  console.log(`
1. Verify in Supabase Dashboard:
   https://app.supabase.com/project/wdebyxvtunromsnkqbrd/editor

2. Update HAIDA .env file:
   Add Supabase credentials to .env

3. Test connection from HAIDA API:
   node haida/haida-api/test-db-connection.js

4. View data:
   - Go to Table Editor in Supabase
   - Check users, projects, test_suites, test_cases

5. Run queries:
   SELECT * FROM v_project_health;
   SELECT * FROM v_test_coverage;
   SELECT * FROM v_recent_executions;
  `);
}

/**
 * Main setup function
 */
async function setup() {
  const client = new Client(DB_CONFIG);

  try {
    log.header('HAIDA Database Setup');

    // Check password
    if (!DB_CONFIG.password) {
      log.error('Database password not provided');
      log.info('Set DB_PASSWORD environment variable or update this script');
      process.exit(1);
    }

    // Display connection info
    displayConnectionInfo();

    // Connect
    log.info('Connecting to Supabase...');
    await client.connect();

    // Test connection
    await testConnection(client);

    // Execute SQL files
    log.header('Executing SQL Scripts');
    for (const file of SQL_FILES) {
      await executeSQLFile(client, file);
    }

    // Verify setup
    log.header('Verification');
    await verifyTables(client);
    await verifyViews(client);
    await countRecords(client);

    // Success
    log.header('Setup Complete');
    log.success('HAIDA database setup completed successfully!');

    // Display next steps
    displayNextSteps();
  } catch (err) {
    log.header('Setup Failed');
    log.error(err.message);

    if (err.code === 'ECONNREFUSED') {
      log.warning('Connection refused. Check:');
      console.log('  - Is the host correct?');
      console.log('  - Is the port correct?');
      console.log('  - Is Supabase project active?');
    } else if (err.code === '28P01') {
      log.warning('Authentication failed. Check:');
      console.log('  - Is the password correct?');
      console.log('  - Is the user correct?');
    } else {
      console.error('\nFull error:', err);
    }

    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run setup
setup();
