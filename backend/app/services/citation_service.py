from typing import List, Dict, Any
from app.models.response_models import Citation

class CitationService:
    def __init__(self):
        pass

    def build_citations_from_chunks(self, retrieved_chunks: List[Dict[str, Any]]) -> List[Citation]:
        """
        Validates and builds citations directly from actual retrieved chunks.
        Ensures ground truth mapping of file, start_line, end_line, and code snippets.
        """
        citations: List[Citation] = []
        seen = set()

        for chunk in retrieved_chunks:
            meta = chunk.get("metadata", {})
            file_path = meta.get("file_path")
            start_line = int(meta.get("start_line", 1))
            end_line = int(meta.get("end_line", 1))
            language = meta.get("language", "text")
            content = chunk.get("content", "")
            
            if not file_path:
                continue
                
            key = (file_path, start_line, end_line)
            if key in seen:
                continue
            seen.add(key)
            
            # Extract clean snippet preview (first 5 lines max)
            snippet_lines = content.splitlines()[:6]
            snippet = "\n".join(snippet_lines)
            
            citations.append(
                Citation(
                    file=file_path,
                    start_line=start_line,
                    end_line=end_line,
                    snippet=snippet,
                    language=language
                )
            )
            
        return citations

    def validate_citations_in_text(self, text: str, citations: List[Citation]) -> List[Citation]:
        """
        Filters citations to prioritize files explicitly mentioned in the LLM response text,
        or retains top grounding citations.
        """
        if not citations:
            return []
            
        relevant = []
        for c in citations:
            # If the response mentions the file basename or full path
            basename = c.file.split("/")[-1]
            if c.file in text or basename in text:
                relevant.append(c)
                
        # If none matched text explicitly, retain the top 3 grounding source citations
        if not relevant:
            relevant = citations[:3]
            
        return relevant

citation_service = CitationService()
