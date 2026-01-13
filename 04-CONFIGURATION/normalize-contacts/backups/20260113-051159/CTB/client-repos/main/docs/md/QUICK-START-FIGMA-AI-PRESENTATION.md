# ⚡ QUICK START: HAIDA v2.0 PRESENTATION CON FIGMA AI

**Tiempo estimado:** 60 minutos (total)  
**Opción recomendada:** Figma AI Plugin  
**Resultado:** HTML profesional, responsive, branded

---

## 📋 CHEAT SHEET (TODO EN UNA PÁGINA)

### PASO 1: PREPARACIÓN (5 min)

```
1. Abre → Figma.com
2. Login/crea cuenta
3. Nuevo proyecto → "HAIDA v2.0"
4. Nuevo file → "presentation"
5. Busca plugins → Instala plugin AI (Figma AI, Copilot, Genius, etc)
```

### PASO 2: OBTENER PROMPT (5 min)

```
Opción A: PROMPT CORTO (Rápido)
─────────────────────────────
Busca en: ANALISIS-COMPLETO-HAIDA-Y-PROMPT-FIGMA-AI.md
Sección: 2.4 PROMPT CORTO
Copia: Todo el texto (300 líneas)

Opción B: PROMPT DETALLADO (Completo)
──────────────────────────────────────
Busca en: Mismo archivo
Sección: 2.3 PROMPT DETALLADO
Copia: Todo el texto (2,500+ líneas)
└─ ⚠️ Más largo pero más específico
```

### PASO 3: GENERAR (15-20 min)

```
1. En Figma → Abre plugin AI
2. En campo de texto → Pega el PROMPT
3. Haz clic → "Generate" o "Create Design"
4. Espera → 5-15 minutos (Figma AI procesa)
5. Revisa → 8 frames aparecerán
   ├─ Frame 1: Hero
   ├─ Frame 2: Problem
   ├─ Frame 3: Solution
   ├─ Frame 4: Architecture
   ├─ Frame 5: AI Techniques
   ├─ Frame 6: Roadmap
   ├─ Frame 7: Benefits
   └─ Frame 8: CTA
```

### PASO 4: EXPORTAR (5 min)

```
OPCIÓN A: Figma → HTML (si lo soporta)
────────────────────────────────────────
1. Selecciona frame 1
2. Right-click → Export
3. Formato → HTML5 (si disponible)
4. Descarga

OPCIÓN B: Figma Code Plugin
─────────────────────────────
1. Instala plugin "Code"
2. Selecciona componentes
3. Panel derecha → "Code" tab
4. Copy HTML + CSS
5. Pega en VS Code
6. Save como "HAIDA-PRESENTATION-v2.0.html"
```

### PASO 5: VALIDACIÓN RÁPIDA (10 min)

```
✅ CONTENT CHECK
□ 8 secciones visibles (hero, problem, solution, etc)
□ Textos correctos (HAIDA v2.0, etc)
□ Números correctos (4 semanas, 3 horas, 50 técnicas, etc)

✅ DESIGN CHECK
□ Colores Hiberus (#1E34A1 azul, #010D3D oscuro, blanco)
□ Logo visible
□ Espaciado consistente
□ Botones visibles

✅ FUNCTIONALITY CHECK
□ Abre en navegador (Chrome, Safari, Firefox)
□ Responsive: Abre DevTools (F12) → Mobile view
□ Sin errores en Console (F12 → Console tab)

✅ PERFORMANCE CHECK
□ Tamaño: <50KB (F12 → Network → all)
□ Load time: <3 segundos
```

### PASO 6: PERSONALIZACIÓN (10 min) - OPCIONAL

