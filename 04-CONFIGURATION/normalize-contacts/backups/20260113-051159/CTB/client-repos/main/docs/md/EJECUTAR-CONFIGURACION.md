# ⚡ EJECUTAR CONFIGURACIÓN COMPLETA - HAIDA

## ✅ TODO CONFIGURADO

He creado una configuración completa de Supabase y Vercel para HAIDA.

---

## 🚀 OPCIÓN 1: Ejecutar TODO de una vez (RECOMENDADO)

```powershell
cd C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA

# Ejecutar configuración completa
.\deploy-complete.ps1
```

**Esto hace**:
1. ✅ Configura variables de entorno
2. ✅ Prueba conexión a Supabase
3. ✅ Crea tablas en la base de datos
4. ✅ Instala dependencias NPM
5. ✅ Construye la aplicación
6. ✅ Despliega a Vercel
7. ✅ Verifica que todo funcione

**Tiempo estimado**: 10-15 minutos

---

## 🎯 OPCIÓN 2: Paso a paso

### Paso 1: Configurar Supabase

```powershell
cd C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA

# Setup Supabase
.\setup-supabase.ps1
```

**Esto hace**:
- Prueba conexión a Supabase
- Crea todas las tablas (users, projects, test_suites, etc.)
- Inserta datos de prueba
- Actualiza archivos .env

### Paso 2: Configurar Vercel

```powershell
# Setup Vercel
.\setup-vercel.ps1
```

**Esto hace**:
- Instala Vercel CLI
- Configura autenticación
- Vincula proyecto
- Configura variables de entorno

### Paso 3: Desplegar

```powershell
# Deploy a producción
vercel --prod
```

---

## 📋 ARCHIVOS CREADOS

1. **`.env.production`** - Variables de entorno de producción
   - Database URL con contraseña
   - Supabase keys (public y private)
   - Vercel tokens
   - AI Gateway keys

2. **`vercel.json`** - Configuración de Vercel
   - Rutas de API
   - Variables de entorno
   - Configuración de builds

3. **`.vercelignore`** - Archivos excluidos del deploy
   - node_modules
   - test results
   - documentación

4. **`setup-supabase.ps1`** - Script de configuración DB

5. **`setup-vercel.ps1`** - Script de configuración Vercel

6. **`deploy-complete.ps1`** - Deploy automatizado completo

7. **`SUPABASE-VERCEL-SETUP.md`** - Documentación completa

---

## 🗄️ VERIFICAR SUPABASE

### En el Dashboard

1. Ve a: https://app.supabase.com/project/wdebyxvtunromsnkqbrd
2. Click en "Table Editor"
3. Deberías ver 7 tablas:
   - users
   - projects
   - test_suites
   - test_cases
   - change_detections
   - test_executions
   - test_results

### Desde PowerShell

```powershell
# Test conexión rápido
node -e "const {Client}=require('pg'); const c=new Client({connectionString:'postgresql://postgres:hola@stayarta.com:5432/postgres',ssl:{rejectUnauthorized:false}}); c.connect().then(()=>c.query('SELECT NOW()')).then(r=>console.log('✓ Connected:',r.rows[0].now)).catch(e=>console.error('✗',e.message)).finally(()=>c.end())"
```

### Con psql

```powershell
# Conectar a la base de datos
psql "postgresql://postgres:hola@stayarta.com:5432/postgres"

# Ver tablas
\dt

# Ver usuarios
SELECT * FROM users;

# Salir
\q
```

---

## 🌐 VERIFICAR VERCEL

### Instalar CLI

```powershell
npm install -g vercel
```

### Ver deployments

```powershell
# Login (usa el token automáticamente)
$env:VERCEL_TOKEN="RsMSKpDF84aOXNaTCwCEanBi"

# Listar deployments
vercel ls

# Ver logs
vercel logs
```

### Dashboard

- **Main**: https://vercel.com/w9ITuSz5cmhTvpQIafRHh8mS
- **Deployments**: https://vercel.com/w9ITuSz5cmhTvpQIafRHh8mS/deployments
- **Settings**: https://vercel.com/w9ITuSz5cmhTvpQIafRHh8mS/settings

---

## ✅ CHECKLIST DE VERIFICACIÓN

Después de ejecutar los scripts, verifica:

```powershell
# 1. Variables de entorno configuradas
Get-Content .env.production | Select-String "SUPABASE"

# 2. Base de datos conectada
node -e "const {Client}=require('pg'); const c=new Client({connectionString:process.env.DATABASE_URL || 'postgresql://postgres:hola@stayarta.com:5432/postgres',ssl:{rejectUnauthorized:false}}); c.connect().then(()=>{console.log('✓ DB Connected'); return c.query('SELECT COUNT(*) FROM users')}).then(r=>console.log('✓ Users:',r.rows[0].count)).catch(console.error).finally(()=>c.end())"

# 3. Vercel CLI funciona
vercel --version

# 4. Dependencias instaladas
npm list pg @playwright/test allure-commandline

# 5. Tests funcionan
npm run test:web -- --project=chromium tests/web-e2e/smoke.spec.ts
```

---

## 🚨 TROUBLESHOOTING

### Error: "pg module not found"

```powershell
npm install pg
```

### Error: "Vercel command not found"

```powershell
npm install -g vercel
```

### Error: "Database connection failed"

Verifica el password:
```powershell
# Debe ser: Aupbag7. (con el punto al final)
psql "postgresql://postgres:hola@stayarta.com:5432/postgres"
```

### Error: "Vercel authentication failed"

```powershell
# Configurar token manualmente
$env:VERCEL_TOKEN="RsMSKpDF84aOXNaTCwCEanBi"
vercel whoami
```

---

## 📊 RESUMEN DE CREDENCIALES

### Supabase

```
URL: https://wdebyxvtunromsnkqbrd.supabase.co
Host: db.wdebyxvtunromsnkqbrd.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: Aupbag7.
```

### Vercel

```
User ID: w9ITuSz5cmhTvpQIafRHh8mS
Token: RsMSKpDF84aOXNaTCwCEanBi
```

---

## 🎯 COMANDOS RÁPIDOS

```powershell
# SETUP COMPLETO (recomendado)
.\deploy-complete.ps1

# O paso a paso:
.\setup-supabase.ps1
.\setup-vercel.ps1
vercel --prod

# Verificar base de datos
psql "postgresql://postgres:hola@stayarta.com:5432/postgres"

# Ver deployments
vercel ls

# Ejecutar tests
npm run test:web
```

---

## 📖 DOCUMENTACIÓN

- **Setup Completo**: `SUPABASE-VERCEL-SETUP.md`
- **Base de Datos**: `database/README-DATABASE.md`
- **CLI Tools**: `CLI-TOOLS-GUIDE.md`
- **Quick Start DB**: `database/QUICK-START-DATABASE.md`

---

## 🚀 SIGUIENTE PASO

**Ejecuta AHORA**:

```powershell
cd C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA
.\deploy-complete.ps1
```

Esto configurará AUTOMÁTICAMENTE:
- ✅ Supabase (base de datos)
- ✅ Vercel (deployment)
- ✅ Variables de entorno
- ✅ Dependencies
- ✅ Todo listo para usar

**Tiempo**: 10-15 minutos
**Interacción**: Mínima (solo ejecutar el comando)

---

¿Listo para ejecutar? 🚀
