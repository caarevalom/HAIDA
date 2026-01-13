# Prompts Optimizados para HAIDA

Estos prompts están diseñados para usarlos con **Copilot Chat** o **Claude API**.

---

## PROMPT MASTER: Extracción de Test Cases ISTQB

**Usar este prompt principal en Copilot Chat:**

```
Eres un experto en testing según estándares ISTQB. 

Analiza el siguiente documento funcional y genera test cases profesionales, 
estructurados y auditables.

INSTRUCCIONES:
1. Extrae TODOS los requisitos (REQ-###)
2. Para cada requisito, crea test cases alineados a tipos ISTQB:
   - Unit Tests (validación de lógica, funciones)
   - Integration Tests (comunicación entre componentes)
   - API Tests (contracts, payloads, status codes)
   - E2E Tests (flujos de usuario completos)
   - Smoke Tests (health checks)
   - Security Tests (inyecciones, auth, validación)
   - Accessibility Tests (WCAG 2A)
   - Performance Tests (latencia, carga)
   - Data Quality Tests (integridad, formatos)

3. Para CADA test case, incluye:
   - TEST_ID: TC_[MODULO]_[###]
   - TIPO_PRUEBA: Unit/API/E2E/Smoke/Regression/Performance/Security/Accessibility
   - COMPONENTE: Nombre del componente (Auth, Payment, Dashboard, etc)
   - MODULO: Nombre del módulo (Login, Register, etc)
   - REQUISITO_ID: Referencia REQ-###
   - DESCRIPCION: Qué se prueba (clara, concisa)
   - PRECONDICIONES: Estado inicial (BD, datos, env vars)
   - PASOS: Numerados, ejecutables, sin ambigüedad
   - RESULTADO_ESPERADO: Asertable (verifiable)
   - PRIORIDAD: P0 (blocker) | P1 (crítico) | P2 (medio) | P3 (bajo)
   - RIESGO: Alto | Medio | Bajo
   - ETIQUETA_AUTOMATIZACION: @unit @api @e2e @regression @perf @security @a11y (tags para grep)
   - ESTADO: Generado

4. Genera el output EN FORMATO CSV con pipes (|) como separadores.

5. Asegúrate de:
   ✓ Cobertura ISTQB completa (todos los tipos presentes)
   ✓ Trazabilidad clara REQ → Test
   ✓ Nombres sin espacios en TEST_ID
   ✓ PASOS ejecutables y verificables
   ✓ RESULTADO_ESPERADO es una asertación clara
   ✓ Prioridad basada en riesgo de negocio
   ✓ Etiquetas consistentes para grep en Playwright

---

DOCUMENTO A ANALIZAR:
[AQUÍ VA EL CONTENIDO DEL ARCHIVO .md]

---

OUTPUT ESPERADO:
Un CSV con el siguiente formato (incluye header):

TEST_ID|TIPO_PRUEBA|COMPONENTE|MODULO|REQUISITO_ID|DESCRIPCION|PRECONDICIONES|PASOS|RESULTADO_ESPERADO|PRIORIDAD|RIESGO|ETIQUETA_AUTOMATIZACION|ESTADO

[Filas de test cases...]

Incluye al final 2 líneas:
- Resumen: "Total test cases: XXX"
- Matriz de cobertura: "Cobertura ISTQB: Unit(X), API(X), E2E(X), ..."

---

¡Genera el CSV ahora!
```

---

## PROMPT ALTERNATIVO: Para APIs específicas

**Usar si tu documentación es una API OpenAPI/Swagger:**

```
Eres un experto en testing de APIs según ISTQB.

Analiza esta especificación y genera test cases para cada endpoint:

PARA CADA ENDPOINT:
1. Casos de ÉXITO (happy path, datos válidos)
2. Casos de ERROR (validation, auth, not found, conflict)
3. Casos de EDGE (límites, boundary values, valores vacíos)
4. Casos SECURITY (inyecciones, auth bypass, rate limiting)
5. Casos PERFORMANCE (latencia, carga)

TEST CASE TEMPLATE:
TEST_ID|TIPO_PRUEBA|COMPONENTE|MODULO|REQUISITO_ID|DESCRIPCION|METHOD|ENDPOINT|PAYLOAD|HEADERS|RESULTADO_ESPERADO|STATUS_CODE|RESPONSE_SCHEMA|PRIORIDAD|RIESGO|ETIQUETA|ESTADO

DOCUMENTO (OpenAPI/Swagger/Spec):
[AQUÍ VA LA ESPECIFICACIÓN]

Genera CSV ahora.
```

---

## PROMPT ALTERNATIVO: Para UI/Frontend

**Usar si tu documentación es de un módulo UI:**

```
Eres un experto en testing UI según ISTQB.

Analiza esta especificación de UI y genera test cases E2E + Accesibilidad:

PARA CADA PÁGINA/COMPONENTE:
1. Flujos de usuario principales (happy path)
2. Validación de formularios (campos requeridos, formatos)
3. Errores y mensajes de usuario
4. Accesibilidad WCAG 2A (labels, navigation, contrast)
5. Responsive (mobile, tablet, desktop)
6. Performance (load time, rendering)

TEST CASE TEMPLATE:
TEST_ID|TIPO_PRUEBA|COMPONENTE|MODULO|REQUISITO_ID|DESCRIPCION|PRECONDICIONES|PASOS|RESULTADO_ESPERADO|SELECTOR|PRIORIDAD|RIESGO|ETIQUETA|ESTADO

DOCUMENTO (UI Spec):
[AQUÍ VA LA ESPECIFICACIÓN]

Genera CSV ahora.
```

---

## PROMPT ESPECIFICO: Matriz de Requisitos

