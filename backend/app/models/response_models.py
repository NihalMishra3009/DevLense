from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class HealthResponse(BaseModel):
    status: str = "healthy"
    timestamp: str
    version: str = "1.0.0"

class Citation(BaseModel):
    file: str
    start_line: int
    end_line: int
    snippet: Optional[str] = None
    language: Optional[str] = None

class IndexResponse(BaseModel):
    id: str
    status: str
    file_count: int
    chunk_count: int
    languages: Dict[str, int]
    message: str

class AskResponse(BaseModel):
    answer: str
    intent: str
    sources: List[Citation] = Field(default_factory=list)

class ProjectSummaryResponse(BaseModel):
    purpose: str
    tech_stack: List[str]
    architecture: str
    major_modules: List[str]
    entry_points: List[str]
    dependencies: List[str]
    raw_markdown: str

class ReadingOrderItem(BaseModel):
    step: int
    file: str
    reason: str

class OnboardingResponse(BaseModel):
    overview: str
    architecture: str
    getting_started: str
    reading_order: List[ReadingOrderItem]
    key_modules: List[str]
    raw_markdown: str

class FeaturePlanResponse(BaseModel):
    feature: str
    current_architecture: str
    affected_files: List[str]
    reusable_components: List[str]
    new_components: List[str]
    implementation_steps: List[str]
    considerations: List[str]
    sources: List[Citation] = Field(default_factory=list)

class StructureResponse(BaseModel):
    overview: str
    directory_tree: Dict[str, Any]
    entry_points: List[str]
    modules: List[Dict[str, Any]]

class FileViewerResponse(BaseModel):
    path: str
    language: str
    content: str
    lines: int

class ErrorDetails(BaseModel):
    code: str
    message: str

class ErrorResponse(BaseModel):
    error: ErrorDetails
