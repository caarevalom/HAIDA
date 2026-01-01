import os
from dataclasses import dataclass

@dataclass
class Settings:
    app_name: str = os.environ.get("APP_NAME", "HAIDA")
    env: str = os.environ.get("APP_ENV", "development")
    api_base_url: str = os.environ.get("API_BASE_URL", "http://localhost:8000")

    cors_origins: list[str] = [o.strip() for o in os.environ.get("CORS_ALLOWED_ORIGINS", "").split(",") if o.strip()]
    cors_methods: list[str] = [m.strip() for m in os.environ.get("CORS_ALLOWED_METHODS", "GET,POST,PATCH,DELETE,OPTIONS").split(",")]
    cors_headers: list[str] = [h.strip() for h in os.environ.get("CORS_ALLOWED_HEADERS", "Authorization,Content-Type,X-Requested-With").split(",")]
    cors_credentials: bool = os.environ.get("CORS_ALLOW_CREDENTIALS", "true").lower() == "true"

    jwt_secret: str = os.environ.get("JWT_SECRET", "change_me_super_secret")
    jwt_alg: str = os.environ.get("JWT_ALGORITHM", "HS256")
    jwt_ttl_min: int = int(os.environ.get("JWT_ACCESS_TTL_MIN", "60"))

    supabase_url: str = os.environ.get("SUPABASE_URL", "")
    supabase_db_url: str = os.environ.get("DATABASE_URL", "")
    redis_url: str = os.environ.get("REDIS_URL", "")

    entra_authority: str = os.environ.get("ENTRA_AUTHORITY", "")
    entra_client_id: str = os.environ.get("ENTRA_CLIENT_ID", "")
    entra_client_secret: str = os.environ.get("ENTRA_CLIENT_SECRET", "")
    entra_client_cert_thumbprint: str = os.environ.get("ENTRA_CLIENT_CERT_THUMBPRINT", "")
    entra_client_cert_private_key_b64: str = os.environ.get("ENTRA_CLIENT_CERT_PRIVATE_KEY_B64", "")
    entra_client_cert_private_key: str = os.environ.get("ENTRA_CLIENT_CERT_PRIVATE_KEY", "")
    entra_redirect_uri: str = os.environ.get("ENTRA_REDIRECT_URI", "")
    graph_scopes: list[str] = os.environ.get("GRAPH_SCOPES", "User.Read").split()

    direct_line_secret: str = os.environ.get(
        "DIRECT_LINE_SECRET",
        os.environ.get("COPILOT_DIRECTLINE_SECRET", ""),
    )
    direct_line_endpoint: str = os.environ.get(
        "DIRECT_LINE_ENDPOINT",
        os.environ.get("COPILOT_DIRECTLINE_ENDPOINT", "https://directline.botframework.com/v3/directline"),
    )

    locales_supported: list[str] = os.environ.get("SUPPORTED_LOCALES", "es,en,fr").split(",")
    default_locale: str = os.environ.get("DEFAULT_LOCALE", "es")

# Global settings instance
settings = Settings()
