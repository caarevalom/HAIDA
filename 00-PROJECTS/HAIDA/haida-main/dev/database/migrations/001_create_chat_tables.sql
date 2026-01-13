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

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_chat_providers_tenant ON chat_providers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chat_providers_tenant_provider ON chat_providers(tenant_id, provider);
CREATE INDEX IF NOT EXISTS idx_chat_threads_tenant_user ON chat_threads(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_provider ON chat_threads(provider);
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread ON chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_chat ON telegram_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_user ON telegram_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_created ON telegram_messages(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE chat_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_messages ENABLE ROW LEVEL SECURITY;

-- RLS policy for chat_providers: only tenant members can see their providers
CREATE POLICY chat_providers_tenant_isolation ON chat_providers
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_members
            WHERE user_id = auth.uid()
        )
    );

-- RLS policy for chat_threads: users can only see their own threads
CREATE POLICY chat_threads_user_isolation ON chat_threads
    FOR SELECT USING (user_id = auth.uid());

-- RLS policy for chat_messages: indirect through thread access
CREATE POLICY chat_messages_thread_isolation ON chat_messages
    FOR SELECT USING (
        thread_id IN (
            SELECT id FROM chat_threads
            WHERE user_id = auth.uid()
        )
    );

-- RLS policy for telegram_messages: read-only for admins
CREATE POLICY telegram_messages_admin_only ON telegram_messages
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM users
            WHERE role = 'admin'
        )
    );

COMMENT ON TABLE chat_providers IS 'Configuration for different AI chat providers per tenant';
COMMENT ON TABLE chat_threads IS 'Chat conversation threads';
COMMENT ON TABLE chat_messages IS 'Individual messages in a chat thread';
COMMENT ON TABLE telegram_messages IS 'Messages received via Telegram bot';