```
Si necesitas cambios:

CAMBIAR TEXTOS:
┌────────────────────────────────────────────────┐
│ Busca en HTML:                                │
│ "HAIDA v2.0" → Tu título                      │
│ "4 weeks" → Tu timeframe                      │
│ "50 techniques" → Tu número                   │
│ Colores: Ctrl+F → "#1E34A1" → Tu color      │
└────────────────────────────────────────────────┘

AÑADIR LOGO:
┌────────────────────────────────────────────────┐
│ En HTML busca: <header> o <nav>               │
│ Reemplaza texto con:                          │
│ <img src="logo.svg" alt="Logo" height="40">  │
│ (requiere archivo logo.svg en misma carpeta) │
└────────────────────────────────────────────────┘

CAMBIAR LINKS:
┌────────────────────────────────────────────────┐
│ Busca: href="https://..."                     │
│ Reemplaza con URLs reales:                    │
│ href="https://tu-dominio.com/demo"           │
│ href="mailto:hola@stayarta.com"           │
│ href="https://docs.tu-dominio.com"           │
└────────────────────────────────────────────────┘
```

### PASO 7: GUARDAR & COMPARTIR (5 min)

```
1. Guarda HTML en:
   C:\Users\...\Proyectos\HAIDA\HAIDA-PRESENTATION-v2.0.html

2. Para compartir con stakeholders:
   
   OPCIÓN A: File HTML directo
   └─ Envía archivo por email o Slack
   
   OPCIÓN B: Sube a web server
   ├─ Netlify: Drag & drop → obtén URL
   ├─ Vercel: Git push → auto deploy
   └─ GitHub Pages: Push a repo → auto deploy
   
   OPCIÓN C: Convierte a PDF
   └─ En navegador: Ctrl+P → Save as PDF
```

---

## 🎯 CHECKLIST MÍNIMO

```
PRE-GENERACIÓN:
☐ Tengo Figma account
☐ Instalé plugin AI
☐ Copié PROMPT (corto o detallado)

GENERACIÓN:
☐ Pegué prompt en plugin
☐ Esperé generación (5-15 min)
☐ Obtuvo 8 frames

POST-GENERACIÓN:
☐ Exporté a HTML
☐ Guardé archivo
☐ Abrí en navegador
☐ Validé 8 secciones presentes
☐ Validé colores Hiberus
☐ Validé responsive (F12)
☐ Sin errores en Console (F12)

ANTES DE COMPARTIR:
☐ HTML <50KB
☐ Load time <3s
☐ Personalización hecha (si necesaria)
☐ Links funcionales
☐ Logo incluido (si aplica)
```

---

## 🚨 TROUBLESHOOTING RÁPIDO

| Problema | Solución |
|----------|----------|
| Plugin AI no aparece en Figma | Busca en Plugins menu, instala nuevo |
| Generación muy lenta | Intenta prompt CORTO (2.4) en lugar de detallado |
| HTML no se ve bien | Abre en navegador diferente, limpia cache (Ctrl+Shift+Del) |
| Imágenes no cargan | Convierte a base64 o sube a CDN (imgur, cloudinary) |
| Colores incorrectos | Busca #1E34A1, #010D3D en CSS, actualiza si es necesario |
| Tabs no funcionan | Verifica JavaScript en Console (F12), busca errores |
| No responsive | Verifica <meta name="viewport"> en HTML |
| Performance lento | Minifica CSS/JS, comprimi imágenes |

---

## 💡 TIPS EXPERTO

```
✅ Usa PROMPT CORTO primero (más rápido)
   └─ Si no es suficientemente detallado, repite con PROMPT DETALLADO

✅ Abre DevTools (F12) mientras esperas
   └─ Verifica Console → Network → Elements

✅ Si generación falla, intenta otra opción
   └─ ChatGPT (más rápido), Claude, Builder.io

✅ Guarda backup del HTML original
   └─ Antes de hacer personalizaciones

✅ Itera pequeño
   └─ Haz cambios pequeños, valida cada uno

✅ Para deployment rápido
   └─ Usa Netlify (drag & drop) o Vercel (git push)

✅ Pide feedback a stakeholders
   └─ Screenshot + compartir, obtén comentarios

✅ Si HTML es >50KB
   └─ Minify CSS/JS, compress imágenes, elimina código no usado
```

---

## 📱 QUICK REFERENCE

### COMANDOS ÚTILES

```bash
# Validar HTML
https://validator.w3.org

# Validar CSS
https://jigsaw.w3.org/css-validator/

# Minify CSS/JS
https://minifier.org

# Compress imágenes
https://tinypng.com

# Color contrast checker
https://webaim.org/resources/contrastchecker/

# Responsive testing
F12 → Mobile view → prueba diferentes dispositivos
```

