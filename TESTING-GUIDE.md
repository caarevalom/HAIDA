# 🧪 HAIDA - Guía de Testing

**Fecha**: 2025-12-26
**Estado**: ✅ Tests Configurados
**Frameworks**: Playwright, Newman, Lighthouse

---

## 📊 **RESULTADO DE TESTS**

### **Primera Ejecución**
- **Total**: 15 tests ejecutados
- **Fallados**: 15 (100%)
- **Razón**: Backend no estaba corriendo en localhost:8000

### **Causa del Fallo**
Los tests están configurados para testear `http://localhost:8000` pero:
1. El servidor backend FastAPI no está corriendo localmente
2. La aplicación está desplegada en Vercel (producción)

---

## ✅ **SOLUCIONES**

### **Opción 1: Testear Producción (Recomendado)**

Actualizar `.env` para usar la URL de producción:

```bash
# Editar .env
nano .env

# Cambiar esta línea:
# BASE_URL=http://localhost:8000

# Por esta:
BASE_URL=https://haida-one.vercel.app
```

Luego ejecutar tests:
```bash
npm run test:web
```

**Ventajas**:
- ✅ No requiere servidor local
- ✅ Testea ambiente de producción real
- ✅ Funcionará inmediatamente

**Desventajas**:
- ⚠️ Consume minutos de Vercel
- ⚠️ Tests más lentos (red)

---

### **Opción 2: Levantar Backend Local**

Si quieres testear localmente:

```bash
# Opción A: Con Docker
docker-compose up -d
# Esperar a que backend esté en http://localhost:8000

# Opción B: Sin Docker (Python)
cd /path/to/backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Luego ejecutar tests:
```bash
npm run test:web
```

**Ventajas**:
- ✅ Tests más rápidos
- ✅ No consume recursos externos
- ✅ Permite debugging local

**Desventajas**:
- ⚠️ Requiere configurar backend
- ⚠️ Más setup inicial

---

### **Opción 3: Testear Múltiples Ambientes**

Crear archivos de environment separados:

```bash
# .env.test (para tests locales)
BASE_URL=http://localhost:8000

# .env.test.production (para tests de producción)
BASE_URL=https://haida-one.vercel.app

# .env.test.preview (para tests de preview)
BASE_URL=https://haida-e74i5stak-carlos-arevalos-projects-cf7340ea.vercel.app
```

Ejecutar con environment específico:
```bash
# Tests locales
BASE_URL=http://localhost:8000 npm run test:web

# Tests producción
BASE_URL=https://haida-one.vercel.app npm run test:web

# Tests preview
BASE_URL=https://haida-e74i5stak-carlos-arevalos-projects-cf7340ea.vercel.app npm run test:web
```

---

## 🎯 **CONFIGURACIÓN RECOMENDADA**

### **Para Desarrollo**

**1. Actualizar .env:**
```bash
# Usar producción por defecto para tests
BASE_URL=https://haida-one.vercel.app
```

**2. Agregar scripts en package.json** (ya agregados):
```json
{
  "scripts": {
    "test:web:local": "BASE_URL=http://localhost:8000 playwright test",
    "test:web:prod": "BASE_URL=https://haida-one.vercel.app playwright test",
    "test:web:preview": "BASE_URL=https://haida-e74i5stak-... playwright test"
  }
}
```

**3. Ejecutar tests:**
```bash
# Producción (por defecto)
npm run test:web

# Local (si backend está corriendo)
npm run test:web:local

# Preview branch
npm run test:web:preview
```

---

## 📋 **TESTS DISPONIBLES**

### **Web E2E (Playwright)**

**Archivo**: `tests/web-e2e/smoke.spec.ts`

**Tests incluidos**:
1. ✅ **Home carga sin errores y estado OK**
   - Verifica que la página carga (HTTP 200-399)
   - No hay errores de consola
   - No hay overflow horizontal
   - Todas las imágenes cargan
   - Título de página existe

2. ✅ **Enlaces internos no rotos (HEAD/GET)**
   - Extrae todos los enlaces internos
   - Verifica cada enlace (max 50)
   - Detecta enlaces rotos (HTTP 400+)

**Archivo**: `tests/web-e2e/accessibility.spec.ts`

**Tests incluidos**:
1. ✅ **Accesibilidad básica (WCAG) en home**
   - Ejecuta axe-core WCAG 2.1 AA
   - Detecta violaciones de accesibilidad
   - Genera reporte detallado

### **API Tests (Newman)**

**Archivo**: `tests/api/collection.json`

**Estado**: Configurado (collection vacía)

**Uso**:
```bash
npm run test:api
```

### **Performance (Lighthouse)**

**Configuración**: `configs/lighthouse.config.js`

**Uso**:
```bash
npm run lighthouse
```

---

## 🔧 **CONFIGURACIÓN ACTUAL**

### **Playwright Config**

```typescript
// playwright.config.ts
{
  testDir: './tests',
  timeout: 60000,  // 60 segundos
  retries: 1,      // 1 retry en caso de fallo
  fullyParallel: true,

  browsers: [
    'Desktop Chrome',
    'Desktop Firefox',
    'Desktop Safari',
    'iPhone 14',
    'Pixel 7'
  ],

  reporters: [
    'list',           // Console output
    'html',           // HTML report
    'allure-playwright' // Allure report
  ]
}
```

### **Variables de Environment**

```env
BASE_URL=http://localhost:8000  # ← Cambiar a producción
TEST_TIMEOUT=30000
HEADLESS=true
SLOWMO=0
```

---

## 📊 **EJECUTAR TESTS**

### **Comandos Básicos**

```bash
# Todos los tests, todos los navegadores
npm run test:web

