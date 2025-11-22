import base64
import json
import os
from typing import Any, Dict, List, Optional

import httpx
from dotenv import load_dotenv

from models.jobs import JobApplyOption, JobHighlight, JobListing

load_dotenv()

SERP_API_KEY = os.getenv("SERPAPI_API_KEY")
SERP_API_URL = "https://serpapi.com/search.json"

JOB_CACHE: Dict[str, JobListing] = {}
HTID_CACHE: Dict[str, JobListing] = {}


class SerpAPIError(Exception):
  """Raised when SerpAPI returns an error payload."""


def _ensure_api_key() -> None:
  if not SERP_API_KEY:
    raise ValueError("SERPAPI_API_KEY is not configured")


def _decode_job_payload(job_id: Optional[str]) -> Optional[Dict[str, Any]]:
  if not job_id:
    return None
  try:
    decoded = base64.b64decode(job_id).decode()
    return json.loads(decoded)
  except Exception:
    return None


def _decode_htidocid(job_id: Optional[str]) -> Optional[str]:
  payload = _decode_job_payload(job_id)
  return payload.get("htidocid") if payload else None


def _cache_job(job: JobListing) -> None:
  if job.job_id:
    JOB_CACHE[job.job_id] = job
  if job.htidocid:
    HTID_CACHE[job.htidocid] = job


def _map_job(job: dict) -> JobListing:
  detected_extensions = job.get("detected_extensions") or {}
  apply_options_raw = job.get("apply_options") or []
  highlights_raw = job.get("job_highlights") or []

  apply_options = [
    JobApplyOption(title=option.get("title"), link=option.get("link"))
    for option in apply_options_raw
    if option.get("link")
  ]

  highlights = [
    JobHighlight(title=highlight.get("title"), items=highlight.get("items") or [])
    for highlight in highlights_raw
  ]

  job_id = job.get("job_id")

  mapped_job = JobListing(
    job_id=job_id,
    htidocid=_decode_htidocid(job_id) or job.get("htidocid"),
    title=job.get("title") or job.get("job_title"),
    company=job.get("company_name"),
    location=job.get("location"),
    via=job.get("via"),
    description=job.get("description") or job.get("description_full"),
    posted_at=detected_extensions.get("posted_at"),
    salary=detected_extensions.get("salary"),
    extensions=job.get("extensions") or [],
    detected_extensions=detected_extensions,
    apply_options=apply_options,
    job_highlights=highlights,
    share_link=job.get("share_link"),
  )

  _cache_job(mapped_job)
  return mapped_job


async def _serp_api_request(params: dict) -> dict:
  async with httpx.AsyncClient(timeout=15) as client:
    try:
      response = await client.get(SERP_API_URL, params=params)
      response.raise_for_status()
    except httpx.HTTPStatusError as exc:
      raise SerpAPIError(exc.response.text) from exc
    data = response.json()

  if "error" in data:
    raise SerpAPIError(data["error"])
  return data


async def fetch_jobs_from_serpapi(
  query: str,
  location: str,
  page: int,
  uule: Optional[str] = None,
  use_uule: bool = True,
  *,
  employment_type: Optional[str] = None,
  role_keywords: Optional[List[str]] = None,
  seniority_keywords: Optional[List[str]] = None,
) -> List[JobListing]:
  _ensure_api_key()
  normalized_location = location.strip()
  if normalized_location.lower() in {"remote", "remote (us)", "remote (usa)"}:
    normalized_location = "United States"

  current_page = 1
  next_page_token: Optional[str] = None
  data: Optional[dict] = None

  sanitized_roles = [role.strip() for role in (role_keywords or []) if role and role.strip()]
  sanitized_seniority = [level.strip() for level in (seniority_keywords or []) if level and level.strip()]
  modifier_keywords = [*sanitized_roles, *sanitized_seniority]
  combined_query = " ".join([query, *modifier_keywords]).strip() if modifier_keywords else query

  while current_page <= page:
    params = {
      "engine": "google_jobs",
      "q": combined_query,
      "api_key": SERP_API_KEY,
    }
    if use_uule and uule:
      params["uule"] = uule
    elif normalized_location:
      params["location"] = normalized_location
    if employment_type:
      params["employment_type"] = employment_type

    if next_page_token:
      params["next_page_token"] = next_page_token

    data = await _serp_api_request(params)

    if current_page == page:
      break

    pagination = data.get("serpapi_pagination") or {}
    next_page_token = pagination.get("next_page_token")
    if not next_page_token:
      # No further pages available; return empty list if desired page not reached
      if current_page < page:
        return []
      break
    current_page += 1

  jobs_raw = data.get("jobs_results", []) if data else []
  mapped = [_map_job(job) for job in jobs_raw]
  return mapped


async def fetch_job_detail_from_serpapi(job_id: str) -> Optional[JobListing]:
  _ensure_api_key()
  if job_id in JOB_CACHE:
    return JOB_CACHE[job_id]
  if job_id in HTID_CACHE:
    return HTID_CACHE[job_id]

  payload = _decode_job_payload(job_id)
  htidocid = payload.get("htidocid") if payload else None
  title = payload.get("job_title") if payload else None
  company = payload.get("company_name") if payload else None
  location = payload.get("address_city") if payload else None
  encoded_uule = payload.get("uule") if payload else None

  search_query_parts = [part for part in [title, company] if part]
  search_query = " ".join(search_query_parts) or title or company or "software engineer"
  location = location or "United States"

  async def _fetch_jobs_with_fallback(query: str, loc: str, use_uule_flag: bool = True) -> List[JobListing]:
    try:
      return await fetch_jobs_from_serpapi(query, loc, 1, encoded_uule, use_uule=use_uule_flag)
    except SerpAPIError as exc:
      if loc.strip().lower() != "united states":
        return await fetch_jobs_from_serpapi(query, "United States", 1, uule=None, use_uule=False)
      raise exc

  # First attempt: query directly by htidocid if available
  if htidocid:
    try:
      targeted_jobs = await _fetch_jobs_with_fallback(f"htidocid:{htidocid}", "United States")
      for job in targeted_jobs:
        if job.job_id == job_id or job.htidocid == htidocid:
          return job
    except SerpAPIError:
      pass

  jobs = await _fetch_jobs_with_fallback(search_query, location)
  if not jobs:
    return None

  for job in jobs:
    if job.job_id == job_id or (htidocid and job.htidocid == htidocid):
      return job

  # fallback: return first job if we can't match
  return jobs[0]
