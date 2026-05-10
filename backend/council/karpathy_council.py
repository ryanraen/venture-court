from agents.base_agent import call_claude, call_claude_stream
from typing import Callable, Awaitable

COUNCIL_PERSONAS = [
    (
        "The Contrarian",
        "You hunt for what will fail. Be ruthlessly skeptical. Don't be constructive — be critical.",
    ),
    (
        "The First Principles Thinker",
        "You question whether this is even the right problem to solve. Strip away assumptions.",
    ),
    (
        "The Expansionist",
        "You look for upside and opportunities being missed. Be ambitious and optimistic.",
    ),
    (
        "The Outsider",
        "You have zero context about this industry. Respond as a complete newcomer — surface the curse of knowledge.",
    ),
    (
        "The Executor",
        "You only care about what concrete action to take Monday morning. Be ruthlessly practical.",
    ),
]


async def run_council(
    agent_role: str,
    topic: str,
    on_token: Callable[[str, str], Awaitable[None]],
) -> str:
    """
    Run a topic through all 5 council personas.
    Each persona speaks as itself, not as agent_role.
    Calls on_token(persona_name, token) for real-time streaming.
    Returns the agent's synthesized final position.
    """
    council_outputs = []

    for persona_name, persona_system in COUNCIL_PERSONAS:
        response = await call_claude_stream(
            system=persona_system,
            user=f"Analyze this startup idea and context from your unique perspective:\n\n{topic}",
            on_token=lambda token, pn=persona_name: on_token(pn, token),
        )
        council_outputs.append(f"[{persona_name}]:\n{response}")

    synthesis = await call_claude(
        system=(
            f"You are the {agent_role}. You have just seen a council of advisors debate a topic. "
            f"Synthesize their views and state your own decisive, well-reasoned final position."
        ),
        user=f"Topic:\n{topic}\n\nCouncil debate:\n\n" + "\n\n".join(council_outputs),
    )
    return synthesis
