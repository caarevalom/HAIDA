# 📁 Guía de Navegación - /Users/carlosa

**Última reorganización**: 09 de Enero 2026
**Estructura**: 8 directorios principales + Archivos de configuración
**Total archivos reorganizados**: 95

---

## 📊 Estructura General

```
/Users/carlosa/
├── 00-PROJECTS/                    ← 🎯 PROYECTOS PRINCIPALES
├── 01-DOCUMENTATION/               ← 📚 DOCUMENTACIÓN
├── 02-AUTOMATION-SCRIPTS/          ← 🤖 SCRIPTS Y AUTOMATIZACIÓN
├── 03-TESTING-DATA/                ← 🧪 DATOS DE TESTING
├── 04-CONFIGURATION/               ← ⚙️ ARCHIVOS DE CONFIG
├── 05-INSTALLERS/                  ← 📦 INSTALADORES
├── 06-DOWNLOADS/                   ← 💾 DESCARGAS
├── 07-SECURITY/                    ← 🔐 SEGURIDAD
├── 08-ARCHIVE/                     ← 📦 VERSIONES ANTIGUAS
└── [archivos de sistema]           ← Dotfiles, .zsh, .config, etc.
```

---

## 🎯 00-PROJECTS/ - Proyectos Principales

**Propósito**: Contiene todos los proyectos activos y sus datos relacionados

### HAIDA (Proyecto Principal)
```
00-PROJECTS/HAIDA/
├── haida-main/dev/                 ← Rama de DESARROLLO
│   └── [contenido de HAIDA original]
├── haida-production/main/          ← PRODUCCIÓN (HAIDA-PROJECT)
│   └── [contenido de HAIDA-PROJECT original]
├── haida-legacy/                   ← Versiones antiguas
│   ├── HAIDA-main/
│   ├── HAIDA-2/
│   ├── HAIDA_Instalador/
│   └── HAIDA2/
└── haida-documentation/            ← Documentación específica de HAIDA
```

**Qué hacer aquí**:
- Trabajar con código de HAIDA desarrollo/producción
- Revisar cambios entre versiones
- Mantener documentación actualizada

### PRIVALIA (Cliente)
```
00-PROJECTS/PRIVALIA/
├── client-repos/main/              ← Repositorio del cliente
├── tests/                          ← Tests específicos de Privalia
└── documentation/                  ← Docs relacionadas con Privalia
```

### CTB (Cliente)
```
00-PROJECTS/CTB/
├── client-repos/main/              ← Repositorio del cliente
├── tests/                          ← Tests específicos de CTB
└── documentation/                  ← Docs relacionadas con CTB
```

---

## 📚 01-DOCUMENTATION/ - Documentación

**Propósito**: Toda la documentación del proyecto

### CONSOLIDATION (Consolidación de HAIDA)
```
01-DOCUMENTATION/CONSOLIDATION/
├── audits/                         ← Auditorías verificadas
│   ├── CONSOLIDACION_MAESTRO_HAIDA_VERIFIED.md
│   ├── INTEGRACIONES_AUDIT_HAIDA_DETALLADO.md
│   ├── CLAUDE_CODE_CONFIGURATION_AUDIT.md
│   ├── PLAN_DEPRECACION_VERSIONES_VIEJAS.md
│   └── RESUMEN_AUDITORIA_FINAL.md
├── plans/                          ← Planes e implementación
│   ├── IMPLEMENTACION_COMPLETA_RESUMEN.md
│   └── README_CLAUDE_CONFIG_AUTOMATION.md
└── reports/                        ← Reportes finales
    ├── INDEX_ARCHIVOS_CREADOS.txt
    ├── RESUMEN_CONSOLIDACION_FINAL_EJECUTIVO.md
    └── AUDIT_COMPLETO_CONSOLIDACION_CRITICA.md
```

### TECHNICAL (Documentación Técnica)
```
01-DOCUMENTATION/TECHNICAL/
├── architecture/                   ← Diagramas de arquitectura
├── api-specs/                      ← Especificaciones OpenAPI
└── database/                       ← Esquemas y migraciones
```

### PRESENTATIONS
```
01-DOCUMENTATION/PRESENTATIONS/
└── [Presentaciones e informes ejecutivos]
```

---

## 🤖 02-AUTOMATION-SCRIPTS/ - Scripts de Automatización

**Propósito**: Todos los scripts ejecutables organizados por función

### consolidation/
```
02-AUTOMATION-SCRIPTS/consolidation/
├── automate-claude-consolidation.sh    ← 🚀 MAESTRO (ejecuta todos)
├── consolidate-claude-config.sh         ← Fase 1: Limpieza
├── install-git-secrets.sh               ← Fase 2: Git-secrets
├── validate-claude-config.sh            ← Fase 3: Validación
└── monitor-claude-config.sh             ← Fase 4: Monitoreo continuo
```

