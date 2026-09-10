import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  FileCode, 
  ListOrdered,
  Cpu
} from 'lucide-react';
import { api } from '../services/api';
import { RepositoryMetadata, OnboardingResponse } from '../types/api';

interface OnboardingProps {
  repo: RepositoryMetadata;
  onSelectFile?: (file: string) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ repo, onSelectFile }) => {
  const [guide, setGuide] = useState<OnboardingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOnboardingGuide();
  }, [repo.id]);

  const fetchOnboardingGuide = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getOnboarding(repo.id);
      setGuide(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate onboarding guide.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" />
            Developer Onboarding Guide — {repo.name}
          </h1>
          <p className="text-xs text-muted mt-1">
            Synthesized reading order and architecture overview for developers new to this codebase.
          </p>
        </div>

        <button
          onClick={fetchOnboardingGuide}
          disabled={loading}
          className="bg-card hover:bg-cardHover border border-border text-xs font-mono text-muted hover:text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>Regenerate</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center space-y-3 font-mono text-xs text-muted">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p>Analyzing repository modules and synthesizing onboarding roadmap...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      ) : guide ? (
        <div className="space-y-8">
          {/* Welcome & Overview Card */}
          <div className="p-6 rounded-xl bg-card border border-border space-y-3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              1. Project Overview & Architecture
            </h2>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {guide.overview}
            </p>
            <div className="p-3 rounded-lg bg-background border border-border text-xs font-mono text-zinc-400">
              <strong className="text-white">Architecture Pattern:</strong> {guide.architecture}
            </div>
          </div>

          {/* Recommended Reading Order Card */}
          <div className="p-6 rounded-xl bg-card border border-border space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-accent" />
              2. Recommended Reading Order
            </h2>
            <p className="text-xs text-muted">
              Follow this sequence to understand how the codebase boots, routes requests, and manages data:
            </p>

            <div className="space-y-3">
              {guide.reading_order.map((item) => (
                <div
                  key={item.step}
                  className="flex items-start gap-3 p-3.5 rounded-lg bg-background border border-border hover:border-accent/40 transition-colors"
                >
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {item.step}
                  </span>
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => onSelectFile && onSelectFile(item.file)}
                      className="font-mono text-xs font-semibold text-zinc-200 hover:text-accent hover:underline text-left"
                    >
                      {item.file}
                    </button>
                    <p className="text-xs text-muted mt-1 leading-relaxed">
                      {item.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Modules Breakdown */}
          <div className="p-6 rounded-xl bg-card border border-border space-y-3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-accent" />
              3. Key Subsystems & Modules
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {guide.key_modules.map((mod, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-background border border-border font-mono text-xs text-zinc-300 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{mod}/</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
