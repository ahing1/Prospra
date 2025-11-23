from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_db
from db.repositories.saved_job_repository import (
  delete_saved_job,
  get_saved_job,
  list_saved_jobs_for_user,
  upsert_saved_job,
)
from models.jobs import JobListing
from models.saved_job import SaveJobRequest, SavedJobItem, SavedJobsResponse
from routes.dependencies import require_user_id

router = APIRouter(prefix="/jobs/saved", tags=["jobs", "saved"])


def _to_item(record) -> SavedJobItem:
  job_payload = record.job_data or {}
  if "job_id" not in job_payload and record.job_id:
    job_payload["job_id"] = record.job_id
  return SavedJobItem(
    job_id=record.job_id,
    saved_at=record.created_at,
    job=JobListing(**job_payload),
  )


@router.get("", response_model=SavedJobsResponse)
async def list_saved_jobs(
  user_id: str = Depends(require_user_id),
  db: AsyncSession = Depends(get_db),
):
  records = await list_saved_jobs_for_user(db, user_id)
  return SavedJobsResponse(jobs=[_to_item(record) for record in records])


@router.get("/{job_id}", response_model=SavedJobItem)
async def retrieve_saved_job(
  job_id: str,
  user_id: str = Depends(require_user_id),
  db: AsyncSession = Depends(get_db),
):
  record = await get_saved_job(db, user_id, job_id)
  if not record:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved job not found")
  return _to_item(record)


@router.post("", response_model=SavedJobItem, status_code=status.HTTP_201_CREATED)
async def save_job(
  payload: SaveJobRequest,
  user_id: str = Depends(require_user_id),
  db: AsyncSession = Depends(get_db),
):
  job_listing = payload.job
  job_id = job_listing.job_id
  if not job_id:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="job_id is required to save a job")

  record = await upsert_saved_job(
    db,
    user_id=user_id,
    job_id=job_id,
    payload=job_listing.model_dump(),
  )
  return _to_item(record)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_saved_job(
  job_id: str,
  user_id: str = Depends(require_user_id),
  db: AsyncSession = Depends(get_db),
):
  deleted = await delete_saved_job(db, user_id, job_id)
  if not deleted:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved job not found")
