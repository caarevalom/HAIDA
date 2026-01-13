# 🖥️ Figma Maker IA Prompt - Web Screens HAIDA

## 🎯 Objetivo
Crear pantallas web desktop completas con Header/Footer funcionales, navegación completa, y prototipos navegables. Sistema responsive con glassmorphism design.

## 🧭 Header Fijo (Functional)
- **Logo + App Name**: "HAIDA" con icono, clickable → Dashboard
- **Navigation Menu**: 5 items principales
  - 🏠 Principal (Dashboard)
  - 📬 Inbox (Notificaciones)
  - 🔍 Explorar (Catálogo)
  - 📁 Proyecto (Gestión)
  - 💬 Chat IA (Asistente)
- **Right Section**:
  - 🌐 Language selector (ES/EN/FR)
  - 🌓 Theme toggle (Light/Dark)
  - 🔔 Notifications dropdown (with badges)
  - 👤 User avatar → Account menu
- **Glass effect**: Blur background, semi-transparent
- **Responsive**: Collapses to hamburger on tablet

## 🦶 Footer (Functional)
- **Left**: Copyright + version info
- **Center**: Quick links (Documentation, API, Support)
- **Right**: Legal links (Privacy, Terms, Status)
- **Background**: Subtle pattern or gradient

## 📱 Pantallas Principales

### 1. Login/Register
- **Layout**: Centered card with glass effect
- **Login Form**: Email + Password + Remember me + Forgot password
- **Social Login**: Microsoft Entra ID button
- **Switch**: Login ↔ Register toggle
- **Background**: Gradient with floating elements

### 2. Dashboard (Principal)
- **Header**: Welcome message + KPIs summary
- **Grid Layout**:
  - Recent activity feed
  - Quick actions (New script, New project)
  - Test execution status
  - Performance metrics
- **Charts**: Mini charts for key metrics
- **Shortcuts**: Favorite scripts/projects

### 3. Inbox (Notificaciones)
- **Filters**: All/Read/Unread, Type (Test/Script/System)
- **List**: Notification cards with status indicators
- **Actions**: Mark as read, Archive, Delete
- **Real-time**: Live updates for new notifications
- **Empty state**: Illustration + call-to-action

### 4. Explorar (Catálogo)
- **Search Bar**: Full-width with filters
- **Categories**: Scripts, Projects, Documentation, Templates
- **Grid**: Cards with preview, tags, ratings
- **Filters**: Type, Language, Tags, Date, Popularity
- **Pagination**: Load more or numbered pages

### 5. Proyecto (Gestión)
- **Sidebar**: Project tree (Suites → Cases)
- **Main Content**: Test case editor/viewer
- **Tabs**: Overview, Test Cases, Executions, Reports
- **Actions**: Run tests, Edit configuration, Manage members
- **Settings**: Environment variables, integrations

### 6. Chat IA
- **3-Column Layout**:
  - **Left**: Thread history + search + new thread
  - **Center**: Conversation (messages, typing indicators)
  - **Right**: M365 Panel (Outlook/Teams/OneDrive/SharePoint)
- **Message Types**: User messages, AI responses, system messages
- **Attachments**: File upload, image preview
- **Actions**: Export conversation, rename thread

### 7. Reportes
- **Filters**: Date range, project, type, status
- **Table**: Sortable columns, bulk actions
- **Detail View**: Charts, logs, artifacts
- **Export**: PDF, Excel, JSON formats
- **Schedule**: Automated report generation

### 8. Configuración de Cuenta
- **Profile**: Avatar, name, email, preferences
- **Security**: Password change, 2FA, sessions
- **Notifications**: Email preferences, webhooks
- **API Keys**: Generate/manage API tokens
- **Billing**: Subscription management (future)

## 🎨 Design System Application
- **Glassmorphism**: 20px blur, 16px radius, subtle borders
- **Color Scheme**: Primary blue (#2563EB), accent cyan (#06B6D4)
- **Typography**: Inter font, clear hierarchy
- **Spacing**: 4px grid system
- **Shadows**: Soft elevation for cards and modals

## 🔄 Prototipado Navegable
- **Flows Principales**:
  - Login → Dashboard
  - Dashboard → Script execution → Results
  - Project → Test run → Report
  - Chat IA → Document reference → Script generation
- **Micro-interactions**: Hover states, loading animations
- **Responsive Breakpoints**: Desktop (1200px+), Tablet (768-1199px)

## ♿ Accesibilidad
- **Navigation**: Keyboard shortcuts, focus management
- **Screen Readers**: ARIA labels, landmarks
- **High Contrast**: All text meets WCAG AA
- **Motion**: Respects prefers-reduced-motion

## 📱 Responsive Behavior
- **Desktop (1200px+)**: Full 3-column layouts, sidebar navigation
- **Tablet (768-1199px)**: Collapsed sidebar, stacked content
- **Mobile**: Redirect to mobile app or simplified mobile web

## 🔄 Estados y Feedback
- **Loading**: Skeleton screens, progress indicators
- **Error**: Error boundaries, retry mechanisms
- **Success**: Toast notifications, confetti animations
- **Empty States**: Helpful illustrations and CTAs

## 🎯 Key Interactions
- **Navigation**: Smooth transitions between sections
- **Forms**: Real-time validation, autocomplete
- **Data Tables**: Sort, filter, search, export
- **Charts**: Interactive tooltips, drill-down
- **Modals**: Focus trap, ESC close, backdrop click

## 📋 Implementation Checklist
- [ ] Header component with navigation
- [ ] Footer with links and info
- [ ] All 8 main screens designed
- [ ] Responsive breakpoints implemented
- [ ] Prototype flows connected
- [ ] Accessibility compliance verified
- [ ] Glassmorphism effects applied
- [ ] Theme switching functional
- [ ] Loading states and feedback
- [ ] Mobile considerations addressed
