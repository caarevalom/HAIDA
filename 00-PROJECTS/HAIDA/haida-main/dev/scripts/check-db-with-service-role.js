#!/usr/bin/env node

/**
 * Script para verificar DB usando Service Role Key (bypass RLS)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

// Cliente con service role (bypass RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkWithServiceRole() {
  console.log('\n🔍 VERIFICACIÓN CON SERVICE ROLE (BYPASS RLS)');
  console.log('='.repeat(60));

  // Proyectos
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, name, slug, status, owner_id')
    .order('created_at', { ascending: false });

  console.log('\n📊 PROYECTOS:');
  if (projectsError) {
    console.log('   ❌ Error:', projectsError.message);
  } else {
    console.log(`   Total: ${projects?.length || 0}`);
    if (projects && projects.length > 0) {
      projects.forEach(p => {
        console.log(`   • ${p.name} (${p.slug}) - ${p.status}`);
        console.log(`     ID: ${p.id}`);
        console.log(`     Owner: ${p.owner_id}`);
      });
    }
  }

  // Test Suites
  const { data: suites, error: suitesError } = await supabase
    .from('test_suites')
    .select('id, name, project_id, suite_type')
    .order('created_at', { ascending: false });

  console.log('\n📋 TEST SUITES:');
  if (suitesError) {
    console.log('   ❌ Error:', suitesError.message);
  } else {
    console.log(`   Total: ${suites?.length || 0}`);
    if (suites && suites.length > 0) {
      suites.forEach(s => {
        console.log(`   • ${s.name} (${s.suite_type})`);
        console.log(`     Project ID: ${s.project_id}`);
      });
    }
  }

  console.log('\n' + '='.repeat(60));
}

checkWithServiceRole()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
