#!/usr/bin/env node

/**
 * Script para ejecutar setup SQL completo usando Service Role Key
 * Este script tiene permisos administrativos completos
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://wdebyxvtunromsnkqbrd.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY no encontrado en .env');
  process.exit(1);
}

// Crear cliente con service role (admin)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('\n🚀 EJECUTANDO SETUP COMPLETO DE BASE DE DATOS');
console.log('='.repeat(60));
console.log(`📍 URL: ${SUPABASE_URL}`);
console.log(`🔑 Service Role Key: ${SUPABASE_SERVICE_ROLE_KEY.substring(0, 30)}...`);
console.log('='.repeat(60));
console.log('');

async function executeSetupSQL() {
  try {
    // Paso 1: Buscar usuario admin
    console.log('1️⃣  Buscando usuario admin (carlosadmin@hiberus.com)...');

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', 'hola@stayarta.com');

    if (usersError) {
      console.error('   ❌ Error buscando usuario:', usersError.message);
      throw usersError;
    }

    if (!users || users.length === 0) {
      console.error('   ❌ Usuario carlosadmin@hiberus.com no encontrado');
      console.log('\n   💡 Crear el usuario primero con:');
      console.log('      Email: hola@stayarta.com');
      console.log('      Password: AdminCTB2025Pass');
      console.log('      Role: admin');
      throw new Error('Usuario no encontrado');
    }

    const userId = users[0].id;
    console.log(`   ✅ Usuario encontrado: ${users[0].email} (${users[0].role})`);
    console.log(`   ID: ${userId}`);

    // Paso 2: Crear proyecto CTB
    console.log('\n2️⃣  Creando proyecto CTB...');

    const ctbProject = {
      name: 'CTB',
      slug: 'ctb',
      description: 'Proyecto CTB - Sistema de gestión y testing automatizado',
      base_url: 'https://mcprod.thisisbarcelona.com',
      repository_url: 'https://github.com/hiberus/ctb',
      status: 'active',
      owner_id: userId,
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
    };

    // Verificar si existe
    const { data: existingCTB } = await supabase
      .from('projects')
      .select('id, name')
      .eq('slug', 'ctb')
      .single();

    let ctbProjectId;

    if (existingCTB) {
      console.log(`   📝 Proyecto CTB ya existe (ID: ${existingCTB.id})`);

      // Actualizar
      const { data: updatedCTB, error: updateError } = await supabase
        .from('projects')
        .update(ctbProject)
        .eq('slug', 'ctb')
        .select()
        .single();

      if (updateError) {
        console.error('   ❌ Error actualizando:', updateError.message);
        throw updateError;
      }

      ctbProjectId = updatedCTB.id;
      console.log(`   ✅ Proyecto CTB actualizado`);
    } else {
      // Crear nuevo
      const { data: newCTB, error: insertError } = await supabase
        .from('projects')
        .insert([ctbProject])
        .select()
        .single();

      if (insertError) {
        console.error('   ❌ Error creando:', insertError.message);
        throw insertError;
      }

      ctbProjectId = newCTB.id;
      console.log(`   ✅ Proyecto CTB creado (ID: ${ctbProjectId})`);
    }

    // Paso 3: Crear proyecto Privalia
    console.log('\n3️⃣  Creando proyecto Privalia...');

    const privaliaProject = {
      name: 'Privalia',
      slug: 'privalia',
      description: 'Proyecto Privalia - E-commerce y testing automatizado',
      base_url: 'https://privalia.example.com',
      repository_url: 'https://github.com/hiberus/privalia',
      status: 'active',
      owner_id: userId,
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
    };

    const { data: existingPrivalia } = await supabase
      .from('projects')
      .select('id, name')
      .eq('slug', 'privalia')
      .single();

    let privaliaProjectId;

    if (existingPrivalia) {
      console.log(`   📝 Proyecto Privalia ya existe (ID: ${existingPrivalia.id})`);

      const { data: updatedPrivalia, error: updateError } = await supabase
        .from('projects')
        .update(privaliaProject)
        .eq('slug', 'privalia')
        .select()
        .single();

      if (updateError) {
        console.error('   ❌ Error actualizando:', updateError.message);
        throw updateError;
      }

      privaliaProjectId = updatedPrivalia.id;
      console.log(`   ✅ Proyecto Privalia actualizado`);
    } else {
      const { data: newPrivalia, error: insertError } = await supabase
        .from('projects')
        .insert([privaliaProject])
        .select()
        .single();

      if (insertError) {
        console.error('   ❌ Error creando:', insertError.message);
        throw insertError;
      }

      privaliaProjectId = newPrivalia.id;
      console.log(`   ✅ Proyecto Privalia creado (ID: ${privaliaProjectId})`);
    }

    // Paso 4: Crear Test Suites para CTB
    console.log('\n4️⃣  Creando test suites para CTB...');

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
      },
      {
        name: 'CTB - PLP (Product Listing Page)',
        description: 'Tests de listado de productos, filtros, ordenamiento y paginación',
        suite_type: 'functional',
        priority: 'high',
        tags: ['plp', 'products', 'filters', 'search'],
        metadata: { component: 'PLP', module: 'ProductListing', test_count: 20 }
      },
      {
        name: 'CTB - PDP (Product Detail Page)',
        description: 'Tests de detalle de producto, galería, variantes, add to cart',
        suite_type: 'functional',
        priority: 'high',
        tags: ['pdp', 'product-detail', 'variants', 'gallery'],
        metadata: { component: 'PDP', module: 'ProductDetail', test_count: 18 }
      },
      {
        name: 'CTB - Search & Filters',
        description: 'Tests de búsqueda, autocompletado, filtros avanzados y sugerencias',
        suite_type: 'functional',
        priority: 'medium',
        tags: ['search', 'filters', 'autocomplete'],
        metadata: { component: 'Search', module: 'SearchEngine', test_count: 22 }
      },
      {
        name: 'CTB - User Profile & Settings',
        description: 'Tests de perfil de usuario, configuración, preferencias y datos personales',
        suite_type: 'functional',
        priority: 'medium',
        tags: ['profile', 'settings', 'preferences', 'account'],
        metadata: { component: 'Profile', module: 'UserSettings', test_count: 25 }
      },
      {
        name: 'CTB - Footer & Newsletter',
        description: 'Tests de footer, suscripción newsletter y links institucionales',
        suite_type: 'smoke',
        priority: 'low',
        tags: ['footer', 'newsletter', 'links'],
        metadata: { component: 'Footer', module: 'Newsletter', test_count: 8 }
      },
      {
        name: 'CTB - Performance & Accessibility',
        description: 'Tests de performance (Lighthouse), accesibilidad (WCAG 2.1 AA) y SEO',
        suite_type: 'non-functional',
        priority: 'high',
        tags: ['performance', 'accessibility', 'seo', 'wcag'],
        metadata: { component: 'Platform', module: 'Performance', test_count: 15 }
      },
      {
        name: 'CTB - Security & Data Validation',
        description: 'Tests de seguridad, validación de datos, XSS, CSRF, SQL injection',
        suite_type: 'security',
        priority: 'critical',
        tags: ['security', 'validation', 'xss', 'csrf', 'sql-injection'],
        metadata: { component: 'Platform', module: 'Security', test_count: 30 }
      }
    ];

    let created = 0;
    let updated = 0;

    for (const suite of testSuites) {
      const suiteWithProject = {
        ...suite,
        project_id: ctbProjectId
      };

      // Verificar si existe
      const { data: existing } = await supabase
        .from('test_suites')
        .select('id')
        .eq('project_id', ctbProjectId)
        .eq('name', suite.name)
        .single();

      if (existing) {
        // Actualizar
        const { error: updateError } = await supabase
          .from('test_suites')
          .update(suiteWithProject)
          .eq('id', existing.id);

        if (!updateError) {
          updated++;
          console.log(`   📝 ${suite.name} - actualizada`);
        } else {
          console.error(`   ❌ Error actualizando ${suite.name}:`, updateError.message);
        }
      } else {
        // Crear nueva
        const { error: insertError } = await supabase
          .from('test_suites')
          .insert([suiteWithProject]);

        if (!insertError) {
          created++;
          console.log(`   ✅ ${suite.name} - creada`);
        } else {
          console.error(`   ❌ Error creando ${suite.name}:`, insertError.message);
        }
      }
    }

    console.log(`\n   📊 Resumen: ${created} creadas, ${updated} actualizadas`);

    // Paso 5: Verificación final
    console.log('\n5️⃣  Verificación final...');

    const { count: projectsCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    const { count: suitesCount } = await supabase
      .from('test_suites')
      .select('*', { count: 'exact', head: true });

    console.log(`   ✅ Proyectos totales: ${projectsCount}`);
    console.log(`   ✅ Test suites totales: ${suitesCount}`);

    // Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('✅ SETUP COMPLETADO EXITOSAMENTE');
    console.log('='.repeat(60));
    console.log(`Proyectos creados: CTB, Privalia`);
    console.log(`Test suites CTB: ${created + updated} (${created} nuevas, ${updated} actualizadas)`);
    console.log('='.repeat(60));
    console.log('');

    return {
      success: true,
      projects: { ctb: ctbProjectId, privalia: privaliaProjectId },
      suites: { created, updated, total: created + updated }
    };

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.details) console.error('   Details:', error.details);
    if (error.hint) console.error('   Hint:', error.hint);
    throw error;
  }
}

// Ejecutar
executeSetupSQL()
  .then((result) => {
    console.log('\n✅ Script finalizado exitosamente\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script finalizado con errores\n');
    process.exit(1);
  });
