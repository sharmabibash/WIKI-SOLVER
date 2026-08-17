'use client';

import React, { useState } from 'react';
import { ArrowLeftRight, Shuffle, Play, Pause, RotateCcw, Zap, Sparkles } from 'lucide-react';
import WikiSearch from './WikiSearch';
import { PRESET_PAIRS } from '../../utils/presets';
import { fetchRandomArticles } from '../../wiki/fetchWikiPage';

export default function StartTargetSelector({
  startNode,
  targetNode,
  setStartNode,
  setTargetNode,
  onSolve,
  onPause,
  onResume,
  onReset,
  isRunning,
  isPaused,
  disabled
}) {
  const [isRandomizing, setIsRandomizing] = useState(false);

  const handleSwap = () => {
    if (disabled) return;
    const temp = startNode;
    setStartNode(targetNode);
    setTargetNode(temp);
  };

  const handleRandomize = async () => {
    if (disabled) return;
    setIsRandomizing(true);
    try {
      const randoms = await fetchRandomArticles();
      if (randoms.length >= 2) {
        setStartNode(randoms[0]);
        setTargetNode(randoms[1]);
      }
    } finally {
      setIsRandomizing(false);
    }
  };

  const handleApplyPreset = (preset) => {
    if (disabled) return;
    setStartNode(preset.start);
    setTargetNode(preset.target);
  };

  const canSolve = startNode.trim() && targetNode.trim() && !disabled;

  return (
    <div className="glass-panel-elevated rounded-2xl p-5 md:p-6 shadow-2xl border border-slate-800/80 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Selection Row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto] gap-4 items-end relative z-10">
        {/* Start Article Search */}
        <div className="w-full">
          <WikiSearch
            label="Start Article"
            placeholder="e.g. Albert Einstein"
            value={startNode}
            onChange={setStartNode}
            accentColor="cyan"
            disabled={disabled}
          />
        </div>

        {/* Swap & Randomize Buttons */}
        <div className="flex items-center justify-center gap-2 pb-0.5">
          <button
            type="button"
            onClick={handleSwap}
            disabled={disabled || !startNode || !targetNode}
            title="Swap Start and Target"
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleRandomize}
            disabled={disabled || isRandomizing}
            title="Pick Random Wikipedia Articles"
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Shuffle className={`w-4 h-4 ${isRandomizing ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>

        {/* Target Article Search */}
        <div className="w-full">
          <WikiSearch
            label="Target Article"
            placeholder="e.g. Quantum computing"
            value={targetNode}
            onChange={setTargetNode}
            accentColor="purple"
            disabled={disabled}
          />
        </div>

        {/* Solve / Action CTA */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto">
          {!isRunning ? (
            <button
              type="button"
              onClick={() => onSolve?.(startNode, targetNode)}
              disabled={!canSolve}
              className={`w-full lg:w-auto px-6 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
                canSolve
                  ? 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white hover:brightness-110 shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Find Shortest Path</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 w-full lg:w-auto">
              {isPaused ? (
                <button
                  type="button"
                  onClick={onResume}
                  className="w-full lg:w-auto px-5 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-600/30"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Resume</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onPause}
                  className="w-full lg:w-auto px-5 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-lg shadow-amber-600/30"
                >
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause</span>
                </button>
              )}

              <button
                type="button"
                onClick={onReset}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all hover:scale-105 active:scale-95"
                title="Reset Graph"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Preset Pairs Bar */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <div className="text-slate-400 font-medium whitespace-nowrap flex items-center gap-1 shrink-0 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Presets:</span>
        </div>

        <div className="flex items-center gap-2">
          {PRESET_PAIRS.map((preset) => {
            const isSelected = startNode === preset.start && targetNode === preset.target;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                disabled={disabled}
                className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all font-medium flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600 hover:text-white'
                } ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
              >
                <span>{preset.title}</span>
                <span className="text-[10px] text-slate-500 bg-slate-900/80 px-1.5 py-0.5 rounded">
                  {preset.expectedHops}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
