#!/usr/bin/env node

/**
 * Script para diagnosticar el problema de login del admin
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🔍 DIAGNÓSTICO DE LOGIN ADMIN');
console.log('='.repeat(70));

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function diagnoseAdminLogin() {
  const adminEmail = 'carlosadmin@hiberus.com';

  try {
    console.log(`\n1️⃣  Verificando usuario en public.users: ${adminEmail}\n`);

    // Verificar en public.users
    const { data: publicUser, error: publicError } = await supabase
      .from('users')
      .select('*')
      .eq('email', adminEmail)
      .single();

    if (publicError) {
      console.log(`   ❌ Error en public.users: ${publicError.message}`);
      if (publicError.code === 'PGRST116') {
        console.log('   ⚠️  Usuario NO encontrado en public.users');
      }
    } else {
      console.log('   ✅ Usuario encontrado en public.users:');
      console.log(`      ID: ${publicUser.id}`);
      console.log(`      Email: ${publicUser.email}`);
      console.log(`      Rol: ${publicUser.role}`);
      console.log(`      Nombre: ${publicUser.full_name}`);
      console.log(`      Activo: ${publicUser.is_active ? '✅ Sí' : '❌ No'}`);
      console.log(`      Creado: ${publicUser.created_at}`);
    }

    console.log('\n2️⃣  Verificando usuario en auth.users...\n');

    // Verificar en auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.log(`   ❌ Error listando usuarios de auth: ${authError.message}`);
    } else {
      const authUser = authData.users.find(u => u.email?.toLowerCase() === adminEmail.toLowerCase());

      if (!authUser) {
        console.log('   ❌ Usuario NO encontrado en auth.users');
        console.log('   ⚠️  EL USUARIO FUE ELIMINADO - Necesita ser recreado');
      } else {
        console.log('   ✅ Usuario encontrado en auth.users:');
        console.log(`      ID: ${authUser.id}`);
        console.log(`      Email: ${authUser.email}`);
        console.log(`      Email confirmado: ${authUser.email_confirmed_at ? '✅ Sí' : '❌ No'}`);
        console.log(`      Creado: ${authUser.created_at}`);
        console.log(`      Última vez activo: ${authUser.last_sign_in_at || 'Nunca'}`);

        // Verificar metadata
        if (authUser.user_metadata) {
          console.log(`      Metadata:`);
          console.log(`         Nombre: ${authUser.user_metadata.full_name || 'N/A'}`);
          console.log(`         Rol: ${authUser.user_metadata.role || 'N/A'}`);
        }
      }
    }

    console.log('\n3️⃣  Verificando configuración de Email Auth...\n');

    // Probar login con service role
    console.log('   Intentando login de prueba (sin contraseña)...');

    // No podemos probar el login real porque no tenemos la contraseña,
    // pero podemos verificar que el endpoint de auth esté funcionando
    console.log('   ℹ️  Para probar login real, usa el navegador o Postman');

    console.log('\n4️⃣  Verificando otros usuarios admin...\n');

    // Listar todos los admins
    const { data: admins, error: adminsError } = await supabase
      .from('users')
      .select('email, role, is_active')
      .eq('role', 'admin');

    if (adminsError) {
      console.log(`   ❌ Error: ${adminsError.message}`);
    } else {
      console.log(`   Total admins en public.users: ${admins.length}\n`);
      admins.forEach(admin => {
        const status = admin.is_active ? '✅' : '❌';
        console.log(`   ${status} ${admin.email} (activo: ${admin.is_active})`);
      });
    }

    // Resumen
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN DEL DIAGNÓSTICO');
    console.log('='.repeat(70));

    if (!publicUser && !authData?.users.find(u => u.email === adminEmail)) {
      console.log('❌ PROBLEMA: Usuario no existe en ninguna tabla');
      console.log('✅ SOLUCIÓN: Crear usuario con script create-admin.js');
    } else if (publicUser && !authData?.users.find(u => u.email === adminEmail)) {
      console.log('❌ PROBLEMA: Usuario existe en public.users pero NO en auth.users');
      console.log('✅ SOLUCIÓN: Eliminar de public.users y recrear completo');
    } else if (!publicUser && authData?.users.find(u => u.email === adminEmail)) {
      console.log('❌ PROBLEMA: Usuario existe en auth.users pero NO en public.users');
      console.log('✅ SOLUCIÓN: Trigger no funcionó, crear manualmente en public.users');
    } else if (publicUser && !publicUser.is_active) {
      console.log('❌ PROBLEMA: Usuario existe pero está desactivado');
      console.log('✅ SOLUCIÓN: Activar usuario con UPDATE users SET is_active = true');
    } else {
      console.log('⚠️  Usuario parece correcto en BD');
      console.log('✅ POSIBLES CAUSAS:');
      console.log('   1. Contraseña incorrecta');
      console.log('   2. Email Auth deshabilitado en Supabase');
      console.log('   3. Problema con el frontend');
    }

    console.log('='.repeat(70));
    console.log('');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    throw error;
  }
}

diagnoseAdminLogin()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error fatal:', err.message);
    process.exit(1);
  });
