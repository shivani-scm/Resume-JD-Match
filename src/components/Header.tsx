/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Cpu, Zap, WifiOff } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header id="app-header" className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-700 flex items-center justify-center text-white font-bold shadow-sm">
            <Cpu className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">ResumeMatch</h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                v1.0 Deterministic
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Zero-LLM Resume & Job Description Requirement Verification Engine
            </p>
          </div>
        </div>

        {/* System Trust & Privacy Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Client-Side Privacy</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 border border-sky-200 text-sky-800 font-medium">
            <Zap className="w-3.5 h-3.5 text-sky-600" />
            <span>Zero External API Calls</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-medium">
            <WifiOff className="w-3.5 h-3.5 text-amber-600" />
            <span>Offline Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
};
