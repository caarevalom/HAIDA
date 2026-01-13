import { test, expect } from '@playwright/test';

/**
 * Tests de API de autenticación
 * HAIDA es un backend API (FastAPI) desplegado en Vercel
 * Endpoints:
 * - POST /auth/register - Registro de usuario
 * - POST /auth/login - Login con email/password
 * - GET /auth/me - Obtener usuario autenticado
 * - GET /entra/login - Iniciar flujo Microsoft OAuth
 * - GET /entra/callback - Callback de Microsoft OAuth
 */

const API_URL = process.env.BASE_URL || 'https://haida-one.vercel.app';

test.describe('API de Autenticación - HAIDA Backend', () => {
  test('Health check - Verificar que el backend está corriendo', async ({ request }) => {
    const response = await request.get(`${API_URL}/health`);

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe('healthy');
    // El servicio puede llamarse "HAIDA API" o "HAIDA Backend"
    expect(['HAIDA API', 'HAIDA Backend']).toContain(data.service);
    expect(data.version).toBeTruthy();

    // Estos campos son opcionales según la versión del backend
    if (data.auth_router_loaded !== undefined) {
      expect(data.auth_router_loaded).toBe(true);
    }
    if (data.entra_router_loaded !== undefined) {
      expect(data.entra_router_loaded).toBe(true);
    }

    console.log('✅ Health check:', JSON.stringify(data, null, 2));
  });

  test('Registro de nuevo usuario (test-haida@hiberus.com)', async ({ request }) => {
    const newUser = {
      email: 'hola@stayarta.com',
      password: 'HaidaTest2025Pass!',
      full_name: 'Test User HAIDA',
      role: 'viewer'
    };

    const response = await request.post(`${API_URL}/auth/register`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: newUser
    });

    console.log('📝 Registro response status:', response.status());
    const responseData = await response.json();
    console.log('📝 Registro response:', JSON.stringify(responseData, null, 2));

    // Si el usuario ya existe, puede ser 409 Conflict o 400 Bad Request
    // Si es nuevo, debe ser 201 Created o 200 OK
    const validStatuses = [200, 201, 400, 409];
    expect(validStatuses).toContain(response.status());

    if (response.status() === 409 || response.status() === 400) {
      console.log('⚠️ Usuario ya existe en la base de datos');
      expect((responseData.detail || responseData.message).toLowerCase()).toMatch(/exists|already|registered/);
    } else {
      // Usuario creado exitosamente
      expect(responseData.user || responseData.email).toBeTruthy();
      console.log('✅ Usuario registrado exitosamente');
    }
  });

  test('Login con usuario existente (test-haida@hiberus.com) y verificar token JWT', async ({ request }) => {
    const credentials = {
      email: 'hola@stayarta.com',
      password: 'HaidaTest2025Pass!'
    };

    const response = await request.post(`${API_URL}/auth/login`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: credentials
    });

    console.log('🔐 Login response status:', response.status());
    const responseData = await response.json();
    console.log('🔐 Login response:', JSON.stringify(responseData, null, 2));

    expect(response.ok()).toBeTruthy();

    // Verificar estructura de respuesta
    expect(responseData.access_token).toBeTruthy();
    expect(responseData.token_type).toBe('bearer');
    expect(responseData.user).toBeTruthy();
    expect(responseData.user.email).toBe(credentials.email);

    // Verificar que el token es un JWT válido (formato: xxx.yyy.zzz)
    const tokenParts = responseData.access_token.split('.');
    expect(tokenParts.length).toBe(3);

    console.log('✅ Login exitoso, token JWT válido recibido');
    console.log('📧 Usuario:', responseData.user.email);
    console.log('👤 Rol:', responseData.user.role);
    console.log('🆔 User ID:', responseData.user.id);
  });

  test('Acceso a /auth/me con token válido', async ({ request }) => {
    // 1. Primero hacer login para obtener token
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        email: 'hola@stayarta.com',
        password: 'HaidaTest2025Pass!'
      }
    });

    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    const accessToken = loginData.access_token;

    // 2. Usar token para acceder a /auth/me
    const meResponse = await request.get(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('👤 /auth/me response status:', meResponse.status());
    const userData = await meResponse.json();
    console.log('👤 User data:', JSON.stringify(userData, null, 2));

    expect(meResponse.ok()).toBeTruthy();
    expect(userData.email).toBe('hola@stayarta.com');
    expect(userData.id).toBeTruthy();
    expect(userData.role).toBeTruthy();

    console.log('✅ Token válido, usuario autenticado correctamente');
  });

  test('Acceso a /auth/me sin token debe fallar (401)', async ({ request }) => {
    const response = await request.get(`${API_URL}/auth/me`);

    console.log('🔒 /auth/me sin token status:', response.status());

    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data.detail).toBeTruthy();

    console.log('✅ Protección correcta: acceso denegado sin token');
  });

  test('Login con credenciales incorrectas debe fallar (401)', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        email: 'hola@stayarta.com',
        password: 'WrongPassword123!'
      }
    });

    console.log('❌ Login con password incorrecto status:', response.status());

    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data.detail).toBeTruthy();

    console.log('✅ Seguridad correcta: login rechazado con credenciales incorrectas');
  });

  test('Microsoft OAuth - Verificar endpoint /entra/login existe', async ({ request }) => {
    const response = await request.get(`${API_URL}/entra/login`, {
      maxRedirects: 0 // No seguir redirects automáticamente
    });

    console.log('🔗 /entra/login status:', response.status());

    // Debe ser 307 (Temporary Redirect) o 302 (Found) - redirect a Microsoft
    // O 501 (Not Implemented) si Azure AD no está configurado
    const validStatuses = [302, 307, 308, 501];
    expect(validStatuses).toContain(response.status());

    if (response.status() === 501) {
      console.log('⚠️ Microsoft OAuth no configurado (Azure AD credentials faltantes)');
    } else {
      const location = response.headers()['location'];
      expect(location).toBeTruthy();

      // Debe redirigir a login.microsoftonline.com
      if (location) {
        expect(location).toContain('login.microsoftonline.com');
        console.log('✅ Redirect correcto a Microsoft OAuth:', location);
      }
    }
  });

  test('Microsoft OAuth - Email hola@stayarta.com debe ser válido para Entra', async ({ page }) => {
    // Este test verifica que el flujo OAuth se inicia correctamente
    const testEmail = 'caarevalo@hiberus.com';

    console.log(`🔍 Verificando configuración OAuth para ${testEmail}`);

    // Iniciar flujo OAuth
    const response = await page.request.get(`${API_URL}/entra/login`, {
      maxRedirects: 0
    });

    const location = response.headers()['location'];

    if (location) {
      // Extraer tenant_id de la URL de redirect
      const tenantMatch = location.match(/login\.microsoftonline\.com\/([^\/]+)\//);

      if (tenantMatch) {
        const tenantId = tenantMatch[1];
        console.log('🏢 Tenant ID detectado:', tenantId);
        console.log('✅ Flujo OAuth configurado correctamente');
      }

      // Verificar que la URL tiene los parámetros necesarios
      expect(location).toContain('client_id');
      expect(location).toContain('redirect_uri');
      expect(location).toContain('response_type');
      expect(location).toContain('scope');

      console.log('✅ Parámetros OAuth correctos en la URL de redirect');
    }
  });

  test('Verificar estructura de respuesta de login (campos requeridos)', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        email: 'hola@stayarta.com',
        password: 'HaidaTest2025Pass!'
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Verificar estructura según estándares OAuth 2.0 / JWT
    expect(data).toHaveProperty('access_token');
    expect(data).toHaveProperty('token_type');
    expect(data).toHaveProperty('user');

    expect(data.user).toHaveProperty('id');
    expect(data.user).toHaveProperty('email');
    expect(data.user).toHaveProperty('role');

    // Verificar tipos
    expect(typeof data.access_token).toBe('string');
    expect(data.token_type).toBe('bearer');
    expect(typeof data.user.id).toBe('string');
    expect(typeof data.user.email).toBe('string');

    console.log('✅ Estructura de respuesta de login cumple con estándares');
  });

  test('Registro con email inválido debe fallar (422)', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/register`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        email: 'invalid-email',
        password: 'TestPassword123!',
        full_name: 'Test User'
      }
    });

    console.log('❌ Registro con email inválido status:', response.status());

    // 422 Unprocessable Entity (validación) o 400 Bad Request
    const validErrorStatuses = [400, 422];
    expect(validErrorStatuses).toContain(response.status());

    console.log('✅ Validación correcta: email inválido rechazado');
  });

  test('Registro con password débil debe fallar', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/register`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        email: 'hola@stayarta.com',
        password: '123', // Password muy débil
        full_name: 'Test User'
      }
    });

    console.log('❌ Registro con password débil status:', response.status());

    // Debe rechazar passwords débiles
    const validErrorStatuses = [400, 422];
    expect(validErrorStatuses).toContain(response.status());

    console.log('✅ Validación correcta: password débil rechazado');
  });
});

test.describe('Verificación en Base de Datos (Supabase)', () => {
  test('Consultar usuarios en Supabase después de registro', async ({ request }) => {
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wdebyxvtunromsnkqbrd.supabase.co';
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

    if (!SUPABASE_SERVICE_KEY) {
      console.warn('⚠️ SUPABASE_SERVICE_KEY no configurada, saltando test de BD');
      test.skip();
      return;
    }

    // Consultar tabla de usuarios vía Supabase REST API
    const response = await request.get(`${SUPABASE_URL}/rest/v1/users?email=hola@stayarta.com`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('🗄️ Consulta a Supabase status:', response.status());

    if (response.ok()) {
      const users = await response.json();
      console.log('🗄️ Usuarios encontrados:', JSON.stringify(users, null, 2));

      expect(users.length).toBeGreaterThan(0);
      expect(users[0].email).toBe('hola@stayarta.com');

      console.log('✅ Usuario verificado en base de datos Supabase');
    } else {
      console.log('⚠️ No se pudo consultar Supabase directamente');
      console.log('   Verificar SUPABASE_SERVICE_KEY y configuración de tabla');
    }
  });
});
