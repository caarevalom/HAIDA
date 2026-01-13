#!/usr/bin/env node

/**
 * Script para limpiar usuarios de test en public.users
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🧹 LIMPIEZA DE public.users');
console.log('='.repeat(70));

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Usuarios a mantener (producción)
const KEEP_EMAILS = [
  'carlosadmin@hiberus.com',
  'admin@haida.com',
  'qa@haida.com',
  'dev@haida.com',
  'caarevalo@hiberus.com',
  'fnozar@hiberus.com',
  'copimiga@gmail.com'
];

async function cleanupPublicUsers() {
  try {
    // 1. Listar todos los usuarios de public.users
    console.log('\n1️⃣  Listando usuarios en public.users...\n');

    const { data: allUsers, error: listError } = await supabase
      .from('users')
      .select('id, email, role, full_name, created_at')
      .order('email');

    if (listError) {
      throw new Error(`Error listando usuarios: ${listError.message}`);
    }

    console.log(`   Total usuarios: ${allUsers.length}\n`);

    // 2. Identificar usuarios de test
    const testUsers = allUsers.filter(u => {
      const email = u.email?.toLowerCase() || '';
      return (
        email.includes('haida-login-test') ||
        email.includes('haida-self-test') ||
        email.includes('haida-sync-test') ||
        email.includes('haida-duplicate-test') ||
        email.includes('haida-rls-check') ||
        email.includes('haida-ui-test') ||
        email.includes('regression-') ||
        email.includes('test-') ||
        email.includes('@haida-test.com') ||
        email.includes('trigger-test') ||
        email.includes('unique-') ||
        email.includes('nuevo-usuario-test') ||
        email.includes('test-post-rls-fix') ||
        email.includes('final-test-user')
      ) && !KEEP_EMAILS.includes(email);
    });

    const prodUsers = allUsers.filter(u => {
      const email = u.email?.toLowerCase() || '';
      return KEEP_EMAILS.includes(email);
    });

    const realUsers = allUsers.filter(u => {
      const email = u.email?.toLowerCase() || '';
      return !KEEP_EMAILS.includes(email) &&
             !testUsers.map(tu => tu.email?.toLowerCase()).includes(email);
    });

    console.log('📊 Clasificación:');
    console.log(`   ✅ Usuarios de producción (mantener): ${prodUsers.length}`);
    console.log(`   👥 Usuarios reales (mantener): ${realUsers.length}`);
    console.log(`   🧪 Usuarios de test (eliminar): ${testUsers.length}\n`);

    // 3. Mostrar usuarios a mantener
    console.log('✅ Usuarios a mantener:\n');
    [...prodUsers, ...realUsers].forEach(u => {
      console.log(`   • ${u.email}`);
      console.log(`     Role: ${u.role} | Nombre: ${u.full_name || 'N/A'}\n`);
    });

    // 4. Mostrar usuarios de test
    if (testUsers.length > 0) {
      console.log(`🧪 Usuarios de test (${testUsers.length} a eliminar):\n`);
      testUsers.slice(0, 15).forEach(u => {
        console.log(`   • ${u.email}`);
      });
      if (testUsers.length > 15) {
        console.log(`   ... y ${testUsers.length - 15} más\n`);
      }
      console.log('');
    }

    // 5. Confirmar eliminación
    if (testUsers.length === 0) {
      console.log('✅ No hay usuarios de test para eliminar.\n');
      return;
    }

    console.log('⚠️  Eliminando usuarios de test...\n');

    // 6. Eliminar usuarios de test
    const testIds = testUsers.map(u => u.id);

    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .in('id', testIds);

    if (deleteError) {
      throw new Error(`Error eliminando usuarios: ${deleteError.message}`);
    }

    console.log(`✅ ${testUsers.length} usuarios de test eliminados\n`);

    // 7. Verificar usuarios restantes
    const { data: remainingUsers, error: remainingError } = await supabase
      .from('users')
      .select('id, email, role, full_name')
      .order('email');

    if (remainingError) {
      throw new Error(`Error verificando usuarios: ${remainingError.message}`);
    }

    // 8. Resumen
    console.log('='.repeat(70));
    console.log('📊 RESUMEN DE LIMPIEZA');
    console.log('='.repeat(70));
    console.log(`✅ Usuarios eliminados: ${testUsers.length}`);
    console.log(`📝 Usuarios restantes: ${remainingUsers.length}`);
    console.log('='.repeat(70));

    console.log('\n✅ Usuarios finales en public.users:\n');
    remainingUsers.forEach(u => {
      console.log(`   • ${u.email}`);
      console.log(`     Role: ${u.role} | Nombre: ${u.full_name || 'N/A'}\n`);
    });

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    throw error;
  }
}

cleanupPublicUsers()
  .then(() => {
    console.log('✅ Limpieza de public.users completada\n');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
