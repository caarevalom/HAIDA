# Plan de Pruebas QA - Gestión de Errores en Checkout
## API de Respuestas de PSP (Cybersource y PayPal)

**Autor:** QA Analyst con certificación ISTQB
**Fecha:** 24 de Diciembre de 2025
**Versión:** 1.0
**Proyecto:** Checkout Error Handling API

---

## 1. INTRODUCCIÓN

### 1.1 Objetivo
Validar la correcta implementación de la gestión de errores y mensajes al cliente en el proceso de checkout, asegurando que todos los códigos de respuesta de los PSPs (Cybersource y PayPal) sean manejados según la especificación.

### 1.2 Alcance
Este plan de pruebas cubre:
- Validación de códigos HTTP de respuesta
- Verificación de estados (status) y razones (reason)
- Validación de mensajes mostrados al cliente
- Verificación de alertas a New Relic según criticidad
- Pruebas de flujos exitosos y fallidos
- Casos extremos (edge cases)

### 1.3 Referencias
- Historia de Usuario: "Mensajes de error claros en checkout"
- Tabla de equivalencias PSP
- Design Kit para diseños de errores
- Documentación API Cybersource
- Documentación API PayPal

---

## 2. ESTRATEGIA DE PRUEBAS

### 2.1 Niveles de Prueba
- **Pruebas de Integración API:** Validación de respuestas de endpoints
- **Pruebas Funcionales:** Verificación de lógica de negocio
- **Pruebas de Mensajes:** Validación de mensajes al usuario final
- **Pruebas de Monitorización:** Verificación de alertas a New Relic

### 2.2 Tipos de Prueba
- **Pruebas Positivas:** Validar flujos exitosos
- **Pruebas Negativas:** Validar manejo de errores
- **Pruebas de Límites:** Validar casos extremos
- **Pruebas de Regresión:** Asegurar que cambios no afecten funcionalidad existente

### 2.3 Herramientas
- **Postman:** Ejecución de pruebas de API
- **Newman:** Ejecución automatizada de colecciones
- **New Relic:** Monitorización de alertas
- **Git:** Control de versiones de artefactos de prueba

### 2.4 Entorno de Pruebas
- **Staging:** https://api-checkout-staging.example.com
- **Producción:** https://api-checkout.example.com (solo smoke tests)
- **Local/Dev:** http://localhost:8080

---

## 3. CASOS DE PRUEBA

### 3.1 Cybersource - Denegaciones (HTTP 201)

