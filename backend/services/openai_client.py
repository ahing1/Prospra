from openai import OpenAI
import os
import json
import re
from models.project_helper import ProjectHelperResponse
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def extract_json(text: str) -> dict:
    """Extract JSON object from model output even if wrapped in text/code fences."""
    try:
        # Try normal load first
        return json.loads(text)
    except json.JSONDecodeError:
        # Attempt to find JSON inside Markdown or text
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            json_str = match.group(0)
            try:
                return json.loads(json_str)
            except json.JSONDecodeError:
                pass
        raise ValueError("Model response could not be parsed as JSON.")

def generate_project_helper(job_description: str, role: str) -> ProjectHelperResponse:
    prompt = f"""
You are a senior software architect mentoring someone applying for the following role: {role}.

Based on this job description:
---
{job_description}
---

Suggest a personalized software project that the candidate can build to improve their chances. 
Return ONLY a valid JSON object with this structure:
{{
  "title": "...",
  "summary": "...",
  "tech_stack": ["Tech1", "Tech2", ...],
  "implementation_steps": ["Step 1", "Step 2", ...]
}}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )

    content = response.choices[0].message.content.strip()
    data = extract_json(content)
    return ProjectHelperResponse(**data)
