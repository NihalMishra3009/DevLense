# DevLense Demo Script & Acceptance Guide

## 🎬 3–5 Minute Demo Walkthrough

### 01. Open DevLense
- Open `http://localhost:5173`.
- Observe the clean, dark-first developer theme (`#09090B`).

### 02. Connect GitHub Repository
- Paste the demo repository URL:
  `https://github.com/tiangolo/full-stack-fastapi-template` (or sample button).
- Click **"Connect"**.
- View verified repository metadata (Branch: `master`, Star count, Owner/Repo name).

### 03. Index Repository
- Click **"Start Indexing"**.
- Watch real indexing: fetches tree, filters ignored dirs, creates logical chunks, generates embeddings, and saves into isolated ChromaDB collection.
- Status updates from `INDEXING` to `READY` with exact chunk & file counts.

### 04. Dashboard Overview
- View repository metrics: Total Indexed Files, ChromaDB Chunks, and Language distribution.
- Inspect architectural module breakdown and detected entrypoints.

### 05. Ask: "Where is login implemented?" (Discovery Intent)
- Navigate to **Ask Code** or click the quick question.
- Observe:
  - Detected Intent: `DISCOVERY`
  - Grounded answer explaining the authentication endpoint.
  - Verified Citation cards: e.g. `backend/app/api/routes/login.py` (Lines 20–45).

### 06. Click Citation → Jump to Exact Source Line
- Click the citation link on the card.
- Automatically transitions to **Explore / Source Viewer**, opens the file, scrolls smoothly, and highlights the exact cited line in violet.

### 07. Conversational Follow-up: "Explain that file."
- Type: *"Explain that file in detail."*
- Conversational awareness expands the pronoun reference to the previously cited file and explains its functions with grounded citations.

### 08. Ask: "How would I add Google OAuth?" (Feature Planning Intent)
- Ask: *"How would I add Google OAuth to this project?"*
- Observe:
  - Detected Intent: `FEATURE_PLAN`
  - Current architecture facts distinguished from recommended changes.
  - Affected files, reusable components, and step-by-step roadmap.

### 09. Open Developer Onboarding Guide
- Navigate to **Onboarding**.
- View the structured reading order with step-by-step reasons and key subsystems.

### 10. Finish
- Reliable, 100% grounded codebase intelligence without hallucinations.
