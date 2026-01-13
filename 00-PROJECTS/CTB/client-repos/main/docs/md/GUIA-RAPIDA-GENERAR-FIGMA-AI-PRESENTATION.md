# 🚀 GUÍA RÁPIDA: EJECUTAR PROMPT FIGMA AI PARA HAIDA v2.0

**Documento:** Instrucciones paso a paso para generar presentación  
**Fecha:** 16 Diciembre 2025  
**Tiempo estimado:** 30-60 minutos (generación + ajustes)  

---

## OPCIÓN 1: Figma AI Plugin (RECOMENDADO)

### Paso 1: Preparación en Figma

```bash
1. Abre Figma.com en navegador
2. Crea nuevo proyecto: "HAIDA v2.0 Presentation"
3. Crea nuevo file: "design-haida-presentation"
4. En el toolbar: Plugins → Browse all plugins
5. Busca: "AI" o "Copilot" o "Design Assistant"
6. Instala el plugin de IA que encuentres (Figma AI, Genius, etc)
```

### Paso 2: Preparar el Prompt

```bash
1. Abre el archivo ANALISIS-COMPLETO-HAIDA-Y-PROMPT-FIGMA-AI.md
2. Copia la sección "2.3 PROMPT DETALLADO PARA FIGMA AI" (completo)
3. O usa "2.4 PROMPT CORTO" si el anterior es muy largo
4. Copia todo el texto
```

### Paso 3: Ejecutar el Prompt

```bash
1. En Figma, abre el plugin de IA
2. En el campo de texto, pega el prompt
3. Haz clic en "Generate" o "Create Design"
4. Espera 2-5 minutos (Figma AI procesará)
5. Revisa los frames/components generados

RESULTADO ESPERADO:
✅ 8 frames (uno por sección)
✅ Componentes reutilizables (buttons, cards)
✅ Color palette aplicada (Hiberus colors)
✅ Layout responsive (con variantes)
```

### Paso 4: Refinar en Figma (Opcional)

```bash
Si necesitas ajustes:

1. Componentes:
   - Right-click en elemento → "Detach component"
   - Edita texto, colores, tamaños
   - Vuelve a "Wrap in component"

2. Colores:
   - Selecciona elemento
   - Panel derecha → Fill → selecciona color
   - O crea "Color Style" para reutilizar

3. Tipografía:
   - Selecciona texto
   - Panel derecha → Type style
   - Crea "Text Style" si no existe

4. Layout:
   - Selecciona frame
   - Panel derecha → Design
   - Ajusta width, height, constraints

5. Animaciones (si lo soporta):
   - Prototype tab
   - Crea interacciones entre frames (click → navigate)
```

### Paso 5: Exportar a HTML

```bash
OPCIÓN A: Figma → HTML directo
1. Selecciona el frame/proyecto completo
2. Right-click → Export
3. Formato: "HTML5" (si disponible)
4. Guardar como: "HAIDA-presentation.html"

OPCIÓN B: Figma Code (plugin de código)
1. En Figma, instala "Code" plugin
2. Selecciona componentes
3. Panel derecha → "Code" tab
4. Copia HTML + CSS generado
5. Pega en VS Code, guarda como .html

OPCIÓN C: Manual (recomendado para control total)
1. En Figma: Select all (Ctrl+A)
2. Copy (Ctrl+C)
3. Abre https://www.figma.com/community/file/... (Figma to HTML converters)
4. Pega el design
5. Genera HTML
6. Descarga
```

### Paso 6: Validación & Deployment

```bash
1. Guarda HTML en: /HAIDA/HAIDA-PRESENTATION-v2.0.html
2. Abre en navegador: Verifica todas 8 secciones
3. Test responsive: F12 → Device toolbar → móvil, tablet
4. Valida colores: Hiberus Persian Blue #1E34A1
5. Verifica links: CTAs apuntan a URLs correctas

CHECKLIST:
☐ Hero section carga correctamente
☐ Problem cards visibles (5 items)
☐ Solution table visible
☐ Architecture diagram legible
☐ Tabs de técnicas funcionan
☐ Timeline roadmap visible
☐ Benefits section renders
☐ CTA buttons interactivos
☐ Footer con links
☐ Responsive en móvil
```

---

## OPCIÓN 2: ChatGPT + HTML Generation

### Paso 1: Preparar Prompt

