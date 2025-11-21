from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_db

router = APIRouter(tags=["health"])


@router.get("/healthz")
async def health_check(db: AsyncSession = Depends(get_db)):
  await db.execute(text("SELECT 1"))
  return {"status": "ok"}
