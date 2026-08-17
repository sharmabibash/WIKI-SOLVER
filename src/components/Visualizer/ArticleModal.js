'use client';

import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Loader2, BookOpen, GitFork } from 'lucide-react';
import { fetchArticleSummary } from '../../wiki/fetchWikiPage';

export default function ArticleModal({ articleTitle, nodeData, onClose }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!articleTitle) return;
    let isMounted = true;
    setLoading(true);

    fetchArticleSummary(articleTitle)
      .then((data) => {
        if (isMounted) {
          setSummary(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [articleTitle]);

  if (!articleTitle) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Wikipedia Article Preview
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[75vh] overflow-y-auto space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              <p className="text-xs">Fetching summary from Wikipedia...</p>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-4">
                {summary?.thumbnail && (
                  <img
                    src={summary.thumbnail}
                    alt={summary.title}
                    className="w-24 h-24 rounded-xl object-cover border border-slate-700/80 bg-slate-950 shrink-0 shadow-md"
                  />
                )}
                <div>
                  <h3 className="text-lg font-bold text-slate-100">
                    {summary?.title || articleTitle}
                  </h3>
                  {summary?.description && (
                    <p className="text-xs text-slate-400 mt-1 font-medium italic">
                      {summary.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Node BFS Properties */}
              {nodeData && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold block">
                      Search Direction
                    </span>
                    <span className="text-slate-200 capitalize font-medium">
                      {nodeData.direction || 'Neutral'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold block">
                      BFS Level
                    </span>
                    <span className="text-slate-200 font-medium">
                      Level {nodeData.level ?? 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold block">
                      Status
                    </span>
                    <span className="text-slate-200 capitalize font-medium">
                      {nodeData.status || 'Explored'}
                    </span>
                  </div>
                </div>
              )}

              {/* Extract */}
              <div className="text-sm text-slate-300 leading-relaxed bg-slate-800/30 p-3.5 rounded-xl border border-slate-800/50">
                {summary?.extract || 'No extract description available for this page.'}
              </div>

              {/* Footer action */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <a
                  href={summary?.url || `https://en.wikipedia.org/wiki/${encodeURIComponent(articleTitle)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-600/30"
                >
                  <span>Open on Wikipedia</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
