import React, { useEffect, useState } from 'react';
import { Sparkles, Terminal, Layers, ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 600);
    const timer2 = setTimeout(() => setStage(2), 1400);
    const timer3 = setTimeout(() => setStage(3), 2200);
    const timer4 = setTimeout(() => onFinish(), 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 bg-[#09090B] flex flex-col items-center justify-center select-none overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute w-[600px] h-[600px] bg-accent/15 rounded-full blur-[140px] pointer-events-none animate-pulse" />

      {/* Main Logo and Animated Rings */}
      <div className="relative mb-8 flex items-center justify-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-accent to-indigo-500 flex items-center justify-center shadow-2xl shadow-accent/40 relative z-10 transition-transform duration-700 scale-100 hover:scale-105">
          <Sparkles className="w-10 h-10 text-white animate-bounce" />
        </div>
        <div className="absolute w-28 h-28 rounded-full border border-accent/30 animate-ping" />
        <div className="absolute w-36 h-36 rounded-full border border-accent/15 animate-pulse" />
      </div>

      {/* Title with Gradient */}
      <div className="text-center space-y-2 relative z-10">
        <h1 className="text-3xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-accent uppercase font-mono">
          DevLense
        </h1>
        <p className="text-xs text-muted font-mono tracking-wider">
          AGENTIC CODEBASE INTELLIGENCE PLATFORM
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mt-10 w-72 space-y-2 relative z-10">
        <div className="w-full bg-zinc-900 border border-border/80 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-accent h-full transition-all duration-500 ease-out"
            style={{ width: `${stage === 0 ? 20 : stage === 1 ? 55 : stage === 2 ? 85 : 100}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] font-mono text-muted">
          <span>
            {stage === 0 && 'Initializing vector engine...'}
            {stage === 1 && 'Connecting ChromaDB store...'}
            {stage === 2 && 'Calibrating LangGraph router...'}
            {stage >= 3 && 'System ready.'}
          </span>
          <span className="text-accent font-semibold">{stage === 0 ? '20%' : stage === 1 ? '55%' : stage === 2 ? '85%' : '100%'}</span>
        </div>
      </div>
    </div>
  );
};
