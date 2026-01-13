# 🔐 Entorno LOCAL Y SEGURO - Inicio Rápido

## Tu configuración actual

✅ **Servidor**: Completamente LOCAL en `http://localhost:3000`  
✅ **Datos**: Ninguno transmitido fuera de tu portátil  
✅ **Seguridad**: Corporativo-compatible, sin conexiones externas

---

## 🚀 Opción 1: Todo automático (recomendado)

```powershell
# Abre Terminal en VS Code (Ctrl + `)
# Ejecuta este comando:

powershell -NoProfile -ExecutionPolicy Bypass -File .\run-qa-local.ps1
```

**Esto hace todo automáticamente:**
1. ✅ Configura PATH temporal (Node.js portable)
2. ✅ Inicia servidor mock local (puerto 3000)
3. ✅ Verifica que el servidor está corriendo
4. ✅ Instala dependencias si faltan
5. ✅ Ejecuta tests Web E2E
6. ✅ Detiene el servidor automáticamente
7. ✅ Restaura PATH original

---

## 🚀 Opción 2: Dos terminales (mayor control)

### Terminal 1: Iniciar servidor (mantener abierta)
```powershell
# Configura Node.js
$env:PATH = "C:\Users\CarlosArturoArevaloM\Documents\Proyectos\node-v24.12.0-win-x64;$env:PATH"

# Inicia el servidor
node tools/mock-server.js

# Verás:
# ╔════════════════════════════════════════════════════════════╗
# ║  QA Testing - Servidor Local Seguro                       ║
# ║  URL: http://localhost:3000                                 ║
# ║  Estado: Ejecutándose                                       ║
# ╚════════════════════════════════════════════════════════════╝
```

### Terminal 2: Ejecutar tests
```powershell
# En otra terminal (Terminal 1 sigue abierta):

# Ejecutar todos los tests
npm run test:web

# O solo UI interactivo
npm run test:web:ui

# O tests API
npm run test:api
```

---

## 🚀 Opción 3: Parámetros personalizados

```powershell
# Solo servidor (no ejecuta tests)
powershell -NoProfile -ExecutionPolicy Bypass -File .\run-qa-local.ps1 -ServerOnly

# Omitir servidor (asume que está corriendo)
powershell -NoProfile -ExecutionPolicy Bypass -File .\run-qa-local.ps1 -SkipServer

# Solo tests Web (sin API ni Lighthouse)
powershell -NoProfile -ExecutionPolicy Bypass -File .\run-qa-local.ps1 -WebOnly

# Puerto diferente (si 3000 está ocupado)
powershell -NoProfile -ExecutionPolicy Bypass -File .\run-qa-local.ps1 -Port 3001
```

---

## ✅ Verificación rápida

### 1. Comprobar que está en localhost
```powershell
Get-Content .env
# Debe mostrar:
# BASE_URL=http://localhost:3000
```

### 2. Probar que el servidor responde
```powershell
curl http://localhost:3000
# Debería devolver HTML
```

### 3. Probar una ruta específica
```powershell
curl http://localhost:3000/api
# Debería devolver JSON: {"status":"ok",...}
```

---

## 🔒 Seguridad garantizada

| Aspecto | Estado |
|--------|--------|
| Conexión externa | ❌ BLOQUEADA |
| Datos transmitidos | ❌ NINGUNO |
| Servidores corporativos | ❌ NO CONTACTADOS |
| Internet requerido | ❌ NO |
| Datos sensibles | ❌ NINGUNO USADO |
| Auditable | ✅ SI |
| Local-only | ✅ SI |

---

## 📊 Estructura de servidor

El servidor mock proporciona estas rutas para pruebas:

```
GET  http://localhost:3000/        → Página principal (200 OK)
GET  http://localhost:3000/page1   → Página 1 (200 OK)
GET  http://localhost:3000/page2   → Página 2 (200 OK)
GET  http://localhost:3000/api     → JSON API (200 OK)
GET  http://localhost:3000/broken  → Enlace roto (404 NOT FOUND)
```

Cada ruta está optimizada para testing (WCAG, accessibilidad, headers de seguridad).

---

## 🛠️ Solución de problemas

### Puerto 3000 ocupado
```powershell
# Opción A: Cambiar a otro puerto
powershell -NoProfile -ExecutionPolicy Bypass -File .\run-qa-local.ps1 -Port 3001

# Opción B: Matar proceso node existente
Get-Process node | Stop-Process -Force
```

### Servidor no responde
```powershell
# Verificar que está corriendo
Get-Process node

# Si no está: iniciarlo manualmente
node tools/mock-server.js
```

### Tests fallan contra servidor
```powershell
# 1. Verificar servidor está vivo
curl -I http://localhost:3000

# 2. Ejecutar tests en modo verbose
npx playwright test --debug

# 3. Abrir Playwright UI
npm run test:web:ui
```

---

## 📚 Recursos

- **Servidor mock**: `tools/mock-server.js`
- **Script tests**: `run-qa-local.ps1`
- **Configuración**: `.env` (BASE_URL=http://localhost:3000)
- **Guía completa**: `SECURITY-LOCAL-TESTING.md`

---

## ✨ Próximos pasos

1. **Ahora**: Ejecuta `powershell -NoProfile -ExecutionPolicy Bypass -File .\run-qa-local.ps1`
2. **Espera** a que terminen los tests (~5 minutos)
3. **Revisa** el reporte en `./playwright-report` (se abre automáticamente)

---

**Configuración completada**: ✅ Local seguro, corporativo-compatible, sin conexiones externas
