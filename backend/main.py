from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import ideation, research, prototyping


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(title="Venture Court API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ideation.router, prefix="/api/ideation")
app.include_router(research.router, prefix="/api/research")
app.include_router(prototyping.router, prefix="/api/prototype")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "venture-court"}
