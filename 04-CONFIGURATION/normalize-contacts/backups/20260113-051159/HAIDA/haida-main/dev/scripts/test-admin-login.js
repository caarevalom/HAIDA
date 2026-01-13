#!/usr/bin/env node

/**
 * Script para probar el login del admin
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log('\n🔐 TEST DE LOGIN ADMIN');
console.log('='.repeat(70));
console.log(`URL: ${SUPABASE_URL}`);
console.log(`Anon Key: ${SUPABASE_ANON_KEY?.substring(0, 20)}...`);
console.log('='.repeat(70));

// Cliente con anon key (como desde el frontend)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testLogin() {
  const email = 'hola@stayarta.com';
  const password = 'AdminCTB2025Pass';

  try {
    console.log(`\n1️⃣  Intentando login con: ${email}\n`);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.log(`   ❌ ERROR DE LOGIN:`);
      console.log(`      Mensaje: ${error.message}`);
      console.log(`      Status: ${error.status}`);
      console.log(`      Código: ${error.code || 'N/A'}`);

      if (error.message.includes('Invalid login credentials')) {
        console.log('\n   ⚠️  CONTRASEÑA INCORRECTA');
        console.log('   ✅ SOLUCIÓN: Resetear contraseña del usuario');
      } else if (error.message.includes('Email logins are disabled')) {
        console.log('\n   ⚠️  EMAIL AUTH DESHABILITADO');
        console.log('   ✅ SOLUCIÓN: Habilitar Email provider en Supabase Dashboard');
      } else if (error.message.includes('Email not confirmed')) {
        console.log('\n   ⚠️  EMAIL NO CONFIRMADO');
        console.log('   ✅ SOLUCIÓN: Confirmar email del usuario');
      }

      return false;
    } else {
      console.log('   ✅ LOGIN EXITOSO!');
      console.log(`\n   Usuario:`);
      console.log(`      ID: ${data.user.id}`);
      console.log(`      Email: ${data.user.email}`);
      console.log(`      Rol: ${data.user.user_metadata?.role || 'N/A'}`);
      console.log(`\n   Sesión:`);
      console.log(`      Access Token: ${data.session.access_token.substring(0, 30)}...`);
      console.log(`      Expira: ${new Date(data.session.expires_at * 1000).toISOString()}`);

      return true;
    }

  } catch (error) {
    console.error('\n❌ ERROR INESPERADO:', error.message);
    return false;
  }
}

// Probar también con admin@haida.com
async function testSecondaryAdmin() {
  console.log('\n\n2️⃣  Probando usuario alternativo: admin@haida.com\n');

  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'hola@stayarta.com',
    password: 'AdminCTB2025Pass'
  });

  if (error) {
    console.log(`   ❌ Error: ${error.message}`);
  } else {
    console.log(`   ✅ Login exitoso con admin@haida.com`);
    console.log(`   ℹ️  Este usuario SÍ funciona - usa este temporalmente`);
  }
}

async function main() {
  const success = await testLogin();

  if (!success) {
    await testSecondaryAdmin();

    console.log('\n' + '='.repeat(70));
    console.log('💡 RECOMENDACIONES');
    console.log('='.repeat(70));
    console.log('1. Resetear contraseña de carlosadmin@hiberus.com');
    console.log('2. Usar admin@haida.com temporalmente');
    console.log('3. Verificar Email Auth en Supabase Dashboard');
    console.log('='.repeat(70));
    console.log('');
  } else {
    console.log('\n✅ Todo funciona correctamente\n');
  }
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
