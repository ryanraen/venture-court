import json
import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from models.schemas import IdeationRequest
from agents import cmo, cto, contrarian, ceo

router = APIRouter()


@router.post("/start")
async def start_ideation(request: IdeationRequest):
    async def generate():
        events = asyncio.Queue()

        async def on_event(event_type: str, data):
            await events.put((event_type, data))

        async def run_cmo():
            verdict = await cmo.ideate(request.idea, on_event)
            await events.put(("agent_verdict", {"agent": "CMO", "content": verdict}))
            return verdict

        async def run_cto():
            verdict = await cto.ideate(request.idea, on_event)
            await events.put(("agent_verdict", {"agent": "CTO", "content": verdict}))
            return verdict

        async def run_contrarian():
            verdict = await contrarian.ideate(request.idea, on_event)
            await events.put(("agent_verdict", {"agent": "Contrarian", "content": verdict}))
            return verdict

        agent_tasks = [
            asyncio.create_task(run_cmo()),
            asyncio.create_task(run_cto()),
            asyncio.create_task(run_contrarian()),
        ]

        # Stream events as they arrive while agents run concurrently
        done = False
        results = [None, None, None]

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
            elif event_type == "agent_verdict":
                yield f"data: {json.dumps({'agent': data['agent'], 'type': 'verdict', 'content': data['content']})}\n\n"

        cmo_verdict, cto_verdict, contrarian_verdict = results

        # CEO synthesizes
        ceo_events = asyncio.Queue()

        async def ceo_on_event(event_type: str, data):
            await ceo_events.put((event_type, data))

        ceo_task = asyncio.create_task(
            ceo.synthesize_ideation(
                request.idea, cmo_verdict, cto_verdict, contrarian_verdict, ceo_on_event
            )
        )

        ceo_done = False
        while not ceo_done:
            try:
                event_type, data = await asyncio.wait_for(ceo_events.get(), timeout=0.1)
                if event_type == "council_token":
                    yield f"data: {json.dumps(data)}\n\n"
            except asyncio.TimeoutError:
                if ceo_task.done():
                    ceo_done = True

        final_verdict = await ceo_task
        yield f"data: {json.dumps({'agent': 'CEO', 'type': 'final_verdict', 'content': final_verdict})}\n\n"
        yield f"data: {json.dumps({'type': 'stage_complete', 'proceed_prompt': 'Would you like to proceed to Market Research?'})}\n\n"

        await collector

    return StreamingResponse(generate(), media_type="text/event-stream")
