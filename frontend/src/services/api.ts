import {
  RepositoryMetadata,
  IndexResponse,
  AskResponse,
  ProjectSummaryResponse,
  OnboardingResponse,
  FeaturePlanResponse,
  StructureResponse,
  FileViewerResponse,
  ChatMessage
} from '../types/api';

const API_BASE = '/api';

export const api = {
  async health(): Promise<{ status: string; timestamp: string; version: string }> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async getUserRepos(username: string = '', token?: string): Promise<{ username: string; repositories: any[] }> {
    const params = new URLSearchParams();
    if (username) params.append('username', username);
    if (token) params.append('token', token);
    const res = await fetch(`${API_BASE}/repositories/user-repos?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch user repositories');
    return res.json();
  },

  async connectRepository(url: string): Promise<RepositoryMetadata> {
    const res = await fetch(`${API_BASE}/repositories/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || data.detail?.message || 'Failed to connect repository');
    }
    return data;
  },

  async indexRepository(repoId: string): Promise<IndexResponse> {
    const res = await fetch(`${API_BASE}/repositories/${repoId}/index`, {
      method: 'POST'
    });
    let data: any = {};
    try {
      data = await res.json();
    } catch (e) {}
    if (!res.ok) {
      throw new Error(data.error?.message || data.detail?.message || 'Indexing failed');
    }
    return data;
  },

  async getRepository(repoId: string): Promise<RepositoryMetadata> {
    const res = await fetch(`${API_BASE}/repositories/${repoId}`);
    let data: any = {};
    try {
      data = await res.json();
    } catch (e) {}
    if (!res.ok) {
      throw new Error(data.error?.message || data.detail?.message || 'Failed to get repository');
    }
    return data;
  },

  async askRepository(repoId: string, question: string, topK: number = 8, history: ChatMessage[] = []): Promise<AskResponse> {
    const res = await fetch(`${API_BASE}/repositories/${repoId}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, top_k: topK, history })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || data.detail?.message || 'Query failed');
    }
    return data;
  },

  async getSummary(repoId: string): Promise<ProjectSummaryResponse> {
    const res = await fetch(`${API_BASE}/repositories/${repoId}/summary`, {
      method: 'POST'
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || data.detail?.message || 'Failed to get summary');
    }
    return data;
  },

  async getOnboarding(repoId: string): Promise<OnboardingResponse> {
    const res = await fetch(`${API_BASE}/repositories/${repoId}/onboarding`, {
      method: 'POST'
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || data.detail?.message || 'Failed to get onboarding guide');
    }
    return data;
  },

  async createFeaturePlan(repoId: string, featureRequest: string, history: ChatMessage[] = []): Promise<FeaturePlanResponse> {
    const res = await fetch(`${API_BASE}/repositories/${repoId}/feature-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature_request: featureRequest, history })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || data.detail?.message || 'Failed to generate feature plan');
    }
    return data;
  },

  async getStructure(repoId: string): Promise<StructureResponse> {
    const res = await fetch(`${API_BASE}/repositories/${repoId}/structure`);
    if (!res.ok) {
      let msg = 'Failed to get structure';
      try {
        const data = await res.json();
        msg = data.error?.message || data.detail?.message || msg;
      } catch (e) {}
      throw new Error(msg);
    }
    return res.json();
  },

  async getFileContent(repoId: string, filePath: string): Promise<FileViewerResponse> {
    const res = await fetch(`${API_BASE}/repositories/${repoId}/file?path=${encodeURIComponent(filePath)}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || data.detail?.message || 'Failed to get file');
    }
    return data;
  }
};
