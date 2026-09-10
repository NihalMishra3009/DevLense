import React, { useState, useEffect, useRef } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileCode2, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Copy, 
  Check, 
  Code
} from 'lucide-react';
import { api } from '../services/api';
import { RepositoryMetadata, StructureResponse, FileViewerResponse } from '../types/api';

interface ExploreProps {
  repo: RepositoryMetadata;
  selectedFile?: string | null;
  targetLine?: number | null;
}

export const Explore: React.FC<ExploreProps> = ({ repo, selectedFile, targetLine }) => {
  const [structure, setStructure] = useState<StructureResponse | null>(null);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(selectedFile || null);
  const [fileData, setFileData] = useState<FileViewerResponse | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const lineRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    fetchStructure();
  }, [repo.id]);

  useEffect(() => {
    if (selectedFile) {
      loadFile(selectedFile);
    }
  }, [selectedFile]);

  useEffect(() => {
    if (targetLine && fileData && lineRefs.current[targetLine]) {
      lineRefs.current[targetLine]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [targetLine, fileData]);

  const fetchStructure = async () => {
    try {
      const data = await api.getStructure(repo.id);
      setStructure(data);
      const initialExp: Record<string, boolean> = {};
      if (data.directory_tree) {
        Object.keys(data.directory_tree).forEach((k) => {
          initialExp[k] = true;
        });
      }
      setExpandedFolders(initialExp);
    } catch (err) {
      console.error(err);
    }
  };

  const loadFile = async (filePath: string) => {
    setCurrentFilePath(filePath);
    setLoadingFile(true);
    try {
      const data = await api.getFileContent(repo.id, filePath);
      setFileData(data);
    } catch (err) {
      console.error(err);
      setFileData(null);
    } finally {
      setLoadingFile(false);
    }
  };

  const toggleFolder = (folderKey: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderKey]: !prev[folderKey] }));
  };

  const handleCopyCode = () => {
    if (fileData?.content) {
      navigator.clipboard.writeText(fileData.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasMatchingDescendants = (node: any, currentPath = '', query: string): boolean => {
    if (!query) return true;
    const q = query.toLowerCase();
    for (const key of Object.keys(node)) {
      const fullPath = currentPath ? `${currentPath}/${key}` : key;
      if (fullPath.toLowerCase().includes(q)) return true;
      if (typeof node[key] === 'object' && hasMatchingDescendants(node[key], fullPath, query)) {
        return true;
      }
    }
    return false;
  };

  const renderTree = (node: any, currentPath = '') => {
    return Object.keys(node).map((key) => {
      const value = node[key];
      const fullPath = currentPath ? `${currentPath}/${key}` : key;
      const isFile = value === 'file';

      if (isFile) {
        if (searchQuery && !fullPath.toLowerCase().includes(searchQuery.toLowerCase())) {
          return null;
        }

        const isSelected = currentFilePath === fullPath;
        return (
          <button
            key={fullPath}
            onClick={() => loadFile(fullPath)}
            className={`w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-mono transition-colors ${
              isSelected
                ? 'bg-accent/20 text-white font-semibold border-l-2 border-accent'
                : 'text-zinc-300 hover:text-white hover:bg-cardHover'
            }`}
          >
            <FileCode2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-accent' : 'text-muted'}`} />
            <span className="truncate">{key}</span>
          </button>
        );
      }

      // If searching, hide folder if neither folder name nor any of its children match
      if (searchQuery && !hasMatchingDescendants(value, fullPath, searchQuery) && !fullPath.toLowerCase().includes(searchQuery.toLowerCase())) {
        return null;
      }

      // Auto-expand folder when search query is active
      const isExpanded = searchQuery ? true : (expandedFolders[fullPath] ?? true);
      return (
        <div key={fullPath} className="space-y-0.5">
          <button
            onClick={() => toggleFolder(fullPath)}
            className="w-full text-left flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-mono text-muted hover:text-white transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
            {isExpanded ? <FolderOpen className="w-3.5 h-3.5 text-accent/80 shrink-0" /> : <Folder className="w-3.5 h-3.5 text-accent/80 shrink-0" />}
            <span className="font-medium text-zinc-200">{key}</span>
          </button>

          {isExpanded && (
            <div className="pl-3.5 border-l border-border/40 space-y-0.5 my-0.5 ml-2">
              {renderTree(value, fullPath)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-4 p-4">
      {/* File Tree Explorer Panel */}
      <div className="w-72 bg-card border border-border rounded-xl flex flex-col overflow-hidden">
        <div className="p-3 border-b border-border space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-muted">
            <span className="font-semibold text-white">REPOSITORY FILES</span>
            <span>{repo.file_count}</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder-muted focus:outline-none focus:border-accent font-mono"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {structure?.directory_tree ? (
            renderTree(structure.directory_tree)
          ) : (
            <div className="p-4 text-center text-xs text-muted font-mono">
              Loading file tree...
            </div>
          )}
        </div>
      </div>

      {/* Code Viewer Panel */}
      <div className="flex-1 bg-card border border-border rounded-xl flex flex-col overflow-hidden">
        {currentFilePath ? (
          <>
            <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-background/50">
              <div className="flex items-center gap-2 font-mono text-xs text-zinc-300">
                <FileCode2 className="w-4 h-4 text-accent" />
                <span className="font-semibold text-white">{currentFilePath}</span>
                {fileData && (
                  <span className="text-[11px] text-muted">({fileData.lines} lines • {fileData.language})</span>
                )}
                {targetLine && (
                  <span className="text-[11px] bg-accent/20 border border-accent/40 text-accent px-2 py-0.5 rounded font-mono font-semibold">
                    Focused Line: {targetLine}
                  </span>
                )}
              </div>

              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 text-xs font-mono text-muted hover:text-white px-2.5 py-1 rounded bg-background border border-border transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-[#0B0B0E] font-mono text-xs">
              {loadingFile ? (
                <div className="h-full flex items-center justify-center text-muted gap-2 font-mono">
                  <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  <span>Loading source content...</span>
                </div>
              ) : fileData ? (
                <div className="flex">
                  {/* Line Numbers with Target Highlight */}
                  <div className="select-none pr-4 text-right text-muted/40 border-r border-border/40 font-mono text-xs space-y-0.5">
                    {fileData.content.split('\n').map((_, idx) => {
                      const lineNum = idx + 1;
                      const isTarget = targetLine === lineNum;
                      return (
                        <div
                          key={lineNum}
                          ref={(el) => (lineRefs.current[lineNum] = el)}
                          className={isTarget ? 'text-accent font-bold bg-accent/20 px-1 rounded' : ''}
                        >
                          {lineNum}
                        </div>
                      );
                    })}
                  </div>

                  {/* Code Body */}
                  <pre className="pl-4 text-zinc-200 overflow-x-auto text-xs leading-5 flex-1">
                    {fileData.content.split('\n').map((line, idx) => {
                      const lineNum = idx + 1;
                      const isTarget = targetLine === lineNum;
                      return (
                        <div
                          key={lineNum}
                          className={isTarget ? 'bg-accent/15 -mx-4 px-4 border-l-2 border-accent py-0.5' : ''}
                        >
                          <code>{line || ' '}</code>
                        </div>
                      );
                    })}
                  </pre>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-muted">
                  Failed to load source code for this file.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted font-mono text-xs p-8 space-y-3">
            <Code className="w-10 h-10 text-muted/40 stroke-1" />
            <p>Select any source file from the tree to view its contents.</p>
          </div>
        )}
      </div>
    </div>
  );
};
