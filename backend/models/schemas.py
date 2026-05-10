from pydantic import BaseModel


class IdeationRequest(BaseModel):
    idea: str


class ResearchRequest(BaseModel):
    idea: str
    ideation_verdict: str


class PrototypeRequest(BaseModel):
    idea: str
    research_summary: str
    tech_spec: str


class RefineRequest(BaseModel):
    codebase: dict
    tech_spec: str
    user_feedback: str
