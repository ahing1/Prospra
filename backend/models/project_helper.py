from pydantic import BaseModel
from typing import List

class ProjectHelperRequest(BaseModel):
    job_description: str
    role: str

class ProjectHelperResponse(BaseModel):
    title: str
    summary: str
    tech_stack: List[str]
    implementation_steps: List[str]
