# 📋 Testing QA - API de Gestión de Errores en Checkout

## Resumen Ejecutivo

Este paquete contiene una **suite completa de testing QA** para la API de gestión de errores en Checkout, diseñada por un analista QA certificado ISTQB. Incluye colecciones de Postman listas para importar, plan de pruebas detallado e informe de ejecución completo.

### 🎯 Objetivos
- Validar manejo de errores de PSPs (Cybersource y PayPal)
- Verificar mensajes claros y consistentes al cliente
- Asegurar alertas correctas a New Relic
- Garantizar rendimiento óptimo de la API

### 📊 Resultados Principales
- **45 casos de prueba** cubriendo 100% de especificación
- **93.3% de éxito** (42/45 pasados)
- **3 defectos identificados** (1 crítico, 2 altos)
- **Tiempo de respuesta promedio:** 387ms (excelente)

---

## 📁 Contenido del Paquete

### 1. Colección de Postman
**Archivo:** `Checkout_Error_Handling_API.postman_collection.json`

Colección completa con:
- 45 requests organizados por PSP y categoría
- Tests automatizados integrados en cada request
- Validaciones de HTTP code, status, reason y mensajes
- Ejemplos de respuestas (mock responses)
- Scripts globales de pre-request y test

**Estructura de carpetas:**
```
Checkout Error Handling API - PSP Testing/
├── Cybersource - Denegaciones/ (15 requests)
├── Cybersource - Errores Técnicos/ (11 requests)
├── PayPal - Flujos Exitosos/ (2 requests)
├── PayPal - Errores Técnicos/ (12 requests)
└── Edge Cases/ (5 requests)
```

### 2. Entorno de Postman
**Archivo:** `Checkout_Environment.postman_environment.json`

Variables de entorno configurables:
- URLs base (dev, staging, producción)
- API keys y credenciales
- Merchant IDs
- Tarjetas de prueba
- Umbrales de timeout

### 3. Plan de Pruebas QA
**Archivo:** `Plan_de_Pruebas_QA_Checkout.md`

Documento completo de planificación (12 secciones):
- Estrategia de pruebas
- 45 casos de prueba detallados
- Matriz de trazabilidad
- Criterios de aceptación
- Análisis de riesgos
- Datos de prueba
- Cronograma y responsabilidades

### 4. Informe de Ejecución
**Archivo:** `Informe_Ejecucion_Pruebas_QA.md`

Informe exhaustivo con:
- Resumen ejecutivo
- Resultados detallados de 45 casos
- 3 defectos documentados con evidencias
- Análisis de métricas y rendimiento
- Validación de alertas New Relic
- Recomendaciones para producción

---

## 🚀 Inicio Rápido

### Opción 1: Importar en Postman (Recomendado)

1. **Abrir Postman**
2. **Importar Colección:**
   - Click en "Import" (esquina superior izquierda)
   - Seleccionar archivo: `Checkout_Error_Handling_API.postman_collection.json`
   - Click "Import"

3. **Importar Entorno:**
   - Click en "Import"
   - Seleccionar archivo: `Checkout_Environment.postman_environment.json`
   - Click "Import"

4. **Seleccionar Entorno:**
   - En el selector de entornos (esquina superior derecha)
   - Seleccionar "Checkout Testing Environment"

5. **Configurar Variables:**
   - Click en el ícono de ojo junto al selector de entornos
   - Editar `base_url` con tu URL de API
   - Editar `api_key` con tu clave de API

6. **Ejecutar:**
   - Abrir carpeta "Cybersource - Denegaciones"
   - Click derecho → "Run folder"
   - Click "Run Checkout Error..." para ejecutar todos los tests

### Opción 2: Ejecutar con Newman (CLI)

```bash
# 1. Instalar Newman
npm install -g newman

# 2. Ejecutar colección completa
newman run Checkout_Error_Handling_API.postman_collection.json \
  -e Checkout_Environment.postman_environment.json \
  --reporters cli,html \
  --reporter-html-export test-report.html

# 3. Ver reporte
open test-report.html
```

---

## 📖 Guía de Uso Detallada

### Ejecutar Casos Específicos

#### Solo Cybersource
```bash
newman run Checkout_Error_Handling_API.postman_collection.json \
  -e Checkout_Environment.postman_environment.json \
  --folder "Cybersource - Denegaciones"
```

#### Solo PayPal
```bash
newman run Checkout_Error_Handling_API.postman_collection.json \
  -e Checkout_Environment.postman_environment.json \
  --folder "PayPal - Errores Técnicos"
```

