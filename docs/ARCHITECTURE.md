# DevLense — Architecture Specification

## 1. System Architecture Diagram

```text
                    GitHub Repository
                           │
                           ▼
                  Repository Ingestion
                           │
                           ▼
                     File Filtering
                           │
                           ▼
                      Code Analysis
                           │
                 ┌─────────┴─────────┐
                 ▼                   ▼
           File Metadata        Code Chunks
                                     │
                                     ▼
                                Embeddings
                                     │
                                     ▼
                                 ChromaDB
                                     │
                                     ▼
                             Retrieval Layer (Semantic + BM25/Keyword + Path)
                                     │
                                     ▼
                              Intent Router
                                     │
                                     ▼
                             LangGraph Flow
                                     │
                                     ▼
                                    LLM
                                     │
                                     ▼
                            Citation Validation
                                     │
                                     ▼
                                FastAPI API
                                     │
                                     ▼
                              React Frontend
```

## 2. Component Specifications

### 2.1 Backend (FastAPI)
- **FastAPI / Uvicorn**: High-performance asynchronous REST API server.
- **Pydantic v2**: Strict schema validation for requests and responses.
- **ChromaDB**: Isolated vector collections per repository (`repository_{repo_id}`).
- **LangChain & LangGraph**: State machine orchestrating intent routing, query expansion, retrieval, LLM generation, and citation post-processing.
- **GitHub Service**: Retrieves file trees and raw file contents via GitHub REST API with caching.
- **Chunking Engine**: Preserves file path, start line, end line, chunk type, and code language.

### 2.2 Frontend (React + Vite)
- **Dark-First Design**: Palette anchored by `#09090B` background, `#111113` cards, `#27272A` borders, with subtle violet/indigo accents.
- **Typography**: Inter / Geist for UI elements and JetBrains Mono for code, citations, and file paths.
- **Views**:
  - **Landing**: URL input and repository connection.
  - **Indexing**: Real-time progress monitoring.
  - **Dashboard**: Repository stats, structure overview, quick question prompts.
  - **Ask Code**: Chat interface with interactive citation badges and snippet previews.
  - **Explore**: Interactive file tree and full-source syntax-highlighted viewer.
  - **Onboarding**: Formatted onboarding guide with recommended reading orders.
