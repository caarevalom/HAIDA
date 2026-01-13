#!/usr/bin/env node

/**
 * Playwright Evidence Capture Framework
 *
 * Captura automática de evidencias para test cases:
 * - Screenshots en cada paso
 * - Grabación de video completo
 * - Network logs (requests/responses)
 * - Backend logs
 *
 * Manejo robusto de errores - NUNCA falla, registra TODO
 */

const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

class TestEvidenceCapture {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'https://visitbarcelona-dev.com';
    this.evidenceDir = config.evidenceDir || './evidencias';
    this.backendUrl = config.backendUrl || 'http://localhost:3000';
    this.browsers = config.browsers || ['chromium'];
    this.timeout = config.timeout || 30000;
  }

  /**
   * Crear estructura de carpetas para evidencias
   */
  createEvidenceStructure(testId) {
    const dirs = [
      `${this.evidenceDir}/${testId}`,
      `${this.evidenceDir}/${testId}/screenshots`,
      `${this.evidenceDir}/${testId}/network`,
      `${this.evidenceDir}/${testId}/logs`,
    ];

    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    return dirs[0];
  }

  /**
   * Ejecutar test case con captura de evidencias
   */
  async executeTestWithEvidence(testConfig) {
    const {
      testId = 'TC_TEST_001',
      testName = 'Test Case',
      steps = [],
      browserType = 'chromium',
      expectPass = true,
    } = testConfig;

    const result = {
      testId,
      testName,
      status: 'PENDING',
      duration: 0,
      stepResults: [],
      evidencePath: this.createEvidenceStructure(testId),
      errors: [],
      screenshots: [],
      networkLog: [],
      backendLog: [],
    };

    const startTime = Date.now();

    try {
      // Seleccionar navegador
      let browser;
      if (browserType === 'chromium') {
        browser = await chromium.launch({ headless: true });
      } else if (browserType === 'firefox') {
        browser = await firefox.launch({ headless: true });
      } else if (browserType === 'webkit') {
        browser = await webkit.launch({ headless: true });
      }

      // Context con grabación de video
      const context = await browser.newContext({
        recordVideo: { dir: `${result.evidencePath}/video` },
        viewport: { width: 1280, height: 720 },
      });

      // Habilitar network logging
      const networkLog = [];
      context.on('response', (response) => {
        networkLog.push({
          url: response.url(),
          status: response.status(),
          method: response.request().method(),
          headers: response.headers(),
          timestamp: new Date().toISOString(),
        });
      });

      const page = await context.newPage();
      page.setDefaultTimeout(this.timeout);

      // Ejecutar cada paso del test
      let stepNumber = 1;
      for (const step of steps) {
        try {
          await this.executeStep(page, step, stepNumber, testId, result);
          result.stepResults.push({
            step: stepNumber,
            status: 'PASS',
            description: step.description,
          });
          stepNumber++;
        } catch (stepError) {
          result.stepResults.push({
            step: stepNumber,
            status: 'FAIL',
            description: step.description,
            error: stepError.message,
          });
          result.errors.push({
            step: stepNumber,
            message: stepError.message,
            timestamp: new Date().toISOString(),
          });

          // Screenshot del error
          try {
            await page.screenshot({
              path: `${result.evidencePath}/screenshots/error-step-${stepNumber}.png`,
            });
            result.screenshots.push(`error-step-${stepNumber}.png`);
          } catch (screenshotError) {
            result.errors.push({
              step: stepNumber,
              message: `Error capturando screenshot: ${screenshotError.message}`,
            });
          }

          // Continuar con siguiente paso (no fallar)
        }
      }

      // Capturar último estado
      try {
        await page.screenshot({
          path: `${result.evidencePath}/screenshots/final-state.png`,
        });
        result.screenshots.push('final-state.png');
      } catch (e) {
        result.errors.push({ message: `Error screenshot final: ${e.message}` });
      }

      // Guardar network log
      fs.writeFileSync(
        `${result.evidencePath}/network/network-log.json`,
        JSON.stringify(networkLog, null, 2)
      );
      result.networkLog = networkLog;

      // Obtener logs backend (si endpoint disponible)
      try {
        const backendLogs = await this.fetchBackendLogs(testId);
        fs.writeFileSync(
          `${result.evidencePath}/logs/backend.log`,
          JSON.stringify(backendLogs, null, 2)
        );
        result.backendLog = backendLogs;
      } catch (e) {
        result.errors.push({ message: `No se pudieron obtener logs backend: ${e.message}` });
      }

      // Cerrar contexto y navegador
      await context.close();
      await browser.close();

      // Determinar status final
      if (result.errors.length === 0) {
        result.status = expectPass ? 'PASS' : 'FAIL_EXPECTED';
      } else {
        result.status = expectPass ? 'FAIL' : 'FAIL_EXPECTED';
      }
    } catch (testError) {
      result.status = 'ERROR';
      result.errors.push({
        message: `Error en test: ${testError.message}`,
        stack: testError.stack,
      });
    }

    // Registrar duración
    result.duration = Date.now() - startTime;

    // Guardar resultado en JSON
    this.saveTestResult(result);

    return result;
  }

  /**
   * Ejecutar un paso del test
   */
  async executeStep(page, step, stepNumber, testId, result) {
    const { description, action, selector, value, expected } = step;

    console.log(`  📍 Paso ${stepNumber}: ${description}`);

    switch (action) {
      case 'navigate':
        await page.goto(this.baseUrl + (value || ''), { waitUntil: 'networkidle' });
        break;

      case 'click':
        await page.click(selector, { timeout: this.timeout });
        break;

      case 'fill':
        await page.fill(selector, value, { timeout: this.timeout });
        break;

      case 'select':
        await page.selectOption(selector, value);
        break;

      case 'waitForSelector':
        await page.waitForSelector(selector, { timeout: this.timeout });
        break;

      case 'waitForNavigation':
        await page.waitForNavigation({ waitUntil: 'networkidle', timeout: this.timeout });
        break;

      case 'screenshot':
        await page.screenshot({
          path: `${result.evidencePath}/screenshots/step-${stepNumber}.png`,
        });
        result.screenshots.push(`step-${stepNumber}.png`);
        break;

      case 'assert':
        const actualText = await page.textContent(selector);
        if (actualText !== expected) {
          throw new Error(`Assertion failed. Expected: ${expected}, Got: ${actualText}`);
        }
        break;

      default:
        console.warn(`  ⚠️  Acción desconocida: ${action}`);
    }
  }

  /**
   * Obtener logs del backend
   */
  async fetchBackendLogs(testId) {
    try {
      const response = await axios.get(`${this.backendUrl}/api/logs/${testId}`, {
        timeout: 5000,
      });
      return response.data;
    } catch (error) {
      console.warn(`  ⚠️  No se pudieron obtener logs backend: ${error.message}`);
      return [];
    }
  }

  /**
   * Guardar resultado de test en JSON
   */
  saveTestResult(result) {
    const resultPath = `${result.evidencePath}/result.json`;
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));

    console.log(`\n✅ Test completado: ${result.testId}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Duración: ${result.duration}ms`);
    console.log(`   Evidencias: ${result.evidencePath}`);
    console.log(`   Screenshots: ${result.screenshots.length}`);
    console.log(`   Errores: ${result.errors.length}`);
  }
}