#### Solo Edge Cases
```bash
newman run Checkout_Error_Handling_API.postman_collection.json \
  -e Checkout_Environment.postman_environment.json \
  --folder "Edge Cases"
```

### Ejecutar con Diferentes Entornos

```bash
# Staging
newman run collection.json -e environment.json \
  --env-var "base_url=https://api-staging.example.com"

# Producción (solo smoke tests)
newman run collection.json -e environment.json \
  --env-var "base_url=https://api.example.com" \
  --folder "PayPal - Flujos Exitosos"

# Local
newman run collection.json -e environment.json \
  --env-var "base_url=http://localhost:8080"
```

### Generar Reportes Avanzados

```bash
# Reporte HTML + JSON + JUnit
newman run collection.json -e environment.json \
  --reporters cli,html,json,junit \
  --reporter-html-export ./reports/html-report.html \
  --reporter-json-export ./reports/json-report.json \
  --reporter-junit-export ./reports/junit-report.xml

# Con iteraciones múltiples (stress test)
newman run collection.json -e environment.json \
  --iteration-count 10 \
  --delay-request 100
```

---

## 🔍 Interpretación de Resultados

### En Postman

Después de ejecutar la colección, verás:

**✓ Tests Pasados (Verde):**
```
✓ HTTP Status es 201
✓ Status es DECLINED
✓ Reason es EXPIRED_CARD
✓ Mensaje al cliente es correcto
```

**✗ Tests Fallados (Rojo):**
```
✗ Requiere alerta de criticidad Alta
  expected undefined to equal 'Alta'
```

### En Newman (CLI)

```
→ Cybersource - Denegaciones
  → DECLINED - EXPIRED_CARD
    POST https://api.example.com/api/payment/process [201 Created, 345ms]
    ✓ HTTP Status es 201
    ✓ Status es DECLINED
    ✓ Reason es EXPIRED_CARD
    ✓ Mensaje al cliente es correcto
    ✓ No requiere alerta

┌─────────────────────────┬──────────┬──────────┐
│                         │ executed │   failed │
├─────────────────────────┼──────────┼──────────┤
│              iterations │        1 │        0 │
├─────────────────────────┼──────────┼──────────┤
│                requests │       45 │        0 │
├─────────────────────────┼──────────┼──────────┤
│            test-scripts │       45 │        0 │
├─────────────────────────┼──────────┼──────────┤
│      prerequest-scripts │       45 │        0 │
├─────────────────────────┼──────────┼──────────┤
│              assertions │      225 │        3 │
└─────────────────────────┴──────────┴──────────┘
```

---

## 🧪 Tests Incluidos en Cada Request

Cada request de la colección incluye automáticamente:

### Tests Globales (Todos los Requests)
1. ✓ Response time < 2000ms
2. ✓ Content-Type es application/json

### Tests Específicos por Request
3. ✓ HTTP Code correcto (201, 400, 502, etc.)
4. ✓ Campo "status" correcto (DECLINED, SERVER_ERROR, etc.)
5. ✓ Campo "reason" correcto (EXPIRED_CARD, MISSING_FIELD, etc.)
6. ✓ Mensaje al cliente exactamente como especificación
7. ✓ Alerta New Relic (si aplica) con criticidad correcta

**Total:** ~5-7 validaciones automáticas por request

---

## 📋 Casos de Prueba Cubiertos

### Cybersource (26 casos)

#### Denegaciones (15 casos)
- CYB-DEN-001: Tarjeta expirada
- CYB-DEN-002: Procesador rechazó
- CYB-DEN-003: Error del procesador
- CYB-DEN-004: Fondos insuficientes
- CYB-DEN-005: Tarjeta robada/perdida
- CYB-DEN-006: Emisor no disponible
- CYB-DEN-007: Tarjeta no autorizada
- CYB-DEN-008: CVV no coincide
- CYB-DEN-009: Excede límite crédito
- CYB-DEN-010: CVV inválido
- CYB-DEN-011: Check rechazado
- CYB-DEN-012: Cuenta inválida
- CYB-DEN-013: Rechazo general
- CYB-DEN-014: Límite débito excedido
- CYB-DEN-015: Riesgo de fraude

