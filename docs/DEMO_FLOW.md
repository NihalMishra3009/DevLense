# DevLense — Demo Flow & Acceptance Steps

## Acceptance Walkthrough

1. **Access DevLense Landing Page**:
   - Clean dark-first UI (`#09090B`), tagline *"Your AI lens into any codebase."*
   - Paste a public GitHub repository URL (e.g., `https://github.com/fastapi/fastapi` or standard demo repo).

2. **Connect & Index**:
   - Click "Connect Repository".
   - View live repository metadata, branch, and file count.
   - Click "Index Codebase" and watch real multi-stage progress (Tree retrieval -> File filtering -> Chunking -> Vector embeddings in ChromaDB).

3. **Explore Dashboard**:
   - Repository summary metrics (Files indexed, Chunks created, Detected languages).
   - High-level architecture overview.
   - Quick prompt shortcuts.

4. **Ask Code (Grounded Q&A)**:
   - Ask questions like:
     - *"Where is authentication / routing implemented?"*
     - *"Explain how request validation works."*
     - *"What does function X do?"*
   - Verify:
     - Clear synthesized answer.
     - Detected intent badge (`DISCOVERY`, `CODE_QA`, `STRUCTURE`).
     - Interactive Citation Cards showing exact file paths and line ranges.

5. **Codebase Exploration**:
   - Interactive repository file tree.
   - Source code viewer with syntax highlighting and line numbers.
   - Click cited files from chat directly to highlight them in the file explorer.

6. **Developer Onboarding Guide**:
   - Auto-generated onboarding roadmap with recommended file reading order and key modules.

7. **Feature Planning**:
   - Query: *"How would I add Google OAuth or a new cache layer?"*
   - Receive architecture analysis, affected files, reusable components, and exact step-by-step implementation plan.