### ATAJOS VS CODE

```
Ctrl+H       = Buscar y reemplazar
Ctrl+Shift+F = Buscar en archivo
Ctrl+F       = Buscar
Alt+Shift+F  = Format document
Ctrl+K Ctrl+F = Format selection
```

### ATAJOS NAVEGADOR (F12)

```
Ctrl+Shift+C  = Inspect element
F12           = DevTools
Ctrl+Shift+J  = Console
Ctrl+Shift+E  = Network
Ctrl+Shift+I  = Elements
```

---

## 🎓 FLUJOS ALTERNATIVOS

### Si prefieres NO usar Figma:

```
OPCIÓN CHATGPT (15 min):
1. Abre ChatGPT.com
2. Pega PROMPT CORTO
3. ChatGPT genera HTML
4. Copy código
5. Pega en VS Code
6. Save como .html
7. Valida

OPCIÓN CLAUDE (15 min):
1. Copilot Chat en VS Code (Ctrl+Shift+I)
2. Pega PROMPT CORTO
3. Claude genera HTML
4. Copy respuesta
5. Crea nuevo file
6. Valida

OPCIÓN BUILDER.IO (30 min):
1. Builder.io → AI Designer
2. Pega PROMPT CORTO
3. Builder genera site
4. Export HTML
5. Valida
```

---

## 📊 MÉTRICAS DE ÉXITO

```
✅ TAMAÑO HTML
   Target: <50KB ✓
   
✅ LOAD TIME
   Target: <3 segundos ✓
   
✅ LIGHTHOUSE SCORE
   Target: >90 ✓
   
✅ WCAG ACCESSIBILITY
   Target: AA ✓
   
✅ BROWSER COMPATIBILITY
   Target: Chrome, Safari, Firefox, Edge ✓
   
✅ RESPONSIVENESS
   Target: Works on mobile/tablet/desktop ✓
   
✅ BRAND COMPLIANCE
   Target: Hiberus colors (#1E34A1, #010D3D) ✓
```

---

## 🎯 RESULTADO FINAL

```
┌─────────────────────────────────────────────┐
│ HAIDA-PRESENTATION-v2.0.html                │
├─────────────────────────────────────────────┤
│ ✅ 8 secciones profesionales                 │
│ ✅ Colores Hiberus                          │
│ ✅ Responsive (móvil, tablet, desktop)      │
│ ✅ Interactive (tabs, hover, scroll)        │
│ ✅ <50KB tamaño                             │
│ ✅ <3s load time                            │
│ ✅ WCAG AA accessible                       │
│ ✅ Ready to share con stakeholders          │
│                                              │
│ 🚀 LISTO PARA DEPLOYMENT 🚀               │
└─────────────────────────────────────────────┘
```

---

## 📞 SOPORTE

```
Si tienes preguntas, revisa:

1. GUIA-RAPIDA-GENERAR-FIGMA-AI-PRESENTATION.md
   └─ Instrucciones detalladas (paso a paso)

2. ANALISIS-COMPLETO-HAIDA-Y-PROMPT-FIGMA-AI.md
   └─ Prompts completos + especificaciones

3. INDICE-MAESTRO-PRESENTACION-FIGMA-AI.md
   └─ FAQ + troubleshooting + recursos

4. HIBERUS-BRAND-GUIDE.md
   └─ Colores, tipografía, componentes
```

---

```
═══════════════════════════════════════════════════════════════════════════════
                         ¡LISTO PARA GENERAR! 🚀
                      Toma 60 minutos, crea un impacto
═══════════════════════════════════════════════════════════════════════════════

PRÓXIMO PASO:
1. Si usas Figma → Abre Figma.com
2. Si usas ChatGPT → Abre ChatGPT.com
3. Copia PROMPT (Sección 2.4 del análisis)
4. Genera presentación
5. Valida checklist
6. Comparte con stakeholders
7. ¡Éxito! ✨
```

---

**Quick Start Guide**  
**Creado:** 16 Diciembre 2025  
**Duración:** 60 minutos  
**Resultado:** Presentación HTML profesional  
**Status:** ✅ Listo

