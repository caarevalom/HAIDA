# Reporte inicial CTB - Thisisbarcelona

## Contexto del proyecto
- HAIDA: framework QA automatizado con generador de casos ISTQB, cobertura web/API/perf/a11y/seguridad.
- CTB VisitBarcelona Tickets: portal e-commerce turismo con 440 casos existentes (220 DSK/220 MOB) y backlog de tickets (incidencias + evolutivos + tareas).
- Módulos clave: header/nav, home, auth/registro, perfil, favoritos, carrito, calendario, búsqueda/filters, checkout.

## Resumen de tickets (Redmine export: issues*.csv)
- Total tickets (deduplicados): 102
- Por tipo: Incidencias=65, Evolutivos=21, Tarea=16
- Por estado: Cerrada=30, Nueva=30, En curso=16, Resuelta=14, Bloqueada=6, Reabierta=4, Pendiente=1, Desestimada=1
- Por prioridad: Normal=87, Alta=14, Baja=1
- Por plataforma: DSK=50, MOB=30, UNK=22
- Por modulo: Login/Registro=37, Perfil=11, Calendario=11, Header/Nav=11, Otros=8, Carrito=7, Home=6, Favoritos=4, Footer=3, PDP=2, Listado/PLP=1, Checkout/Pago=1
- Referencias a evidencia en descripciones: 63 (medios/links detectados: 1)

### Top tickets abiertos/bloqueados (prioridad alta primero)
- 462257 | Incidencias | Alta | En curso | DSK | Login/Registro | CTB-148/149 [DSK] Secciones Destacadas ? Botón de favoritos no se activa al añadir producto
- 466139 | Incidencias | Alta | Bloqueada | MOB | Otros | CTB-320 [MOB] Botones sociales sin funcionalidad
- 461099 | Evolutivos | Alta | En curso | UNK | Login/Registro | Registro de Usuario
- 465839 | Incidencias | Alta | Bloqueada | MOB | Otros | CTB-276 [MOB] Botones sociales sin funcionalidad.
- 461100 | Evolutivos | Alta | En curso | UNK | Login/Registro | Login y recuperación de contraseña
- 464924 | Incidencias | Alta | Bloqueada | DSK | Login/Registro | CTB-288 [DSK] Registro - Proveedor externo - Redirección incorrecta
- 458236 | Evolutivos | Alta | En curso | UNK | Login/Registro | HOME
- 460997 | Tarea | Normal | Nueva | DSK | Footer | B2C ? [DSK] Footer ? Informe
- 461098 | Evolutivos | Normal | Nueva | UNK | Favoritos | Detalle de Reserva
- 461096 | Evolutivos | Normal | Nueva | UNK | Calendario | Sistema de Valoraciones
- 461095 | Evolutivos | Normal | Nueva | UNK | Perfil | Proceso de compra - Confirmación
- 461094 | Evolutivos | Normal | Nueva | UNK | Checkout/Pago | Proceso de compra - Pago
- 461093 | Evolutivos | Normal | Nueva | UNK | Perfil | Proceso de compra - Datos personales
- 458326 | Evolutivos | Normal | Nueva | UNK | Carrito | Ficha de Producto
- 457528 | Evolutivos | Normal | En curso | UNK | Login/Registro | Resultados de búsqueda
- 458234 | Evolutivos | Normal | En curso | UNK | Header/Nav | Menú "Categorías"
- 462330 | Tarea | Normal | Nueva | DSK | Home | B2C ? [DSK] Home ? Informe
- 462329 | Tarea | Normal | Nueva | DSK | Header/Nav | B2C ? [DSK] Header ? Informe
- 461330 | Incidencias | Normal | En curso | DSK | Header/Nav | CTB-7 [DSK] ? Enlace activo en el header no se resalta al hacer clic
- 459577 | Evolutivos | Normal | En curso | UNK | Header/Nav | Footer

## Propuesta de suites iniciales (HAIDA)
- Smoke Web: home, navegación principal, búsqueda, PLP, PDP, carrito, checkout (si aplica).
- Auth: login, registro, recuperación, captcha, errores de validación.
- Carrito/Checkout: edición de cantidad, eliminación, recalculo, cupones, errores de stock.
- Perfil/Account: edición datos, cambio password, validaciones, sesiones.
- Favoritos/Wishlist: alta/baja, persistencia, sincronización.
- Accesibilidad: home + flujos críticos, WCAG AA.
- Performance: home, PLP, PDP con budget (LCP/CLS/TBT).

## Backlog de mejoras/optimizaciones (inicial)
- Normalizar configuración BASE_URL en scripts y guías (corregido).
- Crear validadores CSV/Spec y matriz de trazabilidad para 440 casos.
- Automatizar captura de evidencias (screenshots, HAR, video) por TC.
- Deduplicación automática de incidencias por root cause.
- Integración de export Redmine -> CSV enriched para Excel SharePoint.

## Observaciones
- PDFs/PPTX locales aún no procesados por falta de extractor.
- Este reporte consolida 6 exportaciones issues*.csv (tickets completos).
