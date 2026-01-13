# Reporte ejecucion CTB - ++34662652300

## Contexto
- Entorno: mcprod.thisisbarcelona.com
- Portales: B2C, Afiliats, Oficinas
- Dispositivos: Desktop Chrome, iPhone 14, Pixel 7
- Framework: Playwright

## Suites ejecutadas
1) Suite: `tests/web-e2e/ctb-basic.spec.ts`
- Resultado: 25 passed, 14 failed, 7 flaky, 20 skipped (total 66)
- Duracion: 38.5m

2) Suite: `tests/web-e2e/ctb-comprehensive.spec.ts`
- Resultado: 30 passed, 3 failed, 3 flaky, 48 skipped (total 84)
- Duracion: 12.6m

## Fallos relevantes (ctb-basic)
- TC_HOME_011 (Desktop Chrome): WCAG AA basico falla por `aria-required-attr` y `button-name`.
- TC_PDP_002 (Desktop Chrome/iPhone 14/Pixel 7): galeria de imagenes no navega.
- TC_OFI_A11Y_002 (Desktop Chrome/iPhone 14/Pixel 7): WCAG AA basico en Oficinas.
- TC_NAV_013, TC_NAV_002 (iPhone 14) y TC_NAV_002 (Pixel 7): errores en enlaces legales / busqueda header.
- TC_PDP_001, TC_PDP_004, TC_FAV_008 (iPhone 14): fallos en PDP y favoritos.

## Fallos relevantes (ctb-comprehensive)
- TC_HOME_009: tiempo de carga home supera 3s (Desktop Chrome y iPhone 14).
- TC_HOME_011: WCAG AA basico falla (iPhone 14).

## Flaky (ctb-comprehensive)
- TC_SEARCH_001, TC_FOOTER_001, TC_PLP_001 (Desktop Chrome).

## Evidencias
- Reporte HTML: `00-PROJECTS/HAIDA/haida-production/main/playwright-report`
- Evidencias: `00-PROJECTS/HAIDA/haida-production/main/test-results`

## Notas
- Muchos casos marcados como BLOQUEADO en la suite comprehensive por dependencias de datos/flujo.
- Timeouts observados en capturas de pantalla (footer/PLP) y cierre de contextos en algunos fallos.
