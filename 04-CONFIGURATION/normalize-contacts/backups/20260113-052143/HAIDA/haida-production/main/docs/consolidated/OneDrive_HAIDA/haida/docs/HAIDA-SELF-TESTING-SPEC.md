# Especificación Funcional - Auto-Testing de HAIDA

**Sistema bajo prueba**: HAIDA (Hiberus AI-Driven Automation)
**Versión**: 2.0.0
**Tipo de documento**: Especificación Funcional ISTQB
**Auditor**: HAIDA (auto-evaluación)
**Fecha**: +34662652300

---

## 1. INTRODUCCIÓN

### 1.1 Propósito
HAIDA se auto-evalúa aplicando sus propios principios de testing ISTQB para validar que cumple con los estándares que ella misma propone a otros sistemas.

### 1.2 Alcance
- **Backend API**: Autenticación, usuarios, proyectos, casos de prueba
- **Frontend**: Interfaz de usuario React/Vite
- **Base de datos**: Supabase PostgreSQL
- **Integración**: Sincronización auth.users → public.users

### 1.3 Referencias
- ISTQB Foundation Level Syllabus
- HAIDA Testing Framework Documentation
- Pirámide de Pruebas de Mike Cohn

---

## 2. CASOS DE USO PRINCIPALES

### CU-01: Registro de Usuario
**Actor**: Usuario nuevo
**Precondición**: Email no registrado previamente
**Flujo Principal**:
1. Usuario accede a `/auth/register`
2. Sistema valida email y password
3. Supabase Auth crea usuario en auth.users
4. Trigger crea usuario en public.users
5. Sistema genera JWT token
6. Usuario recibe access token

**Postcondición**: Usuario creado en ambas tablas, sesión iniciada

### CU-02: Login de Usuario
**Actor**: Usuario registrado
**Precondición**: Usuario existe en sistema
**Flujo Principal**:
1. Usuario envía credenciales a `/auth/login`
2. Sistema valida contra Supabase Auth
3. Sistema obtiene perfil de public.users
4. Sistema actualiza last_login_at
5. Sistema genera JWT token
6. Usuario recibe access token

**Postcondición**: Sesión iniciada, last_login actualizado

### CU-03: Acceso a Información de Usuario
**Actor**: Usuario autenticado
**Precondición**: Token JWT válido
**Flujo Principal**:
1. Usuario envía request a `/auth/me` con token
2. Sistema valida token JWT
3. Sistema obtiene información de public.users
4. Sistema retorna perfil de usuario

**Postcondición**: Información de usuario entregada

### CU-04: Microsoft OAuth Login
**Actor**: Usuario con cuenta Microsoft
**Precondición**: Azure AD configurado
**Flujo Principal**:
1. Usuario solicita `/entra/login`
2. Sistema genera auth_url de Microsoft
3. Usuario se autentica en Microsoft
4. Microsoft redirige con código
5. Sistema intercambia código por tokens
6. Sistema crea/actualiza usuario
7. Sistema genera JWT token

**Postcondición**: Usuario autenticado vía Microsoft

### CU-05: Sincronización de Usuarios
**Actor**: Sistema (trigger automático)
**Precondición**: Usuario creado en auth.users
**Flujo Principal**:
1. Trigger on_auth_user_created se dispara
2. Sistema extrae metadata (full_name, role)
3. Sistema inserta en public.users
4. Si existe, actualiza datos

**Postcondición**: Usuario sincronizado en public.users

---

## 3. REQUISITOS FUNCIONALES

### RF-01: Validación de Email
**Prioridad**: Alta
**Descripción**: Sistema debe validar formato de email según RFC 5322
**Criterio de Aceptación**: Rechazar emails inválidos con status 422

### RF-02: Validación de Password
**Prioridad**: Alta
**Descripción**: Password debe cumplir políticas de seguridad
**Criterio de Aceptación**: Rechazar passwords débiles con status 400

