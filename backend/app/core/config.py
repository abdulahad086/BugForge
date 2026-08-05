from functools import lru_cache
from typing import Literal
from pydantic import PostgresDsn, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application Settings configuration loaded from environment variables or .env file.
    Uses Pydantic Settings v2 for strict type validation and fail-fast startup.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    # General Project Settings
    PROJECT_NAME: str = "BugForge"
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"
    LOG_LEVEL: str = "INFO"

    # PostgreSQL Database Settings
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "bugforge"
    POSTGRES_PASSWORD: str = "bugforge_password"
    POSTGRES_DB: str = "bugforge_db"

    # Connection Pool Tuning Parameters
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_RECYCLE: int = 1800

    @computed_field  # type: ignore[prop-decorator]
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        """
        Dynamically computes the PostgreSQL async connection URI for SQLAlchemy 2.0.
        Uses postgresql+asyncpg driver for non-blocking I/O.
        """
        return str(
            PostgresDsn.build(
                scheme="postgresql+asyncpg",
                username=self.POSTGRES_USER,
                password=self.POSTGRES_PASSWORD,
                host=self.POSTGRES_SERVER,
                port=self.POSTGRES_PORT,
                path=self.POSTGRES_DB,
            )
        )


@lru_cache
def get_settings() -> Settings:
    """
    Returns a cached instance of the Settings object.
    Prevents re-reading environment variables on every call.
    """
    return Settings()


settings = get_settings()
