# TEMPLATE - Especificación Funcional para HAIDA

**Instrucciones:** Copia este archivo, renómbralo como `especificacion-[MODULO].md`, rellena todas las secciones y adjunta a `istqb-hiberus/docs/`.

---

## INFORMACIÓN GENERAL

| Campo                     | Valor                              |
| ------------------------- | ---------------------------------- |
| **Módulo**                | Ejemplo: Login, Payment, Dashboard |
| **Versión**               | 1.0                                |
| **Fecha**                 | YYYY-MM-DD                         |
| **Responsable**           | Nombre del PO/Product Manager      |
| **Componentes afectados** | Backend, Frontend, Database, APIs  |

---

## RESUMEN EJECUTIVO

Descripción breve de qué hace este módulo, cuál es su propósito en el sistema y por qué es importante.

**Ejemplo:**

```
El módulo Login permite a usuarios autenticarse en el sistema usando email y
contraseña. Es crítico para acceso a aplicación y debe soportar 500+ usuarios
simultáneos con latencia < 200ms.
```

---

## REQUISITOS FUNCIONALES

### REQ-001: Validación de Credenciales

**Descripción:** El sistema debe validar email y contraseña contra base de datos.

**Criterios de Aceptación:**

- Email debe ser formato válido (RFC 5322)
- Contraseña debe tener mínimo 8 caracteres
- Si credenciales inválidas, mostrar error genérico
- Máximo 3 intentos fallidos → bloquear cuenta 15 minutos

**Casos de Uso:**

```
1. Usuario ingresa email válido + contraseña correcta → Login exitoso
2. Usuario ingresa email válido + contraseña incorrecta → Error "Credenciales inválidas"
3. Usuario ingresa email inválido → Error "Email no válido"
4. Usuario deja campos vacíos → Error "Campos requeridos"
5. Contraseña < 8 caracteres → Error "Contraseña muy corta"
```

---

### REQ-002: Gestión de Sesiones

**Descripción:** Sistema debe crear y mantener sesiones seguras.

**Criterios de Aceptación:**

- Session token generado con JWT (HS256)
- Token válido por 24 horas
- Token se almacena en httpOnly cookie
- Logout invalida token inmediatamente
- Renovación automática si usuario activo

**Casos de Uso:**

```
1. Login exitoso → Token generado + cookie set
2. Request con token válido → Permitido
3. Request con token expirado → Error 401 Unauthorized
4. Request sin token → Redirige a /login
5. Logout → Token invalido en BD
```

---

### REQ-003: UI Accesibilidad

**Descripción:** Formulario debe cumplir WCAG 2A.

**Criterios de Aceptación:**

- Labels asociados a inputs
- Navegación por Tab correcta
- Mensajes de error descriptivos
- Contraste de colores WCAG AA
- Support para screen readers

---

### REQ-004: Performance

**Descripción:** Login debe ser rápido incluso en condiciones adversas.

**Criterios de Aceptación:**

- Latencia < 200ms en red 4G
- Capacidad: 500+ simultáneos
- Cache de resultados (Redis)

---

## FLUJOS DE USUARIO

### Flujo Principal: Login Exitoso

```
1. Usuario navega a /login
2. Ve formulario con campos: Email, Password
3. Ingresa credenciales válidas
4. Hace click en "Sign In"
5. Sistema valida en servidor
6. Token creado, cookie seteada
7. Redirige a /dashboard
8. Usuario ve su perfil
```

### Flujo Alternativo: Password Olvidado

```
1. Usuario en login hace click "Forgot Password"
2. Ingresa email registrado
3. Email de reset enviado
4. Usuario hace click en link (válido 1 hora)
5. Ingresa nuevo password
6. Confirma cambio
7. Redirige a login
```

---

## DATOS DE PRUEBA

```json
{
  "usuarios_validos": [
    { "email": "hola@stayarta.com", "password": "ValidPass123" },
    { "email": "hola@stayarta.com", "password": "AnotherPass456" }
  ],
  "usuarios_bloqueados": [
    { "email": "hola@stayarta.com", "password": "anything", "reason": "3+ intentos fallidos" }
  ],
  "email_invalidos": ["notanemail", "missing@domain", "@nodomain.com", ""],
  "passwords_invalidos": ["short", "nospecial123", "", "pass with spaces"]
}
```

---

## INTEGRACIONES

| Sistema                    | Tipo              | Criticidad |
| -------------------------- | ----------------- | ---------- |
| Base de datos (PostgreSQL) | Query users table | Alta       |
| API Authentication         | POST /auth        | Alta       |
| Email Service (SendGrid)   | Send reset link   | Media      |
| Cache (Redis)              | Store sessions    | Media      |
| Logging Service            | Audit trail       | Baja       |

---

## COMPONENTES TÉCNICOS

```
Frontend:
├─ src/pages/Login.tsx
├─ src/components/LoginForm.tsx
└─ src/services/authService.ts

Backend:
├─ controllers/AuthController
├─ services/AuthService
├─ middleware/authMiddleware
└─ models/User

Database:
├─ users table
├─ sessions table
└─ indices on email, session_id
```

---

## RIESGOS IDENTIFICADOS

| Riesgo                       | Probabilidad | Impacto | Mitigación                              |
| ---------------------------- | ------------ | ------- | --------------------------------------- |
| SQL Injection en query email | Media        | Alta    | Prepared statements, input validation   |
| Brute force attacks          | Alta         | Alta    | Rate limiting, bloqueo después 3 fallos |
| Session hijacking            | Baja         | Alta    | HTTPS, httpOnly cookies, CSRF token     |
| Contraseña débil ingresada   | Media        | Media   | Validación cliente + servidor           |

---

## NOTAS PARA QA

- **Ambiente de prueba:** localhost:3000 (mock) o staging.bcn.test
- **Navegadores:** Chrome, Firefox, Safari, Edge (últimas 2 versiones)
- **Dispositivos:** Desktop, iPhone 14, Pixel 7
- **BD de prueba:** test-db con users_test table
- **Performance:** Probar con network throttling (3G, 4G)

---

## CAMBIOS DOCUMENTADOS

| Versión | Fecha      | Cambio            |
| ------- | ---------- | ----------------- |
| 1.0     | ++34662652300 | Documento inicial |
| 1.1     | (próximo)  | Feedback de QA    |

---

**Sección para el generador HAIDA:**

Una vez completado este documento, ejecuta en PowerShell:

```powershell
powershell -File istqb-hiberus\generators\generate-tests.ps1 -DocPath "istqb-hiberus\docs\especificacion-login.md"
```

El generador automaticamente:

1. Analiza este documento con IA
2. Extrae casos de prueba ISTQB
3. Clasifica por tipo (Unit, API, E2E, etc)
4. Genera CSV en: istqb-hiberus/outputs/test-cases-YYYY-MM-DD.csv
5. Crea matriz de requisitos
