import re
from typing import Tuple, Optional

GITHUB_URL_PATTERN = re.compile(
    r"^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)(?:\.git|\/.*)?$"
)

def parse_github_url(url: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Parses a GitHub repository URL into (owner, repo).
    Returns (None, None) if the URL is invalid.
    """
    cleaned = url.strip()
    match = GITHUB_URL_PATTERN.match(cleaned)
    if not match:
        return None, None
    
    owner = match.group(1)
    repo = match.group(2)
    # Strip any trailing .git
    if repo.endswith(".git"):
        repo = repo[:-4]
    return owner, repo
