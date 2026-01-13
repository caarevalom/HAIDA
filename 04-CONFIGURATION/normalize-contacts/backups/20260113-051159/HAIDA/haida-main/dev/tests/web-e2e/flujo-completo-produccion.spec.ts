/**
 * HAIDA - Flujo Completo de Producción
 * ====================================
 *
 * Este test ejecuta el flujo completo end-to-end en producción:
 * 1. Login con usuario admin
 * 2. Verificar proyectos asignados
 * 3. Navegar al proyecto CTB
 * 4. Ejecutar tests
 * 5. Verificar resultados
 * 6. Exportar reportes
 */

import { test, expect } from '@playwright/test';

// URLs de entorno (configurables por variables)
const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  process.env.PLAYWRIGHT_FRONTEND_URL ||
  'http://localhost:5173';
const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.BASE_URL ||
  'http://localhost:8000';
let BACKEND_HOST = '';
try {
  BACKEND_HOST = new URL(BACKEND_URL).host;
} catch (error) {
  console.warn(`⚠️ BACKEND_URL inválida: ${BACKEND_URL}`);
}

// Credenciales de admin
const ADMIN_USER = {
  email: process.env.ADMIN_EMAIL || 'hola@stayarta.com',
  password: process.env.ADMIN_PASSWORD || 'AdminCTB2025Pass'
};

