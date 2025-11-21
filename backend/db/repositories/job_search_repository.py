from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models.job_search import JobSearch

DEFAULT_CACHE_TTL_SECONDS = 3600


def _normalized_roles(roles: Optional[list[str]]) -> list[str]:
  return sorted({role.strip() for role in (roles or []) if role and role.strip()})


async def get_cached_search(
  session: AsyncSession,
  *,
  query: str,
  location: str,
  page: int,
  employment_type: Optional[str],
  roles: Optional[list[str]],
  cache_ttl_seconds: int = DEFAULT_CACHE_TTL_SECONDS,
) -> Optional[dict[str, Any]]:
  """Return cached payload if not older than cache_ttl_seconds."""
  normalized_roles = _normalized_roles(roles)
  cutoff = datetime.now(timezone.utc) - timedelta(seconds=cache_ttl_seconds)

  stmt: Select[JobSearch] = (
    select(JobSearch)
    .where(
      JobSearch.query == query,
      JobSearch.location == location,
      JobSearch.page == page,
      JobSearch.employment_type == employment_type,
      JobSearch.role_filters == normalized_roles,
      JobSearch.created_at >= cutoff,
    )
    .order_by(JobSearch.created_at.desc())
    .limit(1)
  )
  result = await session.execute(stmt)
  record = result.scalar_one_or_none()
  return None if record is None else record.response_payload


async def cache_job_search_result(
  session: AsyncSession,
  *,
  query: str,
  location: str,
  page: int,
  employment_type: Optional[str],
  roles: Optional[list[str]],
  payload: dict[str, Any],
) -> None:
  """Persist a job search payload for future reuse."""
  normalized_roles = _normalized_roles(roles)
  record = JobSearch(
    query=query,
    location=location,
    page=page,
    employment_type=employment_type,
    role_filters=normalized_roles,
    response_payload=payload,
  )
  session.add(record)
  await session.commit()
