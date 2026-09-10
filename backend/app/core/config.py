from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "DevLense"
    API_V1_STR: str = "/api"
    GITHUB_TOKEN: Optional[str] = None
    
    # LLM & Embedding Settings
    LLM_PROVIDER: str = "openai" # "openai", "ollama", "fallback"
    OPENAI_API_KEY: Optional[str] = None
    LLM_MODEL: str = "gpt-4o-mini"
    
    EMBEDDING_PROVIDER: str = "openai" # "openai", "fastembed", "fallback"
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    
    CHROMA_PERSIST_DIRECTORY: str = "./data/chroma"
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    
    # Ingestion constraints
    MAX_FILE_SIZE_KB: int = 500
    MAX_INDEXED_FILES: int = 1000
    
    # Retrieval defaults
    DEFAULT_TOP_K: int = 8

    model_config = {
        "env_file": ".env",
        "extra": "allow"
    }

settings = Settings()
