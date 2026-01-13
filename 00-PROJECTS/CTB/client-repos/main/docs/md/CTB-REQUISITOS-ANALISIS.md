# CTB (VisitBarcelona) - Análisis de Requisitos y Test Cases

## 📊 Resumen Ejecutivo
- **Portal:** VisitBarcelona Tickets (Turismo/E-commerce)
- **Test Cases Existentes:** 440 (Desktop 220, Mobile 220)
- **Incidencias Abiertas:** 50+ (9 críticas, 40+ normales, 1 baja)
- **Módulos Principales:** 9
- **Plataformas:** Desktop (Chrome, Firefox, Safari), Mobile (iOS, Android)
- **Estado:** Development activo con cambios de diseño

---

## 🏗️ MÓDULOS Y REQUISITOS

### 1. 🔐 AUTENTICACIÓN (REQ-AUTH-001 → REQ-AUTH-015)
**Requisitos Funcionales:**
- REQ-AUTH-001: Login con email/password
- REQ-AUTH-002: Validación email formato
- REQ-AUTH-003: Validación password (fuerza, longitud)
- REQ-AUTH-004: Recuperación contraseña vía email
- REQ-AUTH-005: Registro usuario nuevo
- REQ-AUTH-006: Validación duplicado (email ya registrado)
- REQ-AUTH-007: Social login (Google, Facebook)
- REQ-AUTH-008: CAPTCHA en login/registro
- REQ-AUTH-009: Logout
- REQ-AUTH-010: Sesión expirada (timeout)
- REQ-AUTH-011: Remember me (mantener sesión)
- REQ-AUTH-012: Validación email doble-opt-in
- REQ-AUTH-013: MFA (Multi-factor authentication)
- REQ-AUTH-014: Bloqueo cuenta por intentos fallidos
- REQ-AUTH-015: Cambio contraseña usuario logueado

**Incidencias Relacionadas (9 críticas):**
- CTB-276, CTB-278, CTB-281, CTB-288, CTB-290, CTB-293, CTB-306, CTB-307, CTB-308, CTB-320, CTB-326

**Casos de Prueba (est. 12-15 casos):**
- TC_AUTH_001 → TC_AUTH_015

---

### 2. 🏠 NAVEGACIÓN/HEADER (REQ-NAV-001 → REQ-NAV-020)
**Requisitos Funcionales:**
- REQ-NAV-001: Menú principal visible
- REQ-NAV-002: Búsqueda de productos funcional
- REQ-NAV-003: Autocompletado búsqueda
- REQ-NAV-004: Filtros navegación
- REQ-NAV-005: Breadcrumb navigation
- REQ-NAV-006: Logo redirige a home
- REQ-NAV-007: Multiidioma (selector idioma)
- REQ-NAV-008: Selector moneda
- REQ-NAV-009: Carrito (contador items)
- REQ-NAV-010: Perfil usuario (dropdown)
- REQ-NAV-011: Notificaciones
- REQ-NAV-012: Menú hamburguesa (mobile)
- REQ-NAV-013: Enlaces legales (footer)
- REQ-NAV-014: Newsletter suscripción
- REQ-NAV-015: Redes sociales links
- REQ-NAV-016: Sticky header
- REQ-NAV-017: Responsive header
- REQ-NAV-018: Idioma persistente (localStorage)
- REQ-NAV-019: Búsqueda reciente
- REQ-NAV-020: Quick links/Favoritos

**Incidencias Relacionadas:**
- CTB-1, CTB-7, CTB-8, CTB-37, CTB-40, CTB-41, CTB-64, CTB-77, CTB-124, CTB-125, CTB-128, CTB-131, CTB-159

**Casos de Prueba (est. 18-20 casos):**
- TC_NAV_001 → TC_NAV_020

---

### 3. 🏠 HOME PAGE (REQ-HOME-001 → REQ-HOME-015)
**Requisitos Funcionales:**
- REQ-HOME-001: Banner principal
- REQ-HOME-002: Productos destacados
- REQ-HOME-003: Carrusel de imagenes
- REQ-HOME-004: Categorías principales
- REQ-HOME-005: Ofertas/promociones
- REQ-HOME-006: Testimonios/reviews
- REQ-HOME-007: Newsletter CTA
- REQ-HOME-008: Call-to-action principales
- REQ-HOME-009: Performance (carga < 3s)
- REQ-HOME-010: SEO meta tags
- REQ-HOME-011: Accesibilidad WCAG
- REQ-HOME-012: Responsiveness (mobile)
- REQ-HOME-013: Analytics tracking
- REQ-HOME-014: Producto recomendado basado en historial
- REQ-HOME-015: Seasonal content

**Casos de Prueba (est. 12-15 casos):**
- TC_HOME_001 → TC_HOME_015

---

