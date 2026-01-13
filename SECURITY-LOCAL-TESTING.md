# Configuración LOCAL Y SEGURA para testing E2E

## ⚠️ IMPORTANTE - Cumplimiento Corporativo

Este proyecto está configurado **EXCLUSIVAMENTE para testing local** en tu portátil corporativo sin conexión a servidores externos.

### ✅ Configuración de seguridad actual

**Archivo: `.env`**

```dotenv
BASE_URL=http://localhost:3000
```

**Servidor:** Totalmente local en `http://localhost:3000` (sin internet)

### 🔐 Medidas de seguridad implementadas

1. **Sin conexión externa**
   - El servidor mock está en localhost (127.0.0.1)
   - No se conecta a internet ni a servidores corporativos
   - Todos los datos permanecen en tu máquina

2. **Sin datos sensibles**
   - Las pruebas usan datos de ejemplo ficticios
   - No se transmite información personal o corporativa
   - No hay cookies ni tracking

3. **Headers de seguridad**
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY
   - X-XSS-Protection: 1; mode=block

4. **Auditable**
   - Todo el código está en el repositorio local
   - Puedes revisar exactamente qué hace cada test
   - No hay procesos ocultos

---

## 🚀 Uso del servidor local

### Opción A: Ejecutar servidor + tests automáticamente

```powershell
# Terminal 1: Inicia el servidor
node tools/mock-server.js

# Terminal 2 (mientras el servidor está corriendo):
powershell -NoProfile -ExecutionPolicy Bypass -File .\run-qa.ps1
```

### Opción B: Servidor manual + tests manuales

```powershell
# Terminal 1: Iniciar servidor (mantener abierta)
node tools/mock-server.js

# Terminal 2: Ejecutar tests específicos
npm run test:web        # Playwright E2E
npm run test:web:ui     # Playwright UI
npm run test:api        # Newman API
```

### Opción C: Script todo-en-uno (recomendado)

```powershell
# Ejecutar script que inicia servidor + tests
.\run-qa-local.ps1
```

---

## 📋 Verificación de seguridad

### Comprobar que está en localhost

```powershell
# Verificar que .env usa localhost
Get-Content .env

# Debería mostrar:
# BASE_URL=http://localhost:3000
```

### Comprobar que el servidor local está corriendo

```powershell
# Mientras el servidor está activo:
curl http://localhost:3000

# Debería devolver HTML (página de bienvenida)
```

### Monitorear conexiones de red (opcional)

Si necesitas verificar que NO hay conexiones salientes:

```powershell
# En PowerShell como admin (opcional):
# netstat -ano | findstr ESTABLISHED | findstr "node.exe"
# Debería mostrar solo conexiones en 127.0.0.1 o localhost
```

---

## 🛡️ Rutas de prueba disponibles

El servidor mock proporciona estas rutas para testing:

- `GET /` — Página principal (HTML + estilos)
- `GET /page1` — Segunda página
- `GET /page2` — Tercera página
- `GET /api` — Respuesta JSON de prueba
- `GET /broken` — Enlace roto (retorna 404 para testing)

### Ejemplos de testing

```bash
# Test smoke básico
curl http://localhost:3000/

# Test de API
curl http://localhost:3000/api

# Test de enlace roto (debería ser 404)
curl -I http://localhost:3000/broken
```

---

## 📊 Tests que correrán contra el servidor local

### 1. Smoke Tests (`tests/web-e2e/smoke.spec.ts`)

- ✅ Home carga sin errores
- ✅ Status HTTP correcto (200)
- ✅ No hay errores de consola
- ✅ No hay imágenes no cargadas
- ✅ No hay overflow horizontal
- ✅ Enlaces internos funcionan

### 2. Accesibilidad WCAG (`tests/web-e2e/accessibility.spec.ts`)

- ✅ Validación axe-core (WCAG 2A)
- ✅ No hay violaciones de accesibilidad
- ✅ Etiquetas HTML semánticas correctas

### 3. API (`tests/api/collection.json`)

- ✅ GET /api retorna 200
- ✅ JSON válido

---

## ⚡ Rendimiento esperado

Ejecutando contra el servidor local:

| Métrica         | Esperado       |
| --------------- | -------------- |
| Tiempo setup    | ~10 segundos   |
| Tiempo tests    | ~2-3 minutos   |
| Tiempo reportes | ~1 minuto      |
| **Total**       | **~5 minutos** |

---

## 🚨 Solución de problemas

### "Puerto 3000 ya está en uso"

```powershell
# Encontrar y matar proceso en puerto 3000
netstat -ano | findstr ":3000"
# Luego: taskkill /PID <PID> /F
# O cambiar BASE_URL en .env a otro puerto (3001, 3002, etc)
```

### "node: command not found"

```powershell
# Asegurar que Node.js portable está en PATH
$env:PATH = "C:\Users\CarlosArturoArevaloM\Documents\Proyectos\node-v24.12.0-win-x64;$env:PATH"
node tools/mock-server.js
```

### "No se pueden conectar a los tests"

```powershell
# 1. Verificar servidor está corriendo
curl http://localhost:3000

# 2. Verificar .env tiene BASE_URL correcto
Get-Content .env

# 3. Verificar Playwright puede acceder
npx playwright codegen http://localhost:3000
```

---

## 📝 Documentación de cumplimiento

Este entorno está diseñado para cumplir con:

- ✅ **Políticas corporativas de seguridad**: Sin conexión externa
- ✅ **RGPD/GDPR**: Sin datos personales recopilados
- ✅ **Auditoría de seguridad**: Totalmente auditable y local
- ✅ **Testing independiente**: No depende de servidores terceros

---

## 🔒 Notas finales

1. **Este servidor es SOLO para testing local**
   - No intentes usarlo para servir datos reales
   - No expongas este servidor a la red
   - No lo uses con datos corporativos sensibles

2. **El puerto 3000 es estándar para desarrollo local**
   - No es accesible desde la red corporativa
   - Solo tu máquina puede conectarse

3. **Los tests se ejecutan en el mismo dispositivo**
   - Dentro de Playwright (navegador controlado)
   - Sin transmisión de datos

---

**Última actualización**: 15/12/2025
**Seguridad validada**: ✅ Local-only, corporativo-compatible
