#!/bin/bash

# HAIDA Complete DevOps Deployment Script
# Full CI/CD pipeline with Docker, Railway, and Vercel support

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
VERSION=${VERSION:-$(git describe --tags --always 2>/dev/null || echo "dev")}
BUILD_TIME=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
LOG_DIR="./logs"
LOG_FILE="$LOG_DIR/deploy-${ENVIRONMENT}-$(date +%Y%m%d_%H%M%S).log"

mkdir -p "$LOG_DIR"

# Functions
print_header() {
    echo -e "\n${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}\n" | tee -a "$LOG_FILE"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}" | tee -a "$LOG_FILE"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}" | tee -a "$LOG_FILE"
}

print_error() {
    echo -e "${RED}✗ $1${NC}" | tee -a "$LOG_FILE"
}

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed"
        exit 1
    fi
    print_success "$1 is installed"
}

# Main deployment flow

print_header "HAIDA Change Detection System - Deployment"

echo "Starting HAIDA deployment process..."
echo "This will:"
echo "  1. Check prerequisites"
echo "  2. Configure environment"
echo "  3. Build Docker images"
echo "  4. Deploy services"
echo "  5. Verify system"
echo "  6. Run initial tests"

# Phase 1: Prerequisites Check
print_header "Phase 1: Prerequisites Check"

check_command "docker"
check_command "docker-compose"
check_command "node"
check_command "npm"
check_command "git"

print_success "All prerequisites installed"

# Phase 2: Environment Setup
print_header "Phase 2: Environment Configuration"

HAIDA_DIR=$(pwd)
print_success "Working directory: $HAIDA_DIR"

# Create .env if doesn't exist
if [ ! -f .env ]; then
    print_warning ".env not found, creating from template"
    cp .env.example .env
    print_success ".env created from template"
    print_warning "IMPORTANT: Update .env with your actual values:"
    echo "  - SLACK_WEBHOOK"
    echo "  - DB_PASSWORD"
    echo "  - TEST_URL"
    echo "  - Other sensitive data"
else
    print_success ".env file exists"
fi

# Create required directories
mkdir -p test-results logs screenshots reports haida-api/node_modules

print_success "Directories created"

# Phase 3: Node Dependencies
print_header "Phase 3: Installing Node Dependencies"

echo "Installing HAIDA API dependencies..."
cd haida-api
npm install --production
print_success "HAIDA API dependencies installed"

echo "Installing Playwright..."
npx playwright install --with-deps
print_success "Playwright browsers installed"

cd ..

# Phase 4: Docker Build & Deploy
print_header "Phase 4: Building & Deploying Docker Services"

cd change-detection

echo "Building HAIDA API Docker image..."
docker-compose build --no-cache haida-api 2>&1 | tail -20
print_success "HAIDA API image built"

echo "Starting Docker services..."
docker-compose up -d
print_success "Docker services started"

# Phase 5: Wait for Services
print_header "Phase 5: Waiting for Services to Be Ready"

echo "Waiting for Changedetection.io (30 seconds)..."
for i in {1..30}; do
    if curl -s http://localhost:5000 > /dev/null 2>&1; then
        print_success "Changedetection.io is ready"
        break
    fi
    echo -n "."
    sleep 1
done

echo ""
echo "Waiting for HAIDA API (30 seconds)..."
for i in {1..30}; do
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        print_success "HAIDA API is ready"
        break
    fi
    echo -n "."
    sleep 1
done

# Phase 6: Service Verification
print_header "Phase 6: Service Verification"

echo "Checking service status..."
docker-compose ps

echo ""
echo "Testing endpoints..."

# Test HAIDA API health
if curl -s http://localhost:3001/health | grep -q "healthy"; then
    print_success "HAIDA API health check passed"
else
    print_error "HAIDA API health check failed"
fi

# Test Changedetection.io
if curl -s http://localhost:5000 | grep -q "changedetection" || [ $? -eq 0 ]; then
    print_success "Changedetection.io is accessible"
else
    print_warning "Could not fully verify Changedetection.io"
fi

# Test Selenium Hub
if curl -s http://localhost:4444/wd/hub/status > /dev/null 2>&1; then
    print_success "Selenium Hub is ready"
else
    print_warning "Selenium Hub not yet ready (may still be starting)"
fi

# Phase 7: Test Configuration
print_header "Phase 7: Test Configuration"

cd ..

echo "Creating test results directories..."
mkdir -p test-results/{artifacts,allure}
print_success "Test directories created"

echo "Verifying Playwright configuration..."
if [ -f playwright.config.js ]; then
    print_success "Playwright config found"
else
    print_error "Playwright config not found"
fi

# Phase 8: Initial Test Run
print_header "Phase 8: Running Initial Tests"

read -p "Run initial test suite? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Running Playwright tests..."
    npm test 2>&1 | tail -50
    print_success "Tests completed"
else
    print_warning "Skipped test run"
fi

# Phase 9: Webhook Configuration
print_header "Phase 9: Manual Webhook Configuration"

echo "Testing webhook endpoint..."
WEBHOOK_RESPONSE=$(curl -s -X POST http://localhost:3001/webhook/change-detected \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://localhost:3000/login",
    "tag": "frontend-ui-login",
    "notification_type": "test",
    "uuid": "deployment-test"
  }')

if echo "$WEBHOOK_RESPONSE" | grep -q "accepted"; then
    print_success "Webhook endpoint is functional"
    echo "$WEBHOOK_RESPONSE" | jq . 2>/dev/null || echo "$WEBHOOK_RESPONSE"
else
    print_error "Webhook endpoint test failed"
    echo "$WEBHOOK_RESPONSE"
fi

# Phase 10: Summary
print_header "Deployment Summary"

echo "✅ HAIDA Change Detection System Deployed Successfully!"
echo ""
echo "📊 Service URLs:"
echo "  - HAIDA API: http://localhost:3001"
echo "  - Changedetection.io: http://localhost:5000"
echo "  - Selenium Hub: http://localhost:4444"
echo "  - Allure Reports: http://localhost:4040"
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis: localhost:6379"
echo ""
echo "🚀 Next Steps:"
echo "  1. Open http://localhost:5000 to add watches"
echo "  2. Configure webhooks pointing to http://haida-api:3001/webhook/change-detected"
echo "  3. Review .env file and update with your settings"
echo "  4. Run tests: npm test"
echo "  5. View results: http://localhost:4040"
echo ""
echo "📋 Useful Commands:"
echo "  - View logs: docker-compose logs -f [service]"
echo "  - Stop services: docker-compose down"
echo "  - Restart services: docker-compose restart"
echo "  - Run tests: npm test"
echo "  - Check health: curl http://localhost:3001/health"
echo ""
echo "📚 Documentation:"
echo "  - Integration Guide: ./INTEGRATION-GUIDE-COMPLETE.md"
echo "  - Architecture: ./CHANGE-DETECTION-FRAMEWORK.md"
echo "  - API Server: ./haida-api/server.js"
echo ""
echo "🔐 Security Notes:"
echo "  - Change default database password"
echo "  - Set secure API keys"
echo "  - Configure HTTPS for production"
echo "  - Review CORS settings in .env"
echo ""

# Optional: Open browser
read -p "Open Changedetection.io dashboard? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:5000
    elif command -v open &> /dev/null; then
        open http://localhost:5000
    fi
fi

print_success "Deployment complete!"