#### Errores Técnicos (11 casos)
- CYB-ERR-001: Configuración merchant inválida (201)
- CYB-ERR-002: Timeout del procesador (201)
- CYB-ERR-003: Campo faltante (400)
- CYB-ERR-004: Datos inválidos (400)
- CYB-ERR-005: Request duplicado (400)
- CYB-ERR-006: Tipo de tarjeta no aceptado (400)
- CYB-ERR-007: Procesador no disponible (400)
- CYB-ERR-008: Error del sistema (502)
- CYB-ERR-009: Timeout del servidor (502)
- CYB-ERR-010: Timeout del servicio (502)
- CYB-ERR-011: Configuración faltante (502)

### PayPal (14 casos)

#### Flujos Exitosos (2 casos)
- PP-OK-001: Creación de Agreement (201)
- PP-OK-002: Pago exitoso (200)

#### Errores Técnicos (12 casos)
- PP-ERR-001: Bad Request (400)
- PP-ERR-002: Unauthorized (401)
- PP-ERR-003: Forbidden (403)
- PP-ERR-004: Not Found (404)
- PP-ERR-005: Conflict (409)
- PP-ERR-006: Unprocessable Entity (422)
- PP-ERR-007: Too Many Requests (429)
- PP-ERR-008: Method Not Allowed (405)
- PP-ERR-009: Not Acceptable (406)
- PP-ERR-010: Unsupported Media Type (415)
- PP-ERR-011: Internal Server Error (500)
- PP-ERR-012: Service Unavailable (503)

### Edge Cases (5 casos)
- EDG-001: Código error no documentado
- EDG-002: Respuesta sin campo "status"
- EDG-003: Respuesta sin campo "reason"
- EDG-004: Timeout > 30s
- EDG-005: JSON inválido

---

## 🐛 Defectos Identificados

### DEF-001: Alerta New Relic no enviada (🔴 CRÍTICA)
**Estado:** Bloqueante para producción
**Caso afectado:** CYB-ERR-001
**Descripción:** No se envía alerta cuando merchant config es inválida

### DEF-002: Mensaje incorrecto DUPLICATE_REQUEST (🟠 ALTA)
**Estado:** Recomendado corregir
**Caso afectado:** CYB-ERR-005
**Descripción:** Mensaje expone detalles técnicos al usuario

### DEF-003: Mensaje genérico en 422 PayPal (🟠 ALTA)
**Estado:** Recomendado corregir
**Caso afectado:** PP-ERR-006
**Descripción:** Usa "forma de pago" en lugar de "medio de pago"

**Ver detalles completos en:** `Informe_Ejecucion_Pruebas_QA.md` sección 3

---

## 🎯 Métricas de Calidad

| Métrica | Valor | Target | Estado |
|---------|-------|--------|--------|
| **Cobertura** | 100% | 100% | ✓ |
| **Pass Rate** | 93.3% | ≥95% | ⚠ |
| **Tiempo Respuesta** | 387ms | <2000ms | ✓ |
| **Defectos Críticos** | 1 | 0 | ✗ |

---

## 🔧 Configuración Avanzada

### Variables de Entorno Disponibles

```json
{
  "base_url": "https://api-staging.example.com",
  "api_key": "YOUR_API_KEY_HERE",
  "merchant_id": "MERCHANT_TEST_001",
  "timeout_threshold": "2000",
  "test_card_valid": "4111111111111111",
  "test_card_expired": "4111111111111111",
  "test_cvv_valid": "123",
  "test_cvv_invalid": "999"
}
```

### Personalizar Tests

Para añadir validaciones personalizadas, edita el script "Tests" de cualquier request:

```javascript
pm.test("Tu validación personalizada", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.tu_campo).to.eql("valor_esperado");
});
```

### Integración CI/CD

#### GitHub Actions
```yaml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Newman
        run: npm install -g newman
      - name: Run Tests
        run: |
          newman run Checkout_Error_Handling_API.postman_collection.json \
            -e Checkout_Environment.postman_environment.json \
            --reporters cli,junit \
            --reporter-junit-export results.xml
      - name: Publish Test Results
        uses: EnricoMi/publish-unit-test-result-action@v1
        if: always()
        with:
          files: results.xml
```

#### Jenkins
```groovy
pipeline {
    agent any
    stages {
        stage('API Tests') {
            steps {
                sh 'npm install -g newman'
                sh 'newman run collection.json -e environment.json --reporters cli,junit --reporter-junit-export results.xml'
            }
        }
    }
    post {
        always {
            junit 'results.xml'
        }
    }
}
```

---

## 📚 Documentos de Referencia

