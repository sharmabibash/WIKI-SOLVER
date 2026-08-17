'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Info,
  CheckCircle2
} from 'lucide-react';

export default function ResultPath({ path, intersectionNode, onSelectArticle }) {
  const [copied, setCopied] = useState(false);

  if (!path || path.length === 0) return null;

  const handleCopyPath = () => {
    const text = path.join(' → ');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hops = path.length - 1;

  return (
    <div className="glass-panel-elevated rounded-2xl p-5 md:p-6 border border-emerald-500/30 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Background glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white">
                Shortest Path Discovered!
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {hops} {hops === 1 ? 'Hop' : 'Hops'} ({path.length} Articles)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Bidirectional BFS met at{' '}
              <span className="text-yellow-400 font-semibold underline decoration-yellow-500/50">
                {intersectionNode}
              </span>
            </p>
          </div>
        </div>

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopyPath}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Path</span>
            </>
          )}
        </button>
      </div>

      {/* Path Node Sequence */}
      <div className="flex flex-wrap items-center gap-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
        {path.map((article, idx) => {
          const isStart = idx === 0;
          const isTarget = idx === path.length - 1;
          const isIntersection = article === intersectionNode;

          return (
            <React.Fragment key={`${article}-${idx}`}>
              <div className="group relative flex items-center">
                <button
                  type="button"
                  onClick={() => onSelectArticle?.(article)}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all border shadow-sm ${
                    isIntersection
                      ? 'bg-yellow-500/20 border-yellow-500/60 text-yellow-300 hover:bg-yellow-500/30 shadow-[0_0_12px_rgba(250,204,21,0.4)] ring-1 ring-yellow-400/40'
                      : isStart
                      ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 hover:bg-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : isTarget
                      ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 hover:bg-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                      : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/25'
                  }`}
                >
                  <span className="text-[10px] opacity-60 font-mono">
                    {idx + 1}.
                  </span>
                  <span>{article}</span>

                  {isIntersection && (
                    <span className="text-[9px] uppercase tracking-wider bg-yellow-400/20 text-yellow-300 px-1 rounded border border-yellow-400/30">
                      Intersection
                    </span>
                  )}
                  {isStart && (
                    <span className="text-[9px] uppercase tracking-wider bg-cyan-400/20 text-cyan-300 px-1 rounded border border-cyan-400/30">
                      Start
                    </span>
                  )}
                  {isTarget && (
                    <span className="text-[9px] uppercase tracking-wider bg-rose-400/20 text-rose-300 px-1 rounded border border-rose-400/30">
                      Target
                    </span>
                  )}
                </button>

                <a
                  href={`https://en.wikipedia.org/wiki/${encodeURIComponent(article)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 p-1 text-slate-400 hover:text-white"
                  title="Open Wikipedia page"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {idx < path.length - 1 && (
                <ArrowRight className="w-4 h-4 text-emerald-400/70 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
