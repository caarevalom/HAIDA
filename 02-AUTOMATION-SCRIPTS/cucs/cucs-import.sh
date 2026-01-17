#!/bin/bash
# ============================================================================
# CUCS IMPORT SCRIPT
# Import credentials from .env files into encrypted vault
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

# Check arguments
if [ $# -lt 1 ]; then
    echo -e "${RED}Usage: $0 <env-file> [--encrypt]${NC}"
    echo ""
    echo "Examples:"
    echo "  $0 /Users/carlosa/haida/.env"
    echo "  $0 /Users/carlosa/haida/.env --encrypt"
    exit 1
fi

ENV_FILE="$1"
ENCRYPT_MODE="${2:-}"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: File not found: $ENV_FILE${NC}"
    exit 1
fi

echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE}  CUCS - Import Credentials${NC}"
echo -e "${BLUE}================================================================${NC}"
echo ""
echo -e "Source: ${YELLOW}$ENV_FILE${NC}"
echo ""

# ============================================================================
# Parse .env and categorize
# ============================================================================
echo -e "${YELLOW}[1/3] Parsing environment file...${NC}"

# Create temporary categorized files
TMP_DIR=$(mktemp -d)
trap "rm -rf $TMP_DIR" EXIT

# Initialize category files
> "$TMP_DIR/supabase.env"
> "$TMP_DIR/azure.env"
> "$TMP_DIR/github.env"
> "$TMP_DIR/atlassian.env"
> "$TMP_DIR/vercel.env"
> "$TMP_DIR/telegram.env"
> "$TMP_DIR/database.env"
> "$TMP_DIR/llm.env"
> "$TMP_DIR/other.env"

# Parse and categorize
while IFS= read -r line || [ -n "$line" ]; do
    # Skip comments and empty lines
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "${line// }" ]] && continue

    # Categorize based on prefix
    case "$line" in
        SUPABASE*|DATABASE_URL*|DB_*)
            echo "$line" >> "$TMP_DIR/supabase.env"
            ;;
        AZURE*|ENTRA*|TENANT*)
            echo "$line" >> "$TMP_DIR/azure.env"
            ;;
        GITHUB*|GH_*|GIT_*)
            echo "$line" >> "$TMP_DIR/github.env"
            ;;
        JIRA*|CONFLUENCE*|ATLASSIAN*|BITBUCKET*)
            echo "$line" >> "$TMP_DIR/atlassian.env"
            ;;
        VERCEL*)
            echo "$line" >> "$TMP_DIR/vercel.env"
            ;;
        TELEGRAM*|BOT_TOKEN*|CHAT_ID*)
            echo "$line" >> "$TMP_DIR/telegram.env"
            ;;
        POSTGRES*|REDIS*|MONGO*)
            echo "$line" >> "$TMP_DIR/database.env"
            ;;
        OPENAI*|ANTHROPIC*|GEMINI*|LLM*|AI_*)
            echo "$line" >> "$TMP_DIR/llm.env"
            ;;
        *)
            echo "$line" >> "$TMP_DIR/other.env"
            ;;
    esac
done < "$ENV_FILE"

# Count categorized
echo -e "${GREEN}  Categorized variables:${NC}"
for cat_file in "$TMP_DIR"/*.env; do
    cat_name=$(basename "$cat_file" .env)
    count=$(grep -c '=' "$cat_file" 2>/dev/null || echo "0")
    if [ "$count" -gt 0 ]; then
        echo -e "    ${cat_name}: ${count} variables"
    fi
done
echo ""

# ============================================================================
# Store credentials
# ============================================================================
echo -e "${YELLOW}[2/3] Storing credentials...${NC}"

store_credentials() {
    local service=$1
    local source_file=$2
    local target_file="${CREDENTIALS_DIR}/${service}.env"

    if [ -s "$source_file" ]; then
        if [ "$ENCRYPT_MODE" == "--encrypt" ]; then
            # Encrypt with OpenSSL
            echo -e "  Encrypting ${service}..."
            openssl enc -aes-256-cbc -salt -pbkdf2 -in "$source_file" -out "${target_file}.enc" 2>/dev/null
            echo -e "${GREEN}    Stored: ${service}.env.enc${NC}"
        else
            # Store as plain text (development mode)
            cp "$source_file" "$target_file"
            chmod 600 "$target_file"
            echo -e "${GREEN}    Stored: ${service}.env${NC}"
        fi
    fi
}

for cat_file in "$TMP_DIR"/*.env; do
    cat_name=$(basename "$cat_file" .env)
    store_credentials "$cat_name" "$cat_file"
done

# ============================================================================
# Update metadata
# ============================================================================
echo ""
echo -e "${YELLOW}[3/3] Updating metadata...${NC}"

cat > "${VAULT_DIR}/metadata/last-sync.json" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "status": "imported",
  "source": "$ENV_FILE",
  "encrypted": $([ "$ENCRYPT_MODE" == "--encrypt" ] && echo "true" || echo "false")
}
EOF

echo -e "${GREEN}  Metadata updated${NC}"

# ============================================================================
# Summary
# ============================================================================
echo ""
echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}  Import Complete${NC}"
echo -e "${GREEN}================================================================${NC}"
echo ""
echo -e "Credentials stored in: ${BLUE}${CREDENTIALS_DIR}/${NC}"
echo ""

if [ "$ENCRYPT_MODE" != "--encrypt" ]; then
    echo -e "${YELLOW}WARNING: Credentials stored without encryption.${NC}"
    echo -e "For production use, run with --encrypt flag."
    echo ""
fi

echo -e "${YELLOW}Next step:${NC} Run ${BLUE}cucs-sync.sh${NC} to sync to tools"
echo ""
