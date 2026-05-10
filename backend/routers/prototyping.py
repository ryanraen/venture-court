import os
import json
import asyncio
from pathlib import Path
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from models.schemas import PrototypeRequest, RefineRequest
from agents import swe1, swe2, cto

router = APIRouter()

MVP_OUTPUT_DIR = os.getenv("MVP_OUTPUT_DIR", "/tmp/venture_court_mvps")
MVP_SERVER_PORT = int(os.getenv("MVP_SERVER_PORT", "8001"))


async def launch_mvp_server(codebase: dict, session_id: str = "default") -> int:
    """Write files to disk and launch the MVP server."""
    output_dir = Path(MVP_OUTPUT_DIR) / session_id
    output_dir.mkdir(parents=True, exist_ok=True)

    for filename, content in codebase["files"].items():
        filepath = output_dir / filename
        filepath.parent.mkdir(parents=True, exist_ok=True)
        filepath.write_text(content)

    # Launch uvicorn for the generated MVP
    process = await asyncio.create_subprocess_exec(
        "uvicorn", "main:app", "--host", "0.0.0.0", "--port", str(MVP_SERVER_PORT),
        cwd=str(output_dir),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )

    # Give it a moment to start
    await asyncio.sleep(2)
    return MVP_SERVER_PORT


async def prototype_loop(spec: str, initial_codebase: dict | None, stream_callback):
    """Run the SWE1 build → SWE2 review loop until approved or max iterations."""
    codebase = initial_codebase
    max_iterations = 5

    for i in range(max_iterations):
        if codebase is None:
            codebase = await swe1.build_mvp(spec, stream_callback)
        else:
            codebase = await swe1.fix_mvp(codebase, spec, stream_callback)

        # Emit files
        for filename, content in codebase["files"].items():
            await stream_callback(
                "file",
                {"agent": "SWE1", "name": filename, "content": content},
            )

        review = await swe2.review_code(codebase, stream_callback)

        if review["approved"]:
            await stream_callback(
                "approved",
                {"agent": "SWE2", "message": "LGTM ✓"},
            )
            swe1_ok = await swe1.self_review(codebase, spec)
            if swe1_ok:
                break

        # Append issues to spec for next iteration
        if review["issues"]:
            issue_summary = "\n".join(
                f"- [{r['severity']}] {r['message']}" for r in review["issues"]
            )
            spec = f"{spec}\n\n## Issues to fix (iteration {i + 1}):\n{issue_summary}"

    return codebase


@router.post("/start")
async def start_prototype(request: PrototypeRequest):
    async def generate():
        events = asyncio.Queue()

        async def stream_callback(event_type: str, data):
            await events.put((event_type, data))

        # Generate tech spec if not provided
        tech_spec = request.tech_spec
        if not tech_spec or tech_spec.strip() == "":
            tech_spec = await cto.generate_tech_spec(request.idea, request.research_summary)
            yield f"data: {json.dumps({'agent': 'CTO', 'type': 'tech_spec', 'content': tech_spec})}\n\n"

        # Run prototype loop in background, stream events
        loop_task = asyncio.create_task(
            prototype_loop(tech_spec, None, stream_callback)
        )

        while not loop_task.done():
            try:
                event_type, data = await asyncio.wait_for(events.get(), timeout=0.1)
                if event_type == "build_token" or event_type == "fix_token":
                    yield f"data: {json.dumps({'agent': data.get('agent', 'SWE1'), 'type': event_type, 'token': data.get('token', '')})}\n\n"
                elif event_type == "review_token":
                    yield f"data: {json.dumps({'agent': data.get('agent', 'SWE2'), 'type': 'review_token', 'token': data.get('token', '')})}\n\n"
                elif event_type == "file":
                    yield f"data: {json.dumps({'agent': 'SWE1', 'type': 'file', 'name': data['name'], 'content': data['content']})}\n\n"
                elif event_type == "approved":
                    yield f"data: {json.dumps({'agent': 'SWE2', 'type': 'approved', 'message': data['message']})}\n\n"
            except asyncio.TimeoutError:
                continue

        # Drain remaining events
        while not events.empty():
            event_type, data = await events.get()
            if event_type == "file":
                yield f"data: {json.dumps({'agent': 'SWE1', 'type': 'file', 'name': data['name'], 'content': data['content']})}\n\n"
            elif event_type == "approved":
                yield f"data: {json.dumps({'agent': 'SWE2', 'type': 'approved', 'message': data['message']})}\n\n"

        codebase = await loop_task
        mvp_port = await launch_mvp_server(codebase)

        yield f"data: {json.dumps({'type': 'stage_complete', 'mvp_port': mvp_port, 'mvp_url': f'http://localhost:{mvp_port}'})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@router.post("/refine")
async def refine_prototype(request: RefineRequest):
    async def generate():
        events = asyncio.Queue()

        async def stream_callback(event_type: str, data):
            await events.put((event_type, data))

        updated_spec = f"{request.tech_spec}\n\n## User feedback:\n{request.user_feedback}"

        loop_task = asyncio.create_task(
            prototype_loop(updated_spec, request.codebase, stream_callback)
        )

        while not loop_task.done():
            try:
                event_type, data = await asyncio.wait_for(events.get(), timeout=0.1)
                if event_type in ("build_token", "fix_token"):
                    yield f"data: {json.dumps({'agent': data.get('agent', 'SWE1'), 'type': event_type, 'token': data.get('token', '')})}\n\n"
                elif event_type == "review_token":
                    yield f"data: {json.dumps({'agent': data.get('agent', 'SWE2'), 'type': 'review_token', 'token': data.get('token', '')})}\n\n"
                elif event_type == "file":
                    yield f"data: {json.dumps({'agent': 'SWE1', 'type': 'file', 'name': data['name'], 'content': data['content']})}\n\n"
                elif event_type == "approved":
                    yield f"data: {json.dumps({'agent': 'SWE2', 'type': 'approved', 'message': data['message']})}\n\n"
            except asyncio.TimeoutError:
                continue

        while not events.empty():
            event_type, data = await events.get()
            if event_type == "file":
                yield f"data: {json.dumps({'agent': 'SWE1', 'type': 'file', 'name': data['name'], 'content': data['content']})}\n\n"
            elif event_type == "approved":
                yield f"data: {json.dumps({'agent': 'SWE2', 'type': 'approved', 'message': data['message']})}\n\n"

        codebase = await loop_task
        mvp_port = await launch_mvp_server(codebase)

        yield f"data: {json.dumps({'type': 'stage_complete', 'mvp_port': mvp_port, 'mvp_url': f'http://localhost:{mvp_port}'})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
