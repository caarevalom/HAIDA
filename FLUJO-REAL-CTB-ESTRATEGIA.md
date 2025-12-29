╔══════════════════════════════════════════════════════════════════════════════╗
║ ║
║ FLUJO REAL CTB: Documentación → Tests → Ejecución ║
║ ║
║ Estrategia rápida: Leer docs → Crear tests NUEVOS → Ejecutar → Reportar ║
║ ║
╚══════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════════
🎯 CAMBIO DE ESTRATEGIA (Más Inteligente)
═══════════════════════════════════════════════════════════════════════════════

ANTES (Mapear 440 viejos casos):
❌ Analizar TestLink deprecados
❌ Mapear a ISTQB (mucho trabajo manual)
❌ Actualizar Excel (tedioso)
✗ Resultado: Reproducir lo viejo

AHORA (Flujo REAL):
✅ Leer documentación CTB (Guía QA, Plan Pruebas, Análisis)
✅ Extraer requisitos principales (REQ-001, REQ-002, etc)
✅ Crear test cases NUEVOS con HAIDA
✅ Validar automáticamente
✅ Ejecutar con herramientas
✅ Priorizar bugs abiertos
✅ Actualizar Excel con resultados
✓ Resultado: Flujo limpio, real, demostrativo

ESTE ES EL APPROACH CORRECTO.

═══════════════════════════════════════════════════════════════════════════════
📋 DOCUMENTOS A ANALIZAR
═══════════════════════════════════════════════════════════════════════════════

1. Plan de Pruebas - CTB.docx (2.25 MB)
   └─ Qué leer: Módulos, fases, tipos de pruebas, timeline
   └─ Extraer: Módulos clave, prioridades

2. Guía de QA – Proyecto CTB VisitBarcelona.pdf (3.8 MB)
   └─ Qué leer: Estrategia QA, casos de prueba, cobertura esperada
   └─ Extraer: Tipos de tests, criterios aceptación

3. CTB VisitBarcelona Tickets - Análisis funcional_v2-castellano.pdf (3.07 MB)
   └─ Qué leer: Requisitos funcionales, especificaciones
   └─ Extraer: REQ-###, módulos, flujos

4. hiberus - Memoria técnica (12.71 MB)
   └─ Qué leer: Arquitectura, stack técnico, decisiones
   └─ Extraer: Tecnologías, endpoints, contexto

═══════════════════════════════════════════════════════════════════════════════
🚀 FASES DE EJECUCIÓN INMEDIATA
═══════════════════════════════════════════════════════════════════════════════