**Uso**:
```bash
# Ejecutar todo de una vez
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/consolidation/automate-claude-consolidation.sh all

# O por fase individual
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/consolidation/consolidate-claude-config.sh
```

### deployment/
```
02-AUTOMATION-SCRIPTS/deployment/
├── start_haida.sh                  ← Iniciar HAIDA
├── setup*.ps1                      ← Scripts de setup
├── deploy-complete.ps1
├── verify*.ps1
├── run-qa*.ps1
└── ...
```

### utilities/
```
02-AUTOMATION-SCRIPTS/utilities/
├── memory_cleaner.sh               ← Limpiar memoria
├── ram_killer.sh
└── security_cleaner.sh
```

---

## 🧪 03-TESTING-DATA/ - Datos de Testing

**Propósito**: Colecciones de pruebas, fixtures y datos demo

```
03-TESTING-DATA/
├── postman-collections/            ← Colecciones Postman
│   ├── Checkout_Environment.postman_environment.json
│   └── Checkout_Error_Handling_API.postman_collection.json
├── test-reports/                   ← Reportes de pruebas
│   ├── demo-reports/
│   └── additional-reports/
├── fixtures/                       ← Datos de prueba
│   └── tests/
└── demo-data/                      ← Datos de demostración
```

**Cómo usarlos**:
1. Importar colecciones Postman
2. Usar fixtures para testing local
3. Revisar test-reports para análisis

---

## ⚙️ 04-CONFIGURATION/ - Archivos de Configuración

**Propósito**: Centralizar toda la configuración

```
04-CONFIGURATION/
├── deployment/                     ← Config de deployment
├── environments/                   ← Variables de ambiente
├── git-config/
│   └── .gitconfig
├── tool-configs/
    ├── docker-compose.yml
    ├── Dockerfile
    ├── requirements.txt
    ├── package.json
    ├── tsconfig.json
    ├── playwright.config.ts
    ├── openapi.yaml
    └── vercel.json
```

**Importante**:
- NO commitear archivos de ambiente reales
- Usar templates (.env.template)
- Mantener .gitignore actualizado

---

## 📦 05-INSTALLERS/ - Instaladores

**Propósito**: Centralizar todos los instaladores descargados

```
05-INSTALLERS/
├── dmg-files/                      ← Instaladores macOS
│   ├── Docker.dmg
│   ├── Figma.dmg
│   ├── LM-Studio-*.dmg
│   └── ...
├── exe-files/                      ← Ejecutables Windows
│   ├── AADConnectProvisioningAgentSetup.exe
│   ├── VisualStudioSetup.exe
│   └── ...
├── msi-files/                      ← Instaladores MSI
│   ├── AzureADConnect.msi
│   ├── GcaInstaller*.msi
│   └── ...
└── zip-archives/                   ← Archivos comprimidos
    ├── HAIDA_Instalador.zip
    ├── Presentación*.zip
    └── ...
```

---

## 💾 06-DOWNLOADS/ - Archivos Descargados

**Propósito**: Organizar archivos descargados por tipo

```
06-DOWNLOADS/
├── images/                         ← Imágenes PNG, JPG
│   ├── IMG_0031.PNG
│   ├── Untitled design*.PNG
│   └── ...
├── csv-exports/                    ← Exportaciones CSV
│   ├── Administrar contactos_exportar.csv
│   ├── Productos_*.csv
│   └── ...
├── pdf-documents/                  ← Documentos PDF
│   ├── ISTQB Glosario.pdf
│   └── usuario.pdf
└── archives/                       ← Archivos de texto y otros
    ├── terminal2.txt
    ├── Texto de Terminal*.txt
    └── ...
```

---

## 🔐 07-SECURITY/ - Seguridad

**Propósito**: Mantener de forma segura certificados, keys y backups

```
07-SECURITY/
├── backups/                        ← Backups automáticos
│   └── Security_Backup_0907/
├── certificates/                   ← Certificados SSL/TLS
│   ├── haida.crt
│   ├── prod-ca-2021.crt
│   └── haida.key
└── keys/                           ← Claves privadas
```

**IMPORTANTE**:
- Permisos restrictivos (600)
- NO subir a git
- NO compartir
- Acceso solo local

---

## 📦 08-ARCHIVE/ - Versiones Antiguas

**Propósito**: Almacenar versiones antiguas y deprecated

