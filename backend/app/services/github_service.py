import httpx
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.utils.file_filters import filter_repository_tree
from app.models.repository import RepositoryMetadata

class GitHubService:
    def __init__(self):
        self.base_url = "https://api.github.com"
        self.raw_base_url = "https://raw.githubusercontent.com"
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "DevLense-Codebase-Intelligence"
        }
        if settings.GITHUB_TOKEN:
            self.headers["Authorization"] = f"token {settings.GITHUB_TOKEN}"

    async def get_user_repositories(self, username: str, token: Optional[str] = None) -> List[Dict[str, Any]]:
        headers = dict(self.headers)
        if token and token.strip():
            headers["Authorization"] = f"token {token.strip()}"
            
        # If user passes token, they might want /user/repos or /users/{username}/repos
        if not username.strip() and token:
            url = f"{self.base_url}/user/repos?sort=updated&per_page=30&affiliation=owner,collaborator,organization_member"
        else:
            url = f"{self.base_url}/users/{username}/repos?sort=updated&per_page=30"

        async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code != 200:
                return []
            repos = resp.json()
            return [
                {
                    "name": r.get("name"),
                    "full_name": r.get("full_name"),
                    "url": r.get("html_url"),
                    "description": r.get("description"),
                    "language": r.get("language"),
                    "stars": r.get("stargazers_count", 0),
                    "private": r.get("private", False),
                    "default_branch": r.get("default_branch", "main")
                }
                for r in repos if isinstance(r, dict)
            ]

    async def get_repository_info(self, owner: str, repo: str) -> RepositoryMetadata:
        url = f"{self.base_url}/repos/{owner}/{repo}"
        async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
            resp = await client.get(url, headers=self.headers)
            if resp.status_code == 404:
                raise ValueError("GITHUB_REPOSITORY_NOT_FOUND")
            elif resp.status_code == 403:
                raise ValueError("GITHUB_RATE_LIMIT")
            elif resp.status_code != 200:
                raise ValueError(f"GitHub API Error: {resp.status_code}")
                
            data = resp.json()
            repo_id = f"{owner}_{repo}".replace("-", "_").replace(".", "_")
            return RepositoryMetadata(
                id=repo_id,
                name=data.get("name", repo),
                owner=owner,
                url=data.get("html_url", f"https://github.com/{owner}/{repo}"),
                default_branch=data.get("default_branch", "main"),
                description=data.get("description"),
                language=data.get("language"),
                stars=data.get("stargazers_count", 0),
                forks=data.get("forks_count", 0),
                open_issues=data.get("open_issues_count", 0),
                created_at=data.get("created_at"),
                updated_at=data.get("updated_at"),
                status="connected"
            )

    async def get_repository_tree(self, owner: str, repo: str, branch: str = "main") -> List[Dict[str, Any]]:
        url = f"{self.base_url}/repos/{owner}/{repo}/git/trees/{branch}?recursive=1"
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            resp = await client.get(url, headers=self.headers)
            if resp.status_code != 200:
                # Try fallback without recursive or check master branch if main fails
                if branch == "main":
                    return await self.get_repository_tree(owner, repo, branch="master")
                raise ValueError(f"Failed to fetch repository tree: {resp.status_code}")
            
            data = resp.json()
            tree = data.get("tree", [])
            return filter_repository_tree(tree)

    async def fetch_file_content(self, owner: str, repo: str, branch: str, file_path: str) -> Optional[str]:
        # 1. Try specified default branch
        url = f"{self.raw_base_url}/{owner}/{repo}/{branch}/{file_path}"
        async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
            resp = await client.get(url, headers=self.headers)
            if resp.status_code == 200:
                return resp.text
                
            # 2. Try master/main fallback
            fallback_branch = "master" if branch == "main" else "main"
            fallback_url = f"{self.raw_base_url}/{owner}/{repo}/{fallback_branch}/{file_path}"
            fb_resp = await client.get(fallback_url, headers=self.headers)
            if fb_resp.status_code == 200:
                return fb_resp.text
                
            # 3. Check if stored in ChromaDB chunks as fallback
            repo_id = f"{owner}_{repo}".replace("-", "_").replace(".", "_")
            from app.vectorstore.chroma_store import chroma_store
            chunks = chroma_store.get_all_chunks(repo_id)
            matching_chunks = [c for c in chunks if c.get("metadata", {}).get("file_path") == file_path]
            if matching_chunks:
                # Sort by start line and combine
                matching_chunks.sort(key=lambda x: x.get("metadata", {}).get("start_line", 0))
                return "\n".join([c.get("content", "") for c in matching_chunks])
                
            return None

github_service = GitHubService()