# UI mode (interactivo)
npm run test:web:ui

# Debug mode
npm run test:web:debug

# Solo Chrome
npx playwright test --project="Desktop Chrome"

# Solo un archivo
npx playwright test smoke.spec.ts

# Headed mode (ver navegador)
npx playwright test --headed
```

### **Ver Reportes**

```bash
# HTML report (Playwright)
npm run report
# Abre en: http://localhost:9323

# Allure report
npm run allure:generate
npm run allure:open
# Abre en: http://localhost:4040
```

---

## 🎨 **PERSONALIZAR TESTS**

### **Crear Nuevo Test**

```typescript
// tests/web-e2e/mi-test.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Mi funcionalidad', () => {
  test('debe hacer X', async ({ page }) => {
    await page.goto('/');

    // Tu código de test aquí
    const title = await page.title();
    expect(title).toContain('HAIDA');
  });
});
```

### **Agregar al Collection Newman**

```json
// tests/api/collection.json
{
  "info": {
    "name": "HAIDA API Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{BASE_URL}}/health"
      },
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status is 200', function () {",
              "  pm.response.to.have.status(200);",
              "});"
            ]
          }
        }
      ]
    }
  ]
}
```

---

## 🐛 **TROUBLESHOOTING**

### **Error: "page.goto: net::ERR_CONNECTION_REFUSED"**

**Causa**: Backend no está corriendo en localhost:8000

**Solución**:
```bash
# Opción 1: Cambiar BASE_URL a producción
echo "BASE_URL=https://haida-one.vercel.app" >> .env

# Opción 2: Levantar backend local
docker-compose up -d
```

### **Error: "Timeout 60000ms exceeded"**

**Causa**: Página tarda mucho en cargar

**Solución**:
```bash
# Aumentar timeout en playwright.config.ts
timeout: 120000  # 120 segundos
```

### **Error: "All tests failed"**

**Causa**: Probablemente BASE_URL incorrecta

**Solución**:
```bash
# Verificar URL
echo $BASE_URL

# Verificar que la URL responde
curl -I https://haida-one.vercel.app
```

### **Error: "Browser not found"**

**Causa**: Browsers de Playwright no instalados

**Solución**:
```bash
npx playwright install --with-deps
```

---

## 📈 **MEJORES PRÁCTICAS**

### **1. Tests Independientes**
- Cada test debe poder ejecutarse solo
- No depender del estado de otros tests
- Limpiar data después de cada test

### **2. Selectores Estables**
```typescript
// ❌ Malo (frágil)
await page.click('button:nth-child(2)');

// ✅ Bueno (estable)
await page.click('[data-testid="submit-button"]');
await page.getByRole('button', { name: 'Submit' }).click();
```

### **3. Esperas Explícitas**
```typescript
// ❌ Malo (puede fallar)
await page.click('button');
const text = await page.textContent('.result');

// ✅ Bueno (espera a que exista)
await page.click('button');
await page.waitForSelector('.result');
const text = await page.textContent('.result');
```

### **4. Assertions Descriptivos**
```typescript
// ❌ Malo
expect(title).toBeTruthy();

// ✅ Bueno
expect(title, 'El título de la página debe existir').toBeTruthy();
expect(title).toContain('HAIDA', 'El título debe contener HAIDA');
```

---

## 🎯 **PRÓXIMOS PASOS**

### **Inmediato**
1. ✅ Actualizar `BASE_URL` en .env a producción
2. ✅ Ejecutar `npm run test:web`
3. ✅ Verificar que tests pasan

### **Corto Plazo**
1. 📝 Agregar más tests E2E (login, registro, etc.)
2. 📝 Completar collection de Newman con tests API
3. 📝 Configurar Lighthouse CI

### **Medio Plazo**
1. 📝 Integrar tests en CI/CD (ya configurado)
2. 📝 Coverage target: 80%+
3. 📝 Visual regression testing

---

## 📞 **SOPORTE**

- **Tests fallando**: Revisa esta guía primero
- **Issues**: GitHub Issues
- **Preguntas**: haida-po@hiberus.com

---

**Última actualización**: 2025-12-26
**Próxima acción**: Actualizar BASE_URL y re-ejecutar tests
