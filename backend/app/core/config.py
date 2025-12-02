from functools import lru_cache
from typing import Any

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Dev Timesheets"
    environment: str = "development"
    api_prefix: str = "/api"
    secret_key: str = "dev-secret-key"
    access_token_expire_minutes: int = 30
    refresh_token_expire_minutes: int = 60 * 24 * 7

    database_url: str = (
        "postgresql+asyncpg://postgres:postgres@localhost:5432/timesheets"
    )
    redis_url: str = "redis://localhost:6379/0"

    sentry_dsn: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[arg-type]


def settings_dict() -> dict[str, Any]:
    settings = get_settings()
    return settings.model_dump()
