from council.karpathy_council import run_council
from integrations.nia import NiaClient


async def ideate(idea: str, on_event) -> str:
    """Stage 1: Devil's advocate — find reasons this will fail."""
    topic = (
        f"Startup idea: {idea}\n\n"
        "You are the Contrarian agent. Your role is to find every reason "
        "this startup idea will fail. Look for fatal flaws, market risks, "
        "timing issues, competitive threats, and execution challenges. "
        "Be the devil's advocate."
    )
    return await run_council(
        "Contrarian",
        topic,
        lambda pn, tok: on_event("council_token", {"agent": "Contrarian", "persona": pn, "token": tok}),
    )


async def research_negative(idea: str, on_event) -> str:
    """Stage 2: Query Nia for negative evidence — failures, blockers, shrinking markets."""
    nia = NiaClient()
    scraped_data = await nia.scrape(queries=[
        f"{idea} failed startup",
        f"{idea} regulatory blockers",
        f"{idea} shrinking market",
        f"{idea} negative customer sentiment site:reddit.com",
    ])
    await on_event("nia_result", {"agent": "Contrarian", "content": scraped_data})

    topic = (
        f"Startup idea: {idea}\n\n"
        f"Negative research data from web scraping:\n{scraped_data}\n\n"
        "Analyze: What is genuinely fatal vs. what is surmountable? "
        "Be nuanced — not everything negative is a death sentence."
    )
    return await run_council(
        "Contrarian",
        topic,
        lambda pn, tok: on_event("council_token", {"agent": "Contrarian", "persona": pn, "token": tok}),
    )
