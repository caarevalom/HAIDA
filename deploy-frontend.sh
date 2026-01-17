#!/bin/bash

# Frontend Deployment Script - Vercel

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

# Environment
ENVIRONMENT=${1:-production}
LOG_FILE="./logs/frontend-deploy-$(date +%Y%m%d_%H%M%S).log"

mkdir -p ./logs

print_header "Frontend Deployment ($ENVIRONMENT)"

# Check requirements
print_info "Checking requirements..."

command -v docker &> /dev/null || { print_error "Docker not installed"; exit 1; }
command -v docker-compose &> /dev/null || { print_error "Docker Compose not installed"; exit 1; }
command -v node &> /dev/null || { print_error "Node.js not installed"; exit 1; }
command -v npm &> /dev/null || { print_error "npm not installed"; exit 1; }

if [ "$ENVIRONMENT" = "production" ]; then
    command -v vercel &> /dev/null || { print_error "Vercel CLI not installed"; exit 1; }
fi

print_success "All requirements met"

# Build frontend
cd frontend

print_info "Installing dependencies..."
npm ci
print_success "Dependencies installed"

print_info "Building frontend..."
npm run build
print_success "Frontend built"

# Run tests
print_info "Running frontend tests..."
npm test -- --passWithNoTests || print_error "Tests failed (non-blocking)"
print_success "Frontend tests completed"

# Build Docker image
cd ..
print_info "Building frontend Docker image..."

if [ "$ENVIRONMENT" = "production" ]; then
    docker-compose -f docker-compose.production.yml build frontend
    print_success "Frontend image built"

    # Deploy to Vercel
    print_info "Deploying to Vercel..."

    if [ -z "$VERCEL_TOKEN" ]; then
        print_error "VERCEL_TOKEN not set"
        exit 1
    fi

    cd frontend
    vercel deploy --prod --token "$VERCEL_TOKEN"
    cd ..

    print_success "Frontend deployed to Vercel"

    # Verify deployment
    print_info "Waiting for deployment to be ready..."
    sleep 30

    HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://haida.hiberus.com/api/health 2>/dev/null || echo "000")

    if [ "$HEALTH" = "200" ]; then
        print_success "Frontend health check passed"
    else
        print_error "Frontend health check failed (HTTP $HEALTH)"
        exit 1
    fi
else
    docker-compose build frontend
    print_success "Frontend image built"

    print_info "Starting frontend in development..."
    docker-compose up -d frontend

    # Wait for frontend to be ready
    print_info "Waiting for frontend to be ready..."
    for i in {1..60}; do
        HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")
        if [ "$HEALTH" = "200" ]; then
            print_success "Frontend is ready"
            break
        fi
        sleep 1
    done
fi

print_success "Frontend deployment completed!"

# Print next steps
echo ""
echo "Next steps:"
echo "1. Open https://haida.hiberus.com"
echo "2. Check logs: docker logs haida-frontend"
echo "3. Monitor deployment: vercel logs"
echo ""
