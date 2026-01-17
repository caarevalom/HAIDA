#!/bin/bash
# ============================================================================
# CUCS INITIALIZATION SCRIPT
# Central Unified Configuration System - Setup Script
# ============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Paths
CUCS_HOME="${HOME}/.config/cucs"
VAULT_DIR="${CUCS_HOME}/vault"
REGISTRY_DIR="${CUCS_HOME}/registry"
SYNC_DIR="${CUCS_HOME}/sync"

echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE}  CUCS - Central Unified Configuration System${NC}"
echo -e "${BLUE}  Initialization Script${NC}"
echo -e "${BLUE}================================================================${NC}"
echo ""

# ============================================================================
# STEP 1: Create directory structure
# ============================================================================
echo -e "${YELLOW}[1/5] Creating directory structure...${NC}"

mkdir -p "${VAULT_DIR}/credentials"
mkdir -p "${VAULT_DIR}/master-keys"
mkdir -p "${VAULT_DIR}/metadata"
mkdir -p "${REGISTRY_DIR}"
mkdir -p "${SYNC_DIR}/vscode"
mkdir -p "${SYNC_DIR}/docker"
mkdir -p "${SYNC_DIR}/cli"
mkdir -p "${SYNC_DIR}/mcps"
mkdir -p "${SYNC_DIR}/browser"

echo -e "${GREEN}  Created: ${CUCS_HOME}${NC}"

# ============================================================================
# STEP 2: Create global.yaml
# ============================================================================
echo -e "${YELLOW}[2/5] Creating registry files...${NC}"

cat > "${REGISTRY_DIR}/global.yaml" << 'EOF'
# CUCS Global Configuration
# Generated: $(date)

system:
  vault_type: "encrypted"
  encryption_algorithm: "aes-256-gcm"
  key_storage: "keychain"
  sync_interval: 300
  backup_enabled: true

user:
  username: "${USER}"
  timezone: "Europe/Madrid"
  preferred_shell: "zsh"

paths:
  vault_root: "~/.config/cucs/vault"
  config_root: "~/.config/cucs/registry"
  projects_root: "~/haida"
  backups_root: "~/.config/cucs/backups"
EOF

# ============================================================================
# STEP 3: Create environments.yaml
# ============================================================================
cat > "${REGISTRY_DIR}/environments.yaml" << 'EOF'
# CUCS Environment Definitions

dev:
  tag: "development"
  scope: "local-only"
  base_url: "http://localhost:3000"
  api_url: "http://localhost:8000"
  log_level: "DEBUG"
  features:
    debug_mode: true
    mock_services: true

staging:
  tag: "staging"
  scope: "internal"
  base_url: "https://staging.haida.com"
  api_url: "https://api-staging.haida.com"
  log_level: "INFO"

production:
  tag: "production"
  scope: "restricted"
  base_url: "https://haida.stayarta.com"
  api_url: "https://haidapi.stayarta.com"
  log_level: "WARN"
  mfa_required: true
  audit_logging: "strict"
EOF

# ============================================================================
# STEP 4: Create mcps.yaml
# ============================================================================
cat > "${REGISTRY_DIR}/mcps.yaml" << 'EOF'
# CUCS MCP Server Registry

servers:
  supabase-mcp:
    type: "stdio"
    command: "npx"
    args: ["@supabase/mcp-server-supabase"]
    env_source: "vault.supabase"
    auto_start: true

  github-mcp:
    type: "http"
    url: "https://api.githubcopilot.com/mcp/"
    env_source: "vault.github"
    auto_start: true

  playwright-mcp:
    type: "stdio"
    command: "npx"
    args: ["@playwright/mcp@latest"]
    auto_start: true

  azure-mcp:
    type: "stdio"
    command: "dnx"
    args: ["Azure.Mcp@2.0.0-beta.6", "--", "server", "start"]
    env_source: "vault.azure"
    auto_start: false

registry:
  default_gallery: "https://api.mcp.github.com"
  local_mcps_dir: "~/.config/cucs/mcps/local"
  auto_update: true

security:
  verify_signatures: true
  sandboxing: "strict"
  audit_logging: true
EOF

echo -e "${GREEN}  Created registry files${NC}"

# ============================================================================
# STEP 5: Create metadata
# ============================================================================
echo -e "${YELLOW}[3/5] Creating metadata files...${NC}"

cat > "${VAULT_DIR}/metadata/version.json" << EOF
{
  "version": "1.0.0",
  "created": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "encryption": "aes-256-gcm",
  "format": "cucs-v1"
}
EOF

cat > "${VAULT_DIR}/metadata/last-sync.json" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "status": "initialized",
  "synced_tools": []
}
EOF

echo -e "${GREEN}  Created metadata files${NC}"

# ============================================================================
# STEP 4: Set permissions
# ============================================================================
echo -e "${YELLOW}[4/5] Setting permissions...${NC}"

chmod 700 "${VAULT_DIR}"
chmod 700 "${VAULT_DIR}/credentials"
chmod 700 "${VAULT_DIR}/master-keys"
chmod 600 "${VAULT_DIR}/metadata/"*.json 2>/dev/null || true

echo -e "${GREEN}  Permissions set (700 for vault, 600 for sensitive files)${NC}"

# ============================================================================
# STEP 5: Summary
# ============================================================================
echo -e "${YELLOW}[5/5] Initialization complete${NC}"
echo ""
echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}  CUCS Initialized Successfully${NC}"
echo -e "${GREEN}================================================================${NC}"
echo ""
echo -e "Structure created:"
echo -e "  ${BLUE}${CUCS_HOME}/${NC}"
echo -e "  ├── vault/"
echo -e "  │   ├── credentials/"
echo -e "  │   ├── master-keys/"
echo -e "  │   └── metadata/"
echo -e "  ├── registry/"
echo -e "  │   ├── global.yaml"
echo -e "  │   ├── environments.yaml"
echo -e "  │   └── mcps.yaml"
echo -e "  └── sync/"
echo -e "      ├── vscode/"
echo -e "      ├── docker/"
echo -e "      ├── cli/"
echo -e "      ├── mcps/"
echo -e "      └── browser/"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Run: ${BLUE}cucs-import.sh /path/to/.env${NC} to import credentials"
echo -e "  2. Run: ${BLUE}cucs-sync.sh${NC} to sync to all tools"
echo ""
