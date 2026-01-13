# 🎨 ARCHIVOS FIGMA - INTERFAZ COMPLETA HAIDA

## 📂 Ubicación de Archivos

**Directorio principal**: `docs/UX/`

---

## 🎨 1. TOKENS DE DISEÑO

### DesignTokens.json

**Ubicación**: `docs/UX/DesignTokens.json`

**Contenido**:

```json
{
  "font": {
    "family": "Inter, system-ui, -apple-system, Segoe UI",
    "size": { "xs": 12, "sm": 14, "md": 16, "lg": 18, "xl": 24, "2xl": 32 },
    "weight": { "regular": 400, "medium": 500, "bold": 700 },
    "lineHeight": { "tight": 1.2, "normal": 1.5, "relaxed": 1.7 }
  },
  "color": {
    "light": {
      "bg": "#0F172A",
      "surface": "rgba(255, 255, 255, 0.6)",
      "card": "rgba(255, 255, 255, 0.5)",
      "text": "#0B1020",
      "primary": "#2563EB",
      "accent": "#06B6D4",
      "success": "#16A34A",
      "warning": "#F59E0B",
      "error": "#DC2626"
    },
    "dark": {
      "bg": "#0B1020",
      "surface": "rgba(20, 24, 33, 0.6)",
      "text": "#E5E7EB",
      "primary": "#60A5FA",
      "accent": "#22D3EE"
    }
  },
  "glass": {
    "blur": "20px",
    "radius": 16,
    "border": "1px",
    "elevation": { "card": "0 8px 24px rgba(0,0,0,0.1)" }
  },
  "spacing": { "xs": 4, "sm": 8, "md": 12, "lg": 16, "xl": 24, "2xl": 32 }
}
```

**Uso**: Cargar PRIMERO en Figma Maker IA antes de crear componentes.

---

## 📝 2. PROMPTS PARA FIGMA MAKER IA

### Directorio: `docs/UX/Figma_Maker_Prompts/`

---

### 01-DesignSystem.md

**Ubicación**: `docs/UX/Figma_Maker_Prompts/01-DesignSystem.md`

**Objetivo**: Construir Design System HAIDA completo

**Incluye**:

- ✅ **Componentes Básicos**:
  - Buttons (Primary, Secondary, Link, Icon)
  - Inputs (Text, Email, Password)
  - Selects & Dropdowns
  - Toggles & Switches
  - Date/Time Pickers
  - Tags & Chips
  - Avatars (Single, Group)
  - Cards (Header, Content, Footer)
  - Tables (Header, Rows, Pagination)
  - Feedback (Banners, Toasts, Modals, Sheets)
  - Loading States (Skeletons, Spinners, Progress bars)

- ✅ **Temas**: Light/Dark con glassmorphism
- ✅ **Accesibilidad**: WCAG AA compliance
- ✅ **i18n**: Multi-idioma ready (ES/EN/FR)
- ✅ **Responsive**: Breakpoints definidos

**Usar**: SEGUNDO (después de tokens)

---

### 02-Web.md

**Ubicación**: `docs/UX/Figma_Maker_Prompts/02-Web.md`

**Objetivo**: Pantallas web desktop completas

**Incluye**:

#### Header Fijo (Functional)

- Logo + App Name "HAIDA"
- Navigation: Principal, Inbox, Explorar, Proyecto, Chat IA
- Right Section: Language, Theme toggle, Notifications, Avatar

#### Footer (Functional)

- Copyright, Quick links, Legal links

#### 8 Pantallas Principales:

1. **Login/Register** - Centered card, Microsoft Entra ID
2. **Dashboard** - KPIs, Recent activity, Charts, Quick actions
3. **Inbox** - Notificaciones con filters y actions
4. **Explorar** - Catálogo con búsqueda y filtros
5. **Proyecto** - Gestión con sidebar tree
6. **Chat IA** - 3-column layout con M365 panel
7. **Reportes** - Filtros, tabla, charts, export
8. **Configuración** - Profile, Security, Notifications, API Keys

**Usar**: TERCERO (después de Design System)

---

### 03-Mobile.md

**Ubicación**: `docs/UX/Figma_Maker_Prompts/03-Mobile.md`

**Objetivo**: Pantallas mobile iOS/Android

**Incluye**:

#### Navbar Inferior (Bottom Tab Bar)

- 5 ítems: Principal, Inbox, Explorar, Proyecto, Chat IA
- Safe areas, badges, glass effect

#### 8 Pantallas Mobile:

1. **Login/Register Mobile** - Biometric auth, large touch targets
2. **Dashboard Mobile** - Pull-to-refresh, FAB buttons
3. **Inbox Mobile** - Swipe gestures (archive, mark read)
4. **Explorar Mobile** - Voice search, 2-column grid
5. **Proyecto Mobile** - Swipeable tabs, floating action button
6. **Chat IA Mobile** - Full screen, voice recording
7. **Reportes Mobile** - Card layout, pinch-to-zoom
8. **Perfil Mobile** - Large avatar, switches, toggles

#### Touch Interactions:

