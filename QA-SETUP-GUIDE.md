# QA Testing E2E - Guía de ejecución

Este documento describe cómo ejecutar el entorno de testing E2E en Windows sin permisos de administrador usando Node.js portable.

## Requisitos previos

1. **Node.js Portable**: Descargado en `C:\Users\CarlosArturoArevaloM\Documents\Proyectos\node-v24.12.0-win-x64`
2. **Proyecto**: `C:\Users\CarlosArturoArevaloM\Documents\Proyectos\qa-starter-kit`
3. **PowerShell 5.1+**: Incluido en Windows 10+

## Configuración rápida

### 1. Opción A: Ejecución completa (recomendado)

Abre el **Terminal integrado en VS Code** (Ctrl + `) y ejecuta:

```powershell
cd "C:\Users\CarlosArturoArevaloM\Documents\Proyectos\qa-starter-kit"
powershell -NoProfile -ExecutionPolicy Bypass -File .\run-qa.ps1
```

Esto hace todo:

- Configura PATH temporal para Node.js
- Valida `node -v` y `npm -v`
- Instala dependencias (`npm ci` o `npm install`)
- Instala navegadores Playwright
- Ejecuta pruebas Web E2E
- Ejecuta pruebas API (Newman)
- Ejecuta análisis Lighthouse
- Genera y abre reporte Allure

### 2. Opción B: Instalación + tests separados

```powershell
# Instalación (una sola vez)
powershell -NoProfile -ExecutionPolicy Bypass -File .\run-qa.ps1 -SkipInstall:$false -SkipBrowsers:$false

# Tests posteriores (saltar instalación de dependencias)
powershell -NoProfile -ExecutionPolicy Bypass -File .\run-qa.ps1 -SkipInstall:$true -SkipBrowsers:$true
```

### 3. Opción C: Ejecutar solo tests específicos

```powershell
# Solo tests Web E2E
powershell -NoProfile -ExecutionPolicy Bypass -File .\run-qa.ps1 -WebOnly

# Solo tests API
powershell -NoProfile -ExecutionPolicy Bypass -File .\run-qa.ps1 -ApiOnly
```

## Estructura del proyecto

```
qa-starter-kit/
├── run-qa.ps1                    # Script PowerShell principal (NUEVO)
├── .env                          # Variables de entorno (BASE_URL) (NUEVO)
├── .env.example                  # Plantilla de .env
├── package.json                  # Scripts y dependencias (ACTUALIZADO)
├── playwright.config.ts          # Configuración de Playwright
├── tsconfig.json
├── tests/
│   ├── web-e2e/                  # Pruebas E2E Playwright + axe
│   │   ├── smoke.spec.ts         # Health checks
│   │   └── accessibility.spec.ts # WCAG
│   ├── api/                      # Colecciones Newman (Postman)
│   │   └── collection.json
│   └── perf/                     # K6 (no usado en este script)
├── configs/
│   └── lighthouserc.json         # Configuración Lighthouse
├── tools/
│   └── README.md                 # Herramientas auxiliares
└── reports/                      # Reportes generados
    ├── playwright-report/        # HTML Playwright
    ├── allure-report/            # HTML Allure
    ├── allure-results/           # JSON Allure (por Playwright)
    ├── newman/                   # Resultados Newman
    └── lighthouse/               # Reportes Lighthouse
```

## Variables de entorno

El archivo `.env` está preconfigurado con:

```dotenv
BASE_URL=https://mcprod.thisisbarcelona.com.com
```

Para cambiar el URL de prueba, edita `.env` y ejecuta el script nuevamente.

## Scripts disponibles en package.json

- `npm run test:web` - Ejecuta tests Playwright E2E
- `npm run test:web:ui` - Abre Playwright Test UI
- `npm run test:api` - Ejecuta tests Newman (API)
- `npm run lighthouse` - Genera reporte Lighthouse
- `npm run allure:clean` - Limpia reportes anteriores
- `npm run allure:generate` - Genera HTML Allure desde resultados
- `npm run allure:open` - Abre reporte Allure en navegador
- `npm run report` - Abre último reporte Playwright

## Validación post-ejecución

El script muestra rutas de los reportes generados:

- **Playwright HTML**: `./playwright-report/`
- **Allure Report**: `./reports/allure-report/`
- **Newman (API)**: `./reports/newman/`
- **Lighthouse**: `./reports/lighthouse/`

Para abrir reportes manualmente:

```powershell
# Playwright
npm run report

# Allure (si allure CLI está disponible)
npm run allure:open

# Allure alternativo (npx allure-commandline)
npx allure-commandline@2 generate reports/allure-results -o reports/allure-report --clean
start ./reports/allure-report/index.html
```

## Solución de problemas

### "node no está accesible"

Verifica que la ruta a Node.js es correcta. Si usas una versión diferente, actualiza el parámetro:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\run-qa.ps1 `
  -NodePath "C:\ruta\a\tu\node-v24.12.0-win-x64"
```

### "npm ci falló"

Si no existe `package-lock.json`, el script usa `npm install` automáticamente. Si sigue fallando, revisa:

```powershell
npm install --verbose
```

### "Playwright browsers no instalados"

Los navegadores se descargan en `%USERPROFILE%\.playwright/chromium/...`. Si falta espacio, ejecuta manualmente:

```powershell
npx playwright install --with-deps
```

### "Allure CLI no disponible"

El script detecta esto automáticamente y usa `npx allure-commandline@2` como alternativa. No es necesario hacer nada.

### "Newman: POST {{BASE_URL}} falló"

Verifica que el URL en `.env` es accesible:

```powershell
curl -I "https://mcprod.thisisbarcelona.com.com"
```

### "Lighthouse: Chrome flag no reconocido"

Actualiza el navegador o usa una versión más reciente de Lighthouse:

```powershell
npm install --save-dev lighthouse@latest
```

## Notas de seguridad

- **Sin admin**: El script no requiere permisos de administrador.
- **PATH temporal**: Modificaciones al `$env:PATH` se revierten tras la ejecución.
- **Archivos locales**: Todos los reportes se guardan en la carpeta `reports/` del proyecto.

## Siguientes pasos

1. Abre VS Code en `qa-starter-kit`
2. Terminal integrado: `powershell -NoProfile -ExecutionPolicy Bypass -File .\run-qa.ps1`
3. Espera los reportes y revisa los resultados en `reports/allure-report/`

---

**Última actualización**: Diciembre 2025
