import json
import re
import os
from io import BytesIO

from dotenv import load_dotenv
from openai import OpenAI

from models.project_coach import ProjectCoachRequest, ProjectCoachResponse
from models.project_helper import ProjectHelperResponse
from models.behavioral_interview import (
    BehavioralAssistantTurnRequest,
    BehavioralAssistantTurnResponse,
    BehavioralFeedback,
    BehavioralInterviewResponse,
)

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


def generate_behavioral_turn(payload: BehavioralAssistantTurnRequest) -> BehavioralAssistantTurnResponse:
    if payload.target_questions < 1:
        raise ValueError("target_questions must be at least 1.")

    focus_text = ", ".join(payload.focus_areas) if payload.focus_areas else "leadership, collaboration, ownership"
    seniority_text = f"{payload.seniority} " if payload.seniority else ""
    prior_questions = [q.strip() for q in payload.previous_questions if q and q.strip()]
    question_index = min(payload.target_questions, len(prior_questions) + 1)

    answer_text = payload.answer.strip() if payload.answer else ""
    answer_block = (
        answer_text if answer_text else "No answer provided yet; begin the session with a tailored first question."
    )
    asked_block = "\n".join(f"- {question}" for question in prior_questions) if prior_questions else "None yet"

    prompt = f"""
You are a friendly behavioral interviewer for a {seniority_text}{payload.role}.
Mirror a real onsite: ask one sharp question at a time, add a brief follow-up, and score the candidate's STAR completeness when an answer is provided.
Keep tone supportive, concise, and anchored to the job description and focus areas.

Job description:
---
{payload.job_description}
---

Focus areas to emphasize: {focus_text}
Already asked: 
{asked_block}

Candidate answer to the most recent question (if any):
{answer_block}

Rules:
- Craft the next behavioral-style prompt tied to the responsibilities and culture.
- Add one natural follow-up probe that a friendly interviewer would ask.
- If the candidate answer is present, assess STAR coverage and suggest crisp, actionable improvements.
- Avoid repeating any question from the list of already asked prompts.
- Keep every string under 320 characters to reduce rambling.

Respond ONLY in valid JSON with this shape:
{{
  "question": "Next question to ask",
  "follow_up": "One short probe to dig deeper",
  "feedback": null | {{
    "summary": "One-paragraph recap aligned to the JD and focus areas",
    "score": 0-10,
    "star": {{
      "situation": {{"status": "strong|okay|light|missing", "note": "What was/wasn't clear"}},
      "task": {{"status": "strong|okay|light|missing", "note": "Ownership clarity"}},
      "action": {{"status": "strong|okay|light|missing", "note": "Actions and decisions described"}},
      "result": {{"status": "strong|okay|light|missing", "note": "Outcomes, metrics, or impact"}}
    }},
    "strengths": ["Bulleted positives grounded in the answer"],
    "improvements": ["Bulleted coaching to tighten the story"],
    "next_practice": "One drill or prompt to practice next"
  }}
}}
If no answer was provided, set feedback to null and only return the next question and follow_up.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.55,
    )

    content = response.choices[0].message.content.strip()
    data = extract_json(content)

    question = (data.get("question") or "").strip()
    follow_up = (data.get("follow_up") or "").strip() or "What was the outcome?"
    feedback_data = data.get("feedback")

    if not question:
        raise ValueError("Model did not return a question.")

    feedback = None
    if feedback_data:
        try:
            feedback = BehavioralFeedback(**feedback_data)
        except Exception as exc:
            raise ValueError("Feedback could not be parsed.") from exc

    return BehavioralAssistantTurnResponse(
        question=question,
        follow_up=follow_up,
        question_index=question_index,
        total_questions=payload.target_questions,
        feedback=feedback,
    )


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


def transcribe_audio(file_bytes: bytes, filename: str | None = None) -> str:
    """Transcribe short-form interview answers from audio."""
    if not file_bytes:
        raise ValueError("Audio file is empty.")
    buffer = BytesIO(file_bytes)
    buffer.name = filename or "audio.webm"
    transcription = client.audio.transcriptions.create(
        model="whisper-1",
        file=buffer,
    )
    text = getattr(transcription, "text", None)
    if not text or not text.strip():
        raise ValueError("No speech detected in the audio.")
    return text.strip()
