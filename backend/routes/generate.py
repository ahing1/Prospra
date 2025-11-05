from fastapi import APIRouter

router = APIRouter()

@router.post("/generate/behavioral")
async def behavioral():
    return {"questions": ["Tell me about a challenge you faced...", "How do you handle conflict?"]}
