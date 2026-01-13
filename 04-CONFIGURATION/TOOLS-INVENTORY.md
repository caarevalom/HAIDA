# Inventario de Herramientas de Configuración

Documentación completa de todas las herramientas de desarrollo y sus configuraciones en el sistema.

## 📊 Resumen

- **Total de herramientas configuradas**: 57 directorios/archivos
- **Categorías principales**: 5 (Desarrollo, Gestión de paquetes, Cloud, AI, Otros)
- **Directorio principal**: `/Users/carlosa/` (home directory)

## 🛠️ Herramientas de Desarrollo

| Herramienta | Directorio | Propósito | Backup |
|-----------|-----------|----------|--------|
| **VSCode** | `.vscode/` | Configuración de Visual Studio Code | ✅ Sí |
| **Cursor** | `.cursor/` | Configuración de Cursor IDE | ✅ Sí |
| **Cline** | `.cline/` | Configuración de Cline | ✅ Sí |
| **Wallaby** | `.wallaby/` | Configuración de Wallaby.js | ✅ Sí |
| **Quokka** | `.quokka/` | Configuración de Quokka.js | ✅ Sí |
| **SonarLint** | `.sonarlint/` | Configuración de análisis de código | ✅ Sí |

## 📦 Gestión de Paquetes

| Herramienta | Directorio | Propósito | Backup | Contiene Credenciales |
|-----------|-----------|----------|--------|----------------------|
| **npm** | `.npm/` | Cache y configuración de npm | ⚠️ Opcional | ❌ No |
| **npm global** | `.npm-global/` | Paquetes npm instalados globalmente | ⚠️ Opcional | ❌ No |
| **npm config** | `.npmrc` | Configuración de npm | ✅ Sí | ⚠️ Posible |
| **Rustup** | `.rustup/` | Gestor de Rust | ⚠️ Opcional | ❌ No |
| **SwiftPM** | `.swiftpm/` | Package Manager de Swift | ⚠️ Opcional | ❌ No |

## ☁️ Cloud y Servicios

| Herramienta | Directorio | Propósito | Backup | Contiene Credenciales |
|-----------|-----------|----------|--------|----------------------|
| **Azure** | `.azure/` | Configuración de Azure CLI | ✅ Sí | ✅ Sí** |
| **Railway** | `.railway/` | Configuración de Railway | ✅ Sí | ✅ Sí** |
| **Vercel** | `.vercel/` | Configuración de Vercel | ✅ Sí | ✅ Sí** |
| **Kube** | `.kube/` | Configuración de Kubernetes | ✅ Sí | ✅ Sí** |
| **LMStudio** | `.lmstudio/` | Configuración de LM Studio | ⚠️ Opcional | ❌ No |

## 🤖 Herramientas de IA

| Herramienta | Directorio | Propósito | Backup | Contiene Credenciales |
|-----------|-----------|----------|--------|----------------------|
| **Claude Code** | `.claude/` | Configuración de Claude Code | ✅ Sí | ✅ Sí** |
| **Codex** | `.codex/` | Configuración de Codex | ⚠️ Opcional | ❌ No |
| **Copilot** | `.copilot/` | Configuración de GitHub Copilot | ✅ Sí | ✅ Sí** |
| **Gemini** | `.gemini/` | Configuración de Google Gemini | ⚠️ Opcional | ✅ Sí** |
| **AITK** | `.aitk/` | Configuración de AITK | ⚠️ Opcional | ❌ No |
| **OTK** | `.otk/` | Herramientas de OpenTelemetry | ⚠️ Opcional | ❌ No |
| **Abacus AI** | `.abacusai/` | Configuración de Abacus AI | ⚠️ Opcional | ❌ No |

## 🔐 Seguridad y Control de Versiones

| Herramienta | Directorio | Propósito | Backup | Contiene Credenciales |
|-----------|-----------|----------|--------|----------------------|
| **SSH** | `.ssh/` | Claves SSH | ✅ Sí** | ✅ Sí** |
| **Git** | `.git/` | Repositorio Git | ✅ Sí | ⚠️ Posible |
| **Git Hooks** | `.git-hooks/` | Scripts de Git hooks | ✅ Sí | ❌ No |
| **Git Secrets** | `.git-secrets-*` | Validación de secretos | ✅ Sí | ❌ No |

## 📁 Otros Directorios

| Herramienta | Directorio | Propósito | Backup | Contiene Credenciales |
|-----------|-----------|----------|--------|----------------------|
| **Config General** | `.config/` | Configuración del sistema | ⚠️ Opcional | ❌ No |
| **Cache** | `.cache/` | Archivos de cache | ❌ No | ❌ No |
| **Local** | `.local/` | Datos locales del usuario | ⚠️ Opcional | ❌ No |
| **Trash** | `.Trash/` | Papelera del sistema | ❌ No | ❌ No |
| **Claude Monitor** | `.claude-monitor/` | Monitoreo de Claude Code | ⚠️ Opcional | ❌ No |
| **Claude Config Backups** | `.claude-config-backups/` | Backups de configuración | ✅ Sí | ✅ Sí** |
| **CLI M365** | `.cli-m365-*` | Configuración de Microsoft 365 CLI | ✅ Sí | ✅ Sí** |

