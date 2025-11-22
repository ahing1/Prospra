import os
from typing import AsyncGenerator
from urllib.parse import quote_plus

from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

load_dotenv()

def _get_int(name: str, default: int) -> int:
  try:
    return int(os.getenv(name, str(default)))
  except (TypeError, ValueError):
    return default


DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
  db_user = os.getenv("POSTGRESQL_USER", "postgres")
  db_password = os.getenv("POSTGRESQL_PASSWORD", "password")
  db_host = os.getenv("POSTGRESQL_HOST", "localhost")
  db_port = os.getenv("POSTGRESQL_PORT", "5432")
  db_name = os.getenv("POSTGRESQL_DBNAME", "Prospra")
  password_section = f":{quote_plus(db_password)}" if db_password else ""
  DATABASE_URL = f"postgresql+asyncpg://{db_user}{password_section}@{db_host}:{db_port}/{db_name}"

POOL_SIZE = _get_int("DB_POOL_SIZE", 5)
MAX_OVERFLOW = _get_int("DB_MAX_OVERFLOW", 10)

engine: AsyncEngine = create_async_engine(
  DATABASE_URL,
  pool_size=POOL_SIZE,
  max_overflow=MAX_OVERFLOW,
  pool_pre_ping=True,
)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def init_db() -> None:
  """Verify database connectivity during application startup."""
  async with engine.connect() as conn:
    await conn.execute(text("SELECT 1"))


async def dispose_db() -> None:
  """Close the connection pool gracefully on shutdown."""
  await engine.dispose()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
  """FastAPI dependency that yields an async SQLAlchemy session."""
  async with SessionLocal() as session:
    yield session