### 4. 📅 BÚSQUEDA Y FILTROS (REQ-SEARCH-001 → REQ-SEARCH-020)
**Requisitos Funcionales:**
- REQ-SEARCH-001: Buscar por término
- REQ-SEARCH-002: Calendario date picker
- REQ-SEARCH-003: Seleccionar rango fechas
- REQ-SEARCH-004: Validar fecha anterior no permitida
- REQ-SEARCH-005: Filtro por precio (min-max)
- REQ-SEARCH-006: Filtro por categoría
- REQ-SEARCH-007: Filtro por rating
- REQ-SEARCH-008: Filtro múltiple
- REQ-SEARCH-009: Guardar búsqueda
- REQ-SEARCH-010: Búsqueda historial
- REQ-SEARCH-011: Sort por (precio, rating, fecha, populares)
- REQ-SEARCH-012: Pagination resultados
- REQ-SEARCH-013: No resultados (empty state)
- REQ-SEARCH-014: Buscar por ubicación (geolocation)
- REQ-SEARCH-015: Advanced search
- REQ-SEARCH-016: Buscar por código producto
- REQ-SEARCH-017: Clear filters
- REQ-SEARCH-018: Save search
- REQ-SEARCH-019: Search analytics
- REQ-SEARCH-020: Suggestions/autocomplete

**Incidencias Relacionadas:**
- CTB-93, CTB-96, CTB-99, CTB-100, CTB-101, CTB-113, CTB-143, CTB-159, CTB-162

**Casos de Prueba (est. 18-20 casos):**
- TC_SEARCH_001 → TC_SEARCH_020

---

### 5. ❤️ FAVORITOS (REQ-FAV-001 → REQ-FAV-010)
**Requisitos Funcionales:**
- REQ-FAV-001: Agregar favorito (click corazón)
- REQ-FAV-002: Marcar/desmarcar corazón visual
- REQ-FAV-003: Ver lista favoritos
- REQ-FAV-004: Compartir favoritos por email
- REQ-FAV-005: Compartir por redes sociales
- REQ-FAV-006: Eliminar favorito
- REQ-FAV-007: Sincronizar favoritos (multi-device)
- REQ-FAV-008: Persistencia favoritos (login required)
- REQ-FAV-009: Contador favoritos en header
- REQ-FAV-010: Notificación cuando favorito baja precio

**Incidencias Relacionadas:**
- CTB-148, CTB-149, CTB-162, CTB-312, CTB-315

**Casos de Prueba (est. 8-10 casos):**
- TC_FAV_001 → TC_FAV_010

---

### 6. 👤 PERFIL USUARIO (REQ-PROFILE-001 → REQ-PROFILE-020)
**Requisitos Funcionales:**
- REQ-PROFILE-001: Ver datos perfil
- REQ-PROFILE-002: Editar nombre
- REQ-PROFILE-003: Cambiar email
- REQ-PROFILE-004: Validación email (confirm token)
- REQ-PROFILE-005: Cambiar contraseña
- REQ-PROFILE-006: Validar contraseña anterior
- REQ-PROFILE-007: Editar dirección
- REQ-PROFILE-008: Agregar múltiples direcciones
- REQ-PROFILE-009: Dirección por defecto
- REQ-PROFILE-010: Editar teléfono
- REQ-PROFILE-011: Foto perfil (upload/crop)
- REQ-PROFILE-012: Historial pedidos
- REQ-PROFILE-013: Preferencias notificaciones
- REQ-PROFILE-014: Suscribir/desuscribir newsletter
- REQ-PROFILE-015: Datos sesiones activas
- REQ-PROFILE-016: Cerrar todas sesiones
- REQ-PROFILE-017: Eliminar cuenta (GDPR)
- REQ-PROFILE-018: Descargar datos (GDPR export)
- REQ-PROFILE-019: Editar preferences privacidad
- REQ-PROFILE-020: Idioma preferido

**Incidencias Relacionadas:**
- CTB-297, CTB-300, CTB-304, CTB-340, CTB-342, CTB-347, CTB-349, CTB-350, CTB-351, CTB-352, CTB-353, CTB-365, CTB-374, CTB-375, CTB-376, CTB-377

**Casos de Prueba (est. 18-20 casos):**
- TC_PROFILE_001 → TC_PROFILE_020

---

### 7. 🛒 CARRITO (REQ-CART-001 → REQ-CART-015)
**Requisitos Funcionales:**
- REQ-CART-001: Agregar al carrito
- REQ-CART-002: Mostrar total carrito
- REQ-CART-003: Modificar cantidad
- REQ-CART-004: Eliminar producto
- REQ-CART-005: Ver resumen carrito
- REQ-CART-006: Persistencia carrito (logout/login)
- REQ-CART-007: Stock validation
- REQ-CART-008: Precio actualizado
- REQ-CART-009: Aplicar código descuento
- REQ-CART-010: Validar código descuento válido
- REQ-CART-011: Mostrar descuento aplicado
- REQ-CART-012: Eliminar descuento
- REQ-CART-013: Impuestos y envío
- REQ-CART-014: Proceder checkout
- REQ-CART-015: Carrito persistente multi-device

**Incidencias Relacionadas:**
- CTB-387, CTB-388, CTB-390

**Casos de Prueba (est. 12-15 casos):**
- TC_CART_001 → TC_CART_015