## 📝 Archivos de Configuración Sueltos

| Archivo | Ubicación | Propósito | Backup | Credenciales |
|---------|-----------|----------|--------|--------------|
| `.bashrc` | Home | Configuración de Bash | ✅ Sí | ❌ No |
| `.zshrc` | Home | Configuración de Zsh | ✅ Sí | ❌ No |
| `.zprofile` | Home | Perfil de Zsh | ✅ Sí | ❌ No |
| `.tmux.conf` | Home | Configuración de Tmux | ✅ Sí | ❌ No |
| `.fzf.bash` | Home | Configuración de fzf (Bash) | ✅ Sí | ❌ No |
| `.fzf.zsh` | Home | Configuración de fzf (Zsh) | ✅ Sí | ❌ No |
| `.npmrc` | Home | Configuración de npm | ✅ Sí | ⚠️ Posible |
| `.gitignore` | Home | Git ignore rules | ✅ Sí | ❌ No |
| `.env.local` | Home (alt) | Variables de entorno locales | ✅ Sí** | ✅ Sí** |

## 🔐 Política de Backup

### ✅ CRÍTICO - Hacer backup siempre

- `.ssh/` - Claves privadas SSH
- `.claude/` - Configuración sensible de Claude Code
- `.azure/`, `.railway/`, `.vercel/` - Credenciales cloud
- `.copilot/`, `.gemini/` - Configuración de AI
- `.cli-m365-*` - Credenciales de Microsoft 365
- `.env` archivos

### ✅ IMPORTANTE - Hacer backup regularmente

- `.vscode/`, `.cursor/`, `.cline/` - Preferencias de IDEs
- `.git/` - Historial de repositorio
- Archivos de shell (`.bashrc`, `.zshrc`, etc.)
- `.npmrc` - Configuración de paquetes

### ⚠️ OPCIONAL - Backup según necesidad

- `.npm/`, `.npm-global/` - Caches de paquetes (reconstruibles)
- `.cache/` - Archivos de cache (reconstruibles)
- `.rustup/`, `.swiftpm/` - SDKs (reinstalables)
- `.local/` - Datos locales (usualmente reconstruibles)

### ❌ NO NECESITA BACKUP

- `.Trash/` - Papelera del sistema
- `.zsh_sessions/` - Sesiones de terminal
- `.zsh_history` - Historial de comandos (opcional)

## 🔒 Seguridad y Credenciales

### Directorios que contienen credenciales (SENSIBLES)

**Marcar con:** `*** SENSIBLE ***`

- `.ssh/` - Claves privadas
- `.claude/.credentials.json` - Credenciales de Claude
- `.azure/`, `.railway/`, `.vercel/` - Tokens y credenciales cloud
- `.cli-m365-*` - Tokens de Microsoft
- `.copilot/`, `.gemini/` - Credenciales de AI
- `.kube/` - Certificados de Kubernetes
- `.env`, `.env.local` - Variables sensibles
- `.claude-config-backups/` - Backups con credenciales

### Recomendaciones de Seguridad

1. ✅ **Backup seguro**: Cifrar backups que contengan credenciales
2. ✅ **Permisos**: `chmod 600` en archivos sensibles
3. ✅ **Rotación**: Cambiar credenciales periódicamente
4. ✅ **Git ignore**: Asegurar que `.env` y credenciales no se commitean
5. ✅ **Sincronización**: Usar password manager para credenciales

## 📈 Tamaño y Almacenamiento

| Categoría | Tamaño Aproximado | Crítico |
|-----------|------------------|--------|
| `.npm/` + `node_modules` | ~100-500 MB | ⚠️ Reconstruible |
| `.cache/` | ~50-200 MB | ❌ No |
| `.claude/` | ~50-150 MB | ✅ Sí |
| `.rustup/` | ~5-10 GB | ⚠️ Reinstalable |
| `.local/` | ~10-100 MB | ⚠️ Opcional |
| **Total estimado** | **~200-500 MB** | - |

## 🔄 Mantenimiento Recomendado

```bash
# Limpiar caches (mensual)
rm -rf ~/.cache/*
rm -rf ~/.npm-global/

# Verificar tamaño de directorios (trimestral)
du -sh ~/* | sort -h

# Backup de configuraciones críticas (semanal/mensual)
tar -czf ~/backup-critical-$(date +%Y%m%d).tar.gz \
  ~/.ssh ~/.claude ~/.azure ~/.vercel

# Revisar y actualizar credenciales (trimestral)
# Cambiar tokens/keys que sean antiguos
```

## 📚 Referencias Rápidas

- **Claude Code Setup**: Ver `/Users/carlosa/.claude/PREFERENCES.md`
- **Git Configuration**: Ver `/Users/carlosa/04-CONFIGURATION/git-config/`
- **Despliegue**: Ver `/Users/carlosa/04-CONFIGURATION/deployment/`
- **Environment Variables**: Ver `/Users/carlosa/04-CONFIGURATION/.env`

---

**Última actualización**: 11 de enero, 2026
**Versión**: 1.0 - Inventario Completo
**Mantenedor**: Sistema Personalizado
