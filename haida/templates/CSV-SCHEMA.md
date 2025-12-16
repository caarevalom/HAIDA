# CSV Schema - Estructura de Test Cases HAIDA

Definición formal de las columnas y valores válidos para el CSV generado.

---

## HEADER DEL CSV

```
TEST_ID|TIPO_PRUEBA|COMPONENTE|MODULO|REQUISITO_ID|DESCRIPCION|PRECONDICIONES|PASOS|RESULTADO_ESPERADO|PRIORIDAD|RIESGO|ETIQUETA_AUTOMATIZACION|ESTADO
```

---

## DEFINICIÓN POR COLUMNA

### 1. TEST_ID
- **Tipo:** String (no contiene espacios)
- **Formato:** `TC_[MODULO_ABREVIADO]_[###]`
- **Ejemplo:** `TC_AUTH_001`, `TC_PAY_042`, `TC_DASH_501`
- **Reglas:**
  - Único en toda la suite
  - Secuencial por módulo
  - Máximo 50 caracteres
  - Solo caracteres alfanuméricos + underscore

---

### 2. TIPO_PRUEBA
- **Tipo:** Enum (uno por test case)
- **Valores válidos (según Pirámide de Cohn - Hiberus):**

  **PRUEBAS FUNCIONALES (Base Pirámide - 5 tipos)**
  ```
  Unit              # Probar lógica individual (métodos, funciones)
                    # Entrada muestra → Salida esperada
                    # Frameworks: Jest, Mocha, pytest
  
  Integration       # Componentes se combinan → Resultados integrados
                    # Comunicación entre servicios/módulos
                    # Frameworks: Jest + Supertest, Cypress
  
  Interface         # Validar GUI conforme a requisitos
                    # Tamaño botones, alineación, tablas, menú
                    # Frameworks: Playwright, Selenium, Cypress
  
  Regression        # Cambios NO rompen funcionalidad existente
                    # Aplicación modificada → Sin nuevos defectos
                    # Ejecutar ante cada cambio
  
  Smoke             # Software listo/estable para más pruebas
                    # NO hay defectos de tapón (show stoppers)
                    # Health checks básicos
  ```

  **PRUEBAS NO FUNCIONALES (Pirámide arriba - 7 tipos)**
  ```
  Performance       # Velocidad y eficacia del programa
                    # Qué carga soporta, carga máxima
                    # Tiempo respuesta, throughput
                    # Frameworks: Lighthouse, k6, JMeter
  
  Stress            # Forzar sistema más allá de especificaciones
                    # Múltiples login en poco tiempo
                    # Verificar cómo y cuándo falla
                    # Frameworks: k6, JMeter, Gatling
  
  Volume            # Gran cantidad de datos
                    # Comportamiento y tiempo respuesta
                    # Afecta a rendimiento y procesamiento
                    # Frameworks: k6, Great Expectations
  
  Security          # Protegido frente a amenazas
                    # OWASP (SQL injection, XSS, CSRF)
                    # Autorización y autenticación segura
                    # Comportamiento ante ataques
                    # Frameworks: OWASP ZAP, Burp Suite, Snyk
  
  Compatibility     # Comportamiento en diferentes entornos
                    # Navegadores, versiones, dispositivos
                    # Sistemas operativos, bases de datos
                    # Frameworks: Playwright (multi-browser), Cypress
  
  Recovery          # Recuperación rápida de fallas
                    # Sistema continúa operación tras desastre
                    # Resilencia y fault tolerance
                    # Frameworks: k6 failure handling, Spring CircuitBreaker
  
  Accessibility     # Facilidad de uso e intuitividad
                    # Cumplimiento WCAG 2A/2AA
                    # Screen readers, navegación
                    # Nuevo usuario puede usar sin dificultad
                    # Frameworks: axe-core, pa11y, Lighthouse
  ```

  **ADICIONALES / ESPECIALIZADOS**
  ```
  System            # Comportamiento de sistema completo
  E2E               # Flujos usuario end-to-end completos
  UAT               # User Acceptance Testing
  Load              # Performance bajo carga incrementada
  Data Quality      # Integridad, consistencia, validación datos
  Visual            # Visual regression, UI rendering
  Contract          # Consumer-driven contract testing (Pact)
  ```

