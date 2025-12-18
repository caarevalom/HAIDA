#!/bin/bash

# HAIDA DevOps Initialization Script
# Sets up all necessary configurations for local development

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "\n${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Main execution
main() {
    print_header "HAIDA DevOps Initialization"

    # Check prerequisites
    print_info "Checking prerequisites..."

    command -v docker &> /dev/null || { print_error "Docker not installed"; exit 1; }
    command -v docker-compose &> /dev/null || { print_error "Docker Compose not installed"; exit 1; }
    command -v git &> /dev/null || { print_error "Git not installed"; exit 1; }

    print_success "All prerequisites present"

    # Create directories
    print_info "Creating necessary directories..."

    mkdir -p logs
    mkdir -p data/postgres
    mkdir -p data/redis
    mkdir -p data/changedetection
    mkdir -p test-results/allure
    mkdir -p reports/allure
    mkdir -p backups

    print_success "Directories created"

    # Setup .env files
    print_header "Environment Configuration"

    if [ ! -f .env ]; then
        print_info ".env not found, creating from template..."
        cp .env.example .env
        print_success ".env created"
        print_warning "Please update .env with your values:"
        echo "  - CHANGEDETECTION_API_KEY"
        echo "  - DB_PASSWORD"
        echo "  - SLACK_WEBHOOK (optional)"
        echo "  - Other sensitive data"
    else
        print_success ".env already exists"
    fi

    if [ ! -f .env.production ]; then
        print_warning ".env.production not found"
        print_info "For production deployment, create .env.production from .env.production.template"
    else
        print_success ".env.production exists"
    fi

    # Make scripts executable
    print_info "Making scripts executable..."
    chmod +x deploy.sh deploy-backend.sh deploy-frontend.sh init-devops.sh
    print_success "Scripts are executable"

    # Setup git hooks
    print_header "Git Hooks Setup"

    mkdir -p .git/hooks

    # Pre-commit hook
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Running pre-commit checks..."

# Check for .env files
if git diff --cached --name-only | grep -E "\.env(\.production)?$" > /dev/null; then
    echo "Error: .env files should not be committed!"
    exit 1
fi

# Check for large files
if git diff --cached --name-only --diff-filter=A | while read file; do
    size=$(du -b "$file" | cut -f1)
    if [ $size -gt 52428800 ]; then
        echo "Error: File too large: $file"
        exit 1
    fi
done; [ $? -eq 1 ]; then
    exit 1
fi

echo "Pre-commit checks passed!"
EOF
    chmod +x .git/hooks/pre-commit
    print_success "Pre-commit hook installed"

    # Post-checkout hook
    cat > .git/hooks/post-checkout << 'EOF'
#!/bin/bash
echo "Post-checkout: Checking dependencies..."

# Check if package-lock.json changed
if git diff HEAD@{1}..HEAD --name-only | grep -q "package-lock.json"; then
    echo "Dependencies may have changed, consider running: npm install"
fi

# Check if requirements.txt changed
if git diff HEAD@{1}..HEAD --name-only | grep -q "requirements.txt"; then
    echo "Python dependencies may have changed, consider running: pip install -r requirements.txt"
fi
EOF
    chmod +x .git/hooks/post-checkout
    print_success "Post-checkout hook installed"

    # Generate secure secrets
    print_header "Security Configuration"

    print_info "Generating secure secrets..."

    DB_PASSWORD=$(openssl rand -base64 32)
    API_SECRET=$(openssl rand -base64 48)
    JWT_SECRET=$(openssl rand -base64 64)

    print_success "Secrets generated"
    print_warning "Save these values securely:"
    echo "  DB_PASSWORD: $DB_PASSWORD"
    echo "  API_SECRET: $API_SECRET"
    echo "  JWT_SECRET: $JWT_SECRET"

    # Pull Docker images
    print_header "Downloading Docker Images"

    print_info "This may take a few minutes..."

    docker-compose pull postgres redis changedetection

    print_success "Docker images downloaded"

    # Summary
    print_header "Setup Complete!"

    echo ""
    echo "Next steps:"
    echo "1. Update .env with your configuration values"
    echo "2. For production: Update .env.production"
    echo "3. Start services: docker-compose up -d"
    echo "4. Verify health: ./deploy.sh development"
    echo ""
    echo "Useful commands:"
    echo "  - View logs: docker-compose logs -f"
    echo "  - Stop services: docker-compose down"
    echo "  - Full deployment: ./deploy.sh production"
    echo ""
    echo "Documentation:"
    echo "  - Deployment Guide: ./DEPLOYMENT.md"
    echo "  - Environment URLs: ./ENVIRONMENT-URLS.md"
    echo "  - GitHub Secrets: ./.github/SECRETS.md"
    echo ""
}

# Run main function
main "$@"
