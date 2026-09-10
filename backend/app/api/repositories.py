from fastapi import APIRouter, HTTPException, Query
from app.models.request_models import ConnectRepositoryRequest, AskQuestionRequest, FeaturePlanRequest
from app.models.response_models import (
    IndexResponse, AskResponse, ProjectSummaryResponse, OnboardingResponse,
    FeaturePlanResponse, StructureResponse, FileViewerResponse
)
from app.models.repository import RepositoryMetadata
from app.utils.github_url import parse_github_url
from app.services.github_service import github_service
from app.services.ingestion_service import ingestion_service
from app.services.analysis_service import analysis_service
from app.vectorstore.chroma_store import chroma_store
from app.ai.graph import agent_graph

router = APIRouter(prefix="/repositories", tags=["Repositories"])

@router.get("/user-repos")
async def get_user_repos(
    username: str = Query("", description="GitHub username to search"),
    token: str = Query(None, description="Optional GitHub Personal Access Token")
):
    try:
        repos = await github_service.get_user_repositories(username, token=token)
        return {"username": username, "repositories": repos}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"code": "GITHUB_FETCH_ERROR", "message": str(e)})

@router.post("/connect", response_model=RepositoryMetadata)
async def connect_repository(req: ConnectRepositoryRequest):
    owner, repo = parse_github_url(req.url)
    if not owner or not repo:
        raise HTTPException(
            status_code=400,
            detail={"code": "INVALID_REPOSITORY_URL", "message": "Invalid GitHub repository URL format."}
        )
        
    try:
        metadata = await github_service.get_repository_info(owner, repo)
        ingestion_service.register_repository(metadata)
        return metadata
    except ValueError as e:
        code = str(e)
        msg = "Repository could not be found." if code == "GITHUB_REPOSITORY_NOT_FOUND" else "GitHub rate limit exceeded or access forbidden."
        raise HTTPException(status_code=404 if code == "GITHUB_REPOSITORY_NOT_FOUND" else 403, detail={"code": code, "message": msg})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"code": "GITHUB_ERROR", "message": str(e)})

@router.post("/{id}/index", response_model=IndexResponse)
async def index_repository(id: str):
    try:
        repo = await ingestion_service.index_repository(id)
        return IndexResponse(
            id=repo.id,
            status=repo.status,
            file_count=repo.file_count,
            chunk_count=repo.chunk_count,
            languages=repo.languages,
            message="Indexing completed successfully."
        )
    except KeyError:
        raise HTTPException(status_code=404, detail={"code": "REPOSITORY_NOT_FOUND", "message": f"Repository '{id}' not found. Please connect it on the home page."})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail={"code": "INDEXING_FAILED", "message": str(e)})

@router.get("/{id}", response_model=RepositoryMetadata)
async def get_repository(id: str):
    try:
        return await ingestion_service.get_or_resolve_repository(id)
    except KeyError:
        raise HTTPException(status_code=404, detail={"code": "REPOSITORY_NOT_FOUND", "message": f"Repository '{id}' not found. Please connect it on the home page."})

@router.post("/{id}/ask", response_model=AskResponse)
async def ask_repository(id: str, req: AskQuestionRequest):
    try:
        repo = await ingestion_service.get_or_resolve_repository(id)
        if repo.status != "ready":
            all_chunks = chroma_store.get_all_chunks(id)
            if all_chunks:
                repo.status = "ready"
                repo.chunk_count = len(all_chunks)
            else:
                raise HTTPException(
                    status_code=400,
                    detail={
                        "code": "REPOSITORY_NOT_READY",
                        "message": "Repository is not indexed yet. Please click 'Start Indexing' on the Dashboard first."
                    }
                )
        return agent_graph.execute_ask(id, req.question, top_k=req.top_k or 8, history=req.history)
    except KeyError:
        raise HTTPException(status_code=404, detail={"code": "REPOSITORY_NOT_FOUND", "message": f"Repository '{id}' not found."})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"code": "QUERY_ERROR", "message": str(e)})

@router.post("/{id}/summary", response_model=ProjectSummaryResponse)
async def get_summary(id: str):
    try:
        await ingestion_service.get_or_resolve_repository(id)
        return analysis_service.generate_summary(id)
    except KeyError:
        raise HTTPException(status_code=404, detail={"code": "REPOSITORY_NOT_FOUND", "message": f"Repository '{id}' not found."})

@router.post("/{id}/onboarding", response_model=OnboardingResponse)
async def get_onboarding(id: str):
    try:
        await ingestion_service.get_or_resolve_repository(id)
        return analysis_service.generate_onboarding(id)
    except KeyError:
        raise HTTPException(status_code=404, detail={"code": "REPOSITORY_NOT_FOUND", "message": f"Repository '{id}' not found."})

@router.post("/{id}/feature-plan", response_model=FeaturePlanResponse)
async def create_feature_plan(id: str, req: FeaturePlanRequest):
    try:
        await ingestion_service.get_or_resolve_repository(id)
        return analysis_service.generate_feature_plan(id, req.feature_request)
    except KeyError:
        raise HTTPException(status_code=404, detail={"code": "REPOSITORY_NOT_FOUND", "message": f"Repository '{id}' not found."})

@router.get("/{id}/structure", response_model=StructureResponse)
async def get_structure(id: str):
    try:
        await ingestion_service.get_or_resolve_repository(id)
        return analysis_service.get_structure_analysis(id)
    except KeyError:
        raise HTTPException(status_code=404, detail={"code": "REPOSITORY_NOT_FOUND", "message": f"Repository '{id}' not found."})

@router.get("/{id}", response_model=RepositoryMetadata)
async def get_repository(id: str):
    try:
        return await ingestion_service.get_or_resolve_repository(id)
    except KeyError:
        raise HTTPException(status_code=404, detail={"code": "REPOSITORY_NOT_FOUND", "message": f"Repository '{id}' not found."})

@router.get("/{id}/file", response_model=FileViewerResponse)
async def get_file_content(id: str, path: str = Query(..., description="File path in repository")):
    try:
        repo = await ingestion_service.get_or_resolve_repository(id)
        content = await github_service.fetch_file_content(repo.owner, repo.name, repo.default_branch, path)
        if content is None:
            raise HTTPException(status_code=404, detail={"code": "FILE_NOT_FOUND", "message": f"File '{path}' could not be fetched."})
        from app.utils.language import detect_language
        return FileViewerResponse(
            path=path,
            language=detect_language(path),
            content=content,
            lines=len(content.splitlines())
        )
    except KeyError:
        raise HTTPException(status_code=404, detail={"code": "REPOSITORY_NOT_FOUND", "message": f"Repository '{id}' not found."})