- **Regla:** Un test por tipo (no mezclar "Unit/API", sino dos tests separados)
- **Alineación:** Todos 12 tipos Pirámide Cohn deben estar representados en suite

---

### 3. COMPONENTE
- **Tipo:** String
- **Descripción:** Área del sistema (mayor granularidad)
- **Ejemplos:** `Auth`, `Payment`, `Dashboard`, `Database`, `Backend`, `Frontend`, `UI`, `API Gateway`, `Cache`
- **Regla:** Máximo 30 caracteres

---

### 4. MODULO
- **Tipo:** String
- **Descripción:** Módulo específico dentro del componente (menor granularidad)
- **Ejemplos:** `Login`, `Register`, `PasswordReset`, `CheckoutCart`, `OrderHistory`, `UserProfile`
- **Regla:** Máximo 50 caracteres

---

### 5. REQUISITO_ID
- **Tipo:** String (puede ser múltiple, separado por comas)
- **Formato:** `REQ-[###]` o `REQ-[###],REQ-[###],REQ-[###]`
- **Ejemplos:**
  - `REQ-001` (un requisito)
  - `REQ-001,REQ-002,REQ-003` (múltiples requisitos)
- **Reglas:**
  - Si el test cubre múltiples requisitos, listarlos separados por coma
  - Máximo 3 requisitos por test
  - Si no tiene requisito específico, usar `REQ-GENERAL` o `REQ-INFRA`

---

### 6. DESCRIPCION
- **Tipo:** String (texto narrativo)
- **Extensión:** 50-200 caracteres
- **Pauta:** Responde "¿Qué se prueba?" en una frase clara
- **Ejemplos:**
  ```
  Validar que email vacío muestra error requerido
  POST /auth con payload sin email retorna 400
  Flujo login completo desde navegación hasta dashboard
  Form login cumple WCAG 2A sin violaciones
  Login responde en < 200ms en red 4G
  ```
- **Reglas:**
  - Sin emojis ni caracteres especiales (salvo punto, coma)
  - Sin referencias a TEST_ID o PASO
  - Escritura clara: debe entender un QA que no conoce el sistema

---

### 7. PRECONDICIONES
- **Tipo:** String (lista de precondiciones)
- **Descripción:** Estado inicial necesario para ejecutar el test
- **Ejemplos:**
  ```
  Usuario no autenticado, navegar a /login
  API running en localhost:3000, BD en estado limpio
  Usuario con cuenta bloqueada en sistema
  Browser cache limpio, cookies eliminadas
  ```
- **Reglas:**
  - Múltiples condiciones separadas por punto y seguido
  - Si no hay precondición, usar "N/A" o "Ninguna"
  - Incluir setup de BD, auth, datos, etc si es relevante

---

### 8. PASOS
- **Tipo:** String (numerado)
- **Descripción:** Secuencia ejecutable de acciones
- **Formato:**
  ```
  1. Navegar a /login
  2. Ingresar email: user@test.com
  3. Ingresar password: ValidPass123
  4. Click botón "Sign In"
  5. Esperar redirect a /dashboard
  ```
- **Reglas:**
  - Numerados (1, 2, 3, ...)
  - Verbos en infinitivo: "Click", "Ingresar", "Esperar", "Verificar"
  - Accionables por humano o máquina (Playwright)
  - Máximo 10 pasos (si > 10, dividir en múltiples tests)
  - Sin ambigüedad: "click botón" es vago; "Click en botón 'Sign In' id=submit-btn" es claro
  - Si necesita datos de prueba, incluir: `Ingresar email: ${TEST_EMAIL}`

---

### 9. RESULTADO_ESPERADO
- **Tipo:** String (asertaciones)
- **Descripción:** Qué debe suceder si el test PASA
- **Ejemplos:**
  ```
  Redirige a /dashboard, status 200, usuario en sesión activa
  Retorna HTTP 400, JSON con error "email required"
  Página carga en < 200ms, 0 console errors, todos los elementos visible
  axe-core reports 0 WCAG violations
  ```
