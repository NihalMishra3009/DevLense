import os
from typing import List
from app.core.config import settings
import numpy as np

class EmbeddingService:
    def __init__(self):
        self.provider = settings.EMBEDDING_PROVIDER
        self.client = None
        self._init_client()

    def _init_client(self):
        if self.provider == "openai" and settings.OPENAI_API_KEY:
            try:
                from openai import OpenAI
                self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
            except Exception:
                self.client = None
        else:
            self.client = None

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []

        # If OpenAI is configured and working
        if self.client:
            try:
                # Clean texts of excessive newlines
                cleaned = [t.replace("\n", " ")[:8000] for t in texts]
                response = self.client.embeddings.create(
                    input=cleaned,
                    model=settings.EMBEDDING_MODEL
                )
                return [item.embedding for item in response.data]
            except Exception as e:
                print(f"[EmbeddingService] OpenAI embedding failed ({e}), falling back to deterministic local embedding.")
        
        # Fast, deterministic fallback embedding using hashing + character n-gram projections
        return [self._generate_fallback_embedding(t) for t in texts]

    def get_query_embedding(self, query: str) -> List[float]:
        return self.get_embeddings([query])[0]

    def _generate_fallback_embedding(self, text: str, dim: int = 384) -> List[float]:
        """
        Fast deterministic embedding generator for local / offline / fallback mode.
        Maps n-grams into a fixed-dimension normalized vector space.
        """
        vec = np.zeros(dim, dtype=np.float32)
        words = text.lower().split()
        for w in words:
            h = hash(w) % dim
            vec[h] += 1.0
            for i in range(len(w) - 2):
                ngram = w[i:i+3]
                h_ng = hash(ngram) % dim
                vec[h_ng] += 0.5
                
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

embedding_service = EmbeddingService()
