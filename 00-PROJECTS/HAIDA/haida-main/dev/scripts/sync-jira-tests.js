#!/usr/bin/env node
/**
 * Jira Test Case Synchronization
 * Sincroniza casos de prueba CSV a Jira y HAIDA
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');

const CSV_FILES = [
  'haida/outputs/ctb/ctb-master.csv',
  'haida/outputs/ctb/ctb-home.csv',
  'haida/outputs/ctb/ctb-auth.csv',
];

async function parseCsvTestCases(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Archivo no encontrado: ${filePath}`);
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const records = csv.parse(content, {
    delimiter: '|',
    columns: [
      'TEST_ID', 'TIPO_PRUEBA', 'COMPONENTE', 'MODULO', 'REQUISITO_ID',
      'DESCRIPCION', 'PRECONDICIONES', 'PASOS', 'RESULTADO_ESPERADO',
      'PRIORIDAD', 'RIESGO', 'ETIQUETA_AUTOMATIZACION', 'ESTADO'
    ],
    skip_empty_lines: true,
  });

  return records.filter(r => r.TEST_ID && r.TEST_ID !== 'TEST_ID');
}

async function syncTestCasesToJira(testCases) {
  console.log('🔄 Sincronizando test cases a Jira...');

  const jiraHost = process.env.JIRA_HOST;
  const jiraUser = process.env.JIRA_USER;
  const jiraToken = process.env.JIRA_TOKEN;
  const projectKey = process.env.JIRA_PROJECT || 'HAIDA';

  if (!jiraToken) {
    console.warn('⚠️ JIRA_TOKEN no configurado. Saltando sincronización.');
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (const testCase of testCases.slice(0, 50)) {  // Límite por performance
    try {
      const issueBody = {
        fields: {
          project: { key: projectKey },
          summary: `${testCase.TEST_ID}: ${testCase.DESCRIPCION.substring(0, 100)}`,
          description: `
**Tipo**: ${testCase.TIPO_PRUEBA}
**Componente**: ${testCase.COMPONENTE}
**Requisito**: ${testCase.REQUISITO_ID}

**Precondiciones**:
${testCase.PRECONDICIONES}

**Pasos**:
${testCase.PASOS}

**Resultado Esperado**:
${testCase.RESULTADO_ESPERADO}

**Etiquetas**: ${testCase.ETIQUETA_AUTOMATIZACION}
          `.trim(),
          issuetype: { name: 'Test' },
          priority: {
            name: testCase.PRIORIDAD.includes('P0') ? 'Highest' :
                   testCase.PRIORIDAD.includes('P1') ? 'High' : 'Medium'
          },
          labels: testCase.ETIQUETA_AUTOMATIZACION.split(' '),
          customfield_risk: testCase.RIESGO,
        }
      };

      const response = await fetch(`${jiraHost}/rest/api/3/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${jiraUser}:${jiraToken}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(issueBody),
      });

      if (response.ok) {
        console.log(`✅ ${testCase.TEST_ID} sincronizado a Jira`);
        successCount++;
      } else if (response.status === 409) {
        console.log(`ℹ️ ${testCase.TEST_ID} ya existe en Jira`);
      } else {
        console.error(`❌ Error en ${testCase.TEST_ID}: ${response.statusText}`);
        errorCount++;
      }
    } catch (error) {
      console.error(`❌ Error procesando ${testCase.TEST_ID}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n📊 Resultados: ${successCount} creados, ${errorCount} errores`);
}

async function syncTestCasesToHAIDA(testCases) {
  console.log('🔄 Sincronizando test cases a HAIDA...');

  const haidaPath = path.join(process.cwd(), 'haida', 'outputs', 'test-sync.json');

  const syncData = {
    syncDate: new Date().toISOString(),
    totalTests: testCases.length,
    distribution: {
      byPriority: {},
      byType: {},
      byComponent: {}
    },
    tests: testCases.map(t => ({
      id: t.TEST_ID,
      type: t.TIPO_PRUEBA,
      component: t.COMPONENTE,
      requirement: t.REQUISITO_ID,
      description: t.DESCRIPCION,
      priority: t.PRIORIDAD,
      status: t.ESTADO,
      tags: t.ETIQUETA_AUTOMATIZACION.split(' ')
    }))
  };

  // Calcular distribuciones
  testCases.forEach(t => {
    syncData.distribution.byPriority[t.PRIORIDAD] = (syncData.distribution.byPriority[t.PRIORIDAD] || 0) + 1;
    syncData.distribution.byType[t.TIPO_PRUEBA] = (syncData.distribution.byType[t.TIPO_PRUEBA] || 0) + 1;
    syncData.distribution.byComponent[t.COMPONENTE] = (syncData.distribution.byComponent[t.COMPONENTE] || 0) + 1;
  });

  fs.writeFileSync(haidaPath, JSON.stringify(syncData, null, 2));
  console.log(`✅ Sincronización HAIDA completada: ${testCases.length} test cases`);
}

async function main() {
  console.log('🚀 Iniciando sincronización de test cases...\n');

  let allTestCases = [];

  for (const csvFile of CSV_FILES) {
    const testCases = await parseCsvTestCases(csvFile);
    allTestCases = allTestCases.concat(testCases);
    console.log(`📄 Procesado ${csvFile}: ${testCases.length} casos`);
  }

  console.log(`\n📊 Total de test cases: ${allTestCases.length}\n`);

  // Sincronizar a Jira
  if (process.env.JIRA_TOKEN) {
    await syncTestCasesToJira(allTestCases);
  }

  // Sincronizar a HAIDA
  await syncTestCasesToHAIDA(allTestCases);

  console.log('\n✅ Sincronización completada exitosamente');
}

main().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
