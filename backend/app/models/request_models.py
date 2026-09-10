from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ConnectRepositoryRequest(BaseModel):
    url: str = Field(..., description="GitHub repository URL")

class ChatMessage(BaseModel):
    role: str = Field(..., description="user or assistant")
    content: str = Field(..., description="Message text")

class AskQuestionRequest(BaseModel):
    question: str = Field(..., description="Question to ask about the repository")
    top_k: Optional[int] = Field(default=8, description="Number of source chunks to retrieve")
    history: Optional[List[ChatMessage]] = Field(default_factory=list, description="Prior conversation messages")

class FeaturePlanRequest(BaseModel):
    feature_request: str = Field(..., description="Feature proposal or user story to plan")
    history: Optional[List[ChatMessage]] = Field(default_factory=list, description="Prior conversation messages")
