# Supported file extensions for code ingestion
ALLOWED_EXTENSIONS = {
    ".py", ".js", ".jsx", ".ts", ".tsx", ".java", ".go", ".rs",
    ".cpp", ".c", ".h", ".hpp", ".css", ".html", ".json", ".yaml",
    ".yml", ".md", ".sql", ".sh", ".toml", ".prisma"
}

# Directories and patterns to strictly ignore
IGNORED_DIRECTORIES = {
    ".git", "node_modules", "dist", "build", "coverage", ".cache",
    ".venv", "venv", "__pycache__", ".next", "target", "bin", "obj",
    ".idea", ".vscode", ".tox", ".mypy_cache", ".pytest_cache", "vendor"
}

# File names / patterns to ignore
IGNORED_FILES = {
    "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "poetry.lock",
    "Pipfile.lock", "Cargo.lock", ".DS_Store", "thumbs.db"
}

# Binary / media extensions to skip
SKIPPED_BINARY_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".webp", ".pdf",
    ".zip", ".tar", ".gz", ".7z", ".exe", ".dll", ".so", ".dylib",
    ".woff", ".woff2", ".ttf", ".eot", ".mp4", ".mov", ".mp3", ".wav"
}

# Intent Types for Router
class IntentType:
    STRUCTURE = "STRUCTURE"
    DISCOVERY = "DISCOVERY"
    CODE_QA = "CODE_QA"
    SUMMARY = "SUMMARY"
    FEATURE_PLAN = "FEATURE_PLAN"
    ONBOARDING = "ONBOARDING"
    GENERAL = "GENERAL"
