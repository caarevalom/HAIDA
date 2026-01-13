# Sistema de Archivos Organizado

Bienvenido a tu directorio principal optimizado. Este sistema está organizado para máxima productividad y fácil navegación.

## 📁 Estructura de Directorios Numerados

Tu sistema de archivos está organizado en 9 categorías principales. Cada una tiene un propósito específico:

| # | Directorio | Descripción | Contenido Clave |
|---|-----------|-------------|-----------------|
| **00** | **PROJECTS** | Proyectos activos de desarrollo | [CTB](./00-PROJECTS/CTB/), [HAIDA](./00-PROJECTS/HAIDA/), [PRIVALIA](./00-PROJECTS/PRIVALIA/), [TypeSpec Tools](./00-PROJECTS/typespec-tools/) |
| **01** | **DOCUMENTATION** | Documentación técnica y referencias | [HAIDA Docs](./01-DOCUMENTATION/TECHNICAL/HAIDA/), [Referencias](./01-DOCUMENTATION/REFERENCE/), [Presentaciones](./01-DOCUMENTATION/PRESENTATIONS/) |
| **02** | **AUTOMATION-SCRIPTS** | Scripts de automatización y utilidades | [Deployment Scripts](./02-AUTOMATION-SCRIPTS/deployment/), [Utilities](./02-AUTOMATION-SCRIPTS/utilities/) |
| **03** | **TESTING-DATA** | Datos de prueba y fixtures | [Demo Data](./03-TESTING-DATA/demo-data/), [Fixtures](./03-TESTING-DATA/fixtures/), [Postman](./03-TESTING-DATA/postman-collections/) |
| **04** | **CONFIGURATION** | Configuraciones centralizadas | [.env](./04-CONFIGURATION/.env), [Tool Configs](./04-CONFIGURATION/tool-configs/), [Deployment](./04-CONFIGURATION/deployment/) |
| **05** | **INSTALLERS** | Archivos de instalación | [DMG Files](./05-INSTALLERS/dmg-files/), [EXE Files](./05-INSTALLERS/exe-files/), [ZIP Archives](./05-INSTALLERS/zip-archives/) |
| **06** | **DOWNLOADS** | Descargas organizadas por tipo | [Archives](./06-DOWNLOADS/archives/), [PDFs](./06-DOWNLOADS/pdf-documents/), [Images](./06-DOWNLOADS/images/) |
| **07** | **SECURITY** | Backups y certificados | [Backups](./07-SECURITY/backups/), [Certificates](./07-SECURITY/certificates/) |
| **08** | **ARCHIVE** | Proyectos legacy y versiones antiguas | [Legacy Projects](./08-ARCHIVE/legacy-projects/), [Logs](./08-ARCHIVE/logs/) |

## 🚀 Guías Rápidas de Inicio

### Para Desarrolladores

- **Nuevo proyecto?** → Crear directorio en `00-PROJECTS/`
- **Documentar proyecto?** → Usar `01-DOCUMENTATION/`
- **Automatizar tareas?** → Scripts en `02-AUTOMATION-SCRIPTS/`
- **Desplegar HAIDA?** → [Guía de Deployment](./01-DOCUMENTATION/TECHNICAL/HAIDA/DEPLOYMENT/)

### Para Herramientas de Sistema

- **VSCode, Cursor, IDE settings?** → `04-CONFIGURATION/tool-configs/`
- **Variables de entorno?** → `04-CONFIGURATION/.env`
- **Configuración de Git?** → `04-CONFIGURATION/git-config/`

### Para Búsqueda Rápida

| Necesito... | Ubicación |
|-----------|-----------|
| Documentación HAIDA | [01-DOCUMENTATION/TECHNICAL/HAIDA/](./01-DOCUMENTATION/TECHNICAL/HAIDA/) |
| Documentación de referencia | [01-DOCUMENTATION/REFERENCE/](./01-DOCUMENTATION/REFERENCE/) |
| Guías de configuración | [04-CONFIGURATION/](./04-CONFIGURATION/) |
| Scripts de despliegue | [02-AUTOMATION-SCRIPTS/deployment/](./02-AUTOMATION-SCRIPTS/deployment/) |
| Datos de prueba | [03-TESTING-DATA/](./03-TESTING-DATA/) |

## 🔐 Herramientas de Configuración

