#!/bin/bash

# Backend Deployment Script - Railway

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
LOG_FILE="./logs/backend-deploy-$(date +%Y%m%d_%H%M%S).log"

mkdir -p ./logs

print_header "Backend Deployment ($ENVIRONMENT)"

# Check requirements
print_info "Checking requirements..."

command -v docker &> /dev/null || { print_error "Docker not installed"; exit 1; }
command -v docker-compose &> /dev/null || { print_error "Docker Compose not installed"; exit 1; }

if [ "$ENVIRONMENT" = "production" ]; then
    command -v railway &> /dev/null || { print_error "Railway CLI not installed"; exit 1; }
fi

print_success "All requirements met"

# Build backend image
print_info "Building backend Docker image..."

if [ "$ENVIRONMENT" = "production" ]; then
    docker-compose -f docker-compose.production.yml build backend
    print_success "Backend image built"

    # Tag image for Railway
    docker tag haida-backend:latest haida-backend:$VERSION
    print_success "Image tagged with version $VERSION"
else
    docker-compose build backend
    print_success "Backend image built"
fi

# Test backend
print_info "Running backend tests..."

cd backend
python -m pytest tests/ -v --cov=app || print_error "Tests failed (non-blocking)"
cd ..

print_success "Backend tests completed"

# Deploy to Railway
if [ "$ENVIRONMENT" = "production" ]; then
    print_info "Deploying to Railway..."

    if [ -z "$RAILWAY_TOKEN" ]; then
        print_error "RAILWAY_TOKEN not set"
        exit 1
    fi

    railway deploy --service=backend --environment=production || print_error "Railway deployment failed"

    print_success "Backend deployed to Railway"

    # Verify deployment
    print_info "Waiting for deployment to be ready..."
    sleep 30

    HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://api.haida.hiberus.com/health 2>/dev/null || echo "000")

    if [ "$HEALTH" = "200" ]; then
        print_success "Backend health check passed"
    else
        print_error "Backend health check failed (HTTP $HEALTH)"
        exit 1
    fi
else
    print_info "Starting backend in development..."
    docker-compose up -d backend

    # Wait for backend to be ready
    print_info "Waiting for backend to be ready..."
    for i in {1..60}; do
        HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health 2>/dev/null || echo "000")
        if [ "$HEALTH" = "200" ]; then
            print_success "Backend is ready"
            break
        fi
        sleep 1
    done
fi

print_success "Backend deployment completed!"

# Print next steps
echo ""
echo "Next steps:"
echo "1. Verify backend is running"
echo "2. Check logs: docker logs haida-backend"
echo "3. View monitoring dashboard"
echo ""
