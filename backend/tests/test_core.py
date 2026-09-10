import pytest
from app.utils.github_url import parse_github_url
from app.utils.file_filters import is_allowed_file, filter_repository_tree
from app.utils.language import detect_language
from app.services.chunking_service import chunking_service
from app.services.retrieval_service import retrieval_service
from app.services.citation_service import citation_service
from app.vectorstore.chroma_store import chroma_store
from app.ai.router import intent_router
from app.ai.graph import agent_graph
from app.core.constants import IntentType
from app.models.repository import CodeChunk
from app.models.request_models import ChatMessage

# ==========================================
# 1. GITHUB URL PARSING TESTS
# ==========================================
def test_github_url_valid():
    owner, repo = parse_github_url("https://github.com/fastapi/fastapi")
    assert owner == "fastapi"
    assert repo == "fastapi"

def test_github_url_with_git_extension():
    owner, repo = parse_github_url("https://github.com/tiangolo/full-stack-fastapi-template.git")
    assert owner == "tiangolo"
    assert repo == "full-stack-fastapi-template"

def test_github_url_invalid():
    owner, repo = parse_github_url("https://gitlab.com/user/repo")
    assert owner is None
    assert repo is None

def test_github_url_malformed():
    owner, repo = parse_github_url("not-a-valid-url")
    assert owner is None
    assert repo is None


# ==========================================
# 2. FILE FILTERING TESTS
# ==========================================
def test_file_filtering_valid_source():
    assert is_allowed_file("backend/app/main.py", 1200) is True
    assert is_allowed_file("frontend/src/App.tsx", 3400) is True
    assert is_allowed_file("config/database.yaml", 800) is True

def test_file_filtering_node_modules_ignored():
    assert is_allowed_file("node_modules/react/index.js", 500) is False
    assert is_allowed_file("frontend/node_modules/axios/index.js", 500) is False

def test_file_filtering_binary_ignored():
    assert is_allowed_file("assets/logo.png", 2048) is False
    assert is_allowed_file("build/app.exe", 10240) is False
    assert is_allowed_file("docs/arch.pdf", 4096) is False

def test_file_filtering_large_file_ignored():
    # 500 KB limit = 512,000 bytes
    assert is_allowed_file("huge_dump.sql", 600 * 1024) is False

def test_file_filtering_max_limit():
    tree = [{"path": f"src/file_{i}.py", "type": "blob", "size": 100} for i in range(1200)]
    filtered = filter_repository_tree(tree)
    assert len(filtered) <= 1000


# ==========================================
# 3. CHUNKING TESTS
# ==========================================
def test_chunking_line_numbers_and_metadata():
    code = "def authenticate(user, password):\n    if user == 'admin':\n        return True\n    return False\n"
    chunks = chunking_service.chunk_file("demo_repo", "auth.py", code)
    assert len(chunks) >= 1
    assert chunks[0].file_path == "auth.py"
    assert chunks[0].start_line == 1
    assert chunks[0].end_line == len(code.splitlines())
    assert chunks[0].language == "python"

def test_chunking_function_boundaries():
    code = """class AuthService:
    def login(self, username, password):
        return "token_123"

    def logout(self, token):
        return True
"""
    chunks = chunking_service.chunk_file("demo_repo", "auth_service.py", code)
    assert len(chunks) >= 1
    symbols = chunks[0].symbols
    assert "AuthService" in symbols or "login" in symbols


# ==========================================
# 4. VECTOR STORE & RETRIEVAL TESTS
# ==========================================
def test_vectorstore_and_hybrid_retrieval():
    test_repo_id = "test_retrieval_repo"
    chunks = [
        CodeChunk(
            id=f"{test_repo_id}:auth.py:1-10",
            repository=test_repo_id,
            file_path="routes/auth.py",
            language="python",
            start_line=1,
            end_line=10,
            chunk_type="block",
            content="def login_endpoint():\n    return create_jwt_token()",
            symbols=["login_endpoint"]
        ),
        CodeChunk(
            id=f"{test_repo_id}:db.py:1-10",
            repository=test_repo_id,
            file_path="database/connection.py",
            language="python",
            start_line=1,
            end_line=10,
            chunk_type="block",
            content="def init_db_connection():\n    return create_engine()",
            symbols=["init_db_connection"]
        )
    ]
    chroma_store.add_chunks(test_repo_id, chunks)

    # Keyword / Semantic Hybrid test
    auth_results = retrieval_service.hybrid_search(test_repo_id, "Where is login endpoint and token generated?", top_k=2)
    assert len(auth_results) > 0
    assert auth_results[0]["metadata"]["file_path"] == "routes/auth.py"

    # Filename path boosting test
    db_results = retrieval_service.hybrid_search(test_repo_id, "database connection engine", top_k=2)
    assert len(db_results) > 0
    assert db_results[0]["metadata"]["file_path"] == "database/connection.py"


# ==========================================
# 5. CITATION SERVICE TESTS
# ==========================================
def test_citation_valid():
    retrieved_chunks = [{
        "content": "def login():\n    pass",
        "metadata": {
            "file_path": "backend/routes/auth.py",
            "start_line": 42,
            "end_line": 68,
            "language": "python"
        }
    }]
    citations = citation_service.build_citations_from_chunks(retrieved_chunks)
    assert len(citations) == 1
    assert citations[0].file == "backend/routes/auth.py"
    assert citations[0].start_line == 42
    assert citations[0].end_line == 68

def test_citation_validation_in_text():
    retrieved_chunks = [{
        "content": "def login():\n    pass",
        "metadata": {
            "file_path": "backend/routes/auth.py",
            "start_line": 42,
            "end_line": 68,
            "language": "python"
        }
    }]
    citations = citation_service.build_citations_from_chunks(retrieved_chunks)
    text_mention = "As seen in `backend/routes/auth.py`, login is implemented here."
    validated = citation_service.validate_citations_in_text(text_mention, citations)
    assert len(validated) == 1
    assert validated[0].file == "backend/routes/auth.py"


# ==========================================
# 6. AGENT INTENT ROUTER TESTS
# ==========================================
def test_agent_intent_structure():
    assert intent_router.route("Explain the repository structure and folder layout") == IntentType.STRUCTURE

def test_agent_intent_discovery():
    assert intent_router.route("Where is authentication or login code?") == IntentType.DISCOVERY
    assert intent_router.route("Find Stripe payment processing logic") == IntentType.DISCOVERY

def test_agent_intent_code_qa():
    assert intent_router.route("What does process_payment() function do?") == IntentType.CODE_QA

def test_agent_intent_summary():
    assert intent_router.route("Give me a technical summary and tech stack overview") == IntentType.SUMMARY

def test_agent_intent_feature_plan():
    assert intent_router.route("How would I add Google OAuth?") == IntentType.FEATURE_PLAN

def test_agent_intent_onboarding():
    assert intent_router.route("Generate developer onboarding guide and reading order") == IntentType.ONBOARDING


# ==========================================
# 7. CONTEXTUAL CONVERSATION EXPANSION TEST
# ==========================================
def test_conversation_history_expansion():
    history = [
        ChatMessage(role="user", content="Where is login implemented?"),
        ChatMessage(role="assistant", content="Login is implemented in `backend/routes/auth.py`.")
    ]
    expanded = agent_graph._expand_query_with_history("Explain that file in detail.", history)
    assert "backend/routes/auth.py" in expanded
