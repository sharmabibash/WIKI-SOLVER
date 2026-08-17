'use client';

import React from 'react';
import Link from 'next/link';
import Solver from '../components/Solver/Solver';
import {
  Sparkles,
  GitMerge,
  Cpu,
  Zap,
  Globe,
  Share2,
  Compass,
  ArrowRight,
  ShieldCheck,
  Github
} from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#080c14] text-slate-100 relative overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-radial-gradient pointer-events-none" />
      <div className="absolute top-24 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-36 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#080c14] rounded-xl flex items-center justify-center">
                <GitMerge className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight flex items-center gap-1.5">
                <span className="text-white">Wiki</span>
                <span className="text-gradient-cyan">Solver</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Bidirectional BFS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Shortest Path Graph Visualizer
              </p>
            </div>
          </div>

          {/* Right Header Badges */}
          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px]">Complexity: O(b^(d/2))</span>
            </div>

            <a
              href="https://en.wikipedia.org/wiki/Wikipedia:Six_degrees_of_Wikipedia"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 font-medium transition-all flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Six Degrees Wiki</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="pt-8 pb-4 px-4 sm:px-6 max-w-7xl mx-auto text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Double-Sided BFS Wikipedia Trail Solver</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Find Shortest Path Between Any Two{' '}
          <span className="text-gradient-cyan">Wikipedia Articles</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Traverse millions of Wikipedia links with optimal efficiency. Watch forward and backward breadth-first search frontiers expand simultaneously until they collide.
        </p>
      </section>

      {/* Main Interactive Solver Section */}
      <section className="px-4 sm:px-6 max-w-7xl mx-auto mt-6">
        <Solver />
      </section>

      {/* Algorithm Mechanics & Features Section */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-slate-800/80 mt-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            How Bidirectional BFS Works on Wikipedia
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Standard BFS explores an exponentially huge tree. Bidirectional BFS cuts the exponential search radius in half.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">1. Forward Outgoing Links</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Expands the forward frontier starting from the start page, querying live Wikipedia links pointing outwards to related topics.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-purple-500/40 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">2. Backward Incoming Backlinks</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Expands the backward frontier from the target page by extracting incoming backlinks — articles that link to the destination.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-yellow-500/40 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GitMerge className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">3. Middle Intersection & Stitch</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              The instant a node appears in both frontiers, a collision is detected. The algorithm stitches both parent chains into the guaranteed shortest path.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-8 px-4 sm:px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400 font-medium">
            <span>WikiSolver</span>
            <span>•</span>
            <span>Data Structures & Graph Algorithms Visualizer</span>
          </div>
          <div className="text-slate-500">
            Powered by Wikipedia Action & REST APIs • Next.js & D3 Force
          </div>
        </div>
      </footer>
    </main>
  );
}
