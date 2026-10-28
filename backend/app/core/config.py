"""
Application configuration — loads all settings from environment variables.
Never hardcode secrets here.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List


class Settings(BaseSettings):
    # ── App ──────────────────────────────────────────────────────────────
    app_name: str = "Personalized Travel Itinerary Planner"
    app_version: str = "1.0.0"
    app_env: str = "development"
    log_level: str = "INFO"

    # ── CORS ─────────────────────────────────────────────────────────────
    cors_origins: str = "http://localhost:5173"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    # ── AI ───────────────────────────────────────────────────────────────
    gemini_api_key: str = ""
    demo_mode: bool = False

    @property
    def ai_enabled(self) -> bool:
        """True when a real AI key is present and demo mode is off."""
        return bool(self.gemini_api_key) and not self.demo_mode

    # ── Supabase ─────────────────────────────────────────────────────────
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""

    @property
    def supabase_configured(self) -> bool:
        return bool(self.supabase_url and self.supabase_service_role_key)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()


settings = get_settings()
