from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class JobApplyOption(BaseModel):
  title: Optional[str]
  link: Optional[str]


class JobHighlight(BaseModel):
  title: Optional[str]
  items: List[str] = Field(default_factory=list)


class JobListing(BaseModel):
  job_id: Optional[str] = None
  htidocid: Optional[str] = None
  title: Optional[str] = None
  company: Optional[str] = None
  location: Optional[str] = None
  via: Optional[str] = None
  description: Optional[str] = None
  posted_at: Optional[str] = None
  salary: Optional[str] = None
  extensions: List[str] = Field(default_factory=list)
  detected_extensions: Dict[str, Any] = Field(default_factory=dict)
  apply_options: List[JobApplyOption] = Field(default_factory=list)
  job_highlights: List[JobHighlight] = Field(default_factory=list)
  share_link: Optional[str] = None


class JobSearchResponse(BaseModel):
  query: str
  location: str
  page: int
  employment_type: Optional[str] = None
  role_filters: List[str] = Field(default_factory=list)
  jobs: List[JobListing]


class JobDetailResponse(BaseModel):
  job: JobListing
