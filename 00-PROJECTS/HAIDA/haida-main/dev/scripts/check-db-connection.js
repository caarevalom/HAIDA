#!/usr/bin/env node

/**
 * Script para verificar conexión con Supabase y estado de la base de datos
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wdebyxvtunromsnkqbrd.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4OTU3NTEsImV4cCI6MjA4MTQ3MTc1MX0._VYypgb2tV9u_4jSAt3sbcFj-drhufB0oN9o3BcgHTs';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkDatabase() {
  console.log('\n🔍 VERIFICACIÓN DE CONEXIÓN CON BASE DE DATOS');
  console.log('='.repeat(60));
  console.log(`\n📍 URL: ${SUPABASE_URL}`);
  console.log(`🔑 Key: ${SUPABASE_ANON_KEY.substring(0, 50)}...`);
  console.log('');

  try {
    // Test 1: Usuarios
    console.log('1️⃣  Verificando tabla users...');
    const { data: users, error: usersError, count: usersCount } = await supabase
      .from('users')
      .select('id, email, role, full_name', { count: 'exact' })
      .limit(10);

    if (usersError) {
      console.log('   ❌ Error:', usersError.message);
      if (usersError.details) console.log('      Details:', usersError.details);
      if (usersError.hint) console.log('      Hint:', usersError.hint);
    } else {
      console.log(`   ✅ Conexión exitosa - ${usersCount} usuarios totales`);
      if (users && users.length > 0) {
        console.log('   \n   👥 Usuarios:');
        users.forEach(u => {
          console.log(`      • ${u.email} - ${u.role} ${u.full_name ? '(' + u.full_name + ')' : ''}`);
        });
      }
    }

    // Test 2: Proyectos
    console.log('\n2️⃣  Verificando tabla projects...');
    const { data: projects, error: projectsError, count: projectsCount } = await supabase
      .from('projects')
      .select('id, name, slug, status', { count: 'exact' })
      .limit(10);

    if (projectsError) {
      console.log('   ❌ Error:', projectsError.message);
    } else {
      console.log(`   ✅ Conexión exitosa - ${projectsCount || 0} proyectos totales`);
      if (projects && projects.length > 0) {
        console.log('   \n   📊 Proyectos:');
        projects.forEach(p => {
          console.log(`      • ${p.name} (${p.slug}) - ${p.status}`);
        });
      } else {
        console.log('   ⚠️  No hay proyectos creados aún');
      }
    }

    // Test 3: Test Suites
    console.log('\n3️⃣  Verificando tabla test_suites...');
    const { data: suites, error: suitesError, count: suitesCount } = await supabase
      .from('test_suites')
      .select('id, name, suite_type, priority', { count: 'exact' })
      .limit(10);

    if (suitesError) {
      console.log('   ❌ Error:', suitesError.message);
    } else {
      console.log(`   ✅ Conexión exitosa - ${suitesCount || 0} test suites totales`);
      if (suites && suites.length > 0) {
        console.log('   \n   📋 Test Suites:');
        suites.forEach(s => {
          console.log(`      • ${s.name} (${s.suite_type}) - ${s.priority}`);
        });
      } else {
        console.log('   ⚠️  No hay test suites creadas aún');
      }
    }

    // Test 4: Test Cases
    console.log('\n4️⃣  Verificando tabla test_cases...');
    const { count: casesCount, error: casesError } = await supabase
      .from('test_cases')
      .select('*', { count: 'exact', head: true });

    if (casesError) {
      console.log('   ❌ Error:', casesError.message);
    } else {
      console.log(`   ✅ ${casesCount || 0} test cases totales`);
    }

    // Test 5: Test Executions
    console.log('\n5️⃣  Verificando tabla test_executions...');
    const { count: executionsCount, error: executionsError } = await supabase
      .from('test_executions')
      .select('*', { count: 'exact', head: true });

    if (executionsError) {
      console.log('   ❌ Error:', executionsError.message);
    } else {
      console.log(`   ✅ ${executionsCount || 0} ejecuciones de tests totales`);
    }

    // Resumen
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE VERIFICACIÓN');
    console.log('='.repeat(60));
    console.log(`✅ Usuarios:          ${usersCount || 0}`);
    console.log(`${projectsCount > 0 ? '✅' : '⚠️ '} Proyectos:         ${projectsCount || 0}`);
    console.log(`${suitesCount > 0 ? '✅' : '⚠️ '} Test Suites:       ${suitesCount || 0}`);
    console.log(`${casesCount > 0 ? '✅' : '⚠️ '} Test Cases:        ${casesCount || 0}`);
    console.log(`✅ Test Executions:   ${executionsCount || 0}`);
    console.log('='.repeat(60));

    if (projectsCount === 0) {
      console.log('\n⚠️  ACCIÓN REQUERIDA:');
      console.log('   Los proyectos CTB y Privalia NO están creados.');
      console.log('   Ejecuta: node scripts/setup-ctb-projects.js');
      console.log('   O ejecuta manualmente: database/setup-ctb-complete.sql en Supabase Dashboard');
    }

    console.log('');

  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkDatabase()
  .then(() => {
    console.log('✅ Verificación completada\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
