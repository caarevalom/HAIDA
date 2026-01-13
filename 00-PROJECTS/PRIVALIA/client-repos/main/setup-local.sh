#!/bin/bash

################################################################################
# Privalia - Local Setup and Validation Script
# Purpose: Prepare environment, validate dependencies, and setup for testing
# Usage: bash setup-local.sh
################################################################################

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_NAME="Privalia QA Testing Suite"
REQUIRED_TOOLS=("newman" "node" "npm")
REQUIRED_FILES=("Checkout_Error_Handling_API.postman_collection.json" "Checkout_Environment.postman_environment.json")

################################################################################
# Functions
################################################################################

print_header() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║  ${PROJECT_NAME} - Local Setup"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
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

# Check if a command exists
command_exists() {
    command -v "$1" &> /dev/null
    return $?
}

# Get version of installed tool
get_version() {
    case $1 in
        "node")
            node --version
            ;;
        "npm")
            npm --version
            ;;
        "newman")
            newman --version | head -n 1
            ;;
        *)
            echo "unknown"
            ;;
    esac
}

################################################################################
# Main Execution
################################################################################

print_header

# Step 1: Verify working directory
print_section "1. Verifying working directory..."
if [ ! -f "run_tests.sh" ]; then
    print_error "run_tests.sh not found in current directory"
    print_info "Please run this script from the Privalia project directory:"
    echo "  cd /Users/carlosa/Privalia"
    echo "  bash setup-local.sh"
    exit 1
fi
print_success "Working directory is correct: $SCRIPT_DIR"

# Step 2: Check required tools
print_section "2. Checking required tools..."
MISSING_TOOLS=()
for tool in "${REQUIRED_TOOLS[@]}"; do
    if command_exists "$tool"; then
        version=$(get_version "$tool")
        print_success "$tool is installed ($version)"
    else
        print_error "$tool is NOT installed"
        MISSING_TOOLS+=("$tool")
    fi
done

if [ ${#MISSING_TOOLS[@]} -gt 0 ]; then
    echo ""
    print_error "Missing tools detected: ${MISSING_TOOLS[*]}"
    echo ""
    echo "Installation instructions:"
    for tool in "${MISSING_TOOLS[@]}"; do
        case $tool in
            "node")
                echo "  Node.js: https://nodejs.org/ (v18+)"
                echo "  Or use: brew install node"
                ;;
            "npm")
                echo "  npm comes with Node.js"
                ;;
            "newman")
                echo "  Newman: npm install -g newman"
                ;;
        esac
    done
    exit 1
fi

# Step 3: Check required files
print_section "3. Checking required files..."
MISSING_FILES=()
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$SCRIPT_DIR/$file" ]; then
        size=$(du -h "$SCRIPT_DIR/$file" | cut -f1)
        print_success "$file found ($size)"
    else
        print_error "$file NOT found"
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    print_error "Missing required files: ${MISSING_FILES[*]}"
    exit 1
fi

# Step 4: Check/Create .env file
print_section "4. Checking environment configuration..."
if [ -f "$SCRIPT_DIR/.env" ]; then
    print_success ".env file exists"
    ENV_SIZE=$(wc -l < "$SCRIPT_DIR/.env")
    echo "  Contains $ENV_SIZE lines"
else
    print_warning ".env file not found"
    if [ -f "$SCRIPT_DIR/.env.example" ]; then
        read -p "  Create .env from .env.example? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
            print_success "Created .env from template"
            print_warning "Please edit .env with your configuration:"
            echo "  nano .env"
        fi
    fi
fi

# Step 5: Verify reports directory
print_section "5. Checking reports directory..."
REPORTS_DIR="$SCRIPT_DIR/reports"
if [ -d "$REPORTS_DIR" ]; then
    REPORT_COUNT=$(find "$REPORTS_DIR" -type f | wc -l)
    print_success "Reports directory exists ($REPORT_COUNT existing reports)"
else
    print_warning "Reports directory doesn't exist - will be created on first test run"
fi

# Step 6: Check file permissions
print_section "6. Checking file permissions..."
if [ -x "$SCRIPT_DIR/run_tests.sh" ]; then
    print_success "run_tests.sh is executable"
else
    print_warning "run_tests.sh is NOT executable"
    read -p "  Make run_tests.sh executable? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        chmod +x "$SCRIPT_DIR/run_tests.sh"
        print_success "Made run_tests.sh executable"
    fi
fi

# Step 7: Validate Newman installation
print_section "7. Validating Newman..."
if newman -v &> /dev/null; then
    print_success "Newman is properly installed and callable"

    # Try a quick health check
    if timeout 5 newman --help &> /dev/null; then
        print_success "Newman responds to commands"
    fi
else
    print_error "Newman exists but has issues"
fi

# Step 8: System Information
print_section "8. System Information"
echo "  OS: $(uname -s)"
echo "  Architecture: $(uname -m)"
echo "  Node.js: $(node --version)"
echo "  npm: $(npm --version)"
echo "  Newman: $(newman --version | head -n 1)"

# Step 9: Project Summary
print_section "9. Project Summary"
echo "  Project: $PROJECT_NAME"
echo "  Location: $SCRIPT_DIR"
echo "  Test Collection: Checkout_Error_Handling_API.postman_collection.json"
echo "  Test Cases: 45 (Cybersource, PayPal, Edge Cases)"
echo "  Reporter Formats: cli, html, json, junit"

# Final instructions
print_section "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "  1. Configure environment:"
echo "     ${YELLOW}nano .env${NC}"
echo ""
echo "  2. Run tests:"
echo "     ${YELLOW}bash run_tests.sh${NC}"
echo ""
echo "  3. View results:"
echo "     ${YELLOW}open reports/test-report-*.html${NC}"
echo ""
echo "Documentation:"
echo "  - ${YELLOW}README_QA_Testing.md${NC} - Complete usage guide"
echo "  - ${YELLOW}Informe_Ejecucion_Pruebas_QA.md${NC} - Test execution report"
echo "  - ${YELLOW}PATHS.md${NC} - Project structure reference"
echo ""
print_info "For troubleshooting, see README_QA_Testing.md section 'Troubleshooting'"

exit 0
