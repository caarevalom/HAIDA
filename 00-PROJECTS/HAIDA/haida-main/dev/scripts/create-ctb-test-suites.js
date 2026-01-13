#!/usr/bin/env node

/**
 * Script para crear test suites de CTB con suite_key únicos
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Función para generar suite_key único
function generateSuiteKey(name, projectId) {
  const hash = crypto.createHash('md5')
    .update(`${name}-${projectId}`)
    .digest('hex')
    .substring(0, 8);

  const slug = name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 20);

  return `${slug}-${hash}`;
}

console.log('\n🚀 CREANDO TEST SUITES PARA CTB');
console.log('='.repeat(70));

async function createCTBTestSuites() {
  try {
    // Obtener usuario admin
    const { data: adminUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', 'hola@stayarta.com')
      .single();

    if (!adminUser) {
      throw new Error('Usuario admin no encontrado');
    }

    console.log(`✅ Admin: ${adminUser.email}\n`);

    // Obtener proyecto CTB
    const { data: ctbProject } = await supabase
      .from('projects')
      .select('id, name')
      .eq('slug', 'ctb')
      .single();

    if (!ctbProject) {
      throw new Error('Proyecto CTB no encontrado');
    }

    console.log(`✅ Proyecto CTB: ${ctbProject.id}\n`);

    const testSuites = [
      {
        name: 'CTB - Home & Landing',
        description: 'Tests de página principal, banner, productos destacados y performance',
        suite_type: 'smoke',
        priority: 'high',
        tags: ['home', 'landing', 'performance', 'a11y']
      },
      {
        name: 'CTB - Autenticación',
        description: 'Tests de login, registro, recuperación de password, logout, MFA',
        suite_type: 'functional',
        priority: 'critical',
        tags: ['auth', 'login', 'register', 'security']
      },
      {
        name: 'CTB - Carrito y Checkout',
        description: 'Tests de carrito, descuentos, checkout, pago y confirmación',
        suite_type: 'e2e',
        priority: 'critical',
        tags: ['cart', 'checkout', 'payment']
      },
      {
        name: 'CTB - Product Listing (PLP)',
        description: 'Tests de listado de productos, filtros, ordenamiento',
        suite_type: 'functional',
        priority: 'high',
        tags: ['plp', 'products', 'filters']
      },
      {
        name: 'CTB - Product Detail (PDP)',
        description: 'Tests de detalle de producto, galería, variantes',
        suite_type: 'functional',
        priority: 'high',
        tags: ['pdp', 'product-detail', 'variants']
      },
      {
        name: 'CTB - Search & Filters',
        description: 'Tests de búsqueda, autocompletado, filtros avanzados',
        suite_type: 'functional',
        priority: 'medium',
        tags: ['search', 'filters', 'autocomplete']
      },
      {
        name: 'CTB - User Profile',
        description: 'Tests de perfil de usuario y configuración',
        suite_type: 'functional',
        priority: 'medium',
        tags: ['profile', 'settings', 'account']
      },
      {
        name: 'CTB - Performance & Accessibility',
        description: 'Tests de performance (Lighthouse) y accesibilidad (WCAG)',
        suite_type: 'non-functional',
        priority: 'high',
        tags: ['performance', 'accessibility', 'wcag']
      },
      {
        name: 'CTB - Security',
        description: 'Tests de seguridad, XSS, CSRF, SQL injection',
        suite_type: 'security',
        priority: 'critical',
        tags: ['security', 'xss', 'csrf']
      },
      {
        name: 'CTB - Newsletter & Footer',
        description: 'Tests de footer y suscripción newsletter',
        suite_type: 'smoke',
        priority: 'low',
        tags: ['footer', 'newsletter']
      }
    ];

    let created = 0;
    let existing = 0;
    let failed = 0;

    console.log('Creando test suites:\n');

    for (const suite of testSuites) {
      const suiteKey = generateSuiteKey(suite.name, ctbProject.id);

      // Verificar si ya existe (por name o suite_key)
      const { data: existingSuite } = await supabase
        .from('test_suites')
        .select('id, name, suite_key')
        .or(`name.eq.${suite.name},suite_key.eq.${suiteKey}`)
        .eq('project_id', ctbProject.id)
        .single();

      if (existingSuite) {
        existing++;
        console.log(`⏭️  ${suite.name}`);
        console.log(`   Ya existe (key: ${existingSuite.suite_key})\n`);
      } else {
        // Crear nueva suite
        const { data, error } = await supabase
          .from('test_suites')
          .insert([{
            ...suite,
            suite_key: suiteKey,
            project_id: ctbProject.id,
            created_by: adminUser.id,
            is_active: true
          }])
          .select()
          .single();

        if (error) {
          failed++;
          console.log(`❌ ${suite.name}`);
          console.log(`   Error: ${error.message}\n`);
        } else {
          created++;
          console.log(`✅ ${suite.name}`);
          console.log(`   Suite Key: ${suiteKey}`);
          console.log(`   ID: ${data.id}\n`);
        }
      }
    }

    // Resumen
    console.log('='.repeat(70));
    console.log('📊 RESUMEN');
    console.log('='.repeat(70));
    console.log(`✅ Creadas:    ${created}`);
    console.log(`⏭️  Existentes: ${existing}`);
    console.log(`❌ Fallidas:   ${failed}`);
    console.log(`📝 Total:      ${created + existing} / ${testSuites.length}`);
    console.log('='.repeat(70));

    // Verificación final
    const { data: allSuites } = await supabase
      .from('test_suites')
      .select('name, suite_key')
      .eq('project_id', ctbProject.id)
      .order('created_at');

    if (allSuites && allSuites.length > 0) {
      console.log('\n📋 Test Suites de CTB:');
      allSuites.forEach((s, i) => {
        console.log(`   ${i + 1}. ${s.name} (${s.suite_key})`);
      });
    }

    console.log('');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    throw error;
  }
}

createCTBTestSuites()
  .then(() => {
    console.log('✅ Script completado\n');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Script fallido\n');
    process.exit(1);
  });
