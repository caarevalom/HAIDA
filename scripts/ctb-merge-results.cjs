const fs = require('fs');
const path = require('path');

const masterPath = process.env.CTB_MASTER_CSV || '/Users/carlosa/Hiberus/CTB/docs/csv/ctb-master.csv';
const resultsDir = process.env.CTB_RESULTS_DIR || path.join(__dirname, '..', 'test-results');
const outputPath = process.env.CTB_EXECUTION_CSV || '/Users/carlosa/Hiberus/CTB/docs/csv/ctb-execution-results.csv';

const deviceMap = {
  'Desktop Chrome': 'Desktop',
  'iPhone 14': 'iOS',
  'Pixel 7': 'Android',
};

const automatedModules = new Set([
  'SEO',
  'Accessibility',
  'Footer',
  'Search',
  'PLP',
  'PDP',
  'Mapa',
  'Login',
  'Dashboard',
]);

function parseCsv(content) {
  const lines = content.trim().split(/\r?\n/);
  const headers = lines.shift().split('|');
  return lines.map((line) => {
    const cols = line.split('|');
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] || '';
    });
    return row;
  });
}

function collectResultsFromJUnit(xml) {
  const results = new Map();
  const suites = xml.split('<testsuite ');
  suites.shift();
  for (const raw of suites) {
    const suiteBlock = `<testsuite ${raw}`;
    const endIdx = suiteBlock.indexOf('</testsuite>');
    if (endIdx === -1) continue;
    const suiteXml = suiteBlock.slice(0, endIdx + '</testsuite>'.length);
    const hostMatch = suiteXml.match(/hostname=\"([^\"]+)\"/);
    if (!hostMatch) continue;
    const device = deviceMap[hostMatch[1]] || hostMatch[1];

    const caseRegex = new RegExp('<testcase[^>]*\\bname=\"([^\"]+)\"[^>]*>([\\s\\S]*?)</testcase>', 'g');
    let caseMatch;
    while ((caseMatch = caseRegex.exec(suiteXml)) !== null) {
      const name = caseMatch[1];
      const body = caseMatch[2];
      const match = name.match(/(TC_[A-Z0-9_]+)/i);
      if (!match) continue;
      const tcId = match[1].toUpperCase();
      let status = 'passed';
      if (body.includes('<failure')) status = 'failed';
      if (body.includes('<error')) status = 'failed';
      if (body.includes('<skipped')) status = 'skipped';

      const attachments = [];
      const attRegex = /\[\[ATTACHMENT\|([^\]]+)\]\]/g;
      let attMatch;
      while ((attMatch = attRegex.exec(body)) !== null) {
        attachments.push(attMatch[1]);
      }

      const key = `${tcId}::${device}`;
      results.set(key, { status, attachments });
    }
  }
  return results;
}

function statusToResult(status) {
  if (status === 'passed') return 'PASS';
  if (status === 'failed') return 'FAIL';
  if (status === 'skipped') return 'BLOQUEADO';
  return 'NO_EJECUTADO';
}

const master = parseCsv(fs.readFileSync(masterPath, 'utf8'));
const xmlFiles = fs.existsSync(resultsDir)
  ? fs.readdirSync(resultsDir).filter((f) => f.startsWith('ctb-basic') && f.endsWith('.xml'))
  : [];

xmlFiles.sort((a, b) => {
  const aTime = fs.statSync(path.join(resultsDir, a)).mtimeMs;
  const bTime = fs.statSync(path.join(resultsDir, b)).mtimeMs;
  return aTime - bTime;
});

const results = new Map();
for (const file of xmlFiles) {
  const xml = fs.readFileSync(path.join(resultsDir, file), 'utf8');
  const batch = collectResultsFromJUnit(xml);
  for (const [key, value] of batch.entries()) {
    results.set(key, value);
  }
}

const devices = ['Desktop', 'iOS', 'Android'];
const rows = [];
rows.push(['TEST_ID', 'DISPOSITIVO', 'RESULTADO', 'ENTORNO', 'EVIDENCIA', 'NOTAS'].join('|'));

const bypassNotes = new Set([
  'TC_PLP_001',
  'TC_PLP_002',
  'TC_PLP_003',
  'TC_PLP_004',
  'TC_PLP_005',
  'TC_PDP_001',
  'TC_PDP_002',
  'TC_PDP_004',
  'TC_SEARCH_001',
  'TC_NAV_014',
  'TC_FAV_008',
]);

for (const tc of master) {
  for (const device of devices) {
    const key = `${tc.TEST_ID}::${device}`;
    if (results.has(key)) {
      const r = results.get(key);
      const note = bypassNotes.has(tc.TEST_ID) ? 'Bypass: discovery (primer enlace/categoria/producto disponible)' : '';
      rows.push([
        tc.TEST_ID,
        device,
        statusToResult(r.status),
        'mcprod',
        (r.attachments || []).join(', '),
        note
      ].join('|'));
      continue;
    }

    let result = 'NO_EJECUTADO';
    let notes = 'Pendiente de automatizacion';
    if (!automatedModules.has(tc.MODULO)) {
      result = 'BLOQUEADO';
      notes = 'Datos de prueba no disponibles o requiere ejecucion manual';
    }

    rows.push([
      tc.TEST_ID,
      device,
      result,
      'mcprod',
      '',
      notes
    ].join('|'));
  }
}

fs.writeFileSync(outputPath, rows.join('\n'));
console.log(`Escrito: ${outputPath}`);
