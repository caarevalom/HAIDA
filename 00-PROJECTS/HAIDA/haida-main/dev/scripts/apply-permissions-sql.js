#!/usr/bin/env node

/**
 * Script para aplicar el sistema de permisos usando la API de Supabase
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🔐 APLICANDO SISTEMA DE PERMISOS');
console.log('='.repeat(70));

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Definición de permisos
const PERMISSIONS = [
  // Proyectos
  { name: 'projects.create', resource: 'projects', action: 'create', description: 'Crear nuevos proyectos' },
  { name: 'projects.read', resource: 'projects', action: 'read', description: 'Ver proyectos' },
  { name: 'projects.update', resource: 'projects', action: 'update', description: 'Editar proyectos' },
  { name: 'projects.delete', resource: 'projects', action: 'delete', description: 'Eliminar proyectos' },
  { name: 'projects.manage', resource: 'projects', action: 'manage', description: 'Gestión completa de proyectos' },
  // Test Suites
  { name: 'test_suites.create', resource: 'test_suites', action: 'create', description: 'Crear test suites' },
  { name: 'test_suites.read', resource: 'test_suites', action: 'read', description: 'Ver test suites' },
  { name: 'test_suites.update', resource: 'test_suites', action: 'update', description: 'Editar test suites' },
  { name: 'test_suites.delete', resource: 'test_suites', action: 'delete', description: 'Eliminar test suites' },
  { name: 'test_suites.execute', resource: 'test_suites', action: 'execute', description: 'Ejecutar test suites' },
  // Test Cases
  { name: 'test_cases.create', resource: 'test_cases', action: 'create', description: 'Crear test cases' },
  { name: 'test_cases.read', resource: 'test_cases', action: 'read', description: 'Ver test cases' },
  { name: 'test_cases.update', resource: 'test_cases', action: 'update', description: 'Editar test cases' },
  { name: 'test_cases.delete', resource: 'test_cases', action: 'delete', description: 'Eliminar test cases' },
  // Ejecuciones
  { name: 'executions.read', resource: 'executions', action: 'read', description: 'Ver resultados de ejecuciones' },
  { name: 'executions.delete', resource: 'executions', action: 'delete', description: 'Eliminar resultados' },
  // Reportes
  { name: 'reports.read', resource: 'reports', action: 'read', description: 'Ver reportes' },
  { name: 'reports.export', resource: 'reports', action: 'export', description: 'Exportar reportes' },
  { name: 'reports.create', resource: 'reports', action: 'create', description: 'Crear reportes personalizados' },
  // Usuarios
  { name: 'users.create', resource: 'users', action: 'create', description: 'Crear nuevos usuarios' },
  { name: 'users.read', resource: 'users', action: 'read', description: 'Ver usuarios' },
  { name: 'users.update', resource: 'users', action: 'update', description: 'Editar usuarios' },
  { name: 'users.delete', resource: 'users', action: 'delete', description: 'Eliminar usuarios' },
  { name: 'users.manage_permissions', resource: 'users', action: 'manage_permissions', description: 'Gestionar permisos de usuarios' },
  // Configuración
  { name: 'settings.read', resource: 'settings', action: 'read', description: 'Ver configuración del sistema' },
  { name: 'settings.update', resource: 'settings', action: 'update', description: 'Modificar configuración del sistema' }
];

// Definición de roles
const ROLES = [
  { name: 'admin', display_name: 'Administrador', description: 'Administrador del sistema - Acceso completo', is_system_role: true },
  { name: 'qa_engineer', display_name: 'QA Engineer', description: 'Ingeniero de QA - Puede crear y ejecutar tests', is_system_role: true },
  { name: 'developer', display_name: 'Desarrollador', description: 'Desarrollador - Puede ver tests y resultados', is_system_role: true },
  { name: 'viewer', display_name: 'Visualizador', description: 'Visualizador - Solo puede ver información', is_system_role: true }
];

// Permisos por rol
const ROLE_PERMISSIONS = {
  'qa_engineer': [
    'projects.read', 'projects.update',
    'test_suites.create', 'test_suites.read', 'test_suites.update', 'test_suites.delete', 'test_suites.execute',
    'test_cases.create', 'test_cases.read', 'test_cases.update', 'test_cases.delete',
    'executions.read', 'executions.delete',
    'reports.read', 'reports.export', 'reports.create'
  ],
  'developer': [
    'projects.read',
    'test_suites.read', 'test_suites.execute',
    'test_cases.read',
    'executions.read',
    'reports.read', 'reports.export'
  ],
  'viewer': [
    'projects.read',
    'test_suites.read',
    'test_cases.read',
    'executions.read',
    'reports.read'
  ]
};

async function applyPermissionsSystem() {
  try {
    console.log('\n1️⃣  Insertando permisos...\n');

    // Insertar permisos
    for (const perm of PERMISSIONS) {
      const { data, error } = await supabase
        .from('permissions')
        .upsert([perm], { onConflict: 'name' })
        .select()
        .single();

      if (error) {
        console.log(`   ❌ ${perm.name}: ${error.message}`);
      } else {
        console.log(`   ✅ ${perm.name}`);
      }
    }

    console.log(`\n   Total: ${PERMISSIONS.length} permisos\n`);

    console.log('2️⃣  Insertando roles...\n');

    // Insertar roles
    for (const role of ROLES) {
      const { data, error } = await supabase
        .from('roles')
        .upsert([role], { onConflict: 'name' })
        .select()
        .single();

      if (error) {
        console.log(`   ❌ ${role.name}: ${error.message}`);
      } else {
        console.log(`   ✅ ${role.name}`);
      }
    }

    console.log(`\n   Total: ${ROLES.length} roles\n`);

    console.log('3️⃣  Asignando permisos a roles...\n');

    // Obtener IDs de permisos y roles
    const { data: allPermissions } = await supabase
      .from('permissions')
      .select('id, name');

    const { data: allRoles } = await supabase
      .from('roles')
      .select('id, name');

    const permMap = {};
    allPermissions.forEach(p => permMap[p.name] = p.id);

    const roleMap = {};
    allRoles.forEach(r => roleMap[r.name] = r.id);

    // Admin: Todos los permisos
    console.log('   Admin (todos los permisos)...');
    const adminRoleId = roleMap['admin'];
    const adminPerms = allPermissions.map(p => ({
      role_id: adminRoleId,
      permission_id: p.id
    }));

    const { error: adminError } = await supabase
      .from('role_permissions')
      .upsert(adminPerms, { onConflict: 'role_id,permission_id', ignoreDuplicates: true });

    if (adminError) {
      console.log(`   ❌ Error: ${adminError.message}`);
    } else {
      console.log(`   ✅ Admin: ${adminPerms.length} permisos`);
    }

    // Otros roles
    for (const [roleName, permNames] of Object.entries(ROLE_PERMISSIONS)) {
      const roleId = roleMap[roleName];
      const rolePerms = permNames.map(name => ({
        role_id: roleId,
        permission_id: permMap[name]
      }));

      const { error } = await supabase
        .from('role_permissions')
        .upsert(rolePerms, { onConflict: 'role_id,permission_id', ignoreDuplicates: true });

      if (error) {
        console.log(`   ❌ ${roleName}: ${error.message}`);
      } else {
        console.log(`   ✅ ${roleName}: ${rolePerms.length} permisos`);
      }
    }

    console.log('\n4️⃣  Verificando resultados...\n');

    // Verificar
    const { count: permCount } = await supabase
      .from('permissions')
      .select('*', { count: 'exact', head: true });

    const { count: roleCount } = await supabase
      .from('roles')
      .select('*', { count: 'exact', head: true });

    const { count: rpCount } = await supabase
      .from('role_permissions')
      .select('*', { count: 'exact', head: true });

    console.log('   📊 Resumen:');
    console.log(`      Permisos: ${permCount}`);
    console.log(`      Roles: ${roleCount}`);
    console.log(`      Asignaciones: ${rpCount}\n`);

    // Mostrar permisos por rol
    await showPermissionsByRole(allRoles);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    throw error;
  }
}

async function showPermissionsByRole(roles) {
  console.log('5️⃣  Permisos por Rol:\n');

  for (const role of roles) {
    const { data: rolePerms } = await supabase
      .from('role_permissions')
      .select(`
        permission:permissions (
          name,
          resource,
          action
        )
      `)
      .eq('role_id', role.id);

    console.log(`   📋 ${role.name.toUpperCase()} (${rolePerms.length} permisos):\n`);

    // Agrupar por recurso
    const byResource = {};
    rolePerms.forEach(rp => {
      const perm = rp.permission;
      if (!byResource[perm.resource]) {
        byResource[perm.resource] = [];
      }
      byResource[perm.resource].push(perm.action);
    });

    Object.keys(byResource).sort().forEach(resource => {
      const actions = byResource[resource].sort().join(', ');
      console.log(`      • ${resource}: ${actions}`);
    });

    console.log('');
  }
}

applyPermissionsSystem()
  .then(() => {
    console.log('='.repeat(70));
    console.log('✅ Sistema de permisos configurado correctamente\n');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
