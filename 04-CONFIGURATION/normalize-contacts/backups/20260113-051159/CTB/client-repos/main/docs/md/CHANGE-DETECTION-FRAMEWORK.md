# 🔄 HAIDA + Change Detection Framework
## Trigger Automático de Pruebas al Detectar Cambios en Frontend

**Documento:** Integration Strategy para Change Detection + QA Automation  
**Fecha:** 16 Diciembre 2024  
**Propósito:** Automatizar disparadores de tests cuando UI/UX cambia

---

## 📊 Análisis: ¿Qué Tool Elegir?

### Herramientas Candidatas vs Requisitos HAIDA

| Criterio | Distill | Changedetection.io | Chat4Data | Web Scraper | Webtable |
|----------|---------|-------------------|-----------|-------------|----------|
| **Open Source** | ❌ (Freemium) | ✅ | ❌ (Freemium) | ❌ (Freemium) | ❌ (Freemium) |
| **Webhooks/API** | ✅ | ✅✅ | ❌ | ❌ | ❌ |
| **Historial Cambios** | ✅ | ✅✅ | ❌ | ❌ | ❌ |
| **Self-hosted** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **CI/CD Integration** | ✅ (Webhooks) | ✅✅ (Nativo) | ❌ | ❌ | ❌ |
| **Multi-browser** | ✅✅ | ✅ (Headless) | ✅ | ✅ | ✅ |
| **Detección Visual** | ✅✅ | ✅ | ✅✅ | ❌ | ✅ |
| **Costo/Mantenimiento** | 💰💰 | 💵 (Server) | 💰 | 💰 | 💰 |

---

## 🏆 RECOMENDACIÓN: Stack de 2 Capas

### **Capa 1: Detección (Changedetection.io)**
```
changedetection.io + Docker
├─ Monitorea URL/elemento específico
├─ Webhook dispara en cada cambio
├─ Historial de cambios
└─ API para integración
```

### **Capa 2: Validación/Scraping (Distill Web Monitor)**
```
Distill Web Monitor (extensión) + Manual trigger
├─ Visual change detection
├─ Email/SMS alerts
├─ Backup para validación manual
└─ Chrome/Edge/Firefox compatible
```

---

## 🛠️ ARQUITECTURA: HAIDA + Change Detection

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (Cliente)                                         │
│  ├─ app.example.com                                         │
│  └─ Deploy trigger: CSS/HTML/JS cambios                    │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼ (1. Detecta cambio)
┌─────────────────────────────────────────────────────────────┐
│  CHANGEDETECTION.IO (Docker local/servidor)                 │
│  ├─ URL monitoreada: app.example.com/login                 │
│  ├─ Elemento target: .btn-submit, .form-input             │
│  ├─ Intervalo: cada 5 minutos                              │
│  └─ Webhook: POST a http://haida-api/trigger-tests        │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼ (2. Envía webhook con cambios)
┌─────────────────────────────────────────────────────────────┐
│  HAIDA TEST TRIGGER (Node.js/Express API)                  │
│  ├─ Recibe: webhook con tipo de cambio                     │
│  │  └─ { type: 'DOM_CHANGE', selector: '.btn-submit',     │
│  │       timestamp: '...', hash: '...' }                   │
│  │                                                          │
│  ├─ Decide: ¿Qué tests correr?                            │
│  │  └─ Si DOM cambio → E2E UI tests                        │
│  │  └─ Si CSS cambio → Visual regression tests             │
│  │  └─ Si JS cambio → Unit + E2E tests                    │
│  │                                                          │
│  └─ Lanza: Pipeline de tests (Playwright + Accessibility)  │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼ (3. Ejecuta tests automáticos)
┌─────────────────────────────────────────────────────────────┐
│  TEST EXECUTION (Playwright + axe-core)                    │
│  ├─ E2E: Login flow, form submission, navigation           │
│  ├─ Accessibility: WCAG 2A compliance                      │
│  ├─ Visual: Screenshot comparison (antes/después)          │
│  └─ Performance: Page load time < 3s                       │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼ (4. Reporte resultados)
┌─────────────────────────────────────────────────────────────┐
│  ALLURE REPORT + Webhook Response                          │
│  ├─ Status: PASSED / FAILED / SKIPPED                      │
│  ├─ Evidence: Screenshots, videos                          │
│  ├─ Duration: Ejecución total                             │
│  │                                                          │
│  └─ Notificaciones:                                        │
│     ├─ Slack/Teams: Test result summary                   │
│     ├─ Changedetection.io: Marca como "processed"         │
│     └─ Email: Si hay fallos críticos                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 IMPLEMENTACIÓN PASO A PASO