- Tap targets: 44px (iOS), 48px (Android)
- Gestures: Swipe, long press, pinch, pull-to-refresh
- Haptic feedback

**Usar**: CUARTO (después de Web)

---

### 04-Documentacion.md

**Ubicación**: `docs/UX/Figma_Maker_Prompts/04-Documentacion.md`

**Objetivo**: Módulo completo de documentación

**Incluye**:

#### Componentes Principales:

1. **Listado de Documentación** - 3-column grid, filtros, paginación
2. **Visor Markdown** - 2-column (content + TOC), theme-aware
3. **Editor** - Rich toolbar, live preview, autosave
4. **Panel de Versiones** - Timeline, diff view, restore
5. **Búsqueda Semántica** - NLP-powered, filtros avanzados
6. **Enlaces Contextuales** - Links a scripts, endpoints, pantallas

**Flujos**:

- Crear: Template → Editor → Preview → Publish
- Editar: Load → Edit → Auto-save → Publish
- Versionar: Edit → Save version → Compare → Publish

**Usar**: QUINTO (módulo específico)

---

### 05-ChatIA.md

**Ubicación**: `docs/UX/Figma_Maker_Prompts/05-ChatIA.md`

**Objetivo**: Chat IA con integración Copilot Studio

**Incluye**:

#### Layout 3-Column:

1. **Columna Izquierda (Historial)**:
   - Thread list con preview
   - Búsqueda y filtros
   - Categories: Recientes, Favoritos, Archivado

2. **Columna Central (Conversación)**:
   - Messages area con scroll
   - Message types: User, Assistant, System
   - Input expandable con attachments

3. **Columna Derecha (Panel M365)**:
   - Outlook, Teams, OneDrive, SharePoint
   - Recent items
   - Deep links contextuales

#### Integración Copilot Studio:

- Primary provider: Copilot Studio (Direct Line API)
- Fallback: OpenAI o Anthropic
- Estados: Connected, Connecting, Disconnected, Error
- Streaming responses con typing indicator

#### Gestión de Hilos:

- Create, Rename, Archive, Delete, Export, Share
- Thread properties: ID, Title, Provider, Status, Metadata

**Usar**: SEXTO (módulo específico)

---

## 🚀 CÓMO USAR EN FIGMA MAKER IA

### Orden de Ejecución:

```
1. DesignTokens.json        → Cargar tokens primero
2. 01-DesignSystem.md       → Crear componentes base
3. 02-Web.md                → Pantallas desktop
4. 03-Mobile.md             → Pantallas mobile
5. 04-Documentacion.md      → Módulo documentación
6. 05-ChatIA.md             → Módulo chat IA
```

### Pasos Detallados:

#### Paso 1: Abrir Figma Maker IA

- Ve a: https://www.figma.com/maker
- O usa plugin de Figma si lo tienes instalado

#### Paso 2: Cargar Design Tokens

1. Abre `docs/UX/DesignTokens.json`
2. Copia TODO el contenido
3. Pégalo en Figma Maker IA
4. Indica: "Use estos tokens para todo el diseño"

#### Paso 3: Ejecutar Prompts en Orden

1. Abre `01-DesignSystem.md`
2. Copia TODO el contenido
3. Pégalo en Figma Maker IA
4. Espera a que genere los componentes
5. Repite con 02, 03, 04, 05 en orden

#### Paso 4: Conectar Flujos

- Usa prototipado de Figma para conectar pantallas
- Flujos recomendados:
  - Login → Dashboard
  - Dashboard → Script execution → Results
  - Project → Test run → Report
  - Chat IA → Document reference → Script generation

---

## 📊 COBERTURA COMPLETA

| Módulo            | Pantallas                   | Estado   | Prompt              | Tokens            |
| ----------------- | --------------------------- | -------- | ------------------- | ----------------- |
| **Design System** | Componentes base            | ✅ Listo | 01-DesignSystem.md  | DesignTokens.json |
| **Web Desktop**   | 8 pantallas + Header/Footer | ✅ Listo | 02-Web.md           | ✅                |
| **Mobile**        | iOS/Android completo        | ✅ Listo | 03-Mobile.md        | ✅                |
| **Documentación** | Editor + visor + versiones  | ✅ Listo | 04-Documentacion.md | ✅                |
| **Chat IA**       | 3-column + Copilot          | ✅ Listo | 05-ChatIA.md        | ✅                |

---

## 🎯 CARACTERÍSTICAS INCLUIDAS

### Design System

- ✅ Tema Light/Dark con glassmorphism
- ✅ Accesibilidad WCAG AA completa
- ✅ i18n (ES/EN/FR) preparado
- ✅ Responsive desktop/tablet/mobile
- ✅ Design tokens escalables
- ✅ Estados interactivos (hover, active, focus, disabled)

### Componentes

- ✅ 40+ componentes reutilizables
- ✅ Variants para cada componente
- ✅ Auto-layout para responsive
- ✅ Component properties
- ✅ Nested instances

### Pantallas

- ✅ 8 pantallas web desktop
- ✅ 8 pantallas mobile (iOS/Android)
- ✅ Header/Footer funcionales
- ✅ Navbar inferior mobile
- ✅ Módulo documentación completo
- ✅ Módulo chat IA con M365

