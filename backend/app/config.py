from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # URL complète de la base de données (si fournie dans .env)
    db_url: str | None = None

    app_name: str = "BibliO API"
    app_env: str = "dev"
    app_secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 jours

    db_host: str = "127.0.0.1"
    db_port: int = 3306
    db_user: str = "root"
    db_password: str = ""
    db_name: str = "biblio"

    cors_origins: str = "http://localhost:3000"

    penalty_rate_per_day: float = 0.50

    @property
    def database_url(self) -> str:
        # Si une URL complète est fournie, on l'utilise directement
        if self.db_url:
            url = self.db_url
            # SQLAlchemy a besoin de postgresql+psycopg2 pour PostgreSQL en Python
            if url.startswith("postgresql://") and "psycopg2" not in url:
                url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
            return url

        # Fallback vers MySQL si aucune URL n'est fournie
        user = self.db_user
        pwd = self.db_password
        host = self.db_host
        port = self.db_port
        name = self.db_name
        return f"mysql+pymysql://{user}:{pwd}@{host}:{port}/{name}?charset=utf8mb4"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()

