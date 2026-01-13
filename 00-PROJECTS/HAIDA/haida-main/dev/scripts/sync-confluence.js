#!/usr/bin/env node
/**
 * Confluence Documentation Sync
 * Sincroniza documentación de proyecto a Confluence
 */

const fs = require('fs');
const path = require('path');

const CONFLUENCE_DOCS = [
  { local: 'TESTING_VERIFICATION_REPORT.md', title: 'Testing Verification Report', parent: 'Documentation' },
  { local: 'VERCEL_DEPLOYMENT_GUIDE.md', title: 'Deployment Guide', parent: 'Documentation' },
  { local: 'API_TESTING_GUIDE.md', title: 'API Testing Guide', parent: 'Documentation' },
  { local: 'COMPLETION_SUMMARY.md', title: 'Project Completion Summary', parent: 'Documentation' },
  { local: 'CLAUDE.md', title: 'Project Conventions', parent: 'Documentation' },
];

async function syncToConfluence() {
  console.log('🔄 Iniciando sincronización con Confluence...');

  const confluenceUrl = process.env.CONFLUENCE_URL || 'http://confluence.hiberus.internal';
  const confluenceUser = process.env.CONFLUENCE_USER;
  const confluenceToken = process.env.CONFLUENCE_TOKEN;
  const spaceKey = process.env.CONFLUENCE_SPACE || 'HAIDA';

  if (!confluenceToken) {
    console.warn('⚠️ CONFLUENCE_TOKEN no configurado. Saltando sincronización.');
    return;
  }

  for (const doc of CONFLUENCE_DOCS) {
    const filePath = path.join(process.cwd(), doc.local);

    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Archivo no encontrado: ${doc.local}`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');

    try {
      const response = await fetch(`${confluenceUrl}/rest/api/content`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${confluenceUser}:${confluenceToken}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'page',
          space: { key: spaceKey },
          title: doc.title,
          body: {
            storage: {
              value: `<ac:macro ac:name="markdown"><ac:plain-text-body><![CDATA[${content}]]></ac:plain-text-body></ac:macro>`,
              representation: 'storage',
            },
          },
        }),
      });

      if (response.ok) {
        console.log(`✅ Sincronizado: ${doc.title}`);
      } else {
        console.error(`❌ Error al sincronizar ${doc.title}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`❌ Error de conexión para ${doc.title}:`, error.message);
    }
  }

  console.log('✅ Sincronización completada');
}

syncToConfluence().catch(console.error);
