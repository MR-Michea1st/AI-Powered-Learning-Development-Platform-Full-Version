import json
import os
import re
from typing import Literal
from urllib.parse import parse_qs, urlparse

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from youtube_transcript_api import (
    YouTubeTranscriptApi,
    NoTranscriptFound,
    TranscriptsDisabled,
    VideoUnavailable,
)

load_dotenv()

API_KEY = os.getenv("GOOGLE_API_KEY", "").strip()
MODEL = os.getenv("GOOGLE_MODEL", "gemini-2.5-flash").strip()

app = FastAPI(title="SUMMARY", version="1.1.0")

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


prompt = f"""
You are an expert programming educator and technical summarizer.  
Your task is to summarize the transcript of a programming tutorial video.

### Output Format (JSON)
You **must** return a valid JSON object with exactly these fields:

{{
  "title": "A short, descriptive title for the video summary (max 10 words)",
  "summary": "A concise summary of the entire video in 150–250 words. Focus on the main concepts, practical steps, and key takeaways.",
  "key_points": [
    "Point 1: first important concept or technique",
    "Point 2: second key idea with any code/command mentioned",
    "Point 3: third actionable takeaway"
  ],
  "code_snippets": [
    "Extract any important code or commands shown. If no code, return an empty list []."
  ],
  "difficulty_level": "Beginner / Intermediate / Advanced (choose one based on the content)"
}}

### Guidelines
- Use clear, plain English – avoid markdown inside the JSON values.
- Prefer bullet points in the `key_points` list.
- Keep `code_snippets` short (max 5 snippets, each ≤ 3 lines).
- If the transcript is incomplete or not available, set `summary` to "Transcript not available for summarization."

"""


class YouTubeRequest(BaseModel):
    url: str = Field(..., min_length=10, max_length=2000)
    mode: Literal["summary", "transcript", "both"] = "summary"
    focus: str | None = Field(default=None, max_length=500)


class YouTubeResponse(BaseModel):
    videoId: str
    transcript: str
    summary: str | None = None
    model: str | None = None


def _extract_video_id(url: str) -> str:
    parsed = urlparse(url.strip())

    if parsed.netloc in {"youtu.be", "www.youtu.be"}:
        video_id = parsed.path.strip("/")
        if video_id:
            return video_id

    if "youtube.com" in parsed.netloc:
        query_video_id = parse_qs(parsed.query).get("v", [""])[0].strip()
        if query_video_id:
            return query_video_id

        match = re.search(r"/(?:shorts|embed|live)/([^/?&]+)", parsed.path)
        if match:
            return match.group(1)

    raise HTTPException(status_code=400, detail="Invalid YouTube URL")


def _get_transcript_text(video_id: str) -> str:
    try:
        transcript_api = YouTubeTranscriptApi()
        # Newer versions offer a `fetch` API; fall back to `get_transcript`.
        if hasattr(transcript_api, "fetch"):
            transcript_data = transcript_api.fetch(video_id)
            if isinstance(transcript_data, list):
                transcript = "\n".join(
                    (
                        item.get("text", "")
                        if isinstance(item, dict)
                        else getattr(item, "text", "")
                    )
                    for item in transcript_data
                )
            else:
                # Some fetch implementations return objects with .to_raw_data()
                try:
                    raw = transcript_data.to_raw_data()
                    transcript = "\n".join(item.get("text", "") for item in raw)
                except Exception:
                    transcript = ""
        else:
            segments = transcript_api.get_transcript(video_id)
            transcript = "\n".join(item.get("text", "") for item in segments)
    except (NoTranscriptFound, TranscriptsDisabled):
        # No captions available for this video
        raise HTTPException(
            status_code=404,
            detail=(
                "No transcript available for this video. Captions may be disabled, "
                "auto-generated only, or not provided by the uploader."
            ),
        )
    except VideoUnavailable:
        raise HTTPException(status_code=404, detail="Video is unavailable.")
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Could not fetch transcript for this video: {exc}",
        )

    if not transcript or not transcript.strip():
        # Treat empty transcript as not found
        raise HTTPException(
            status_code=404,
            detail=(
                "Transcript is empty or could not be retrieved for this video. "
                "Try a different video or check that captions are enabled."
            ),
        )

    return transcript


