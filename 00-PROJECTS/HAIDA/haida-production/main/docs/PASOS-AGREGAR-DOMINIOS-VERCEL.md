# Pasos para Agregar Dominios en Vercel Dashboard

**Problema**: CLI retorna 403 - Se requiere configuración manual
**Solución**: Configurar dominios directamente en Vercel Dashboard

---

## 🎯 PASO 1: Frontend (haida.stayarta.com)

### 1.1 Abrir Configuración de Dominios
```
https://vercel.com/carlos-arevalos-projects-cf7340ea/haida-frontend/settings/domains
```

### 1.2 Agregar Dominio
1. En el campo "Domain", escribir exactamente:
   ```
   haida.stayarta.com
   ```

2. Click botón **"Add"**

3. Vercel mostrará una pantalla con instrucciones DNS. Deberías ver:
   ```
   CNAME: haida → b562e8d42f8787b9.vercel-dns-017.com
   TXT: _vercel → vc-domain-verify=haida.stayarta.com,277348261c53ed75e7d8
   ```

4. **NO CIERRES ESTA VENTANA** - Necesitarás estos valores

---

## 🎯 PASO 2: Backend (haidapi.stayarta.com)

### 2.1 Abrir Configuración de Dominios
```
https://vercel.com/carlos-arevalos-projects-cf7340ea/haida/settings/domains
```

### 2.2 Agregar Dominio
1. En el campo "Domain", escribir:
   ```
   haidapi.stayarta.com
   ```

2. Click **"Add"**

3. Vercel mostrará:
   ```
   CNAME: haidapi → a092a36a9f4d6d0d.vercel-dns-017.com
   TXT: _vercel → vc-domain-verify=haidapi.stayarta.com,957be63afa2987f9c41b
   ```

---

## 🎯 PASO 3: Actualizar DNS en Cloudflare

### 3.1 Abrir Cloudflare DNS
```
https://dash.cloudflare.com/
→ Seleccionar "stayarta.com"
→ DNS → Records
```

### 3.2 Actualizar Registro: haida

**Buscar el registro CNAME existente:**
- Nombre: `haida`
- Valor actual: `haida-frontend.vercel.app`

**Click "Edit" y cambiar a:**
- Valor: `b562e8d42f8787b9.vercel-dns-017.com`
- Proxy status: **DNS only** (⚪ gris, NO naranja)
- Click **"Save"**

**Agregar registro TXT:**
- Click **"Add record"**
- Type: `TXT`
- Name: `_vercel`
- Content: `vc-domain-verify=haida.stayarta.com,277348261c53ed75e7d8`
- Proxy status: DNS only
- Click **"Save"**

### 3.3 Actualizar Registro: haidapi

**Buscar el registro CNAME existente:**
- Nombre: `haidapi`
- Valor actual: `haida-one.vercel.app`

**Click "Edit" y cambiar a:**
- Valor: `a092a36a9f4d6d0d.vercel-dns-017.com`
- Proxy status: **DNS only** (⚪ gris)
- Click **"Save"**

**Agregar registro TXT:**
- Click **"Add record"**
- Type: `TXT`
- Name: `_vercel`
- Content: `vc-domain-verify=haidapi.stayarta.com,957be63afa2987f9c41b`
- Proxy status: DNS only
- Click **"Save"**

---

## 🎯 PASO 4: Esperar Verificación (1-2 minutos)

### 4.1 Volver a Vercel Dashboard

**Frontend:**
```
https://vercel.com/carlos-arevalos-projects-cf7340ea/haida-frontend/settings/domains
```

Deberías ver:
```
✅ haida.stayarta.com - Valid Configuration
```

**Backend:**
```
https://vercel.com/carlos-arevalos-projects-cf7340ea/haida/settings/domains
```

Deberías ver:
```
✅ haidapi.stayarta.com - Valid Configuration
```

### 4.2 Si ves "Pending Verification"
- Espera 30 segundos más
- Refresh la página
- Vercel verifica automáticamente cada 30 segundos

### 4.3 Si ves error de DNS
```bash
# Verifica que el DNS esté actualizado
dig haida.stayarta.com CNAME +short
# Debe mostrar: b562e8d42f8787b9.vercel-dns-017.com.

dig haidapi.stayarta.com CNAME +short
# Debe mostrar: a092a36a9f4d6d0d.vercel-dns-017.com.
```

