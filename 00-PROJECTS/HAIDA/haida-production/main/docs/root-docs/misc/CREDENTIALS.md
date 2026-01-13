# HAIDA - Credenciales y Tokens

**Última actualización**: ++34662652300
**⚠️ CONFIDENCIAL - NO COMPARTIR**

---

## Vercel

### Token 1 (Principal)
```
TGtBryOqKfSQNAapoP1SWu4F
```

### Token 2 (Backup)
```
En71WFRhXA6GM1ghALnFrX3i
```

### Account
- Usuario: `caarevalo-hiberus`
- Team: `carlos-arevalos-projects-cf7340ea`

### Proyectos Activos
- **haida-frontend**: https://haida.stayarta.com → https://haida.stayarta.com
- **haida**: https://haidapi.stayarta.com → https://haidapi.stayarta.com

---

## Telegram Bot

### Bot Info
- **Username**: `@Haidauto_bot`
- **Token**: `++34662652300:AAGUbxodYRSf1RsOWZARDmQEs8Rb84Sbxnc`
- **Bot ID**: `++34662652300`

### Admin User
- **Username**: `@carlosarta`
- **User ID**: `++34662652300`
- **First Name**: Carlos
- **Last Name**: A
- **Language**: es

### Webhook URL
```
https://bothaida.stayarta.com/webhook
```

### MiniApp URL
```
https://haida.stayarta.com
```

---

## Microsoft Entra ID (Azure AD)

### Application
- **Client ID**: `93dae11f-417c-49ff-8d66-d642afb66327`
- **Tenant ID**: `9b7594d6-2c7d-4fe2-b248-213f64996877`
- **Client Secret**: `6GI8Q~kMgGHrl9AvhGfAiOUQp7xAqzTqncvCca3p`

### Authority
```
https://login.microsoftonline.com/9b7594d6-2c7d-4fe2-b248-213f64996877
```

### Redirect URIs
- `https://haida.stayarta.com`
- `https://haida.stayarta.com/auth`
- `https://haida.stayarta.com/auth`
- `https://haidapi.stayarta.com/api/auth/callback`

---

## Supabase

### Database
```
postgresql://postgres.wdebyxvtunromsnkqbrd:C25843bc8!@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?sslmode=require
```

### API
- **URL**: `https://wdebyxvtunromsnkqbrd.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4OTU3NTEsImV4cCI6MjA4MTQ3MTc1MX0._VYypgb2tV9u_4jSAt3sbcFj-drhufB0oN9o3BcgHTs`
- **Service Role**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg5NTc1MSwiZXhwIjoyMDgxNDcxNzUxfQ.Jg6UBGpYDBBKvB4pgaKW_OJCTx0VOm9UMI18vqdUEJc`

---

## LLM Provider (RouteLLM)

```
URL: https://routellm.abacus.ai/v1
Model: gpt-5
API Key: s2_b6b02388915046de99cff0af3a7d5592
```

---

## JWT Authentication

```
Secret: ECB76E37-DB86-435A-9E17-3DEF19FF57A7
Algorithm: HS256
Expiration: 30 minutes
```

---

## Railway (Telegram Bot Deployment)

### Project
- **Name**: haida-api
- **URL**: https://bothaida.stayarta.com

---

## Dominios

### DNS (Cloudflare)
- **haida.stayarta.com** → Frontend
- **haidapi.stayarta.com** → Backend API
- **bothaida.stayarta.com** → Telegram Bot

### SSL
- Automático via Vercel (Frontend + Backend)
- Automático via Railway (Bot)

---

## Atlassian

### Jira/Confluence
- **URL**: https://stayarta.atlassian.net
- **Email**: hola@stayarta.com
- **API Token**: `ATATT3xFfGF0ifmwmETk0aQ_AIqJWC53nvyigYErgHi8OUmBS5Qk5OXzrNMM8lGewcbzg-HXhj0-0JdjRGirS__INC7roykJF5nrhRbBpck5zhU43u-agD_p2Jbz5M5V_lLkwA8ZIw1g82nI4RyvLGkyud_bYiS0ajO-gUa2SLh4wTTs-NN0dsg=++34662652300`

---

## Copilot Studio

### Direct Line
- **Endpoint**: https://default9b7594d62c7d4fe2b248213f649968.77.environment.api.powerplatform.com/copilotstudio/dataverse-backed/authenticated/bots/copilots_header_19103/conversations?api-version=++34662652300-preview
- **Secret 1**: `CRBTTL8dDMmFzY8ICi8BypG72tXtvG8lyF5quuUMZWbGjaBwhqwFJQQJ99CAACi5YpzAArohAAABAZBS4CI8.CCbX7vdAWZisWFOXAwituhU3ml3oMWIbV8y2Ea32uOy0FaiFNgOCJQQJ99CAACi5YpzAArohAAABAZBS2NJg`
- **Secret 2**: `CRBTTL8dDMmFzY8ICi8BypG72tXtvG8lyF5quUMZWbGjaBwhqwFJQQJ99CAACi5YpzAArohAAABAZBS4CI8.P2bDLCPfYMUWuo0E2qSaF6f1rfzymumlfPRvZOBatREgf4AavMWhJQQJ99CAACi5YpzAArohAAABAZBS1EFb`

---

## Seguridad

⚠️ **IMPORTANTE**:
- Este archivo contiene credenciales sensibles
- NO hacer commit a git (ya está en .gitignore)
- Rotar secretos cada 3-6 meses
- Usar variables de entorno en producción
- No compartir tokens en canales inseguros

---

**Backup**: Este archivo se encuentra en `/Users/carlosa/Hiberus/HAIDA-PROJECT/CREDENTIALS.md`
