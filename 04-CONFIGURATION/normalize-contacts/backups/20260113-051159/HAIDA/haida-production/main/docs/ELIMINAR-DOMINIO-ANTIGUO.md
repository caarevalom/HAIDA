# Eliminar Dominio Antiguo - haida.stayarta.com

**Fecha**: +34662652300
**Objetivo**: Eliminar referencias al dominio antiguo carlosarta.com

---

## 🎯 Paso 1: Eliminar DNS en Cloudflare

### 1.1 Acceder a Cloudflare DNS

```
https://dash.cloudflare.com
→ Seleccionar dominio: carlosarta.com
→ DNS → Records
```

### 1.2 Eliminar Registro CNAME

Buscar y eliminar:

```
Tipo: CNAME
Nombre: haida
Apunta a: (algo relacionado con vercel.app)
```

**Pasos**:
1. Buscar el registro `haida` en la lista
2. Click en el registro para seleccionarlo
3. Click en "Delete" o el ícono de basura 🗑️
4. Confirmar la eliminación

### 1.3 Eliminar Registro TXT (si existe)

Si existe un registro TXT de verificación de Vercel:

```
Tipo: TXT
Nombre: _vercel
```

**Eliminar también** (mismo proceso que arriba)

---

## 🎯 Paso 2: Eliminar del Backend (si existe)

### 2.1 Verificar si existe haidapi.stayarta.com

```bash
# Verificar si el dominio existe
dig haidapi.stayarta.com CNAME +short
```

### 2.2 Si existe, eliminar en Cloudflare

```
Tipo: CNAME
Nombre: back
Apunta a: (algo relacionado con vercel.app)
```

**Eliminar** igual que el paso anterior

---

## 🎯 Paso 3: Verificar Eliminación

### 3.1 Esperar Propagación DNS (1-5 minutos)

```bash
# Verificar que ya no resuelve
dig haida.stayarta.com +short

# Resultado esperado: (vacío o NXDOMAIN)
```

### 3.2 Verificar en Navegador

```bash
# Después de 5 minutos, probar:
curl https://haida.stayarta.com

# Resultado esperado: Connection error o DNS resolution failed
```

---

## 🎯 Paso 4: Actualizar Referencias (Opcional)

### 4.1 Actualizar Documentación

Si hay referencias a `haida.stayarta.com` en documentación:

```bash
# Buscar en el proyecto
grep -r "haida.stayarta.com" /Users/carlosa/Hiberus/HAIDA-PROJECT/

# Reemplazar con haida.stayarta.com
```

### 4.2 Archivos que pueden tener referencias:

- README.md
- Documentación en docs/
- Archivos de configuración (.md, .txt)
- Scripts de deployment

---

## ✅ Checklist de Eliminación

```
[ ] DNS: haida.stayarta.com eliminado de Cloudflare
[ ] DNS: _vercel TXT eliminado (si existía)
[ ] DNS: haidapi.stayarta.com eliminado (si existía)
[ ] Propagación: Esperados 5 minutos
[ ] Verificación: dig muestra vacío
[ ] Verificación: curl da error de conexión
[ ] Documentación: Referencias actualizadas (opcional)
```

---

## 🔍 Verificación Final

### Comandos de Verificación:

```bash
# 1. Verificar que no resuelve
dig haida.stayarta.com

# 2. Verificar que el nuevo funciona
curl -I https://haida.stayarta.com

# 3. Verificar que no hay referencias en código
cd /Users/carlosa/Hiberus/HAIDA-PROJECT
grep -r "carlosarta.com" . --exclude-dir=node_modules --exclude-dir=.git
```

### Resultado Esperado:

```bash
✅ haida.stayarta.com: No resuelve (NXDOMAIN)
✅ haida.stayarta.com: HTTP 200 OK
✅ Código: Sin referencias a carlosarta.com
```

---

## ⚠️ Importante

**NO elimines**:
- El dominio principal `carlosarta.com` (solo el subdominio `haida`)
- Otros subdominios que puedan estar en uso

**SÍ elimina**:
- `haida.stayarta.com`
- `haidapi.stayarta.com` (si existe y no se usa)
- Registros TXT `_vercel` asociados a estos subdominios

---

## 🎯 Dominios Actuales Activos

Después de la eliminación, solo deberías tener:

### Frontend:
```
✅ haida.stayarta.com → Vercel (haida-frontend)
```

### Backend:
```
⏳ haidapi.stayarta.com → Por configurar en Vercel
```

### Bot:
```
✅ bothaida.stayarta.com → Railway
```

---

## 📞 Soporte

Si necesitas revertir:
1. Volver a crear los registros CNAME en Cloudflare
2. Apuntar a los valores originales de Vercel
3. Esperar propagación DNS (5-30 minutos)

---

**Tiempo estimado**: 10 minutos (incluye propagación DNS)
**Dificultad**: Baja
**Reversible**: Sí (recreando los registros DNS)
