'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function Legend() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="glass-panel rounded-xl border border-slate-800/80 p-3 shadow-xl backdrop-blur-md text-xs">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between font-semibold text-slate-300 hover:text-white transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>Graph Legend</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3 pt-2.5 border-t border-slate-800/60 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] shrink-0" />
            <span className="text-slate-300 text-[11px]">Start Article</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] shrink-0" />
            <span className="text-slate-300 text-[11px]">Target Article</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.6)] shrink-0" />
            <span className="text-slate-300 text-[11px]">Forward Search (Links)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.6)] shrink-0" />
            <span className="text-slate-300 text-[11px]">Backward Search (Backlinks)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.9)] animate-pulse shrink-0" />
            <span className="text-slate-300 text-[11px] font-semibold text-yellow-300">Meeting Intersection</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)] shrink-0" />
            <span className="text-slate-300 text-[11px] font-semibold text-emerald-300">Shortest Path</span>
          </div>
        </div>
      )}
    </div>
  );
}
