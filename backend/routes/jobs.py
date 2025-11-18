from enum import Enum
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query

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


EMPLOYMENT_TYPE_TO_SERP = {
  EmploymentFilter.full_time: "FULLTIME",
  EmploymentFilter.internship: "INTERN",
}


@router.get("/search", response_model=JobSearchResponse)
async def search_jobs(
  q: str = Query("software engineer", description="Job keywords to search"),
  location: str = Query("Remote", description="Location to anchor the search"),
  page: int = Query(1, ge=1, description="Pagination index (1-based)"),
  employment_type: Optional[EmploymentFilter] = Query(
    None, description="Filter by employment type (full_time, internship)"
  ),
  roles: Optional[List[str]] = Query(
    None,
    description="Optional role keywords. Provide multiple 'roles' parameters to OR filter (e.g., roles=frontend&roles=backend)",
  ),
):
  try:
    normalized_roles = [role.strip() for role in (roles or []) if role and role.strip()]
    serp_employment = EMPLOYMENT_TYPE_TO_SERP.get(employment_type) if employment_type else None

    jobs = await fetch_jobs_from_serpapi(
      q,
      location,
      page,
      employment_type=serp_employment,
      role_keywords=normalized_roles or None,
    )
    return JobSearchResponse(
      query=q,
      location=location,
      page=page,
      employment_type=employment_type.value if employment_type else None,
      role_filters=normalized_roles,
      jobs=jobs,
    )
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
