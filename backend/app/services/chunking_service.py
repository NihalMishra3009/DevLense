import re
from typing import List
from app.models.repository import CodeChunk
from app.utils.language import detect_language

class ChunkingService:
    def __init__(self, target_chunk_lines: int = 50, max_chunk_lines: int = 100, overlap_lines: int = 10):
        self.target_chunk_lines = target_chunk_lines
        self.max_chunk_lines = max_chunk_lines
        self.overlap_lines = overlap_lines

    def chunk_file(self, repo_id: str, file_path: str, content: str) -> List[CodeChunk]:
        """
        Chunks code logically based on functions, classes, markdown sections, or line blocks.
        Preserves start_line, end_line, language, and chunk_type.
        """
        if not content.strip():
            return []
            
        language = detect_language(file_path)
        lines = content.splitlines()
        total_lines = len(lines)
        
        if total_lines <= self.max_chunk_lines:
            return [
                CodeChunk(
                    id=f"{repo_id}:{file_path}:1-{total_lines}",
                    repository=repo_id,
                    file_path=file_path,
                    language=language,
                    start_line=1,
                    end_line=total_lines,
                    chunk_type="full_file",
                    content=content,
                    symbols=self._extract_symbols(content, language)
                )
            ]

        # Chunking using boundary detection
        chunks: List[CodeChunk] = []
        if language in ("python", "javascript", "typescript", "typescriptreact", "javascriptreact", "go", "rust", "java", "cpp", "c"):
            chunks = self._chunk_code_by_boundaries(repo_id, file_path, language, lines)
        elif language == "markdown":
            chunks = self._chunk_markdown(repo_id, file_path, language, lines)
            
        # Fallback to sliding window if semantic boundaries produced nothing or huge chunk
        if not chunks:
            chunks = self._chunk_by_sliding_window(repo_id, file_path, language, lines)
            
        return chunks

    def _extract_symbols(self, code: str, language: str) -> List[str]:
        symbols = set()
        if language == "python":
            for match in re.finditer(r"^(?:def|class)\s+([a-zA-Z0-9_]+)", code, re.MULTILINE):
                symbols.add(match.group(1))
        elif language in ("javascript", "typescript", "typescriptreact", "javascriptreact"):
            for match in re.finditer(r"(?:function|class|const|let|var)\s+([a-zA-Z0-9_]+)\s*(?:=|=>|\()", code):
                symbols.add(match.group(1))
        elif language == "go":
            for match in re.finditer(r"func\s+(?:\([^\)]+\)\s+)?([a-zA-Z0-9_]+)", code):
                symbols.add(match.group(1))
        return list(symbols)[:10]

    def _chunk_code_by_boundaries(self, repo_id: str, file_path: str, language: str, lines: List[str]) -> List[CodeChunk]:
        chunks: List[CodeChunk] = []
        boundaries = [0]
        
        # Regex patterns for function/class starts
        if language == "python":
            pattern = re.compile(r"^(?:def|class|async\s+def)\s+")
        elif language in ("javascript", "typescript", "typescriptreact", "javascriptreact"):
            pattern = re.compile(r"^(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function|class|const\s+[A-Za-z0-9_]+\s*=\s*(?:async\s*)?\()")
        elif language == "go":
            pattern = re.compile(r"^func\s+")
        else:
            pattern = re.compile(r"^(?:public|private|protected|fn|func|def|class)\s+")

        for idx, line in enumerate(lines):
            if idx > 0 and pattern.match(line.lstrip()):
                # Avoid tiny chunks
                if idx - boundaries[-1] >= 20:
                    boundaries.append(idx)

        boundaries.append(len(lines))

        # Group boundaries into manageable chunks
        for i in range(len(boundaries) - 1):
            start_idx = boundaries[i]
            end_idx = boundaries[i + 1]
            
            # If segment is too large, sub-chunk it
            if end_idx - start_idx > self.max_chunk_lines:
                sub_chunks = self._chunk_by_sliding_window(
                    repo_id, file_path, language, lines[start_idx:end_idx], line_offset=start_idx
                )
                chunks.extend(sub_chunks)
            else:
                chunk_lines = lines[start_idx:end_idx]
                chunk_content = "\n".join(chunk_lines)
                start_line = start_idx + 1
                end_line = end_idx
                chunks.append(
                    CodeChunk(
                        id=f"{repo_id}:{file_path}:{start_line}-{end_line}",
                        repository=repo_id,
                        file_path=file_path,
                        language=language,
                        start_line=start_line,
                        end_line=end_line,
                        chunk_type="block",
                        content=chunk_content,
                        symbols=self._extract_symbols(chunk_content, language)
                    )
                )

        return chunks

    def _chunk_markdown(self, repo_id: str, file_path: str, language: str, lines: List[str]) -> List[CodeChunk]:
        chunks: List[CodeChunk] = []
        boundaries = [0]
        heading_pattern = re.compile(r"^#{1,3}\s+")

        for idx, line in enumerate(lines):
            if idx > 0 and heading_pattern.match(line):
                if idx - boundaries[-1] >= 15:
                    boundaries.append(idx)

        boundaries.append(len(lines))
        for i in range(len(boundaries) - 1):
            start_idx = boundaries[i]
            end_idx = boundaries[i + 1]
            chunk_content = "\n".join(lines[start_idx:end_idx])
            start_line = start_idx + 1
            end_line = end_idx
            chunks.append(
                CodeChunk(
                    id=f"{repo_id}:{file_path}:{start_line}-{end_line}",
                    repository=repo_id,
                    file_path=file_path,
                    language=language,
                    start_line=start_line,
                    end_line=end_line,
                    chunk_type="markdown_section",
                    content=chunk_content,
                    symbols=[]
                )
            )
        return chunks

    def _chunk_by_sliding_window(
        self, repo_id: str, file_path: str, language: str, lines: List[str], line_offset: int = 0
    ) -> List[CodeChunk]:
        chunks: List[CodeChunk] = []
        total = len(lines)
        step = self.target_chunk_lines - self.overlap_lines
        if step <= 0:
            step = 30
            
        for i in range(0, total, step):
            end_i = min(i + self.target_chunk_lines, total)
            chunk_lines = lines[i:end_i]
            if not chunk_lines:
                continue
            chunk_content = "\n".join(chunk_lines)
            start_line = line_offset + i + 1
            end_line = line_offset + end_i
            chunks.append(
                CodeChunk(
                    id=f"{repo_id}:{file_path}:{start_line}-{end_line}",
                    repository=repo_id,
                    file_path=file_path,
                    language=language,
                    start_line=start_line,
                    end_line=end_line,
                    chunk_type="code_window",
                    content=chunk_content,
                    symbols=self._extract_symbols(chunk_content, language)
                )
            )
            if end_i == total:
                break
        return chunks

chunking_service = ChunkingService()
