from typing import Callable, Awaitable
from integrations.clod import ClodClient

_client = ClodClient()


async def call_claude(system: str, user: str) -> str:
    """Non-streamed LLM call via CLod. Returns full response string."""
    return await _client.chat(system=system, user=user)


async def call_claude_stream(
    system: str,
    user: str,
    on_token: Callable[[str], Awaitable[None]],
) -> str:
    """
    Streamed LLM call via CLod. Calls on_token(token) for each chunk.
    Returns the full assembled response string when complete.
    """
    return await _client.chat_stream(system=system, user=user, on_token=on_token)