### Prototipado

- ✅ Flujos navegables
- ✅ Micro-interacciones
- ✅ Transiciones suaves
- ✅ Estados de loading/error/success
- ✅ Responsive behaviors

---

## 💡 TIPS PARA FIGMA

### 1. Organización

- Crear páginas separadas: Design System, Web, Mobile, Docs, Chat
- Usar frames con naming convention: `[Módulo] - [Pantalla] - [Variante]`
- Ejemplo: `Web - Dashboard - Light`, `Mobile - Dashboard - iOS`

### 2. Components

- Crear main components en página "Design System"
- Instanciar en páginas de pantallas
- Usar component properties para variants
- Nombrar layers descriptivamente

### 3. Auto-Layout

- Usar auto-layout para responsive
- Configurar padding y spacing con tokens
- Usar flex direction y alignment
- Test con resize handles

### 4. Prototyping

- Conectar todas las pantallas principales
- Usar "Smart Animate" para transiciones suaves
- Configurar scroll behavior en contenido largo
- Añadir overlays para modals y sheets

### 5. Variables (si usas Figma variables)

- Crear collections: Colors, Typography, Spacing
- Mapear light/dark modes
- Usar semantic naming
- Link variables to components

---

## 📂 ESTRUCTURA DE ARCHIVOS EN GITHUB

```
HAIDA/
├── docs/
│   └── UX/
│       ├── DesignTokens.json                     ⭐ Design tokens
│       └── Figma_Maker_Prompts/
│           ├── 01-DesignSystem.md                ⭐ Components base
│           ├── 02-Web.md                         ⭐ Pantallas web
│           ├── 03-Mobile.md                      ⭐ Pantallas mobile
│           ├── 04-Documentacion.md               ⭐ Módulo docs
│           └── 05-ChatIA.md                      ⭐ Módulo chat
└── Presentación HAIDA - Figma.zip                📦 Presentación existente
```

---

## 🔗 ACCESO RÁPIDO

### GitHub Repository

```
hola@stayarta.com:CarlosArturoArevaloM/HAIDA.git
```

### Rutas Directas

```
docs/UX/DesignTokens.json
docs/UX/Figma_Maker_Prompts/01-DesignSystem.md
docs/UX/Figma_Maker_Prompts/02-Web.md
docs/UX/Figma_Maker_Prompts/03-Mobile.md
docs/UX/Figma_Maker_Prompts/04-Documentacion.md
docs/UX/Figma_Maker_Prompts/05-ChatIA.md
```

### Clonar Repositorio

```bash
git clone hola@stayarta.com:CarlosArturoArevaloM/HAIDA.git
cd HAIDA/docs/UX
```

---

## 📋 CHECKLIST DE USO

### Pre-Figma

- [ ] Leer todos los prompts para entender la estructura
- [ ] Revisar DesignTokens.json
- [ ] Tener cuenta de Figma activa
- [ ] Acceso a Figma Maker IA

### Durante Figma

- [ ] Cargar DesignTokens.json primero
- [ ] Ejecutar 01-DesignSystem.md
- [ ] Crear componentes base
- [ ] Ejecutar 02-Web.md
- [ ] Crear pantallas desktop
- [ ] Ejecutar 03-Mobile.md
- [ ] Crear pantallas mobile
- [ ] Ejecutar 04-Documentacion.md
- [ ] Crear módulo docs
- [ ] Ejecutar 05-ChatIA.md
- [ ] Crear módulo chat
- [ ] Conectar flujos con prototipado
- [ ] Test responsive en diferentes tamaños

### Post-Figma

- [ ] Revisar accesibilidad (contraste, focus states)
- [ ] Verificar consistencia visual
- [ ] Test prototipo navegable
- [ ] Compartir con equipo para feedback
- [ ] Exportar assets para desarrollo
- [ ] Documentar decisiones de diseño

---

## 🎓 RECURSOS ADICIONALES

### Figma Maker IA

- Documentación: https://www.figma.com/maker
- Tutoriales: https://help.figma.com/hc/en-us/articles/maker

### Design System

- Material Design: https://material.io/design
- Fluent 2: https://fluent2.microsoft.design/
- Glassmorphism: https://glassmorphism.com/

### Accesibilidad

- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- Contrast Checker: https://webaim.org/resources/contrastchecker/

---

## 📞 SOPORTE

**Proyecto**: HAIDA (Hiberus AI-Driven Automation)
**Email**: hola@stayarta.com
**GitHub Issues**: https://github.com/CarlosArturoArevaloM/HAIDA/issues

---

**Creado**: ++34662652300
**Versión**: 1.0
**Estado**: ✅ Completo y Listo para Usar

---

## 🚀 SIGUIENTE PASO

**Ejecuta AHORA**:

1. Abre Figma
2. Inicia Figma Maker IA
3. Carga `DesignTokens.json`
4. Ejecuta prompts en orden (01 → 02 → 03 → 04 → 05)
5. Conecta flujos con prototipado

**¡Tu diseño completo de HAIDA estará listo en 1-2 horas!** 🎨
