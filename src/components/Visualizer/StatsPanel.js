'use client';

import React from 'react';
import {
  Compass,
  Layers,
  Clock,
  Waypoints,
  Activity,
  GitCommit,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function StatsPanel({ stats, currentStepInfo, isRunning, isComplete }) {
  const formatTime = (ms) => {
    if (!ms) return '0.0s';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getDirectionBadge = () => {
    if (currentStepInfo.direction === 'collision') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-yellow-400" />
          COLLISION FOUND
        </span>
      );
    }
    if (currentStepInfo.direction === 'forward') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          FORWARD EXPANSION
        </span>
      );
    }
    if (currentStepInfo.direction === 'backward') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
          BACKWARD EXPANSION
        </span>
      );
    }
    if (currentStepInfo.direction === 'error') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-rose-400" />
          NO PATH
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
        STANDBY
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Current Step Banner */}
      <div className="glass-panel rounded-xl p-3.5 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-lg">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-cyan-400 shrink-0">
            <Activity className={`w-4 h-4 ${isRunning ? 'animate-pulse' : ''}`} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              Current Algorithm State
            </div>
            <div className="text-xs sm:text-sm font-medium text-slate-200 truncate mt-0.5">
              {currentStepInfo.message || 'Waiting to begin BFS traversal...'}
            </div>
          </div>
        </div>
        <div className="shrink-0">{getDirectionBadge()}</div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
        {/* Forward Explored */}
        <div className="glass-card rounded-xl p-3 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium">Forward (S)</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-cyan-300">
            {stats.forwardCount || 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            queue: {stats.queueForwardSize || 0}
          </div>
        </div>

        {/* Backward Explored */}
        <div className="glass-card rounded-xl p-3 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium">Backward (T)</span>
            <span className="w-2 h-2 rounded-full bg-purple-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-purple-300">
            {stats.backwardCount || 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            queue: {stats.queueBackwardSize || 0}
          </div>
        </div>

        {/* Total Nodes Explored */}
        <div className="glass-card rounded-xl p-3 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium">Explored</span>
            <GitCommit className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-100">
            {(stats.forwardCount || 0) + (stats.backwardCount || 0)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            total articles visited
          </div>
        </div>

        {/* Search Depth */}
        <div className="glass-card rounded-xl p-3 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium">BFS Depth</span>
            <Layers className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-sky-400">
            {stats.depth || 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            max frontier level
          </div>
        </div>

        {/* Shortest Path Degrees */}
        <div className="glass-card rounded-xl p-3 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium">Separation</span>
            <Waypoints className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-emerald-400">
            {isComplete && stats.hops ? `${stats.hops} hops` : stats.hops ? `${stats.hops} hops` : '--'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            degrees of links
          </div>
        </div>

        {/* Elapsed Time */}
        <div className="glass-card rounded-xl p-3 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium">Duration</span>
            <Clock className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-amber-400">
            {formatTime(stats.elapsedMs)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            live computation
          </div>
        </div>
      </div>
    </div>
  );
}
