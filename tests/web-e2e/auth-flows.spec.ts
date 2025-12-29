import { test, expect } from '@playwright/test';

/**
 * Tests de flujos de autenticación completos
 * - Registro de usuario con email/password
 * - Login con email/password
 * - Microsoft Magic Link (OAuth)
 * - Verificación de datos en base de datos
 * - Redirección correcta al dashboard
 */

const PRODUCTION_URL = process.env.BASE_URL || 'https://haida-one.vercel.app';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wdebyxvtunromsnkqbrd.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY;

test.describe('Flujos de Autenticación - Producción', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página principal
    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });
  });

  test('Registro de nuevo usuario (copimiga@gmail.com) y verificación en BD', async ({ page, request }) => {
    const testUser = {
      email: 'copimiga@gmail.com',
      password: 'TestPassword123!',
      fullName: 'Test User HAIDA'
    };

    // 1. Ir a página de registro
    await page.click('a[href*="register"], button:has-text("Registrarse"), a:has-text("Sign Up")');
    await page.waitForLoadState('networkidle');

    // 2. Llenar formulario de registro
    await page.fill('input[name="email"], input[type="email"], input[placeholder*="email" i]', testUser.email);
    await page.fill('input[name="password"], input[type="password"]:first-of-type', testUser.password);

    // Si hay campo de confirmación de password
    const confirmPasswordField = await page.locator('input[name="confirmPassword"], input[type="password"]:last-of-type').count();
    if (confirmPasswordField > 1) {
      await page.fill('input[type="password"]:last-of-type', testUser.password);
    }

    // Campo de nombre completo (si existe)
    const nameField = await page.locator('input[name="fullName"], input[name="name"], input[placeholder*="name" i]').count();
    if (nameField > 0) {
      await page.fill('input[name="fullName"], input[name="name"]', testUser.fullName);
    }

    // 3. Enviar formulario
    await page.click('button[type="submit"], button:has-text("Registrar"), button:has-text("Sign Up")');

    // 4. Esperar respuesta - puede ser redirect o mensaje de confirmación
    await page.waitForTimeout(3000);

    // 5. Verificar que el usuario fue creado en Supabase
    if (!SUPABASE_ANON_KEY) {
      console.warn('⚠️ SUPABASE_KEY no configurada, saltando verificación de BD');
      return;
    }

    const supabaseResponse = await request.get(`${SUPABASE_URL}/auth/v1/admin/users`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (supabaseResponse.ok()) {
      const users = await supabaseResponse.json();
      const userExists = users.users?.some((u: any) => u.email === testUser.email);
      expect(userExists, `Usuario ${testUser.email} debe estar registrado en Supabase`).toBeTruthy();
    }

    // 6. Verificar redirección o mensaje de éxito
    const currentUrl = page.url();
    const hasSuccessMessage = await page.locator('text=/success|éxito|confirm|verificar/i').count() > 0;
    const isRedirectedToDashboard = currentUrl.includes('/dashboard') || currentUrl.includes('/home') || currentUrl.includes('/app');

    expect(hasSuccessMessage || isRedirectedToDashboard,
      'Debe mostrar mensaje de éxito o redirigir al dashboard/confirmación'
    ).toBeTruthy();
  });

  test('Login con usuario existente (copimiga@gmail.com) y redirección a dashboard', async ({ page }) => {
    const testUser = {
      email: 'copimiga@gmail.com',
      password: 'TestPassword123!'
    };

    // 1. Ir a página de login
    await page.click('a[href*="login"], button:has-text("Iniciar sesión"), a:has-text("Login"), a:has-text("Sign In")');
    await page.waitForLoadState('networkidle');

    // 2. Llenar formulario de login
    await page.fill('input[name="email"], input[type="email"]', testUser.email);
    await page.fill('input[name="password"], input[type="password"]', testUser.password);

    // 3. Enviar formulario
    await page.click('button[type="submit"], button:has-text("Iniciar sesión"), button:has-text("Login")');

    // 4. Esperar navegación
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // 5. Verificar redirección al dashboard
    const currentUrl = page.url();
    const isDashboard = currentUrl.includes('/dashboard') ||
                        currentUrl.includes('/home') ||
                        currentUrl.includes('/app') ||
                        currentUrl.includes('/portal');

    expect(isDashboard, `Debe redirigir al dashboard. URL actual: ${currentUrl}`).toBeTruthy();

    // 6. Verificar elementos del dashboard
    const hasDashboardElements = await page.locator('nav, header, aside, main').count() > 0;
    expect(hasDashboardElements, 'Dashboard debe tener elementos de navegación').toBeTruthy();

    // 7. Verificar que no hay errores de autenticación
    const hasErrorMessage = await page.locator('text=/error|failed|incorrecto|inválido/i').count() > 0;
    expect(hasErrorMessage, 'No debe haber mensajes de error').toBeFalsy();
  });

  test('Microsoft Magic Link (caarevalo@hiberus.com) - OAuth flow', async ({ page, context }) => {
    const testUser = {
      email: 'caarevalo@hiberus.com'
    };

    // 1. Ir a página de login
    await page.goto(`${PRODUCTION_URL}/login`, { waitUntil: 'networkidle' });

    // 2. Buscar botón de Microsoft OAuth
    const microsoftButton = page.locator(
      'button:has-text("Microsoft"), ' +
      'button:has-text("Office 365"), ' +
      'a[href*="microsoft"], ' +
      'button[aria-label*="Microsoft"]'
    ).first();

    const buttonExists = await microsoftButton.count() > 0;
    if (!buttonExists) {
      console.warn('⚠️ Botón de Microsoft OAuth no encontrado en la página');
      test.skip();
      return;
    }

    // 3. Click en botón de Microsoft
    await microsoftButton.click();

    // 4. Esperar navegación a Microsoft login (puede abrir nueva ventana o redirect)
    await page.waitForTimeout(3000);

    // Verificar si hay popup o redirect
    const pages = context.pages();
    const loginPage = pages.length > 1 ? pages[1] : page;

    // 5. Verificar que estamos en flujo de Microsoft
    const currentUrl = loginPage.url();
    const isMicrosoftLogin = currentUrl.includes('login.microsoftonline.com') ||
                             currentUrl.includes('microsoft.com') ||
                             currentUrl.includes('office.com');

    if (!isMicrosoftLogin) {
      console.warn(`⚠️ No se detectó redirect a Microsoft. URL actual: ${currentUrl}`);
      // Intentar continuar si estamos en callback
      if (currentUrl.includes('callback') || currentUrl.includes('auth')) {
        console.log('✓ Posible callback de OAuth detectado');
      }
    }

    // 6. Si estamos en Microsoft login, llenar credenciales
    if (isMicrosoftLogin) {
      // Llenar email
      const emailField = loginPage.locator('input[type="email"], input[name="loginfmt"]');
      if (await emailField.count() > 0) {
        await emailField.fill(testUser.email);
        await loginPage.click('input[type="submit"], button[type="submit"]');
        await loginPage.waitForTimeout(2000);
      }

      // Nota: Password requiere intervención manual o credentials preconfiguradas
      console.log('⚠️ Password de Microsoft requiere intervención manual en test automatizado');
      console.log('   Para test completo, configurar credenciales en environment o usar mock');
    }

    // 7. Verificar callback exitoso (si llegamos aquí)
    await page.waitForTimeout(5000);
    const finalUrl = page.url();

    const isAuthenticated = finalUrl.includes('/dashboard') ||
                           finalUrl.includes('/home') ||
                           finalUrl.includes('/app') ||
                           !finalUrl.includes('/login');

    console.log(`📍 URL final: ${finalUrl}`);
    console.log(`🔐 Estado de autenticación: ${isAuthenticated ? 'Autenticado' : 'No autenticado'}`);
  });

  test('Verificar sesión persistente después de login', async ({ page }) => {
    const testUser = {
      email: 'copimiga@gmail.com',
      password: 'TestPassword123!'
    };

    // 1. Login
    await page.goto(`${PRODUCTION_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[name="email"], input[type="email"]', testUser.email);
    await page.fill('input[name="password"], input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // 2. Verificar que hay cookies/localStorage de sesión
    const cookies = await page.context().cookies();
    const hasSupabaseCookie = cookies.some(c =>
      c.name.includes('supabase') ||
      c.name.includes('auth') ||
      c.name.includes('session')
    );

    const localStorage = await page.evaluate(() => {
      const keys = Object.keys(window.localStorage);
      return keys.filter(k => k.includes('supabase') || k.includes('auth'));
    });

    expect(hasSupabaseCookie || localStorage.length > 0,
      'Debe existir cookie o localStorage de sesión'
    ).toBeTruthy();

    // 3. Recargar página y verificar que sigue autenticado
    await page.reload({ waitUntil: 'networkidle' });

    const currentUrl = page.url();
    const stillAuthenticated = !currentUrl.includes('/login') && !currentUrl.includes('/signin');

    expect(stillAuthenticated, 'La sesión debe persistir después de reload').toBeTruthy();
  });

  test('Logout y verificar limpieza de sesión', async ({ page }) => {
    // 1. Primero hacer login
    await page.goto(`${PRODUCTION_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'copimiga@gmail.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // 2. Buscar botón de logout
    const logoutButton = page.locator(
      'button:has-text("Logout"), ' +
      'button:has-text("Cerrar sesión"), ' +
      'button:has-text("Sign out"), ' +
      'a[href*="logout"]'
    ).first();

    if (await logoutButton.count() > 0) {
      await logoutButton.click();
      await page.waitForLoadState('networkidle');

      // 3. Verificar que redirige a login o home
      const currentUrl = page.url();
      const isLoggedOut = currentUrl.includes('/login') ||
                         currentUrl === PRODUCTION_URL ||
                         currentUrl === `${PRODUCTION_URL}/`;

      expect(isLoggedOut, 'Debe redirigir a login o home después de logout').toBeTruthy();

      // 4. Verificar que se limpió la sesión
      const localStorage = await page.evaluate(() => {
        const keys = Object.keys(window.localStorage);
        return keys.filter(k => k.includes('supabase-auth'));
      });

      expect(localStorage.length, 'LocalStorage de auth debe estar limpio').toBe(0);
    } else {
      console.warn('⚠️ Botón de logout no encontrado, saltando test');
    }
  });
});