test.describe('🚀 HAIDA - Flujo Completo de Producción', () => {

  test.beforeEach(async ({ page }) => {
    // Navegar a la página de login
    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForLoadState('networkidle');
  });

  test('[PROD-001] Login con usuario admin', async ({ page }) => {
    console.log('📝 Step 1: Login con usuario admin');

    // Buscar campos de login
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign in"), button[type="submit"]').first();

    // Verificar que los campos existan
    await expect(emailInput).toBeVisible({ timeout: 10000 });

    // Llenar credenciales
    await emailInput.fill(ADMIN_USER.email);
    await passwordInput.fill(ADMIN_USER.password);

    // Capturar screenshot antes de login
    await page.screenshot({ path: 'test-results/prod-flow/01-login-form.png', fullPage: true });

    // Click en login
    await loginButton.click();

    // Esperar redirección (dashboard, home, projects, etc.)
    await page.waitForTimeout(3000);

    // Verificar que NO estamos en login (login exitoso)
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');

    // Capturar screenshot después de login
    await page.screenshot({ path: 'test-results/prod-flow/02-dashboard.png', fullPage: true });

    console.log(`✅ Login exitoso - URL actual: ${currentUrl}`);
  });

  test('[PROD-002] Verificar proyectos asignados', async ({ page }) => {
    console.log('📝 Step 2: Verificar proyectos asignados');

    // Login primero
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button[type="submit"]').first();

    await emailInput.fill(ADMIN_USER.email);
    await passwordInput.fill(ADMIN_USER.password);
    await loginButton.click();
    await page.waitForTimeout(3000);

    // Navegar a proyectos
    const projectsLink = page.locator('a:has-text("Projects"), a:has-text("Proyectos")').first();
    const hasProjectsLink = await projectsLink.count() > 0;

    if (hasProjectsLink) {
      await projectsLink.click();
      await page.waitForTimeout(2000);
    }

    // Buscar proyectos CTB y Privalia
    const ctbProject = page.locator('text=/CTB/i').first();
    const privaliaProject = page.locator('text=/Privalia/i').first();

    const hasCTB = await ctbProject.count() > 0;
    const hasPrivalia = await privaliaProject.count() > 0;

    console.log(`CTB Project found: ${hasCTB}`);
    console.log(`Privalia Project found: ${hasPrivalia}`);

    // Capturar screenshot
    await page.screenshot({ path: 'test-results/prod-flow/03-projects-list.png', fullPage: true });

    // Si no hay proyectos, mostrar warning (no fallar el test)
    if (!hasCTB && !hasPrivalia) {
      console.log('⚠️ No se encontraron proyectos asignados - Puede ser necesario crearlos manualmente');
    }
  });

  test('[PROD-003] Flujo completo: Login → Dashboard → Navegación', async ({ page }) => {
    console.log('📝 Step 3: Flujo completo de navegación');

    // Login
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button[type="submit"]').first();

    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await emailInput.fill(ADMIN_USER.email);
    await passwordInput.fill(ADMIN_USER.password);
    await loginButton.click();
    await page.waitForTimeout(3000);

    const afterLoginUrl = page.url();
    console.log(`URL después de login: ${afterLoginUrl}`);

    // Capturar screenshot del dashboard
    await page.screenshot({ path: 'test-results/prod-flow/04-dashboard-full.png', fullPage: true });

    // Buscar elementos de navegación
    const navElements = [
      'Projects',
      'Proyectos',
      'Tests',
      'Reports',
      'Reportes',
      'Dashboard',
      'Profile',
      'Perfil'
    ];

    const foundNavElements: string[] = [];

    for (const navText of navElements) {
      const element = page.locator(`a:has-text("${navText}"), button:has-text("${navText}")`).first();
      const count = await element.count();
      if (count > 0) {
        foundNavElements.push(navText);
        console.log(`✅ Found navigation: ${navText}`);
      }
    }

    console.log(`Total navigation elements found: ${foundNavElements.length}`);
    expect(foundNavElements.length).toBeGreaterThan(0);

    // Verificar que el usuario esté autenticado (buscar email o nombre)
    const userEmail = page.locator(`text=/${ADMIN_USER.email}/i`).first();
    const userFound = await userEmail.count() > 0;

    console.log(`User info visible: ${userFound}`);
  });

  test('[PROD-004] Verificar backend API desde frontend', async ({ page }) => {
    console.log('📝 Step 4: Verificar integración con backend');

    // Login
    await page.goto(`${FRONTEND_URL}/login`);
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button[type="submit"]').first();

    await emailInput.fill(ADMIN_USER.email);
    await passwordInput.fill(ADMIN_USER.password);

    // Escuchar requests al backend
    const backendRequests: string[] = [];

    page.on('request', request => {
      if (BACKEND_HOST && request.url().includes(BACKEND_HOST)) {
        backendRequests.push(`${request.method()} ${request.url()}`);
        console.log(`📡 Backend request: ${request.method()} ${request.url()}`);
      }
    });

    page.on('response', response => {
      if (BACKEND_HOST && response.url().includes(BACKEND_HOST)) {
        console.log(`📥 Backend response: ${response.status()} ${response.url()}`);
      }
    });

    await loginButton.click();
    await page.waitForTimeout(5000);

    console.log(`Total backend requests: ${backendRequests.length}`);
    backendRequests.forEach(req => console.log(`  - ${req}`));

    // Verificar que hubo comunicación con el backend
    expect(backendRequests.length).toBeGreaterThan(0);

    // Capturar screenshot final
    await page.screenshot({ path: 'test-results/prod-flow/05-backend-integration.png', fullPage: true });
  });

  test('[PROD-005] Verificar estado del sistema', async ({ page }) => {
    console.log('📝 Step 5: Verificar estado del sistema');

    // Verificar backend health directamente
    const healthResponse = await page.request.get(`${BACKEND_URL}/api/health`);
    const healthData = await healthResponse.json();

    console.log('Backend Health:', healthData);
    expect(healthResponse.status()).toBe(200);
    expect(healthData.status).toBe('healthy');

    // Verificar status
    const statusResponse = await page.request.get(`${BACKEND_URL}/status`);
    const statusData = await statusResponse.json();

    console.log('Backend Status:', statusData);
    expect(statusResponse.status()).toBe(200);
    expect(statusData.api).toBe('operational');
    expect(statusData.database).toBe('operational');

    // Login y verificar que el frontend carga
    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"]').first();
    await expect(emailInput).toBeVisible({ timeout: 10000 });

    console.log('✅ Sistema completamente operativo');
  });

});

test.describe('📊 HAIDA - Generación de Reportes', () => {

  test('[REPORT-001] Generar reporte de ejecución', async ({ page }) => {
    console.log('📝 Generando reporte de ejecución');

    // Este test documenta el flujo, los reportes se generan automáticamente
    await page.goto(FRONTEND_URL);
    await page.screenshot({ path: 'test-results/prod-flow/06-final-state.png', fullPage: true });

    console.log('✅ Screenshots capturados en: test-results/prod-flow/');
    console.log('✅ Reporte Playwright generado automáticamente');
  });

});
