# 📱 Configuración: Appium para Testing Mobile

**Autor:** Carlos Arévalo | hola@stayarta.com

---

## 1. Instalación de Appium

### Opción A: Vía npm (Recomendado)

```powershell
# Instalar Appium globalmente
npm install -g appium

# Verificar instalación
appium --version

# Instalar drivers necesarios
appium driver install uiautomator2  # Android
appium driver install xcuitest       # iOS
```

### Opción B: Desde proyecto local

```powershell
cd c:\Users\CarlosArturoArevaloM\Documents\Proyectos\qa-starter-kit

npm install appium --save-dev
npm install appium-uiautomator2-driver --save-dev
npm install appium-xcuitest-driver --save-dev
```

---

## 2. Configuración para Android (Real Devices)

### Paso 1: Requisitos previos

1. **Android SDK instalado** (mínimo Android 8.0 - API 26)
2. **ADB (Android Debug Bridge) configurado**
3. **Dispositivo Android con USB Debugging activado**

### Paso 2: Activar USB Debugging

**En el dispositivo:**

1. Abre **Configuración** → **Sistema** → **Acerca del dispositivo**
2. Toca 7 veces en **Número de compilación**
3. Abre **Opciones de desarrollo**
4. Activa **Depuración USB**
5. Conecta el dispositivo al PC vía USB

### Paso 3: Verificar conexión ADB

```powershell
# Listar dispositivos conectados
adb devices

# Debe aparecer algo como:
# List of attached devices
# +34662652300:5555          device
# emulator-5554                device
```

### Paso 4: Configuración de Appium para Android

Crea archivo: `haida/configs/appium-android.json`

```json
{
  "automationName": "UiAutomator2",
  "platformName": "Android",
  "platformVersion": "13",
  "deviceName": "Android Device",
  "app": "${project_root}/apps/android-app.apk",
  "appPackage": "com.example.app",
  "appActivity": ".MainActivity",
  "autoGrantPermissions": true,
  "newCommandTimeout": 300,
  "noReset": false,
  "fullReset": false,
  "udid": "+34662652300:5555"
}
```

---

## 3. Configuración para iOS (Real Devices)

### Paso 1: Requisitos previos

**Solo funciona en macOS:**

1. Xcode instalado (versión mínima 13.0)
2. iOS Deployment Target: 14.0+
3. Dispositivo iOS conectado vía USB

### Paso 2: Preparar dispositivo iOS

1. Conecta iPhone/iPad al Mac vía USB
2. Abre Xcode → Device and Simulators
3. Verifica que el dispositivo aparezca en la lista
4. Confía en el certificado de desarrollo

### Paso 3: Configuración de Appium para iOS

Crea archivo: `haida/configs/appium-ios.json`

```json
{
  "automationName": "XCUITest",
  "platformName": "iOS",
  "platformVersion": "17",
  "deviceName": "iPhone",
  "app": "${project_root}/apps/ios-app.ipa",
  "bundleId": "com.example.app",
  "autoAcceptAlerts": true,
  "newCommandTimeout": 300,
  "noReset": false,
  "xcodeOrgId": "YOUR_TEAM_ID",
  "xcodeSigningId": "iPhone Developer"
}
```

---

## 4. Configuración Appium Server

### Opción A: Iniciar servidor manualmente

```powershell
# Terminal 1: Iniciar servidor Appium
appium --port 4723 --log-level debug

# Terminal 2: Ejecutar tests
npm run test:mobile
```

### Opción B: Configuración automática

Crea archivo: `haida/configs/appium-server.json`

```json
{
  "port": 4723,
  "address": "127.0.0.1",
  "logLevel": "debug",
  "log": "./logs/appium.log",
  "nodeConfig": {
    "cleanUpCycle": 2000,
    "timeout": 30000,
    "newCommandTimeout": 300
  }
}
```

Usa con:

```powershell
appium --config-file haida/configs/appium-server.json
```

---

## 5. Tests Playwright + Appium Integration

### Archivo: `haida/generators/mobile-test-runner.ts`