Tu sistema tiene **57 herramientas configuradas** en directorios ocultos. Para ver un inventario completo:

📖 **[Ver Inventario Completo de Herramientas](./04-CONFIGURATION/TOOLS-INVENTORY.md)**

Categorías principales:
- 🛠️ **Herramientas de Desarrollo** (VSCode, Cursor, IDEs)
- 📦 **Gestión de Paquetes** (npm, Rust, Swift)
- ☁️ **Cloud y Servicios** (Azure, Vercel, Railway, Kubernetes)
- 🤖 **Herramientas de IA** (Claude, Copilot, Gemini)
- 🔐 **Seguridad** (SSH, Git, Credenciales)

## ⚙️ Configuración

### Archivos de Configuración

**Ubicación**: `./04-CONFIGURATION/`

- **`.env`** - Configuración principal de HAIDA (189 variables)
- **`.env` (raíz)** - Variables complementarias locales (GEMINI_API_KEY)
- **`README.md`** - Documentación de configuración
- **`TOOLS-INVENTORY.md`** - Inventario detallado de herramientas
- **`deployment/`** - Configuraciones de despliegue
- **`git-config/`** - Configuraciones de Git
- **`tool-configs/`** - Configuraciones de herramientas IDE

👉 **[Ver Documentación Completa de Configuración](./04-CONFIGURATION/README.md)**

## 📚 Documentación

### Documentación Técnica

**Ubicación**: `./01-DOCUMENTATION/TECHNICAL/`

```
📂 TECHNICAL/
├── HAIDA/          ← Documentación completa de HAIDA (organizada por tema)
│   ├── DEPLOYMENT/        (Guías de despliegue)
│   ├── INTEGRATION/       (Flujos de integración)
│   ├── OPERATIONS/        (Operaciones y mantenimiento)
│   └── EVALUATION/        (Evaluaciones y verificaciones)
└── system-scans/   ← Escaneos de sistema
```

👉 **[Ver Documentación HAIDA](./01-DOCUMENTATION/TECHNICAL/HAIDA/)**

### Documentación de Referencia

**Ubicación**: `./01-DOCUMENTATION/REFERENCE/`

- **CLAUDE.md** - Documentación de Claude
- **NAVIGATION_GUIDE.md** - Guía de navegación del sistema
- **QUICK_REFERENCE.md** - Referencias rápidas

👉 **[Ver Referencias](./01-DOCUMENTATION/REFERENCE/)**

## 🎯 Tareas Frecuentes

### Desplegar HAIDA

```bash
cd ./01-DOCUMENTATION/TECHNICAL/HAIDA/DEPLOYMENT/
cat START_HERE_DEPLOY.md
```

### Ejecutar Scripts de Automatización

```bash
cd ./02-AUTOMATION-SCRIPTS/deployment/
ls -la                    # Ver scripts disponibles
```

### Revisar Configuración

```bash
# Ver todas las variables de entorno
cat ./04-CONFIGURATION/.env

# Ver inventario de herramientas
cat ./04-CONFIGURATION/TOOLS-INVENTORY.md
```

### Trabajar con Proyectos

```bash
cd ./00-PROJECTS/
ls -la                    # Ver proyectos activos
cd HAIDA/                 # Entrar a proyecto específico
```

## 📊 Estadísticas del Sistema

- **Directorios principales**: 9 (00-08)
- **Herramientas configuradas**: 57
- **Documentos**: ~20 archivos
- **Tamaño total estimado**: ~200-500 MB (depende de proyectos)

## 🔒 Seguridad y Backups

### Directorios Críticos para Backup

**SENSIBLES - Hacer backup cifrado:**
- `~/.ssh/` - Claves privadas SSH
- `~/.claude/` - Configuración de Claude Code
- `~/.azure/`, `~/.vercel/` - Credenciales cloud
- `./04-CONFIGURATION/.env` - Variables sensibles

**IMPORTANTES - Hacer backup regularmente:**
- `.vscode/`, `.cursor/`, IDEs
- `~/.git/` - Repositorio Git
- `00-PROJECTS/` - Proyectos activos

