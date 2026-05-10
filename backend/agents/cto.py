from agents.base_agent import call_claude
from council.karpathy_council import run_council


async def ideate(idea: str, on_event) -> str:
    """Stage 1: CTO runs council on the raw idea for technical feasibility."""
    topic = (
        f"Startup idea: {idea}\n\n"
        "As CTO, analyze: Is this technically feasible? "
        "What's the recommended tech stack? "
        "What are the infrastructure costs at scale? "
        "What are the hardest engineering challenges?"
    )
    return await run_council(
        "CTO",
        topic,
        lambda pn, tok: on_event("council_token", {"agent": "CTO", "persona": pn, "token": tok}),
    )


async def generate_tech_spec(idea: str, research_summary: str) -> str:
    """Stage 3: Produce the tech spec for SWE 1 to build from."""
    spec = await call_claude(
        system=(
            "You are the CTO. Produce a detailed technical specification for an MVP. "
            "Include: recommended stack, folder structure, key MVP features, and explicit non-goals. "
            "Be specific enough that a developer can build directly from this spec."
        ),
        user=(
            f"Startup idea: {idea}\n\n"
            f"Market research summary: {research_summary}\n\n"
            "Write the MVP tech spec."
        ),
    )
    return spec
