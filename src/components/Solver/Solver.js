'use client';

import React, { useState, useRef } from 'react';
import StartTargetSelector from './StartTargetSelector';
import ResultPath from './ResultPath';
import GraphVisualizer from '../Visualizer/GraphVisualizer';
import BFSControls from '../Visualizer/BFSControls';
import StatsPanel from '../Visualizer/StatsPanel';
import Legend from '../Visualizer/Legend';
import ArticleModal from '../Visualizer/ArticleModal';
import { useBFSVisualizer } from '../../hooks/useBFSVisualizer';
import {
  BookOpen,
  Terminal,
  ChevronDown,
  ChevronUp,
  Cpu,
  Share2,
  ExternalLink,
  Code2,
  HelpCircle
} from 'lucide-react';

export default function Solver() {
  const {
    isRunning,
    isPaused,
    isComplete,
    speed,
    setSpeed,
    startNode,
    targetNode,
    graphData,
    shortestPath,
    intersectionNode,
    currentStepInfo,
    stats,
    logs,
    selectedArticle,
    setSelectedArticle,
    startSolving,
    pauseSolving,
    resumeSolving,
    stepForward,
    resetSolving
  } = useBFSVisualizer();

  const [inputStart, setInputStart] = useState('Albert Einstein');
  const [inputTarget, setInputTarget] = useState('Quantum computing');
  const [showLogs, setShowLogs] = useState(false);
  const [showDSAExplanation, setShowDSAExplanation] = useState(false);
  const [inspectedNodeData, setInspectedNodeData] = useState(null);

  const visualizerRef = useRef(null);

  const handleStart = (s, t) => {
    startSolving(s, t);
  };

  const handleSelectNode = (title, nodeData) => {
    setSelectedArticle(title);
    setInspectedNodeData(nodeData);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16">
      {/* 1. Header Hero Selector */}
      <StartTargetSelector
        startNode={inputStart}
        targetNode={inputTarget}
        setStartNode={setInputStart}
        setTargetNode={setInputTarget}
        onSolve={handleStart}
        onPause={pauseSolving}
        onResume={resumeSolving}
        onReset={resetSolving}
        isRunning={isRunning}
        isPaused={isPaused}
        disabled={isRunning}
      />

      {/* 2. Shortest Path Banner (when completed or found) */}
      {shortestPath.length > 0 && (
        <ResultPath
          path={shortestPath}
          intersectionNode={intersectionNode}
          onSelectArticle={(title) => handleSelectNode(title, null)}
        />
      )}

      {/* 3. DSA Performance Stats & Step State */}
      <StatsPanel
        stats={stats}
        currentStepInfo={currentStepInfo}
        isRunning={isRunning}
        isComplete={isComplete}
      />

      {/* 4. Playback Controls Toolbar */}
      <BFSControls
        isRunning={isRunning}
        isPaused={isPaused}
        isComplete={isComplete}
        speed={speed}
        setSpeed={setSpeed}
        onPlay={() => {
          if (isPaused) resumeSolving();
          else handleStart(inputStart, inputTarget);
        }}
        onPause={pauseSolving}
        onStepForward={stepForward}
        onReset={resetSolving}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        onResetZoom={() => {}}
        currentStepInfo={currentStepInfo}
      />

      {/* 5. Main Visualizer Graph & Legend */}
      <div className="space-y-4">
        <GraphVisualizer
          graphData={graphData}
          startNode={startNode || inputStart}
          targetNode={targetNode || inputTarget}
          intersectionNode={intersectionNode}
          shortestPath={shortestPath}
          onSelectNode={handleSelectNode}
          activeNode={currentStepInfo.activeNode}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Legend />

          {/* Quick Logs and DSA theory accordion */}
          <div className="space-y-3">
            {/* Live Algorithm Event Stream */}
            <div className="glass-panel rounded-xl border border-slate-800/80 p-3 shadow-xl">
              <button
                type="button"
                onClick={() => setShowLogs(!showLogs)}
                className="w-full flex items-center justify-between font-semibold text-xs text-slate-300 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Execution Event Log ({logs.length})</span>
                </div>
                {showLogs ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {showLogs && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/60 max-h-48 overflow-y-auto space-y-1.5 font-mono text-[11px]">
                  {logs.length === 0 ? (
                    <div className="text-slate-500 italic py-2">No event logs recorded yet.</div>
                  ) : (
                    logs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-2 p-1.5 rounded bg-slate-950/40 text-slate-300"
                      >
                        <span className="text-slate-500 shrink-0">{log.time}</span>
                        <span
                          className={
                            log.type === 'collision'
                              ? 'text-yellow-400 font-bold'
                              : log.type === 'forward'
                              ? 'text-cyan-300'
                              : log.type === 'backward'
                              ? 'text-purple-300'
                              : 'text-slate-300'
                          }
                        >
                          {log.message}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Bidirectional BFS DSA Info */}
            <div className="glass-panel rounded-xl border border-slate-800/80 p-3 shadow-xl">
              <button
                type="button"
                onClick={() => setShowDSAExplanation(!showDSAExplanation)}
                className="w-full flex items-center justify-between font-semibold text-xs text-slate-300 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Why Bidirectional BFS is O(b^(d/2)) vs O(b^d)</span>
                </div>
                {showDSAExplanation ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {showDSAExplanation && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/60 text-xs text-slate-300 space-y-2 leading-relaxed">
                  <p>
                    Standard Breadth-First Search from start to target explores up to{' '}
                    <strong className="text-cyan-300 font-mono">O(b^d)</strong> nodes where{' '}
                    <code className="text-slate-200">b</code> is the average branching factor (~50-300 Wikipedia links) and{' '}
                    <code className="text-slate-200">d</code> is the shortest distance.
                  </p>
                  <p>
                    <strong>Bidirectional BFS</strong> runs two simultaneous searches: forward from the start article and backward from the target article. Meeting in the middle reduces the search radius to <code className="text-slate-200">d/2</code> on each side, reducing the total explored space to{' '}
                    <strong className="text-emerald-400 font-mono">O(2 &times; b^(d/2)) &lt;&lt; O(b^d)</strong>!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Wikipedia Article Modal Inspector */}
      {selectedArticle && (
        <ArticleModal
          articleTitle={selectedArticle}
          nodeData={inspectedNodeData}
          onClose={() => {
            setSelectedArticle(null);
            setInspectedNodeData(null);
          }}
        />
      )}
    </div>
  );
}