### **PASO 1: Instalar Changedetection.io**

```bash
# Opción A: Docker (Recomendado)
docker run -d -p 5000:5000 \
  -v /var/lib/changedetection.io:/datastore \
  --name changedetection \
  ghcr.io/dgtlmoon/changedetection.io:latest

# Opción B: Local (Python)
pip install changedetection.io
changedetection.io --port 5000
```

**Acceso:** http://localhost:5000

### **PASO 2: Configurar Monitoreo**

```javascript
// changedetection-config.json
{
  "watches": [
    {
      "url": "https://app.example.com/login",
      "title": "Login Form UI",
      "tag": "frontend-ui",
      "check_interval": 300,  // 5 minutos
      "fetch_backend": "selenium",  // Para JS rendering
      "subfilters": [
        {
          "type": "xpath",
          "filter": "//*[@class='btn-submit']"
        },
        {
          "type": "xpath", 
          "filter": "//*[@class='form-error']"
        }
      ],
      "notification_urls": [
        "http://haida-api.local/webhook/change-detected"
      ]
    }
  ]
}
```

### **PASO 3: Crear API Webhook en HAIDA**

```javascript
// haida-api/routes/change-detector.js
const express = require('express');
const router = express.Router();
const { runTests } = require('../test-runner');

router.post('/webhook/change-detected', async (req, res) => {
  const { 
    url, 
    tag, 
    notification_type,
    previous_md5,
    current_md5 
  } = req.body;

  console.log(`🔄 CAMBIO DETECTADO: ${tag} en ${url}`);
  console.log(`   Hash anterior: ${previous_md5}`);
  console.log(`   Hash actual:   ${current_md5}`);

  // Determinar tipo de test según el cambio
  const testProfile = determineTestProfile(tag, url);
  
  // Lanzar tests
  try {
    const results = await runTests({
      profile: testProfile,
      url: url,
      changeDetected: {
        timestamp: new Date(),
        previousHash: previous_md5,
        currentHash: current_md5
      }
    });

    // Notificar resultado
    await notifyResults(results);
    
    res.json({
      status: 'success',
      testsLaunched: results.count,
      allurePath: results.reportPath
    });
  } catch (error) {
    console.error('❌ Error ejecutando tests:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Perfil de tests según tipo de cambio
function determineTestProfile(tag, url) {
  if (tag.includes('login') || tag.includes('form')) {
    return {
      name: 'frontend-form-validation',
      tests: [
        'form-rendering',
        'form-submission',
        'error-messages',
        'accessibility-wcag2a'
      ]
    };
  }
  
  if (tag.includes('dashboard')) {
    return {
      name: 'dashboard-ui-smoke',
      tests: [
        'page-load',
        'ui-rendering',
        'navigation',
        'responsive-design'
      ]
    };
  }

  // Default: smoke test
  return {
    name: 'smoke-test',
    tests: [
      'page-load',
      'accessibility-wcag2a',
      'visual-regression'
    ]
  };
}

module.exports = router;
```

### **PASO 4: Test Runner con Playwright**

