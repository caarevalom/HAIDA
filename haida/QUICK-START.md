╔══════════════════════════════════════════════════════════════════════════════╗
║ ║
║ GUÍA RÁPIDA - HAIDA ║
║ ║
║ De Especificación Funcional a Test Cases en 3 pasos ║
║ ║
╚══════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════════
PASO 1: ADJUNTAR ESPECIFICACIÓN (5 minutos)
═══════════════════════════════════════════════════════════════════════════════

OPCIÓN A: Copiar template y rellenar

1. Abre: istqb-hiberus/templates/FUNCTIONAL-SPEC-TEMPLATE.md
2. Copia a: istqb-hiberus/docs/especificacion-[modulo].md
3. Rellena: requisitos, criterios, casos de uso, datos
4. Guarda

OPCIÓN B: Convertir documento existente

1. Tienes un BRD/PRD/Spec ya hecho? (Word, PDF, Notion, etc)
2. Convierte a Markdown (estructura similar a template)
3. Copia a: istqb-hiberus/docs/
4. Valida tiene REQ-### definidos

CHECKLIST ANTES DE CONTINUAR:
✓ Archivo .md en istqb-hiberus/docs/
✓ Contiene "Requisitos Funcionales" con REQ-001, REQ-002, ...
✓ Cada REQ tiene "Criterios de Aceptación" claros
✓ Incluye "Flujos de Usuario" o "Casos de Uso"
✓ Incluye "Datos de Prueba"
✓ Sin información sensible (contraseñas, keys, PII)

═══════════════════════════════════════════════════════════════════════════════
PASO 2: GENERAR TEST CASES CON IA (20 minutos)
═══════════════════════════════════════════════════════════════════════════════

OPCIÓN A: Copilot Chat en VS Code (RECOMENDADO)

1. Abre VS Code en la carpeta qa-starter-kit

2. Ejecuta el generador:
   ```powershell
   powershell -File istqb-hiberus\generators\generate-tests.ps1 `
     -DocPath "istqb-hiberus\docs\especificacion-login.md"
   ```
3. El script generará un archivo de prompt:
   istqb-hiberus/outputs/PROMPT-TO-COPILOT-YYYY-MM-DD_hhmmss.txt
4. Abre ese archivo y copia TODO su contenido

5. En VS Code: Copilot Chat (Ctrl+Shift+I)
   - Pega el prompt completo
   - Presiona Enter
   - Espera respuesta (~30-60 segundos)
6. Copilot devuelve un CSV con test cases
   - Copia SOLO el CSV (desde TEST_ID hasta última fila)
   - En terminal PowerShell, pega cuando pida input
   - El script lo guarda en istqb-hiberus/outputs/

OPCIÓN B: Claude.ai (si no tienes Copilot)

1. Ve a https://claude.ai

2. Ejecuta el generador local (como arriba)

3. Copia el archivo PROMPT-TO-COPILOT-\*.txt

4. En Claude.ai:
   - Nuevo chat
   - Pega todo el prompt
   - Presiona Enter
   - Espera respuesta
5. Copia el CSV resultado

6. Crea archivo: istqb-hiberus/outputs/test-cases-YYYY-MM-DD.csv
   - Pega CSV
   - Guarda

OPCIÓN C: Usar ejemplo de demostración

Si quieres ver cómo funciona sin generar tu propio:

```powershell
# Copia el ejemplo
Copy-Item istqb-hiberus\examples\example-output.csv `
  -Destination "istqb-hiberus\outputs\test-cases-demo.csv"

# Así ves qué output esperar (22 test cases Login)
```

RESULTADO ESPERADO:
✓ istqb-hiberus/outputs/test-cases-YYYY-MM-DD.csv
✓ CSV con columnas: TEST_ID, TIPO_PRUEBA, COMPONENTE, ..., ESTADO
✓ Filas: una por test case (mínimo 10-20 test cases)
✓ Cobertura ISTQB: Unit, API, E2E, Smoke, Security, Accessibility, etc

═══════════════════════════════════════════════════════════════════════════════
PASO 3: VALIDAR Y USAR TEST CASES (10 minutos)
═══════════════════════════════════════════════════════════════════════════════

