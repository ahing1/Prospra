from __future__ import annotations

from typing import Optional

from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models.saved_job import SavedJob


async def list_saved_jobs_for_user(session: AsyncSession, user_id: str) -> list[SavedJob]:
  stmt: Select[SavedJob] = (
    select(SavedJob)
    .where(SavedJob.user_id == user_id)
    .order_by(SavedJob.created_at.desc())
  )
  result = await session.execute(stmt)
  return list(result.scalars().all())


async def get_saved_job(session: AsyncSession, user_id: str, job_id: str) -> Optional[SavedJob]:
  stmt: Select[SavedJob] = (
    select(SavedJob)
    .where(SavedJob.user_id == user_id, SavedJob.job_id == job_id)
    .limit(1)
  )
  result = await session.execute(stmt)
  return result.scalar_one_or_none()


async def upsert_saved_job(session: AsyncSession, user_id: str, job_id: str, payload: dict) -> SavedJob:
  record = await get_saved_job(session, user_id, job_id)
  if record:
    record.job_data = payload
  else:
    record = SavedJob(user_id=user_id, job_id=job_id, job_data=payload)
  session.add(record)
  await session.commit()
  await session.refresh(record)
  return record


async def delete_saved_job(session: AsyncSession, user_id: str, job_id: str) -> bool:
  record = await get_saved_job(session, user_id, job_id)
  if not record:
    return False
  await session.delete(record)
  await session.commit()
  return True
