import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { AskCode } from './pages/AskCode';
import { Explore } from './pages/Explore';
import { Onboarding } from './pages/Onboarding';
import { SplashScreen } from './components/common/SplashScreen';
import { RepositoryMetadata } from './types/api';
import { api } from './services/api';

export function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeRepo, setActiveRepo] = useState<RepositoryMetadata | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ask' | 'explore' | 'onboarding'>('dashboard');
  const [initialAskQuestion, setInitialAskQuestion] = useState<string>('');
  const [selectedFileForExplore, setSelectedFileForExplore] = useState<string | null>(null);
  const [targetLineForExplore, setTargetLineForExplore] = useState<number | null>(null);

  const handleConnected = (repo: RepositoryMetadata) => {
    setActiveRepo(repo);
    setActiveTab('dashboard');
  };

  const handleDisconnect = () => {
    setActiveRepo(null);
    setActiveTab('dashboard');
    setSelectedFileForExplore(null);
    setTargetLineForExplore(null);
  };

  const handleQuickAsk = (question: string) => {
    setInitialAskQuestion(question);
    setActiveTab('ask');
  };

  const handleSelectFile = (filePath: string, startLine?: number) => {
    setSelectedFileForExplore(filePath);
    setTargetLineForExplore(startLine || null);
    setActiveTab('explore');
  };

  const handleRefreshRepo = async () => {
    if (activeRepo) {
      try {
        const updated = await api.getRepository(activeRepo.id);
        setActiveRepo(updated);
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!activeRepo) {
    return <Landing onConnected={handleConnected} />;
  }

  return (
    <div className="flex h-screen bg-[#09090B] text-foreground overflow-hidden">
      {/* Persistent Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        repo={activeRepo}
        onDisconnect={handleDisconnect}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 overflow-y-auto bg-[#09090B]">
        {activeTab === 'dashboard' && (
          <Dashboard
            repo={activeRepo}
            onNavigate={setActiveTab}
            onQuickAsk={handleQuickAsk}
            onRefreshRepo={handleRefreshRepo}
          />
        )}

        {activeTab === 'ask' && (
          <AskCode
            repo={activeRepo}
            initialQuestion={initialAskQuestion}
            onSelectFile={handleSelectFile}
          />
        )}

        {activeTab === 'explore' && (
          <Explore
            repo={activeRepo}
            selectedFile={selectedFileForExplore}
            targetLine={targetLineForExplore}
          />
        )}

        {activeTab === 'onboarding' && (
          <Onboarding
            repo={activeRepo}
            onSelectFile={handleSelectFile}
          />
        )}
      </main>
    </div>
  );
}

export default App;
