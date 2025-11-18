from fastapi import APIRouter, HTTPException

from models.behavioral_interview import BehavioralInterviewRequest, BehavioralInterviewResponse
from services.openai_client import generate_behavioral_questions

router = APIRouter(prefix="/behavioral", tags=["behavioral"])


@router.post("/generate", response_model=BehavioralInterviewResponse)
async def generate_behavioral_interview_content(payload: BehavioralInterviewRequest):
  try:
    return generate_behavioral_questions(
      job_description=payload.job_description,
      role=payload.role,
      seniority=payload.seniority,
      focus_areas=payload.focus_areas,
      num_questions=payload.num_questions,
    )
  except ValueError as exc:
    raise HTTPException(status_code=400, detail=str(exc)) from exc
  except Exception as exc:
    raise HTTPException(status_code=500, detail="Unable to generate behavioral questions") from exc