FASE 1: ANÁLISIS Y EXTRACCIÓN (2 horas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Objetivo: Leer docs, extraer requisitos, entender flujos

PASO 1.1: Leer Plan de Pruebas - CTB.docx
├─ Módulos principales
├─ Fases de prueba
├─ Tipos de tests esperados
└─ Output: Módulos_CTB.txt

PASO 1.2: Leer Guía de QA
├─ Estrategia de cobertura
├─ Casos de prueba recomendados
├─ Criterios aceptación
└─ Output: Criterios_Aceptacion.txt

PASO 1.3: Leer Análisis funcional
├─ Requisitos (REQ-001, REQ-002, etc)
├─ Flujos principales
├─ Casos de uso
└─ Output: Requisitos_CTB.txt

PASO 1.4: Revisar Incidencias Abiertas
├─ 9 críticas (CTB-148, CTB-288, CTB-306, etc)
├─ 40+ normales
└─ Output: Prioridad_Bugs.txt

FASE 2: CREAR TEST CASES NUEVOS (4-6 horas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Objetivo: Crear casos de prueba NUEVOS siguiendo HAIDA

MÓDULOS A CUBRIR:

1. 🔐 LOGIN/REGISTRO (REQ-AUTH-001 → REQ-AUTH-010)
   Requisitos:
   ├─ Validación email
   ├─ Validación contraseña
   ├─ Registro usuario nuevo
   ├─ Recuperación contraseña
   ├─ Social login (Google, Facebook)
   └─ Incidencias: CTB-276, CTB-278, CTB-281, CTB-288, CTB-290, CTB-293, CTB-306-307-308, CTB-320, CTB-326

   Tests a crear:
   ├─ TC_AUTH_001: Login válido
   ├─ TC_AUTH_002: Email inválido
   ├─ TC_AUTH_003: Contraseña débil
   ├─ TC_AUTH_004: Recuperación email
   ├─ TC_AUTH_005: Social login Google
   ├─ TC_AUTH_006: Registro duplicado
   ├─ TC_AUTH_007: CAPTCHA validación
   ├─ TC_AUTH_008: Logout
   ├─ TC_AUTH_009: Sesión expirada
   └─ TC_AUTH_010: Dominio email inválido

2. 🏠 HEADER/FOOTER (REQ-NAV-001 → REQ-NAV-015)
   Requisitos:
   ├─ Navegación principal
   ├─ Búsqueda
   ├─ Multiidioma
   ├─ Selector moneda
   └─ Enlaces legales

   Incidencias: CTB-1, CTB-7, CTB-8, CTB-37, CTB-40-41, CTB-64, CTB-77, CTB-124-125-128-131, CTB-159

   Tests a crear:
   ├─ TC_NAV_001: Header presente
   ├─ TC_NAV_002: Búsqueda funciona
   ├─ TC_NAV_003: Cambiar idioma
   ├─ TC_NAV_004: Cambiar moneda
   ├─ TC_NAV_005: Footer con enlaces
   ├─ TC_NAV_006: Newsletter suscripción
   ├─ TC_NAV_007: Logo redirecciona home
   ├─ TC_NAV_008: Menú hamburguesa (mobile)
   ├─ TC_NAV_009: Enlace "Inicia sesión"
   └─ TC_NAV_010: Breadcrumb navigation

3. 📅 CALENDAR/FILTROS (REQ-SEARCH-001 → REQ-SEARCH-008)
   Requisitos:
   ├─ Seleccionar fechas
   ├─ Rangos de fechas
   ├─ Validaciones
   └─ Filtros productos

   Incidencias: CTB-93, CTB-96, CTB-99-100-101, CTB-113, CTB-143, CTB-159, CTB-162

   Tests a crear:
   ├─ TC_SEARCH_001: Calendario se abre
   ├─ TC_SEARCH_002: Seleccionar rango válido
   ├─ TC_SEARCH_003: No seleccionar fecha anterior
   ├─ TC_SEARCH_004: Cancelar cierra sin cambios
   ├─ TC_SEARCH_005: Aplicar actualiza resultados
   ├─ TC_SEARCH_006: Filtrar por precio
   ├─ TC_SEARCH_007: Filtro categoría
   └─ TC_SEARCH_008: Combinar múltiples filtros

4. ❤️ FAVORITOS (REQ-FAV-001 → REQ-FAV-005)
   Requisitos:
   ├─ Agregar favoritos
   ├─ Listar favoritos
   ├─ Compartir lista
   └─ Ver detalle

   Incidencias: CTB-148-149, CTB-162, CTB-312, CTB-315

   Tests a crear:
   ├─ TC_FAV_001: Agregar favorito
   ├─ TC_FAV_002: Corazón se marca
   ├─ TC_FAV_003: Ver lista favoritos
   ├─ TC_FAV_004: Compartir por email
   ├─ TC_FAV_005: Eliminar favorito

5. 👤 PERFIL (REQ-PROFILE-001 → REQ-PROFILE-010)
   Requisitos:
   ├─ Ver perfil
   ├─ Editar nombre/email
   ├─ Cambiar contraseña
   ├─ Editar dirección
   ├─ Cerrar sesión
   └─ Prefs suscripción

   Incidencias: CTB-297, CTB-300, CTB-304, CTB-340, CTB-342, CTB-347, CTB-349-350-352-353, CTB-351, CTB-365-375-376-377, CTB-374

   Tests a crear:
   ├─ TC_PROFILE_001: Ver datos perfil
   ├─ TC_PROFILE_002: Editar nombre
   ├─ TC_PROFILE_003: Cambiar email
   ├─ TC_PROFILE_004: Validar email cambio
   ├─ TC_PROFILE_005: Cambiar contraseña
   ├─ TC_PROFILE_006: Editar dirección
   ├─ TC_PROFILE_007: Guardar cambios
   ├─ TC_PROFILE_008: Cerrar sesión
   ├─ TC_PROFILE_009: Suscribirse newsletter
   └─ TC_PROFILE_010: Logout múltiples navegadores

6. 🛒 CARRITO (REQ-CART-001 → REQ-CART-005)
   Requisitos:
   ├─ Agregar al carrito
   ├─ Ver carrito
   ├─ Modificar cantidad
   ├─ Aplicar descuento
   └─ Checkout

   Incidencias: CTB-387, CTB-388, CTB-390

   Tests a crear:
   ├─ TC_CART_001: Agregar producto
   ├─ TC_CART_002: Mostrar total
   ├─ TC_CART_003: Eliminar producto
   ├─ TC_CART_004: Aplicar código descuento
   └─ TC_CART_005: Proceder checkout

TOTAL NUEVOS TEST CASES: ~55 casos
(No viejos deprecados, sino NUEVOS, limpios, alineados a requisitos)

FASE 3: VALIDAR Y PREPARAR (1 hora)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├─ Crear BRD para cada módulo (FUNCTIONAL-SPEC-TEMPLATE)
├─ Validar con ValidateSpecification.ps1
├─ Generar CSV con ValidateCSVStructure.ps1
├─ Crear matriz requisitos
└─ Output: CSV validado + Matriz requisitos

FASE 4: EJECUTAR PRUEBAS (2-3 horas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├─ Ejecutar con run-qa-local.ps1
├─ Registrar resultados
├─ Capturar screenshots/videos de bugs
├─ Actualizar estado de incidencias
└─ Output: Test execution log + Defect report

FASE 5: REPORTAR EN EXCEL (1 hora)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├─ Descargar Excel SharePoint
├─ Actualizar "Test Plan Actual" con 55 test cases
├─ Crear pestaña "Ejecución" con resultados
├─ Crear pestaña "Defectos" linkear incidencias
├─ Crear pestaña "Cobertura" requisitos vs tests
├─ Crear pestaña "Timeline" histórico
├─ Subir a SharePoint
└─ Output: Excel actualizado y listo

═══════════════════════════════════════════════════════════════════════════════
⏱️ TIMING TOTAL
═══════════════════════════════════════════════════════════════════════════════

Fase 1 (Análisis): 2 horas
Fase 2 (Crear tests): 6 horas
Fase 3 (Validar): 1 hora
Fase 4 (Ejecutar): 3 horas
Fase 5 (Reportar): 1 hora
────────────────────────
TOTAL: 13 horas (1.6 días de trabajo)

Result: Sistema completo, flujo demostrado, Excel actualizado

═══════════════════════════════════════════════════════════════════════════════
🎬 SIGUIENTES PASOS (INMEDIATOS)
═══════════════════════════════════════════════════════════════════════════════

1. Confirma que quieres proceder con este flujo
2. Doy acceso de lectura a documentos (extrae requisitos)
3. Creo test cases NUEVOS
4. Valido automáticamente
5. Ejecuto y reporto en Excel

¿Comenzamos?

═════════════════════════════════════════════════════════════════════════════════
DOCUMENTO: FLUJO-REAL-CTB-ESTRATEGIA.md
TIPO: Plan de acción ejecutivo
CLIENTE: CTB Real
STATUS: Esperando confirmación para comenzar Fase 1
═════════════════════════════════════════════════════════════════════════════════
