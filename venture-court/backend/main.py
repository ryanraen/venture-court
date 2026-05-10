from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.agent import router as agent_router
from routes.clod import router as clod_router
from routes.nia import router as nia_router
from routes.github import router as github_router

app = FastAPI(title="Venture Court API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agent_router)
app.include_router(clod_router)
app.include_router(nia_router)
app.include_router(github_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
