#!/bin/bash

# ============================================================================
# HAIDA - Run Local Development Script
# Starts both backend and frontend
# ============================================================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

DEV_DIR="/Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev"
FRONTEND_DIR="$DEV_DIR/Figma"

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  HAIDA - Local Development Server${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"

# ============================================================================
# Verify Setup
# ============================================================================

echo -e "${BLUE}[1/3] Verifying setup...${NC}"

cd "$DEV_DIR"

if [ ! -L ".env" ]; then
    echo -e "${RED}✗ .env symlink not found${NC}"
    echo -e "${YELLOW}Run fix-and-deploy-haida.sh first${NC}"
    exit 1
fi

if [ ! -d "venv" ]; then
    echo -e "${RED}✗ Python virtual environment not found${NC}"
    echo -e "${YELLOW}Run fix-and-deploy-haida.sh first${NC}"
    exit 1
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo -e "${RED}✗ Node.js dependencies not found${NC}"
    echo -e "${YELLOW}Run fix-and-deploy-haida.sh first${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Setup verified${NC}"

# ============================================================================
# Start Servers
# ============================================================================

echo -e "\n${BLUE}[2/3] Starting servers...${NC}"

# Function to handle cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}✓ Servers stopped${NC}"
}

trap cleanup EXIT

# Start backend
echo -e "${YELLOW}Starting backend (FastAPI)...${NC}"
cd "$DEV_DIR"
source venv/bin/activate
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
sleep 2

# Start frontend
echo -e "${YELLOW}Starting frontend (React)...${NC}"
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!
sleep 2

# ============================================================================
# Status
# ============================================================================

echo -e "\n${BLUE}[3/3] Checking status...${NC}"

echo -e "\n${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Servers Running!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}\n"

echo -e "${BLUE}Backend:${NC}"
echo -e "  URL: ${GREEN}http://127.0.0.1:8000${NC}"
echo -e "  API Docs: ${GREEN}http://127.0.0.1:8000/docs${NC}"
echo -e "  PID: $BACKEND_PID\n"

echo -e "${BLUE}Frontend:${NC}"
echo -e "  URL: ${GREEN}http://localhost:5173${NC}"
echo -e "  PID: $FRONTEND_PID\n"

echo -e "${YELLOW}Press CTRL+C to stop${NC}\n"

# Keep running until interrupted
wait
