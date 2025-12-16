# 📱 Figma Maker IA Prompt - Mobile Screens HAIDA

## 🎯 Objetivo
Crear pantallas mobile iOS/Android con navbar inferior centrada, navegación por gestos, y diseño responsive con safe areas. Optimizado para touch interactions.

## 🔽 Navbar Inferior (Functional)
- **Diseño**: Bottom tab bar centrada, 5 ítems equidistantes
- **Ítems**:
  1. 🏠 Principal - Dashboard compacto
  2. 📬 Inbox - Notificaciones push
  3. 🔍 Explorar - Catálogo mobile-friendly
  4. 📁 Proyecto - Gestión simplificada
  5. 💬 Chat IA - Asistente inteligente
- **Estados**: Active (filled icon + label), Inactive (outline icon)
- **Badges**: Notification counts en rojo
- **Safe Areas**: Respetar notches y home indicators
- **Background**: Glass effect, semi-transparent

## 📲 Pantallas Mobile

### 1. Login/Register Mobile
- **Layout**: Full screen con background gradient
- **Form**: Large touch targets (48px min), auto-focus
- **Biometric**: Face ID/Touch ID integration
- **Social Login**: Large Microsoft button
- **Keyboard**: Adjust layout on keyboard show

### 2. Dashboard Mobile (Principal)
- **Header**: Compact KPIs en cards horizontales
- **Scroll**: Pull-to-refresh functionality
- **Quick Actions**: Large circular buttons (FAB style)
- **Recent Activity**: Timeline vertical con swipe actions
- **Charts**: Simplified mobile charts, tap to expand

### 3. Inbox Mobile (Notificaciones)
- **List**: Full-width cards con swipe actions
- **Swipe Gestures**:
  - Left: Archive (orange)
  - Right: Mark as read (green)
  - Long press: Multi-select mode
- **Filters**: Bottom sheet con categorías
- **Push Notifications**: Native mobile notifications

### 4. Explorar Mobile (Catálogo)
- **Search**: Sticky search bar con voice input
- **Tabs**: Horizontal scrollable categories
- **Grid**: 2-column card grid con infinite scroll
- **Filters**: Side sheet con multi-select chips
- **Favorites**: Heart icon, sync across devices

### 5. Proyecto Mobile (Gestión)
- **Tabs**: Swipe between Overview/Cases/Executions
- **Test Cases**: Accordion list con expand/collapse
- **Actions**: Floating action button para "Run Tests"
- **Settings**: Bottom sheet con configuration
- **Progress**: Native progress indicators

### 6. Chat IA Mobile
- **Layout**: Full screen conversation
- **Header**: Back button, thread title, menu (3-dots)
- **Messages**: Bubble design con timestamps
- **Input**: Expandable text area, attachment button
- **Voice**: Voice message recording
- **M365 Panel**: Collapsible bottom sheet

### 7. Reportes Mobile
- **List**: Card-based layout con thumbnails
- **Filters**: Collapsible filter bar
- **Detail**: Full screen con pinch-to-zoom charts
- **Share**: Native share sheet (PDF, email, etc.)
- **Offline**: Cache for offline viewing

### 8. Perfil Mobile
- **Avatar**: Large circular, tap to change
- **Settings**: List with switches and navigation
- **Security**: Biometric settings, session management
- **Storage**: Cache clear, data export

## 👆 Touch Interactions
- **Tap Targets**: Minimum 44px (iOS), 48px (Android)
- **Gestures**:
  - Swipe left/right: Navigate between tabs
  - Swipe down: Pull to refresh
  - Long press: Context menus
  - Pinch: Zoom in charts/reports
- **Haptic Feedback**: Success, error, selection states
- **Animation**: Smooth 300ms transitions

## 📱 Platform Specifics

### iOS Design
- **Navigation**: Large titles, back gestures
- **Controls**: Cupertino switches, segmented controls
- **Typography**: SF Pro font family
- **Safe Areas**: Dynamic island, home indicator

### Android Design
- **Navigation**: Material You bottom navigation
- **Controls**: Material switches, chips, FABs
- **Typography**: Roboto font family
- **System UI**: Status bar, navigation bar integration

## ♿ Mobile Accessibility
- **Screen Readers**: VoiceOver/TalkBack support
- **Touch Targets**: Adequate size and spacing
- **Focus**: Visible focus indicators for keyboard users
- **Color**: High contrast mode support
- **Motion**: Respect reduce motion settings

## 🔄 Responsive Mobile Web
- **Progressive Web App**: Installable, offline capable
- **Viewport**: Proper meta viewport settings
- **Touch Events**: Fast tap responses, no 300ms delay
- **Orientation**: Support both portrait and landscape
- **Performance**: Lazy loading, image optimization

## 🎨 Mobile Design System
- **Spacing**: Generous touch-friendly spacing
- **Typography**: Larger text for readability
- **Icons**: 24px minimum, clear metaphors
- **Cards**: Elevated with subtle shadows
- **Buttons**: Large, clear call-to-actions

## 🔋 Performance Considerations
- **Bundle Size**: Code splitting by route
- **Images**: WebP format, responsive images
- **Caching**: Service worker for offline functionality
- **Network**: Progressive loading, skeleton screens

## 📋 Implementation Checklist
- [ ] Bottom navigation bar with 5 tabs
- [ ] All 8 screens designed for mobile
- [ ] Touch gestures implemented
- [ ] iOS and Android variants
- [ ] Safe area handling
- [ ] PWA capabilities
- [ ] Offline functionality
- [ ] Accessibility compliance
- [ ] Performance optimization
- [ ] Cross-device testing
