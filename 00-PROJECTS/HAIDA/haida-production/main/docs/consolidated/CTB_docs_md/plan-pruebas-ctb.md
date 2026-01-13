# Plan de pruebas CTB (B2C, Afiliats, Oficinas)

## Objetivo
Definir un plan de pruebas completo basado en documentacion CTB + material Figma local, cubriendo Web Desktop y Mobile (iOS/Android), con enfoque en modulos criticos, UX/UI y riesgos detectados.

## Fuentes analizadas
- Figma local (export .fig) B2C: `/Users/carlosa/Hiberus/CTB/docs/figma/figma_exports/b2c/`
- Figma local (export .fig) Afiliats: `/Users/carlosa/Hiberus/CTB/docs/figma/figma_exports/afiliats/`
- Figma local (export .fig) Oficinas: `/Users/carlosa/Hiberus/CTB/docs/figma/figma_exports/oficinas/`
- Requisitos CTB: `/Users/carlosa/Hiberus/CTB/docs/md/CTB-REQUISITOS-ANALISIS.md`
- Tickets Redmine (issues*.csv) consolidado: `/Users/carlosa/Hiberus/CTB/docs/csv/issues-resumen.csv`
 - Credenciales y URLs activas: `.env` en `/Users/carlosa/Hiberus/CTB/.env`

## Alcance por portal
### B2C (Portal Tickets)
- Home, Header/Nav, Search/Filters, PLP, PDP, Calendar/Disponibilidad
- Auth (login/registro/password), Profile, Favorites, Cart, Checkout
- Newsletter, Footer, Legal

### Afiliats (Portal afiliados)
- Login/registro (URL online confirmada)
- Dashboard y gestion de productos/ofertas
- Calendario/disponibilidad
- Reportes y configuraciones

### Oficinas (Portal oficinas)
- Mapa / localizacion de oficinas (URL online confirmada)
- Busqueda y filtro de oficinas
- Ficha de oficina

## Matriz de dispositivos
- Desktop Web: Chrome, Firefox, Safari (si aplica)
- Mobile iOS: Safari (iPhone 13/14, 390x844)
- Mobile Android: Chrome (Pixel 7, 412x915)

## Estrategia de ejecucion
### 1) Smoke diario (todas las plataformas)
- Home, Nav, Search basico, PDP, Cart, Checkout inicio
- Auth basico (login + logout)
- Accesibilidad basica en Home

### 2) Regression semanal (Desktop + 1 mobile)
- Todos los modulos criticos (Auth, Cart, Checkout, Calendar)
- Validaciones de forms y errores
- Compatibilidad responsive

### 3) Full suite mensual (Desktop + iOS + Android)
- Cobertura completa de requisitos (REQ-xxx)
- Performance y Security
- Visual checks (hero, cards, mapa, formularios)

## Cobertura y ownership
- Desktop: ejecucion principal (QA desktop)
- Mobile iOS/Android: ejecucion principal (QA mobile)

## Cobertura funcional por modulo (B2C)
- AUTH: login, registro, recuperacion, captcha, session, MFA
- NAV: buscador, idioma, moneda, header sticky, footer legal
- HOME: hero, CTA, destacados, carrusel, categorias
- SEARCH: filtros, calendario, orden, empty states
- CALENDAR: disponibilidad, rangos, pricing
- FAV: wishlist, contador, compartir
- PROFILE: datos personales, password, direcciones, GDPR
- CART: add/remove, qty, cupones, totales
- CHECKOUT: shipping, payment, 3DS, confirmacion, email

## Cobertura funcional por portal
### Afiliats
- Acceso y roles
- Gestion de contenido (alta/edicion/baja)
- Validaciones en formularios
- Export/Reportes

### Oficinas
- Visualizacion mapa
- Filtro por zona/servicio
- Detalle oficina y enlaces

## Pruebas no funcionales
- Performance: home, PLP/PDP, checkout (LCP, CLS, TTI)
- Accesibilidad: WCAG AA en Home, formularios, modales
- Security: login, reset, payment (OWASP basico)
- Compatibilidad: navegadores y viewports

## Evidencias
- Capturas por paso (desktop + mobile)
- Video por flujo critico (auth, cart, checkout)
- Logs de red (HAR) para errores

## Resultado esperado
- Plan de ejecucion por lotes con coverage completo
- Mapeo de tickets a modulos y requisitos
- Suite estable para 3 plataformas