// Exportar para uso
module.exports = TestEvidenceCapture;

// Ejemplo de uso si se ejecuta directamente
if (require.main === module) {
  (async () => {
    const capture = new TestEvidenceCapture({
      baseUrl: 'https://visitbarcelona-dev.com',
      evidenceDir: './evidencias',
      browsers: ['chromium'],
    });

    const testConfig = {
      testId: 'TC_AUTH_001',
      testName: 'Login con email válido',
      browserType: 'chromium',
      steps: [
        { description: 'Navegar a login', action: 'navigate', value: '/login' },
        {
          description: 'Rellenar email',
          action: 'fill',
          selector: 'input[name=email]',
          value: 'user@test.com',
        },
        {
          description: 'Rellenar password',
          action: 'fill',
          selector: 'input[name=password]',
          value: 'TestPass123!',
        },
        { description: 'Hacer click en submit', action: 'click', selector: 'button[type=submit]' },
        { description: 'Esperar redirección', action: 'waitForNavigation' },
        { description: 'Capturar resultado', action: 'screenshot' },
        {
          description: 'Validar que estamos en home',
          action: 'assert',
          selector: 'h1',
          expected: 'Bienvenido',
        },
      ],
    };

    const result = await capture.executeTestWithEvidence(testConfig);
    console.log('\nResultado final:', JSON.stringify(result, null, 2));
  })();
}