| ID | Escenario | Status | Reason | Mensaje Esperado | Alerta | Prioridad |
|----|-----------|--------|--------|------------------|--------|-----------|
| CYB-DEN-001 | Tarjeta expirada | DECLINED | EXPIRED_CARD | "Pago no procesado. Revisa los datos de tu tarjeta" | No | Alta |
| CYB-DEN-002 | Procesador rechazó | DECLINED | PROCESSOR_DECLINED | "Pago no procesado. Por favor, inténtalo con otra tarjeta o medio de pago." | No | Alta |
| CYB-DEN-003 | Error del procesador | DECLINED | PROCESSOR_ERROR | "Pago no procesado. Por favor, inténtalo con otra tarjeta o medio de pago." | No | Alta |
| CYB-DEN-004 | Fondos insuficientes | DECLINED | INSUFFICIENT_FUND | "Pago no procesado. Por favor, inténtalo con otra tarjeta o medio de pago." | No | Alta |
| CYB-DEN-005 | Tarjeta robada/perdida | DECLINED | STOLEN_LOST_CARD | "Pago no procesado. Por favor, inténtalo con otra tarjeta o medio de pago." | No | Alta |
| CYB-DEN-006 | Emisor no disponible | DECLINED | ISSUER_UNAVAILABLE | "Pago no procesado. Por favor, vuelve a intentarlo más tarde." | No | Alta |
| CYB-DEN-007 | Tarjeta no autorizada | DECLINED | UNAUTHORIZED_CARD | "Pago no procesado. Por favor, inténtalo con otra tarjeta o medio de pago." | No | Alta |
| CYB-DEN-008 | CVV no coincide | DECLINED | CVN_NOT_MATCH | "Pago no procesado. Revisa los datos de tu tarjeta" | No | Alta |
| CYB-DEN-009 | Excede límite crédito | DECLINED | EXCEEDS_CREDIT_LIMIT | "Pago no procesado. Por favor, inténtalo con otra tarjeta o medio de pago." | No | Alta |
| CYB-DEN-010 | CVV inválido | DECLINED | INVALID_CVN | "Pago no procesado. Por favor, revisa los datos de tu tarjeta" | No | Alta |
| CYB-DEN-011 | Check rechazado | DECLINED | DECLINED_CHECK | "Pago no procesado. Por favor, revisa los datos de tu tarjeta" | No | Media |
| CYB-DEN-012 | Cuenta inválida | DECLINED | INVALID_ACCOUNT | "Pago no procesado. Por favor, revisa los datos de tu tarjeta" | No | Alta |
| CYB-DEN-013 | Rechazo general | DECLINED | GENERAL_DECLINE | "Pago no procesado. Por favor, inténtalo con otra tarjeta o medio de pago." | No | Alta |
| CYB-DEN-014 | Límite débito excedido | DECLINED | DEBIT_CARD_USAGE_LIMIT_EXCEEDED | "Pago no procesado. Por favor, inténtalo con otro medio de pago" | No | Media |
| CYB-DEN-015 | Riesgo de fraude | AUTHORIZED_RISK_DECLINED | SCORE_EXCEEDS_THRESHOLD | "No pudimos completar tu pago. Intenta con otro método o contacta a tu banco." | No | Alta |

### 3.2 Cybersource - Errores Técnicos

| ID | HTTP | Status | Reason | Mensaje Esperado | Alerta | Prioridad |
|----|------|--------|--------|------------------|--------|-----------|
| CYB-ERR-001 | 201 | INVALID_REQUEST | INVALID_MERCHANT_CONFIGURATION | "Pago no procesado. Por favor, inténtalo con otro medio de pago" | Alta | Crítica |
| CYB-ERR-002 | 201 | SERVER_ERROR | PROCESSOR_TIMEOUT | "Ha ocurrido un error. Por favor inténtalo más tarde" | Baja | Media |
| CYB-ERR-003 | 400 | INVALID_REQUEST | MISSING_FIELD | "Pago no procesado. Por favor, inténtalo con otro medio de pago" | Alta | Crítica |
| CYB-ERR-004 | 400 | INVALID_REQUEST | INVALID_DATA | "Pago no procesado. Por favor, inténtalo con otro medio de pago" | Alta | Crítica |
| CYB-ERR-005 | 400 | INVALID_REQUEST | DUPLICATE_REQUEST | "Pago no procesado. Por favor, vuelve a intentarlo más tarde." | Alta | Alta |
| CYB-ERR-006 | 400 | INVALID_REQUEST | CARD_TYPE_NOT_ACCEPTED | "Pago no procesado. Por favor, inténtalo con otro medio de pago" | No | Alta |
| CYB-ERR-007 | 400 | INVALID_REQUEST | PROCESSOR_UNAVAILABLE | "Pago no procesado. Por favor, vuelve a intentarlo más tarde." | Media | Alta |
| CYB-ERR-008 | 502 | SERVER_ERROR | SYSTEM_ERROR | "Pago no procesado. Por favor, vuelve a intentarlo más tarde." | Alta | Crítica |
| CYB-ERR-009 | 502 | SERVER_ERROR | SERVER_TIMEOUT | "Ha ocurrido un error. Por favor inténtalo más tarde" | Baja | Media |
| CYB-ERR-010 | 502 | SERVER_ERROR | SERVICE_TIMEOUT | "No pudimos completar tu pago. Intenta con otro método o contacta a tu banco." | Media | Alta |
| CYB-ERR-011 | 502 | SERVER_ERROR | INVALID_OR_MISSING_CONFIG | "Pago no procesado. Por favor, inténtalo con otro medio de pago" | Alta | Crítica |

