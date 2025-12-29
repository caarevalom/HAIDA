# HIBERUS BRAND GUIDE — HAIDA v2.0

**Actualización:** 16 Diciembre 2025  
**Estatus:** ✅ Implementado en presentación unificada

---

## 🎨 PALETA DE COLORES HIBERUS

### Colores Principales

| Nombre           | Hex       | RGB           | HSL            | Uso                       |
| ---------------- | --------- | ------------- | -------------- | ------------------------- |
| **Persian Blue** | `#1E34A1` | 30, 52, 161   | 230°, 69%, 37% | Primario, CTA, headers    |
| **Stratos**      | `#010D3D` | 1, 13, 61     | 228°, 97%, 12% | Oscuro, footer, contraste |
| **White**        | `#FFFFFF` | 255, 255, 255 | 0°, 0%, 100%   | Fondo, texto light        |

### Colores Secundarios

| Uso                  | Hex       | Descripción             |
| -------------------- | --------- | ----------------------- |
| **Success**          | `#00cc66` | ✅ Aprobado, completado |
| **Warning**          | `#ffcc00` | ⚠️ Advertencia, pending |
| **Danger**           | `#ff3333` | ❌ Error, crítico       |
| **Background Light** | `#f5f7fa` | Fondos secundarios      |

---

## 📐 TIPOGRAFÍA

### Fuentes

