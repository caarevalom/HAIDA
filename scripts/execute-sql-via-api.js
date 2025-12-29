#!/usr/bin/env node

/**
 * Script para ejecutar SQL en Supabase vía API
 * Ejecuta los scripts setup-ctb-complete.sql usando la API REST de Supabase
 */

import { createClient } from '@supabase/supabase-js';

// Configuración Supabase
const SUPABASE_URL = 'https://wdebyxvtunromsnkqbrd.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTg5NTc1MSwiZXhwIjoyMDUxNDcxNzUxfQ.npg84UxKhEBLVDGxN4S4jPlr-eLEELIu_t7XcvhHfcY';

// Crear cliente Supabase con service key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function getUserByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, role, full_name')
    .eq('email', email)
    .single();

  if (error) {
    console.log(`⚠️ Usuario ${email} no encontrado en public.users`);
    return null;
  }

  return data;
}

async function createOrUpdateProject(projectData, ownerId) {
  const { data: existingProject } = await supabase
    .from('projects')
    .select('id')
    .eq('slug', projectData.slug)
    .single();

  if (existingProject) {
    console.log(`📝 Actualizando proyecto ${projectData.name}...`);
    const { data, error } = await supabase
      .from('projects')
      .update({
        name: projectData.name,
        description: projectData.description,
        base_url: projectData.base_url,
        repository_url: projectData.repository_url,
        owner_id: ownerId,
        settings: projectData.settings,
        metadata: projectData.metadata,
        updated_at: new Date().toISOString()
      })
      .eq('slug', projectData.slug)
      .select()
      .single();

    if (error) {
      console.error(`❌ Error actualizando proyecto ${projectData.name}:`, error);
      return null;
    }
    return data;
  } else {
    console.log(`✨ Creando proyecto ${projectData.name}...`);
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        ...projectData,
        owner_id: ownerId
      }])
      .select()
      .single();

    if (error) {
      console.error(`❌ Error creando proyecto ${projectData.name}:`, error);
      return null;
    }
    return data;
  }
}

async function createTestSuite(suiteData, projectId) {
  const { data: existing } = await supabase
    .from('test_suites')
    .select('id')
    .eq('project_id', projectId)
    .eq('name', suiteData.name)
    .single();

  if (existing) {
    console.log(`  ⏭️ Suite "${suiteData.name}" ya existe, saltando...`);
    return existing;
  }

  const { data, error } = await supabase
    .from('test_suites')
    .insert([{
      ...suiteData,
      project_id: projectId
    }])
    .select()
    .single();

  if (error) {
    console.error(`  ❌ Error creando suite "${suiteData.name}":`, error);
    return null;
  }

  console.log(`  ✅ Suite "${suiteData.name}" creada`);
  return data;
}

