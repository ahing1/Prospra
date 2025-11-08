from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import List

router = APIRouter()

class JobRequest(BaseModel):
    job_description: str
    role: str

@router.post("/generate/behavioral")
async def generate_behavioral_questions(payload: JobRequest):
    # Temporary: static questions
    return {
        "questions": [
            "Tell me about a time you overcame a challenge in a team.",
            "Describe a situation where you had to learn something quickly.",
            "How do you handle disagreement with a manager or peer?",
        ]
    }
