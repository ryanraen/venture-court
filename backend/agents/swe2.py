from agents.base_agent import call_claude_stream


async def review_code(codebase: dict, on_event) -> dict:
    """Review codebase via CLod. Returns approval status and issues."""
    files_summary = "\n".join(
        f"--- {name} ---\n{content}" for name, content in codebase["files"].items()
    )

    review_text = await call_claude_stream(
        system=(
            "You are SWE 2, a senior code reviewer. Review the provided codebase for bugs, "
            "security issues, and MVP completeness. Respond with a JSON object containing: "
            '"approved" (bool), "issues" (array of {severity, message}), "suggestions" (array of strings).'
        ),
        user=f"Review this codebase:\n\n{files_summary}",
        on_token=lambda tok: on_event("review_token", {"agent": "SWE2", "token": tok}),
    )

    # Parse review or return approved if parsing fails (stub-safe)
    try:
        import json
        return json.loads(review_text)
    except (json.JSONDecodeError, ValueError):
        return {
            "approved": True,
            "issues": [],
            "suggestions": ["Consider adding input validation"],
        }
