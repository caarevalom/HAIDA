"""
HAIDA Configuration
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_RELOAD: bool = True
    API_WORKERS: int = 4

    # Database
    DATABASE_URL: str
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 30

    # Atlassian
    ATLASSIAN_URL: str
    ATLASSIAN_EMAIL: str
    ATLASSIAN_API_TOKEN: str
    CONFLUENCE_SPACE: str
    JIRA_PROJECT_KEY: str = "HAIDA"

    # Telegram
    TELEGRAM_BOT_TOKEN: str
    WEBHOOK_URL: str = ""

    # LM Studio
    LM_STUDIO_URL: str = "http://localhost:1234/v1"
    LM_STUDIO_MODEL: str
    LM_STUDIO_API_KEY: str = "lm-studio"

    # Railway
    RAILWAY_TOKEN: str = ""

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Allure
    ALLURE_RESULTS_DIR: str = "./allure-results"
    ALLURE_REPORTS_DIR: str = "./allure-reports"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
