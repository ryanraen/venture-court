from council.karpathy_council import run_council
from integrations.nia import NiaClient


async def ideate(idea: str, on_event) -> str:
    """Stage 1: CMO forms opinion from prior knowledge via council."""
    topic = (
        f"Startup idea: {idea}\n\n"
        "As CMO, analyze: What is the total addressable market? "
        "How severe is the customer pain? Who are the top competitors? "
        "What's the go-to-market strategy?"
    )
    return await run_council(
        "CMO",
        topic,
        lambda pn, tok: on_event("council_token", {"agent": "CMO", "persona": pn, "token": tok}),
    )


async def research_market(idea: str, on_event) -> str:
    """Stage 2: Calls Nia to scrape real data, then feeds into council."""
    nia = NiaClient()
    scraped_data = await nia.scrape(queries=[
        f"{idea} market size",
        f"{idea} top competitors",
        f"{idea} customer complaints site:reddit.com",
        f"{idea} viral tiktok trend",
    ])
    await on_event("nia_result", {"agent": "CMO", "content": scraped_data})

    topic = (
        f"Startup idea: {idea}\n\n"
        f"Real market data from web scraping:\n{scraped_data}\n\n"
        "Analyze this market opportunity based on the real data above."
    )
    return await run_council(
        "CMO",
        topic,
        lambda pn, tok: on_event("council_token", {"agent": "CMO", "persona": pn, "token": tok}),
    )
