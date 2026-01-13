
-- Migration: Add full_name column to users table
-- Date: 2025-12-26

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);

-- Copy existing name to full_name
UPDATE public.users
SET full_name = name
WHERE full_name IS NULL;

COMMENT ON COLUMN public.users.full_name IS 'Full name of user (for API compatibility)';



-- Migration: Sync users from auth.users to public.users
-- Date: 2025-12-26

INSERT INTO public.users (id, email, name, full_name, role, created_at)
SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', SPLIT_PART(au.email, '@', 1)) as name,
    COALESCE(au.raw_user_meta_data->>'full_name', SPLIT_PART(au.email, '@', 1)) as full_name,
    COALESCE(au.raw_user_meta_data->>'role', 'viewer') as role,
    au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = CURRENT_TIMESTAMP;
