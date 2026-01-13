# Configuración SMTP para Supabase

## Opciones Recomendadas

### 1. **Resend** (Recomendado para Producción) ⭐

**Pros:**

- Gratuito hasta 3,000 emails/mes
- Configuración en 5 minutos
- Excelente deliverability
- Dashboard moderno y simple
- Templates de emails incluidos
- Dominio verificado automáticamente

**Configuración:**

```env
# En Supabase Dashboard → Project Settings → Auth → SMTP Settings
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=re_xxxxxxxxxxxxx  # API Key de Resend
SMTP_ADMIN_EMAIL=hola@stayarta.com
```

**Pasos:**

1. Crear cuenta en https://resend.com
2. Generar API Key
3. Configurar en Supabase Auth SMTP Settings
4. Verificar dominio (opcional, para producción)

---

### 2. **SendGrid** (Para Alto Volumen)

**Pros:**

- Gratuito hasta 100 emails/día
- Muy confiable
- Analytics detallados
- Usado por empresas grandes

**Configuración:**

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxx  # SendGrid API Key
```

**Pasos:**

1. Crear cuenta en https://sendgrid.com
2. Settings → API Keys → Create API Key
3. Configurar en Supabase

---

### 3. **Gmail SMTP** (Solo para Testing)

**Pros:**

- Gratis
- Fácil de configurar
- Bueno para desarrollo

**Contras:**

- Límite de 500 emails/día
- Requiere "App Password"
- No recomendado para producción

**Configuración:**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=hola@stayarta.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # App Password (no tu contraseña real)
```

**Pasos:**

1. Ir a https://myaccount.google.com/apppasswords
2. Generar "App Password" para "Mail"
3. Usar ese password en SMTP_PASS

---

### 4. **AWS SES** (Para Empresas)

**Pros:**

- Muy económico ($0.10 por 1,000 emails)
- Infraestructura de AWS
- Escalable

**Contras:**

- Requiere verificar dominio
- Configuración más compleja

**Configuración:**

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=AKIAXXXXXXXXXXXXXXXX
SMTP_PASS=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Configuración en Supabase

### Paso 1: Ir a Supabase Dashboard

1. Abrir https://supabase.com/dashboard
2. Seleccionar proyecto HAIDA
3. Ir a **Authentication** → **Email Templates**

### Paso 2: Configurar SMTP

1. En Authentication → **Settings** → **SMTP**
2. Activar "Enable Custom SMTP"
3. Ingresar credenciales del proveedor elegido

### Paso 3: Desactivar confirmación (opcional para desarrollo)

Si quieres permitir login sin confirmar email (solo desarrollo):

1. Authentication → **Providers** → **Email**
2. Desactivar "Confirm email"
3. Guardar cambios

---

## Configuración Rápida para Empezar YA (Resend)

```bash
# 1. Crear cuenta Resend
open https://resend.com

# 2. Obtener API Key
# Dashboard → API Keys → Create API Key

# 3. Configurar en Supabase
# Authentication → Settings → SMTP Settings:
#   - Host: smtp.resend.com
#   - Port: 465
#   - Username: resend
#   - Password: re_xxxxxxxxxxxxx (tu API key)
#   - Sender email: hola@stayarta.com (o tu dominio)
```

**Tiempo estimado:** 5 minutos

---

## Email Templates Incluidos

Supabase incluye templates para:

- ✉️ Confirmación de registro
- 🔑 Reset de contraseña
- ✅ Email verification
- 🔄 Email change notification

Puedes personalizarlos en **Authentication** → **Email Templates**

---

## Mi Recomendación

**Para empezar rápido:** Usa **Resend**

- Más fácil de configurar
- Gratis para empezar
- Excelente deliverability
- Perfecto para producción

**Configuración completa:** 5 minutos
**Costo:** $0 hasta 3,000 emails/mes
