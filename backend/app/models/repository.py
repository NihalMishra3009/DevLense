from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class RepositoryMetadata(BaseModel):
    id: str
    name: str
    owner: str
    url: str
    default_branch: str = "main"
    description: Optional[str] = None
    language: Optional[str] = None
    stars: int = 0
    forks: int = 0
    open_issues: int = 0
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    status: str = "connected" # connected, indexing, ready, error
    file_count: int = 0
    chunk_count: int = 0
    languages: Dict[str, int] = Field(default_factory=dict)
    error_message: Optional[str] = None

class CodeChunk(BaseModel):
    id: str
    repository: str
    file_path: str
    language: str
    start_line: int
    end_line: int
    chunk_type: str # function, class, method, block, config, markdown
    content: str
    symbols: List[str] = Field(default_factory=list)
