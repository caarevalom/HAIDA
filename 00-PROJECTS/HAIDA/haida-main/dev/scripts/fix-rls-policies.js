#!/usr/bin/env node

/**
 * Script para ejecutar SQL que arregla las políticas RLS
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('\n🔧 EJECUTANDO FIX DE POLÍTICAS RLS');
console.log('='.repeat(60));

async function fixRLSPolicies() {
  try {
    // Leer archivo SQL
    const sqlPath = path.join(__dirname, '..', 'database', 'fix-rls-allow-read-projects.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Ejecutando SQL desde:', sqlPath);
    console.log('');

    // Dividir en statements individuales y ejecutar uno por uno
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let executed = 0;
    let errors = 0;

    for (const statement of statements) {
      // Skip comentarios y líneas vacías
      if (statement.startsWith('--') || statement.trim().length === 0) {
        continue;
      }

      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement + ';'
        });

        if (error) {
          // Intentar ejecución directa si RPC falla
          console.log(`⚠️  RPC failed, trying direct execution...`);

          // Para políticas, usar el formato correcto
          if (statement.includes('DROP POLICY') || statement.includes('CREATE POLICY')) {
            console.log(`   Ejecutando: ${statement.substring(0, 60)}...`);

            // Supabase no permite ejecutar DDL via API directamente
            // Necesitamos usar el dashboard
            console.log(`   ⏭️  Skipping (requiere dashboard): ${statement.substring(0, 40)}...`);
          }
        } else {
          executed++;
          console.log(`   ✅ Statement ${executed} ejecutado`);
        }
      } catch (err) {
        errors++;
        console.log(`   ❌ Error: ${err.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`📊 Statements ejecutados: ${executed}`);
    console.log(`❌ Errors: ${errors}`);
    console.log('='.repeat(60));

    // Como no podemos ejecutar DDL via API, vamos a dar instrucciones
    console.log('\n⚠️  NOTA IMPORTANTE:');
    console.log('   Las políticas RLS (DROP POLICY / CREATE POLICY) no pueden');
    console.log('   ejecutarse via API.');
    console.log('');
    console.log('   📋 ACCIÓN REQUERIDA:');
    console.log('   1. Abrir: https://app.supabase.com');
    console.log('   2. Proyecto: wdebyxvtunromsnkqbrd');
    console.log('   3. SQL Editor → New Query');
    console.log('   4. Copiar: database/fix-rls-allow-read-projects.sql');
    console.log('   5. Ejecutar (Cmd+Enter)');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

fixRLSPolicies()
  .then(() => {
    console.log('✅ Script finalizado\n');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Script fallido\n');
    process.exit(1);
  });