```bash
Abre ChatGPT.com
Copia este prompt:

---
Eres un experto en HTML/CSS/JavaScript.
Necesito una presentación web moderna y profesional para HAIDA v2.0.

CONTEXTO:
HAIDA es una herramienta que automáticamente genera test cases ISTQB.
Reduce el tiempo de 4 semanas a 3 horas.
Empresa: Hiberus (colores: Persian Blue #1E34A1, Stratos #010D3D).

REQUISITOS:
1. HTML5 single-page application (un solo archivo)
2. Responsive design (mobile, tablet, desktop)
3. 8 secciones:
   - Hero (título, headline, CTA)
   - Problem (5 cards con pain points)
   - Solution (3 pilares + tabla comparativa)
   - Architecture (diagrama de 7 microservicios)
   - 50 AI Techniques (8 categorías, interfaz con tabs)
   - Roadmap (timeline 8-10 semanas con fases)
   - Benefits (4 perspectivas: users, devs, ops, business)
   - CTA (próximos pasos, contacto)

4. Colores Hiberus:
   - Primary: Persian Blue #1E34A1
   - Dark: Stratos #010D3D
   - Light: White #FFFFFF + Gray #f5f7fa

5. Características:
   - Tab/pill navigation (cambiar secciones)
   - Smooth scroll
   - Hover effects en cards y buttons
   - Mobile-first responsive
   - Embedded CSS (no external files)
   - Minimal JavaScript (solo interactividad)
   - <50KB tamaño
   - Performance optimizado

CONTENIDO ESPECÍFICO:
[Aquí pega el contenido de "2.4 PROMPT CORTO" o detalles específicos]

Genera el HTML completo, optimizado, listo para deployment.
Incluye comentarios en código para fácil personalización.
---
```

### Paso 2: Ejecutar

```bash
1. Pega el prompt en ChatGPT
2. Espera respuesta (2-3 minutos)
3. ChatGPT generará HTML completo
4. Copy el código generado
```

### Paso 3: Guardar & Validar

```bash
1. Abre VS Code
2. Archivo → New File
3. Pega el HTML de ChatGPT
4. Save as: "HAIDA-PRESENTATION-v2.0.html"
5. Guarda en: C:\Users\...\Proyectos\HAIDA\
6. Abre en navegador: File → Open File
7. Verifica funcionalidad (tabs, scroll, responsive)
```

---

## OPCIÓN 3: Claude (via claude.ai o Copilot)

### Paso 1: Copilot en VS Code

```bash
1. En VS Code, abre Copilot Chat (Ctrl+Shift+I)
2. Pega el prompt (OPCIÓN 2 arriba)
3. Selecciona "Claude" como modelo (si disponible)
4. Ejecuta
5. Copia respuesta al crear archivo
```

### Paso 2: Claude.ai Web

```bash
1. Abre https://claude.ai
2. Crea nueva conversación
3. Pega el prompt FIGMA AI (Sección 2.3)
4. Espera respuesta
5. Download o copy HTML
```

---

## OPCIÓN 4: Builder.io (No-code + AI)

### Paso 1: Signup

```bash
1. Abre https://www.builder.io
2. Sign up / Login
3. Crea nuevo "Design" project
4. Nombre: "HAIDA v2.0"
```

### Paso 2: AI Designer

```bash
1. En Builder dashboard: "Use AI" o "AI Design"
2. Pega el prompt (OPCIÓN 2 o Sección 2.3)
3. Builder.io generará site interactivamente
4. Acepta o ajusta secciones
```

### Paso 3: Exportar

```bash
1. Builder.io → Publish
2. O: Export → HTML (descargar archivo)
3. Copia URL para compartir con stakeholders
4. O importa en VS Code si necesitas editar
```

---

## OPCIÓN 5: Vercel Copilot (Recomendado para rápido)

### Paso 1: Vercel + AI

```bash
1. Abre https://vercel.com
2. Login o crea cuenta
3. "Create new" → "Copilot"
4. Selecciona "Design to HTML"
5. Pega el prompt
```

### Paso 2: Generar & Deploy

```bash
1. Vercel genera HTML
2. Deploy automático
3. URL compartible para stakeholders
4. Puedes editar en vs code y re-deploy
```

---

## CHECKLIST POST-GENERACIÓN

### Content Validation
- [ ] Hero section con título "HAIDA v2.0"
- [ ] 5 problem cards visibles (Slow, Gaps, Costly, Manual, Messy)
- [ ] Tabla comparativa (v1.0 vs v2.0) con 7+ features
- [ ] Diagrama de arquitectura con 7 endpoints
- [ ] Grid de 50 técnicas IA (8 categorías)
- [ ] Timeline roadmap (6 fases, 8-10 semanas)
- [ ] 4 secciones de beneficios (Users, Devs, Ops, Business)
- [ ] CTA buttons con links funcionales

### Design Validation
- [ ] Colores Hiberus aplicados:
  - Persian Blue #1E34A1 (headings, buttons)
  - Stratos #010D3D (backgrounds)
  - White #FFFFFF (text on dark)
- [ ] Logo Hiberus visible en header/hero
- [ ] Tipografía clara (sans-serif, bold headings)
- [ ] Espaciado consistente (padding, margins)
- [ ] Hover effects en cards y buttons
- [ ] Responsive en:
  - Desktop (1200px) ✅
  - Tablet (768px) ✅
  - Mobile (375px) ✅

