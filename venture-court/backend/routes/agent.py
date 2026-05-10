import json
import asyncio
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse

from models import AgentRequestBody
from services.clod_client import get_client, get_model
from services.prompts import (
    LENS_PROMPTS,
    ROLE_PROMPTS,
    CTO_BLUEPRINT_PROMPT,
    build_lens_user_prompt,
    build_synthesis_user_prompt,
)

router = APIRouter()


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


@router.post("/api/agent")
async def agent_endpoint(body: AgentRequestBody):
    try:
        client = get_client()
        model = get_model()

        if body.type == "lens" and body.lens:
            lens_prompt = LENS_PROMPTS.get(body.lens, "")
            user_prompt = build_lens_user_prompt(body.idea, body.context)

            response = client.chat.completions.create(
                model=model,
                max_tokens=1000,
                messages=[
                    {"role": "system", "content": lens_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            )
            return {"output": response.choices[0].message.content or ""}

        if body.type == "synthesis" and body.agentRole == "ceo":
            system_prompt = ROLE_PROMPTS["ceo"]
            try:
                lens_outputs = json.loads(body.context) if body.context else {}
            except json.JSONDecodeError:
                lens_outputs = {}
            user_prompt = build_synthesis_user_prompt(lens_outputs, body.idea, "", body.niaResults)

            response = client.chat.completions.create(
                model=model,
                max_tokens=2000,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            )

            raw = response.choices[0].message.content or ""
            parsed = _parse_json_safe(raw)

            if not parsed:
                retry = client.chat.completions.create(
                    model=model,
                    max_tokens=2000,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                        {"role": "assistant", "content": raw},
                        {"role": "user", "content": "Your previous output was not valid JSON. Output ONLY the JSON object."},
                    ],
                )
                parsed = _parse_json_safe(retry.choices[0].message.content or "")

            if not parsed:
                return JSONResponse(
                    status_code=500,
                    content={"error": "Failed to parse CEO output as JSON after retry", "code": "PARSE_ERROR"},
                )

            return {"output": parsed}

        if body.type == "synthesis" and body.agentRole and body.agentRole != "ceo":
            if body.blueprint:
                response = client.chat.completions.create(
                    model=model,
                    max_tokens=2000,
                    messages=[
                        {"role": "system", "content": CTO_BLUEPRINT_PROMPT},
                        {"role": "user", "content": f"## Idea\n{body.idea}\n\n## Prior Analysis\n{body.context}\n\nProduce the build blueprint JSON."},
                    ],
                )
                raw = response.choices[0].message.content or ""
                parsed = _parse_json_safe(raw)
                if not parsed:
                    return JSONResponse(
                        status_code=500,
                        content={"error": "Failed to parse CTO blueprint as JSON", "code": "PARSE_ERROR"},
                    )
                return {"output": parsed}

            system_prompt = ROLE_PROMPTS.get(body.agentRole, "")
            try:
                lens_outputs = json.loads(body.context) if body.context else {}
            except json.JSONDecodeError:
                lens_outputs = {}
            user_prompt = build_synthesis_user_prompt(lens_outputs, body.idea, "", body.niaResults)

            stream = client.chat.completions.create(
                model=model,
                max_tokens=2000,
                stream=True,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            )

            async def generate():
                for chunk in stream:
                    if not chunk.choices:
                        continue
                    text = chunk.choices[0].delta.content or ""
                    if text:
                        yield text

            return StreamingResponse(generate(), media_type="text/event-stream")

        return JSONResponse(
            status_code=400,
            content={"error": "Invalid request parameters", "code": "INVALID_REQUEST"},
        )

    except Exception as e:
        print(f"[/api/agent] Error: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "code": "INTERNAL_ERROR"},
        )
