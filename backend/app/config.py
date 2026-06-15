from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

INSECURE_JWT_SECRETS = {
    "change-me",
    "change-me-in-production",
    "secret",
    "your-secret-key",
}


class Settings(BaseSettings):
    app_name: str = "AI-Powered Personal Finance Analyzer"
    api_prefix: str = "/api"
    database_url: str = "sqlite:///./finance_analyzer.sqlite3"
    jwt_secret_key: str = Field(min_length=32)
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("jwt_secret_key")
    @classmethod
    def reject_insecure_jwt_secret(cls, value: str) -> str:
        normalized = value.strip().lower()
        if normalized in INSECURE_JWT_SECRETS or "change-me" in normalized:
            raise ValueError("JWT_SECRET_KEY must be a unique, randomly generated secret")
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
