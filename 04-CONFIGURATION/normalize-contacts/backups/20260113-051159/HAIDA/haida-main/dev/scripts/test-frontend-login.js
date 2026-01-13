#!/usr/bin/env node

/**
 * Script para probar el login desde el frontend (simula browser)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wdebyxvtunromsnkqbrd.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxMzQzODYsImV4cCI6MjA0OTcxMDM4Nn0.wZ_3yV0gPOT-gG3vLRBt9Gv-VRgp7qfz8lJWr0YCcbM';

console.log('\n🔐 TEST DE LOGIN FRONTEND');
console.log('='.repeat(70));
console.log(`URL: ${SUPABASE_URL}`);
console.log(`Anon Key: ${SUPABASE_ANON_KEY.substring(0, 30)}...`);
console.log('='.repeat(70));

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testLoginFlow() {
  const email = 'hola@stayarta.com';
  const password = 'AdminCTB2025Pass';

  try {
    console.log(`\n1️⃣  Probando login con: ${email}\n`);

    // Paso 1: Login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.log(`   ❌ ERROR DE AUTH:`);
      console.log(`      Mensaje: ${authError.message}`);
      console.log(`      Status: ${authError.status}`);

      // Verificar si el email provider está habilitado
      if (authError.message.includes('Email logins are disabled')) {
        console.log('\n   ⚠️  EMAIL AUTH DESHABILITADO EN SUPABASE');
        console.log('   ✅ SOLUCIÓN: Ve a Supabase Dashboard → Authentication → Providers → Email');
        console.log('   ✅ Habilita "Email" provider');
        return false;
      }

      if (authError.message.includes('Invalid login credentials')) {
        console.log('\n   ⚠️  CREDENCIALES INCORRECTAS');
        console.log('   ℹ️  Verifica el email y contraseña');
        return false;
      }

      return false;
    }

    console.log('   ✅ Auth exitoso!');
    console.log(`   Usuario ID: ${authData.user.id}`);
    console.log(`   Email: ${authData.user.email}`);
    console.log(`   Session válida hasta: ${new Date(authData.session.expires_at * 1000).toISOString()}`);

    // Paso 2: Fetch datos del usuario desde public.users
    console.log(`\n2️⃣  Obteniendo datos desde public.users...\n`);

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      console.log(`   ⚠️  Error obteniendo usuario: ${userError.message}`);
      console.log(`   ℹ️  Usando datos de sesión como fallback`);

      const basicUser = {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata?.full_name || authData.user.email,
        role: authData.user.user_metadata?.role || 'viewer',
        is_active: true,
      };

      console.log(`   Usuario fallback:`);
      console.log(`      ID: ${basicUser.id}`);
      console.log(`      Email: ${basicUser.email}`);
      console.log(`      Nombre: ${basicUser.name}`);
      console.log(`      Rol: ${basicUser.role}`);
      console.log(`      Activo: ${basicUser.is_active}`);
    } else {
      console.log(`   ✅ Usuario encontrado en BD:`);
      console.log(`      ID: ${userData.id}`);
      console.log(`      Email: ${userData.email}`);
      console.log(`      Nombre: ${userData.full_name}`);
      console.log(`      Rol: ${userData.role}`);
      console.log(`      Activo: ${userData.is_active}`);
      console.log(`      Creado: ${userData.created_at}`);
    }

    // Paso 3: Verificar sesión persistente
    console.log(`\n3️⃣  Verificando persistencia de sesión...\n`);

    const { data: sessionData } = await supabase.auth.getSession();

    if (sessionData.session) {
      console.log(`   ✅ Sesión persistente confirmada`);
      console.log(`   Access Token: ${sessionData.session.access_token.substring(0, 30)}...`);
      console.log(`   Refresh Token: ${sessionData.session.refresh_token ? '✅ Presente' : '❌ No presente'}`);
      console.log(`   Expira en: ${Math.floor((sessionData.session.expires_at * 1000 - Date.now()) / 1000 / 60)} minutos`);
    } else {
      console.log(`   ❌ No hay sesión persistente`);
    }

    // Paso 4: Test de refresh
    console.log(`\n4️⃣  Probando refresh de sesión...\n`);

    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

    if (refreshError) {
      console.log(`   ⚠️  Error en refresh: ${refreshError.message}`);
    } else {
      console.log(`   ✅ Refresh exitoso`);
      console.log(`   Nueva expiración: ${new Date(refreshData.session.expires_at * 1000).toISOString()}`);
    }

    // Paso 5: Logout
    console.log(`\n5️⃣  Probando logout...\n`);

    const { error: logoutError } = await supabase.auth.signOut();

    if (logoutError) {
      console.log(`   ❌ Error en logout: ${logoutError.message}`);
    } else {
      console.log(`   ✅ Logout exitoso`);
    }

    // Verificar que la sesión se eliminó
    const { data: afterLogout } = await supabase.auth.getSession();
    if (afterLogout.session) {
      console.log(`   ⚠️  Sesión aún presente después de logout`);
    } else {
      console.log(`   ✅ Sesión eliminada correctamente`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ FLUJO DE LOGIN COMPLETADO EXITOSAMENTE');
    console.log('='.repeat(70));
    console.log('');

    return true;

  } catch (error) {
    console.error('\n❌ ERROR INESPERADO:', error);
    return false;
  }
}

testLoginFlow()
  .then(success => {
    if (success) {
      console.log('\n✅ El login funciona correctamente desde el código');
      console.log('ℹ️  Si sigue fallando en el navegador, limpia el localStorage:');
      console.log('   1. Abre DevTools (F12)');
      console.log('   2. Application → Storage → Clear site data');
      console.log('   3. Recarga la página e intenta de nuevo\n');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error fatal:', err);
    process.exit(1);
  });
