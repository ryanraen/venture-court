import base64
import httpx
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from models import GithubRequestBody

router = APIRouter()

GITHUB_API = "https://api.github.com"


async def _github_fetch(path: str, token: str, method: str = "GET", json_body: dict | None = None) -> httpx.Response:
    async with httpx.AsyncClient(timeout=30.0) as client:
        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json",
        }
        return await client.request(method, f"{GITHUB_API}{path}", headers=headers, json=json_body)


@router.post("/api/github")
async def github_endpoint(body: GithubRequestBody):
    try:
        if not body.token or not body.repo:
            return JSONResponse(status_code=400, content={"error": "Missing GitHub token or repo", "code": "MISSING_CREDENTIALS"})

        if body.operation == "getHeadSha":
            res = await _github_fetch(f"/repos/{body.repo}/git/ref/heads/main", body.token)
            if res.status_code != 200:
                return JSONResponse(status_code=res.status_code, content={"error": f"Failed to get HEAD SHA: {res.status_code}", "code": "GITHUB_ERROR"})
            data = res.json()
            return {"sha": data["object"]["sha"]}

        elif body.operation == "createBranch":
            if not body.branch or not body.sha:
                return JSONResponse(status_code=400, content={"error": "Missing branch or sha", "code": "INVALID_REQUEST"})
            res = await _github_fetch(
                f"/repos/{body.repo}/git/refs",
                body.token,
                method="POST",
                json_body={"ref": f"refs/heads/{body.branch}", "sha": body.sha},
            )
            if res.status_code not in (200, 201):
                return JSONResponse(status_code=res.status_code, content={"error": f"Failed to create branch: {res.status_code} {res.text}", "code": "GITHUB_ERROR"})
            return {"success": True}

        elif body.operation == "pushFile":
            if not body.branch or not body.path or not body.content or not body.message:
                return JSONResponse(status_code=400, content={"error": "Missing required pushFile fields", "code": "INVALID_REQUEST"})
            b64 = base64.b64encode(body.content.encode("utf-8")).decode("utf-8")
            res = await _github_fetch(
                f"/repos/{body.repo}/contents/{body.path}",
                body.token,
                method="PUT",
                json_body={"message": body.message, "content": b64, "branch": body.branch},
            )
            if res.status_code not in (200, 201):
                return JSONResponse(status_code=res.status_code, content={"error": f"Failed to push file: {res.status_code} {res.text}", "code": "GITHUB_ERROR"})
            return {"success": True}

        elif body.operation == "createPR":
            if not body.title or not body.body or not body.head:
                return JSONResponse(status_code=400, content={"error": "Missing required createPR fields", "code": "INVALID_REQUEST"})
            res = await _github_fetch(
                f"/repos/{body.repo}/pulls",
                body.token,
                method="POST",
                json_body={"title": body.title, "body": body.body, "head": body.head, "base": body.base or "main"},
            )
            if res.status_code not in (200, 201):
                return JSONResponse(status_code=res.status_code, content={"error": f"Failed to create PR: {res.status_code} {res.text}", "code": "GITHUB_ERROR"})
            data = res.json()
            return {"prUrl": data["html_url"]}

        else:
            return JSONResponse(status_code=400, content={"error": f"Unknown operation: {body.operation}", "code": "INVALID_REQUEST"})

    except Exception as e:
        print(f"[/api/github] Error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e), "code": "INTERNAL_ERROR"})