```typescript
import { test, expect, devices } from '@playwright/test';

const APPIUM_PORT = 4723;
const APPIUM_HOST = 'localhost';

// Configuración Android
const androidCapabilities = {
  'appium:automationName': 'UiAutomator2',
  platformName: 'Android',
  'appium:deviceName': 'emulator-5554',
  'appium:app': process.cwd() + '/apps/android-app.apk',
  'appium:appPackage': 'com.example.app',
  'appium:appActivity': '.MainActivity',
  'appium:autoGrantPermissions': true,
};

// Configuración iOS
const iosCapabilities = {
  'appium:automationName': 'XCUITest',
  platformName: 'iOS',
  'appium:deviceName': 'iPhone 14',
  'appium:platformVersion': '17',
  'appium:bundleId': 'com.example.app',
  'appium:xcodeOrgId': 'YOUR_TEAM_ID',
};

test.describe('Mobile Testing - HAIDA', () => {
  test('Android: Login Flow', async () => {
    const capabilities = androidCapabilities;

    const context = await chromium.launchPersistentContext(`http://${APPIUM_HOST}:${APPIUM_PORT}`, {
      ...devices['Pixel 5'],
      launchArgs: [`--disable-blink-features=AutomationControlled`],
    });

    const page = context.newPage();

    // Interactuar con app
    await page.click('id=com.example.app:id/login_button');
    await page.fill('id=com.example.app:id/email_input', 'hola@stayarta.com');
    await page.fill('id=com.example.app:id/password_input', 'password123');

    // Validaciones
    await page.waitForSelector('id=com.example.app:id/welcome_message');
    const message = await page.textContent('id=com.example.app:id/welcome_message');
    expect(message).toBe('Welcome!');

    await context.close();
  });

  test('iOS: Navigation Flow', async () => {
    const capabilities = iosCapabilities;

    const context = await webkit.launchPersistentContext(`http://${APPIUM_HOST}:${APPIUM_PORT}`, {
      ...devices['iPhone 14'],
    });

    const page = context.newPage();

    // Interactuar con app
    await page.click('id=homeTabButton');
    await page.waitForSelector('id=homeScreen');

    // Validaciones
    const title = await page.getAttribute('id=screenTitle', 'text');
    expect(title).toContain('Home');

    await context.close();
  });
});
```

---

## 6. Verificación de Instalación

### Script: `haida/generators/verify-appium.ps1`

```powershell
Write-Host "═══════════════════════════════════════════════════════════"
Write-Host "Verificando Appium Setup"
Write-Host "═══════════════════════════════════════════════════════════"

# Verificar Appium
Write-Host "✓ Appium instalado:"
appium --version

# Verificar drivers
Write-Host ""
Write-Host "✓ Drivers disponibles:"
appium driver list installed

# Verificar ADB
Write-Host ""
Write-Host "✓ Dispositivos ADB conectados:"
adb devices

# Verificar Xcode (solo macOS)
if ($IsMac) {
    Write-Host ""
    Write-Host "✓ Xcode:"
    xcode-select --version
}

Write-Host ""
Write-Host "✓ Setup completado"
```

Ejecutar:

```powershell
powershell -File haida/generators/verify-appium.ps1
```

---

## 7. Flujo Completo: Setup + Test

### 1. Setup Inicial

```powershell
# Instalar dependencias
npm install appium appium-uiautomator2-driver appium-xcuitest-driver --save-dev

# Conectar dispositivo físico
# (Sigue pasos de sección 2 o 3)

# Verificar conexión
adb devices
```

### 2. Iniciar Appium Server

```powershell
# Terminal 1
appium --port 4723 --log-level debug
```

### 3. Ejecutar Tests Móviles

```powershell
# Terminal 2
npm run test:mobile -- --headed
```

### 4. Ver Reportes

```powershell
npx allure serve ./allure-results
```

---

## 8. Estructura de Archivos Recomendada

```
haida/
├── configs/
│   ├── appium-server.json
│   ├── appium-android.json
│   ├── appium-ios.json
│   └── appium-capabilities.json
├── generators/
│   ├── mobile-test-runner.ts
│   ├── verify-appium.ps1
│   └── postman-mobile-tests.json
├── tests/
│   └── mobile/
│       ├── android/
│       │   ├── login.spec.ts
│       │   ├── navigation.spec.ts
│       │   └── forms.spec.ts
│       ├── ios/
│       │   ├── login.spec.ts
│       │   ├── navigation.spec.ts
│       │   └── forms.spec.ts
│       └── shared/
│           └── common-flows.ts
└── apps/
    ├── android-app.apk
    └── ios-app.ipa
```

---

## 9. Troubleshooting

| Problema             | Solución                                  |
| -------------------- | ----------------------------------------- |
| "ADB not found"      | Agregar Android SDK/platform-tools a PATH |
| "Connection refused" | Verificar puerto 4723 no está en uso      |
| "App not installed"  | Ruta incorrecta en `app` capability       |
| "Permission denied"  | Activar USB Debugging en dispositivo      |
| "Session timeout"    | Aumentar `newCommandTimeout` a 600        |

---

## 10. Mejores Prácticas

✓ **Usar dispositivos reales** - No solo emuladores  
✓ **Tests cortos** - Máx 5 minutos por test  
✓ **Datos de prueba** - Setup/cleanup entre tests  
✓ **Logs detallados** - Activar `logLevel: 'debug'`  
✓ **CI/CD** - Automatizar en pipelines  
✓ **Reportes** - Allure + screenshots en fallos

---

## 11. Próximos Pasos

- [ ] Instalar Appium globalmente
- [ ] Conectar dispositivo Android o iOS
- [ ] Ejecutar `verify-appium.ps1`
- [ ] Crear primer test en `tests/mobile/`
- [ ] Integrar con CI/CD (GitHub Actions)
- [ ] Documentar resultados de pruebas

**Estado:** Listo para Testing Mobile ✓

---

**Referencias:**

- [Appium Docs](http://appium.io/docs/en/2.0/)
- [Appium Capabilities](https://appium.io/docs/en/latest/guides/caps/)
- [Playwright Mobile Testing](https://playwright.dev/docs/emulation#mobile-devices)