### 3.3 PayPal - Flujos Exitosos

| ID | HTTP | Status | Proceso | Acción Esperada | Prioridad |
|----|------|--------|---------|-----------------|-----------|
| PP-OK-001 | 201 | Created | Creación Agreement | Mostrar agreement creado | Alta |
| PP-OK-002 | 200 | OK | Pago | Redirigir a página de confirmación | Alta |

### 3.4 PayPal - Errores Técnicos

| ID | HTTP | Status | Mensaje Esperado | Alerta | Prioridad |
|----|------|--------|------------------|--------|-----------|
| PP-ERR-001 | 400 | Bad Request | "Ha ocurrido un error al procesar tu solicitud. Revisa los datos e inténtalo de nuevo." | Alta | Crítica |
| PP-ERR-002 | 401 | Unauthorized | "Pago no procesado. Por favor, inténtalo con otro medio de pago" | Alta | Crítica |
| PP-ERR-003 | 403 | Forbidden | "Pago no procesado. Por favor, inténtalo con otro medio de pago" | Alta | Crítica |
| PP-ERR-004 | 404 | Not Found | "Pago no procesado. Por favor, inténtalo con otro medio de pago" | Alta | Crítica |
| PP-ERR-005 | 409 | Conflict | "Ha ocurrido un error. Por favor inténtalo más tarde" | Alta | Alta |
| PP-ERR-006 | 422 | Unprocessable Entity | "Pago no procesado. Por favor, inténtalo con otro medio de pago" | No | Alta |
| PP-ERR-007 | 429 | Too Many Requests | "Pago no procesado. Por favor, vuelve a intentarlo más tarde." | Alta | Alta |
| PP-ERR-008 | 405 | Method Not Allowed | "Pago no procesado. Por favor, vuelve a intentarlo más tarde." | Alta | Crítica |
| PP-ERR-009 | 406 | Not Acceptable | "Pago no procesado. Por favor, vuelve a intentarlo más tarde." | Alta | Crítica |
| PP-ERR-010 | 415 | Unsupported Media Type | "Pago no procesado. Por favor, vuelve a intentarlo más tarde." | Alta | Crítica |
| PP-ERR-011 | 500 | Internal Server Error | "Pago no procesado. Por favor, vuelve a intentarlo más tarde." | Alta | Crítica |
| PP-ERR-012 | 503 | Service Unavailable | "Pago no procesado. Por favor, vuelve a intentarlo más tarde." | Alta | Crítica |

### 3.5 Edge Cases

| ID | Escenario | Resultado Esperado | Prioridad |
|----|-----------|-------------------|-----------|
| EDG-001 | Código error no documentado | "Pago no procesado. Por favor, inténtalo con otra forma de pago" | Alta |
| EDG-002 | Respuesta sin campo "status" | Error de validación / mensaje genérico | Media |
| EDG-003 | Respuesta sin campo "reason" | Error de validación / mensaje genérico | Media |
| EDG-004 | Timeout de respuesta > 30s | Mensaje de timeout | Alta |
| EDG-005 | Respuesta malformada (JSON inválido) | Error de parseo / mensaje genérico | Alta |

---

## 4. MATRIZ DE TRAZABILIDAD

| Requisito | Casos de Prueba | Cobertura |
|-----------|-----------------|-----------|
| Cybersource - Denegaciones | CYB-DEN-001 a CYB-DEN-015 | 100% (15 escenarios) |
| Cybersource - Errores Técnicos | CYB-ERR-001 a CYB-ERR-011 | 100% (11 escenarios) |
| PayPal - Flujos Exitosos | PP-OK-001 a PP-OK-002 | 100% (2 escenarios) |
| PayPal - Errores Técnicos | PP-ERR-001 a PP-ERR-012 | 100% (12 escenarios) |
| Edge Cases | EDG-001 a EDG-005 | 100% (5 casos) |
| **Total** | **45 casos de prueba** | **100%** |