### Functionality Validation
- [ ] Tab navigation funciona (cambiar secciones)
- [ ] Smooth scroll entre sections
- [ ] Buttons responden a hover
- [ ] Links CTAs funcionan
- [ ] Imágenes/iconos cargan
- [ ] Formularios (si existen) funcionan
- [ ] No hay console errors (F12 → Console)

### Performance Validation
- [ ] Tamaño <50KB (si es posible)
- [ ] Load time <3 segundos
- [ ] Lighthouse score >90
- [ ] Optimizaciones:
  - [ ] CSS minificado
  - [ ] JS minificado
  - [ ] Imágenes optimizadas
  - [ ] Fonts inline (si posible)

### Accessibility Validation
- [ ] WCAG AA compliant (contrast ratios)
- [ ] Alt text en imágenes
- [ ] Keyboard navigation (Tab key)
- [ ] Focus states visibles
- [ ] Semantic HTML (h1, h2, button, etc)

### Browser Validation
- [ ] Chrome ✅
- [ ] Safari ✅
- [ ] Firefox ✅
- [ ] Edge ✅

---

## PERSONALIZACIÓN COMÚN

### 1. Cambiar Textos
```html
<!-- Busca y reemplaza: -->
"HAIDA v2.0" → "HAIDA v2.0 — Hiberus"
"Test Generation, Simplified" → Tu headline custom
"Get Started" → "Schedule Demo" (u otro CTA)
```

### 2. Añadir Logo
```html
<!-- Reemplaza logo text con: -->
<img src="path/to/logo-hiberus.svg" alt="Hiberus Logo" style="height: 40px;">
```

### 3. Cambiar Colores
```css
/* Busca y reemplaza en <style> -->
#1E34A1 (Persian Blue) → tu color primary
#010D3D (Stratos) → tu color dark
#ffffff (White) → mantener igual
#f5f7fa (Light Gray) → tu color light background
```

### 4. Añadir Links
```html
<!-- En CTA buttons: -->
href="https://your-domain.com/demo"
href="https://docs.your-domain.com"
href="mailto:hola@stayarta.com"
```

### 5. Cambiar Contenido Técnico
```html
<!-- Actualizar sección 4 Architecture: -->
<!-- Servicios, endpoints, tech stack -->

<!-- Actualizar sección 5 Técnicas: -->
<!-- Categorías, nombres, fases (v2.0 vs v2.1) -->

<!-- Actualizar sección 6 Roadmap: -->
<!-- Timeline, fases, duración, effort -->
```

---

## TROUBLESHOOTING

### Problema: El HTML no se ve correctamente
**Solución:**
1. Abre en navegador diferente
2. Limpia caché (Ctrl+Shift+Delete)
3. Verifica que CSS esté embebido en <style> tag
4. Busca errores en Console (F12)

### Problema: Imágenes no cargan
**Solución:**
1. Verifica rutas (usa rutas relativas)
2. Convierte a base64 si es posible
3. O sube a CDN (imgur, cloudinary, etc)

### Problema: Tabs no funcionan
**Solución:**
1. Verifica JavaScript en <script> tag
2. Busca errores en Console
3. Revisa IDs de elementos (deben coincidir)

### Problema: Responsive no funciona
**Solución:**
1. Verifica viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1">`
2. Verifica media queries en CSS
3. Abre DevTools → Toggle device toolbar (F12)

### Problema: Colores no son correctos
**Solución:**
1. Verifica hex codes: #1E34A1, #010D3D, #ffffff
2. En navegador: Right-click → Inspect → Elements
3. Busca en <style> y actualiza colores

---

## SIGUIENTE PASO DESPUÉS DE GENERAR

Una vez que tengas el HTML generado y validado:

```bash
1. Guarda en: /HAIDA/HAIDA-PRESENTATION-v2.0.html
2. Sube a GitHub (si tienes repo)
3. Deploy a un servidor:
   - Netlify (drop & drop)
   - Vercel (git push)
   - GitHub Pages (push a main branch)
4. Comparte URL con stakeholders
5. Recibe feedback
6. Itera si es necesario
```

---

## RECURSOS ÚTILES

- Figma AI: https://www.figma.com/ai
- ChatGPT: https://chat.openai.com
- Claude: https://claude.ai
- Builder.io: https://www.builder.io
- Vercel: https://vercel.com
- HTML/CSS Validation: https://validator.w3.org
- Lighthouse: https://developers.google.com/web/tools/lighthouse

---

**Documento:** Guía rápida ejecución  
**Status:** ✅ Listo para usar  
**Tiempo estimado:** 30-60 min (completo)  
**Resultado:** Presentación HTML profesional, branded, responsive

