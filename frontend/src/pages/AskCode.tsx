import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  FileCode, 
  Bot, 
  User, 
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';
import { RepositoryMetadata, Citation, AskResponse, ChatMessage } from '../types/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  intent?: string;
  sources?: Citation[];
  timestamp: string;
}

interface AskCodeProps {
  repo: RepositoryMetadata;
  initialQuestion?: string;
  onSelectFile?: (file: string, startLine?: number) => void;
}

export const AskCode: React.FC<AskCodeProps> = ({
  repo,
  initialQuestion,
  onSelectFile
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: repo.status !== 'ready'
        ? `Welcome! **${repo.owner}/${repo.name}** is connected, but has not been indexed yet. Please go to the **Overview** dashboard and click **"Start Indexing"** to enable grounded code search and citations.`
        : `Hello! I'm your DevLense Codebase Intelligence Assistant. Ask me anything about **${repo.owner}/${repo.name}**—from architecture and authentication to specific functions and feature planning.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState(initialQuestion || '');
  const [loading, setLoading] = useState(false);
  const [expandedSnippets, setExpandedSnippets] = useState<Record<string, boolean>>({});

  const handleSend = async (queryText?: string) => {
    const q = queryText || input;
    if (!q.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: q.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Build chat history for conversational awareness
    const historyPayload: ChatMessage[] = messages
      .filter((m) => m.id !== '1')
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

    try {
      const res: AskResponse = await api.askRepository(repo.id, q.trim(), 8, historyPayload);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.answer,
        intent: res.intent,
        sources: res.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `Error: ${err.message || 'Failed to retrieve grounded response from codebase.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSnippet = (sourceKey: string) => {
    setExpandedSnippets((prev) => ({ ...prev, [sourceKey]: !prev[sourceKey] }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-5xl mx-auto p-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            Ask Code — {repo.name}
          </h2>
          <p className="text-xs text-muted">Grounded RAG with ChromaDB and LangGraph anti-hallucination verification</p>
        </div>
        <div className="text-xs font-mono px-2.5 py-1 rounded bg-card border border-border text-muted">
          {repo.chunk_count} chunks indexed
        </div>
      </div>

      {/* Chat Messages Flow */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-accent" />
              </div>
            )}

            <div className={`max-w-3xl space-y-3 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              {/* Message Bubble */}
              <div
                className={`p-4 rounded-xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-accent text-white font-medium rounded-br-sm'
                    : 'bg-card border border-border text-zinc-200 rounded-bl-sm shadow-lg'
                }`}
              >
                {/* Intent Tag */}
                {msg.intent && (
                  <div className="mb-2.5 flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/15 border border-accent/30 text-indigo-300 uppercase tracking-wider font-semibold">
                      Intent: {msg.intent}
                    </span>
                  </div>
                )}

                <div className="text-xs leading-relaxed space-y-2">
                  {msg.text.split('\n\n').map((paragraph, pIdx) => {
                    if (paragraph.startsWith('### ')) {
                      return (
                        <h3 key={pIdx} className="text-sm font-bold text-white mt-3 mb-1 border-b border-border/40 pb-1">
                          {paragraph.replace('### ', '')}
                        </h3>
                      );
                    }
                    if (paragraph.startsWith('#### ')) {
                      return (
                        <h4 key={pIdx} className="text-xs font-semibold text-accent mt-2 mb-1">
                          {paragraph.replace('#### ', '')}
                        </h4>
                      );
                    }
                    if (paragraph.startsWith('```')) {
                      const lines = paragraph.split('\n');
                      const lang = lines[0].replace('```', '') || 'code';
                      const codeContent = lines.slice(1, -1).join('\n');
                      return (
                        <div key={pIdx} className="my-2 rounded-lg bg-[#0B0B0E] border border-border/80 overflow-hidden">
                          <div className="bg-zinc-900/80 px-3 py-1 text-[10px] font-mono text-muted uppercase tracking-wider border-b border-border/40">
                            {lang}
                          </div>
                          <pre className="p-3 text-[11px] font-mono text-zinc-200 overflow-x-auto">
                            <code>{codeContent}</code>
                          </pre>
                        </div>
                      );
                    }
                    if (paragraph.startsWith('> ')) {
                      return (
                        <div key={pIdx} className="border-l-2 border-accent/60 pl-3 py-1 text-muted text-[11px] italic bg-accent/5 rounded-r">
                          {paragraph.replace('> ', '')}
                        </div>
                      );
                    }
                    return (
                      <p key={pIdx} className="text-zinc-300 whitespace-pre-wrap leading-5">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </div>

              {/* Citations Card Block */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="bg-background border border-border rounded-xl p-3.5 space-y-2.5 shadow-md">
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted">
                    <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
                      <FileCode className="w-3.5 h-3.5 text-accent" />
                      GROUNDED CITATIONS ({msg.sources.length})
                    </span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified Source Chunks
                    </span>
                  </div>

                  <div className="space-y-2">
                    {msg.sources.map((src, sIdx) => {
                      const sourceKey = `${msg.id}-${sIdx}-${src.file}`;
                      const isExpanded = expandedSnippets[sourceKey];

                      return (
                        <div
                          key={sIdx}
                          className="p-2.5 rounded-lg bg-card border border-border/80 text-xs font-mono transition-all hover:border-accent/40"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 truncate flex-1">
                              <span className="w-4 h-4 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[10px] shrink-0 font-bold">
                                {sIdx + 1}
                              </span>
                              <button
                                onClick={() => onSelectFile && onSelectFile(src.file, src.start_line)}
                                className="text-zinc-200 hover:text-accent truncate hover:underline text-left flex items-center gap-1 group"
                                title="Click to inspect in Source Viewer"
                              >
                                <span className="truncate">{src.file}</span>
                                <ArrowUpRight className="w-3 h-3 text-muted group-hover:text-accent shrink-0" />
                              </button>
                              <span className="text-muted text-[11px] shrink-0 font-mono">
                                (Lines {src.start_line}–{src.end_line})
                              </span>
                            </div>

                            {src.snippet && (
                              <button
                                onClick={() => toggleSnippet(sourceKey)}
                                className="text-muted hover:text-white p-1 rounded hover:bg-zinc-800 transition-colors ml-2"
                              >
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>

                          {/* Code Preview Snippet */}
                          {isExpanded && src.snippet && (
                            <div className="mt-2 pt-2 border-t border-border/60">
                              <pre className="p-2 rounded bg-background text-[11px] text-zinc-300 overflow-x-auto border border-border/40 font-mono">
                                <code>{src.snippet}</code>
                              </pre>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <div className="text-[10px] font-mono text-muted/60 px-1">
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-border flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4 text-zinc-300" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-accent animate-pulse" />
            </div>
            <div className="bg-card border border-border p-4 rounded-xl rounded-bl-sm flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs font-mono text-muted">Retrieving & validating codebase citations...</span>
            </div>
          </div>
        )}
      </div>

      {/* Query Input Box */}
      <div className="mt-4 pt-3 border-t border-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-card p-2 rounded-xl border border-border focus-within:border-accent transition-all"
        >
          <input
            type="text"
            placeholder="Ask anything about the codebase (e.g., 'Where is auth handled?', 'What does function X do?')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-transparent border-none py-2 px-3 text-xs text-white placeholder-muted focus:outline-none font-mono"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-accent hover:bg-accent-hover text-white p-2.5 rounded-lg transition-all disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
