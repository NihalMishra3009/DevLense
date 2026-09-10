export interface RepositoryMetadata {
  id: string;
  name: string;
  owner: string;
  url: string;
  default_branch: string;
  description?: string;
  language?: string;
  stars: number;
  forks: number;
  open_issues: number;
  created_at?: string;
  updated_at?: string;
  status: 'connected' | 'indexing' | 'ready' | 'error';
  file_count: number;
  chunk_count: number;
  languages: Record<string, number>;
  error_message?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Citation {
  file: string;
  start_line: number;
  end_line: number;
  snippet?: string;
  language?: string;
}

export interface AskResponse {
  answer: string;
  intent: string;
  sources: Citation[];
}

export interface IndexResponse {
  id: string;
  status: string;
  file_count: number;
  chunk_count: number;
  languages: Record<string, number>;
  message: string;
}

export interface ProjectSummaryResponse {
  purpose: string;
  tech_stack: string[];
  architecture: string;
  major_modules: string[];
  entry_points: string[];
  dependencies: string[];
  raw_markdown: string;
}

export interface ReadingOrderItem {
  step: number;
  file: string;
  reason: string;
}

export interface OnboardingResponse {
  overview: string;
  architecture: string;
  getting_started: string;
  reading_order: ReadingOrderItem[];
  key_modules: string[];
  raw_markdown: string;
}

export interface FeaturePlanResponse {
  feature: string;
  current_architecture: string;
  affected_files: string[];
  reusable_components: string[];
  new_components: string[];
  implementation_steps: string[];
  considerations: string[];
  sources: Citation[];
}

export interface StructureResponse {
  overview: string;
  directory_tree: Record<string, any>;
  entry_points: string[];
  modules: Array<{ name: string; files_count: number }>;
}

export interface FileViewerResponse {
  path: string;
  language: string;
  content: string;
  lines: number;
}
