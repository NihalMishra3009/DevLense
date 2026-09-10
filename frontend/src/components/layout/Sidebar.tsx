import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquareCode, 
  FolderTree, 
  BookOpen, 
  GitFork, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Layers
} from 'lucide-react';
import { RepositoryMetadata } from '../../types/api';

interface SidebarProps {
  activeTab: 'dashboard' | 'ask' | 'explore' | 'onboarding';
  setActiveTab: (tab: 'dashboard' | 'ask' | 'explore' | 'onboarding') => void;
  repo: RepositoryMetadata | null;
  onDisconnect: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  repo,
  onDisconnect
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'ask', label: 'Ask Code', icon: MessageSquareCode },
    { id: 'explore', label: 'Explore', icon: FolderTree },
    { id: 'onboarding', label: 'Onboarding', icon: BookOpen },
  ] as const;

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col justify-between h-screen select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-wide text-white uppercase flex items-center gap-1.5">
                DevLense
                <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded border border-accent/30 font-mono">MVP</span>
              </span>
              <p className="text-[11px] text-muted">Codebase Intelligence</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-3">
          <p className="text-[11px] font-semibold text-muted/60 uppercase tracking-wider px-3 mb-2 font-mono">
            Navigation
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-accent/15 text-white font-semibold border border-accent/30'
                      : 'text-muted hover:text-white hover:bg-cardHover'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-muted'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-accent" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Connected Repository Card */}
        {repo && (
          <div className="p-3 mx-3 mt-4 rounded-lg bg-background border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Active Repository</span>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${
                repo.status === 'ready' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : repo.status === 'indexing'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                  : 'bg-zinc-800 text-zinc-400'
              }`}>
                {repo.status}
              </span>
            </div>
            <div className="font-medium text-xs text-white truncate flex items-center gap-1.5">
              <GitFork className="w-3.5 h-3.5 text-muted shrink-0" />
              <span className="truncate">{repo.owner}/{repo.name}</span>
            </div>
            <p className="text-[11px] text-muted/80 mt-1 font-mono">
              Branch: <span className="text-zinc-300">{repo.default_branch}</span>
            </p>
            <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between">
              <a 
                href={repo.url} 
                target="_blank" 
                rel="noreferrer" 
                className="text-[11px] text-muted hover:text-white flex items-center gap-1 transition-colors"
              >
                GitHub <ExternalLink className="w-3 h-3" />
              </a>
              <button 
                onClick={onDisconnect}
                className="text-[11px] text-red-400/80 hover:text-red-300 transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-border flex items-center justify-between text-[11px] text-muted font-mono">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-accent" />
          <span>v1.0.0</span>
        </div>
        <span className="text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Ready
        </span>
      </div>
    </aside>
  );
};
