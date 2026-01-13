# 🤖 HAIDA - IA-Driven QA Automation

**Hiberus AI-Driven Automation (HAIDA)** - Solución completa de testing

**Propuesta de valor**

- Testing integral alineado a **ISTQB** sin necesidad de acceder al código fuente.
- Web (E2E/UI), APIs, móvil (con Appium), performance, accesibilidad y seguridad.
- Automatización reproducible desde CLI/CI, reportes trazables con **Allure**.
- **Generador inteligente de test cases** (HAIDA) desde especificaciones funcionales.

## Stack usado (gratuito / open source)

- **Playwright** (web E2E)
- **Appium** (mobile real devices - iOS/Android)
- **Postman + Newman** (API)
- **Lighthouse CLI** (rendimiento y a11y web)
- **k6** (carga HTTP)
- **axe-core** (accesibilidad WCAG)
- **Allure Framework** (reporting unificado)
- **HAIDA** (generador inteligente de test cases)

## Docs e indices

- docs/ORGANIZATION_MAP.md
- docs/INTEGRATIONS_AND_TOOLS.md
- docs/INTEGRATION-VERIFICATION-REPORT.md
- docs/root-docs/README.md

## Requisitos

- Node.js 18+ (recomendado 20)
- Navegadores de Playwright: `npx playwright install --with-deps`
- (Opcional) Java 8+ si usas `allure-commandline` localmente
- (Opcional) k6 instalado en el sistema: https://k6.io/docs/get-started/installation/

## Variables de entorno

Crea `.env` a partir de `.env.example`:

```
BASE_URL=https://example.com
```

## Comandos principales

```bash
# Instalar dependencias
npm ci
# Instalar navegadores de Playwright
npx playwright install --with-deps

# Web E2E
npm run test:web
npm run test:web:ui         # Modo UI

# API (Newman)
npm run test:api

# Lighthouse (performance/a11y)
npm run lighthouse

# (Opcional) Carga con k6
npm run test:perf

# Reportes Allure
npm run allure:clean && npm run allure:generate
npm run allure:open
```

## Estructura

```
qa-starter-kit/
  configs/
    lighthouserc.json
  tests/
    web-e2e/
      smoke.spec.ts
      accessibility.spec.ts
    api/
      collection.json
    perf/
      k6-smoke.js
  .github/workflows/qa-pipeline.yml
  playwright.config.ts
  package.json
  tsconfig.json
  .env.example
  README.md
```

## Notas

- **Mobile (Appium/Maestro)** no está incluido para mantener la simplicidad sin dependencias externas. Se puede añadir después según necesidad.
- Los reportes HTML de Playwright y Allure quedan en `playwright-report/` y `reports/allure-report/`.
