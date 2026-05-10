import json
import asyncio
import os
from fastapi import APIRouter
from fastapi.responses import StreamingResponse, JSONResponse

from models import ClodRequestBody
from services.clod_client import get_client, get_model
from services.prompts import (
    SWE1_SYSTEM_PROMPT,
    SWE2_SYSTEM_PROMPT,
    SWE2_LENS_PROMPTS,
    build_file_generation_prompt,
)

router = APIRouter()

LENS_NAMES = ["contrarian", "firstPrinciples", "expansionist", "outsider", "executor"]


def _parse_json_safe(raw: str) -> dict | None:
    try:
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        return json.loads(cleaned)
    except (json.JSONDecodeError, IndexError):
        return None


def _handle_clod_error(e: Exception) -> JSONResponse:
    from openai import APIError
    if isinstance(e, APIError):
        if e.status_code == 401:
            return JSONResponse(status_code=401, content={"error": "CLōD API key is invalid. Check CLOD_API_KEY in your .env.", "code": "CLOD_AUTH_ERROR"})
        if e.status_code == 404:
            model = os.environ.get("CLOD_SWE_MODEL", "unknown")
            return JSONResponse(status_code=404, content={"error": f'CLōD model "{model}" not found. Visit app.clod.io/user/models/explore to find available model IDs.', "code": "CLOD_MODEL_NOT_FOUND"})
        if e.status_code == 429:
            return JSONResponse(status_code=429, content={"error": "CLōD rate limit reached. Please try again in a moment.", "code": "CLOD_RATE_LIMIT"})
    print(f"[/api/clod] Error: {e}")
    return JSONResponse(status_code=500, content={"error": str(e), "code": "INTERNAL_ERROR"})


def _call_with_retry(fn):
    """Call fn, retry once on 429."""
    import time
    from openai import APIError
    try:
        return fn()
    except APIError as e:
        if e.status_code == 429:
            time.sleep(2)
            return fn()
        raise


@router.post("/api/clod")
async def clod_endpoint(body: ClodRequestBody):
    try:
        client = get_client()
        model = get_model()

        if body.type == "lens" and body.agentRole == "swe2":
            files = body.generatedFiles or []
            concatenated = "\n\n".join(f"=== {f.path} ===\n{f.content}" for f in files)

            outputs: dict[str, str] = {}

            def run_lens(lens_name: str) -> tuple[str, str]:
                prompt = SWE2_LENS_PROMPTS[lens_name]
                resp = _call_with_retry(lambda: client.chat.completions.create(
                    model=model,
                    max_tokens=1000,
                    messages=[
                        {"role": "system", "content": prompt},
                        {"role": "user", "content": f"Review this codebase:\n\n{concatenated}"},
                    ],
                ))
                return lens_name, resp.choices[0].message.content or ""

            loop = asyncio.get_event_loop()
            tasks = [loop.run_in_executor(None, run_lens, ln) for ln in LENS_NAMES]
            results = await asyncio.gather(*tasks)
            for name, text in results:
                outputs[name] = text

            return {"outputs": outputs}

        if body.type == "synthesis" and body.agentRole == "swe2":
            files = body.generatedFiles or []
            concatenated = "\n\n".join(f"=== {f.path} ===\n{f.content}" for f in files)
            lens_context = body.swe2Feedback or ""

            user_content = f"## Council Lens Outputs\n{lens_context}\n\n## Codebase\n{concatenated}\n\nSynthesize the council's input and produce your formal code review as JSON."

            response = _call_with_retry(lambda: client.chat.completions.create(
                model=model,
                max_tokens=2000,
                messages=[
                    {"role": "system", "content": SWE2_SYSTEM_PROMPT},
                    {"role": "user", "content": user_content},
                ],
            ))

            raw = response.choices[0].message.content or ""
            parsed = _parse_json_safe(raw)

            if not parsed:
                retry = _call_with_retry(lambda: client.chat.completions.create(
                    model=model,
                    max_tokens=2000,
                    messages=[
                        {"role": "system", "content": SWE2_SYSTEM_PROMPT},
                        {"role": "user", "content": user_content},
                        {"role": "assistant", "content": raw},
                        {"role": "user", "content": "Your previous output was not valid JSON. Output ONLY the JSON object."},
                    ],
                ))
                parsed = _parse_json_safe(retry.choices[0].message.content or "")

            if not parsed:
                return JSONResponse(status_code=500, content={"error": "Failed to parse SWE 2 output as JSON after retry", "code": "PARSE_ERROR"})

            return {"output": parsed}

        if body.type == "generate" and body.agentRole == "swe1" and body.fileToGenerate and body.blueprint:
            prior_files = [{"path": f.path, "content": f.content} for f in (body.generatedFiles or [])]
            prompt = build_file_generation_prompt(
                json.dumps(body.blueprint, indent=2),
                body.fileToGenerate.path,
                body.fileToGenerate.purpose,
                body.fileToGenerate.dependencies,
                prior_files,
                body.swe2Feedback,
            )

            stream = _call_with_retry(lambda: client.chat.completions.create(
                model=model,
                max_tokens=4000,
                stream=True,
                messages=[
                    {"role": "system", "content": SWE1_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
            ))

            async def generate():
                for chunk in stream:
                    if not chunk.choices:
                        continue
                    text = chunk.choices[0].delta.content or ""
                    if text:
                        yield text

            return StreamingResponse(generate(), media_type="text/event-stream")

        return JSONResponse(status_code=400, content={"error": "Invalid request parameters", "code": "INVALID_REQUEST"})

    except Exception as e:
        return _handle_clod_error(e)
