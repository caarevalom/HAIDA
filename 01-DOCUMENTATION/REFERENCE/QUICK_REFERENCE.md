# ⚡ Quick Reference - Acceso Rápido

**Guía de atajos y comandos más usados**

---

## 🎯 Acceso a Proyectos

```bash
# HAIDA - Desarrollo
cd /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev

# HAIDA - Producción
cd /Users/carlosa/00-PROJECTS/HAIDA/haida-production/main

# PRIVALIA
cd /Users/carlosa/00-PROJECTS/PRIVALIA/client-repos/main

# CTB
cd /Users/carlosa/00-PROJECTS/CTB/client-repos/main
```

---

## 🤖 Ejecutar Automación

```bash
# 🚀 EJECUTAR TODO DE UNA VEZ (recomendado)
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/consolidation/automate-claude-consolidation.sh all

# O ejecutar por fases individuales:

# Fase 1: Limpiar configuración
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/consolidation/consolidate-claude-config.sh

# Fase 2: Instalar git-secrets
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/consolidation/install-git-secrets.sh

# Fase 3: Validar configuración
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/consolidation/validate-claude-config.sh

# Fase 4: Iniciar monitoreo
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/consolidation/monitor-claude-config.sh --daemon

# Ver estado del monitor
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/consolidation/monitor-claude-config.sh --status

# Detener monitor
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/consolidation/monitor-claude-config.sh --stop
```

---

## 📚 Acceso a Documentación

```bash
# Guía de navegación (empezar aquí)
cat /Users/carlosa/NAVIGATION_GUIDE.md

# Consolidación MAESTRO (plan principal)
cat /Users/carlosa/01-DOCUMENTATION/CONSOLIDATION/audits/CONSOLIDACION_MAESTRO_HAIDA_VERIFIED.md

# Audit de integraciones
cat /Users/carlosa/01-DOCUMENTATION/CONSOLIDATION/audits/INTEGRACIONES_AUDIT_HAIDA_DETALLADO.md

# Plan de deprecación de versiones antiguas
cat /Users/carlosa/01-DOCUMENTATION/CONSOLIDATION/audits/PLAN_DEPRECACION_VERSIONES_VIEJAS.md

# Audit de configuración Claude Code
cat /Users/carlosa/01-DOCUMENTATION/CONSOLIDATION/audits/CLAUDE_CODE_CONFIGURATION_AUDIT.md

# Resumen ejecutivo
cat /Users/carlosa/01-DOCUMENTATION/CONSOLIDATION/audits/RESUMEN_AUDITORIA_FINAL.md
```

---

## 🔐 Seguridad

```bash
# Ver alertas de monitoreo EN TIEMPO REAL
tail -f ~/.claude-monitor/alerts.log

# Ver reporte de monitoreo
cat ~/.claude-monitor/monitor-report-20260109.txt

# Ver backups disponibles
ls -lah ~/.claude-config-backups/

# Restaurar backup (si es necesario)
cp ~/.claude-config-backups/settings.json.backup-20260109-230935 ~/.claude/settings.json

# Ver qué secretos fueron encontrados
cat ~/.claude-config-backups/SECRETS_FOUND_20260109-230935.txt

# Limpiar git history de secretos (si es necesario)
bash /Users/carlosa/.git-secrets-cleanup

# Validar que no hay secretos en repo
bash /Users/carlosa/.validate-no-secrets /Users/carlosa/00-PROJECTS/HAIDA/haida-production/main
```

---

## 🧪 Testing

```bash
# Ver colecciones Postman
ls -la /Users/carlosa/03-TESTING-DATA/postman-collections/

# Ver fixtures de test
ls -la /Users/carlosa/03-TESTING-DATA/fixtures/tests/

# Ver reportes de test
ls -la /Users/carlosa/03-TESTING-DATA/test-reports/

# Ver datos demo
ls -la /Users/carlosa/03-TESTING-DATA/demo-data/
```

---

## 📁 Operaciones de Archivos

```bash
# Listar estructura principal
ls -la /Users/carlosa/ | grep "^d"

# Ver qué hay en cada categoría
echo "PROYECTOS:" && ls /Users/carlosa/00-PROJECTS/
echo "DOCUMENTACIÓN:" && ls /Users/carlosa/01-DOCUMENTATION/
echo "SCRIPTS:" && ls /Users/carlosa/02-AUTOMATION-SCRIPTS/
echo "TESTING:" && ls /Users/carlosa/03-TESTING-DATA/
echo "CONFIGURACIÓN:" && ls /Users/carlosa/04-CONFIGURATION/
echo "INSTALADORES:" && ls /Users/carlosa/05-INSTALLERS/
echo "DESCARGAS:" && ls /Users/carlosa/06-DOWNLOADS/
echo "SEGURIDAD:" && ls /Users/carlosa/07-SECURITY/
echo "ARCHIVO:" && ls /Users/carlosa/08-ARCHIVE/

# Buscar archivos en estructura nueva
find /Users/carlosa/00-PROJECTS -name "*.py" | head -20
find /Users/carlosa/01-DOCUMENTATION -name "*.md" | head -20
find /Users/carlosa/02-AUTOMATION-SCRIPTS -name "*.sh"
```

---

## 🔧 Configuración

```bash
# Ver configuración de Docker
cat /Users/carlosa/04-CONFIGURATION/tool-configs/docker-compose.yml

# Ver configuración de Vercel
cat /Users/carlosa/04-CONFIGURATION/tool-configs/vercel.json

# Ver configuración de TypeScript
cat /Users/carlosa/04-CONFIGURATION/tool-configs/tsconfig.json

# Ver OpenAPI spec
cat /Users/carlosa/04-CONFIGURATION/tool-configs/openapi.yaml

# Ver configuración de git
cat /Users/carlosa/04-CONFIGURATION/git-config/.gitconfig
```