---

## 🎯 PASO 5: Configurar como Primary Domain

### 5.1 Frontend
En: https://vercel.com/carlos-arevalos-projects-cf7340ea/haida-frontend/settings/domains

1. Buscar `haida.stayarta.com` en la lista
2. Click en los 3 puntos "..." al lado del dominio
3. Click **"Set as Primary Domain"**
4. Confirmar

### 5.2 Backend
En: https://vercel.com/carlos-arevalos-projects-cf7340ea/haida/settings/domains

1. Buscar `haidapi.stayarta.com`
2. Click "..." → **"Set as Primary Domain"**
3. Confirmar

---

## 🎯 PASO 6: Forzar Redeploy

Una vez configurados como Primary Domain, forzar nuevo deployment:

```bash
# Frontend
cd /Users/carlosa/Hiberus/HAIDA-PROJECT/Figma
vercel --prod --force --token VcGSlMUzEPrxUryMWq67dvLq

# Backend
cd /Users/carlosa/Hiberus/HAIDA-PROJECT
vercel --prod --force --token VcGSlMUzEPrxUryMWq67dvLq
```

---

## 🎯 PASO 7: Verificación Final

### 7.1 Verificar Frontend
```bash
# Debe devolver 200 OK y el HTML de la app
curl -I https://haida.stayarta.com

# Debe redirigir de HTTP a HTTPS
curl -I http://haida.stayarta.com
```

### 7.2 Verificar Backend
```bash
# Debe devolver JSON con status
curl https://haidapi.stayarta.com/health

# Verificar Entra status
curl https://haidapi.stayarta.com/entra/status
```

### 7.3 Verificar en Navegador
1. Abrir: https://haida.stayarta.com
   - ✅ Debe cargar el frontend de HAIDA
   - ✅ SSL debe estar activo (candado verde)

2. Abrir: https://haidapi.stayarta.com/health
   - ✅ Debe mostrar JSON de health check

---

## ⚠️ Troubleshooting

### Error: "Invalid Configuration" en Vercel
**Causa**: DNS no actualizado o no propagado

**Solución**:
```bash
# Verificar DNS
dig haida.stayarta.com CNAME +short

# Si NO muestra b562e8d42f8787b9.vercel-dns-017.com
# → Volver a Cloudflare y verificar que el CNAME esté correcto
```

### Error: 404 después de configurar
**Causa**: Deployment antiguo en caché

**Solución**:
```bash
# Forzar redeploy
cd /Users/carlosa/Hiberus/HAIDA-PROJECT/Figma
vercel --prod --force --token VcGSlMUzEPrxUryMWq67dvLq

# Limpiar caché del navegador
# Chrome: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
```

### Error: SSL Certificate Invalid
**Causa**: Vercel aún está generando el certificado

**Solución**:
- Esperar 2-5 minutos
- Vercel genera SSL automáticamente
- No requiere configuración adicional

### Proxy de Cloudflare Activado (Naranja)
**Problema**: El proxy de Cloudflare interfiere con Vercel

**Solución**:
1. Ir a Cloudflare DNS
2. Click en el icono naranja (Proxied)
3. Cambiar a gris (DNS only)
4. Guardar

---

## ✅ Checklist Final

```
[ ] Dominio haida.stayarta.com agregado en Vercel
[ ] Dominio haidapi.stayarta.com agregado en Vercel
[ ] CNAME haida actualizado en Cloudflare
[ ] CNAME haidapi actualizado en Cloudflare
[ ] TXT _vercel agregado para haida
[ ] TXT _vercel agregado para haidapi
[ ] Proxy DNS only (gris) en Cloudflare
[ ] Vercel muestra "Valid Configuration"
[ ] haida.stayarta.com configurado como Primary
[ ] haidapi.stayarta.com configurado como Primary
[ ] Frontend redeployado
[ ] Backend redeployado
[ ] https://haida.stayarta.com carga correctamente
[ ] https://haidapi.stayarta.com/health responde
[ ] SSL activo (candado verde)
```

---

**Tiempo estimado total**: 5-10 minutos
**Dificultad**: Baja
**Requisitos**: Acceso a Vercel Dashboard y Cloudflare Dashboard
