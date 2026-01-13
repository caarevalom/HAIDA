# 📚 Figma Maker IA Prompt - Documentación Module HAIDA

## 🎯 Objetivo

Crear módulo completo de documentación con listado paginado, visor Markdown, editor con toolbar, panel de versiones, búsqueda semántica, y enlaces contextuales a scripts/endpoints/pantallas.

## 📋 Listado de Documentación

- **Layout**: 3-column grid con cards informativas
- **Cards**: Título, descripción preview, tags, autor, fecha
- **Filtros**: Sidebar con categorías, tags, fecha, autor
- **Paginación**: Load more + scroll infinito
- **Búsqueda**: Barra superior con autocomplete
- **Estados**: Published/Draft, Featured, Recent

## 👀 Visor Markdown

- **Layout**: 2-column (contenido + tabla de contenidos)
- **Render**: Headers, lists, code blocks, tables, links
- **Navegación**: Anchor links, scroll spy en TOC
- **Acciones**: Edit, Version history, Share, Export
- **Tema**: Light/dark mode con syntax highlighting

## ✏️ Editor de Documentación

- **Toolbar**: Rich text controls (bold, italic, headers, lists)
- **Markdown**: Live preview side-by-side
- **Autosave**: Draft saving every 30 seconds
- **Collaboración**: Multi-user editing indicators
- **Templates**: Predefined document structures

## 📝 Panel de Versiones

- **Timeline**: Vertical list con versiones ordenadas
- **Diff View**: Side-by-side comparison
- **Restore**: One-click version restoration
- **Comments**: Version-specific notes
- **Audit**: Who, when, what changed

## 🔍 Búsqueda y Filtros

- **Búsqueda Semántica**: NLP-powered search
- **Filtros Avanzados**: Tipo, tags, fecha, relevancia
- **Resultados**: Highlighted snippets con contexto
- **Sugerencias**: Related documents, similar content

## 🔗 Enlaces Contextuales

- **Scripts**: Link to automation scripts mentioned
- **Endpoints**: API documentation references
- **Pantallas**: UI mockups and flows
- **Archivos**: Related files and resources

## 📊 Estados y Estados

- **Loading**: Skeleton loaders para contenido
- **Error**: Error boundaries con retry
- **Empty**: Helpful illustrations y CTAs
- **Offline**: Cached content indicators

## ♿ Accesibilidad

- **Keyboard Navigation**: Tab through all elements
- **Screen Readers**: Semantic HTML, ARIA labels
- **High Contrast**: Readable in all themes
- **Focus Management**: Logical tab order

## 🎨 Integración con Design System

- **Typography**: Clear hierarchy con Inter font
- **Spacing**: Generous whitespace para legibilidad
- **Colors**: Theme-aware con glassmorphism
- **Components**: Reutilizar cards, buttons, inputs

## 🔄 Flujos de Usuario

- **Crear**: Template selection → Editor → Preview → Publish
- **Editar**: Load document → Edit → Auto-save → Publish
- **Versionar**: Edit → Save version → Compare → Publish
- **Buscar**: Query → Filters → Results → Navigate
- **Compartir**: Generate link → Copy → Share

## 📱 Responsive Design

- **Desktop**: 3-column layout con sidebar expandible
- **Tablet**: 2-column con bottom sheet filters
- **Mobile**: Single column con stacked navigation

## 🚀 Performance

- **Lazy Loading**: Content loaded on demand
- **Caching**: Browser cache para assets estáticos
- **Search Index**: Client-side search con Fuse.js
- **Images**: Optimized loading con lazy loading

## 📋 Implementation Checklist

- [ ] Document listing with pagination
- [ ] Markdown viewer with syntax highlighting
- [ ] Rich text editor with live preview
- [ ] Version control interface
- [ ] Advanced search and filtering
- [ ] Contextual linking system
- [ ] Responsive layouts
- [ ] Accessibility compliance
- [ ] Performance optimization
- [ ] Offline capabilities
