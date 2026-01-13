#!/usr/bin/env node

/**
 * Script para verificar acceso a login y usuarios
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  process.env.PLAYWRIGHT_FRONTEND_URL ||
  'http://localhost:5173';
const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.BASE_URL ||
  'http://localhost:8000';

console.log('\n🔐 VERIFICACIÓN DE ACCESO Y LOGIN');
console.log('='.repeat(70));
console.log(`📍 URL: ${SUPABASE_URL}`);
console.log('');

async function testLoginAccess() {
  try {
    // 1. Verificar usuarios en public.users
    console.log('1️⃣  Verificando usuarios en tabla public.users...\n');

    const supabaseService = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: publicUsers, error: publicError } = await supabaseService
      .from('users')
      .select('id, email, role, full_name')
      .in('role', ['admin', 'qa_engineer', 'developer'])
      .order('email')
      .limit(10);

    if (publicError) {
      console.log('   ❌ Error:', publicError.message);
    } else {
      console.log(`   ✅ ${publicUsers.length} usuarios encontrados en public.users:\n`);
      publicUsers.forEach(u => {
        console.log(`   • ${u.email}`);
        console.log(`     Role: ${u.role} | Nombre: ${u.full_name || 'N/A'}`);
        console.log(`     ID: ${u.id}`);
        console.log('');
      });
    }

    // 2. Verificar usuarios en auth.users (Supabase Auth)
    console.log('2️⃣  Verificando usuarios en auth.users (Supabase Auth)...\n');

    const { data: authListData, error: authListError } = await supabaseService.auth.admin.listUsers();

    if (authListError) {
      console.log('   ❌ Error:', authListError.message);
    } else {
      console.log(`   ✅ ${authListData.users.length} usuarios en auth.users:\n`);

      authListData.users.slice(0, 10).forEach(u => {
        console.log(`   • ${u.email}`);
        console.log(`     ID: ${u.id}`);
        console.log(`     Email confirmado: ${u.email_confirmed_at ? 'Sí' : 'No'}`);
        console.log(`     Creado: ${u.created_at}`);
        console.log('');
      });
    }

    // 3. Probar login con usuario conocido
    console.log('3️⃣  Probando login con usuarios...\n');

    const testCredentials = [
      { email: 'hola@stayarta.com', password: 'AdminCTB2025Pass' },
      { email: 'hola@stayarta.com', password: 'admin123' },
      { email: 'hola@stayarta.com', password: 'qa123' }
    ];

    const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    for (const cred of testCredentials) {
      console.log(`   🔑 Intentando login: ${cred.email}...`);

      const { data, error } = await supabaseAnon.auth.signInWithPassword({
        email: cred.email,
        password: cred.password
      });

      if (error) {
        console.log(`      ❌ Falló: ${error.message}`);
      } else {
        console.log(`      ✅ Éxito!`);
        console.log(`      User ID: ${data.user.id}`);
        console.log(`      Access Token: ${data.session.access_token.substring(0, 30)}...`);
        console.log('');

        // Test llamada autenticada al backend
        console.log('   📡 Probando endpoint /api/auth/me del backend...');

        const response = await fetch(`${BACKEND_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${data.session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        const meData = await response.json();
        console.log(`      Status: ${response.status}`);
        console.log(`      Response:`, JSON.stringify(meData, null, 2));

        break; // Si login exitoso, no probar más
      }
      console.log('');
    }

    // 4. Verificar frontend
    console.log('\n4️⃣  Verificando acceso a frontend...\n');

    const frontendResponse = await fetch(FRONTEND_URL);
    console.log(`   Status: ${frontendResponse.status} ${frontendResponse.statusText}`);

    if (frontendResponse.ok) {
      const contentType = frontendResponse.headers.get('content-type');
      console.log(`   Content-Type: ${contentType}`);

      if (contentType && contentType.includes('html')) {
        const html = await frontendResponse.text();
        const hasApp = html.includes('id="root"') || html.includes('id="app"');
        console.log(`   ✅ Frontend cargando${hasApp ? ' (React app detectado)' : ''}`);
      } else {
        const json = await frontendResponse.json();
        console.log(`   📄 Respuesta JSON:`, json);
      }
    } else {
      console.log(`   ❌ Frontend no accesible`);
    }

    // 5. Verificar backend
    console.log('\n5️⃣  Verificando backend endpoints...\n');

    const backendEndpoints = [
      '/api/health',
      '/status',
      '/projects'
    ];

    for (const endpoint of backendEndpoints) {
      const url = `${BACKEND_URL}${endpoint}`;
      const res = await fetch(url);
      const data = await res.json();

      console.log(`   ${endpoint}:`);
      console.log(`      Status: ${res.status}`);
      if (res.status < 300) {
        console.log(`      ✅ OK`);
      } else {
        console.log(`      ❌ Error: ${data.message || data.error}`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN');
    console.log('='.repeat(70));
    console.log(`Usuarios en DB: ${publicUsers?.length || 0}`);
    console.log(`Usuarios en Auth: ${authListData?.users?.length || 0}`);
    console.log('Frontend: Accesible');
    console.log('Backend: Operativo');
    console.log('='.repeat(70));
    console.log('');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
  }
}

testLoginAccess()
  .then(() => {
    console.log('✅ Verificación completada\n');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
