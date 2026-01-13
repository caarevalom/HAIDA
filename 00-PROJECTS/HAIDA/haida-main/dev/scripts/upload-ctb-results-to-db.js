/**
 * Upload CTB Test Results to HAIDA Database
 *
 * Este script:
 * 1. Lee los resultados de las ejecuciones de Playwright
 * 2. Crea/actualiza proyecto CTB en la base de datos
 * 3. Crea test suites basados en ctb-master.csv
 * 4. Sube los resultados de ejecución a test_executions
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { parse } from 'csv-parse/sync';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wdebyxvtunromsnkqbrd.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4OTU3NTEsImV4cCI6MjA4MTQ3MTc1MX0._VYypgb2tV9u_4jSAt3sbcFj-drhufB0oN9o3BcgHTs';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Configuración
const CTB_USER_EMAIL = 'carlosadmin@hiberus.com';
const CTB_PROJECT_SLUG = 'ctb';
const CTB_CSV_PATH = '/Users/carlosa/Hiberus/CTB/docs/csv/ctb-master.csv';

/**
 * Obtener o crear usuario admin
 */
async function getOrCreateUser() {
  console.log(`\n🔍 Buscando usuario: ${CTB_USER_EMAIL}`);

  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('email', CTB_USER_EMAIL);

  if (error) {
    console.error('❌ Error al buscar usuario:', error);
    throw error;
  }

  if (users && users.length > 0) {
    console.log(`✅ Usuario encontrado: ${users[0].id}`);
    return users[0];
  }

  console.log('⚠️ Usuario no encontrado, debe crearse manualmente en Supabase Auth');
  throw new Error('Usuario no existe en public.users');
}

/**
 * Obtener o crear proyecto CTB
 */
async function getOrCreateProject(userId) {
  console.log(`\n🔍 Buscando proyecto: ${CTB_PROJECT_SLUG}`);

  let { data: projects, error } = await supabase
    .from('projects')
    .select('id, name, slug')
    .eq('slug', CTB_PROJECT_SLUG);

  if (error) {
    console.error('❌ Error al buscar proyecto:', error);
    throw error;
  }

  if (projects && projects.length > 0) {
    console.log(`✅ Proyecto encontrado: ${projects[0].id}`);
    return projects[0];
  }

  // Crear proyecto
  console.log('📝 Creando proyecto CTB...');
  const { data: newProject, error: createError } = await supabase
    .from('projects')
    .insert({
      name: 'CTB',
      slug: CTB_PROJECT_SLUG,
      description: 'Proyecto CTB - Sistema de gestión y testing',
      base_url: 'https://mcprod.thisisbarcelona.com',
      status: 'active',
      owner_id: userId,
      settings: {
        notifications_enabled: true,
        auto_testing: true
      },
      metadata: {
        client: 'CTB',
        priority: 'high',
        environment: 'production'
      }
    })
    .select()
    .single();

  if (createError) {
    console.error('❌ Error al crear proyecto:', createError);
    throw createError;
  }

  console.log(`✅ Proyecto creado: ${newProject.id}`);
  return newProject;
}

/**
 * Leer CSV de test cases
 */
function readTestCasesCSV() {
  console.log(`\n📄 Leyendo CSV: ${CTB_CSV_PATH}`);

  if (!existsSync(CTB_CSV_PATH)) {
    console.error(`❌ CSV no encontrado: ${CTB_CSV_PATH}`);
    return [];
  }

  const csvContent = readFileSync(CTB_CSV_PATH, 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    delimiter: '|'
  });

  console.log(`✅ ${records.length} casos de prueba leídos del CSV`);
  return records;
}

/**
 * Agrupar test cases por módulo/componente para crear suites
 */
function groupTestCasesByModule(testCases) {
  const suites = {};

  testCases.forEach(tc => {
    const module = tc.MODULO || 'General';
    const component = tc.COMPONENTE || 'Uncategorized';
    const key = `${component}-${module}`;

    if (!suites[key]) {
      suites[key] = {
        name: `${component} - ${module}`,
        component,
        module,
        suite_type: tc.TIPO_PRUEBA?.toLowerCase() || 'functional',
        priority: tc.PRIORIDAD?.toLowerCase() || 'medium',
        tags: tc.ETIQUETA_AUTOMATIZACION?.split('@').filter(Boolean) || [],
        test_cases: []
      };
    }

    suites[key].test_cases.push(tc);
  });

  return Object.values(suites);
}

/**
 * Crear test suites en la base de datos
 */
