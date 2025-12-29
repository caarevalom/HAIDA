╔═══════════════════════════════════════════════════════════════════════════════╗
║ ║
║ DOCUMENTACIÓN Y CAPTURA DE EVIDENCIAS CTB ║
║ ║
║ Cómo registrar test cases existentes (440) + nuevos + evidencias visuales ║
║ ║
╚═══════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════════
📋 FLUJO DE DOCUMENTACIÓN (20 líneas)
═══════════════════════════════════════════════════════════════════════════════

1. REVISAR 440 CASOS EXISTENTES
   └─ Bajar de TestLink → Validar con ValidateCSVStructure → Actualizar deprecados

2. CREAR NUEVOS SI FALTA COBERTURA
   └─ Extraer requisitos no cubiertos → Generar nuevos casos per ISTQB

3. ESTRUCTURA DOCUMENTACIÓN (por test case)
   ├─ ID: TC_AUTH_001
   ├─ Nombre: "Login con email válido"
   ├─ Pasos: 1) Ir login, 2) Email válido, 3) Pass válido, 4) Click Login
   ├─ Resultado esperado: Usuario autenticado, redirigido home
   ├─ EVIDENCIA FRONTAL: Screenshot 1 (formulario) + Screenshot 2 (home logueado)
   ├─ EVIDENCIA BACKEND: Request/Response login endpoint + Log autenticación
   ├─ Video: Recording corto (15-30 seg) del flujo completo
   └─ Status: PASS/FAIL + fecha ejecución

4. CARPETA DE EVIDENCIAS POR TEST
   ├─ /evidencias/TC_AUTH_001/
   │ ├─ screenshot-01-form.png
   │ ├─ screenshot-02-home.png
   │ ├─ request-login.json
   │ ├─ response-login.json
   │ ├─ backend-logs.txt
   │ └─ video-tc-auth-001.mp4

5. EXCEL SHAREPOINT (Columnnas adicionales)
   ├─ Test_Case_ID
   ├─ Nombre
   ├─ Pasos
   ├─ Expected_Result
   ├─ Status (PASS/FAIL/BLOQUEADO)
   ├─ Evidencia_Frontend (link a carpeta screenshots)
   ├─ Evidencia_Backend (link a request/response)
   ├─ Video_Link (link a video carpeta)
   ├─ Bug_Relacionado (si FAIL, link a incidencia)
   └─ Fecha_Ejecución

6. AUTOMATIZACIÓN CAPTURA
   ├─ Playwright: screenshots automáticos en cada paso
   ├─ Newman: export request/response JSON
   ├─ Logs: captura automática de backend logs
   └─ Video: Grabación automática con playwright-video

7. REPORTES FINALES
   ├─ Resumen: X PASS, Y FAIL, Z BLOQUEADO
   ├─ Cobertura: REQ-001 → TC_001 (trazabilidad)
   ├─ Dashboard: Gráficos de cobertura, timeline ejecución
   └─ Defectos: 50+ incidencias priorizadas con mapping a tests

RESULTADO: Excel + Carpeta evidencias (screenshots + videos + logs) + Reportes Allure
ACCESO: Excel vía SharePoint, evidencias en OneDrive o Teams

═══════════════════════════════════════════════════════════════════════════════
💾 ESTRUCTURA DE CARPETAS
═══════════════════════════════════════════════════════════════════════════════

CTB -/
├─ Documentación/ (Docs originales)
├─ TestCases_Validados/ (440 casos importados + validados)
├─ Evidencias/ (Capturas, videos, logs)
│ ├─ TC_AUTH_001/
│ │ ├─ screenshots/
│ │ ├─ backend/
│ │ └─ video.mp4
│ ├─ TC_AUTH_002/
│ └─ ...
├─ Reportes/ (Allure, Excel, resúmenes)
└─ Excel_Actualizado/ (Excel con link a evidencias)

═══════════════════════════════════════════════════════════════════════════════
🎬 CAPTURA AUTOMÁTICA CON PLAYWRIGHT
═══════════════════════════════════════════════════════════════════════════════

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function captureTestEvidence(testId, testName) {
const browser = await chromium.launch();
const context = await browser.newContext({
recordVideo: { dir: `./evidencias/${testId}/video` }
});

const page = await context.newPage();

// PASO 1: Ir a login
await page.goto('https://visitbarcelona.com/login');
await page.screenshot({ path: `./evidencias/${testId}/screenshot-01-form.png` });

// PASO 2: Llenar datos
await page.fill('input[name="email"]', 'user@test.com');
await page.fill('input[name="password"]', 'Password123!');

// PASO 3: Submit
await page.click('button[type="submit"]');
await page.waitForNavigation();

// PASO 4: Capturar resultado
await page.screenshot({ path: `./evidencias/${testId}/screenshot-02-result.png` });

// PASO 5: Capturar network log
const har = await context.tracing.stop();
fs.writeFileSync(`./evidencias/${testId}/network.json`, JSON.stringify(har, null, 2));

await browser.close();
return { status: 'PASS', evidence: `./evidencias/${testId}` };
}

═══════════════════════════════════════════════════════════════════════════════
📊 FILA EXCEL (EJEMPLO)
═══════════════════════════════════════════════════════════════════════════════

| ID          | Nombre            | Pasos (resumido)           | Expected   | Status | Frontend      | Backend       | Video              | Bug_ID  | Fecha      |
| ----------- | ----------------- | -------------------------- | ---------- | ------ | ------------- | ------------- | ------------------ | ------- | ---------- |
| TC_AUTH_001 | Login válido      | Email+Pass+Click Login     | Home       | PASS   | /TC_AUTH_001/ | /TC_AUTH_001/ | /TC_AUTH_001/video | -       | 2025-12-16 |
| TC_AUTH_002 | Email inválido    | Email_invalido+Pass+Click  | Error msg  | PASS   | /TC_AUTH_002/ | /TC_AUTH_002/ | /TC_AUTH_002/video | -       | 2025-12-16 |
| TC_NAV_001  | Búsqueda funciona | Click search+Término+Enter | Resultados | FAIL   | /TC_NAV_001/  | /TC_NAV_001/  | /TC_NAV_001/video  | CTB-148 | 2025-12-16 |

Links en Excel → carpetas OneDrive con screenshots + videos

═══════════════════════════════════════════════════════════════════════════════
✅ DECISIÓN FINAL
═══════════════════════════════════════════════════════════════════════════════

OPCIÓN RECOMENDADA (Híbrida):

1. IMPORTAR 440 casos de TestLink
2. VALIDAR con nuestros scripts
3. ACTUALIZAR deprecados
4. EJECUTAR cada caso (automático con Playwright)
5. CAPTURAR EVIDENCIAS:
   ├─ Frontend: Screenshots (antes/después cada paso)
   ├─ Backend: Requests/Responses JSON
   ├─ Videos: Grabación del flujo completo
   └─ Logs: Backend logs y errores
6. DOCUMENTAR en Excel con links a evidencias
7. PRIORIZAR 50+ bugs (mapeo a tests que fallaron)
8. REPORTAR cobertura + incidencias

RESULTADO FINAL:

- Excel interactivo con 440 casos + evidencias
- Carpeta evidencias (screenshots + videos + logs)
- Reporte de bugs priorizados
- Allure report con métricas
- Demostrativo completo para cliente

═════════════════════════════════════════════════════════════════════════════════
