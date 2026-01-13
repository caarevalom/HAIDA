#!/usr/bin/env node

/**
 * Script para crear proyectos CTB y Privalia usando la API de backend
 */

const API_URL = 'https://haidapi.stayarta.com';
const ADMIN_CREDENTIALS = {
  email: 'hola@stayarta.com',
  password: 'AdminCTB2025Pass'
};

async function login() {
  console.log('🔐 Autenticando como admin...');

  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ADMIN_CREDENTIALS)
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  console.log(`✅ Autenticado como: ${data.user.email} (${data.user.role})\n`);

  return data.access_token;
}

async function createProjectViaSupabase(token, projectData) {
  const { createClient } = await import('@supabase/supabase-js');

  const supabase = createClient(
    'https://wdebyxvtunromsnkqbrd.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4OTU3NTEsImV4cCI6MjA1MTQ3MTc1MX0._VYypgb2tV9u_4jSAt3sbcFj-drhufB0oN9o3BcgHTs',
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  );

  // Verificar si existe
  const { data: existing } = await supabase
    .from('projects')
    .select('id, name')
    .eq('slug', projectData.slug)
    .single();

  if (existing) {
    console.log(`  📝 Proyecto "${projectData.name}" ya existe (ID: ${existing.id})`);

    // Actualizar
    const { data, error } = await supabase
      .from('projects')
      .update(projectData)
      .eq('slug', projectData.slug)
      .select()
      .single();

    if (error) {
      console.error(`  ❌ Error actualizando: ${error.message}`);
      return null;
    }

    console.log(`  ✅ Proyecto actualizado`);
    return data;
  }

  // Crear nuevo
  const { data, error } = await supabase
    .from('projects')
    .insert([projectData])
    .select()
    .single();

  if (error) {
    console.error(`  ❌ Error creando: ${error.message}`);
    console.error(`  Detalles:`, error);
    return null;
  }

  console.log(`  ✅ Proyecto creado (ID: ${data.id})`);
  return data;
}

async function createTestSuite(token, projectId, suiteData) {
  const { createClient } = await import('@supabase/supabase-js');

  const supabase = createClient(
    'https://wdebyxvtunromsnkqbrd.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4OTU3NTEsImV4cCI6MjA1MTQ3MTc1MX0._VYypgb2tV9u_4jSAt3sbcFj-drhufB0oN9o3BcgHTs',
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  );

  const { data: existing } = await supabase
    .from('test_suites')
    .select('id')
    .eq('project_id', projectId)
    .eq('name', suiteData.name)
    .single();

  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from('test_suites')
    .insert([{ ...suiteData, project_id: projectId }])
    .select()
    .single();

  if (error) {
    console.error(`    ❌ Error: ${error.message}`);
    return null;
  }

  return data;
}

async function main() {
  console.log('\n============================================');
  console.log('🚀 Setup Proyectos CTB y Privalia');
  console.log('============================================\n');

  try {
    // Login
    const token = await login();

    // Proyecto CTB
    console.log('📋 Creando proyecto CTB...');
    const ctbProject = await createProjectViaSupabase(token, {
      name: 'CTB',
      slug: 'ctb',
      description: 'Proyecto CTB - Sistema de gestión y testing automatizado',
      base_url: 'https://mcprod.thisisbarcelona.com',
      repository_url: 'https://github.com/hiberus/ctb',
      status: 'active',
      settings: {
        notifications_enabled: true,
        auto_testing: true,
        smtp_enabled: false
      },
      metadata: {
        client: 'CTB',
        priority: 'high',
        environment: 'production',
        base_url: 'https://mcprod.thisisbarcelona.com'
      }
    });

    if (!ctbProject) {
      console.error('❌ No se pudo crear proyecto CTB');
      process.exit(1);
    }

    // Proyecto Privalia
    console.log('\n📋 Creando proyecto Privalia...');
    const privaliaProject = await createProjectViaSupabase(token, {
      name: 'Privalia',
      slug: 'privalia',
      description: 'Proyecto Privalia - E-commerce y testing automatizado',
      base_url: 'https://privalia.example.com',
      repository_url: 'https://github.com/hiberus/privalia',
      status: 'active',
      settings: {
        notifications_enabled: true,
        auto_testing: true,
        performance_monitoring: true
      },
      metadata: {
        client: 'Privalia',
        priority: 'critical',
        environment: 'production',
        sla: '99.9%'
      }
    });

    if (!privaliaProject) {
      console.error('❌ No se pudo crear proyecto Privalia');
      process.exit(1);
    }

    // Test Suites para CTB
    console.log('\n📋 Creando test suites para CTB...');

    const testSuites = [
      {
        name: 'CTB - Home & Landing',
        description: 'Tests de página principal, banner, productos destacados y performance',
        suite_type: 'smoke',
        priority: 'high',
        tags: ['home', 'landing', 'performance', 'a11y'],
        metadata: { component: 'Home', module: 'Landing', test_count: 13 }
      },
      {
        name: 'CTB - Autenticación',
        description: 'Tests de login, registro, recuperación de password, logout, MFA',
        suite_type: 'functional',
        priority: 'critical',
        tags: ['auth', 'login', 'register', 'security'],
        metadata: { component: 'Auth', module: 'Login', test_count: 15 }
      },
      {
        name: 'CTB - Carrito y Checkout',
        description: 'Tests de carrito, descuentos, checkout, pago y confirmación de orden',
        suite_type: 'e2e',
        priority: 'critical',
        tags: ['cart', 'checkout', 'payment', 'security'],
        metadata: { component: 'Cart', module: 'Checkout', test_count: 30 }
      }
    ];

    let created = 0;
    for (const suite of testSuites) {
      const result = await createTestSuite(token, ctbProject.id, suite);
      if (result) {
        created++;
        console.log(`  ✅ ${suite.name}`);
      }
    }

    console.log(`\n✅ ${created}/${testSuites.length} test suites creadas\n`);

    // Resumen
    console.log('============================================');
    console.log('✅ CONFIGURACIÓN COMPLETADA');
    console.log('============================================');
    console.log(`Proyectos creados: CTB, Privalia`);
    console.log(`Test Suites CTB: ${created}`);
    console.log('============================================\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