VALIDACIÓN MANUAL:

1. Abre CSV en Excel o VS Code:
   istqb-hiberus/outputs/test-cases-YYYY-MM-DD.csv
2. Valida:
   ✓ TEST_ID: Todos únicos (TC_LOGIN_001, TC_LOGIN_002, ...)
   ✓ TIPO_PRUEBA: Variados (no todos "E2E", mezcla tipos)
   ✓ REQUISITO_ID: Todos los REQ-### cubiertos
   ✓ DESCRIPCION: Clara y entendible
   ✓ PASOS: Numerados, ejecutables
   ✓ RESULTADO_ESPERADO: Asertable (verificable)
   ✓ PRIORIDAD: P0/P1 para críticos, P2/P3 para menores
   ✓ ETIQUETA_AUTOMATIZACION: Contiene @tags
3. Cuenta test cases por tipo:
   - Abre: istqb-hiberus/examples/example-output.csv
   - Para ver ejemplo de 22 tests (2 Unit, 6 API, 5 E2E, etc)

INTEGRACIÓN CON SUITE DE TESTS EXISTENTE:

OPCIÓN A: Revisar test cases (manual)

- Los CSVs son legibles en Excel
- Úsalo como referencia para escribir tests en Playwright/Jest

OPCIÓN B: Importar a Playwright (en desarrollo)

- Script parse-csv.js convertirá CSV a .spec.ts
- Comando: node istqb-hiberus/generators/parse-csv.js
- Output: tests/web-e2e/generated-from-istqb.spec.ts

OPCIÓN C: Importar a test management system

- Si usas TestRail, Jira, Azure DevOps
- CSV es fácilmente importable a esos sistemas
- Mantiene trazabilidad REQ → Test → Resultado

EJECUTAR TESTS:

```powershell
# Ejecutar tests existentes (ya configurados)
npm run test:web

# Con reportería
npm run test:web -- --reporter=html
npm run report
```

REVISIÓN DE RESULTADOS:

1. Allure Report:
   ```powershell
   npm run allure:generate
   npm run allure:open
   ```
2. Playwright HTML Report:
   Abre: playwright-report/index.html
3. CSV de test cases generados sirve como:
   ✓ Documentación de qué se prueba
   ✓ Trazabilidad a requisitos
   ✓ Backlog para implementación

═══════════════════════════════════════════════════════════════════════════════
EJEMPLO COMPLETO: LOGIN (15 minutos)
═══════════════════════════════════════════════════════════════════════════════

Ver: istqb-hiberus/examples/STEP-BY-STEP.md

Contiene:

1. Especificación completa rellenada
2. Prompt exacto usado
3. CSV generado (22 test cases)
4. Explicación de cada fila
5. Cómo usarlo en Playwright

COPIAR Y ADAPTAR:

1. Abre: istqb-hiberus/examples/example-brd.md
2. Cópialo a: istqb-hiberus/docs/mi-especificacion.md
3. Reemplaza valores (emails, APIs, URLs) con los tuyos
4. Ejecuta generador
5. ¡Test cases listos!

═══════════════════════════════════════════════════════════════════════════════
ESTRUCTURA DE CARPETAS
═══════════════════════════════════════════════════════════════════════════════

istqb-hiberus/
├── docs/ # TUS ESPECIFICACIONES
│ ├── README-DOCS.md # Cómo adjuntar documentos
│ └── tu-especificacion.md # Tú agregas aquí
│
├── templates/ # PLANTILLAS Y PROMPTS
│ ├── FUNCTIONAL-SPEC-TEMPLATE.md # Copia para tu especificación
│ ├── ISTQB-PROMPT-ENGINEER.md # Prompts optimizados
│ └── CSV-SCHEMA.md # Definición de CSV
│
├── generators/ # SCRIPTS
│ ├── generate-tests.ps1 # Ejecutable: genera tests
│ └── parse-csv.js # (Future) CSV a Playwright code
│
├── outputs/ # SALIDA (test cases generados)
│ ├── test-cases-YYYY-MM-DD.csv # CSV generado
│ ├── PROMPT-TO-COPILOT-\*.txt # Prompt para IA
│ └── requirements-matrix.csv # (Future) Matrix REQ→TC
│
├── examples/ # EJEMPLOS
│ ├── example-brd.md # BRD completo de ejemplo
│ ├── example-output.csv # CSV generado de ejemplo (22 tests)
│ └── STEP-BY-STEP.md # Demostración completa
│
└── README.md # DOCUMENTACIÓN PRINCIPAL

