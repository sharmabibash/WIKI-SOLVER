'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, ExternalLink, Sparkles } from 'lucide-react';
import { searchWikiArticles } from '../../wiki/fetchWikiPage';

export default function WikiSearch({
  label = 'Search Article',
  placeholder = 'Type a Wikipedia article...',
  value = '',
  onChange,
  onSelect,
  accentColor = 'cyan', // 'cyan' | 'purple' | 'rose'
  disabled = false
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const res = await searchWikiArticles(query);
      setResults(res);
      setIsLoading(false);
      setIsOpen(true);
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    setQuery(item.title);
    onChange?.(item.title);
    onSelect?.(item);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange?.('');
    setResults([]);
    setIsOpen(false);
  };

  const colorStyles = {
    cyan: {
      border: 'focus-within:border-cyan-500 focus-within:ring-cyan-500/20',
      badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      dot: 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
    },
    purple: {
      border: 'focus-within:border-purple-500 focus-within:ring-purple-500/20',
      badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      dot: 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]'
    },
    rose: {
      border: 'focus-within:border-rose-500 focus-within:ring-rose-500/20',
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      dot: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
    }
  }[accentColor] || colorStyles.cyan;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${colorStyles.dot}`} />
          {label}
        </label>
        {value && (
          <a
            href={`https://en.wikipedia.org/wiki/${encodeURIComponent(value)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
          >
            Wiki <ExternalLink className="w-2.5 h-2.5" />
          </a>
        )}
      </div>

      <div
        className={`relative flex items-center bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 transition-all shadow-inner focus-within:ring-2 ${colorStyles.border} ${
          disabled ? 'opacity-60 pointer-events-none' : ''
        }`}
      >
        <Search className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange?.(e.target.value);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm font-medium focus:outline-none"
        />

        {isLoading && (
          <Loader2 className="w-4 h-4 text-slate-400 animate-spin shrink-0 ml-2" />
        )}

        {query && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl backdrop-blur-xl max-h-72 overflow-y-auto p-1.5 divide-y divide-slate-800/50 animate-in fade-in slide-in-from-top-2 duration-150">
          {results.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full text-left p-2.5 hover:bg-slate-800/80 rounded-lg flex items-center gap-3 transition-colors group"
            >
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-10 h-10 rounded-md object-cover bg-slate-950 border border-slate-800 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-md bg-slate-800/60 border border-slate-700/50 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-200 group-hover:text-white truncate">
                  {item.title}
                </div>
                {item.description ? (
                  <div className="text-xs text-slate-400 truncate mt-0.5">
                    {item.description}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    Wikipedia Article
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
