#!/usr/bin/env node

/**
 * Script para sincronizar usuario de auth.users a public.users
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wdebyxvtunromsnkqbrd.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTg5NTc1MSwiZXhwIjoyMDUxNDcxNzUxfQ.npg84UxKhEBLVDGxN4S4jPlr-eLEELIu_t7XcvhHfcY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function syncUser() {
  console.log('\n🔄 Sincronizando usuario carlosadmin@hiberus.com...\n');

  // 1. Buscar en auth.users usando admin API
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error('❌ Error listando usuarios auth:', authError);
    return;
  }

  const carlosAdmin = authUsers.users.find(u => u.email === 'hola@stayarta.com');

  if (!carlosAdmin) {
    console.error('❌ Usuario carlosadmin@hiberus.com no encontrado en auth.users');
    console.log('\n📝 Debe crear el usuario primero con:');
    console.log('   Email: hola@stayarta.com');
    console.log('   Password: AdminCTB2025Pass');
    return;
  }

  console.log('✅ Usuario encontrado en auth.users:');
  console.log(`   ID: ${carlosAdmin.id}`);
  console.log(`   Email: ${carlosAdmin.email}`);
  console.log(`   Created: ${carlosAdmin.created_at}\n`);

  // 2. Verificar si existe en public.users
  const { data: publicUser, error: publicError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'hola@stayarta.com')
    .single();

  if (publicUser) {
    console.log('✅ Usuario ya existe en public.users');
    console.log(`   ID: ${publicUser.id}`);
    console.log(`   Rol: ${publicUser.role}`);
    console.log(`   Nombre: ${publicUser.full_name || 'N/A'}\n`);

    // Actualizar rol a admin si no lo es
    if (publicUser.role !== 'admin') {
      console.log('📝 Actualizando rol a admin...');
      const { error: updateError } = await supabase
        .from('users')
        .update({ role: 'admin', updated_at: new Date().toISOString() })
        .eq('id', publicUser.id);

      if (updateError) {
        console.error('❌ Error actualizando rol:', updateError);
      } else {
        console.log('✅ Rol actualizado a admin\n');
      }
    }
    return publicUser;
  }

  // 3. Crear en public.users
  console.log('📝 Creando usuario en public.users...');
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert([{
      id: carlosAdmin.id,
      email: carlosAdmin.email,
      full_name: 'Carlos Admin',
      role: 'admin',
      is_active: true
    }])
    .select()
    .single();

  if (insertError) {
    console.error('❌ Error creando usuario en public.users:', insertError);
    return null;
  }

  console.log('✅ Usuario creado exitosamente en public.users');
  console.log(`   ID: ${newUser.id}`);
  console.log(`   Email: ${newUser.email}`);
  console.log(`   Rol: ${newUser.role}\n`);

  return newUser;
}

syncUser()
  .then(() => {
    console.log('✅ Sincronización completada\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
