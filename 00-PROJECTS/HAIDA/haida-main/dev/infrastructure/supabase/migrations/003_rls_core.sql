-- Enable RLS and core tenant membership policies (schema v2.0)

-- Projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY projects_select ON projects
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM tenant_members tm
        WHERE tm.tenant_id = projects.tenant_id
          AND tm.user_id = auth.uid()
    )
);
CREATE POLICY projects_insert ON projects
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM tenant_members tm
        WHERE tm.tenant_id = projects.tenant_id
          AND tm.user_id = auth.uid()
    )
);
CREATE POLICY projects_update ON projects
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM tenant_members tm
        WHERE tm.tenant_id = projects.tenant_id
          AND tm.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM tenant_members tm
        WHERE tm.tenant_id = projects.tenant_id
          AND tm.user_id = auth.uid()
    )
);
CREATE POLICY projects_delete ON projects
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM tenant_members tm
        WHERE tm.tenant_id = projects.tenant_id
          AND tm.user_id = auth.uid()
    )
);

-- Reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY reports_select ON reports
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM tenant_members tm
        WHERE tm.tenant_id = reports.tenant_id
          AND tm.user_id = auth.uid()
    )
);
CREATE POLICY reports_insert ON reports
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM tenant_members tm
        WHERE tm.tenant_id = reports.tenant_id
          AND tm.user_id = auth.uid()
    )
);
CREATE POLICY reports_update ON reports
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM tenant_members tm
        WHERE tm.tenant_id = reports.tenant_id
          AND tm.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM tenant_members tm
        WHERE tm.tenant_id = reports.tenant_id
          AND tm.user_id = auth.uid()
    )
);
CREATE POLICY reports_delete ON reports
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM tenant_members tm
        WHERE tm.tenant_id = reports.tenant_id
          AND tm.user_id = auth.uid()
    )
);

-- Chat threads
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY chat_threads_select ON chat_threads
FOR SELECT
USING (
    user_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM tenant_members tm
        WHERE tm.tenant_id = chat_threads.tenant_id
          AND tm.user_id = auth.uid()
    )
);
CREATE POLICY chat_threads_insert ON chat_threads
FOR INSERT
WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM tenant_members tm
        WHERE tm.tenant_id = chat_threads.tenant_id
          AND tm.user_id = auth.uid()
    )
);
CREATE POLICY chat_threads_update ON chat_threads
FOR UPDATE
USING (
    user_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM tenant_members tm
        WHERE tm.tenant_id = chat_threads.tenant_id
          AND tm.user_id = auth.uid()
    )
)
WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM tenant_members tm
        WHERE tm.tenant_id = chat_threads.tenant_id
          AND tm.user_id = auth.uid()
    )
);
CREATE POLICY chat_threads_delete ON chat_threads
FOR DELETE
USING (
    user_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM tenant_members tm
        WHERE tm.tenant_id = chat_threads.tenant_id
          AND tm.user_id = auth.uid()
    )
);

-- Chat messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY chat_messages_select ON chat_messages
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM chat_threads ct
        JOIN tenant_members tm ON tm.tenant_id = ct.tenant_id
        WHERE ct.id = chat_messages.thread_id
          AND tm.user_id = auth.uid()
          AND ct.user_id = auth.uid()
    )
);
CREATE POLICY chat_messages_insert ON chat_messages
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM chat_threads ct
        JOIN tenant_members tm ON tm.tenant_id = ct.tenant_id
        WHERE ct.id = chat_messages.thread_id
          AND tm.user_id = auth.uid()
          AND ct.user_id = auth.uid()
    )
);