- **Reglas:**
  - Verificable automáticamente (assert-able)
  - Específico: "funciona" es malo; "HTTP 200 + JSON valido + session cookie set" es bueno
  - Incluir condiciones técnicas (status codes, JSON schema, valores)
  - Si hay múltiples asertaciones, separar con punto y seguido
  - Timeouts si aplica: "< 200ms", "within 30 seconds"

---

### 10. PRIORIDAD
- **Tipo:** Enum
- **Valores válidos:**
  ```
  P0   # Blocker - Sistema no funciona sin esto
  P1   # Crítico - Afecta negocio/usuarios directamente
  P2   # Medio - Importante pero no crítico
  P3   # Bajo - Nice-to-have, refinamiento
  ```
- **Ejemplos:**
  ```
  P0 → Login mechanism (sin login, nada funciona)
  P1 → Payment validation (negocio depende)
  P2 → Email notification (mejora, no bloquer)
  P3 → Dark mode support (feature, no crítico)
  ```
- **Regla:** Basado en riesgo de negocio si falla

---

### 11. RIESGO
- **Tipo:** Enum
- **Valores válidos:**
  ```
  Alto    # Impacto grave si falla + probabilidad alta de fallo
  Medio   # Impacto medio o probabilidad media
  Bajo    # Impacto bajo o muy raro que falle
  ```
- **Mapeo a PRIORIDAD:**
  ```
  P0 + Alto riesgo    → Primer en ejecutar
  P1 + Medio riesgo   → Segundo en ejecutar
  P2 + Bajo riesgo    → Tercero en ejecutar
  ```

---

### 12. ETIQUETA_AUTOMATIZACION
- **Tipo:** String (múltiples tags, separados por espacio)
- **Descripción:** Etiquetas para grep, paralelización, filtrado en Playwright
- **Formato:** `@tag1 @tag2 @tag3`
- **Tags estándar:**
  ```
  @unit                 # Unit test
  @api                  # API test
  @e2e                  # End-to-end
  @smoke                # Smoke test
  @regression           # Regression suite
  @perf                 # Performance
  @security             # Security test
  @a11y                 # Accessibility
  @data-quality         # Data validation
  @integration          # Integration test
  
  # Módulos/Componentes
  @auth                 # Authentication module
  @payment              # Payment module
  @dashboard            # Dashboard module
  @login                # Login feature
  @register             # Register feature
  
  # Ejecución
  @parallelizable       # Puede ejecutarse en paralelo sin dependencias
  @serial               # Debe ejecutarse secuencialmente
  @slow                 # Toma > 5 segundos
  @flaky                # Conocidamente inestable (investigar)
  
  # Estado
  @skip                 # No ejecutar (pendiente, broken)
  @focus                # Ejecutar solo este test (dev only)
  @todo                 # Falta implementar
  ```
- **Ejemplo:** `@api @auth @unit @parallelizable`
- **Regla:** Mínimo 2 tags (tipo + módulo)

---

### 13. ESTADO
- **Tipo:** Enum
- **Valores válidos:**
  ```
  Generado        # Recién generado por HAIDA (sin ejecutar)
  Pendiente       # Generado, en backlog para implementación
  En_Desarrollo   # QA está escribiendo el test code
  Implementado    # Code del test existe
  En_Ejecucion    # Actualmente en suite CI/CD
  Pasado          # Última ejecución: PASS
  Fallido         # Última ejecución: FAIL (investigar)
  Bloqueado       # No puede ejecutarse (dependencia falta, env issue)
  Deprecado       # Ya no se necesita (requisito eliminado)
  ```
- **Regla:** Inicial siempre es "Generado"

---

## EJEMPLO DE FILA COMPLETA