👉 **[Ver Política Completa de Backup](./04-CONFIGURATION/TOOLS-INVENTORY.md#-política-de-backup)**

## 📖 Documentación Completa

Para documentación detallada de cualquier aspecto:

- **Configuración**: [04-CONFIGURATION/README.md](./04-CONFIGURATION/README.md)
- **Herramientas**: [04-CONFIGURATION/TOOLS-INVENTORY.md](./04-CONFIGURATION/TOOLS-INVENTORY.md)
- **HAIDA**: [01-DOCUMENTATION/TECHNICAL/HAIDA/README.md](./01-DOCUMENTATION/TECHNICAL/HAIDA/README.md)
- **Referencias**: [01-DOCUMENTATION/REFERENCE/](./01-DOCUMENTATION/REFERENCE/)

## 🔄 Directorios del Sistema macOS

Estos directorios son estándar de macOS y se mantienen separados:

- **Desktop** - Escritorio
- **Documents** - Documentos de usuario (no técnicos)
- **Downloads** - Descargas del navegador (usa `06-DOWNLOADS/` para organizado)
- **Library** - Datos de aplicaciones del sistema
- **Movies**, **Music**, **Pictures** - Multimedia del usuario

## 💡 Consejos de Productividad

1. **Bookmarks** - Agrega `00-PROJECTS/` y `01-DOCUMENTATION/` a favoritos en tu IDE
2. **Aliases** - Crea shortcuts en terminal para directorios frecuentes:
   ```bash
   alias proj="cd ~/00-PROJECTS"
   alias docs="cd ~/01-DOCUMENTATION"
   ```
3. **Search** - Usa `find` o `grep` para búsquedas rápidas
4. **README** - Cada directorio numerado tiene su propio README

## 🎓 Estructura de Carpetas - Referencia Visual

```
~/ (HOME)
├── 📂 00-PROJECTS/              ← Proyectos activos
│   ├── CTB/
│   ├── HAIDA/
│   ├── PRIVALIA/
│   └── typespec-tools/
├── 📂 01-DOCUMENTATION/         ← Documentación técnica
│   ├── TECHNICAL/
│   │   ├── HAIDA/
│   │   └── system-scans/
│   ├── REFERENCE/
│   ├── PRESENTATIONS/
│   └── CONSOLIDATION/
├── 📂 02-AUTOMATION-SCRIPTS/    ← Scripts y utilidades
│   ├── deployment/
│   ├── utilities/
│   └── consolidation/
├── 📂 03-TESTING-DATA/          ← Datos de prueba
├── 📂 04-CONFIGURATION/         ← Configuraciones centrales
│   ├── .env
│   ├── deployment/
│   ├── git-config/
│   └── tool-configs/
├── 📂 05-INSTALLERS/            ← Archivos de instalación
├── 📂 06-DOWNLOADS/             ← Descargas organizadas
├── 📂 07-SECURITY/              ← Backups y certificados
├── 📂 08-ARCHIVE/               ← Legacy y versionado
│   └── logs/
├── 📄 README.md                 ← Este archivo
├── 📄 .env                      ← Config local complementaria
├── 🔒 .ssh/, .git/, .claude/   ← Configuraciones sensibles
└── 📁 Library/, Desktop/, etc.  ← Directorios de macOS
```

## ✅ Verificación Rápida

Para verificar que todo está organizado correctamente:

```bash
# Ver estructura de directorios
ls -1 ~/0[0-8]-*/

# Contar archivos en raíz (debería ser mínimo)
ls -la ~/*.md 2>/dev/null | wc -l

# Ver documentación HAIDA
ls -la ~/01-DOCUMENTATION/TECHNICAL/HAIDA/

# Verificar TypeSpec tools
ls -la ~/00-PROJECTS/typespec-tools/
```

## 🆘 Necesitas Ayuda?

- 📚 **Buscar documentación**: Ver directorios correspondientes con README.md
- 🔍 **Encontrar un archivo**: `grep -r "término" ~/01-DOCUMENTATION/`
- ⚙️ **Entender una herramienta**: Revisar `04-CONFIGURATION/TOOLS-INVENTORY.md`
- 🚀 **Desplegar**: Ir a `01-DOCUMENTATION/TECHNICAL/HAIDA/DEPLOYMENT/`

---

## 📌 Información del Sistema

- **Última actualización**: 11 de enero, 2026
- **Versión de estructura**: 2.0 (Optimizada)
- **Estado**: Completamente organizado y documentado
- **Próximas acciones**: Mantener actualizado cuando se agreguen nuevos proyectos

**Creado con ❤️ para maximizar tu productividad**
