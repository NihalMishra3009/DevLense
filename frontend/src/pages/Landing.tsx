import React, { useState } from 'react';
import { 
  Sparkles, 
  GitBranch, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  AlertCircle,
  Github,
  Search,
  Star,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { RepositoryMetadata } from '../types/api';

interface LandingProps {
  onConnected: (repo: RepositoryMetadata) => void;
}

export const Landing: React.FC<LandingProps> = ({ onConnected }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GitHub User Repos Explorer & Connection Modal State
  const [githubUser, setGithubUser] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [userRepos, setUserRepos] = useState<any[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [hasSearchedUser, setHasSearchedUser] = useState(false);
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [repoFilter, setRepoFilter] = useState('');

  const sampleRepos = [
    'https://github.com/NihalMishra3009/ITANTRA',
    'https://github.com/fastapi/fastapi',
    'https://github.com/tiangolo/full-stack-fastapi-template',
  ];

  const handleConnect = async (targetUrl?: string) => {
    const repoUrl = targetUrl || url;
    if (!repoUrl.trim()) {
      setError('Please provide a valid GitHub repository URL.');
      return;
    }

    setLoading(true);
    setError(null);
    setShowGithubModal(false);

    try {
      const repo = await api.connectRepository(repoUrl.trim());
      onConnected(repo);
    } catch (err: any) {
      setError(err.message || 'Failed to connect repository.');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchUserRepos = async (usernameToFetch?: string) => {
    const target = usernameToFetch !== undefined ? usernameToFetch : githubUser;
    if (!target.trim() && !githubToken.trim()) return;

    setLoadingRepos(true);
    setHasSearchedUser(true);
    try {
      const res = await api.getUserRepos(target.trim(), githubToken.trim() || undefined);
      setUserRepos(res.repositories || []);
    } catch (err: any) {
      console.error(err);
      setUserRepos([]);
    } finally {
      setLoadingRepos(false);
    }
  };

  const filteredRepos = userRepos.filter(r => 
    r.name.toLowerCase().includes(repoFilter.toLowerCase()) || 
    (r.description && r.description.toLowerCase().includes(repoFilter.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#09090B] text-foreground flex flex-col justify-between relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-accent/20 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -left-40 w-80 h-80 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Navbar */}
      <header className="border-b border-border/60 bg-[#09090B]/80 backdrop-blur-md px-8 py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent to-indigo-500 flex items-center justify-center shadow-lg shadow-accent/25 ring-1 ring-white/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-wider text-white uppercase font-mono flex items-center gap-2">
              DevLense
              <span className="text-[10px] bg-accent/20 text-indigo-300 px-2 py-0.5 rounded-full border border-accent/30 font-mono">v1.0</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGithubModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-xs font-mono text-zinc-200 border border-border/80 hover:border-accent transition-all shadow-sm group"
          >
            <Github className="w-4 h-4 text-white group-hover:rotate-6 transition-transform" />
            <span>Connect GitHub</span>
          </button>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-card border border-border/80 text-xs font-mono text-muted">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            FastAPI + LangGraph
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-12 text-center relative z-10 flex-1 flex flex-col justify-center">
        {/* Floating Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/80 border border-border text-xs text-zinc-300 mb-6 font-mono backdrop-blur-sm shadow-xl mx-auto">
          <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
          <span>Next-Gen Agentic Codebase Intelligence</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          Your AI lens into <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-accent">
            any GitHub repository.
          </span>
        </h1>
        <p className="text-sm md:text-base text-muted max-w-2xl mx-auto mb-8 font-normal">
          Understand unfamiliar codebases in minutes. Grounded RAG with exact line number citations, multi-turn reasoning, and zero hallucination.
        </p>

        {/* Primary Repository Connection Bar */}
        <div className="max-w-xl mx-auto w-full bg-[#111113]/90 backdrop-blur-lg p-2 rounded-2xl border border-border shadow-2xl shadow-accent/5 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all">
          <div className="flex items-center gap-3 px-3">
            <GitBranch className="w-5 h-5 text-accent shrink-0" />
            <input
              type="text"
              placeholder="Paste GitHub repo URL (e.g. https://github.com/owner/repo)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
              disabled={loading}
              className="w-full bg-transparent border-none py-3 text-xs md:text-sm text-white placeholder-muted focus:outline-none font-mono"
            />
            <button
              onClick={() => handleConnect()}
              disabled={loading}
              className="bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 shadow-lg shadow-accent/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span>Connect</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Direct GitHub User / Org Explorer Box */}
        <div className="mt-8 max-w-xl mx-auto w-full bg-card/60 backdrop-blur-sm border border-border/80 rounded-xl p-4 text-left shadow-lg">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-mono font-semibold text-zinc-200 flex items-center gap-2">
              <Github className="w-4 h-4 text-accent" />
              Direct GitHub Account Explorer
            </span>
            <button
              onClick={() => setShowGithubModal(true)}
              className="text-[11px] font-mono text-accent hover:underline flex items-center gap-1"
            >
              <span>+ Private Repos Token</span>
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Enter GitHub username (e.g. NihalMishra3009, fastapi)..."
                value={githubUser}
                onChange={(e) => setGithubUser(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFetchUserRepos()}
                className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-muted focus:outline-none focus:border-accent font-mono"
              />
            </div>
            <button
              onClick={() => handleFetchUserRepos()}
              disabled={loadingRepos || !githubUser.trim()}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-white border border-border transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
            >
              {loadingRepos ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> : 'Fetch Repos'}
            </button>
          </div>

          {/* Repositories Result Grid */}
          {userRepos.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-muted px-1">
                <span>{userRepos.length} repositories found</span>
                <input
                  type="text"
                  placeholder="Filter repositories..."
                  value={repoFilter}
                  onChange={(e) => setRepoFilter(e.target.value)}
                  className="bg-background border border-border/80 rounded px-2 py-0.5 text-[10px] text-white focus:outline-none focus:border-accent"
                />
              </div>
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {filteredRepos.map((r) => (
                  <div
                    key={r.full_name}
                    className="p-2.5 rounded-lg bg-background/90 border border-border/80 hover:border-accent/50 flex items-center justify-between transition-all group"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-xs font-semibold text-white truncate">{r.name}</p>
                        {r.private && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">Private</span>
                        )}
                        {r.language && (
                          <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono">{r.language}</span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted truncate mt-0.5">{r.description || 'No description provided'}</p>
                    </div>
                    <button
                      onClick={() => handleConnect(r.url)}
                      className="bg-accent/20 hover:bg-accent text-accent hover:text-white px-3 py-1 rounded-md text-[11px] font-mono font-medium transition-all shrink-0 flex items-center gap-1 shadow-sm"
                    >
                      <span>Connect</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasSearchedUser && userRepos.length === 0 && !loadingRepos && (
            <p className="text-[11px] font-mono text-muted text-center mt-3">
              No repositories found for this account.
            </p>
          )}
        </div>

        {/* Quick Sample repositories */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <span className="text-xs text-muted font-mono">Or test an instant demo repository:</span>
          <div className="flex flex-wrap justify-center gap-2">
            {sampleRepos.map((sample) => (
              <button
                key={sample}
                onClick={() => {
                  setUrl(sample);
                  handleConnect(sample);
                }}
                className="text-xs font-mono text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg bg-card border border-border/80 hover:border-accent/50 transition-all hover:scale-105"
              >
                {sample.replace('https://github.com/', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-14 text-left">
          <div className="p-5 rounded-2xl bg-card/60 backdrop-blur-sm border border-border hover:border-accent/40 transition-all group">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Grounded Citations</h3>
            <p className="text-xs text-muted leading-relaxed">
              Every answer is verified against real file paths and exact line ranges in ChromaDB.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-card/60 backdrop-blur-sm border border-border hover:border-accent/40 transition-all group">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Cpu className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">ChatGPT-Style Reasoning</h3>
            <p className="text-xs text-muted leading-relaxed">
              Synthesizes in-depth architecture breakdowns, module code previews, and feature roadmaps.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-card/60 backdrop-blur-sm border border-border hover:border-accent/40 transition-all group">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Hybrid Retrieval</h3>
            <p className="text-xs text-muted leading-relaxed">
              Dense vector embeddings combined with lexical keyword boosting and recursive tree traversal.
            </p>
          </div>
        </div>
      </main>

      {/* GitHub Direct Connection Modal */}
      {showGithubModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111113] border border-border w-full max-w-lg rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border/80 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-accent/20 border border-accent/30">
                  <Github className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">Connect GitHub Account</h3>
                  <p className="text-[11px] text-muted">Browse public & private repositories directly</p>
                </div>
              </div>
              <button
                onClick={() => setShowGithubModal(false)}
                className="text-muted hover:text-white text-xs font-mono px-2 py-1 rounded-md hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono text-zinc-300 mb-1.5 block">GitHub Username or Organization</label>
                <input
                  type="text"
                  placeholder="e.g. NihalMishra3009 or fastapi"
                  value={githubUser}
                  onChange={(e) => setGithubUser(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-white placeholder-muted focus:outline-none focus:border-accent font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-zinc-300">Personal Access Token (Optional)</label>
                  <span className="text-[10px] text-muted font-mono">For private repositories / higher limits</span>
                </div>
                <input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (optional)"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-white placeholder-muted focus:outline-none focus:border-accent font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGithubModal(false)}
                  className="px-4 py-2 rounded-lg border border-border text-xs font-mono text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleFetchUserRepos();
                    setShowGithubModal(false);
                  }}
                  disabled={loadingRepos || (!githubUser.trim() && !githubToken.trim())}
                  className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-mono font-semibold flex items-center gap-1.5 shadow-lg shadow-accent/20 disabled:opacity-50"
                >
                  {loadingRepos ? 'Fetching...' : 'Fetch & View Repositories'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border/60 bg-[#09090B]/80 px-8 py-4 text-center text-xs font-mono text-muted/60 relative z-10">
        DevLense — Developer-First Codebase Intelligence
      </footer>
    </div>
  );
};
