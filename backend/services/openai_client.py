from openai import OpenAI
import os
import json
import re
from models.project_coach import ProjectCoachRequest, ProjectCoachResponse
from models.project_helper import ProjectHelperResponse
from models.behavioral_interview import BehavioralInterviewResponse
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

def generate_project_helper(job_description: str, role: str) -> ProjectHelperResponse: # make prompt better down the line possibly try out dspy
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

def generate_behavioral_questions(
    job_description: str,
    role: str,
    seniority: str | None = None,
    focus_areas: list[str] | None = None,
    num_questions: int = 5,
) -> BehavioralInterviewResponse:
    focus_text = ", ".join(focus_areas) if focus_areas else "leadership, collaboration, ownership, adaptability"
    seniority_text = f"{seniority} " if seniority else ""
    prompt = f"""
You are a behavioral interview coach designing targeted prompts for a candidate interviewing for a {seniority_text}{role}.

Job description:
---
{job_description}
---

Create {num_questions} behavioral interview questions tightly aligned to the responsibilities, culture, and focus areas: {focus_text}.
Return ONLY valid JSON with this shape:
{{
  "role": "{role}",
  "seniority": "{seniority or ''}",
  "questions": [
    {{
      "question": "Write the question",
      "why_it_matters": "Tie back to the JD's expectations",
      "coaching_points": ["Tip 1", "Tip 2"],
      "signals": ["Impact area", "Soft skill"]
    }}
  ]
}}
Ensure `questions` has exactly {num_questions} entries.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.65,
    )

    content = response.choices[0].message.content.strip()
    data = extract_json(content)
    return BehavioralInterviewResponse(**data)


def _render_stack(tech_stack: list[str]) -> str:
    cleaned = [item.strip() for item in tech_stack if item and item.strip()]
    return ", ".join(cleaned) if cleaned else "Not provided"


def _build_project_coach_messages(payload: ProjectCoachRequest, user_id: str):
    stack_text = _render_stack(payload.tech_stack)
    stage_text = payload.stage.strip() if payload.stage else "Not provided"
    project_context = f"""Project context for coaching:
Title: {payload.project_title}
Goal: {payload.project_summary}
Stack: {stack_text}
Current stage: {stage_text}
User id (for personalization only): {user_id}
Coaching intent: teach the user how to build this project without handing over full solutions.
"""

    history = payload.history[-8:]  # keep history short for the model
    messages = [
        {
            "role": "system",
            "content": (
                "You are a project mentor who teaches through scaffolding and questions. "
                "Keep answers concise (under 220 words), avoid writing full code, and focus on outlining approaches, "
                "trade-offs, checkpoints, and what to try next. "
                "Prefer hints and partial examples over final answers. Always end with a short question to confirm understanding. "
                "Respond only in valid JSON with this shape: "
                '{"message": "...", "next_steps": ["..."], "questions": ["..."]}. '
                "Ensure `next_steps` are small, sequential actions the user can attempt next, and `questions` are reflective prompts."
            ),
        },
        {"role": "user", "content": project_context},
    ]
    for turn in history:
        role = "assistant" if turn.role == "assistant" else "user"
        messages.append({"role": role, "content": turn.content})
    messages.append({"role": "user", "content": payload.user_message})
    return messages


def generate_project_coach_response(payload: ProjectCoachRequest, user_id: str) -> ProjectCoachResponse:
    messages = _build_project_coach_messages(payload, user_id)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.55,
    )
    content = response.choices[0].message.content.strip()
    data = extract_json(content)
    return ProjectCoachResponse(**data)