---

### 8. 📦 CHECKOUT (REQ-CHECK-001 → REQ-CHECK-015)
**Requisitos Funcionales:**
- REQ-CHECK-001: Ingresar dirección envío
- REQ-CHECK-002: Validación dirección
- REQ-CHECK-003: Método envío (opciones, precios)
- REQ-CHECK-004: Forma pago (tarjeta, PayPal, etc)
- REQ-CHECK-005: Datos tarjeta (encriptado)
- REQ-CHECK-006: Validación tarjeta (Luhn)
- REQ-CHECK-007: 3D Secure / SCA
- REQ-CHECK-008: Revisar orden antes de confirmar
- REQ-CHECK-009: Crear orden
- REQ-CHECK-010: Confirmar pago
- REQ-CHECK-011: Email confirmación
- REQ-CHECK-012: Generar invoice
- REQ-CHECK-013: Error handling (pago rechazado)
- REQ-CHECK-014: Timeout session
- REQ-CHECK-015: Order tracking

**Casos de Prueba (est. 14-16 casos):**
- TC_CHECK_001 → TC_CHECK_015

---

### 9. 📅 CALENDARIO/DISPONIBILIDAD (REQ-CAL-001 → REQ-CAL-012)
**Requisitos Funcionales:**
- REQ-CAL-001: Mostrar calendario
- REQ-CAL-002: Deshabilitar fechas no disponibles
- REQ-CAL-003: Seleccionar fecha inicio
- REQ-CAL-004: Seleccionar fecha fin
- REQ-CAL-005: Validar rango mínimo/máximo días
- REQ-CAL-006: Mostrar precio por fecha
- REQ-CAL-007: Temporal pricing
- REQ-CAL-008: Vacaciones/no disponible
- REQ-CAL-009: Cancelar y volver
- REQ-CAL-010: Aplicar selección
- REQ-CAL-011: Mostrar disponibilidad real-time
- REQ-CAL-012: Integración con búsqueda

**Incidencias Relacionadas:**
- (Incluidas en SEARCH)

**Casos de Prueba (est. 10-12 casos):**
- TC_CAL_001 → TC_CAL_012

---

## 🐛 INCIDENCIAS CRÍTICAS (9)

| Bug ID | Módulo | Descripción | Severity | Status |
|--------|--------|-------------|----------|--------|
| CTB-276 | AUTH | Login no valida email formato | CRÍTICA | ABIERTO |
| CTB-278 | AUTH | Password reset email no llega | CRÍTICA | ABIERTO |
| CTB-281 | AUTH | Logout no limpia sesión | CRÍTICA | ABIERTO |
| CTB-288 | AUTH | Social login Google falla | CRÍTICA | ABIERTO |
| CTB-290 | AUTH | CAPTCHA bloquea usuarios válidos | CRÍTICA | ABIERTO |
| CTB-293 | AUTH | Duplicado email registration | CRÍTICA | ABIERTO |
| CTB-306 | AUTH | Session timeout no funciona | CRÍTICA | ABIERTO |
| CTB-307 | AUTH | Cookie HTTPS solo en prod | CRÍTICA | ABIERTO |
| CTB-308 | AUTH | Account lockout infinito | CRÍTICA | ABIERTO |

---

## 📊 DISTRIBUCIÓN TEST CASES

| Módulo | Desktop | Mobile | Total Est. |
|--------|---------|--------|-----------|
| AUTH | 10 | 7 | 15 |
| NAV | 12 | 8 | 20 |
| HOME | 8 | 7 | 15 |
| SEARCH | 12 | 8 | 20 |
| FAV | 5 | 5 | 10 |
| PROFILE | 12 | 8 | 20 |
| CART | 8 | 7 | 15 |
| CHECK | 8 | 7 | 15 |
| CAL | 7 | 5 | 12 |
| **TOTAL** | **82** | **62** | **142** |

*Nota: 440 casos incluyen variantes (desktop, mobile, navegadores, idiomas, idiomas, casos edge)*

---

## 📈 MATRIZ TRAZABILIDAD (EJEMPLO)

```
REQ-AUTH-001 (Login email/password)
  ├─ TC_AUTH_001: Login válido - PASS/FAIL
  ├─ TC_AUTH_002: Email inválido - PASS/FAIL
  ├─ TC_AUTH_003: Password vacío - PASS/FAIL
  └─ TC_AUTH_004: Email no registrado - PASS/FAIL

REQ-AUTH-004 (Password recovery)
  ├─ TC_AUTH_005: Reset válido - [BUG: CTB-278]
  ├─ TC_AUTH_006: Email no existe - PASS/FAIL
  └─ TC_AUTH_007: Token expirado - PASS/FAIL
```

---

## 🎯 SIGUIENTE PASO

1. **FASE A COMPLETA:** ✅ Análisis requisitos completado
2. **FASE B:** Crear validadores automáticos
3. **FASE C:** Framework Playwright captura
4. **FASE D:** Ejecutar 440+ test cases
5. **FASE E:** Documentar Excel
6. **FASE F:** Reportes finales
