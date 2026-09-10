/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Target, ArrowRight } from 'lucide-react';
import type { AnalysisResult, ResumeProfile, JobProfile } from '../models/types.ts';
import { analyzeResponsibilities } from '../engine/matchingEngine.ts';

interface ResponsibilitiesViewProps {
  result: AnalysisResult;
  resumeProfile: ResumeProfile;
  jobProfile: JobProfile;
}

export const ResponsibilitiesView: React.FC<ResponsibilitiesViewProps> = ({
  resumeProfile,
  jobProfile,
}) => {
  const { averageSimilarity, detailedMatches } = analyzeResponsibilities(resumeProfile, jobProfile);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Duty & Responsibility Alignment Analysis
          </h3>
          <p className="text-xs text-slate-500">
            Semantic overlap calculated via BM25 information retrieval and TF-IDF cosine similarity.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200">
          <Target className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-indigo-900">
            Average Responsibility Alignment: {(averageSimilarity * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {detailedMatches.map((item, idx) => {
          const simPct = Math.round(item.similarity * 100);
          let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
          if (simPct < 40) badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
          else if (simPct < 65) badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';

          return (
            <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">
                  Job Duty #{idx + 1}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor}`}>
                  {simPct}% Similarity
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-800 mb-3 bg-white p-2.5 rounded border border-slate-200">
                {item.jdResponsibility}
              </p>

              <div className="flex items-start gap-2 pt-2 border-t border-slate-200/70">
                <ArrowRight className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-bold text-slate-600 block mb-0.5">
                    Closest Candidate Resume Evidence:
                  </span>
                  <p className="text-xs text-slate-700 italic">
                    "{item.bestResumeBullet}"
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
