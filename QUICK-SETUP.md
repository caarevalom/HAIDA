# ⚡ HAIDA - Quick Setup Guide

## 🚀 Instalación Rápida (5 minutos)

### Prerrequisitos

- Node.js 20+
- Python 3.11+
- Docker (opcional)
- Git

### Paso 1: Clonar e Instalar

```bash
# Clonar repositorio
git clone <repo-url>
cd HAIDA

# Instalar dependencias Node.js
npm install

# Instalar navegadores Playwright
npx playwright install --with-deps

# Configurar Husky (git hooks)
npm run prepare
```

### Paso 2: Configurar Environment

```bash
# Copiar template de variables de entorno
cp .env.vault.example .env

# Editar .env con tus credenciales reales
# IMPORTANTE: Nunca commitear .env al repositorio
nano .env
```

**Variables CRÍTICAS a configurar**:

```env
# Database (Supabase)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD_MIN_16_CHARS

# Supabase API
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# Microsoft OAuth
AZURE_CLIENT_ID=YOUR_CLIENT_ID
AZURE_TENANT_ID=YOUR_TENANT_ID
AZURE_CLIENT_SECRET=YOUR_CLIENT_SECRET

# JWT Secret
# Generar con: openssl rand -base64 32
JWT_SECRET=YOUR_GENERATED_SECRET_32_CHARS_MIN

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Paso 3: Validar Instalación

```bash
# Verificar TypeScript
npm run type-check

# Verificar linting
npm run lint

# Ejecutar tests
npm run test:web

# Ver reporte
npm run report
```

---

## 🎯 Comandos Esenciales

### Testing

```bash
# Tests E2E (Playwright)
npm run test:web                # Headless mode
npm run test:web:ui             # UI mode interactivo
npm run test:web:debug          # Debug mode

# Tests API (Newman)
npm run test:api

# Performance tests (Lighthouse)
npm run lighthouse

# Ver reportes
npm run report                  # Playwright HTML report
npm run allure:generate         # Generar Allure report
npm run allure:open             # Abrir Allure en navegador
```

### Code Quality

```bash
# Linting
npm run lint                    # Verificar código
npm run lint:fix                # Auto-fix errores

# Formatting
npm run format                  # Formatear código
npm run format:check            # Verificar formato

# Type checking
npm run type-check              # Validar tipos TypeScript
```

### Seguridad

```bash
# Auditoría de seguridad
npm run security:audit          # npm audit (producción)
npm run security:check          # Snyk scan (requiere token)

# Verificar secrets (manual)
git secrets --scan              # Si git-secrets instalado
```

### Build & Deploy

```bash
# Build aplicación
npm run build

# Build para Vercel
npm run vercel-build

# Development server
npm run dev
```

---

## 🐳 Docker (Opcional)

### Desarrollo Local con Docker

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down

# Reconstruir imágenes
docker-compose up -d --build
```

### Servicios Disponibles

- **Backend (FastAPI)**: http://localhost:8000
- **Redis**: localhost:6379
- **Frontend**: http://localhost:5173 (si configurado)

---

## 🛠️ Desarrollo Diario

### Workflow Típico

```bash
# 1. Crear nueva rama
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar...
# (Los pre-commit hooks se ejecutarán automáticamente)

# 3. Antes de commit, verificar manualmente
npm run lint:fix
npm run format
npm run type-check

# 4. Commit (formato conventional commits)
git commit -m "feat: agregar nueva funcionalidad"
# Hooks automáticos corren:
# - lint-staged
# - secret detection
# - commit message validation

# 5. Antes de push
npm run test:web
# Pre-push hook corre:
# - Tests
# - Type check
# - Security audit

# 6. Push
git push origin feature/nueva-funcionalidad
```

### Conventional Commits

**Formato**: `tipo(scope): descripción`

**Tipos válidos**:

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bugs
- `docs`: Cambios en documentación
- `style`: Formato de código
- `refactor`: Refactorización
- `perf`: Mejoras de rendimiento
- `test`: Agregar/corregir tests
- `build`: Cambios en build system
- `ci`: Cambios en CI/CD
- `chore`: Tareas de mantenimiento

**Ejemplos**:

```bash
git commit -m "feat(auth): add Microsoft OAuth login"
git commit -m "fix(api): resolve timeout on large requests"
git commit -m "docs(readme): update installation steps"
git commit -m "test(e2e): add checkout flow tests"
```

---

## 🚨 Troubleshooting

### Error: "ESLint no encuentra plugins"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "Playwright browsers no instalados"

```bash
npx playwright install --with-deps
```

### Error: "TypeScript errors en node_modules"

```bash
# Ya está configurado en tsconfig.json
# Si persiste, limpiar cache:
rm -rf node_modules/.cache
npm run type-check
```

### Error: "Husky hooks no se ejecutan"

```bash
# Reinstalar Husky
npm run prepare
chmod +x .husky/pre-commit .husky/commit-msg .husky/pre-push
```

### Error: "Docker compose falla con variables faltantes"

```bash
# Verificar que .env existe y tiene todas las variables
cat .env

# Si falta alguna, copiar template
cp .env.vault.example .env
# Editar .env con valores reales
```

### Error: "Tests fallan en CI/CD"

1. Verificar GitHub Secrets configurados:
   - `SNYK_TOKEN`
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_CLIENT_SECRET`
   - `JWT_SECRET`

2. Verificar que tests pasan localmente:
   ```bash
   npm run test:web
   ```

---

## 📚 Documentación Adicional

- [OPTIMIZATION-REPORT.md](OPTIMIZATION-REPORT.md) - Reporte completo de mejoras
- [SECURITY.md](.github/SECURITY.md) - Política de seguridad
- [CLAUDE.md](CLAUDE.md) - Instrucciones para IA
- [START-HERE.md](START-HERE.md) - Overview general del proyecto

---

## ✅ Checklist Primera Vez

- [ ] Clonar repositorio
- [ ] `npm install`
- [ ] `npx playwright install --with-deps`
- [ ] `npm run prepare` (Husky)
- [ ] Copiar `.env.vault.example` a `.env`
- [ ] Configurar variables de entorno en `.env`
- [ ] `npm run type-check` (debe pasar)
- [ ] `npm run lint` (debe pasar)
- [ ] `npm run test:web` (debe pasar)
- [ ] Hacer commit de prueba para validar hooks
- [ ] Leer [OPTIMIZATION-REPORT.md](OPTIMIZATION-REPORT.md)

---

## 🆘 Soporte

- **Issues**: GitHub Issues
- **Seguridad**: security@hiberus.com
- **DevOps**: devops@hiberus.com
- **General**: haida-po@hiberus.com

---

**Última actualización**: 2025-12-26
