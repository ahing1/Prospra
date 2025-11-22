from enum import Enum
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_db
from db.repositories.job_search_repository import cache_job_search_result, get_cached_search
from models.jobs import JobDetailResponse, JobSearchResponse
from services.serpapi_client import (
  SerpAPIError,
  fetch_job_detail_from_serpapi,
  fetch_jobs_from_serpapi,
)

router = APIRouter(prefix="/jobs", tags=["jobs"])


class EmploymentFilter(str, Enum):
  full_time = "full_time"
  internship = "internship"


class SeniorityFilter(str, Enum):
  entry = "entry"
  mid = "mid"
  senior = "senior"
  lead = "lead"


EMPLOYMENT_TYPE_TO_SERP = {
  EmploymentFilter.full_time: "FULLTIME",
  EmploymentFilter.internship: "INTERN",
}

SENIORITY_TO_KEYWORD = {
  SeniorityFilter.entry: "entry level",
  SeniorityFilter.mid: "mid level",
  SeniorityFilter.senior: "senior level",
  SeniorityFilter.lead: "lead engineer",
}


@router.get("/search", response_model=JobSearchResponse)
async def search_jobs(
  q: str = Query("", description="Job keywords to search"),
  location: str = Query("", description="Location to anchor the search"),
  page: int = Query(1, ge=1, description="Pagination index (1-based)"),
  employment_type: Optional[EmploymentFilter] = Query(
    None, description="Filter by employment type (full_time, internship)"
  ),
  roles: Optional[List[str]] = Query(
    None,
    description="Optional role keywords. Provide multiple 'roles' parameters to OR filter (e.g., roles=frontend&roles=backend)",
  ),
  seniority: Optional[List[SeniorityFilter]] = Query(
    None,
    description="Optional seniority filters such as entry, mid, senior, lead.",
  ),
  db: AsyncSession = Depends(get_db),
):
  try:
    normalized_roles = [role.strip() for role in (roles or []) if role and role.strip()]
    normalized_seniority = [choice.value for choice in (seniority or [])]
    serp_employment = EMPLOYMENT_TYPE_TO_SERP.get(employment_type) if employment_type else None
    seniority_keywords = [SENIORITY_TO_KEYWORD[choice] for choice in (seniority or []) if choice in SENIORITY_TO_KEYWORD]

    if not q.strip():
      raise HTTPException(status_code=400, detail="Query must be provided to search jobs.")

    location_value = location.strip() or "United States"

    cached_payload = await get_cached_search(
      db,
      query=q,
      location=location_value,
      page=page,
      employment_type=employment_type.value if employment_type else None,
      roles=normalized_roles or None,
      seniority_filters=normalized_seniority or None,
    )
    if cached_payload:
      return JobSearchResponse(**cached_payload)

    jobs = await fetch_jobs_from_serpapi(
      q,
      location_value,
      page,
      employment_type=serp_employment,
      role_keywords=normalized_roles or None,
      seniority_keywords=seniority_keywords or None,
    )
    response = JobSearchResponse(
      query=q,
      location=location_value,
      page=page,
      employment_type=employment_type.value if employment_type else None,
      role_filters=normalized_roles,
      seniority_filters=normalized_seniority,
      jobs=jobs,
    )
    await cache_job_search_result(
      db,
      query=q,
      location=location_value,
      page=page,
      employment_type=employment_type.value if employment_type else None,
      roles=normalized_roles or None,
      seniority_filters=normalized_seniority or None,
      payload=response.model_dump(),
    )
    return response
  except SerpAPIError as exc:
    raise HTTPException(status_code=502, detail=f"SerpAPI error: {exc}") from exc
  except ValueError as exc:
    raise HTTPException(status_code=400, detail=str(exc)) from exc
  except Exception as exc:
    raise HTTPException(status_code=500, detail="Unable to retrieve jobs") from exc


@router.get("/detail/{job_id}", response_model=JobDetailResponse)
async def job_detail(job_id: str):
  try:
    job = await fetch_job_detail_from_serpapi(job_id)
  except SerpAPIError as exc:
    raise HTTPException(status_code=502, detail=f"SerpAPI error: {exc}") from exc
  except ValueError as exc:
    raise HTTPException(status_code=400, detail=str(exc)) from exc
  except Exception as exc:
    raise HTTPException(status_code=500, detail="Unable to retrieve job detail") from exc

  if not job:
    raise HTTPException(status_code=404, detail="Job not found")

  return JobDetailResponse(job=job)