```
TC_AUTH_001|Unit|Auth|Login|REQ-001|Validar que email vacío muestra error requerido|Usuario en página de login|1. Dejar campo email vacío 2. Click "Sign In" 3. Esperar validación|Error message "Email requerido" visible, form no submitido|P1|Alto|@unit @auth @parallelizable|Generado

TC_AUTH_002|API|Auth|Login|REQ-001|POST /auth sin email retorna 400|API corriendo en localhost:3000|1. POST /auth con body {password: "test"} sin email|HTTP 400, JSON {error: "email required"}|P1|Alto|@api @auth @parallelizable|Generado

TC_AUTH_003|E2E|Auth|Login|REQ-001,REQ-002|Flujo login completo navigación a dashboard|BD test activa, usuario user1@test.com existe|1. Navigate /login 2. Enter email: user1@test.com 3. Enter password: ValidPass123 4. Click "Sign In" 5. Wait 5s|Redirect /dashboard, status 200, session cookie set, no console errors|P0|Alto|@e2e @auth @regression|Generado

TC_AUTH_004|Accessibility|UI|Login|REQ-003|Form login cumple WCAG 2A|Login page loaded en navegador|1. Ejecutar axe-core en /login|0 WCAG violations detectadas|P2|Medio|@a11y @wcag @auth|Generado

TC_AUTH_005|Load|API|Login|REQ-004|POST /auth responde < 200ms en red 4G|API corriendo, network throttle 4G simulado|1. Throttle network a 4G speeds 2. POST /auth 3. Medir response time|Response < 200ms, HTTP 200|P2|Medio|@perf @api @auth|Generado
```

---

## VALIDACIÓN DEL CSV

**Reglas de validación:**
1. ✓ Todas las columnas presentes en header
2. ✓ TEST_ID único (no duplicados)
3. ✓ TIPO_PRUEBA es válido (from lista)
4. ✓ REQUISITO_ID formato REQ-###
5. ✓ PRIORIDAD P0-P3 válido
6. ✓ RIESGO es Alto/Medio/Bajo
7. ✓ ETIQUETA_AUTOMATIZACION empieza con @
8. ✓ ESTADO es válido (from lista)
9. ✓ Caracteres especiales escapados si contiene pipes (|)
10. ✓ Descripciones claras y sin jerga técnica innecesaria

---

## PARSING DEL CSV

Si usas JavaScript para parsear (en `parse-csv.js`):

```javascript
const csv = require('csv-parse/sync');
const fs = require('fs');

const content = fs.readFileSync('istqb-hiberus/outputs/test-cases-2025-12-15.csv', 'utf-8');

const records = csv.parse(content, {
  columns: true,
  delimiter: '|',
  skip_empty_lines: true
});

records.forEach(record => {
  console.log(`${record.TEST_ID} | ${record.TIPO_PRUEBA} | ${record.DESCRIPCION}`);
  
  // Validar
  if (!record.TEST_ID.startsWith('TC_')) console.error(`Invalid TEST_ID: ${record.TEST_ID}`);
  if (!['Unit', 'API', 'E2E', ...].includes(record.TIPO_PRUEBA)) {
    console.error(`Invalid TIPO_PRUEBA: ${record.TIPO_PRUEBA}`);
  }
});
```

---

## GENERACIÓN DE PLAYWRIGHT SPECS DESDE CSV

Una vez tienes el CSV, puedes generar specs automáticamente:

```javascript
// convert-csv-to-playwright.js
const { parse } = require('csv-parse/sync');

const testTemplate = (test) => `
test.describe('@${test.MODULO}', () => {
  test('${test.DESCRIPCION}', async ({ page }) => {
    // Preconditions
    ${test.PRECONDICIONES}
    
    // Steps
    ${test.PASOS.split(/\d+\./).map(step => `// ${step.trim()}`).join('\n')}
    
    // Assertions
    ${test.RESULTADO_ESPERADO}
  });
});
`;

// Leer CSV y generar
const csv = fs.readFileSync('test-cases.csv', 'utf-8');
const records = parse(csv, { columns: true, delimiter: '|' });

records
  .filter(r => r.TIPO_PRUEBA === 'E2E')
  .forEach(test => {
    console.log(testTemplate(test));
  });
```

---

## NOTAS FINALES

- Este schema es **normalizador**: asegura que todos los CSVs sigan mismo formato
- Los valores son **prescriptivos**: NO inventar valores nuevos
- Si necesitas añadir columnas, solicitar approval (mantiene compatibilidad)
- Los CSVs generados pueden importarse a **Jira**, **TestRail**, **Azure DevOps** si se requiere
