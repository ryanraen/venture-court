from integrations.clod import ClodClient
from agents.base_agent import call_claude


async def build_mvp(tech_spec: str, on_event) -> dict:
    """Build MVP from tech spec using CLod."""
    clod = ClodClient()
    result = await clod.generate(
        spec=tech_spec,
        output_format="file_tree_with_content",
        on_token=lambda tok: on_event("build_token", {"agent": "SWE1", "token": tok}),
    )
    return result


async def fix_mvp(codebase: dict, updated_spec: str, on_event) -> dict:
    """Apply fixes based on SWE2 review issues."""
    clod = ClodClient()
    result = await clod.patch(
        existing_files=codebase["files"],
        spec=updated_spec,
        on_token=lambda tok: on_event("fix_token", {"agent": "SWE1", "token": tok}),
    )
    return result


async def self_review(codebase: dict, tech_spec: str) -> bool:
    """SWE 1 checks its own output against the original spec."""
    verdict = await call_claude(
        system="You are a senior software engineer. Review whether a codebase satisfies a spec.",
        user=(
            f"Tech spec:\n{tech_spec}\n\n"
            f"Codebase files present:\n{list(codebase['files'].keys())}\n\n"
            "Does this codebase satisfy the spec? Reply with only YES or NO."
        ),
    )
    return verdict.strip().upper().startswith("YES")
