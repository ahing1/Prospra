#!/bin/bash
set -euo pipefail

echo "Waiting for database..."
until python - <<'PY'
import asyncio
from sqlalchemy import text
from db.database import engine

async def check():
    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1"))

asyncio.run(check())
PY
do
  echo "Database not ready, retrying in 3 seconds..."
  sleep 3
done

echo "Running migrations..."
alembic upgrade head

echo "Starting uvicorn..."
exec uvicorn main:app --host 0.0.0.0 --port 8000
