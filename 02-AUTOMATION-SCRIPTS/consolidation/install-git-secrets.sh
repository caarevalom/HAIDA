#!/bin/bash

################################################################################
# INSTALACIÓN DE GIT-SECRETS Y CONFIGURACIÓN DE PRE-COMMIT HOOKS
# Propósito: Prevenir commits con credenciales expuestas
# Uso: bash install-git-secrets.sh
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  INSTALACIÓN DE GIT-SECRETS PRE-COMMIT HOOKS${NC}             ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

print_section() {
    echo -e "\n${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

################################################################################
# Funciones
################################################################################

install_git_secrets() {
    print_section "1. Instalando git-secrets"

    if command -v git-secrets &> /dev/null; then
        print_success "git-secrets ya está instalado"
        return 0
    fi

    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            print_info "Instalando via Homebrew..."
            brew install git-secrets
            print_success "git-secrets instalado"
        else
            print_error "Homebrew no encontrado. Instalar manualmente:"
            echo "  https://github.com/awslabs/git-secrets"
            return 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        print_info "Instalando via apt/yum..."
        if command -v apt-get &> /dev/null; then
            sudo apt-get install -y git-secrets
        elif command -v yum &> /dev/null; then
            sudo yum install -y git-secrets
        else
            print_error "No package manager encontrado"
            return 1
        fi
        print_success "git-secrets instalado"
    fi
}

create_pre_commit_hook() {
    print_section "2. Creando pre-commit hook personalizado"

    local hook_dir="$HOME/.git-hooks"
    local hook_file="$hook_dir/pre-commit"

    mkdir -p "$hook_dir"

    cat > "$hook_file" << 'HOOK_SCRIPT'
#!/bin/bash
# Pre-commit hook para detectar secretos y credenciales

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SECRETS_FOUND=0
WARNINGS=0

print_error() { echo -e "${RED}✗ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_success() { echo -e "${GREEN}✓ $1${NC}"; }

echo -e "${BLUE}=== GIT PRE-COMMIT SECURITY CHECK ===${NC}\n"

# Patrones de credenciales a buscar
declare -a PATTERNS=(
    "DATABASE_URL.*postgres.*password"
    "SUPABASE_KEY.*eyJ"
    "SUPABASE_.*_KEY"
    "password.*[=:]\s*['\"]?[^'\"]{8,}['\"]?"
    "api_key.*[=:]\s*['\"]?[a-zA-Z0-9]{20,}['\"]?"
    "api_secret.*[=:]\s*['\"]?[a-zA-Z0-9]{20,}['\"]?"
    "Authorization.*Bearer"
    "token.*eyJ"
    "\.env\.local"
    "\.env\.production"
    "private_key.*[=:]"
    "secret_key.*[=:]"
)

# Archivos a ignorar
declare -a IGNORE_FILES=(
    ".git/"
    "node_modules/"
    ".claude-config-backups/"
    ".example"
    ".template"
)

# Función para comprobar si archivo debe ignorarse
should_ignore() {
    local file=$1
    for pattern in "${IGNORE_FILES[@]}"; do
        if [[ "$file" == *"$pattern"* ]]; then
            return 0
        fi
    done
    return 1
}

# Revisar archivos staged
while IFS= read -r file; do
    # Ignorar archivos en ignore list
    if should_ignore "$file"; then
        continue
    fi

    # Ignorar archivos binarios
    if file "$file" | grep -q "binary"; then
        continue
    fi

    # Revisar cada patrón
    for pattern in "${PATTERNS[@]}"; do
        if grep -P "$pattern" "$file" 2>/dev/null | grep -v "^#" > /dev/null; then
            SECRETS_FOUND=$((SECRETS_FOUND + 1))
            print_error "Posible secreto en: $file"
            grep -n -P "$pattern" "$file" | sed 's/=.*password.*/=***REDACTED***/g'
            echo ""
        fi
    done

    # Comprobar .env files
    if [[ "$file" == *".env"* ]] && [[ "$file" != *".example"* ]] && [[ "$file" != *".template"* ]]; then
        if [ -f "$file" ]; then
            WARNINGS=$((WARNINGS + 1))
            print_warning ".env file staged: $file (revisa antes de commitear)"
        fi
    fi

    # Comprobar settings.json con credenciales
    if [[ "$file" == *"settings.json"* ]] || [[ "$file" == *"settings.local.json"* ]]; then
        if grep -E "password|token|secret|DATABASE_URL" "$file" 2>/dev/null | \
           grep -v "^#" | grep -v "^\s*//" > /dev/null; then
            WARNINGS=$((WARNINGS + 1))
            print_warning "Posibles credenciales en: $file"
        fi
    fi

done < <(git diff --cached --name-only)

# Resumen y decisión
echo ""
if [ $SECRETS_FOUND -gt 0 ]; then
    print_error "🛑 COMMIT BLOQUEADO: Se encontraron $SECRETS_FOUND posibles secretos"
    echo ""
    echo "Opciones:"
    echo "  1. Elimina las credenciales del archivo"
    echo "  2. Mueve credenciales a .env (gitignored)"
    echo "  3. Force commit: git commit --no-verify (NO RECOMENDADO)"
    echo ""
    exit 1
fi

if [ $WARNINGS -gt 0 ]; then
    print_warning "⚠️ Se encontraron $WARNINGS advertencias"
    echo "Revisa los archivos .env antes de continuar"
    echo ""
fi

print_success "✓ Pre-commit check passed"
exit 0
HOOK_SCRIPT

    chmod +x "$hook_file"
    print_success "Pre-commit hook creado: $hook_file"
}

configure_git_hooks() {
    print_section "3. Configurando git para usar hooks personalizados"

    local hook_dir="$HOME/.git-hooks"

    # Configuración global
    git config --global core.hooksPath "$hook_dir"
    print_success "Git configurado para usar: $hook_dir"

    # Configuración por repo (si existen)
    for repo_dir in "/Users/carlosa/HAIDA" "/Users/carlosa/HAIDA-PROJECT" "/Users/carlosa/Privalia"; do
        if [ -d "$repo_dir/.git" ]; then
            cd "$repo_dir"
            git config core.hooksPath "$hook_dir"
            print_success "Hooks configurado en: $repo_dir"
        fi
    done
}

install_git_secrets_patterns() {
    print_section "4. Instalando patrones de detección de secretos"

    # Crear archivo de patrones personalizado
    local patterns_file="$HOME/.git-secrets-patterns"

    cat > "$patterns_file" << 'PATTERNS'
# Patrones de git-secrets para detección de credenciales

# Supabase
(supabase_key|SUPABASE_KEY).*['\"]?eyJ[A-Za-z0-9\-_\.]*['\"]?

# Database URLs
(database_url|DATABASE_URL).*postgresql://.*password

# AWS Credentials
(aws_access_key_id|aws_secret_access_key)\s*=

# API Keys
(api_key|API_KEY|apiKey)\s*[=:]\s*['\"]?[a-zA-Z0-9]{20,}['\"]?

# JWT Tokens
(token|TOKEN|authorization|Authorization)\s*[=:]\s*['\"]?eyJ[A-Za-z0-9\-_\.]*['\"]?

# Azure
(ENTRA_CLIENT_SECRET|azure.*secret)\s*=

# Generic credentials
(password|passwd|pwd)\s*[=:]\s*['\"]?[^'\"]{8,}['\"]?

# Private keys
(BEGIN PRIVATE KEY|BEGIN RSA PRIVATE KEY)

PATTERNS

    print_success "Patrones de git-secrets creados"

    # Instalar patrones globales (si git-secrets está instalado)
    if command -v git-secrets &> /dev/null; then
        git secrets --register-aws --global
        print_success "AWS patterns registrado"

        # Agregar patrones personalizados
        while IFS= read -r pattern; do
            if [[ ! "$pattern" =~ ^# ]] && [ -n "$pattern" ]; then
                git secrets --add --global "$pattern" || true
            fi
        done < "$patterns_file"

        print_success "Patrones personalizados agregados"
    fi
}

create_cleanup_script() {
    print_section "5. Creando script de limpieza de git history"

    cat > "$HOME/.git-secrets-cleanup" << 'CLEANUP_SCRIPT'
#!/bin/bash
# Script para limpiar secretos de git history
# USO: bash ~/.git-secrets-cleanup [repo_path]

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

repo=${1:-.}

if [ ! -d "$repo/.git" ]; then
    echo -e "${RED}✗ No es un git repository: $repo${NC}"
    exit 1
fi

cd "$repo"

echo -e "${YELLOW}⚠️  ADVERTENCIA: Este script reescribirá git history${NC}"
echo "Esto requiere force-push. Asegúrate de que nadie más esté usando esta rama."
echo ""
read -p "Continuar? (s/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    exit 1
fi

# Opción 1: Usar BFG (más rápido)
if command -v bfg &> /dev/null; then
    echo -e "${YELLOW}Usando BFG para limpieza...${NC}"
    bfg --delete-files ".env*" "$repo"
    bfg --replace-text .env-patterns "$repo"
    cd "$repo"
    git reflog expire --expire=now --all && git gc --prune=now
    echo -e "${GREEN}✓ Limpieza con BFG completa${NC}"
    echo "Ahora: git push -u origin --force-with-lease"

# Opción 2: Usar git filter-branch
else
    echo -e "${YELLOW}Usando git filter-branch para limpieza...${NC}"
    git filter-branch --tree-filter 'rm -f .env .env.local .env.production' -- --all
    git reflog expire --expire=now --all
    git gc --prune=now
    echo -e "${GREEN}✓ Limpieza con git filter-branch completa${NC}"
    echo "Ahora: git push --force"
fi

CLEANUP_SCRIPT

    chmod +x "$HOME/.git-secrets-cleanup"
    print_success "Script de limpieza creado: $HOME/.git-secrets-cleanup"
}

create_validation_script() {
    print_section "6. Creando script de validación"

    cat > "$HOME/.validate-no-secrets" << 'VALIDATE_SCRIPT'
#!/bin/bash
# Script para validar que no hay secretos en el repositorio

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

repo=${1:-.}

if [ ! -d "$repo/.git" ]; then
    echo -e "${RED}✗ No es un git repository: $repo${NC}"
    exit 1
fi

cd "$repo"

echo -e "${BLUE}=== Validando credenciales en repositorio ===${NC}\n"

SECRETS_FOUND=0

# Buscar en archivos tracked
while IFS= read -r file; do
    if [ -f "$file" ]; then
        if grep -E "password|token|secret|DATABASE_URL|API_KEY|SUPABASE_KEY" "$file" 2>/dev/null | \
           grep -v "^#" > /dev/null; then
            SECRETS_FOUND=$((SECRETS_FOUND + 1))
            echo -e "${RED}✗ Posibles secretos en: $file${NC}"
        fi
    fi
done < <(git ls-files)

# Buscar en git history
echo ""
echo "Buscando en git history..."

if git log -p --all | grep -E "password.*=|token.*eyJ|DATABASE_URL.*postgres" 2>/dev/null | head -5 > /dev/null; then
    echo -e "${YELLOW}⚠️  Posibles secretos encontrados en git history${NC}"
    echo "Ejecutar: ~/.git-secrets-cleanup"
    SECRETS_FOUND=$((SECRETS_FOUND + 1))
fi

echo ""
if [ $SECRETS_FOUND -eq 0 ]; then
    echo -e "${GREEN}✓ No se encontraron secretos${NC}"
    exit 0
else
    echo -e "${RED}✗ Se encontraron $SECRETS_FOUND problemas de seguridad${NC}"
    exit 1
fi

VALIDATE_SCRIPT

    chmod +x "$HOME/.validate-no-secrets"
    print_success "Script de validación creado: $HOME/.validate-no-secrets"
}

print_summary() {
    print_section "RESUMEN - GIT-SECRETS INSTALADO"

    echo ""
    echo "✓ Archivos creados:"
    echo "  - $HOME/.git-hooks/pre-commit (hook personalizado)"
    echo "  - $HOME/.git-secrets-patterns (patrones de detección)"
    echo "  - $HOME/.git-secrets-cleanup (limpieza de history)"
    echo "  - $HOME/.validate-no-secrets (validación)"
    echo ""
    echo "✓ Configuración aplicada a:"
    echo "  - Git global (core.hooksPath)"
    echo "  - /Users/carlosa/HAIDA"
    echo "  - /Users/carlosa/HAIDA-PROJECT"
    echo "  - /Users/carlosa/Privalia"
    echo ""
    echo "Uso:"
    echo "  • Commits serán bloqueados si contienen secretos"
    echo "  • Ver patrones: cat $HOME/.git-secrets-patterns"
    echo "  • Limpiar history: $HOME/.git-secrets-cleanup [repo]"
    echo "  • Validar repo: $HOME/.validate-no-secrets [repo]"
    echo ""
}

################################################################################
# Main
################################################################################

main() {
    print_header

    install_git_secrets || exit 1
    create_pre_commit_hook
    configure_git_hooks
    install_git_secrets_patterns
    create_cleanup_script
    create_validation_script
    print_summary

    print_success "✅ Instalación completada"
    echo ""
    print_info "Próximo paso: bash validate-claude-config.sh"
}

main "$@"
