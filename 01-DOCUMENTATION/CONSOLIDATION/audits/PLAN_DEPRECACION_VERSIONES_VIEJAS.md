# PLAN DE DEPRECACIÓN - VERSIONES VIEJAS DE HAIDA
## Sunset Strategy para Consolidación

**Fecha**: 09 de Enero de 2026
**Objetivo**: Eliminar 5 versiones antiguas, mantener solo 2 activas
**Timeline**: 3 semanas (Fase 2 completa)

---

## TABLA DE CONTENIDOS

1. [Versiones a Deprecar](#versiones-a-deprecar)
2. [Timeline de Deprecación](#timeline-de-deprecación)
3. [Proceso Detallado](#proceso-detallado)
4. [Consideraciones Especiales](#consideraciones-especiales)
5. [Rollback Plan](#rollback-plan)

---

## VERSIONES A DEPRECAR

### Resumen

```
┌─────────────────────────────────────────────────────────────────┐
│           ESTADO ACTUAL DE VERSIONES HAIDA                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ✅ MANTENER (2 versiones)                                       │
│  ├─ HAIDA (23-bug) → Convertir a rama de desarrollo             │
│  └─ HAIDA-PROJECT (main) → Producción oficial                  │
│                                                                  │
│  ❌ DEPRECAR (5 versiones)                                       │
│  ├─ HAIDA-main (copia antigua de HAIDA-PROJECT)                │
│  ├─ HAIDA-2 (experimento fallido)                              │
│  ├─ HAIDA_Instalador (setup script desuso)                     │
│  ├─ test_haida_build (build test, nunca usado)                 │
│  └─ haida_backup_2024 (backup manual antiguo)                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Detalle de Versiones a Deprecar

#### 1. HAIDA-main
**Ubicación**: `/Users/carlosa/HAIDA-main/`
**Tipo**: Local git repo (copia antigua)
**Estado**: ⚠️ Completamente fuera de sincronización
**Tamaño**: ~189,000 archivos (~8.5 GB)
**Último Commit**: Nov 2024
**Motivo Deprecación**: Duplicate de HAIDA-PROJECT, crea confusión

**Acción**:
```bash
# 1. Verificar que no hay cambios locales no commiteados
cd /Users/carlosa/HAIDA-main
git status

# 2. Si hay cambios, salvarlos
git stash save "HAIDA-main-final-backup-$(date +%Y%m%d)"

# 3. Crear archivo README de deprecación
cat > README-DEPRECATED.md << 'EOF'
# ⚠️ DEPRECATED VERSION

Esta es una versión antigua de HAIDA que ha sido deprecada.

## Qué pasó:
- Esta versión era una copia redundante de HAIDA-PROJECT
- La versión activa es ahora: `/Users/carlosa/HAIDA-PROJECT`
- Esta carpeta será eliminada en Enero 2026

## Si necesitas código de aquí:
1. Usa `git log --all --full-history -- <archivo>` en HAIDA-PROJECT
2. O usa `git show HAIDA-main:path/to/file` para revisar

## Migración completada:
- Todos los cambios activos están en HAIDA-PROJECT
- HAIDA-main solo existe para archivo histórico
EOF

# 4. Mover a carpeta de archive
mkdir -p /Users/carlosa/_DEPRECATED_VERSIONS
mv /Users/carlosa/HAIDA-main /Users/carlosa/_DEPRECATED_VERSIONS/HAIDA-main-archived-$(date +%Y%m%d)

# 5. Crear file de referencia
touch /Users/carlosa/HAIDA-main-MOVED-TO-DEPRECATED.txt
```

#### 2. HAIDA-2
**Ubicación**: `/Users/carlosa/HAIDA-2/`
**Tipo**: Experimento fallido
**Estado**: ⚠️ Rama experimental nunca completada
**Tamaño**: ~176,000 archivos (~7.2 GB)
**Último Commit**: Aug 2024
**Motivo Deprecación**: Experimento abandonado, no integrado a producción

**Acción**: Mismo proceso que HAIDA-main

#### 3. HAIDA_Instalador
**Ubicación**: `/Users/carlosa/HAIDA_Instalador/`
**Tipo**: Setup/installation script
**Estado**: ❌ Completamente obsoleto
**Tamaño**: ~45,000 archivos (~2.1 GB)
**Último Commit**: May 2024
**Motivo Deprecación**: Reemplazado por docker-compose.yml y setup-local.sh

**Acción**:
```bash
# 1. Revisar si tiene scripts útiles
ls -la /Users/carlosa/HAIDA_Instalador/scripts/

# 2. Copiar cualquier script útil a HAIDA-PROJECT/scripts/
cp -i /Users/carlosa/HAIDA_Instalador/scripts/*.sh /Users/carlosa/HAIDA-PROJECT/scripts/

# 3. Documentar en git
git -C /Users/carlosa/HAIDA-PROJECT add scripts/
git -C /Users/carlosa/HAIDA-PROJECT commit -m "chore: migrate legacy installer scripts"

# 4. Deprecar carpeta antigua
mkdir -p /Users/carlosa/_DEPRECATED_VERSIONS
mv /Users/carlosa/HAIDA_Instalador /Users/carlosa/_DEPRECATED_VERSIONS/HAIDA_Instalador-archived-$(date +%Y%m%d)
```

#### 4. test_haida_build
**Ubicación**: `/Users/carlosa/test_haida_build/`
**Tipo**: Build test directory
**Estado**: ❌ Nunca fue usado
**Tamaño**: ~12,000 archivos (~0.5 GB)
**Motivo Deprecación**: Test artifacts, no repositorio vivo

**Acción**:
```bash
# Simplemente eliminar
rm -rf /Users/carlosa/test_haida_build

# Crear referencia
echo "Deleted: test_haida_build (build artifacts, no longer needed)" >> /Users/carlosa/DEPRECATION_LOG.txt
```

#### 5. haida_backup_2024
**Ubicación**: `/Users/carlosa/haida_backup_2024/`
**Tipo**: Manual backup zip
**Estado**: ⚠️ Archivo comprimido de backup antiguo
**Tamaño**: ~1.2 GB (comprimido)
**Motivo Deprecación**: Backup superseded por Supabase backups

**Acción**:
```bash
# 1. Verificar contenido
unzip -l /Users/carlosa/haida_backup_2024.zip | head -20

# 2. Si contiene datos importantes (schema SQL, etc):
unzip -j /Users/carlosa/haida_backup_2024.zip "*schema*" -d /Users/carlosa/_ARCHIVES/

# 3. Eliminar backup antiguo
rm /Users/carlosa/haida_backup_2024.zip

# 4. Documentar
echo "Deleted: haida_backup_2024.zip (replaced by Supabase automated backups)" >> /Users/carlosa/DEPRECATION_LOG.txt
```

---

## TIMELINE DE DEPRECACIÓN

### Week 1 - Preparación (Days 1-2, Fase 2)
**Estado**: Ambas versiones activas simultáneamente

```
Monday:
- [ ] Crear archivo DEPRECATION_LOG.txt
- [ ] Crear directorio _DEPRECATED_VERSIONS/
- [ ] Revisar cada versión antigua por contenido valioso
- [ ] Salvar cualquier script útil a HAIDA-PROJECT

Wednesday:
- [ ] Comunicar a team: "Deprecation iniciada"
- [ ] Dar 48 horas para que cualquiera reporte código que necesita salvar
- [ ] Verificar no hay deployments de versiones viejas
```

### Week 2 - Transición (Days 3-7, Fase 2)
**Estado**: Versiones viejas en modo "read-only"

```
Monday:
- [ ] Crear README-DEPRECATED.md en cada carpeta antigua
- [ ] Agregar .noDeploy flag o similar para prevenir accidents
- [ ] Mover primeras 3 versiones a _DEPRECATED_VERSIONS/:
    - [ ] HAIDA-main
    - [ ] HAIDA-2
    - [ ] HAIDA_Instalador

Wednesday:
- [ ] Verificar no hay referencias a rutas viejas en:
    - [ ] Scripts de deployment
    - [ ] CI/CD workflows
    - [ ] Documentación local
- [ ] Actualizar cualquier ruta hardcodeada a nuevas ubicaciones

Friday:
- [ ] Delete test_haida_build (build artifacts)
- [ ] Archive haida_backup_2024
- [ ] Verificar ambiente completo aún funciona
```

### Week 3 - Finalización (Days 8-14, Fase 2)
**Estado**: Versiones viejas completamente removidas

```
Monday:
- [ ] Final verification que todas las versiones activas trabajan
- [ ] Test full cycle: push → CI → deploy → production
- [ ] Document que deprecation completada

Wednesday:
- [ ] Crear CONSOLIDATION_COMPLETE marker
- [ ] Update team wiki/documentation
- [ ] Archive this plan en HAIDA-PROJECT/docs/

Friday:
- [ ] Cleanup local filesystem:
    - [ ] Remove symlinks a versiones viejas
    - [ ] Remove any TODOs que refieren a versionesantiguas
    - [ ] Verify disk space freed
```

---

## PROCESO DETALLADO

### Paso 1: Pre-Deprecation Audit

```bash
#!/bin/bash
# Script para auditar versiones viejas antes de deletear

for dir in HAIDA-main HAIDA-2 HAIDA_Instalador test_haida_build; do
    echo "=== Auditando $dir ==="

    if [ -d "/Users/carlosa/$dir" ]; then
        cd "/Users/carlosa/$dir"

        # Listar cambios locales no commiteados
        echo "Local changes:"
        git status --short

        # Mostrar último commit
        echo "Last commit:"
        git log -1 --format="%H %s (%aI)"

        # Calcular tamaño
        echo "Tamaño:"
        du -sh .

        # Listar ramas
        echo "Ramas:"
        git branch -a

        echo ""
    fi
done
```

### Paso 2: Backup de Seguridad

```bash
#!/bin/bash
# Backup antes de cualquier deletion

BACKUP_DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/Users/carlosa/HAIDA_BACKUP_PRE_DEPRECATION_$BACKUP_DATE"

mkdir -p "$BACKUP_DIR"

# Backup de cada versión antigua
for version in HAIDA-main HAIDA-2 HAIDA_Instalador; do
    if [ -d "/Users/carlosa/$version" ]; then
        echo "Backing up $version..."
        tar -czf "$BACKUP_DIR/$version.tar.gz" \
            -C /Users/carlosa "$version" \
            --exclude '.git' \
            2>/dev/null

        # Guardar git refs
        cd "/Users/carlosa/$version"
        git bundle create "$BACKUP_DIR/$version.bundle" --all
    fi
done

echo "Backup completo en: $BACKUP_DIR"
du -sh "$BACKUP_DIR"
```

### Paso 3: Migración de Contenido Útil

```bash
#!/bin/bash
# Migrar cualquier script útil de versiones antiguas

HAIDA_PROJECT="/Users/carlosa/HAIDA-PROJECT"

# Scripts de HAIDA_Instalador
if [ -d "/Users/carlosa/HAIDA_Instalador/scripts" ]; then
    mkdir -p "$HAIDA_PROJECT/scripts/legacy"
    cp -v /Users/carlosa/HAIDA_Instalador/scripts/*.sh \
        "$HAIDA_PROJECT/scripts/legacy/" 2>/dev/null || true

    # Commit cambios
    cd "$HAIDA_PROJECT"
    git add scripts/legacy/
    git commit -m "chore: migrate legacy scripts for reference"
fi

# Documentación de HAIDA-main
if [ -d "/Users/carlosa/HAIDA-main/docs" ]; then
    mkdir -p "$HAIDA_PROJECT/docs/legacy"
    cp -r /Users/carlosa/HAIDA-main/docs/* \
        "$HAIDA_PROJECT/docs/legacy/" 2>/dev/null || true

    cd "$HAIDA_PROJECT"
    git add docs/legacy/
    git commit -m "chore: archive legacy documentation for reference"
fi
```

### Paso 4: Limpiar Referencias

```bash
#!/bin/bash
# Buscar y limpiar referencias a rutas antiguas

echo "Buscando referencias a versiones antiguas..."

for version in HAIDA-main HAIDA-2 HAIDA_Instalador; do
    echo ""
    echo "=== Buscando referencias a $version ==="

    grep -r "$version" /Users/carlosa/HAIDA-PROJECT \
        --exclude-dir=.git \
        --exclude-dir=node_modules \
        --exclude="*.log" 2>/dev/null || echo "No references found"

    grep -r "$version" /Users/carlosa/Privalia 2>/dev/null || echo "No references in Privalia"
    grep -r "$version" /Users/carlosa/CTB 2>/dev/null || echo "No references in CTB"
done
```

### Paso 5: Archivo y Cleanup

```bash
#!/bin/bash
# Mover versiones viejas a directorio archive

ARCHIVE_DIR="/Users/carlosa/_DEPRECATED_VERSIONS"
ARCHIVE_DATE=$(date +%Y%m%d)

mkdir -p "$ARCHIVE_DIR"

for version in HAIDA-main HAIDA-2 HAIDA_Instalador; do
    if [ -d "/Users/carlosa/$version" ]; then
        echo "Archiving $version..."
        mv "/Users/carlosa/$version" \
            "$ARCHIVE_DIR/${version}-archived-${ARCHIVE_DATE}"

        # Crear breadcrumb
        touch "/Users/carlosa/${version}-MOVED-TO-DEPRECATED"
    fi
done

echo ""
echo "Deprecated versions archived in: $ARCHIVE_DIR"
du -sh "$ARCHIVE_DIR"

# Cleanup build artifacts
rm -rf /Users/carlosa/test_haida_build

echo ""
echo "Cleanup complete!"
```

---

## CONSIDERACIONES ESPECIALES

### 1. Git History

**Problema**: Versiones viejas tienen git history con secrets expuestos

**Solución**:
```bash
# No eliminar .git en backups - podría necesitarse historial
# Usar git bundle en lugar de carpeta completa

# Ejemplo: restaurar archivo específico de rama antigua
git show HAIDA-2:backend/config.py > /tmp/old-config.py

# Luego deletear carpeta con git history
rm -rf /Users/carlosa/HAIDA-2
```

### 2. Symlinks y Aliases

**Verificar**:
```bash
# Listar cualquier symlink que apunte a versiones viejas
find /Users/carlosa -type l -ls 2>/dev/null | grep HAIDA

# Eliminar symlinks rotos
find /Users/carlosa -type l ! -exec test -e {} \; -print | xargs rm
```

### 3. Documentation y Scripts

**Actualizar**:
```bash
# Buscar referencias en docs
grep -r "HAIDA-main\|HAIDA-2" /Users/carlosa/HAIDA-PROJECT/docs/
grep -r "HAIDA-main\|HAIDA-2" /Users/carlosa/Privalia/
grep -r "HAIDA-main\|HAIDA-2" /Users/carlosa/CTB/

# Reemplazar
find /Users/carlosa/HAIDA-PROJECT/docs -name "*.md" -exec \
    sed -i 's|/Users/carlosa/HAIDA-main|/Users/carlosa/HAIDA-PROJECT|g' {} \;
```

### 4. Disk Space Recovery

**Expected Cleanup**:
```
HAIDA-main          : ~8.5 GB → Archive
HAIDA-2             : ~7.2 GB → Archive
HAIDA_Instalador    : ~2.1 GB → Archive
test_haida_build    : ~0.5 GB → Delete
haida_backup_2024   : ~1.2 GB → Delete

TOTAL FREED: ~19.5 GB

Archives (.tar.gz):
_DEPRECATED_VERSIONS: ~8-10 GB (compressed)

NET CLEANUP: ~9-11 GB
```

---

## ROLLBACK PLAN

**Si algo falla durante deprecation:**

### Scenario 1: Versión antigua todavía necesaria

```bash
# 1. Extraer del archive
tar -xzf /Users/carlosa/_DEPRECATED_VERSIONS/HAIDA-main-archived-20260109.tar.gz \
    -C /Users/carlosa

# 2. Restaurar git history si necesario
cd /Users/carlosa/HAIDA-main
git unbundle /Users/carlosa/_DEPRECATED_VERSIONS/HAIDA-main.bundle
```

### Scenario 2: Deployment broke después de deprecation

```bash
# 1. Listar backup git bundles
ls -la /Users/carlosa/_DEPRECATED_VERSIONS/*.bundle

# 2. Restaurar archivo específico
git show <bundle>:path/to/file

# 3. O restaurar carpeta completa desde archive
tar -xzf /Users/carlosa/_DEPRECATED_VERSIONS/HAIDA-PROJECT-backup-20260109.tar.gz
```

---

## DOCUMENTO DE VERIFICACIÓN

Después de completar deprecation, verificar:

```bash
#!/bin/bash
# Checklist post-deprecation

echo "=== POST-DEPRECATION VERIFICATION ==="

echo ""
echo "1. Directorio cleanup:"
ls -la /Users/carlosa | grep HAIDA

echo ""
echo "2. Active versions:"
for dir in HAIDA HAIDA-PROJECT; do
    echo "  $dir:"
    cd /Users/carlosa/$dir
    git log -1 --format="    Branch: %h - %s"
    echo "    URL: https://github.com/caarevalom/HAIDA (branch: $(git rev-parse --abbrev-ref HEAD))"
done

echo ""
echo "3. Disk space:"
du -sh /Users/carlosa/HAIDA* 2>/dev/null | sort -h

echo ""
echo "4. Archive status:"
du -sh /Users/carlosa/_DEPRECATED_VERSIONS

echo ""
echo "5. Deployment test:"
echo "  - [ ] HAIDA (23-bug) can connect to dev database"
echo "  - [ ] HAIDA-PROJECT (main) can connect to prod database"
echo "  - [ ] Vercel deployments working"

echo ""
echo "✅ Verification complete!"
```

---

## RESUMEN EJECUTIVO

### Qué está pasando:
- 5 versiones viejas de HAIDA están consumiendo ~19.5 GB de espacio
- Crean confusión sobre qué versión usar
- Contienen secrets en git history

### Qué vamos a hacer:
1. Backup de seguridad de todo
2. Migrar contenido útil a HAIDA-PROJECT
3. Mover versiones viejas a carpeta _DEPRECATED_VERSIONS
4. Eliminar build artifacts y backups obsoletos

### Timeline:
- Week 1: Preparación
- Week 2: Transición (mantener viejas como read-only)
- Week 3: Finalización (deletear completamente)

### Resultado:
- 2 versiones activas claramente definidas
- ~9-11 GB de disco freed
- Menor confusión en el équipo
- Secrets removidos de versiones viejas (aunque quedan en git history de branches antiguas)

---

**Plan Completo**: Enero 2026
**Responsable**: DevOps / Carlos Arévalo
**Revisar**: Post-Fase 2 Consolidation

⚠️ **Nota Importante**: Este plan debe ejecutarse DESPUÉS de completar FASE 1 y durante FASE 2, cuando todas las integraciones hayan sido migradas a HAIDA-PROJECT y HAIDA esté configurado para desarrollo aislado.
