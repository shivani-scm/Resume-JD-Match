/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Award,
  TrendingUp,
} from 'lucide-react';
import type { AnalysisResult } from '../models/types.ts';

interface ResultsOverviewProps {
  result: AnalysisResult;
}

export const ResultsOverview: React.FC<ResultsOverviewProps> = ({ result }) => {
  const {
    overallScore,
    categoryScores,
    penalties,
    totalPenalties,
    baseScore,
    scoreBand,
    recommendation,
    matches,
    partialMatches,
    missingRequirements,
    risks,
  } = result;

  const getScoreBandStyle = (score: number) => {
    if (score >= 85) return { color: 'text-emerald-700 bg-emerald-50 border-emerald-300' };
    if (score >= 75) return { color: 'text-indigo-700 bg-indigo-50 border-indigo-300' };
    if (score >= 65) return { color: 'text-sky-700 bg-sky-50 border-sky-300' };
    if (score >= 50) return { color: 'text-amber-700 bg-amber-50 border-amber-300' };
    if (score >= 35) return { color: 'text-orange-700 bg-orange-50 border-orange-300' };
    return { color: 'text-rose-700 bg-rose-50 border-rose-300' };
  };

  const getRecBadge = (rec: string) => {
    switch (rec) {
      case 'HIGH PRIORITY APPLICATION':
        return { label: 'HIGH PRIORITY APPLICATION', bg: 'bg-emerald-600 text-white' };
      case 'GOOD APPLICATION':
        return { label: 'GOOD APPLICATION', bg: 'bg-indigo-600 text-white' };
      case 'BORDERLINE':
        return { label: 'BORDERLINE (TAILOR FIRST)', bg: 'bg-amber-600 text-white' };
      case 'LOW PRIORITY':
      default:
        return { label: 'LOW PRIORITY (STRETCH)', bg: 'bg-rose-600 text-white' };
    }
  };

  const bandStyle = getScoreBandStyle(overallScore);
  const recBadge = getRecBadge(recommendation);

  return (
    <div id="results-overview-section" className="space-y-6 mb-8">
      {/* Hero Score Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Main Score Display */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-1">
              Overall Match Score
            </span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-5xl font-black text-slate-900 tracking-tight">
                {overallScore}
              </span>
              <span className="text-xl font-bold text-slate-400">/ 100</span>
            </div>

            <div className={`mt-2 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase border ${bandStyle.color}`}>
              {scoreBand}
            </div>

            {/* Base score vs penalties decomposition */}
            <div className="mt-4 pt-3 border-t border-slate-200 w-full flex justify-between text-xs text-slate-600 font-mono">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Base Score</span>
                <span className="font-semibold text-slate-800">{baseScore}</span>
              </div>
              <div className="text-slate-300 font-bold self-center">−</div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Penalties</span>
                <span className="font-semibold text-rose-600">
                  {totalPenalties} pts
                </span>
              </div>
              <div className="text-slate-300 font-bold self-center">=</div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Final Score</span>
                <span className="font-bold text-indigo-700">{overallScore}</span>
              </div>
            </div>
          </div>

          {/* Recommendation & Assessment */}
          <div className="lg:col-span-8 flex flex-col justify-between h-full space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Application Verdict:
                </span>
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${recBadge.bg}`}>
                  {recBadge.label}
                </span>
                <span className="text-xs font-medium text-slate-500 ml-auto flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                  Deterministic Rating
                </span>
              </div>

              <p className="text-sm font-medium text-slate-800 leading-relaxed">
                {overallScore >= 80
                  ? 'Strong alignment across core requirements, professional tenure, and functional competencies. Application is well positioned for candidate review.'
                  : overallScore >= 60
                  ? 'Solid foundation with partial matches and domain overlap. Address specific terminology or skill gaps through targeted resume tailoring.'
                  : 'Noticeable divergence from mandatory requirements or tenure prerequisites. Targeted upskilling or substantial narrative tailoring is recommended.'}
              </p>
            </div>

            {/* Practical Advice */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <span className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-indigo-600" />
                Deterministic Scoring Strategy:
              </span>
              <ul className="space-y-1 text-xs text-slate-600">
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>Mirror canonical keywords from the Job Description directly in achievement bullet points.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>Ensure all mandatory certifications and degrees are prominently featured in designated sections.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 9-Category Score Breakdown Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Category Breakdown (9-Factor Multi-Tier Model)
          </h3>
          <span className="text-xs text-slate-400">Total Weight: 100%</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryScores.map((cat, idx) => {
            const pct = cat.score;
            let barColor = 'bg-indigo-600';
            if (pct >= 80) barColor = 'bg-emerald-600';
            else if (pct >= 60) barColor = 'bg-indigo-600';
            else if (pct >= 40) barColor = 'bg-amber-500';
            else barColor = 'bg-rose-500';

            return (
              <div key={idx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800">{cat.label}</span>
                  <span className="text-xs font-mono font-semibold text-slate-600">
                    {cat.weightedContribution} / {cat.maxContribution} pts
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-1.5">
                  <div
                    className={`h-full ${barColor} transition-all duration-500`}
                    style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>Weight: {(cat.weight * 100).toFixed(0)}%</span>
                  <span>Score: {cat.score}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Highlight Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Strong Matches */}
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
          <div className="flex items-center gap-2 mb-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Strong Matches ({matches.length})
          </div>
          {matches.length > 0 ? (
            <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {matches.map((item, idx) => (
                <li key={idx} className="text-xs text-emerald-800 flex items-start gap-1.5">
                  <span className="text-emerald-500 shrink-0 font-bold">✓</span>
                  <span className="break-words">
                    <strong>{item.requirement}</strong> {item.resumeEvidence && `(${item.resumeEvidence})`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-700 italic">No exact or canonical skill matches found.</p>
          )}
        </div>

        {/* Partial Matches */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
          <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Partial / Related ({partialMatches.length})
          </div>
          {partialMatches.length > 0 ? (
            <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {partialMatches.map((item, idx) => (
                <li key={idx} className="text-xs text-amber-800 flex items-start gap-1.5">
                  <span className="text-amber-500 shrink-0 font-bold">△</span>
                  <span className="break-words">
                    <strong>{item.requirement}</strong> {item.notes && `— ${item.notes}`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-amber-700 italic">No partial or fuzzy matches.</p>
          )}
        </div>

        {/* Missing Requirements & Deductions */}
        <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200">
          <div className="flex items-center gap-2 mb-2 text-rose-900 font-bold text-xs uppercase tracking-wider">
            <XCircle className="w-4 h-4 text-rose-600" />
            Missing & Penalties ({missingRequirements.length + penalties.length})
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {missingRequirements.length > 0 && (
              <ul className="space-y-1">
                {missingRequirements.map((item, idx) => (
                  <li key={idx} className="text-xs text-rose-800 flex items-start gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>Missing: <strong className="font-semibold">{item.requirement}</strong></span>
                  </li>
                ))}
              </ul>
            )}
            {penalties.length > 0 && (
              <div className="pt-2 border-t border-rose-200">
                <span className="text-[11px] font-bold text-rose-900 block mb-1">Active Penalties:</span>
                <ul className="space-y-1">
                  {penalties.map((pen, idx) => (
                    <li key={idx} className="text-xs text-rose-700 flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">−{pen.pointsDeducted}</span>
                      <span>{pen.reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
