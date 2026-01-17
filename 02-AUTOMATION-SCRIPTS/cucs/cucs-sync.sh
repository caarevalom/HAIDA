#!/bin/bash
# ============================================================================
# CUCS SYNC SCRIPT
# Sync credentials from vault to all configured tools
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
CREDENTIALS_DIR="${VAULT_DIR}/credentials"
SYNC_DIR="${CUCS_HOME}/sync"

echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE}  CUCS - Sync Configuration${NC}"
echo -e "${BLUE}================================================================${NC}"
echo ""

# ============================================================================
# Sync VS Code MCP Configuration
# ============================================================================
sync_vscode() {
    echo -e "${YELLOW}[1/4] Syncing VS Code...${NC}"

    local VSCODE_USER="${HOME}/Library/Application Support/Code/User"
    local MCP_FILE="${VSCODE_USER}/mcp.json"

    if [ -d "$VSCODE_USER" ]; then
        # Read credentials if available
        local SUPABASE_TOKEN=""
        if [ -f "${CREDENTIALS_DIR}/supabase.env" ]; then
            SUPABASE_TOKEN=$(grep "SUPABASE_ACCESS_TOKEN" "${CREDENTIALS_DIR}/supabase.env" 2>/dev/null | cut -d'=' -f2 || echo "")
        fi

        # Create/update MCP configuration
        cat > "${SYNC_DIR}/vscode/mcp-template.json" << EOF
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["@supabase/mcp-server-supabase@latest", "--access-token", "\${SUPABASE_ACCESS_TOKEN}"]
    },
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    },
    "github": {
      "command": "npx",
      "args": ["@anthropic/mcp-github@latest"]
    }
  }
}
EOF

        echo -e "${GREEN}    Created MCP template: ${SYNC_DIR}/vscode/mcp-template.json${NC}"
        echo -e "${YELLOW}    Note: Copy to ${MCP_FILE} and add credentials${NC}"
    else
        echo -e "${YELLOW}    VS Code user directory not found${NC}"
    fi
}

# ============================================================================
# Sync Docker Configuration
# ============================================================================
sync_docker() {
    echo -e "${YELLOW}[2/4] Syncing Docker...${NC}"

    local DOCKER_CONFIG="${HOME}/.docker/config.json"

    if [ -f "$DOCKER_CONFIG" ]; then
        # Create env file for Docker Compose
        cat > "${SYNC_DIR}/docker/docker.env" << 'EOF'
# Docker environment variables
# Sourced from CUCS vault
# Include in docker-compose with: env_file: ~/.config/cucs/sync/docker/docker.env
EOF

        # Append database credentials if available
        if [ -f "${CREDENTIALS_DIR}/supabase.env" ]; then
            grep -E "^(DATABASE_URL|DB_|SUPABASE_)" "${CREDENTIALS_DIR}/supabase.env" >> "${SYNC_DIR}/docker/docker.env" 2>/dev/null || true
        fi

        if [ -f "${CREDENTIALS_DIR}/database.env" ]; then
            grep -E "^(POSTGRES_|REDIS_|MONGO_)" "${CREDENTIALS_DIR}/database.env" >> "${SYNC_DIR}/docker/docker.env" 2>/dev/null || true
        fi

        echo -e "${GREEN}    Created: ${SYNC_DIR}/docker/docker.env${NC}"
    else
        echo -e "${YELLOW}    Docker config not found${NC}"
    fi
}

# ============================================================================
# Sync CLI Tools
# ============================================================================
sync_cli() {
    echo -e "${YELLOW}[3/4] Syncing CLI tools...${NC}"

    # GitHub CLI
    local GH_CONFIG="${HOME}/.config/gh"
    if [ -d "$GH_CONFIG" ]; then
        echo -e "${GREEN}    GitHub CLI: Configured via 'gh auth login'${NC}"
    fi

    # Vercel CLI
    local VERCEL_CONFIG="${HOME}/.vercel"
    if [ -d "$VERCEL_CONFIG" ]; then
        echo -e "${GREEN}    Vercel CLI: Configured via 'vercel login'${NC}"
    fi

    # Azure CLI
    local AZURE_CONFIG="${HOME}/.azure"
    if [ -d "$AZURE_CONFIG" ]; then
        echo -e "${GREEN}    Azure CLI: Configured via 'az login'${NC}"
    fi

    # Create shell profile additions
    cat > "${SYNC_DIR}/cli/env-loader.sh" << 'EOF'
#!/bin/bash
# CUCS Environment Loader
# Source this from your .zshrc or .bashrc

CUCS_CREDENTIALS="${HOME}/.config/cucs/vault/credentials"

# Load all credentials as environment variables
for cred_file in "${CUCS_CREDENTIALS}"/*.env; do
    if [ -f "$cred_file" ]; then
        set -a
        source "$cred_file"
        set +a
    fi
done
EOF

    echo -e "${GREEN}    Created: ${SYNC_DIR}/cli/env-loader.sh${NC}"
    echo -e "${YELLOW}    Add to .zshrc: source ~/.config/cucs/sync/cli/env-loader.sh${NC}"
}

# ============================================================================
# Sync MCP Configuration
# ============================================================================
sync_mcps() {
    echo -e "${YELLOW}[4/4] Syncing MCP servers...${NC}"

    # Create unified MCP configuration
    cat > "${SYNC_DIR}/mcps/servers.json" << 'EOF'
{
  "servers": {
    "supabase-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["@supabase/mcp-server-supabase@latest"],
      "envSource": "vault.supabase"
    },
    "playwright-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    },
    "github-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["@anthropic/mcp-github@latest"],
      "envSource": "vault.github"
    },
    "azure-mcp": {
      "type": "stdio",
      "command": "dnx",
      "args": ["Azure.Mcp@latest", "--", "server", "start"],
      "envSource": "vault.azure"
    }
  }
}
EOF

    echo -e "${GREEN}    Created: ${SYNC_DIR}/mcps/servers.json${NC}"
}

# ============================================================================
# Run all syncs
# ============================================================================
sync_vscode
sync_docker
sync_cli
sync_mcps

# ============================================================================
# Update metadata
# ============================================================================
cat > "${VAULT_DIR}/metadata/last-sync.json" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "status": "synced",
  "synced_tools": ["vscode", "docker", "cli", "mcps"]
}
EOF

# ============================================================================
# Summary
# ============================================================================
echo ""
echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}  Sync Complete${NC}"
echo -e "${GREEN}================================================================${NC}"
echo ""
echo -e "Synced configurations in: ${BLUE}${SYNC_DIR}/${NC}"
echo ""
echo -e "Files created:"
echo -e "  ${BLUE}vscode/mcp-template.json${NC}  - VS Code MCP configuration"
echo -e "  ${BLUE}docker/docker.env${NC}         - Docker environment variables"
echo -e "  ${BLUE}cli/env-loader.sh${NC}         - Shell environment loader"
echo -e "  ${BLUE}mcps/servers.json${NC}         - MCP servers registry"
echo ""
