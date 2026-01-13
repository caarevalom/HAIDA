# 🔐 Configuración de Variables de Entorno - HAIDA

Esta guía te ayudará a configurar las variables de entorno necesarias para ejecutar HAIDA.

## 📋 Inicio Rápido

### Opción 1: Script Automático (Recomendado)

```bash
./setup-env.sh
```

### Opción 2: Manual

```bash
cp .env.example .env
nano .env  # Edita con tus credenciales
```

## 🗂️ Estructura de Variables

El archivo `.env.example` está organizado en **9 secciones principales**:

| Sección | Descripción | Variables Clave |
|---------|-------------|-----------------|
| **1. HAIDA Application** | Configuración general | `APP_NAME`, `BASE_URL`, `API_URL` |
| **2. Base de Datos** | Supabase/PostgreSQL | `DATABASE_URL`, `SUPABASE_URL` |
| **3. Atlassian** | Jira & Confluence | `JIRA_API_TOKEN`, `CONFLUENCE_URL` |
| **4. CTB Testing** | Entorno de pruebas CTB | `CTB_BASE_URL`, credenciales |
| **5. Usuarios de Prueba** | Cuentas de testing | `TEST_ADMIN_EMAIL`, etc. |
| **6. Testing** | Playwright/Allure | `BROWSERS`, `ALLURE_RESULTS_DIR` |
| **7. Notificaciones** | Slack/Telegram | `SLACK_WEBHOOK`, `TELEGRAM_BOT_TOKEN` |
| **8. Deployment** | Vercel/Railway | `VERCEL_OIDC_TOKEN` |
| **9. Desarrollo Local** | Config local | `PORT`, `DEBUG` |

## 🔑 Cómo Obtener Credenciales

### Supabase
1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Settings → API
4. Copia:
   - `Project URL` → `SUPABASE_URL`
   - `anon/public` key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_KEY`

### Jira & Confluence
1. Ve a [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Crea un nuevo token
3. Copia el token → `JIRA_API_TOKEN` y `CONFLUENCE_API_TOKEN`

### Telegram Bot
1. Habla con [@BotFather](https://t.me/BotFather) en Telegram
2. Ejecuta `/newbot`
3. Copia el token → `TELEGRAM_BOT_TOKEN`
4. Para obtener `CHAT_ID`, envía un mensaje al bot y visita:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```

### Vercel
```bash
vercel login
vercel env pull .env.local
```

## ⚠️ Seguridad

### ✅ Hacer

- ✅ Usar `.env.example` para documentar
- ✅ Mantener `.env` en `.gitignore`
- ✅ Rotar credenciales regularmente
- ✅ Usar credenciales diferentes para dev/staging/production
- ✅ Almacenar secretos de producción en gestor de secretos (Vercel, Railway)

### ❌ NO Hacer

- ❌ NUNCA versionar archivo `.env` con credenciales reales
- ❌ NO compartir credenciales por email/Slack
- ❌ NO reutilizar contraseñas entre entornos
- ❌ NO hardcodear credenciales en el código

## 🔄 Entornos Múltiples

Si trabajas con múltiples entornos, puedes crear:

```bash
.env                  # Desarrollo local (git-ignored)
.env.local            # Override local (git-ignored)
.env.development      # Development (git-ignored)
.env.testing          # Testing (git-ignored)
.env.production       # Production (git-ignored)
.env.example          # Template (versionado)
```

## 🧪 Testing

### Verificar configuración

```bash
# Verificar que .env existe
test -f .env && echo "✓ .env existe" || echo "✗ .env no existe"

# Verificar que no está en git
git status --short .env 2>/dev/null || echo "✓ .env correctamente ignorado"
```

### Variables mínimas para desarrollo local

```bash
# Mínimas para levantar la app
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx
BASE_URL=http://localhost:3000
```

## 📚 Documentación Adicional

- [ENV_VARIABLES_GUIDE.md](04-CONFIGURATION/ENV_VARIABLES_GUIDE.md) - Guía detallada de variables
- [README.md](README.md) - Documentación principal del proyecto
- [START_HERE.md](START_HERE.md) - Guía de inicio rápido

## 🆘 Troubleshooting

### Error: "Missing environment variable"

```bash
# Verifica que el archivo .env existe
ls -la .env

# Verifica que la variable está definida
grep VARIABLE_NAME .env

# Recarga las variables
source .env  # o reinicia tu terminal/IDE
```

### Error: "Invalid credentials"

- Verifica que las credenciales no han expirado
- Los tokens JWT de Vercel expiran (verifica `exp` claim)
- Tokens de Jira no expiran, pero pueden ser revocados

### Variables no se cargan

Si usas:
- **Node.js**: Usa `dotenv` → `require('dotenv').config()`
- **Vite**: Las variables deben empezar con `VITE_`
- **Next.js**: Usa `NEXT_PUBLIC_` para variables del cliente

## 📞 Soporte

Para obtener credenciales o ayuda:
- **DevOps**: hola@stayarta.com
- **QA Team**: Contacta al QA Lead
- **Documentación**: Consulta `ENV_VARIABLES_GUIDE.md`

---

**Última actualización**: 2026-01-13
