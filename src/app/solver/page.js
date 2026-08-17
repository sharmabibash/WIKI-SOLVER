'use client';

import React from 'react';
import Link from 'next/link';
import Solver from '../../components/Solver/Solver';
import { ArrowLeft, GitMerge } from 'lucide-react';

export default function SolverPage() {
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 p-4 sm:p-6 relative">
      <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
          <GitMerge className="w-4 h-4" />
          <span>Double-Sided BFS Solver</span>
        </div>
      </div>

      <Solver />
    </div>
  );
}
