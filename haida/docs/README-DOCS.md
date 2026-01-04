# Adjuntar Documentación Funcional a HAIDA

**Instrucciones:** Copia tu documentación funcional aquí para que HAIDA genere test cases automáticamente.

---

## ¿QUÉ ADJUNTAR?

Documentos aceptados (en Markdown):

### 1. **Business Requirements Document (BRD)**

- Especificación funcional de alto nivel
- Requisitos de negocio (REQ-###)
- Criterios de aceptación
- Casos de uso
- Datos de prueba

**Ejemplo:** `brd-login-module.md`, `brd-payment-flow.md`

### 2. **Product Requirements Document (PRD)**

- Definición de features
- User stories
- Criterios de aceptación
- Mockups o wireframes (si los tienes, describirlos en texto)

**Ejemplo:** `prd-dashboard-v2.md`, `prd-mobile-app.md`

### 3. **Technical Specifications (TechSpec)**

- Arquitectura técnica
- APIs a exponer
- Integraciones
- Componentes y módulos

**Ejemplo:** `techspec-auth-service.md`, `techspec-payment-gateway.md`

### 4. **API Specifications (OpenAPI/Swagger en Markdown)**

- Endpoints
- Request/Response contracts
- Status codes
- Error handling

**Ejemplo:** `api-spec-auth-endpoints.md`, `api-spec-payment-api.md`

---

## CÓMO ADJUNTAR

### Opción A: Crear desde template

```powershell
# Copiar template a esta carpeta
Copy-Item "..\templates\FUNCTIONAL-SPEC-TEMPLATE.md" `
  -Destination ".\especificacion-mi-modulo.md"

# Editar y rellenar
notepad .\especificacion-mi-modulo.md
```

### Opción B: Copiar documento existente

```powershell
# Si ya tienes un BRD/PRD, cópialo aquí
Copy-Item "C:\Documentos\BRD-Login.md" `
  -Destination ".\brd-login.md"

# HAIDA lo procesará tal cual
```

### Opción C: Crear desde cero

1. Abre VS Code
2. Nuevo archivo: `especificacion-[modulo].md`
3. Sigue estructura de [FUNCTIONAL-SPEC-TEMPLATE.md](../templates/FUNCTIONAL-SPEC-TEMPLATE.md)
4. Rellena completamente
5. Guarda aquí

---

## ESTRUCTURA ESPERADA (Mínimo)

Tu documento debe incluir:

````markdown
# Nombre del Módulo/Feature

## Requisitos Funcionales

### REQ-001: Descripción

- Criterios de aceptación
- Casos de uso

### REQ-002: Descripción

- ...

## Flujos de Usuario

### Flujo principal

1. Paso 1
2. Paso 2
   ...

## Datos de Prueba

```json
{
  "usuarios": [...],
  "datos_validos": [...],
  "datos_invalidos": [...]
}
```
````

## Integraciones

| Sistema | Tipo | Criticidad |
| ------- | ---- | ---------- |

## Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
| ------ | ------------ | ------- | ---------- |

````

---

## GENERADOR ISTQB

Una vez adjuntes tu documento aquí, ejecuta:

```powershell
# En raíz de qa-starter-kit
powershell -File istqb-hiberus\generators\generate-tests.ps1 `
  -DocPath "istqb-hiberus\docs\tu-especificacion.md"
````

El generador:

1. ✓ Lee tu documento
2. ✓ Envía prompt a Copilot/Claude
3. ✓ Recibe test cases ISTQB
4. ✓ Genera CSV en: `istqb-hiberus/outputs/test-cases-YYYY-MM-DD.csv`
5. ✓ Crea matriz de requisitos
6. ✓ Exporta a formatos compatibles

---

## EJEMPLOS

- **Completo:** `../examples/example-brd.md` → `../examples/example-output.csv`
- **Login:** Ver paso a paso en `../examples/STEP-BY-STEP.md`

---

## VALIDACIÓN

Antes de generar, valida tu documento:

- [ ] Está en Markdown (.md)
- [ ] Tiene sección "Requisitos Funcionales"
- [ ] Cada requisito empieza con REQ-### (REQ-001, REQ-002, ...)
- [ ] Criterios de aceptación claros
- [ ] Casos de uso/flujos definidos
- [ ] Datos de prueba incluidos
- [ ] No contiene PII (datos sensibles)
- [ ] Codificación UTF-8 sin BOM

---

## RESTRICCIONES

❌ **NO adjuntes:**

- Archivos binarios (PDF, DOCX, XLS) - conviértelos a .md primero
- Información sensible (contraseñas, APIs keys, datos reales)
- Documentos mayores a 500 KB (divide en múltiples módulos)
- Imágenes de mockups (describe en texto, o adjunta URL)

✅ **SÍ adjunta:**

- Markdown (.md) con estructura clara
- Requisitos numerados (REQ-###)
- Criterios de aceptación específicos
- Datos de prueba anónimos
- Flujos de usuario paso a paso

---

## PRÓXIMOS PASOS

1. Adjunta tu especificación aquí
2. Ejecuta: `powershell -File ../generators/generate-tests.ps1 -DocPath "tu-archivo.md"`
3. Valida CSV en `../outputs/`
4. Integra test cases a suite (Playwright/Newman/Jest)
5. Ejecuta: `npm run test:web`

---

**Preguntas?** Ver documentación completa en `../README.md`