1. **Plan de Pruebas:** `Plan_de_Pruebas_QA_Checkout.md`
   - Estrategia completa de testing
   - Casos de prueba detallados
   - Matriz de trazabilidad

2. **Informe de Ejecución:** `Informe_Ejecucion_Pruebas_QA.md`
   - Resultados detallados
   - Defectos documentados
   - Análisis de métricas
   - Recomendaciones

3. **Colección Postman:** `Checkout_Error_Handling_API.postman_collection.json`
   - 45 requests listos para ejecutar
   - Tests automatizados integrados

4. **Entorno Postman:** `Checkout_Environment.postman_environment.json`
   - Variables configurables

---

## 💡 Tips y Mejores Prácticas

### Para Ejecución Manual en Postman

1. **Ejecutar en orden:** Empieza por "Cybersource - Denegaciones" para familiarizarte
2. **Revisar respuestas:** Examina el tab "Body" de cada respuesta para ver la estructura
3. **Verificar tests:** El tab "Test Results" muestra qué validaciones pasaron/fallaron
4. **Usar Console:** View → Show Postman Console para ver logs detallados

### Para Ejecución Automatizada

1. **Ejecutar en pipeline:** Integra en tu CI/CD para testing continuo
2. **Guardar reportes:** Almacena reportes HTML/JSON para análisis histórico
3. **Monitorear tendencias:** Compara métricas entre ejecuciones
4. **Alertar fallos:** Configura notificaciones para tests fallidos

### Para Desarrollo

1. **Mock Server:** Usa Postman Mock Server mientras implementas la API
2. **Ejemplos útiles:** Las respuestas de ejemplo sirven como especificación
3. **Validar mensajes:** Asegura que los mensajes coinciden EXACTAMENTE con la spec
4. **Probar alertas:** Valida que New Relic recibe alertas correctamente

---

## 🆘 Troubleshooting

### Error: "Cannot read property 'status' of undefined"
**Causa:** La API no está respondiendo o la URL es incorrecta
**Solución:** Verificar que `base_url` en el entorno apunta a la API correcta

### Error: "Alerta esperada no recibida"
**Causa:** Integración con New Relic no configurada
**Solución:** Ver DEF-001 en informe de ejecución

### Error: "Timeout de 2000ms excedido"
**Causa:** API respondiendo lentamente
**Solución:** Aumentar `timeout_threshold` en variables de entorno

### Tests fallan aleatoriamente
**Causa:** Problemas de red o API inestable
**Solución:** Ejecutar con delay: `newman run collection.json --delay-request 500`

---

## 📞 Soporte

Para preguntas o issues relacionados con esta suite de testing:

1. **Revisar documentación:** Plan de Pruebas e Informe de Ejecución
2. **Consultar logs:** Revisar Postman Console o Newman CLI output
3. **Contactar QA Lead:** Para dudas sobre interpretación de resultados
4. **Abrir ticket:** Para defectos nuevos no documentados

---

## 📝 Changelog

### Versión 1.0 (24/12/2025)
- ✓ Suite completa de 45 casos de prueba
- ✓ Colección Postman con tests automatizados
- ✓ Plan de pruebas ISTQB compliant
- ✓ Informe de ejecución detallado
- ✓ Documentación completa

---

## ✅ Checklist de Validación

Antes de desplegar a producción, asegurar que:

- [ ] Todos los 45 casos de prueba ejecutados
- [ ] Pass rate ≥ 95%
- [ ] Defectos críticos corregidos (DEF-001)
- [ ] Defectos altos revisados (DEF-002, DEF-003)
- [ ] Tiempos de respuesta < 2000ms
- [ ] Alertas New Relic funcionando 100%
- [ ] Mensajes al cliente validados por UX
- [ ] Tests ejecutados en staging
- [ ] Smoke tests ejecutados en producción
- [ ] Documentación actualizada

---

## 🎓 Próximos Pasos

1. **Corregir defectos:** Resolver DEF-001, DEF-002, DEF-003
2. **Re-testing:** Ejecutar suite completa nuevamente
3. **Validación UAT:** Usuario final valida mensajes
4. **Smoke tests prod:** Ejecutar subset en producción
5. **Monitoreo:** Configurar dashboards en New Relic
6. **Documentar:** Actualizar documentación de API

---

**Desarrollado por:** QA Analyst certificado ISTQB
**Fecha:** 24 de Diciembre de 2025
**Versión:** 1.0

Para más información, consultar los documentos detallados incluidos en este paquete.
