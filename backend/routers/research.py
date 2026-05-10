import json
import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from models.schemas import ResearchRequest
from agents import cmo, contrarian, ceo

router = APIRouter()


@router.post("/start")
async def start_research(request: ResearchRequest):
    async def generate():
        events = asyncio.Queue()

        async def on_event(event_type: str, data):
            await events.put((event_type, data))

        async def run_cmo_research():
            result = await cmo.research_market(request.idea, on_event)
            await events.put(("agent_verdict", {"agent": "CMO", "content": result}))
            return result

        async def run_contrarian_research():
            result = await contrarian.research_negative(request.idea, on_event)
            await events.put(("agent_verdict", {"agent": "Contrarian", "content": result}))
            return result

        agent_tasks = [
            asyncio.create_task(run_cmo_research()),
            asyncio.create_task(run_contrarian_research()),
        ]

        done = False
        results = [None, None]

        async def collect_results():
            nonlocal results
            results = await asyncio.gather(*agent_tasks)
            await events.put(("agents_done", None))

        collector = asyncio.create_task(collect_results())

        while not done:
            event_type, data = await events.get()
            if event_type == "agents_done":
                done = True
            elif event_type == "council_token":
                yield f"data: {json.dumps(data)}\n\n"
            elif event_type == "nia_result":
                yield f"data: {json.dumps({'agent': data['agent'], 'type': 'nia_result', 'content': data['content']})}\n\n"
            elif event_type == "agent_verdict":
                yield f"data: {json.dumps({'agent': data['agent'], 'type': 'verdict', 'content': data['content']})}\n\n"

        cmo_research, contrarian_research = results

        # CEO synthesizes research
        summary = await ceo.synthesize_research(
            request.idea, cmo_research, contrarian_research, on_event
        )

        yield f"data: {json.dumps({'agent': 'CEO', 'type': 'research_summary', 'content': summary})}\n\n"
        yield f"data: {json.dumps({'type': 'stage_complete', 'proceed_prompt': 'Do you wish to proceed to Prototyping?'})}\n\n"

        await collector

    return StreamingResponse(generate(), media_type="text/event-stream")
