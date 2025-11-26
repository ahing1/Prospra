from fastapi import APIRouter, Depends, HTTPException, status

from models.project_coach import ProjectCoachRequest, ProjectCoachResponse
from routes.dependencies import require_entitlement, require_user_id
from services.openai_client import generate_project_coach_response

router = APIRouter(prefix="/pro", tags=["pro"])


@router.post("/project-coach", response_model=ProjectCoachResponse)
async def project_coach(
  payload: ProjectCoachRequest,
  user_id: str = Depends(require_user_id),
  _entitlement=Depends(require_entitlement),
):
  try:
    return generate_project_coach_response(payload, user_id=user_id)
  except ValueError as exc:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
  except Exception as exc:
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Unable to generate coaching response",
    ) from exc
