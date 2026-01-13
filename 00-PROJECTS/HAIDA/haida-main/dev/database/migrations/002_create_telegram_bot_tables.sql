-- Create telegram user links
CREATE TABLE IF NOT EXISTS telegram_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id VARCHAR(100) UNIQUE NOT NULL,
    telegram_user_id VARCHAR(100),
    telegram_username VARCHAR(255),
    telegram_display_name VARCHAR(255),
    user_id UUID,
    tenant_id UUID,
    role VARCHAR(50) DEFAULT 'viewer',
    access_token TEXT,
    token_expires_at BIGINT,
    is_active BOOLEAN DEFAULT true,
    linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telegram_users_chat_id ON telegram_users(chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_users_user_id ON telegram_users(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_users_tenant_id ON telegram_users(tenant_id);

-- Create telegram subscriptions
CREATE TABLE IF NOT EXISTS telegram_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id VARCHAR(100) NOT NULL,
    tenant_id UUID,
    event_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(chat_id, event_type)
);

CREATE INDEX IF NOT EXISTS idx_telegram_subscriptions_chat_id ON telegram_subscriptions(chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_subscriptions_tenant_id ON telegram_subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_telegram_subscriptions_event_type ON telegram_subscriptions(event_type);

ALTER TABLE telegram_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_subscriptions ENABLE ROW LEVEL SECURITY;

-- Admin-only read policy
CREATE POLICY telegram_users_admin_only ON telegram_users
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM users
            WHERE role = 'admin'
        )
    );

CREATE POLICY telegram_subscriptions_admin_only ON telegram_subscriptions
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM users
            WHERE role = 'admin'
        )
    );

COMMENT ON TABLE telegram_users IS 'Telegram chat links for HAIDA users';
COMMENT ON TABLE telegram_subscriptions IS 'Telegram notification subscriptions by event type';