def _build_summary_prompt(transcript: str, focus: str | None = None) -> str:
    """Compose the top-level prompt (defined in `prompt`) with optional focus and the transcript."""
    parts = [prompt.strip()]
    if focus:
        parts.append(f"Focus: {focus}")
    parts.append("Transcript:")
    parts.append(transcript)
    return "\n\n".join(parts)


def _summarize_transcript(transcript: str, focus: str | None = None) -> str:
    if not client:
        raise HTTPException(status_code=500, detail="Missing API key")

    # Build and send the unified prompt (same as used by the streaming endpoint)
    prompt_text = _build_summary_prompt(transcript, focus)

    response = client.models.generate_content(
        model=MODEL,
        contents=prompt_text,
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )

    payload = json.loads((response.text or "{}").strip())
    summary = (
        str(payload.get("summary", "")).strip() if isinstance(payload, dict) else ""
    )
    if not summary:
        raise HTTPException(status_code=500, detail="Gemini did not return a summary")
    return summary


@app.get("/health")
def health():
    return {"ok": True, "model": MODEL}


@app.post("/api/youtube", response_model=YouTubeResponse)
def youtube_summary(req: YouTubeRequest):
    video_id = _extract_video_id(req.url)
    transcript = _get_transcript_text(video_id)

    summary = None
    if req.mode in {"summary", "both"}:
        summary = _summarize_transcript(transcript, req.focus)

    if req.mode == "transcript":
        summary = None

    return YouTubeResponse(
        videoId=video_id,
        transcript=transcript,
        summary=summary,
        model=MODEL if summary else None,
    )


@app.post("/api/youtube/stream")
async def youtube_stream(req: YouTubeRequest, request: Request):
    """Stream the transcript first, then stream the Gemini-generated summary (if requested)."""

    # Validate and fetch transcript (may raise HTTPException)
    video_id = _extract_video_id(req.url)
    transcript = _get_transcript_text(video_id)

    async def generate():
        try:
            # Yield a header so clients can detect transcript start
            yield "[TRANSCRIPT]\n"

            # Stream transcript in chunks (avoid huge single writes)
            chunk_size = 2000
            for i in range(0, len(transcript), chunk_size):
                if await request.is_disconnected():
                    return
                yield transcript[i : i + chunk_size] + "\n"

            yield "[END_TRANSCRIPT]\n"

            if req.mode in {"summary", "both"}:
                if not client:
                    yield "[ERROR] Missing API key\n"
                    return

                # Reuse the same prompt as the non-streaming path so both endpoints use identical instructions.
                prompt_text = _build_summary_prompt(transcript, req.focus)
                contents = [
                    types.Content(
                        role="user", parts=[types.Part.from_text(text=prompt_text)]
                    )
                ]

                try:
                    stream = client.models.generate_content_stream(
                        model=MODEL,
                        contents=contents,
                        config=types.GenerateContentConfig(
                            response_mime_type="application/json"
                        ),
                    )

                    # Yield a header for summary
                    yield "[SUMMARY]\n"
                    for chunk in stream:
                        if await request.is_disconnected():
                            break
                        if chunk.text:
                            yield chunk.text

                    yield "\n[END_SUMMARY]\n"
                except Exception as e:
                    yield f"[ERROR] Summary generation failed: {e}\n"

            yield "[DONE]\n"

        except HTTPException as he:
            yield f"[ERROR] {he.detail}\n"
        except Exception as e:
            yield f"[ERROR] {str(e)}\n"

    return StreamingResponse(
        generate(),
        media_type="text/plain; charset=utf-8",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