---

## 5. CRITERIOS DE ACEPTACIÓN

### 5.1 Criterios de Entrada (Entry Criteria)
- [ ] API de checkout desplegada en entorno de testing
- [ ] Acceso a credenciales de PSPs de sandbox
- [ ] Colección de Postman importada y configurada
- [ ] Variables de entorno configuradas
- [ ] Acceso a New Relic para validar alertas

### 5.2 Criterios de Salida (Exit Criteria)
- [ ] 100% de casos de prueba ejecutados
- [ ] 95% de casos de prueba pasados (mínimo)
- [ ] 0 defectos críticos abiertos
- [ ] Todos los defectos de alta prioridad resueltos o documentados
- [ ] Informe de pruebas completo y aprobado
- [ ] Validación de alertas en New Relic para casos críticos

### 5.3 Criterios de Éxito por Caso de Prueba
Un caso de prueba se considera **PASADO** si:
1. El código HTTP es el esperado
2. El campo "status" coincide con la especificación
3. El campo "reason" coincide con la especificación
4. El mensaje al cliente es exactamente el especificado
5. La alerta a New Relic se genera con la criticidad correcta (si aplica)
6. El tiempo de respuesta es < 2000ms

---

## 6. RIESGOS Y MITIGACIÓN

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| PSP sandbox no disponible | Media | Alto | Usar mocks/stubs de respuestas |
| Cambios en API de PSP | Baja | Alto | Monitorear documentación oficial PSP |
| Diferencias entre entornos | Media | Medio | Validar configuración en cada entorno |
| Alertas New Relic no llegan | Baja | Medio | Verificar configuración de integración |
| Timeouts por latencia red | Media | Bajo | Ajustar timeout threshold en tests |
| Datos de prueba incorrectos | Baja | Medio | Documentar tarjetas de prueba oficiales |

---

## 7. DATOS DE PRUEBA

### 7.1 Tarjetas de Prueba - Cybersource

| Número Tarjeta | Escenario | Resultado Esperado |
|----------------|-----------|-------------------|
| 4111111111111111 | Tarjeta válida | Procesamiento normal |
| 4111111111111111 (exp: 12/2020) | Tarjeta expirada | EXPIRED_CARD |
| 4111111111111112 | Rechazo procesador | PROCESSOR_DECLINED |
| 4111111111111113 | Fondos insuficientes | INSUFFICIENT_FUND |
| 4111111111111115 | Alto riesgo fraude | SCORE_EXCEEDS_THRESHOLD |

### 7.2 Configuración PayPal

| Parámetro | Valor Testing | Valor Producción |
|-----------|---------------|------------------|
| Client ID | SANDBOX_CLIENT_ID | PROD_CLIENT_ID |
| Secret | SANDBOX_SECRET | PROD_SECRET |
| Endpoint | api.sandbox.paypal.com | api.paypal.com |
| Return URL | https://staging.checkout.com/return | https://checkout.com/return |

---

## 8. EJECUCIÓN DE PRUEBAS

### 8.1 Ejecución Manual
1. Importar colección en Postman
2. Importar entorno de testing
3. Ejecutar carpetas en orden:
   - Cybersource - Denegaciones
   - Cybersource - Errores Técnicos
   - PayPal - Flujos Exitosos
   - PayPal - Errores Técnicos
   - Edge Cases
4. Documentar resultados en informe

### 8.2 Ejecución Automatizada (Newman)
```bash
# Instalar Newman
npm install -g newman

# Ejecutar colección completa
newman run Checkout_Error_Handling_API.postman_collection.json \
  -e Checkout_Environment.postman_environment.json \
  --reporters cli,json,html \
  --reporter-html-export ./reports/test-report.html

# Ejecutar solo Cybersource
newman run Checkout_Error_Handling_API.postman_collection.json \
  -e Checkout_Environment.postman_environment.json \
  --folder "Cybersource - Denegaciones"
```

