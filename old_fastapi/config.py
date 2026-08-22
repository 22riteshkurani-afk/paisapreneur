"""Centralized configuration via environment variables."""

import os
from dotenv import load_dotenv

# Explicitly load .env file from project root
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"), override=True)


class Settings:
    """Application settings loaded from environment variables."""

    # Check for all common Google/Gemini environment variable names
    GOOGLE_API_KEY: str = (
        os.getenv("GOOGLE_API_KEY")
        or os.getenv("GEMINI_API_KEY")
        or os.getenv("GOOGLE_GENERATIVE_AI_API_KEY")
        or ""
    ).strip()

    ALLOWED_ORIGINS: list[str] = os.getenv("ALLOWED_ORIGINS", "*").split(",")
    CACHE_TTL_SECONDS: int = int(os.getenv("CACHE_TTL_SECONDS", "300"))
    RATE_LIMIT_MAX_REQUESTS: int = int(os.getenv("RATE_LIMIT_MAX_REQUESTS", "10"))
    RATE_LIMIT_WINDOW_SECONDS: int = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60"))
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash").strip()
    
    CASHFREE_APP_ID: str = os.getenv("CASHFREE_APP_ID", "").strip()
    CASHFREE_SECRET_KEY: str = os.getenv("CASHFREE_SECRET_KEY", "").strip()
    CASHFREE_ENV: str = os.getenv("CASHFREE_ENV", "SANDBOX").strip()
    SECRET_KEY: str = os.getenv("SECRET_KEY", "paisapreneur_secret_2026").strip()


settings = Settings()
