from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class CoachMessage(BaseModel):
  role: Literal["user", "assistant"]
  content: str = Field(..., min_length=1, max_length=2000)


class ProjectCoachRequest(BaseModel):
  project_title: str = Field(..., min_length=3, max_length=120)
  project_summary: str = Field(..., min_length=8, max_length=2000)
  tech_stack: List[str] = Field(default_factory=list)
  stage: Optional[str] = Field(default=None, max_length=160)
  user_message: str = Field(..., min_length=4, max_length=2000)
  history: List[CoachMessage] = Field(default_factory=list)


class ProjectCoachResponse(BaseModel):
  message: str
  next_steps: List[str] = Field(default_factory=list)
  questions: List[str] = Field(default_factory=list)
