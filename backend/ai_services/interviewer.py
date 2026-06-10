import json
import os
import time
from typing import List, Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
import sys

# Add backend directory to Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from courses.models import InterviewResults
from users.models import User

load_dotenv()

API_KEY = os.getenv("GOOGLE_API_KEY", "").strip()
MODEL = os.getenv("GOOGLE_MODEL", "gemini-2.5-flash").strip()

app = FastAPI(title="AI Interviewer", version="1.1.0")

# CORS is useful if you call the backend directly during dev.
# With Docker Compose, the frontend uses an Nginx proxy so CORS isn't required.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key=API_KEY) if API_KEY else None


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=10_000)


class ChatRequest(BaseModel):
    specialization: str = Field(..., min_length=1, max_length=400)
    messages: List[ChatMessage] = Field(default_factory=list, max_length=40)


class ChatResponse(BaseModel):
    text: str
    model: str
    latencyMs: int


class InterviewStartRequest(BaseModel):
    specialization: str = Field(..., min_length=1, max_length=400)


class InterviewStartResponse(BaseModel):
    questions: List[str]


class InterviewFinishRequest(BaseModel):
    specialization: str = Field(..., min_length=1, max_length=400)
    questions: List[str] = Field(..., min_length=5, max_length=5)
    answers: List[str] = Field(..., min_length=5, max_length=5)
    user_id: int = Field(...)

class InterviewEvaluationItem(BaseModel):
    question: str
    grade: float
    feedback: str
    correctAnswer: str


class InterviewFinishResponse(BaseModel):
    overallGrade: float
    summary: str
    evaluations: List[InterviewEvaluationItem]


def _build_messages(req: ChatRequest):
    msgs = []
    for m in req.messages:
        role_out = "model" if m.role == "assistant" else "user"
        msgs.append({"role": role_out, "content": m.content})
    return msgs


def _load_json_payload(raw_text: str):
    text = raw_text.strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.startswith("json"):
            text = text[4:].strip()
    return json.loads(text)


@app.get("/health")
def health():
    return {"ok": True, "model": MODEL}


@app.post("/api/interview/start", response_model=InterviewStartResponse)
def interview_start(req: InterviewStartRequest):
    if not client:
        raise HTTPException(status_code=500, detail="Missing API key")

    prompt = "\n".join(
        [
            f'Generate exactly 5 interview questions for the specialization: "{req.specialization}".',
            "The questions should move from fundamentals to practical depth.",
            'Return JSON only in this exact shape: {"questions":["q1","q2","q3","q4","q5"]}',
            "Do not include any extra text.",
        ]
    )

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json"),
        )
        payload = _load_json_payload(response.text or "")
        questions = (
            payload.get("questions", payload) if isinstance(payload, dict) else payload
        )
        if not isinstance(questions, list) or len(questions) != 5:
            raise ValueError("Model did not return exactly 5 questions.")
        questions = [str(q).strip() for q in questions if str(q).strip()]
        if len(questions) != 5:
            raise ValueError("Model returned empty questions.")
        return InterviewStartResponse(questions=questions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/interview/finish", response_model=InterviewFinishResponse)
def interview_finish(req: InterviewFinishRequest):
    if not client:
        raise HTTPException(status_code=500, detail="Missing API key")

    transcript = []
    for index, (question, answer) in enumerate(
        zip(req.questions, req.answers), start=1
    ):
        transcript.append(f"Q{index}: {question}\nA{index}: {answer}")

    prompt = "\n\n".join(
        [
            f'You are grading a 5-question technical interview for the specialization: "{req.specialization}".',
            "Evaluate each answer briefly and consistently.",
            "Return JSON only in this exact shape:",
            '{"overallGrade": 0, "summary": "...", "evaluations": [{"question": "...", "grade": 0, "feedback": "...", "correctAnswer": "..."}] }',
            "Rules:",
            "- overallGrade must be a number from 0 to 10.",
            "- evaluations must contain exactly 5 items in the same order as the transcript.",
            "- correctAnswer should be short and directly answer the question.",
            "- summary should be concise and mention the candidate's overall strengths and gaps.",
            "Transcript:",
            *transcript,
        ]
    )

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json"),
        )


        payload = _load_json_payload(response.text or "")
        interview_response = InterviewFinishResponse.model_validate(payload)

        import json as json_module
        interview_result_json = json_module.dumps({
            'specialization':req.specialization,
            'questions':req.questions,
            'answers':req.answers,
            'evaluations':[item.model_dump() for item in interview_response.evaluations],
            'summary':interview_response.summary

        })

        result = InterviewResults(
            user_id=User.objects.get(id=req.user_id),
            track_name=req.specialization,
            interview_result=interview_result_json,
            percentage_result=interview_response.overallGrade
        )
        result.save()

        # print(payload)
        # InterviewResults.save()
        return interview_response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat/stream")
async def chat_stream(req: ChatRequest, request: Request):  # add request param
    if not client:
        raise HTTPException(status_code=500, detail="Missing API key")

    msgs = _build_messages(req)
    contents = [
        types.Content(
            role=msg["role"], parts=[types.Part.from_text(text=msg["content"])]
        )
        for msg in msgs
    ]

    system_instruction_str = "\n".join([f"""
        You are an expert technical interviewer specializing in the topic: "{req.specialization}".

        Your role:
        - Ask ONE clear, concise question at a time related to the topic.
        - Wait for the user's answer before providing any evaluation or next question.
        - After the user answers, provide:
        1. A grade (0–10) for correctness, completeness, and clarity.
        2. Brief, constructive feedback explaining what was good and what could be improved.
        3. The correct answer or key points if the user was significantly wrong or missed important aspects.
        - Then ask the next question. The conversation should continue naturally.

        Rules:
        - Do not answer the user's question yourself – you are the interviewer, not the assistant.
        - If the user asks a question unrelated to the interview (e.g., "What's the weather?"), politely remind them to stay on topic and repeat the current question.
        - Keep questions progressively challenging: start with fundamentals, then move to deeper concepts or practical scenarios.
        - Do not repeat the same question within the same session.
        - If the user requests a hint, provide a small clue without giving away the full answer, and do not deduct points.

        Grading guidelines:
        - 8-10: Correct, well-explained, shows deep understanding.
        - 5-7: Partially correct, some gaps or minor errors.
        - 0-4: Incorrect or very incomplete, major misunderstandings.

        Format your response after the user answers as:

        **Grade:** X/10  
        **Feedback:** ...  
        **Correct answer (if needed):** ...  
        **Next question:** ...

        If the user hasn't answered the current question yet, only repeat the question or ask for clarification – do not provide grades or move on.
    """])

    async def generate():
        try:
            stream = client.models.generate_content_stream(
                model=MODEL,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction_str
                ),
            )
            for chunk in stream:
                if await request.is_disconnected():
                    break
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            # Optionally log error
            yield f"\n\n[ERROR] {str(e)}\n"

    return StreamingResponse(
        generate(),
        media_type="text/plain; charset=utf-8",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