### 8.3 Integración CI/CD
```yaml
# Ejemplo GitHub Actions
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Postman Tests
        run: |
          npm install -g newman
          newman run Checkout_Error_Handling_API.postman_collection.json \
            -e Checkout_Environment.postman_environment.json \
            --reporters cli,json
```

---

## 9. MÉTRICAS DE CALIDAD

### 9.1 Métricas de Ejecución
- **Total Test Cases:** 45
- **Pass Rate Target:** ≥ 95%
- **Defect Detection Rate:** Defectos encontrados / Total casos ejecutados
- **Test Coverage:** 100% de especificación cubierta

### 9.2 Métricas de Rendimiento
- **Response Time:** < 2000ms (promedio)
- **Response Time p95:** < 3000ms
- **Response Time p99:** < 5000ms

### 9.3 Métricas de Alertas
- **Alert Delivery Rate:** 100% para alertas críticas
- **Alert False Positive Rate:** < 5%

---

## 10. RESPONSABILIDADES

| Rol | Responsabilidad |
|-----|-----------------|
| QA Lead | Aprobación del plan de pruebas, revisión de resultados |
| QA Analyst (ISTQB) | Diseño y ejecución de pruebas, documentación |
| DevOps Engineer | Configuración de entornos, acceso a PSPs |
| Backend Developer | Resolución de defectos, soporte técnico |
| Product Owner | Validación de mensajes al cliente |
| New Relic Admin | Configuración y validación de alertas |

---

## 11. CRONOGRAMA

| Actividad | Duración | Dependencias |
|-----------|----------|--------------|
| Configuración de entorno | 1 día | Acceso a sandbox PSP |
| Importación de colecciones | 0.5 días | Colecciones creadas |
| Ejecución de pruebas | 2 días | Entorno configurado |
| Documentación de defectos | 1 día | Pruebas ejecutadas |
| Re-testing | 1 día | Defectos resueltos |
| Informe final | 1 día | Todas las pruebas completas |
| **Total** | **6.5 días** | |

---

## 12. APROBACIONES

| Nombre | Rol | Firma | Fecha |
|--------|-----|-------|-------|
| | QA Lead | | |
| | Product Owner | | |
| | Technical Lead | | |

---

## ANEXOS

### Anexo A: Comandos Útiles Newman
```bash
# Generar reporte HTML detallado
newman run collection.json -e environment.json \
  --reporters cli,html \
  --reporter-html-export report.html

# Ejecutar con delay entre requests
newman run collection.json -e environment.json \
  --delay-request 500

# Ejecutar iteraciones múltiples
newman run collection.json -e environment.json \
  --iteration-count 5

# Generar reporte JUnit (para CI/CD)
newman run collection.json -e environment.json \
  --reporters junit \
  --reporter-junit-export results.xml
```

### Anexo B: Validaciones JSON Schema
Cada respuesta debe cumplir con el siguiente schema base:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["psp", "http_code", "status", "mensaje_cliente"],
  "properties": {
    "psp": {
      "type": "string",
      "enum": ["Cybersource", "PayPal"]
    },
    "categoria": {
      "type": "string",
      "enum": ["Denegación", "Error Técnico", "Éxito"]
    },
    "http_code": {
      "type": "integer"
    },
    "proceso": {
      "type": "string",
      "enum": ["Pago", "Creación de Agreement"]
    },
    "status": {
      "type": "string"
    },
    "reason": {
      "type": "string"
    },
    "mensaje_cliente": {
      "type": "string"
    },
    "alerta": {
      "type": "string",
      "enum": ["Alta", "Media", "Baja"]
    }
  }
}
```

---

**Fin del Plan de Pruebas QA**