### RF-03: Tokens JWT
**Prioridad**: Alta
**Descripción**: Tokens deben contener sub, email, role, exp
**Criterio de Aceptación**: Token válido decodificable con JWT_SECRET

### RF-04: Protección de Endpoints
**Prioridad**: Alta
**Descripción**: Endpoints protegidos requieren Authorization header
**Criterio de Aceptación**: Retornar 401 sin token válido

### RF-05: Sincronización Automática
**Prioridad**: Alta
**Descripción**: Trigger debe copiar usuarios de auth.users a public.users
**Criterio de Aceptación**: Usuario en ambas tablas tras registro

### RF-06: Actualización de Last Login
**Prioridad**: Media
**Descripción**: Cada login exitoso actualiza timestamp
**Criterio de Aceptación**: Campo last_login_at actualizado

### RF-07: Manejo de Usuarios Duplicados
**Prioridad**: Media
**Descripción**: Registro con email existente debe fallar apropiadamente
**Criterio de Aceptación**: Status 400 con mensaje claro

### RF-08: CORS Configurado
**Prioridad**: Media
**Descripción**: API debe permitir requests desde frontend
**Criterio de Aceptación**: Headers CORS correctos en response

---

## 4. REQUISITOS NO FUNCIONALES

### RNF-01: Performance - Tiempo de Respuesta
**Descripción**: API debe responder en < 2 segundos
**Métrica**: 95% de requests < 2000ms

### RNF-02: Performance - Concurrencia
**Descripción**: Soportar múltiples usuarios simultáneos
**Métrica**: 50 usuarios concurrentes sin degradación

### RNF-03: Seguridad - Encriptación
**Descripción**: Passwords nunca en texto plano
**Métrica**: Passwords hasheados en auth.users

### RNF-04: Disponibilidad
**Descripción**: Sistema disponible 99.9% del tiempo
**Métrica**: Uptime > 99.9% mensual

### RNF-05: Escalabilidad
**Descripción**: Arquitectura serverless escala automáticamente
**Métrica**: Vercel auto-scaling funcional

---

## 5. ESCENARIOS DE PRUEBA

### Escenario 1: Happy Path - Registro y Login
```
DADO que un nuevo usuario accede al sistema
CUANDO registra cuenta con email válido y password seguro
ENTONCES el usuario es creado en auth.users
Y el usuario es creado en public.users via trigger
Y el usuario recibe un JWT token válido
Y el usuario puede hacer login con las mismas credenciales
```

### Escenario 2: Validaciones - Email Inválido
```
DADO que un usuario intenta registrarse
CUANDO envía un email con formato inválido
ENTONCES el sistema rechaza con status 422
Y el mensaje indica error de validación
```

### Escenario 3: Validaciones - Password Débil
```
DADO que un usuario intenta registrarse
CUANDO envía un password que no cumple políticas
ENTONCES el sistema rechaza con status 400
Y el mensaje indica password débil
```

### Escenario 4: Seguridad - Acceso Sin Token
```
DADO que un usuario no autenticado
CUANDO intenta acceder a /auth/me sin token
ENTONCES el sistema rechaza con status 401
Y el mensaje indica autorización requerida
```

### Escenario 5: Seguridad - Token Expirado
```
DADO que un usuario tiene token expirado
CUANDO intenta acceder a endpoint protegido
ENTONCES el sistema rechaza con status 401
Y el mensaje indica token expirado
```

### Escenario 6: Integración - Sincronización DB
```
DADO que Supabase Auth crea un usuario
CUANDO el trigger on_auth_user_created se ejecuta
ENTONCES el usuario aparece en public.users
Y los datos coinciden (email, full_name, role)
```

### Escenario 7: OAuth - Microsoft Login
```
DADO que Azure AD está configurado
CUANDO usuario solicita /entra/login
ENTONCES recibe auth_url de Microsoft
Y la URL contiene client_id correcto
Y la URL contiene redirect_uri correcto
```

