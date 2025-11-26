from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from models.behavioral_interview import (
  BehavioralAssistantTurnRequest,
  BehavioralAssistantTurnResponse,
  BehavioralInterviewRequest,
  BehavioralInterviewResponse,
  TranscriptionResponse,
)
from routes.dependencies import require_entitlement
from services.openai_client import generate_behavioral_questions, generate_behavioral_turn, transcribe_audio

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


@router.post("/assistant/turn", response_model=BehavioralAssistantTurnResponse, status_code=status.HTTP_200_OK)
async def run_behavioral_assistant_turn(
  payload: BehavioralAssistantTurnRequest,
  _entitlement=Depends(require_entitlement),
):
  try:
    return generate_behavioral_turn(payload)
  except ValueError as exc:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
  except Exception as exc:
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Unable to run behavioral assistant turn",
    ) from exc


@router.post("/assistant/transcribe", response_model=TranscriptionResponse, status_code=status.HTTP_200_OK)
async def transcribe_behavioral_audio(
  file: UploadFile = File(...),
  _entitlement=Depends(require_entitlement),
):
  try:
    file_bytes = await file.read()
    text = transcribe_audio(file_bytes, filename=file.filename)
    return TranscriptionResponse(text=text)
  except ValueError as exc:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
  except Exception as exc:
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Unable to transcribe audio",
    ) from exc
