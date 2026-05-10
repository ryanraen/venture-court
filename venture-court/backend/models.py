from pydantic import BaseModel
from typing import Optional


class AgentRequestBody(BaseModel):
    type: str  # 'lens' | 'synthesis'
    agentRole: str  # 'cmo' | 'cto' | 'contrarian' | 'ceo'
    lens: Optional[str] = None
    idea: str = ""
    context: str = ""
    niaResults: Optional[str] = None
    blueprint: Optional[object] = None


class FileToGenerate(BaseModel):
    path: str
    purpose: str
    dependencies: list[str] = []


class GeneratedFile(BaseModel):
    path: str
    content: str


class ClodRequestBody(BaseModel):
    type: str  # 'lens' | 'synthesis' | 'generate'
    agentRole: str  # 'swe1' | 'swe2'
    lens: Optional[str] = None
    blueprint: Optional[dict] = None
    generatedFiles: Optional[list[GeneratedFile]] = None
    swe2Feedback: Optional[str] = None
    fileToGenerate: Optional[FileToGenerate] = None


class NiaRequestBody(BaseModel):
    query: str
    outputFormat: str = ""


class GithubRequestBody(BaseModel):
    operation: str  # 'getHeadSha' | 'createBranch' | 'pushFile' | 'createPR'
    token: Optional[str] = None
    repo: Optional[str] = None
    branch: Optional[str] = None
    sha: Optional[str] = None
    path: Optional[str] = None
    content: Optional[str] = None
    message: Optional[str] = None
    title: Optional[str] = None
    body: Optional[str] = None
    head: Optional[str] = None
    base: Optional[str] = None


class ApiError(BaseModel):
    error: str
    code: str