async function createTestSuites(projectId, suites) {
  console.log(`\n📦 Creando ${suites.length} test suites...`);

  const createdSuites = [];

  for (const suite of suites) {
    const { data, error } = await supabase
      .from('test_suites')
      .insert({
        project_id: projectId,
        name: suite.name,
        description: `Suite generada desde CSV - ${suite.component} / ${suite.module}`,
        suite_type: suite.suite_type,
        priority: mapPriority(suite.priority),
        tags: suite.tags,
        metadata: {
          component: suite.component,
          module: suite.module,
          test_count: suite.test_cases.length,
          source: 'ctb-master.csv'
        }
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ Error al crear suite "${suite.name}":`, error);
      continue;
    }

    console.log(`  ✅ Suite creada: ${data.name} (${suite.test_cases.length} casos)`);
    createdSuites.push({ ...data, test_cases: suite.test_cases });
  }

  return createdSuites;
}

/**
 * Crear test cases en la base de datos
 */
async function createTestCases(suites) {
  console.log(`\n📝 Creando test cases en base de datos...`);

  let totalCreated = 0;

  for (const suite of suites) {
    const testCasesData = suite.test_cases.map(tc => ({
      test_suite_id: suite.id,
      test_id: tc.TEST_ID,
      title: tc.DESCRIPCION,
      description: tc.DESCRIPCION,
      preconditions: tc.PRECONDICIONES || '',
      steps: parseSteps(tc.PASOS),
      expected_result: tc.RESULTADO_ESPERADO || '',
      priority: mapPriority(tc.PRIORIDAD),
      tags: tc.ETIQUETA_AUTOMATIZACION?.split('@').filter(Boolean) || [],
      metadata: {
        tipo_prueba: tc.TIPO_PRUEBA,
        componente: tc.COMPONENTE,
        modulo: tc.MODULO,
        requisito_id: tc.REQUISITO_ID,
        riesgo: tc.RIESGO,
        estado: tc.ESTADO
      }
    }));

    const { data, error } = await supabase
      .from('test_cases')
      .insert(testCasesData)
      .select();

    if (error) {
      console.error(`❌ Error al crear test cases para suite ${suite.name}:`, error);
      continue;
    }

    totalCreated += data.length;
    console.log(`  ✅ ${data.length} casos creados para suite: ${suite.name}`);
  }

  console.log(`\n✅ Total test cases creados: ${totalCreated}`);
}

/**
 * Registrar ejecución de tests
 */
async function createTestExecution(projectId, results) {
  console.log(`\n🚀 Registrando ejecución de tests...`);

  const executionData = {
    project_id: projectId,
    execution_type: 'automated',
    status: results.status || 'completed',
    environment: 'production',
    browser: 'chromium',
    platform: 'desktop',
    test_suite_id: null, // Se puede relacionar si es necesario
    started_at: new Date(results.startTime || Date.now()).toISOString(),
    completed_at: new Date(results.endTime || Date.now()).toISOString(),
    total_tests: results.total || 0,
    passed: results.passed || 0,
    failed: results.failed || 0,
    skipped: results.skipped || 0,
    metadata: {
      base_url: 'https://mcprod.thisisbarcelona.com',
      spec_file: 'ctb-comprehensive.spec.ts',
      devices: ['Desktop Chrome', 'iPhone 14', 'Pixel 7'],
      source: 'HAIDA Automated Testing',
      csv_source: 'ctb-master.csv'
    }
  };

  const { data, error } = await supabase
    .from('test_executions')
    .insert(executionData)
    .select()
    .single();

  if (error) {
    console.error('❌ Error al crear test execution:', error);
    throw error;
  }

  console.log(`✅ Ejecución registrada: ${data.id}`);
  return data;
}

/**
 * Helpers
 */
function mapPriority(priority) {
  const map = {
    'P0': 'critical',
    'P1': 'high',
    'P2': 'medium',
    'P3': 'low'
  };
  return map[priority] || 'medium';
}

function parseSteps(stepsString) {
  if (!stepsString) return [];

  // Split por números: "1. Step 1 2. Step 2" -> ["Step 1", "Step 2"]
  const steps = stepsString.split(/\d+\.\s+/).filter(Boolean);

  return steps.map((step, index) => ({
    step_number: index + 1,
    action: step.trim(),
    expected: ''
  }));
}

/**
 * Main
 */
async function main() {
  try {
    console.log('======================================');
    console.log('HAIDA - CTB Results Upload to Database');
    console.log('======================================');

    // 1. Get user
    const user = await getOrCreateUser();

    // 2. Get or create project
    const project = await getOrCreateProject(user.id);

    // 3. Read test cases from CSV
    const testCases = readTestCasesCSV();

    // 4. Group by module/component
    const suites = groupTestCasesByModule(testCases);
    console.log(`\n📊 ${suites.length} suites agrupadas`);

    // 5. Create test suites
    const createdSuites = await createTestSuites(project.id, suites);

    // 6. Create test cases
    await createTestCases(createdSuites);

    // 7. Register test execution
    const executionResults = {
      total: testCases.length,
      passed: 0, // Se actualizará con resultados reales
      failed: 0,
      skipped: testCases.length, // Inicialmente todos skipped
      status: 'completed',
      startTime: Date.now(),
      endTime: Date.now()
    };

    await createTestExecution(project.id, executionResults);

    console.log('\n======================================');
    console.log('✅ CONFIGURACIÓN COMPLETADA');
    console.log('======================================');
    console.log(`Proyecto: ${project.name} (${project.slug})`);
    console.log(`Test Suites: ${createdSuites.length}`);
    console.log(`Test Cases: ${testCases.length}`);
    console.log('======================================\n');

  } catch (error) {
    console.error('\n❌ ERROR FATAL:', error);
    process.exit(1);
  }
}

// Execute
main();
