#!/bin/bash
# Script to initialize chat tables in Supabase PostgreSQL

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}HAIDA Chat Tables Setup${NC}"
echo -e "${YELLOW}========================================${NC}"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL environment variable is not set${NC}"
    echo "Please set DATABASE_URL before running this script"
    echo "Example: export DATABASE_URL='postgresql://user:password@host:5432/database'"
    exit 1
fi

echo -e "${YELLOW}Using database:${NC} $(echo $DATABASE_URL | sed 's/postgresql:\/\/.*:.*@/postgresql:\/\/***:***@/')"

# Execute migrations
echo -e "${YELLOW}Running migrations...${NC}"

psql "$DATABASE_URL" << 'EOF'

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create chat providers configuration table
CREATE TABLE IF NOT EXISTS chat_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    provider VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    config JSONB NOT NULL DEFAULT '{}',
    usage_limits JSONB DEFAULT '{}',
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, provider)
);

-- Create chat threads table
CREATE TABLE IF NOT EXISTS chat_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    title VARCHAR(255),
    provider VARCHAR(50) NOT NULL DEFAULT 'copilot-studio',
    status VARCHAR(50) DEFAULT 'active',
    thread_id VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL,
    content TEXT,
    content_type VARCHAR(50) DEFAULT 'text',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (thread_id) REFERENCES chat_threads(id) ON DELETE CASCADE
);

-- Create telegram messages table
CREATE TABLE IF NOT EXISTS telegram_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100),
    user_name VARCHAR(255),
    text TEXT,
    message_type VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create oauth_tokens table for storing external provider tokens
CREATE TABLE IF NOT EXISTS oauth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    provider VARCHAR(50) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, provider),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_chat_providers_tenant ON chat_providers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chat_providers_tenant_provider ON chat_providers(tenant_id, provider);
CREATE INDEX IF NOT EXISTS idx_chat_threads_tenant_user ON chat_threads(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_provider ON chat_threads(provider);
CREATE INDEX IF NOT EXISTS idx_chat_threads_status ON chat_threads(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread ON chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_chat ON telegram_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_user ON telegram_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_created ON telegram_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user_provider ON oauth_tokens(user_id, provider);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON chat_providers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON chat_threads TO authenticated;
GRANT SELECT, INSERT ON chat_messages TO authenticated;
GRANT SELECT ON telegram_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON oauth_tokens TO authenticated;

-- Create tables summary view
CREATE OR REPLACE VIEW chat_statistics AS
SELECT
    'chat_providers' as table_name,
    COUNT(*) as total_records,
    MAX(updated_at) as last_modified
FROM chat_providers
UNION ALL
SELECT
    'chat_threads',
    COUNT(*),
    MAX(updated_at)
FROM chat_threads
UNION ALL
SELECT
    'chat_messages',
    COUNT(*),
    MAX(created_at)
FROM chat_messages
UNION ALL
SELECT
    'telegram_messages',
    COUNT(*),
    MAX(created_at)
FROM telegram_messages;

EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migrations completed successfully${NC}"

    # Show table statistics
    echo -e "${YELLOW}Table Statistics:${NC}"
    psql "$DATABASE_URL" -c "SELECT * FROM chat_statistics;"

    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Setup Complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "Tables created:"
    echo "  • chat_providers - AI provider configuration"
    echo "  • chat_threads - Conversation threads"
    echo "  • chat_messages - Individual messages"
    echo "  • telegram_messages - Telegram bot messages"
    echo "  • oauth_tokens - External provider tokens"
    echo ""
else
    echo -e "${RED}✗ Migration failed${NC}"
    exit 1
fi
