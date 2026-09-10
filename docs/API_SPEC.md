# DevLense — API Specification

## Base URL
`/api`

## Endpoints

### 1. Health Check
`GET /api/health`
- **Response**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-09-11T00:00:00Z",
    "version": "1.0.0"
  }
  ```

### 2. Connect Repository
`POST /api/repositories/connect`
- **Request**:
  ```json
  {
    "url": "https://github.com/owner/repo"
  }
  ```
- **Response**:
  ```json
  {
    "id": "owner_repo",
    "name": "repo",
    "owner": "owner",
    "url": "https://github.com/owner/repo",
    "default_branch": "main",
    "status": "connected",
    "description": "Repo description",
    "created_at": "2026-09-11T00:00:00Z"
  }
  ```

### 3. Index Repository
`POST /api/repositories/{id}/index`
- **Response**:
  ```json
  {
    "id": "owner_repo",
    "status": "ready",
    "file_count": 45,
    "chunk_count": 182,
    "languages": {
      "python": 30,
      "typescript": 15
    },
    "message": "Indexing completed successfully."
  }
  ```

### 4. Get Repository Details
`GET /api/repositories/{id}`
- **Response**:
  ```json
  {
    "id": "owner_repo",
    "name": "repo",
    "owner": "owner",
    "url": "https://github.com/owner/repo",
    "status": "ready",
    "file_count": 45,
    "chunk_count": 182,
    "languages": { "python": 30, "typescript": 15 },
    "tree": [
      { "path": "backend/main.py", "type": "file", "size": 1200 }
    ]
  }
  ```

### 5. Ask Repository
`POST /api/repositories/{id}/ask`
- **Request**:
  ```json
  {
    "question": "Where is login implemented?",
    "top_k": 8
  }
  ```
- **Response**:
  ```json
  {
    "answer": "Authentication is handled in `backend/routes/auth.py`...",
    "intent": "DISCOVERY",
    "sources": [
      {
        "file": "backend/routes/auth.py",
        "start_line": 42,
        "end_line": 68,
        "snippet": "def login(...):"
      }
    ]
  }
  ```

### 6. Project Summary
`POST /api/repositories/{id}/summary`
- **Response**:
  ```json
  {
    "purpose": "E-commerce backend service",
    "tech_stack": ["FastAPI", "PostgreSQL", "Docker"],
    "architecture": "Layered architecture with routes, services, and models",
    "entry_points": ["backend/main.py"],
    "major_modules": ["auth", "catalog", "orders"],
    "dependencies": ["fastapi", "pydantic", "sqlalchemy"],
    "raw_markdown": "# Project Summary\n..."
  }
  ```

### 7. Developer Onboarding
`POST /api/repositories/{id}/onboarding`
- **Response**:
  ```json
  {
    "overview": "...",
    "architecture": "...",
    "getting_started": "...",
    "reading_order": [
      { "step": 1, "file": "README.md", "reason": "High-level overview" },
      { "step": 2, "file": "backend/main.py", "reason": "Application entry point" }
    ],
    "key_modules": ["auth", "api", "database"],
    "raw_markdown": "# Developer Onboarding Guide\n..."
  }
  ```

### 8. Feature Planning
`POST /api/repositories/{id}/feature-plan`
- **Request**:
  ```json
  {
    "feature_request": "How would I add Google OAuth?"
  }
  ```
- **Response**:
  ```json
  {
    "feature": "Google OAuth Authentication",
    "current_architecture": "...",
    "affected_files": ["backend/routes/auth.py", "backend/core/config.py"],
    "reusable_components": ["JWT token generator"],
    "new_components": ["Google OAuth client handler"],
    "implementation_steps": [
      "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to environment config",
      "Create Google OAuth login route in backend/routes/auth.py",
      "Issue JWT token on valid Google callback"
    ],
    "considerations": ["Handle token refresh and account linking"],
    "sources": []
  }
  ```

### 9. Repository Structure
`GET /api/repositories/{id}/structure`
- **Response**:
  ```json
  {
    "overview": "...",
    "directory_tree": {},
    "entry_points": ["backend/main.py"],
    "modules": []
  }
  ```

### 10. File Source Viewer
`GET /api/repositories/{id}/file?path=backend/main.py`
- **Response**:
  ```json
  {
    "path": "backend/main.py",
    "language": "python",
    "content": "...",
    "lines": 120
  }
  ```
