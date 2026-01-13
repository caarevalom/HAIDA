# Reporte de ejecucion CTB - Estado actual

## Resumen
- Total casos en cuaderno: 196
- Estado de ejecucion: parcial (smoke y smoke CTB básico ejecutados en mcprod).
- Resultado consolidado (196 casos x 3 dispositivos = 588): 19 PASS, 5 FAIL, 519 BLOQUEADO, 45 NO_EJECUTADO

## Ejecucion automatizada (HAIDA smoke)
- Fecha: +34662652300
- Entorno: mcprod
- Suites: tests/web-e2e/smoke.spec.ts
- Dispositivos: Desktop Chrome, iPhone 14, Pixel 7
- Resultado: 1 PASS, 5 FAIL
- Evidencias: /Users/carlosa/Library/CloudStorage/OneDrive-HIBERUSITDEVELOPMENTSERVICES,S.L.U/HAIDA/test-results/
- Incidencias registradas (Redmine import):
  - CTB-001 [WEB/MOB] Enlaces internos /es/tickets/* devuelven 404
  - CTB-002 [MOB] Imágenes no cargadas en home (placeholders/AEM)

## Ejecucion automatizada (CTB basic)
- Fecha: +34662652300
- Entorno: mcprod
- Suite: tests/web-e2e/ctb-basic.spec.ts
- Dispositivos: Desktop Chrome, iPhone 14, Pixel 7
- Resultado: 19 PASS, 5 FAIL, 15 BLOQUEADO
- Evidencias: /Users/carlosa/Library/CloudStorage/OneDrive-HIBERUSITDEVELOPMENTSERVICES,S.L.U/HAIDA/test-results/
- Consolidado ejecucion: /Users/carlosa/Hiberus/CTB/docs/csv/ctb-execution-results.csv
- Incidencias registradas (Redmine import):
  - CTB-003 [WEB] Home no cumple WCAG AA (aria-required-attr, button-name)
  - CTB-004 [MOB] Buscador header no visible en iPhone
  - CTB-005 [MOB] Buscador header no visible en Android
  - CTB-006 [WEB] Busqueda header no navega a resultados
  - CTB-007 [WEB] Home /es/ responde 404 en mcprod
  - CTB-008 [WEB/MOB] Oficinas no cumple WCAG AA (aria-required-children/attr/button-name)
  - CTB-009 [WEB/MOB] PDP galeria no navegable (boton no visible)

## Observaciones
- Se detecto un error intermitente de conexion (net::ERR_CONNECTION_CLOSED) al abrir /es/ en desktop durante la ultima ejecucion.

## Requerido para reporte de OK vs Incidencias
- Resultado por caso (PASS/FAIL/BLOQUEADO)
- Evidencia por caso (screenshots, video, HAR)
- Vinculo de bug ID cuando FAIL
- Fecha y entorno de ejecucion
