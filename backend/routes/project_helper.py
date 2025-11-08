from fastapi import APIRouter, HTTPException
from models.project_helper import ProjectHelperRequest, ProjectHelperResponse
from services.openai_client import generate_project_helper

router = APIRouter()

@router.post("/generate/project-helper", response_model=ProjectHelperResponse)
async def project_helper(request: ProjectHelperRequest):
    try:
        result = generate_project_helper(request.job_description, request.role)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
