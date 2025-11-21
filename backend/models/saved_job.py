from __future__ import annotations

from datetime import datetime
from typing import List

from pydantic import BaseModel, Field

from models.jobs import JobListing


class SaveJobRequest(BaseModel):
  job: JobListing = Field(..., description="Full job listing payload to persist")


class SavedJobItem(BaseModel):
  job_id: str
  saved_at: datetime
  job: JobListing


class SavedJobsResponse(BaseModel):
  jobs: List[SavedJobItem]
