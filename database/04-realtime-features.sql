-- ============================================
-- HAIDA REALTIME FEATURES MIGRATION
-- Adds tables and triggers for realtime functionality
-- ============================================

-- ============================================
-- TABLE: specifications
-- Purpose: Store functional specifications for collaborative editing
-- ============================================
CREATE TABLE specifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    content TEXT NOT NULL, -- Markdown content
    version INTEGER DEFAULT 1,
    is_locked BOOLEAN DEFAULT false,
    locked_by UUID REFERENCES users(id) ON DELETE SET NULL,
    locked_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'draft', -- draft, review, approved, published
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_specifications_project_id ON specifications(project_id);
CREATE INDEX idx_specifications_slug ON specifications(slug);
CREATE INDEX idx_specifications_status ON specifications(status);
CREATE INDEX idx_specifications_created_by ON specifications(created_by);

-- Trigger for updated_at
CREATE TRIGGER update_specifications_updated_at
    BEFORE UPDATE ON specifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE specifications IS 'Functional specifications for collaborative editing';

-- ============================================
-- TABLE: messages
-- Purpose: Store realtime chat messages for QA team collaboration
-- ============================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_type VARCHAR(50) DEFAULT 'text', -- text, file, system
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb, -- Array of file attachments
    reply_to UUID REFERENCES messages(id) ON DELETE SET NULL, -- For threading
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_messages_project_id ON messages(project_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_reply_to ON messages(reply_to);

COMMENT ON TABLE messages IS 'Realtime chat messages for team collaboration';

-- ============================================
-- TABLE: notifications
-- Purpose: Store realtime notifications for progress updates
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL for broadcast notifications
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- progress, completion, error, info
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb, -- Additional notification data
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE, -- For temporary notifications
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_project_id ON notifications(project_id);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

COMMENT ON TABLE notifications IS 'Realtime notifications for system events and progress updates';

-- ============================================
-- TABLE: user_sessions
-- Purpose: Track user presence and collaboration sessions
-- ============================================
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    session_type VARCHAR(50) DEFAULT 'collaboration', -- collaboration, review, testing
    is_active BOOLEAN DEFAULT true,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_context JSONB DEFAULT '{}'::jsonb, -- What they're working on
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_project_id ON user_sessions(project_id);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_last_seen_at ON user_sessions(last_seen_at DESC);

COMMENT ON TABLE user_sessions IS 'User presence and session tracking for realtime features';

-- ============================================
-- REALTIME TRIGGERS FOR BROADCAST NOTIFICATIONS
-- ============================================

-- Function: Broadcast specification changes
CREATE OR REPLACE FUNCTION broadcast_specification_changes()
RETURNS TRIGGER AS $$
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    channel_name TEXT;
    event_type TEXT;
    payload JSONB;
BEGIN
    channel_name := 'project:' || COALESCE(NEW.project_id, OLD.project_id)::text;

    IF TG_OP = 'INSERT' THEN
        event_type := 'specification_created';
        payload := jsonb_build_object(
            'specification_id', NEW.id,
            'name', NEW.name,
            'project_id', NEW.project_id,
            'created_by', NEW.created_by,
            'status', NEW.status
        );
    ELSIF TG_OP = 'UPDATE' THEN
        event_type := 'specification_updated';
        payload := jsonb_build_object(
            'specification_id', NEW.id,
            'name', NEW.name,
            'project_id', NEW.project_id,
            'updated_by', (SELECT auth.uid()),
            'version', NEW.version,
            'status', NEW.status,
            'changes', jsonb_build_object(
                'content_changed', OLD.content IS DISTINCT FROM NEW.content,
                'status_changed', OLD.status IS DISTINCT FROM NEW.status,
                'locked_changed', OLD.is_locked IS DISTINCT FROM NEW.is_locked
            )
        );
    ELSIF TG_OP = 'DELETE' THEN
        event_type := 'specification_deleted';
        payload := jsonb_build_object(
            'specification_id', OLD.id,
            'name', OLD.name,
            'project_id', OLD.project_id
        );
    END IF;

    PERFORM realtime.broadcast_changes(
        channel_name,
        event_type,
        TG_OP,
        TG_TABLE_NAME,
        TG_TABLE_SCHEMA,
        NEW,
        OLD
    );

    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Function: Broadcast message changes
CREATE OR REPLACE FUNCTION broadcast_message_changes()
RETURNS TRIGGER AS $$
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    channel_name TEXT;
    event_type TEXT;
    payload JSONB;
BEGIN
    channel_name := 'project:' || COALESCE(NEW.project_id, OLD.project_id)::text;

    IF TG_OP = 'INSERT' THEN
        event_type := 'message_created';
        payload := jsonb_build_object(
            'message_id', NEW.id,
            'project_id', NEW.project_id,
            'user_id', NEW.user_id,
            'message_type', NEW.message_type,
            'content', NEW.content,
            'reply_to', NEW.reply_to
        );
    END IF;

    -- Only broadcast inserts for messages, updates/deletes are less critical
    IF TG_OP = 'INSERT' THEN
        PERFORM realtime.broadcast_changes(
            channel_name,
            event_type,
            TG_OP,
            TG_TABLE_NAME,
            TG_TABLE_SCHEMA,
            NEW,
            OLD
        );
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Function: Broadcast test execution progress
CREATE OR REPLACE FUNCTION broadcast_test_execution_changes()
RETURNS TRIGGER AS $$
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    channel_name TEXT;
    event_type TEXT;
    payload JSONB;
BEGIN
    channel_name := 'project:' || COALESCE(NEW.project_id, OLD.project_id)::text;

    IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        event_type := CASE
            WHEN NEW.status = 'running' THEN 'execution_started'
            WHEN NEW.status = 'completed' THEN 'execution_completed'
            WHEN NEW.status = 'failed' THEN 'execution_failed'
            ELSE 'execution_status_changed'
        END;

        payload := jsonb_build_object(
            'execution_id', NEW.id,
            'project_id', NEW.project_id,
            'status', NEW.status,
            'total_tests', NEW.total_tests,
            'passed_tests', NEW.passed_tests,
            'failed_tests', NEW.failed_tests,
            'duration_ms', NEW.duration_ms,
            'environment', NEW.environment
        );

        PERFORM realtime.broadcast_changes(
            channel_name,
            event_type,
            TG_OP,
            TG_TABLE_NAME,
            TG_TABLE_SCHEMA,
            NEW,
            OLD
        );
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Function: Broadcast user session changes
CREATE OR REPLACE FUNCTION broadcast_user_session_changes()
RETURNS TRIGGER AS $$
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    channel_name TEXT;
    event_type TEXT;
    payload JSONB;
BEGIN
    channel_name := 'project:' || COALESCE(NEW.project_id, OLD.project_id)::text;

    IF TG_OP = 'INSERT' THEN
        event_type := 'user_joined';
        payload := jsonb_build_object(
            'session_id', NEW.id,
            'user_id', NEW.user_id,
            'project_id', NEW.project_id,
            'session_type', NEW.session_type
        );
    ELSIF TG_OP = 'UPDATE' AND OLD.is_active != NEW.is_active THEN
        event_type := CASE WHEN NEW.is_active THEN 'user_rejoined' ELSE 'user_left' END;
        payload := jsonb_build_object(
            'session_id', NEW.id,
            'user_id', NEW.user_id,
            'project_id', NEW.project_id,
            'is_active', NEW.is_active
        );
    END IF;

    IF event_type IS NOT NULL THEN
        PERFORM realtime.broadcast_changes(
            channel_name,
            event_type,
            TG_OP,
            TG_TABLE_NAME,
            TG_TABLE_SCHEMA,
            NEW,
            OLD
        );
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers
CREATE TRIGGER specifications_broadcast_trigger
    AFTER INSERT OR UPDATE OR DELETE ON specifications
    FOR EACH ROW EXECUTE FUNCTION broadcast_specification_changes();

CREATE TRIGGER messages_broadcast_trigger
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION broadcast_message_changes();

CREATE TRIGGER test_executions_broadcast_trigger
    AFTER UPDATE ON test_executions
    FOR EACH ROW EXECUTE FUNCTION broadcast_test_execution_changes();

CREATE TRIGGER user_sessions_broadcast_trigger
    AFTER INSERT OR UPDATE ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION broadcast_user_session_changes();

-- ============================================
-- RLS POLICIES FOR REALTIME FEATURES
-- ============================================

-- Specifications policies
CREATE POLICY "project_members_can_read_specifications" ON specifications
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = specifications.project_id
            AND (p.owner_id = auth.uid() OR EXISTS (
                SELECT 1 FROM user_sessions us
                WHERE us.user_id = auth.uid()
                AND us.project_id = p.id
                AND us.is_active = true
            ))
        )
    );

