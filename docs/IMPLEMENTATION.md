# DevLense — Implementation Guide

## Overview
DevLense is a developer tool allowing engineers to instantly understand unfamiliar codebases through agentic ingestion, AST/regex-aware chunking, vector indexing with ChromaDB, hybrid retrieval (semantic + BM25 keyword matching + path matching), and LangGraph reasoning with strict citation grounding.

## Tech Stack
- **Backend**: Python 3.11+, FastAPI, Uvicorn, Pydantic v2, ChromaDB, LangChain, LangGraph, httpx
- **Frontend**: React 18+, TypeScript, Vite, Tailwind CSS, Lucide React, JetBrains Mono font
- **AI / Embeddings**: Configurable LLM & Embedding provider (OpenAI / Ollama / Gemini / Local Fallback Embeddings)

## Chunking Strategy
Chunks preserve:
1. `repository`: `owner/repo`
2. `file_path`: Relative path in the repo
3. `language`: Language inferred from file extension
4. `start_line` & `end_line`: 1-indexed line numbers
5. `chunk_type`: Function, Class, Block, Config, or Markdown section

## Anti-Hallucination & Citations
All claims must be backed by a verified `file` and line range present in the ChromaDB index. Any ungrounded assertion is rejected by the citation verification layer.