```javascript
// haida-api/test-runner.js
const { chromium } = require('playwright');
const { injectAxe, checkA11y } = require('axe-playwright');

async function runTests(config) {
  const { profile, url, changeDetected } = config;
  const results = {
    profile: profile.name,
    url: url,
    tests: [],
    passed: 0,
    failed: 0,
    startTime: new Date()
  };

  const browser = await chromium.launch();
  const context = await browser.createBrowserContext();
  const page = await context.newPage();

  try {
    // Navegar a URL
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Esperar JS rendering

    // Test 1: Page Load
    if (profile.tests.includes('page-load')) {
      const metrics = await page.evaluate(() => ({
        loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
        domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
      }));
      
      results.tests.push({
        name: 'Page Load Time',
        status: metrics.loadTime < 3000 ? 'PASSED' : 'FAILED',
        metric: `${metrics.loadTime}ms`,
        timestamp: new Date()
      });
      
      if (metrics.loadTime < 3000) results.passed++;
      else results.failed++;
    }

    // Test 2: WCAG 2A Accessibility
    if (profile.tests.includes('accessibility-wcag2a')) {
      await injectAxe(page);
      const accessibilityResults = await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: {
          html: true
        }
      });

      results.tests.push({
        name: 'WCAG 2A Compliance',
        status: accessibilityResults.violations.length === 0 ? 'PASSED' : 'FAILED',
        violations: accessibilityResults.violations.length,
        timestamp: new Date()
      });

      if (accessibilityResults.violations.length === 0) results.passed++;
      else results.failed++;
    }

    // Test 3: Visual Regression
    if (profile.tests.includes('visual-regression')) {
      const screenshot = await page.screenshot({ path: `/tmp/screenshot-${Date.now()}.png` });
      results.tests.push({
        name: 'Visual Regression Check',
        status: 'PASSED', // TODO: Compare con baseline
        screenshot: screenshot.toString('base64').substring(0, 100) + '...',
        timestamp: new Date()
      });
      results.passed++;
    }

    // Test 4: Form Submission (si aplica)
    if (profile.tests.includes('form-submission')) {
      const formPresent = await page.$('form') !== null;
      results.tests.push({
        name: 'Form Rendering',
        status: formPresent ? 'PASSED' : 'FAILED',
        timestamp: new Date()
      });
      
      if (formPresent) results.passed++;
      else results.failed++;
    }

  } catch (error) {
    results.tests.push({
      name: 'Test Execution Error',
      status: 'ERROR',
      error: error.message,
      timestamp: new Date()
    });
    results.failed++;
  } finally {
    await browser.close();
  }

  results.endTime = new Date();
  results.duration = results.endTime - results.startTime;
  results.reportPath = `/reports/changedetection-${Date.now()}`;

  return results;
}

module.exports = { runTests };
```

### **PASO 5: Notificación de Resultados**

```javascript
// haida-api/notifier.js
const axios = require('axios');
const { WebClient } = require('@slack/web-api');

async function notifyResults(results) {
  const summary = `
    ✅ Cambios detectados → Tests ejecutados
    📊 Resultado: ${results.passed} PASSED, ${results.failed} FAILED
    ⏱️  Duración: ${results.duration}ms
    🔗 Reporte: ${results.reportPath}
  `;

  // Slack notification
  if (process.env.SLACK_WEBHOOK) {
    await axios.post(process.env.SLACK_WEBHOOK, {
      text: summary,
      attachments: [{
        color: results.failed === 0 ? 'good' : 'danger',
        fields: [
          { title: 'Profile', value: results.profile, short: true },
          { title: 'Status', value: results.failed === 0 ? '✅ PASSED' : '❌ FAILED', short: true },
          { title: 'Duration', value: `${results.duration}ms`, short: true },
          { title: 'Tests', value: `${results.passed}/${results.passed + results.failed}`, short: true }
        ]
      }]
    });
  }

  // Changedetection.io webhook response (opcional)
  // Marca el cambio como "procesado"
}

module.exports = { notifyResults };
```

---

## 🔧 INTEGRACIÓN CON HAIDA EXISTENTE

### Carpeta Nueva en `haida/`
```
haida/
├─ generators/
│  └─ generate-tests.ps1
│
├─ change-detection/  ← NUEVA
│  ├─ changedetection-config.json
│  ├─ docker-compose.yml
│  ├─ webhook-listener.js
│  └─ test-profiles.js
│
├─ test-runner/
│  ├─ e2e-tests.spec.js
│  ├─ accessibility-tests.spec.js
│  └─ visual-regression.spec.js
│
└─ api/
   ├─ change-detector-routes.js
   ├─ notification-handler.js
   └─ test-runner.js
```

### Package.json Updates
```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "playwright": "^1.40.0",
    "axe-playwright": "^1.2.0",
    "@slack/web-api": "^6.9.0",
    "express": "^4.18.0"
  },
  "scripts": {
    "change-detection:start": "docker-compose -f haida/change-detection/docker-compose.yml up",
    "api:webhook": "node haida/api/webhook-listener.js",
    "test:on-change": "npm run change-detection:start && npm run api:webhook"
  }
}
```

---

## 📊 MATRIZ: Qué Tests Ejecutar Según Cambio

| Tipo de Cambio | Selector Detectado | Tests Recomendados | Tiempo |
|---|---|---|---|
| **Form Input** | `.form-input`, `[type="text"]` | Form validation, E2E submission | 30s |
| **Button** | `.btn-submit`, `[type="button"]` | Click handlers, state changes | 20s |
| **Navigation** | `nav`, `.sidebar`, `.menu` | Navigation flow, link accuracy | 45s |
| **Modal/Popup** | `.modal`, `[role="dialog"]` | Modal rendering, accessibility | 25s |
| **Table** | `table`, `.data-grid` | Data rendering, sorting, pagination | 60s |
| **Dashboard** | `.dashboard`, `.card` | Widget rendering, responsiveness | 90s |
| **Color/CSS** | Any element | Visual regression, accessibility (contrast) | 40s |
| **Text Content** | `[contenteditable]`, `.text` | Content update, spell check | 15s |