CREATE POLICY "project_members_can_write_specifications" ON specifications
    FOR INSERT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = specifications.project_id
            AND (p.owner_id = auth.uid() OR EXISTS (
                SELECT 1 FROM user_sessions us
                WHERE us.user_id = auth.uid()
                AND us.project_id = p.id
                AND us.is_active = true
            ))
        )
    );

CREATE POLICY "specification_creator_can_update" ON specifications
    FOR UPDATE TO authenticated
    USING (
        created_by = auth.uid() OR
        (is_locked = false OR locked_by = auth.uid())
    );

-- Messages policies
CREATE POLICY "project_members_can_read_messages" ON messages
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_sessions us
            WHERE us.user_id = auth.uid()
            AND us.project_id = messages.project_id
            AND us.is_active = true
        )
    );

CREATE POLICY "project_members_can_write_messages" ON messages
    FOR INSERT TO authenticated
    USING (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM user_sessions us
            WHERE us.user_id = auth.uid()
            AND us.project_id = messages.project_id
            AND us.is_active = true
        )
    );

-- Notifications policies
CREATE POLICY "users_can_read_own_notifications" ON notifications
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "system_can_create_notifications" ON notifications
    FOR INSERT TO authenticated
    USING (true); -- Allow system/service role to create notifications

CREATE POLICY "users_can_update_own_notifications" ON notifications
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

