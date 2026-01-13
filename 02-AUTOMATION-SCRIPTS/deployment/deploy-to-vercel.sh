#!/bin/bash

# ============================================================================
# HAIDA - Deploy to Vercel Script
# Properly handles deployment from correct directory
# ============================================================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

DEV_DIR="/Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev"

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  HAIDA - Vercel Deployment Script${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"

# Check if in correct directory
if [ ! -f "$DEV_DIR/vercel.json" ]; then
    echo -e "${RED}✗ vercel.json not found at $DEV_DIR${NC}"
    exit 1
fi

echo -e "${BLUE}[1/3] Verifying environment...${NC}"

cd "$DEV_DIR"

if [ ! -L ".env" ]; then
    echo -e "${RED}✗ .env symlink not found${NC}"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo -e "${RED}✗ package.json not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Environment verified${NC}"

# ============================================================================
# Check Vercel Login
# ============================================================================

echo -e "\n${BLUE}[2/3] Checking Vercel authentication...${NC}"

if ! vercel whoami &>/dev/null; then
    echo -e "${YELLOW}⚠️  Not logged into Vercel. Attempting login...${NC}"
    vercel login
else
    VERCEL_USER=$(vercel whoami)
    echo -e "${GREEN}✓ Logged in as: $VERCEL_USER${NC}"
fi

# ============================================================================
# Deploy
# ============================================================================

echo -e "\n${BLUE}[3/3] Deploying to Vercel...${NC}"

echo -e "${YELLOW}\nSelect deployment type:${NC}"
echo "  1. Staging (preview)"
echo "  2. Production"
echo ""
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo -e "\n${YELLOW}Deploying to staging...${NC}"
        vercel deploy
        ;;
    2)
        echo -e "\n${YELLOW}Deploying to production...${NC}"
        echo -e "${RED}⚠️  This will update the live production environment!${NC}"
        read -p "Are you sure? (type 'yes' to confirm): " confirm

        if [ "$confirm" = "yes" ]; then
            vercel deploy --prod
        else
            echo -e "${YELLOW}Deployment cancelled${NC}"
            exit 0
        fi
        ;;
    *)
        echo -e "${RED}✗ Invalid choice${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}\n"