═══════════════════════════════════════════════════════════════════════════════
COMANDOS RÁPIDOS
═══════════════════════════════════════════════════════════════════════════════

Generar test cases (interactive):
powershell -File istqb-hiberus\generators\generate-tests.ps1 `
-DocPath "istqb-hiberus\docs\especificacion-login.md"

Ver ejemplo:
Get-Content "istqb-hiberus\examples\example-output.csv" | Out-GridView

Abrir carpeta de outputs:
explorer "istqb-hiberus\outputs"

Ver documentación:
code "istqb-hiberus\README.md"

═══════════════════════════════════════════════════════════════════════════════
TIPS Y BUENAS PRÁCTICAS
═══════════════════════════════════════════════════════════════════════════════

✓ ESPECIFICACIÓN CLARA → MEJOR OUTPUT

- Requisitos numerados (REQ-001, REQ-002)
- Criterios específicos (no vagas "debe funcionar")
- Datos reales o realistas
- Componentes técnicos identificados

✓ UN MÓDULO POR DOCUMENTO

- Login en un .md
- Payment en otro .md
- Dashboard en otro .md
- Más fácil de mantener y actualizar

✓ VERSIONADO

- Guarda especificaciones en Git
- CSV también en Git (como documentación)
- Tracking de cambios

✓ ITERATIVO

- Versión 1.0: solo happy path
- Versión 1.1: agregar error cases
- Versión 1.2: seguridad, performance

✓ COLABORATIVO

- Especificaciones compartidas (Google Docs, Notion)
- Exportar a .md
- Versionar en repo

═══════════════════════════════════════════════════════════════════════════════
TROUBLESHOOTING
═══════════════════════════════════════════════════════════════════════════════

❌ "Archivo no encontrado"
✓ Verifica ruta completa de .md
✓ Usa formato: istqb-hiberus\docs\nombre.md

❌ "Copilot no genera CSV bien formado"
✓ Asegurate de copiar TODO el prompt
✓ Copia SOLO el CSV, no todo el mensaje de Copilot
✓ Verifica pipes (|) están presentes

❌ "CSV con muchas filas vacías o cortadas"
✓ Copia el CSV completo (incluye header)
✓ Si Copilot cortó, pide que continúe
✓ O usa ejemplo para comparar formato

❌ "TEST_IDs duplicados"
✓ Copilot a veces repite (renovar con Ctrl+K)
✓ O corregir manualmente en CSV

✓ REPORTAR ISSUES

- Si generador falla → revisar syntax del .md
- Si CSV inválido → comparar con example-output.csv
- Si necesitas columnas nuevas → editar CSV-SCHEMA.md

═══════════════════════════════════════════════════════════════════════════════
PRÓXIMAS MEJORAS PLANEADAS
═══════════════════════════════════════════════════════════════════════════════

- [ ] Integración directa con API de Copilot (sin manual)
- [ ] Conversión automática CSV → Playwright spec
- [ ] Sincronización con Jira (requisitos ↔ tests)
- [ ] Matriz de cobertura automática
- [ ] Reportería de gaps (qué no está cubierto)
- [ ] Load testing scripts desde CSV (k6)
- [ ] Visual regression tests

═══════════════════════════════════════════════════════════════════════════════
¡LISTO! 🚀
═══════════════════════════════════════════════════════════════════════════════

Próximas acciones:

1. ✓ Adjunta tu especificación a: istqb-hiberus/docs/
2. ✓ Ejecuta generador: powershell -File istqb-hiberus\generators\generate-tests.ps1
3. ✓ Genera test cases con Copilot Chat
4. ✓ Valida CSV en outputs/
5. ✓ Usa como documentación y base para automatización

Documentación completa: istqb-hiberus/README.md

═════════════════════════════════════════════════════════════════════════════════