-- User sessions policies
CREATE POLICY "users_can_manage_own_sessions" ON user_sessions
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

-- ============================================
-- INDEXES FOR RLS PERFORMANCE
-- ============================================

CREATE INDEX idx_specifications_project_owner ON specifications(project_id, created_by);
CREATE INDEX idx_messages_project_user ON messages(project_id, user_id);
CREATE INDEX idx_notifications_user_project ON notifications(user_id, project_id);
CREATE INDEX idx_user_sessions_user_project_active ON user_sessions(user_id, project_id, is_active);

-- ============================================
-- SEED DATA FOR TESTING
-- ============================================

-- Insert sample specification
INSERT INTO specifications (project_id, name, slug, content, created_by) VALUES
((SELECT id FROM projects WHERE slug = 'haida-demo' LIMIT 1),
'Login Functionality Spec',
'login-spec',
'# Login Functionality

## Overview
The login functionality allows users to authenticate...

## Requirements
1. Email/password authentication
2. Remember me option
3. Password reset functionality

## Test Cases
- Valid login
- Invalid credentials
- Password reset flow',
(SELECT id FROM users WHERE email = 'qa@haida.com' LIMIT 1))
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '
    ============================================
    HAIDA REALTIME FEATURES MIGRATION COMPLETED
    ============================================

    New Tables:
    - specifications (collaborative editing)
    - messages (realtime chat)
    - notifications (progress updates)
    - user_sessions (presence tracking)

    New Functions:
    - broadcast_specification_changes()
    - broadcast_message_changes()
    - broadcast_test_execution_changes()
    - broadcast_user_session_changes()

    Triggers Created:
    - Automatic broadcast on table changes

    RLS Policies:
    - Secure access control for all tables

    Next Steps:
    1. Apply migration to database
    2. Configure frontend realtime client
    3. Implement UI components
    4. Test realtime features

    ============================================
    ';
END $$;
