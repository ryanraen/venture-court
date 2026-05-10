import os
import httpx
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from models import NiaRequestBody

router = APIRouter()

NIA_BASE = "https://apigcp.trynia.ai/v2"


@router.post("/api/nia")
async def nia_endpoint(body: NiaRequestBody):
    try:
        nia_key = os.environ.get("NIA_API_KEY", "")
        print(f"[/api/nia] Calling Nia web search (key present: {bool(nia_key)}, query length: {len(body.query)})")

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{NIA_BASE}/search",
                headers={
                    "Authorization": f"Bearer {nia_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "mode": "web",
                    "messages": [{"role": "user", "content": body.query}],
                },
            )

        print(f"[/api/nia] Nia responded: status={response.status_code}, length={len(response.text)}")

        if response.status_code != 200:
            print(f"[/api/nia] Nia error body: {response.text[:500]}")
            return JSONResponse(
                status_code=response.status_code,
                content={"error": f"Nia API error: {response.status_code}", "code": "NIA_ERROR"},
            )

        data = response.json()

        result_text = _extract_nia_results(data)
        return {"result": result_text}

    except Exception as e:
        print(f"[/api/nia] Error: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "code": "INTERNAL_ERROR"},
        )


def _extract_nia_results(data: dict) -> str:
    """Extract readable text from Nia search response."""
    parts: list[str] = []

    if "message" in data:
        msg = data["message"]
        if isinstance(msg, dict) and "content" in msg:
            parts.append(msg["content"])
        elif isinstance(msg, str):
            parts.append(msg)

    if "results" in data and isinstance(data["results"], list):
        for r in data["results"]:
            title = r.get("title", "")
            snippet = r.get("snippet", r.get("content", ""))
            url = r.get("url", "")
            if title or snippet:
                parts.append(f"- **{title}**: {snippet}" + (f" ({url})" if url else ""))

    if "sources" in data and isinstance(data["sources"], list):
        for s in data["sources"]:
            title = s.get("title", s.get("name", ""))
            snippet = s.get("snippet", s.get("content", ""))
            url = s.get("url", "")
            if title or snippet:
                parts.append(f"- **{title}**: {snippet}" + (f" ({url})" if url else ""))

    if not parts:
        return str(data)

    return "\n".join(parts)
