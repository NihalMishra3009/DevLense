import asyncio
from typing import Dict, Any, List
from app.models.repository import RepositoryMetadata, CodeChunk
from app.services.github_service import github_service
from app.services.chunking_service import chunking_service
from app.vectorstore.chroma_store import chroma_store
from app.utils.language import detect_language

class IngestionService:
    def __init__(self):
        # In-memory registry of connected repositories
        self.repositories: Dict[str, RepositoryMetadata] = {}

    def register_repository(self, metadata: RepositoryMetadata):
        self.repositories[metadata.id] = metadata

    async def get_or_resolve_repository(self, repo_id: str) -> RepositoryMetadata:
        if repo_id in self.repositories:
            return self.repositories[repo_id]
            
        # If repo is missing from memory (e.g. server restarted or page reloaded), reconstruct from repo_id
        if "_" in repo_id:
            parts = repo_id.split("_", 1)
            owner, repo = parts[0], parts[1]
            try:
                metadata = await github_service.get_repository_info(owner, repo)
                all_chunks = chroma_store.get_all_chunks(repo_id)
                if all_chunks:
                    metadata.status = "ready"
                    metadata.chunk_count = len(all_chunks)
                self.register_repository(metadata)
                return metadata
            except Exception:
                pass
                
        raise KeyError(f"Repository '{repo_id}' not found.")

    def get_repository(self, repo_id: str) -> RepositoryMetadata:
        if repo_id not in self.repositories:
            # Quick fallback if chroma chunks exist
            all_chunks = chroma_store.get_all_chunks(repo_id)
            if all_chunks and "_" in repo_id:
                parts = repo_id.split("_", 1)
                meta = RepositoryMetadata(
                    id=repo_id,
                    name=parts[1],
                    owner=parts[0],
                    url=f"https://github.com/{parts[0]}/{parts[1]}",
                    status="ready",
                    chunk_count=len(all_chunks)
                )
                self.register_repository(meta)
                return meta
            raise KeyError(f"Repository '{repo_id}' not found.")
        return self.repositories[repo_id]

    async def index_repository(self, repo_id: str) -> RepositoryMetadata:
        repo = self.get_repository(repo_id)
        repo.status = "indexing"
        
        try:
            # 1. Fetch filtered tree from GitHub
            tree_items = await github_service.get_repository_tree(repo.owner, repo.name, repo.default_branch)
            
            all_chunks: List[CodeChunk] = []
            language_counts: Dict[str, int] = {}
            
            # Fetch files in parallel batches of 10
            batch_size = 10
            for i in range(0, len(tree_items), batch_size):
                batch = tree_items[i:i + batch_size]
                tasks = [
                    github_service.fetch_file_content(repo.owner, repo.name, repo.default_branch, item["path"])
                    for item in batch
                ]
                contents = await asyncio.gather(*tasks)
                
                for item, content in zip(batch, contents):
                    if not content:
                        continue
                    file_path = item["path"]
                    lang = detect_language(file_path)
                    language_counts[lang] = language_counts.get(lang, 0) + 1
                    
                    chunks = chunking_service.chunk_file(repo.id, file_path, content)
                    all_chunks.extend(chunks)
                    
            # 2. Store all chunks in isolated ChromaDB collection
            chroma_store.add_chunks(repo.id, all_chunks)
            
            # 3. Update repository stats
            repo.file_count = len(tree_items)
            repo.chunk_count = len(all_chunks)
            repo.languages = language_counts
            repo.status = "ready"
            repo.error_message = None
            
            return repo
        except Exception as e:
            repo.status = "error"
            repo.error_message = str(e)
            raise e

ingestion_service = IngestionService()
