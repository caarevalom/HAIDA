#!/usr/bin/env node

/**
 * Script para limpiar usuarios de test de Supabase
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🧹 LIMPIEZA DE USUARIOS DE TEST');
console.log('='.repeat(70));

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Usuarios a mantener (producción)
const KEEP_USERS = [
  'carlosadmin@hiberus.com',
  'admin@haida.com',
  'qa@haida.com',
  'dev@haida.com',
  'caarevalo@hiberus.com',
  'fnozar@hiberus.com'
];

async function cleanupTestUsers() {
  try {
    // 1. Listar todos los usuarios de auth.users
    console.log('\n1️⃣  Listando usuarios en auth.users...\n');

    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      throw new Error(`Error listando usuarios: ${authError.message}`);
    }

    console.log(`   Total usuarios: ${authUsers.users.length}\n`);

    // 2. Identificar usuarios de test
    const testUsers = authUsers.users.filter(u => {
      const email = u.email?.toLowerCase() || '';
      return (
        email.includes('sanity_') ||
        email.includes('test-') ||
        email.includes('haida-self-test') ||
        email.includes('@example.com') ||
        email.includes('testprod@')
      ) && !KEEP_USERS.includes(email);
    });

    const prodUsers = authUsers.users.filter(u => {
      const email = u.email?.toLowerCase() || '';
      return KEEP_USERS.includes(email);
    });

    console.log('📊 Clasificación:');
    console.log(`   ✅ Usuarios de producción: ${prodUsers.length}`);
    console.log(`   🧪 Usuarios de test: ${testUsers.length}\n`);

    // 3. Mostrar usuarios de producción
    if (prodUsers.length > 0) {
      console.log('✅ Usuarios de producción (se mantienen):\n');
      prodUsers.forEach(u => {
        console.log(`   • ${u.email}`);
        console.log(`     ID: ${u.id}`);
        console.log(`     Creado: ${u.created_at}\n`);
      });
    }

    // 4. Mostrar usuarios de test
    if (testUsers.length > 0) {
      console.log(`🧪 Usuarios de test (${testUsers.length} a eliminar):\n`);
      testUsers.slice(0, 10).forEach(u => {
        console.log(`   • ${u.email}`);
      });
      if (testUsers.length > 10) {
        console.log(`   ... y ${testUsers.length - 10} más\n`);
      }
      console.log('');
    }

    // 5. Confirmar eliminación
    if (testUsers.length === 0) {
      console.log('✅ No hay usuarios de test para eliminar.\n');
      return;
    }

    console.log('⚠️  ¿Deseas continuar con la eliminación? (auto-ejecutando...)\n');

    // 6. Eliminar usuarios de test
    let deleted = 0;
    let failed = 0;

    console.log('🗑️  Eliminando usuarios de test...\n');

    for (const user of testUsers) {
      try {
        // Eliminar de auth.users
        const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(user.id);

        if (deleteAuthError) {
          console.log(`   ❌ ${user.email}: ${deleteAuthError.message}`);
          failed++;
        } else {
          // Eliminar de public.users si existe
          await supabase
            .from('users')
            .delete()
            .eq('id', user.id);

          console.log(`   ✅ ${user.email}`);
          deleted++;
        }
      } catch (err) {
        console.log(`   ❌ ${user.email}: ${err.message}`);
        failed++;
      }
    }

    // 7. Resumen
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN DE LIMPIEZA');
    console.log('='.repeat(70));
    console.log(`✅ Usuarios eliminados: ${deleted}`);
    console.log(`❌ Fallos: ${failed}`);
    console.log(`📝 Usuarios restantes: ${prodUsers.length}`);
    console.log('='.repeat(70));

    // 8. Verificar usuarios restantes
    console.log('\n🔍 Verificando usuarios restantes en public.users...\n');

    const { data: remainingUsers, error: remainingError } = await supabase
      .from('users')
      .select('id, email, role, full_name')
      .order('email');

    if (!remainingError && remainingUsers) {
      console.log(`✅ ${remainingUsers.length} usuarios en public.users:\n`);
      remainingUsers.forEach(u => {
        console.log(`   • ${u.email}`);
        console.log(`     Role: ${u.role} | Nombre: ${u.full_name || 'N/A'}`);
        console.log('');
      });
    }

    console.log('');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    throw error;
  }
}

cleanupTestUsers()
  .then(() => {
    console.log('✅ Limpieza completada\n');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
