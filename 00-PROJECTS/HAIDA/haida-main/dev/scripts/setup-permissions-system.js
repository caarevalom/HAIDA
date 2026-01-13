#!/usr/bin/env node

/**
 * Script para configurar el sistema de permisos en Supabase
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🔐 CONFIGURACIÓN DEL SISTEMA DE PERMISOS');
console.log('='.repeat(70));

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function setupPermissionsSystem() {
  try {
    console.log('\n1️⃣  Leyendo script SQL...\n');

    const sqlPath = path.join(__dirname, '..', 'database', 'permissions-system.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log(`   ✅ Script cargado: ${sqlPath}\n`);

    // Nota: Supabase no permite ejecutar SQL directamente desde la API REST
    // Este script debe ejecutarse manualmente en el SQL Editor de Supabase Dashboard

    console.log('⚠️  ACCIÓN MANUAL REQUERIDA:\n');
    console.log('   Para configurar el sistema de permisos, ejecuta el siguiente archivo SQL');
    console.log('   en el SQL Editor de Supabase Dashboard:\n');
    console.log(`   📄 Archivo: ${sqlPath}\n`);
    console.log('   📍 Dashboard: https://app.supabase.com\n');
    console.log('   Pasos:');
    console.log('   1. Ir a Supabase Dashboard');
    console.log('   2. Abrir SQL Editor');
    console.log('   3. Crear nueva query');
    console.log('   4. Copiar y pegar el contenido de permissions-system.sql');
    console.log('   5. Ejecutar (RUN)\n');

    // Verificar si las tablas ya existen
    console.log('2️⃣  Verificando si el sistema de permisos ya está configurado...\n');

    const { data: permissions, error: permError } = await supabase
      .from('permissions')
      .select('count');

    if (!permError) {
      console.log('   ✅ Sistema de permisos YA está configurado\n');

      // Mostrar estadísticas
      const { count: permCount } = await supabase
        .from('permissions')
        .select('*', { count: 'exact', head: true });

      const { count: roleCount } = await supabase
        .from('roles')
        .select('*', { count: 'exact', head: true });

      const { count: rpCount } = await supabase
        .from('role_permissions')
        .select('*', { count: 'exact', head: true });

      console.log('   📊 Estadísticas:');
      console.log(`      Permisos: ${permCount}`);
      console.log(`      Roles: ${roleCount}`);
      console.log(`      Asignaciones: ${rpCount}\n`);

      // Mostrar permisos por rol
      await showPermissionsByRole();

    } else {
      console.log('   ⚠️  Sistema de permisos NO configurado aún\n');
      console.log('   Por favor, ejecuta el script SQL manualmente (ver instrucciones arriba)\n');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    throw error;
  }
}

async function showPermissionsByRole() {
  try {
    console.log('3️⃣  Permisos por Rol:\n');

    const { data: roles } = await supabase
      .from('roles')
      .select('*')
      .order('name');

    for (const role of roles) {
      const { data: rolePerms } = await supabase
        .from('role_permissions')
        .select(`
          permission:permissions (
            name,
            resource,
            action,
            description
          )
        `)
        .eq('role_id', role.id);

      console.log(`   📋 ${role.name.toUpperCase()} (${rolePerms.length} permisos):`);
      console.log(`      ${role.description}\n`);

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
  } catch (error) {
    console.error('Error mostrando permisos:', error.message);
  }
}

setupPermissionsSystem()
  .then(() => {
    console.log('✅ Verificación completada\n');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