### Escenario 8: Performance - Múltiples Registros
```
DADO que 10 usuarios se registran simultáneamente
CUANDO todos envían requests al mismo tiempo
ENTONCES todos reciben respuesta en < 2 segundos
Y no hay race conditions en base de datos
```

---

## 6. DATOS DE PRUEBA

### Usuario Válido
```json
{
  "email": "hola@stayarta.com",
  "password": "SecureTestPass2025!",
  "full_name": "HAIDA Self Test User",
  "role": "qa_engineer"
}
```

### Email Inválido
```json
{
  "email": "invalid-email-format",
  "password": "SecurePass123!"
}
```

### Password Débil
```json
{
  "email": "hola@stayarta.com",
  "password": "123"
}
```

### Credenciales Incorrectas
```json
{
  "email": "hola@stayarta.com",
  "password": "WrongPassword123!"
}
```

---

## 7. MATRIZ DE TRAZABILIDAD

| Requisito | Caso de Uso | Caso de Prueba | Prioridad |
|-----------|-------------|----------------|-----------|
| RF-01 | CU-01 | TC-VAL-001 | Alta |
| RF-02 | CU-01 | TC-VAL-002 | Alta |
| RF-03 | CU-02 | TC-SEC-001 | Alta |
| RF-04 | CU-03 | TC-SEC-002 | Alta |
| RF-05 | CU-05 | TC-INT-001 | Alta |
| RF-06 | CU-02 | TC-FUN-001 | Media |
| RF-07 | CU-01 | TC-VAL-003 | Media |
| RF-08 | Todos | TC-INT-002 | Media |
| RNF-01 | Todos | TC-PERF-001 | Alta |
| RNF-03 | CU-01, CU-02 | TC-SEC-003 | Alta |

---

## 8. CRITERIOS DE ACEPTACIÓN GLOBAL

### Criterio 1: Cobertura de Pruebas
- ✅ 100% de Casos de Uso cubiertos
- ✅ 100% de Requisitos Funcionales validados
- ✅ 90%+ de Requisitos No Funcionales validados

### Criterio 2: Tasa de Éxito
- ✅ 95%+ de tests pasando
- ✅ 0 errores críticos
- ✅ < 5 errores menores aceptables

### Criterio 3: Performance
- ✅ Tiempo de ejecución suite < 2 minutos
- ✅ Tiempo de respuesta API < 2 segundos
- ✅ Sin memory leaks

### Criterio 4: Compatibilidad
- ✅ Tests pasando en 5 navegadores (Chrome, Firefox, Safari, iPhone, Android)
- ✅ Tests pasando en entornos Local y Production

---

## 9. NIVELES DE PRUEBA (PIRÁMIDE DE COHN)

### Nivel 1: Unit Tests (Base de la pirámide)
- Funciones individuales (create_jwt_token, validate_email)
- Cobertura: 70%+ del código

### Nivel 2: Integration Tests
- Interacción Backend ↔ Database
- Trigger sincronización
- OAuth flow completo

### Nivel 3: API Tests
- Endpoints REST
- Validaciones de entrada
- Códigos de status HTTP

### Nivel 4: E2E Tests (Cima de la pirámide)
- Flujos completos de usuario
- Registro → Login → Acceso a recursos
- Cross-browser testing

---

## 10. ENTREGABLES

1. ✅ **Especificación Funcional** (este documento)
2. ⏳ **Casos de Prueba ISTQB** (CSV generado por HAIDA)
3. ⏳ **Suite de Tests Playwright** (implementación técnica)
4. ⏳ **Reporte de Ejecución** (Allure Report)
5. ⏳ **Registro de Defectos** (si se encuentran)
6. ⏳ **Plan de Corrección** (si es necesario)

---

**Aprobado por**: HAIDA Self-Audit System
**Fecha de aprobación**: +34662652300
**Próxima revisión**: Cada release mayor