---

## 🎯 HERRAMIENTAS SECUNDARIAS (Complementarias)

### **Distill Web Monitor** (Backup Visual)
```
Instalación: Chrome/Firefox extensión
├─ Para validación manual de cambios
├─ Email alerts si necesario
├─ Historial visual
└─ No requiere código
```

**Cuándo usar:**
- Validación inicial de cambio (manual)
- Backup si Changedetection.io falla
- Pruebas exploratorias rápidas

### **Chat4Data** (Para E-commerce)
```
Instalación: Chrome extensión
├─ Si necesitas extraer datos de productos
├─ Precios, descripciones, disponibilidad
├─ Exportar a CSV para test data
└─ IA-guided extraction
```

**Cuándo usar:**
- Generación de data para tests de e-commerce
- Validación de contenido dinámico
- Comparación de precios/existencias

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] **Instalar Changedetection.io**
  - [ ] Docker ou local setup
  - [ ] Acceso en http://localhost:5000
  - [ ] Configurable por UI

- [ ] **Crear API Webhook**
  - [ ] Express.js server escuchando /webhook
  - [ ] Parsear payload de changedetection.io
  - [ ] Logging de cambios detectados

- [ ] **Implementar Test Profiles**
  - [ ] 5-10 perfiles predefinidos
  - [ ] Lógica de selección por tipo de cambio
  - [ ] Tests específicos para cada perfil

- [ ] **Test Runner con Playwright**
  - [ ] E2E test templates
  - [ ] Accessibility checks (axe-core)
  - [ ] Visual regression (screenshots)
  - [ ] Performance metrics

- [ ] **Notificaciones**
  - [ ] Slack integration
  - [ ] Email on failures
  - [ ] Allure report generation

- [ ] **CI/CD Integration**
  - [ ] GitHub Actions trigger en webhook
  - [ ] Jenkins pipeline (si aplica)
  - [ ] Azure DevOps (si aplica)

- [ ] **Documentation**
  - [ ] Setup guide
  - [ ] Configuration examples
  - [ ] Troubleshooting

---

## 🔌 INTEGRACIONES ADICIONALES

### GitHub Actions
```yaml
# .github/workflows/changedetection-trigger.yml
name: Change Detection Trigger

on:
  workflow_dispatch:
  schedule:
    - cron: '*/5 * * * *'  # Cada 5 minutos

jobs:
  check-changes:
    runs-on: ubuntu-latest
    steps:
      - name: Poll changedetection.io
        run: |
          curl -X GET http://changedetection:5000/api/watch \
            -H "Authorization: Bearer ${{ secrets.CHANGEDETECTION_TOKEN }}"
      
      - name: Trigger tests if changes
        if: failure() == false
        run: npm run test:on-change
```

### Azure DevOps
```yaml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

stages:
  - stage: ChangeDetection
    jobs:
      - job: DetectChanges
        steps:
          - script: |
              curl -X POST $(CHANGEDETECTION_WEBHOOK) \
                -H "Content-Type: application/json" \
                -d '{"trigger": "scheduled"}'
            displayName: 'Check for UI Changes'
```

---

## 💡 VENTAJAS DE ESTA ARQUITECTURA

✅ **Automatización Completa**
- Cambios en UI → Tests automáticos en segundos
- Sin intervención manual

✅ **Escalable**
- Múltiples URLs monitoreadas
- Perfiles de tests configurables
- Fácil agregar nuevos elementos

✅ **Trazable**
- Historial de cambios en changedetection.io
- Reportes de tests en Allure
- Notificaciones en Slack

✅ **Costo Efectivo**
- Changedetection.io = Open Source
- No requiere servicios pagos
- Self-hosted option disponible

✅ **Aligned con HAIDA**
- Extiende capacidades de QA automation
- Genera más casos de test relevantes
- Mejora cobertura de regresión

---

## 📞 SOPORTE Y PRÓXIMOS PASOS

Para implementar:
1. Instalar Changedetection.io (Docker)
2. Crear webhook listener en Node.js
3. Configurar test profiles
4. Integrar con Slack/Teams
5. Documentar para equipo

**Contacto:**  
Carlos Arévalo | hola@stayarta.com | ++34662652300