**Usar DESPUÉS de generar test cases, para crear matriz trazable:**

```
Dado el siguiente conjunto de test cases (CSV), crea una MATRIZ DE REQUISITOS 
que mapee requisitos (REQ-###) a test cases (TC-###).

FORMATO:
REQUISITO_ID|DESCRIPCION_REQ|TEST_CASES_QUE_LO_CUBREN|COBERTURA_%|RIESGO|ESTADO

TEST CASES (CSV):
[AQUÍ VA EL CSV GENERADO]

Incluye al final:
- Total requisitos cubiertos: X
- Cobertura general: X%
- Requisitos sin tests: [lista]
- Recomendaciones

Genera CSV ahora.
```

---

## PROMPT ESPECIFICO: Integración a Código

**Usar para convertir test cases en código Playwright/Jest:**

```
Convierte el siguiente test case CSV en código ejecutable:

FRAMEWORK: [Playwright | Jest | Newman | Cypress]
LENGUAJE: [JavaScript | TypeScript | Python]

CSV:
[AQUÍ VA UNA FILA DEL CSV]

Genera:
1. Test spec completo (usando @playwright/test o equivalente)
2. Incluyendo assertions
3. Con etiquetas de @parallelizable si aplica
4. Con parámetros extraídos a fixtures si es útil

Código ahora.
```

---

## PROMPT ESPECIFICO: Validación de Cobertura

**Usar para verificar que la cobertura sea completa:**

```
Analiza estos test cases (CSV) y valida:

1. ¿Todos los tipos ISTQB están cubiertos?
   - Unit, API, E2E, Smoke, Regression, Performance, Security, Accessibility
   
2. ¿Hay gaps en cobertura de requisitos?
   - ¿Algún REQ sin tests?
   
3. ¿Hay duplicación innecesaria?
   - Misma validación en múltiples tests
   
4. ¿Las prioridades son correctas?
   - ¿Requisitos críticos tienen P1?
   
5. Recomendaciones para completar la suite

CSV:
[AQUÍ VA EL CSV GENERADO]

Análisis ahora.
```

---

## CÓMO USAR ESTOS PROMPTS

### Opción A: Copilot Chat en VS Code

1. Abre VS Code
2. Abre Copilot Chat (Ctrl+Shift+I)
3. Copia el **PROMPT MASTER**
4. Reemplaza `[AQUÍ VA EL CONTENIDO DEL ARCHIVO .md]` con tu especificación
5. Pega todo en Copilot Chat y presiona Enter
6. Copia el CSV generado
7. Guárdalo en: `istqb-hiberus/outputs/test-cases-YYYY-MM-DD.csv`

### Opción B: Claude.ai

1. Ve a https://claude.ai
2. Crea nuevo chat
3. Copia el **PROMPT MASTER**
4. Adjunta tu especificación (.md file)
5. Presiona Enter
6. Copia CSV del resultado
7. Guárdalo como arriba

### Opción C: API (Claude/OpenAI - Automatizado)

Script en `generators/generate-tests.ps1` puede automatizar esto:
```powershell
# Lee markdown
$docContent = Get-Content "istqb-hiberus/docs/especificacion-login.md"

# Construye prompt
$prompt = "Eres un experto ISTQB... [etc]"
$fullPrompt = $prompt + $docContent

# Llama Claude API
$response = Invoke-RestMethod -Uri "https://api.anthropic.com/v1/messages" `
  -Method POST `
  -Headers @{"x-api-key"="tu-api-key"} `
  -Body ($fullPrompt | ConvertTo-Json)

# Extrae CSV y exporta
$csv = $response.content[0].text
$csv | Out-File "istqb-hiberus/outputs/test-cases-$(Get-Date -Format 'yyyy-MM-dd').csv"
```

---

## TIPS PARA MEJORES RESULTADOS

1. **Documentación clara:** Cuanto más detallada tu especificación, mejor el output
2. **Criterios de Aceptación específicos:** Usa lenguaje "Dado/Cuando/Entonces"
3. **Requisitos numerados:** REQ-001, REQ-002, etc. (facilita mapeo)
4. **Datos de prueba:** Incluir usuarios, emails, payloads válidos/inválidos
5. **Contexto técnico:** Si incluyes componentes, integraciones, el IA lo mapeará mejor

---

## EJEMPLO DE USO REAL

**Archivo:** `istqb-hiberus/examples/PROMPT-USAGE-EXAMPLE.md`

```
## Paso 1: Preparar especificación
Copia FUNCTIONAL-SPEC-TEMPLATE.md → docs/especificacion-login.md
Rellena completamente (todos los requisitos, casos de uso, etc)

## Paso 2: Usar PROMPT MASTER
Ve a Copilot Chat
Copia PROMPT MASTER de arriba
Reemplaza [DOCUMENTO A ANALIZAR] con contenido de especificacion-login.md
Ejecuta

## Paso 3: Procesar output
Copilot devuelve CSV
Cópialo a: istqb-hiberus/outputs/test-cases-+34662652300.csv

## Paso 4: Validar
Abre CSV
Verifica:
- ✓ Todos los REQ-### cubiertos
- ✓ Tipos ISTQB variados
- ✓ Prioridades coherentes
- ✓ PASOS ejecutables

## Paso 5: Usar en tests
Script parse-csv.js convierte CSV a test code
O: Importa CSV a TMS (Test Management System)
```

---

## PRÓXIMAS MEJORAS

- [ ] Integración directa Copilot API (sin manual)
- [ ] Generación de Allure test cases desde CSV
- [ ] Sincronización con Jira/Azure DevOps (requisitos ↔ tests)
- [ ] Visual regression tests automáticos
- [ ] Load test cases (k6 scripts) desde CSV
