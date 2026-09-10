import re
from typing import List, Dict, Any, Optional
from app.vectorstore.chroma_store import chroma_store

class RetrievalService:
    def __init__(self):
        pass

    def hybrid_search(
        self,
        repo_id: str,
        query: str,
        top_k: int = 8,
        path_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Hybrid retrieval combining:
        1. Dense Vector Semantic Search
        2. Lexical & Keyword Matching (BM25-style keyword boosting)
        3. Filename & Path Scoring
        4. Symbol Matching
        """
        # 1. Semantic search from ChromaDB
        semantic_results = chroma_store.search(repo_id, query, top_k=top_k * 2)
        
        # 2. Extract query keywords
        raw_keywords = re.findall(r"[a-zA-Z0-9_\-\.]+", query.lower())
        keywords = [k for k in raw_keywords if len(k) > 2 and k not in {"what", "where", "how", "does", "the", "is", "for", "with", "this", "that"}]
        
        # 3. Score and rerank results
        scored_candidates = {}
        for item in semantic_results:
            chunk_id = item["id"]
            content = item["content"].lower()
            metadata = item.get("metadata", {})
            file_path = metadata.get("file_path", "").lower()
            symbols = metadata.get("symbols", "").lower().split(",")
            
            # Base semantic score (1 - normalized distance)
            distance = item.get("distance", 1.0)
            base_score = max(0.0, 1.0 - (distance / 2.0))
            
            keyword_score = 0.0
            for kw in keywords:
                # Exact file path match boost
                if kw in file_path:
                    keyword_score += 1.5
                # Exact symbol match boost
                if any(kw == s.strip() for s in symbols if s):
                    keyword_score += 2.0
                # Content frequency boost
                count = content.count(kw)
                if count > 0:
                    keyword_score += min(count * 0.2, 1.0)
                    
            final_score = base_score + keyword_score
            scored_candidates[chunk_id] = {
                "item": item,
                "score": final_score
            }
            
        # 4. If keywords had specific paths, do direct chunk inspection fallback
        all_chunks = chroma_store.get_all_chunks(repo_id)
        for chunk in all_chunks:
            chunk_id = chunk["id"]
            if chunk_id in scored_candidates:
                continue
            metadata = chunk.get("metadata", {})
            file_path = metadata.get("file_path", "").lower()
            content = chunk.get("content", "").lower()
            symbols = metadata.get("symbols", "").lower().split(",")
            
            score = 0.0
            for kw in keywords:
                if kw in file_path:
                    score += 1.8
                if any(kw == s.strip() for s in symbols if s):
                    score += 2.2
                if kw in content:
                    score += 0.3
                    
            if score > 1.5:
                scored_candidates[chunk_id] = {
                    "item": chunk,
                    "score": score
                }
                
        # Sort by total score descending
        sorted_results = sorted(scored_candidates.values(), key=lambda x: x["score"], reverse=True)
        return [res["item"] for res in sorted_results[:top_k]]

retrieval_service = RetrievalService()
