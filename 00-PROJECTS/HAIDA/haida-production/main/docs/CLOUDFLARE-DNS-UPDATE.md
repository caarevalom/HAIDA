# Actualización DNS en Cloudflare para Vercel

**Fecha**: ++34662652300
**Acción**: Actualizar registros DNS de Vercel

---

## Registros a Actualizar

### 1. haida.stayarta.com (Frontend)

#### Paso 1: Actualizar CNAME
1. Ir a: Cloudflare Dashboard → stayarta.com → DNS → Records
2. Buscar registro CNAME: `haida`
3. Click "Edit"
4. Cambiar valor de:
   ```
   haida-frontend.vercel.app
   ```
   a:
   ```
   b562e8d42f8787b9.vercel-dns-017.com
   ```
5. **Proxy status**: DNS only (⚪ gris)
6. Click "Save"

#### Paso 2: Agregar TXT de verificación
1. Click "Add record"
2. Tipo: `TXT`
3. Name: `_vercel`
4. Content: `vc-domain-verify=haida.stayarta.com,277348261c53ed75e7d8`
5. TTL: Auto
6. Proxy: DNS only
7. Click "Save"

---

### 2. haidapi.stayarta.com (Backend API)

#### Paso 1: Actualizar CNAME
1. Buscar registro CNAME: `haidapi`
2. Click "Edit"
3. Cambiar valor de:
   ```
   haida-one.vercel.app
   ```
   a:
   ```
   a092a36a9f4d6d0d.vercel-dns-017.com
   ```
4. **Proxy status**: DNS only (⚪ gris)
5. Click "Save"

#### Paso 2: Agregar TXT de verificación
1. Click "Add record"
2. Tipo: `TXT`
3. Name: `_vercel`
4. Content: `vc-domain-verify=haidapi.stayarta.com,957be63afa2987f9c41b`
5. TTL: Auto
6. Proxy: DNS only
7. Click "Save"

---

## Resultado Final en Cloudflare

Deberías tener estos registros:

```
┌──────────┬─────────────┬─────────────────────────────────────────────┬──────────┐
│ Type     │ Name        │ Content                                     │ Proxy    │
├──────────┼─────────────┼─────────────────────────────────────────────┼──────────┤
│ CNAME    │ haida       │ b562e8d42f8787b9.vercel-dns-017.com         │ DNS only │
│ TXT      │ _vercel     │ vc-domain-verify=haida.stayarta.com,...     │ DNS only │
│ CNAME    │ haidapi     │ a092a36a9f4d6d0d.vercel-dns-017.com         │ DNS only │
│ TXT      │ _vercel     │ vc-domain-verify=haidapi.stayarta.com,...   │ DNS only │
│ CNAME    │ bothaida    │ haida-api.railway.app                       │ DNS only │
└──────────┴─────────────┴─────────────────────────────────────────────┴──────────┘
```

**IMPORTANTE**:
- ⚠️ NO activar el proxy de Cloudflare (debe ser DNS only)
- ⚠️ Los registros TXT `_vercel` son para verificación de dominio en Vercel

---

## Verificación

Después de actualizar, espera 1-2 minutos y verifica:

### Opción 1: Comando dig
```bash
# Verificar CNAME
dig haida.stayarta.com CNAME
dig haidapi.stayarta.com CNAME

# Debe mostrar:
# haida.stayarta.com. IN CNAME b562e8d42f8787b9.vercel-dns-017.com.
# haidapi.stayarta.com. IN CNAME a092a36a9f4d6d0d.vercel-dns-017.com.

# Verificar TXT
dig _vercel.haida.stayarta.com TXT
dig _vercel.haidapi.stayarta.com TXT
```

### Opción 2: Online Tools
- https://dnschecker.org/#CNAME/haida.stayarta.com
- https://dnschecker.org/#CNAME/haidapi.stayarta.com

### Opción 3: Vercel Dashboard
Una vez propagados los DNS, Vercel verificará automáticamente:
- https://vercel.com/carlos-arevalos-projects-cf7340ea/haida-frontend/settings/domains
- https://vercel.com/carlos-arevalos-projects-cf7340ea/haida/settings/domains

Deberías ver: ✅ Valid Configuration

---

## Propagación DNS

**Tiempo estimado**: 1-5 minutos (Cloudflare es muy rápido)

**Monitorear**:
```bash
watch -n 5 'dig haida.stayarta.com CNAME +short'
```

Cuando muestre `b562e8d42f8787b9.vercel-dns-017.com.` → ✅ Propagado

---

## Siguiente Paso

Una vez que Vercel muestre "✅ Valid Configuration":

1. Redeploy proyectos:
   ```bash
   cd /Users/carlosa/Hiberus/HAIDA-PROJECT/Figma
   vercel --prod --token VcGSlMUzEPrxUryMWq67dvLq

   cd /Users/carlosa/Hiberus/HAIDA-PROJECT
   vercel --prod --token VcGSlMUzEPrxUryMWq67dvLq
   ```

2. Verificar sitios en vivo:
   ```bash
   curl -I https://haida.stayarta.com
   curl https://haidapi.stayarta.com/health
   ```

---

**Última actualización**: ++34662652300:45
