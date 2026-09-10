import React, { useState, useEffect } from 'react';
import { 
  GitFork, 
  FileCode2, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  FolderTree, 
  MessageSquareCode, 
  ExternalLink, 
  CheckCircle2, 
  Play, 
  Terminal, 
  Cpu,
  Activity
} from 'lucide-react';
import { api } from '../services/api';
import { RepositoryMetadata, StructureResponse } from '../types/api';

interface DashboardProps {
  repo: RepositoryMetadata;
  onNavigate: (tab: 'dashboard' | 'ask' | 'explore' | 'onboarding') => void;
  onQuickAsk: (question: string) => void;
  onRefreshRepo: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  repo,
  onNavigate,
  onQuickAsk,
  onRefreshRepo
}) => {
  const [indexing, setIndexing] = useState(false);
  const [structure, setStructure] = useState<StructureResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (repo.status === 'ready') {
      fetchStructure();
    }
  }, [repo.id, repo.status]);

  const fetchStructure = async () => {
    try {
      const data = await api.getStructure(repo.id);
      setStructure(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleStartIndexing = async () => {
    setIndexing(true);
    setError(null);
    try {
      await api.indexRepository(repo.id);
      onRefreshRepo();
    } catch (err: any) {
      setError(err.message || 'Indexing failed');
    } finally {
      setIndexing(false);
    }
  };

  const suggestedQuestions = [
    'Where is authentication or login implemented?',
    'Explain the database and data model architecture.',
    'How does request lifecycle and API routing work?',
    'How would I add Google OAuth to this project?'
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 relative">
      {/* Background Subtle Accent Glow */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Dynamic Header Banner with Glow and Glassmorphism */}
      <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl bg-[#111113]/80 backdrop-blur-md border border-border/80 shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent shadow-lg shadow-accent/10">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                {repo.owner} / {repo.name}
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider ${
                  repo.status === 'ready'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                }`}>
                  {repo.status}
                </span>
              </h1>
              <p className="text-xs text-muted max-w-2xl mt-1">
                {repo.description || 'No description provided by repository.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {repo.status !== 'ready' ? (
          <button
            onClick={handleStartIndexing}
            disabled={indexing}
            className="bg-gradient-to-r from-indigo-500 to-accent hover:from-indigo-600 hover:to-accent-hover text-white px-6 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all shrink-0 shadow-lg shadow-accent/25 hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {indexing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Indexing Codebase into ChromaDB...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Start Indexing</span>
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('ask')}
              className="bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-accent/20 hover:scale-105"
            >
              <MessageSquareCode className="w-4 h-4" />
              <span>Ask Code</span>
            </button>
            <a
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              className="bg-card hover:bg-zinc-800 text-muted hover:text-white px-4 py-2.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all border border-border"
            >
              GitHub <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Real Statistics Metrics with Modern Glass Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#111113]/90 border border-border hover:border-accent/40 transition-all group">
          <div className="flex items-center justify-between text-muted text-xs font-mono mb-2">
            <span>INDEXED FILES</span>
            <FileCode2 className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-3xl font-extrabold font-mono text-white">
            {repo.file_count}
          </p>
          <span className="text-[11px] text-muted mt-1 block">Parsed and filtered</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#111113]/90 border border-border hover:border-accent/40 transition-all group">
          <div className="flex items-center justify-between text-muted text-xs font-mono mb-2">
            <span>VECTOR CHUNKS</span>
            <Layers className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-3xl font-extrabold font-mono text-white">
            {repo.chunk_count}
          </p>
          <span className="text-[11px] text-muted mt-1 block">ChromaDB embeddings</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#111113]/90 border border-border hover:border-accent/40 transition-all group">
          <div className="flex items-center justify-between text-muted text-xs font-mono mb-2">
            <span>LANGUAGES</span>
            <Cpu className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-3xl font-extrabold font-mono text-white">
            {Object.keys(repo.languages || {}).length || 1}
          </p>
          <span className="text-[11px] text-muted mt-1 block truncate">
            {Object.keys(repo.languages || {}).slice(0, 3).join(', ') || 'Codebase'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#111113]/90 border border-border hover:border-accent/40 transition-all group">
          <div className="flex items-center justify-between text-muted text-xs font-mono mb-2">
            <span>PIPELINE STATUS</span>
            <Activity className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-3xl font-extrabold font-mono text-white capitalize">
            {repo.status}
          </p>
          <span className="text-[11px] text-muted mt-1 block">Branch: {repo.default_branch}</span>
        </div>
      </div>

      {/* Suggested Inquiries / Quick Questions */}
      <div className="p-6 rounded-2xl bg-[#111113]/90 border border-border shadow-xl">
        <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          Ask Your Codebase
        </h2>
        <p className="text-xs text-muted mb-4">
          Click any prompt below to trigger grounded LangGraph retrieval with exact citations:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                onQuickAsk(q);
                onNavigate('ask');
              }}
              className="text-left p-3.5 rounded-xl bg-background border border-border/80 hover:border-accent/60 text-xs text-zinc-300 hover:text-white flex items-center justify-between group transition-all hover:bg-cardHover shadow-sm"
            >
              <span>{q}</span>
              <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </div>

      {/* Architecture & Structure Overview */}
      {structure && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#111113]/90 border border-border">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-accent" />
              Repository Subsystems
            </h3>
            <div className="space-y-2">
              {structure.modules.length > 0 ? (
                structure.modules.map((m) => (
                  <div key={m.name} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/80 text-xs font-mono">
                    <span className="text-zinc-200 font-medium">{m.name}/</span>
                    <span className="text-muted text-[11px] bg-card px-2 py-0.5 rounded border border-border/60">{m.files_count} files</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted font-mono">Index codebase to inspect module distribution.</p>
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#111113]/90 border border-border">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Play className="w-4 h-4 text-accent" />
              Primary Entry Points
            </h3>
            <div className="space-y-2">
              {structure.entry_points.length > 0 ? (
                structure.entry_points.map((ep) => (
                  <div key={ep} className="p-3 rounded-xl bg-background border border-emerald-500/20 text-xs font-mono text-emerald-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="truncate">{ep}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted font-mono">No entry point detected.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
