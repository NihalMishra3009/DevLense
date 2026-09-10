import os
from typing import List, Dict, Any
from app.core.constants import ALLOWED_EXTENSIONS, IGNORED_DIRECTORIES, IGNORED_FILES, SKIPPED_BINARY_EXTENSIONS
from app.core.config import settings

def is_allowed_file(file_path: str, size_bytes: int = 0) -> bool:
    """
    Checks if a given file path should be ingested based on extension, directory, and size rules.
    """
    normalized_path = file_path.replace("\\", "/").strip("/")
    parts = normalized_path.split("/")
    filename = parts[-1]
    
    # Check ignored directories in path
    for part in parts[:-1]:
        if part in IGNORED_DIRECTORIES or part.startswith("."):
            return False
            
    # Check ignored files
    if filename in IGNORED_FILES:
        return False
        
    _, ext = os.path.splitext(filename.lower())
    
    # Skip binaries
    if ext in SKIPPED_BINARY_EXTENSIONS:
        return False
        
    # Check allowed extensions
    if ext not in ALLOWED_EXTENSIONS:
        return False
        
    # Check max file size
    if size_bytes > settings.MAX_FILE_SIZE_KB * 1024:
        return False
        
    return True

def filter_repository_tree(tree_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Filters a GitHub Git tree list of blobs to valid files for ingestion.
    """
    filtered = []
    for item in tree_items:
        if item.get("type") == "blob":
            path = item.get("path", "")
            size = item.get("size", 0)
            if is_allowed_file(path, size):
                filtered.append(item)
                if len(filtered) >= settings.MAX_INDEXED_FILES:
                    break
    return filtered
