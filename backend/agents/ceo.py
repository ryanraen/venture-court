from council.karpathy_council import run_council
from agents.base_agent import call_claude


async def synthesize_ideation(
    idea: str,
    cmo_verdict: str,
    cto_verdict: str,
    contrarian_verdict: str,
    on_event,
) -> str:
    """Stage 1: CEO receives all agent outputs, runs own council, delivers final verdict."""
    topic = (
        f"Startup idea: {idea}\n\n"
        f"CMO Analysis:\n{cmo_verdict}\n\n"
        f"CTO Analysis:\n{cto_verdict}\n\n"
        f"Contrarian Analysis:\n{contrarian_verdict}\n\n"
        "As CEO, synthesize these perspectives into a final verdict on whether "
        "this idea is worth pursuing to the Market Research stage."
    )
    verdict = await run_council(
        "CEO",
        topic,
        lambda pn, tok: on_event("council_token", {"agent": "CEO", "persona": pn, "token": tok}),
    )
    return verdict


async def synthesize_research(
    idea: str,
    cmo_research: str,
    contrarian_research: str,
    on_event,
) -> str:
    """Stage 2: CEO synthesizes all research findings into executive summary."""
    summary = await call_claude(
        system=(
            "You are the CEO. Synthesize market research findings from your CMO and Contrarian "
            "into a single executive summary. Be decisive about whether to proceed to prototyping. "
            "Include: key market opportunity, top risks, and your recommendation."
        ),
        user=(
            f"Startup idea: {idea}\n\n"
            f"CMO Market Research:\n{cmo_research}\n\n"
            f"Contrarian Negative Research:\n{contrarian_research}\n\n"
            "Deliver your executive research summary."
        ),
    )
    return summary
