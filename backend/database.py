import os
from contextlib import contextmanager
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from backend.models import Base

SessionLocal = None


def _migrate_legacy_sqlite_schema(engine):
    if not str(engine.url).startswith("sqlite"):
        return

    with engine.begin() as conn:
        table_exists = conn.execute(
            text("SELECT 1 FROM sqlite_master WHERE type='table' AND name='users'")
        ).fetchone()
        if not table_exists:
            return

        columns = conn.execute(text("PRAGMA table_info(users)")).fetchall()
        existing = {row[1] for row in columns}
        required = {
            "email", "full_name", "avatar_url", "provider", "provider_id",
            "password_hash", "onboarding_completed", "subscription_tier",
            "last_login", "created_at", "updated_at", "headline", "location",
            "bio", "experience", "website", "linkedin_url", "github_url"
        }
        for column_name in sorted(required - existing):
            column_type = "VARCHAR(512)"
            if column_name in {"bio", "website", "linkedin_url", "github_url"}:
                column_type = "TEXT"
            elif column_name in {"onboarding_completed"}:
                column_type = "BOOLEAN"
            elif column_name in {"last_login", "created_at", "updated_at"}:
                column_type = "DATETIME"
            elif column_name in {"email"}:
                column_type = "VARCHAR(256)"
            conn.execute(text(f"ALTER TABLE users ADD COLUMN {column_name} {column_type}"))


def init_db(database_url: str):
    global SessionLocal
    connect_args = {}
    if database_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}

    engine = create_engine(database_url, connect_args=connect_args, future=True)
    Base.metadata.create_all(bind=engine)
    _migrate_legacy_sqlite_schema(engine)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
    return engine

@contextmanager
def session_scope():
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
