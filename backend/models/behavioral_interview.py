from typing import List, Literal, Optional

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


class StarDimensionFeedback(BaseModel):
  status: Literal["strong", "okay", "light", "missing"]
  note: str


class StarFeedback(BaseModel):
  situation: StarDimensionFeedback
  task: StarDimensionFeedback
  action: StarDimensionFeedback
  result: StarDimensionFeedback


class BehavioralFeedback(BaseModel):
  summary: str
  star: StarFeedback
  strengths: List[str] = Field(default_factory=list)
  improvements: List[str] = Field(default_factory=list)
  next_practice: Optional[str] = Field(default=None, description="One quick drill or reminder")
  score: int = Field(default=0, ge=0, le=10)


class BehavioralAssistantTurnRequest(BaseModel):
  job_description: str = Field(..., min_length=30, max_length=8000)
  role: str = Field(..., min_length=2, max_length=120)
  seniority: Optional[str] = Field(default=None, max_length=80)
  focus_areas: List[str] = Field(default_factory=list, max_length=12)
  target_questions: int = Field(default=4, ge=1, le=8)
  answer: Optional[str] = Field(default=None, max_length=3500)
  previous_questions: List[str] = Field(default_factory=list, max_length=12)


class BehavioralAssistantTurnResponse(BaseModel):
  question: str
  follow_up: str
  question_index: int
  total_questions: int
  feedback: Optional[BehavioralFeedback] = None


class TranscriptionResponse(BaseModel):
  text: str