```
08-ARCHIVE/
├── old-haida-versions/             ← Versiones antiguas de HAIDA
│   ├── HAIDA-main/
│   ├── HAIDA-2/
│   ├── HAIDA_Instalador/
│   └── HAIDA2/
├── obsolete-scripts/               ← Scripts deprecated
└── legacy-projects/                ← Proyectos antiguos
```

**Nota**: Solo para referencia, no es para desarrollo activo

---

## 🔧 Archivos de Sistema (Home)

Estos archivos están en la raíz de `/Users/carlosa/`:

```
.bashrc, .zshrc              ← Shell configuration
.gitignore, .gitconfig       ← Git configuration
.claude/, .codex/            ← CLI configuration
.vscode/, .cursor/           ← Editor configuration
.ssh/, .config/              ← System configuration
Library/, Desktop/, etc.     ← macOS system folders
```

---

## 🎯 Guía Rápida por Tarea

### "Necesito trabajar en HAIDA"
→ Ve a `/Users/carlosa/00-PROJECTS/HAIDA/`
- Desarrollo: `haida-main/dev/`
- Producción: `haida-production/main/`

### "Necesito las auditorías"
→ Ve a `/Users/carlosa/01-DOCUMENTATION/CONSOLIDATION/audits/`

### "Necesito ejecutar automatización"
→ Ve a `/Users/carlosa/02-AUTOMATION-SCRIPTS/consolidation/`
```bash
bash automate-claude-consolidation.sh all
```

### "Necesito tests de Privalia"
→ Ve a `/Users/carlosa/00-PROJECTS/PRIVALIA/tests/`

### "Necesito configuración"
→ Ve a `/Users/carlosa/04-CONFIGURATION/`

### "Necesito un instalador"
→ Ve a `/Users/carlosa/05-INSTALLERS/`

### "Busco documentación técnica"
→ Ve a `/Users/carlosa/01-DOCUMENTATION/TECHNICAL/`

---

## 📈 Estadísticas

- **Directorios creados**: 40+
- **Archivos movidos**: 95
- **Proyectos organizados**: 3 (HAIDA, PRIVALIA, CTB)
- **Categorías de documentación**: 3 (Consolidation, Technical, Presentations)
- **Niveles de profundidad**: 3-4 niveles máximo (fácil navegación)

---

## ✅ Checklist para Mantener la Organización

- [ ] **Nuevos proyectos** → Crear en `00-PROJECTS/`
- [ ] **Documentación** → Guardar en `01-DOCUMENTATION/`
- [ ] **Scripts nuevos** → Ir a `02-AUTOMATION-SCRIPTS/`
- [ ] **Datos de test** → Guardar en `03-TESTING-DATA/`
- [ ] **Config files** → Centralizar en `04-CONFIGURATION/`
- [ ] **Instaladores** → Mover a `05-INSTALLERS/`
- [ ] **Descargas** → Categorizar en `06-DOWNLOADS/`
- [ ] **Certificados** → Guardar en `07-SECURITY/`
- [ ] **Versiones antiguas** → Archivar en `08-ARCHIVE/`

---

## 🎓 Convenciones

### Nombres de Directorios
- Números para orden: `00-`, `01-`, `02-`, etc.
- Kebab-case: `haida-main`, `postman-collections`
- Descriptivos: Evitar abreviaturas confusas

### Archivos
- Mantener extensiones claras: `.md`, `.json`, `.yml`, `.sh`
- Nombres descriptivos en inglés o español (consistente)
- Versiones antiguas: Mover a `08-ARCHIVE/`

### Profundidad Máxima
- Nivel 1: Categorías principales (00, 01, etc.)
- Nivel 2: Subcategorías (haida, postman-collections, etc.)
- Nivel 3: Contenido específico (dentro de cada subcategoría)
- Nivel 4: Máximo, para contenido anidado

---

## 📞 Preguntas Frecuentes

**P: ¿Dónde pongo nuevos scripts?**
R: En `02-AUTOMATION-SCRIPTS/`, en la subcarpeta apropiada (consolidation, deployment, testing, utilities)

**P: ¿Dónde guardo la documentación de un cliente?**
R: En `00-PROJECTS/[CLIENTE]/documentation/`

**P: ¿Qué hago con archivos obsoletos?**
R: Muévelos a `08-ARCHIVE/` con una carpeta descriptiva

**P: ¿Dónde están los backups de seguridad?**
R: En `07-SECURITY/backups/` (siempre local, nunca cloud)

**P: ¿Puedo agregar nuevas categorías?**
R: Sí, pero mantén el patrón `0X-NOMBRE/` al inicio para ordenar

---

**Última actualización**: 09 de Enero 2026
**Mantenedor**: Carlos Arévalo
**Versión**: 1.0
