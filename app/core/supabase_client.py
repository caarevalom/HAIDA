import os
from fastapi import HTTPException
from supabase import create_client, Client

def get_supabase_client() -> Client:
    """Create a Supabase client using the best available key."""
    supabase_url = os.getenv("SUPABASE_URL")
    use_service_role = os.getenv("SUPABASE_USE_SERVICE_ROLE", "false").lower() == "true"
    if use_service_role:
        supabase_key = (
            os.getenv("SUPABASE_SERVICE_ROLE_KEY")
            or os.getenv("SUPABASE_SERVICE_KEY")
            or os.getenv("SUPABASE_ANON_KEY")
        )
    else:
        supabase_key = os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")

    if not supabase_url or not supabase_key:
        raise HTTPException(status_code=500, detail="Supabase credentials not configured")

    return create_client(supabase_url, supabase_key)