---

## 📊 Estadísticas Rápidas

```bash
# Contar archivos por categoría
echo "Documentos de consolidación:"
find /Users/carlosa/01-DOCUMENTATION/CONSOLIDATION -type f | wc -l

echo "Scripts:"
find /Users/carlosa/02-AUTOMATION-SCRIPTS -type f | wc -l

echo "Archivos en HAIDA desarrollo:"
find /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev -type f | wc -l

echo "Archivos en HAIDA producción:"
find /Users/carlosa/00-PROJECTS/HAIDA/haida-production/main -type f | wc -l

# Ver tamaño de cada categoría
du -sh /Users/carlosa/{00,01,02,03,04,05,06,07,08}-*
```

---

## 🎓 Cambios de Rutas (Actualizar Referencias)

Si tienes scripts o referencias a rutas antiguas, actualiza:

```bash
# ANTIGUO → NUEVO

/Users/carlosa/HAIDA-PROJECT
  → /Users/carlosa/00-PROJECTS/HAIDA/haida-production/main

/Users/carlosa/HAIDA
  → /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev

/Users/carlosa/Privalia
  → /Users/carlosa/00-PROJECTS/PRIVALIA/client-repos/main

/Users/carlosa/CTB
  → /Users/carlosa/00-PROJECTS/CTB/client-repos/main

/Users/carlosa/*.md (documentos de consolidación)
  → /Users/carlosa/01-DOCUMENTATION/CONSOLIDATION/

/Users/carlosa/*.sh (scripts)
  → /Users/carlosa/02-AUTOMATION-SCRIPTS/[categoría]/

/Users/carlosa/postman/
  → /Users/carlosa/03-TESTING-DATA/postman-collections/

/Users/carlosa/demo-reports/
  → /Users/carlosa/03-TESTING-DATA/test-reports/
```

---

## 🎯 Tareas Comunes

### "Necesito ver qué ha cambiado en monitoreo"
```bash
tail -f ~/.claude-monitor/alerts.log
cat ~/.claude-monitor/monitor-report-20260109.txt
```

### "Quiero ejecutar la consolidación nuevamente"
```bash
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/consolidation/automate-claude-consolidation.sh all
```

### "Necesito encontrar un script específico"
```bash
find /Users/carlosa/02-AUTOMATION-SCRIPTS -name "*deploy*"
find /Users/carlosa/02-AUTOMATION-SCRIPTS -name "*validate*"
find /Users/carlosa/02-AUTOMATION-SCRIPTS -name "*monitor*"
```

### "Quiero revisar los certificates"
```bash
ls -la /Users/carlosa/07-SECURITY/certificates/
openssl x509 -in /Users/carlosa/07-SECURITY/certificates/haida.crt -text -noout
```

### "Necesito hacer backup de HAIDA"
```bash
tar -czf ~/haida-backup-$(date +%Y%m%d).tar.gz /Users/carlosa/00-PROJECTS/HAIDA/
```

### "Quiero limpiar memoria"
```bash
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/utilities/memory_cleaner.sh
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/utilities/security_cleaner.sh
```

---

## 🚨 Troubleshooting

### Script no encontrado
```bash
# Verificar que existe
ls /Users/carlosa/02-AUTOMATION-SCRIPTS/consolidation/

# Dar permisos
chmod +x /Users/carlosa/02-AUTOMATION-SCRIPTS/consolidation/*.sh
```

### Monitor no corre
```bash
# Ver si está corriendo
bash /Users/carlosa/monitor-claude-config.sh --status

# Reiniciar
bash /Users/carlosa/monitor-claude-config.sh --stop
bash /Users/carlosa/monitor-claude-config.sh --daemon --interval 3600
```

### No puedo encontrar un archivo
```bash
# Buscar recursivamente
find /Users/carlosa -name "*.md" -type f
find /Users/carlosa -name "*.sh" -type f
find /Users/carlosa -name "*HAIDA*" -type f
```

---

## 📱 Alias Útiles (Agregar a .zshrc)

```bash
# Agregar a ~/.zshrc
alias haida-dev="cd /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev"
alias haida-prod="cd /Users/carlosa/00-PROJECTS/HAIDA/haida-production/main"
alias consolidate="bash /Users/carlosa/02-AUTOMATION-SCRIPTS/consolidation/automate-claude-consolidation.sh all"
alias validate="bash /Users/carlosa/02-AUTOMATION-SCRIPTS/consolidation/validate-claude-config.sh"
alias monitor-status="bash /Users/carlosa/monitor-claude-config.sh --status"
alias alerts="tail -f ~/.claude-monitor/alerts.log"
alias scripts-list="find /Users/carlosa/02-AUTOMATION-SCRIPTS -type f -name '*.sh' -o -name '*.ps1'"
alias docs="cd /Users/carlosa/01-DOCUMENTATION"

# Después, source the file:
source ~/.zshrc

# Ahora puedes usar:
haida-dev
haida-prod
consolidate
validate
monitor-status
alerts
scripts-list
docs
```

---

## 📋 Checklist de Uso

- [ ] He revisado NAVIGATION_GUIDE.md
- [ ] He visto la nueva estructura
- [ ] He ejecutado consolidation scripts (automate-claude-consolidation.sh all)
- [ ] He validado que no hay secretos (validate-claude-config.sh)
- [ ] He comprobado que el monitor está corriendo
- [ ] He actualizado referencias a rutas antiguas
- [ ] He compartido NAVIGATION_GUIDE.md con el equipo
- [ ] He configurado los aliases de .zshrc

---

**Última actualización**: 09 de Enero 2026
**Versión**: 1.0