async function main() {
  console.log('\n============================================');
  console.log('🚀 HAIDA - Setup CTB via API');
  console.log('============================================\n');

  // Paso 1: Verificar usuario
  console.log('📋 Paso 1: Verificando usuario carlosadmin@hiberus.com...');
  const user = await getUserByEmail('carlosadmin@hiberus.com');

  if (!user) {
    console.error('❌ Usuario no encontrado. Por favor créelo primero en Supabase Dashboard.');
    process.exit(1);
  }

  console.log(`✅ Usuario encontrado:`);
  console.log(`   ID: ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Rol: ${user.role}`);
  console.log(`   Nombre: ${user.full_name || 'N/A'}\n`);

  // Paso 2: Crear proyecto CTB
  console.log('📋 Paso 2: Creando/actualizando proyecto CTB...');
  const ctbProject = await createOrUpdateProject({
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
  }, user.id);

  if (!ctbProject) {
    console.error('❌ No se pudo crear/actualizar proyecto CTB');
    process.exit(1);
  }

  console.log(`✅ Proyecto CTB configurado: ${ctbProject.id}\n`);

  // Paso 3: Crear proyecto Privalia
  console.log('📋 Paso 3: Creando/actualizando proyecto Privalia...');
  const privaliaProject = await createOrUpdateProject({
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
  }, user.id);

  if (!privaliaProject) {
    console.error('❌ No se pudo crear/actualizar proyecto Privalia');
    process.exit(1);
  }

  console.log(`✅ Proyecto Privalia configurado: ${privaliaProject.id}\n`);

  // Paso 4: Crear test suites para CTB
  console.log('📋 Paso 4: Creando test suites para CTB...');

  const testSuites = [
    {
      name: 'CTB - Home & Landing',
      description: 'Tests de página principal, banner, productos destacados y performance',
      suite_type: 'smoke',
      priority: 'high',
      tags: ['home', 'landing', 'performance', 'a11y', 'desktop', 'ios', 'android'],
      metadata: { component: 'Home', module: 'Landing', test_count: 13, source: 'ctb-master.csv' }
    },
    {
      name: 'CTB - Búsqueda y Navegación',
      description: 'Tests de búsqueda, navegación principal, footer y newsletter',
      suite_type: 'smoke',
      priority: 'high',
      tags: ['search', 'navigation', 'footer', 'newsletter', 'desktop', 'ios', 'android'],
      metadata: { component: 'Navigation', module: 'Search', test_count: 8, source: 'ctb-master.csv' }
    },
    {
      name: 'CTB - Autenticación',
      description: 'Tests de login, registro, recuperación de password, logout, MFA',
      suite_type: 'functional',
      priority: 'critical',
      tags: ['auth', 'login', 'register', 'security', 'desktop', 'ios', 'android'],
      metadata: { component: 'Auth', module: 'Login', test_count: 15, source: 'ctb-master.csv' }
    },
    {
      name: 'CTB - PLP (Product Listing)',
      description: 'Tests de listado de productos, filtros, ordenamiento y paginación',
      suite_type: 'functional',
      priority: 'high',
      tags: ['plp', 'products', 'filters', 'sorting', 'desktop', 'ios', 'android'],
      metadata: { component: 'PLP', module: 'Listing', test_count: 12, source: 'ctb-master.csv' }
    },
    {
      name: 'CTB - PDP (Product Detail)',
      description: 'Tests de detalle de producto, galería, precio, disponibilidad y calendario',
      suite_type: 'functional',
      priority: 'high',
      tags: ['pdp', 'product', 'calendar', 'availability', 'desktop', 'ios', 'android'],
      metadata: { component: 'PDP', module: 'Detail', test_count: 10, source: 'ctb-master.csv' }
    },
    {
      name: 'CTB - Carrito y Checkout',
      description: 'Tests de carrito, descuentos, checkout, pago y confirmación de orden',
      suite_type: 'e2e',
      priority: 'critical',
      tags: ['cart', 'checkout', 'payment', 'security', 'desktop', 'ios', 'android'],
      metadata: { component: 'Cart', module: 'Checkout', test_count: 30, source: 'ctb-master.csv' }
    },
    {
      name: 'CTB - Portal Afiliados',
      description: 'Tests de autenticación, dashboard, productos, disponibilidad y reservas de afiliados',
      suite_type: 'functional',
      priority: 'high',
      tags: ['afiliados', 'auth', 'dashboard', 'productos', 'desktop', 'ios', 'android'],
      metadata: { component: 'Afiliats', module: 'Portal', test_count: 16, source: 'ctb-master.csv' }
    },
    {
      name: 'CTB - Favoritos y Wishlist',
      description: 'Tests de agregar/eliminar favoritos, compartir wishlist, sincronización multi-dispositivo',
      suite_type: 'functional',
      priority: 'medium',
      tags: ['favorites', 'wishlist', 'sync', 'desktop', 'ios', 'android'],
      metadata: { component: 'Favorites', module: 'Wishlist', test_count: 10, source: 'ctb-master.csv' }
    },
    {
      name: 'CTB - Responsive Design',
      description: 'Tests de diseño responsive en mobile, tablet y desktop',
      suite_type: 'compatibility',
      priority: 'medium',
      tags: ['responsive', 'mobile', 'tablet', 'desktop', 'ios', 'android'],
      metadata: { component: 'Layout', module: 'Responsive', test_count: 8, source: 'ctb-master.csv' }
    },
    {
      name: 'CTB - Calendario y Disponibilidad',
      description: 'Tests de calendario, selección de fechas, pricing temporal y validaciones',
      suite_type: 'functional',
      priority: 'high',
      tags: ['calendar', 'availability', 'pricing', 'desktop', 'ios', 'android'],
      metadata: { component: 'Calendar', module: 'Availability', test_count: 12, source: 'ctb-master.csv' }
    }
  ];

  let suitesCreated = 0;
  for (const suite of testSuites) {
    const created = await createTestSuite(suite, ctbProject.id);
    if (created) suitesCreated++;
  }

  console.log(`\n✅ ${suitesCreated}/${testSuites.length} test suites configuradas\n`);

  // Paso 5: Resumen final
  console.log('============================================');
  console.log('✅ CONFIGURACIÓN COMPLETADA');
  console.log('============================================');
  console.log(`Usuario: ${user.email}`);
  console.log(`Proyectos: CTB, Privalia`);
  console.log(`Test Suites CTB: ${suitesCreated}`);
  console.log('============================================\n');

  // Verificar resultados
  const { data: projects } = await supabase
    .from('projects')
    .select('name, slug, status')
    .eq('owner_id', user.id);

  console.log('📊 Proyectos configurados:');
  projects?.forEach(p => {
    console.log(`   - ${p.name} (${p.slug}) - ${p.status}`);
  });

  const { data: suites, count } = await supabase
    .from('test_suites')
    .select('name', { count: 'exact' })
    .eq('project_id', ctbProject.id);

  console.log(`\n📋 Test Suites CTB (${count} total):`);
  suites?.forEach(s => {
    console.log(`   - ${s.name}`);
  });

  console.log('\n✅ Proceso completado exitosamente!\n');
}

main().catch(error => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
