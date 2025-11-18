from typing import List, Optional

from pydantic import BaseModel, Field


class BehavioralQuestion(BaseModel):
  question: str
  why_it_matters: str
  coaching_points: List[str] = Field(default_factory=list)
  signals: List[str] = Field(default_factory=list)


class BehavioralInterviewRequest(BaseModel):
  job_description: str = Field(..., min_length=30, description="Full job description or summary for tailoring prompts")
  role: str = Field(..., description="Primary role or title (e.g., Senior Software Engineer)")
  seniority: Optional[str] = Field(default=None, description="Optional seniority signal such as Mid, Senior, or Lead")
  focus_areas: List[str] = Field(
    default_factory=list,
    description="Optional emphasis areas (e.g., leadership, cross-functional alignment)",
  )
  num_questions: int = Field(default=5, ge=1, le=10, description="Number of behavioral questions to generate")


class BehavioralInterviewResponse(BaseModel):
  role: str
  seniority: Optional[str]
  questions: List[BehavioralQuestion]