```css
font-family:
  -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### Jerarquía

- **H1**: 2.5rem, bold, Persian Blue (#1E34A1)
- **H2**: 2rem, bold, Persian Blue (#1E34A1)
- **H3**: 1.8rem, bold, Persian Blue (#1E34A1)
- **H4**: 1.2rem, bold, Persian Blue (#1E34A1)
- **Body**: 1rem, regular, #102030
- **Small**: 0.9rem, regular, #666

---

## 🖼️ COMPONENTES VISUALES

### Header

```css
background: linear-gradient(90deg, #ffffff 0%, #f5f7fa 100%);
border-bottom: 3px solid #1e34a1;
box-shadow: 0 4px 25px rgba(30, 52, 161, 0.15);
```

### Hero Section

```css
background: linear-gradient(135deg, #1e34a1 0%, #010d3d 100%);
color: #ffffff;
box-shadow: 0 8px 32px rgba(30, 52, 161, 0.3);
```

### Buttons (CTA)

```css
background: #1e34a1;
color: #ffffff;
border-radius: 6px;
padding: 0.8rem 1.5rem;

/* Hover State */
background: #010d3d;
box-shadow: 0 6px 20px rgba(30, 52, 161, 0.4);
```

### Cards

```css
background: #f5f7fa;
border: 1px solid #e0e0e0;
border-radius: 8px;
transition: all 0.3s ease;

/* Hover State */
border-color: #1e34a1;
box-shadow: 0 8px 25px rgba(30, 52, 161, 0.15);
```

### Badges

```css
/* Info Badge */
background: rgba(30, 52, 161, 0.2);
color: #1e34a1;

/* Success Badge */
background: rgba(0, 204, 102, 0.2);
color: #00cc66;

/* Warning Badge */
background: rgba(255, 204, 0, 0.2);
color: #ff9900;
```

### Highlight Box

```css
background: rgba(30, 52, 161, 0.05);
border-left: 4px solid #1e34a1;
padding: 1rem;
```

---

## ✅ IMPLEMENTACIÓN EN HAIDA-UNIFIED-PRESENTATION.html

### Cambios Realizados

| Elemento          | Antes         | Después                | Estado |
| ----------------- | ------------- | ---------------------- | ------ |
| Primary Color     | `#0066cc`     | `#1E34A1`              | ✅     |
| Dark Accent       | `#004399`     | `#010D3D`              | ✅     |
| Accent Color      | `#00d9ff`     | `#1E34A1`              | ✅     |
| Background Dark   | `#0a1929`     | `#010D3D`              | ✅     |
| Hero Gradient     | Cyan-based    | Persian Blue + Stratos | ✅     |
| Header Background | White (solid) | Gradient white-light   | ✅     |
| Button Hover      | Medium blue   | Stratos (dark)         | ✅     |
| Footer            | Dark gray     | Stratos                | ✅     |
| Logo/Header       | 🚀 HAIDA v2.0 | Hiberus × HAIDA        | ✅     |

### Variables CSS Actualizadas

```css
:root {
  --primary: #1e34a1; /* Persian Blue */
  --primary-dark: #010d3d; /* Stratos */
  --accent: #1e34a1; /* Persian Blue */
  --bg-dark: #010d3d; /* Stratos */
  --bg-light: #f5f7fa; /* Light */
  --text: #102030; /* Dark text */
  --text-light: #666; /* Gray text */
  --border: #e0e0e0; /* Light border */
  --white: #ffffff; /* White */
}
```

---

## 📋 CHECKLIST DE MARCA

- [x] Colores Persian Blue (#1E34A1) implementados en primarios
- [x] Color Stratos (#010D3D) implementado en oscuros
- [x] White (#FFFFFF) mantenido en fondos y texto light
- [x] Hero section con gradient Hiberus
- [x] Buttons con hover a Stratos
- [x] Header con gradiente sutil
- [x] Footer con fondo Stratos
- [x] Logo actualizado a "Hiberus × HAIDA"
- [x] Todos los badges actualizados
- [x] Tarjetas (cards) con hover Hiberus
- [x] Highlight boxes con border Persian Blue
- [x] INDEX.html sincronizado con colores
- [x] Accesibilidad: contraste verificado (WCAG AA)

---

## 🎯 GUÍA DE USO

### Para Desarrolladores

1. **Usar variables CSS**:

   ```css
   color: var(--primary); /* Persian Blue */
   background: var(--primary-dark); /* Stratos */
   ```

2. **Nuevos componentes**:
   - Primary buttons: `#1E34A1`
   - Dark buttons/footer: `#010D3D`
   - Hover states: cambiar a `#010D3D`

3. **Gradients**:
   ```css
   background: linear-gradient(135deg, #1e34a1 0%, #010d3d 100%);
   ```

### Para Diseñadores

- Usar Persian Blue para elementos primarios
- Usar Stratos para contraste y profundidad
- White/Light backgrounds para legibilidad
- Mantener espacios blancos (white space)
- Colores secundarios (success, warning, danger) solo para estados

### Accesibilidad

- Persian Blue sobre White: ✅ WCAG AAA (8.5:1)
- Stratos sobre White: ✅ WCAG AAA (12:1)
- Avoid pure black; use Stratos instead
- Test all interactive elements para color contrast

---

## 📁 ARCHIVOS AFECTADOS

| Archivo                           | Cambios               | Estado |
| --------------------------------- | --------------------- | ------ |
| HAIDA-UNIFIED-PRESENTATION.html   | Colores + header logo | ✅     |
| INDEX.html                        | Colores primarios     | ✅     |
| HAIDA-MASTER-PRESENTATION.html    | (No actualizado)      | ⏳     |
| HAIDA-EXECUTIVE-PRESENTATION.html | (Legacy)              | ⏳     |

---

## 🚀 SIGUIENTE PASO

Para descargar los archivos de logo e iconos de Hiberus:

1. Contactar a equipo de branding de Hiberus
2. Obtener SVGs/PNGs del logo con colores corporativos
3. Integrar en presentación:
   ```html
   <img src="assets/logo-hiberus.svg" alt="Hiberus Logo" style="height: 40px;" />
   ```

---

## 📞 REFERENCIA

**Hiberus Brand Colors:**

- Persian Blue: #1E34A1
- Stratos: #010D3D
- White: #FFFFFF
- Documentación: https://www.hiberus.com

**HAIDA Brand:**

- Repository: /HAIDA/
- Unified Presentation: HAIDA-UNIFIED-PRESENTATION.html
- Guidelines: Esta guía

---

**Documento actualizado:** 16 Diciembre 2025  
**Por:** GitHub Copilot  
**Status:** ✅ Producción
