from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class JobApplyOption(BaseModel):
  title: Optional[str]
  link: Optional[str]


class JobHighlight(BaseModel):
  title: Optional[str]
  items: List[str] = Field(default_factory=list)


class JobListing(BaseModel):
  job_id: Optional[str]
  htidocid: Optional[str]
  title: Optional[str]
  company: Optional[str]
  location: Optional[str]
  via: Optional[str]
  description: Optional[str]
  posted_at: Optional[str]
  salary: Optional[str]
  extensions: List[str] = Field(default_factory=list)
  detected_extensions: Dict[str, Any] = Field(default_factory=dict)
  apply_options: List[JobApplyOption] = Field(default_factory=list)
  job_highlights: List[JobHighlight] = Field(default_factory=list)
  share_link: Optional[str]


class JobSearchResponse(BaseModel):
  query: str
  location: str
  page: int
  jobs: List[JobListing]


class JobDetailResponse(BaseModel):
  job: JobListing
