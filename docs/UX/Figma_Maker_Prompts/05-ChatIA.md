# 💬 Figma Maker IA Prompt - Chat IA Module HAIDA

## 🎯 Objetivo
Crear módulo Chat IA completo con layout 3-column, historial de hilos, integración Copilot Studio, panel M365, y export de conversaciones. Proveedor principal: Copilot Studio con fallback.

## 📐 Layout 3-Column

### 🗂️ Columna Izquierda (Historial)
- **Header**: "Conversaciones" + botón "Nueva"
- **Search**: Barra de búsqueda con filtros
- **Thread List**: Cards verticales con preview
- **Categories**: Recientes, Favoritos, Archivado
- **Actions**: Pin, Archive, Delete por thread

### 💬 Columna Central (Conversación)
- **Header**: Título hilo + menú (rename, export, delete)
- **Messages Area**: Scroll infinito hacia arriba
- **Message Types**:
  - User: Bubble derecha, avatar, timestamp
  - Assistant: Bubble izquierda, Copilot icon, typing indicator
  - System: Centered, muted color, info messages
- **Input Area**: Expandable text, attachments, send button
- **States**: Typing, Error, Loading responses

### 🔗 Columna Derecha (Panel M365)
- **Header**: "Microsoft 365" + toggle collapse
- **Quick Actions**: Outlook, Teams, OneDrive, SharePoint
- **Recent Items**: Últimos emails, reuniones, archivos
- **Deep Links**: Generar links contextuales
- **Token Status**: Estado conexión Copilot

## 🤖 Integración Copilot Studio

### Proveedores
- **Primary**: `copilot-studio` (Direct Line API)
- **Fallback**: `openai` o `anthropic`
- **Switching**: Auto-switch on failure, manual override

### Estados de Conexión
- **Connected**: Verde, "Copilot activo"
- **Connecting**: Amarillo, spinner
- **Disconnected**: Rojo, "Reconectando..."
- **Error**: Rojo, retry button

### Message Handling
- **Streaming**: Typing indicator durante respuesta
- **Attachments**: File upload, image preview, link cards
- **Formatting**: Markdown support, code highlighting
- **Context**: Document/script references automáticas

## 📝 Gestión de Hilos

### Thread Properties
- **ID**: UUID único
- **Title**: Auto-generated o manual
- **Provider**: Copilot/OpenAI/Anthropic
- **Status**: Active/Archived/Deleted
- **Metadata**: Token count, message count, last activity

### Thread Actions
- **Create**: Nueva conversación
- **Rename**: Editar título
- **Archive**: Mover a archivado
- **Delete**: Borrar permanentemente
- **Export**: JSON/Markdown/PDF
- **Share**: Generar link público

## 🔄 Estados y Feedback

### Message States
- **Sending**: Spinner + "Enviando..."
- **Delivered**: Checkmark
- **Read**: Double checkmark (si aplica)
- **Error**: Red exclamation + retry button

### Connection States
- **Typing**: "Copilot está escribiendo..."
- **Thinking**: Progress bar + "Analizando contexto..."
- **Error**: Error message + "Reintentar"
- **Offline**: "Modo offline - respuestas limitadas"

## 🎨 Design System Integration

### Glassmorphism
- **Background**: Blur 20px, semi-transparent
- **Borders**: Subtle 1px borders
- **Elevation**: Soft shadows para cards

### Message Bubbles
- **User**: Right-aligned, primary color, rounded
- **Assistant**: Left-aligned, surface color, rounded
- **System**: Center-aligned, muted, smaller

### Animations
- **Message Appear**: Fade in + slide up
- **Typing**: Pulsing dots
- **Scroll**: Smooth auto-scroll to new messages

## ♿ Accesibilidad

### Keyboard Navigation
- **Tab Order**: Logical through threads → messages → input
- **Shortcuts**:
  - Ctrl+N: Nueva conversación
  - Ctrl+K: Focus search
  - Enter: Send message
  - Escape: Close modals

### Screen Readers
- **Thread List**: "Conversación con [título]"
- **Messages**: "Mensaje de [usuario/asistente] a las [hora]"
- **Status**: Announce connection states

## 📱 Responsive Behavior

### Desktop (>1200px)
- **Full 3-column**: Sidebar (300px) + Chat (flex) + Panel (300px)
- **Resizable**: Drag to adjust column widths

### Tablet (768-1199px)
- **2-column**: Chat full + Panel collapsable
- **Sidebar**: Drawer desde izquierda

### Mobile (<768px)
- **Single column**: Chat full screen
- **Panel**: Bottom sheet
- **Sidebar**: Hidden, access via hamburger

## 🔗 Integración M365

### Panel Components
- **Outlook**: Próximas reuniones, emails sin leer
- **Teams**: Canales activos, menciones
- **OneDrive**: Archivos recientes
- **SharePoint**: Sitios relevantes
- **Planner**: Tareas pendientes
- **Copilot**: Estado conexión

### Deep Linking
- **Generate Links**: Para reuniones, archivos, emails
- **Context Injection**: Insertar links en conversación
- **Permission Handling**: OAuth scopes management

## 📊 Analytics y Métricas

### Usage Metrics
- **Message Count**: Por thread y usuario
- **Token Usage**: Para rate limiting
- **Response Times**: Assistant latency tracking
- **Error Rates**: Connection/success rates

### Thread Insights
- **Popular Topics**: Most discussed subjects
- **Script Generation**: Scripts created via chat
- **Document References**: Most accessed docs

## 🔒 Seguridad y Privacy

### Data Handling
- **Encryption**: End-to-end para messages sensibles
- **Retention**: Configurable message history
- **PII Masking**: Automatic detection y masking

### Access Control
- **Tenant Isolation**: Messages only visible to tenant members
- **Audit Logging**: All message operations logged
- **Export Controls**: Permission-based export restrictions

## 🚀 Performance

### Optimization
- **Lazy Loading**: Messages loaded in batches
- **WebSocket**: Real-time message delivery
- **Caching**: Recent threads cached locally
- **Compression**: Message payload optimization

### Offline Support
- **Queue Messages**: Send when reconnection established
- **Local Cache**: Recent conversations available offline
- **Sync Indicator**: Show offline/online status

## 📋 Implementation Checklist
- [ ] 3-column responsive layout
- [ ] Thread management system
- [ ] Copilot Studio integration
- [ ] M365 panel components
- [ ] Message handling and display
- [ ] Real-time updates
- [ ] Export functionality
- [ ] Accessibility compliance
- [ ] Performance optimization
- [ ] Security measures
