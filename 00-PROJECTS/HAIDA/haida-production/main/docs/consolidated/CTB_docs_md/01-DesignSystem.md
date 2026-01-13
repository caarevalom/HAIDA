# 🎨 Figma Maker IA Prompt - Design System HAIDA

## 🎯 Objetivo
Construir Design System HAIDA completo con tokens (light/dark, liquid glass), tipografías, espaciados, radios, sombras y estados. Crear componentes básicos reutilizables.

## 🎨 Tokens de Diseño
- **Colores**: Light/dark themes con liquid glass effects
- **Tipografía**: Inter font family con pesos y tamaños escalables
- **Espaciado**: Sistema de 4px grid (xs:4, sm:8, md:12, lg:16, xl:24, 2xl:32)
- **Sombras**: Elevación glassmorphism con blur 20px
- **Radios**: Bordes redondeados consistentes (4px, 8px, 16px)
- **Estados**: hover(0.96), active(0.92), disabled(0.5), focus ring

## 🧩 Componentes Básicos

### Buttons
- **Primary**: BG primary, text white, hover darken
- **Secondary**: Border primary, text primary, hover fill
- **Link**: Text primary, underline on hover
- **Icon**: Circular with icon, hover scale
- **Estados**: hover/active/disabled/focus/error/success
- **Tamaños**: xs/sm/md/lg (height 32px-48px)

### Inputs
- **Text/Email/Password**: Border, focus ring, validation states
- **Estados**: default/hover/focus/error/disabled
- **Labels**: Above input, required asterisk
- **Helper text**: Below input, error messages

### Selects & Dropdowns
- **Trigger**: Input-like with chevron
- **Options**: Hover states, selected indicator
- **Multi-select**: Chips/tags with remove

### Toggles & Switches
- **Boolean**: Track + thumb animation
- **Estados**: on/off/disabled

### Date/Time Pickers
- **Calendar**: Grid layout, today highlight
- **Time**: Hour/minute wheels or inputs

### Tags & Chips
- **Default**: Rounded rect with text
- **With icon**: Leading/trailing icons
- **Removable**: Close button on hover

### Avatars
- **Single**: Circular image with fallback
- **Group**: Stacked circles with count
- **Sizes**: xs(24px) to xl(64px)

### Cards
- **Container**: Glass effect, padding, shadow
- **Header**: Title + actions
- **Content**: Flexible content area
- **Footer**: Actions or metadata

### Tables
- **Header**: Sortable columns, filters
- **Rows**: Hover states, selection checkboxes
- **Pagination**: Page controls, items per page
- **Empty state**: Illustration + message

### Feedback Components
- **Banners**: Info/warning/error/success variants
- **Toasts**: Auto-dismiss, action buttons
- **Modals**: Overlay, focus trap, ESC close
- **Sheets**: Side panels, responsive

### Loading States
- **Skeletons**: Content-shaped placeholders
- **Spinners**: Circular progress indicators
- **Progress bars**: Linear progress

## ♿ Accesibilidad WCAG AA
- **Contraste**: Mínimo 4.5:1 (texto normal), 3:1 (texto grande)
- **Foco**: Visible focus rings en todos los elementos interactivos
- **Roles ARIA**: Labels, descriptions, landmarks
- **Navegación**: Keyboard navigation completa
- **Estados**: Screen reader announcements

## 🌙 Tema Light/Dark
- **Auto-switch**: System preference detection
- **Manual toggle**: Header switcher
- **Smooth transitions**: 200ms opacity transitions
- **Consistent mapping**: Light ↔ dark color relationships

## 🌐 i18n Ready
- **Text direction**: LTR support (future RTL)
- **Content expansion**: Flexible layouts for text growth
- **Date formats**: Localized date/time display
- **Number formatting**: Localized separators

## 📱 Responsive Design
- **Breakpoints**: sm(640px), md(768px), lg(1024px), xl(1280px)
- **Grid system**: 12-column responsive grid
- **Spacing scale**: Consistent across breakpoints
- **Typography**: Fluid text sizing

## 🎭 Variants & States
- **Component variants**: Primary/secondary/tertiary
- **Size variants**: xs/sm/md/lg/xl
- **Theme variants**: Light/dark/auto
- **State variants**: Default/hover/active/focus/disabled/error/success

## 📋 Implementation Checklist
- [ ] Color tokens (light/dark palettes)
- [ ] Typography scale (sizes/weights/line-heights)
- [ ] Spacing tokens (4px grid system)
- [ ] Shadow/elevation system
- [ ] Border radius scale
- [ ] Component library (buttons, inputs, etc.)
- [ ] State management (hover/active/focus)
- [ ] Accessibility compliance
- [ ] Responsive behavior
- [ ] Theme switching
- [ ] Documentation
