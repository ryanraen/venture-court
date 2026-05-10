import os
import json
import httpx
from typing import Callable, Awaitable

CLOD_API_KEY = os.getenv("CLOD_API_KEY", "")
CLOD_BASE_URL = os.getenv("CLOD_BASE_URL", "https://api.clod.io/v1")
CLOD_MODEL = os.getenv("CLOD_MODEL", "DeepSeek V3")


class ClodClient:
    """
    CLod — OpenAI-compatible LLM API powering all reasoning and code generation.
    Base URL: https://api.clod.io/v1
    Endpoint: POST /v1/chat/completions
    """

    def __init__(self):
        self.base_url = CLOD_BASE_URL.rstrip("/")
        self.model = CLOD_MODEL
        self.headers = {
            "Authorization": f"Bearer {CLOD_API_KEY}",
            "Content-Type": "application/json",
        }

    async def chat(self, system: str, user: str, max_tokens: int = 4096) -> str:
        """Non-streamed chat completion. Returns full response string."""
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "max_completion_tokens": max_tokens,
            "temperature": 0.7,
            "stream": False,
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

    async def chat_stream(
        self,
        system: str,
        user: str,
        on_token: Callable[[str], Awaitable[None]],
        max_tokens: int = 4096,
    ) -> str:
        """Streamed chat completion. Calls on_token(chunk) for each delta, returns full text."""
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "max_completion_tokens": max_tokens,
            "temperature": 0.7,
            "stream": True,
        }

        full_response = ""
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload,
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    data_str = line[6:]
                    if data_str.strip() == "[DONE]":
                        break
                    try:
                        chunk = json.loads(data_str)
                        delta = chunk["choices"][0].get("delta", {})
                        content = delta.get("content", "")
                        if content:
                            full_response += content
                            await on_token(content)
                    except (json.JSONDecodeError, KeyError, IndexError):
                        continue

        return full_response

    async def generate(self, spec: str, output_format: str, on_token) -> dict:
        """Code generation — produces a file tree from a tech spec."""
        system = (
            "You are an expert full-stack developer. Generate a complete MVP codebase "
            "from the given spec. Return ONLY valid JSON with a single key 'files' mapping "
            "filenames to their full content. No markdown, no explanation, just the JSON object.\n"
            "Example: {\"files\": {\"main.py\": \"...\", \"index.html\": \"...\"}}"
        )
        user = f"Generate the MVP codebase for this spec:\n\n{spec}"

        # Stream for real-time feedback, collect full response
        full_text = await self.chat_stream(
            system=system,
            user=user,
            on_token=on_token,
            max_tokens=8192,
        )

        # Parse the JSON response
        try:
            # Handle potential markdown code fences in the response
            cleaned = full_text.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[1]
                cleaned = cleaned.rsplit("```", 1)[0]
            result = json.loads(cleaned)
            if "files" in result:
                return result
            return {"files": result}
        except (json.JSONDecodeError, ValueError):
            # Fallback: treat the entire response as a single file
            return {"files": {"main.py": full_text}}

    async def patch(self, existing_files: dict, spec: str, on_token) -> dict:
        """Code patching — applies fixes to an existing codebase based on updated spec."""
        files_content = "\n\n".join(
            f"--- {name} ---\n{content}" for name, content in existing_files.items()
        )
        system = (
            "You are an expert full-stack developer. You are given an existing codebase and "
            "an updated spec with issues to fix. Return ONLY valid JSON with a single key 'files' "
            "mapping filenames to their COMPLETE updated content (not diffs). "
            "No markdown, no explanation, just the JSON object.\n"
            "Example: {\"files\": {\"main.py\": \"...\", \"index.html\": \"...\"}}"
        )
        user = (
            f"Fix the following codebase according to the updated spec.\n\n"
            f"Updated spec:\n{spec}\n\n"
            f"Current codebase:\n{files_content}"
        )

        full_text = await self.chat_stream(
            system=system,
            user=user,
            on_token=on_token,
            max_tokens=8192,
        )

        try:
            cleaned = full_text.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[1]
                cleaned = cleaned.rsplit("```", 1)[0]
            result = json.loads(cleaned)
            if "files" in result:
                return result
            return {"files": result}
        except (json.JSONDecodeError, ValueError):
            # If parsing fails, return original files unchanged
            return {"files": existing_files}
