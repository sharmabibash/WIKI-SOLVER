'use client';

import React from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Gauge,
  Activity
} from 'lucide-react';

const SPEED_OPTIONS = [
  { label: '0.25x', value: 0.25 },
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '2x', value: 2 },
  { label: '5x', value: 5 },
  { label: 'Max', value: 15 }
];

export default function BFSControls({
  isRunning,
  isPaused,
  isComplete,
  speed,
  setSpeed,
  onPlay,
  onPause,
  onStepForward,
  onReset,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  currentStepInfo
}) {
  const isSteppingAvailable = (isRunning && isPaused) || (!isRunning && !isComplete);

  return (
    <div className="glass-panel rounded-2xl p-3 md:p-4 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shadow-xl">
      {/* Playback Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {!isRunning ? (
          <button
            type="button"
            onClick={onPlay}
            disabled={isComplete}
            title="Start / Play"
            className="p-2.5 sm:px-4 sm:py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/30 transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Play</span>
          </button>
        ) : isPaused ? (
          <button
            type="button"
            onClick={onPlay}
            title="Resume"
            className="p-2.5 sm:px-4 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Resume</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onPause}
            title="Pause"
            className="p-2.5 sm:px-4 sm:py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-amber-600/30 transition-all active:scale-95"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Pause</span>
          </button>
        )}

        {/* Step forward */}
        <button
          type="button"
          onClick={onStepForward}
          disabled={isComplete}
          title="Step Next Hop / Node"
          className="p-2.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/70 font-medium text-xs flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
        >
          <SkipForward className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Step</span>
        </button>

        {/* Reset */}
        <button
          type="button"
          onClick={onReset}
          title="Reset"
          className="p-2.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/70 font-medium text-xs flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Speed Selector */}
      <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
        <div className="text-[11px] text-slate-500 px-2 flex items-center gap-1 font-medium">
          <Gauge className="w-3 h-3 text-slate-400" />
          <span className="hidden md:inline">Speed:</span>
        </div>
        {SPEED_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setSpeed(opt.value)}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
              speed === opt.value
                ? 'bg-cyan-500 text-black shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Canvas View Controls & Max Depth Badge */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 font-medium">
          <Activity className="w-3 h-3 text-cyan-400" />
          <span>Max Search: <strong className="text-cyan-300">10 Steps</strong></span>
        </div>

        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={onZoomIn}
            title="Zoom In"
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onZoomOut}
            title="Zoom Out"
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onResetZoom}
            title="Center / Fit View"
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
