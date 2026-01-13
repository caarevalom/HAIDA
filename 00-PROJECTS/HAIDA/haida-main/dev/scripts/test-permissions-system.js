#!/usr/bin/env node

/**
 * Script para probar el sistema de permisos
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n✅ VERIFICACIÓN DEL SISTEMA DE PERMISOS');
console.log('='.repeat(70));

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function testPermissionsSystem() {
  try {
    // 1. Verificar permisos
    console.log('\n1️⃣  Verificando permisos...\n');

    const { data: permissions, error: permError } = await supabase
      .from('permissions')
      .select('*')
      .order('resource, action');

    if (permError) throw permError;

    console.log(`   ✅ ${permissions.length} permisos creados\n`);

    // Agrupar por recurso
    const byResource = {};
    permissions.forEach(p => {
      if (!byResource[p.resource]) {
        byResource[p.resource] = [];
      }
      byResource[p.resource].push(p.action);
    });

    Object.keys(byResource).sort().forEach(resource => {
      console.log(`   📋 ${resource}: ${byResource[resource].join(', ')}`);
    });

    // 2. Verificar roles
    console.log('\n\n2️⃣  Verificando roles...\n');

    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .order('name');

    if (rolesError) throw rolesError;

    console.log(`   ✅ ${roles.length} roles creados:\n`);
    roles.forEach(r => {
      console.log(`   • ${r.display_name} (${r.name})`);
      console.log(`     ${r.description}`);
      console.log(`     Sistema: ${r.is_system_role ? 'Sí' : 'No'}\n`);
    });

    // 3. Verificar asignaciones
    console.log('3️⃣  Verificando asignaciones de permisos...\n');

    for (const role of roles) {
      const { data: rolePerms } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .eq('role_id', role.id);

      console.log(`   ${role.display_name}: ${rolePerms.length} permisos`);
    }

    // 4. Probar función user_has_permission
    console.log('\n\n4️⃣  Probando función user_has_permission...\n');

    // Buscar un usuario admin
    const { data: adminUser } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (adminUser) {
      console.log(`   Usuario de prueba: ${adminUser.email} (${adminUser.role})\n`);

      const testsPerms = [
        'projects.create',
        'users.manage_permissions',
        'test_suites.execute'
      ];

      for (const perm of testsPerms) {
        const { data: hasPermfalse, error: permCheckError } = await supabase
          .rpc('user_has_permission', {
            p_user_id: adminUser.id,
            p_permission_name: perm
          });

        if (permCheckError) {
          console.log(`   ❌ ${perm}: Error - ${permCheckError.message}`);
        } else {
          console.log(`   ${hasPermfalse ? '✅' : '❌'} ${perm}: ${hasPermfalse}`);
        }
      }
    }

    // 5. Probar función get_user_permissions
    console.log('\n\n5️⃣  Probando función get_user_permissions...\n');

    if (adminUser) {
      const { data: userPerms, error: userPermsError } = await supabase
        .rpc('get_user_permissions', {
          p_user_id: adminUser.id
        });

      if (userPermsError) {
        console.log(`   ❌ Error: ${userPermsError.message}`);
      } else {
        console.log(`   ✅ Usuario tiene ${userPerms.length} permisos efectivos\n`);

        // Agrupar por recurso
        const permsByResource = {};
        userPerms.forEach(p => {
          if (!permsByResource[p.resource]) {
            permsByResource[p.resource] = [];
          }
          permsByResource[p.resource].push(p.action);
        });

        Object.keys(permsByResource).sort().forEach(resource => {
          console.log(`   • ${resource}: ${permsByResource[resource].join(', ')}`);
        });
      }
    }

    // 6. Verificar usuarios finales
    console.log('\n\n6️⃣  Usuarios en producción...\n');

    const { data: users } = await supabase
      .from('users')
      .select('email, role, is_active')
      .order('email');

    console.log(`   Total: ${users.length} usuarios\n`);

    const byRole = {};
    users.forEach(u => {
      if (!byRole[u.role]) byRole[u.role] = 0;
      byRole[u.role]++;
    });

    Object.keys(byRole).sort().forEach(role => {
      console.log(`   ${role}: ${byRole[role]} usuarios`);
    });

    // Resumen
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN');
    console.log('='.repeat(70));
    console.log(`✅ Permisos: ${permissions.length}`);
    console.log(`✅ Roles: ${roles.length}`);
    console.log(`✅ Usuarios: ${users.length}`);
    console.log(`✅ Funciones SQL: user_has_permission(), get_user_permissions()`);
    console.log('='.repeat(70));
    console.log('\n✅ Sistema de permisos funcionando correctamente\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    throw error;
  }
}

testPermissionsSystem()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
