import os
import chromadb
from chromadb.config import Settings as ChromaSettings
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.models.repository import CodeChunk
from app.services.embedding_service import embedding_service

class ChromaStore:
    def __init__(self):
        os.makedirs(settings.CHROMA_PERSIST_DIRECTORY, exist_ok=True)
        self.client = chromadb.PersistentClient(
            path=settings.CHROMA_PERSIST_DIRECTORY,
            settings=ChromaSettings(anonymized_telemetry=False)
        )

    def _get_collection_name(self, repo_id: str) -> str:
        # Chroma collection names must be 3-63 chars, alphanumeric with - or _
        safe_name = f"repo_{repo_id}"[:60]
        return safe_name

    def get_or_create_collection(self, repo_id: str):
        col_name = self._get_collection_name(repo_id)
        return self.client.get_or_create_collection(
            name=col_name,
            metadata={"repository_id": repo_id}
        )

    def add_chunks(self, repo_id: str, chunks: List[CodeChunk]):
        if not chunks:
            return
            
        collection = self.get_or_create_collection(repo_id)
        
        # Batch add
        batch_size = 100
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i + batch_size]
            ids = [c.id for c in batch]
            documents = [c.content for c in batch]
            metadatas = [
                {
                    "repository": c.repository,
                    "file_path": c.file_path,
                    "language": c.language,
                    "start_line": c.start_line,
                    "end_line": c.end_line,
                    "chunk_type": c.chunk_type,
                    "symbols": ",".join(c.symbols)
                }
                for c in batch
            ]
            embeddings = embedding_service.get_embeddings(documents)
            
            collection.upsert(
                ids=ids,
                documents=documents,
                metadatas=metadatas,
                embeddings=embeddings
            )

    def search(self, repo_id: str, query: str, top_k: int = 8, where_filter: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        collection = self.get_or_create_collection(repo_id)
        if collection.count() == 0:
            return []
            
        query_embedding = embedding_service.get_query_embedding(query)
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=min(top_k, collection.count()),
            where=where_filter,
            include=["documents", "metadatas", "distances"]
        )
        
        formatted = []
        if results and results.get("documents") and results["documents"][0]:
            docs = results["documents"][0]
            metas = results["metadatas"][0]
            dists = results["distances"][0] if "distances" in results else [0.0] * len(docs)
            ids = results["ids"][0]
            
            for idx in range(len(docs)):
                formatted.append({
                    "id": ids[idx],
                    "content": docs[idx],
                    "metadata": metas[idx],
                    "distance": dists[idx]
                })
        return formatted

    def get_all_chunks(self, repo_id: str) -> List[Dict[str, Any]]:
        collection = self.get_or_create_collection(repo_id)
        count = collection.count()
        if count == 0:
            return []
        data = collection.get(include=["documents", "metadatas"])
        chunks = []
        for idx, doc in enumerate(data.get("documents", [])):
            chunks.append({
                "id": data["ids"][idx],
                "content": doc,
                "metadata": data["metadatas"][idx]
            })
        return chunks

    def delete_collection(self, repo_id: str):
        col_name = self._get_collection_name(repo_id)
        try:
            self.client.delete_collection(name=col_name)
        except Exception:
            pass

chroma_store = ChromaStore()
