/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calculator, ShieldAlert, Layers } from 'lucide-react';
import type { AnalysisResult } from '../models/types.ts';

interface ScoreAuditViewProps {
  result: AnalysisResult;
}

export const ScoreAuditView: React.FC<ScoreAuditViewProps> = ({ result }) => {
  const { categoryScores, penalties, totalPenalties, baseScore, overallScore } = result;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900">
          Mathematical Score Audit Trail & Formula Breakdown
        </h3>
        <p className="text-xs text-slate-500">
          Complete transparent accounting of all weighted additions, penalty deductions, and final clamping.
        </p>
      </div>

      {/* Formula Box */}
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs text-slate-800 space-y-2">
        <div className="text-slate-500 font-sans font-bold uppercase text-[11px]">Core Scoring Equation</div>
        <div className="p-2.5 bg-white rounded border border-slate-200 text-indigo-950 font-bold overflow-x-auto">
          FinalScore = clamp(0, 100, (∑ W_i × CategoryScore_i) − ∑ Penalties_j)
        </div>
        <div className="text-[11px] text-slate-600 font-sans">
          Base Score ({baseScore}) − Total Deductions ({totalPenalties}) = <strong>{overallScore} / 100</strong>
        </div>
      </div>

      {/* Category Additions Table */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-1.5">
          <Calculator className="w-4 h-4 text-indigo-600" />
          Weighted Category Contributions (Base Score)
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Evidence Category</th>
                <th className="py-2.5 px-3">Weight (W_i)</th>
                <th className="py-2.5 px-3">Raw Quality (0-100%)</th>
                <th className="py-2.5 px-3">Earned Points</th>
                <th className="py-2.5 px-3">Max Possible</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {categoryScores.map((cat, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-sans font-semibold text-slate-900">{cat.label}</td>
                  <td className="py-2 px-3 text-slate-600">{(cat.weight * 100).toFixed(0)}%</td>
                  <td className="py-2 px-3 text-slate-800">{cat.score}%</td>
                  <td className="py-2 px-3 font-bold text-indigo-700">+{cat.weightedContribution.toFixed(1)}</td>
                  <td className="py-2 px-3 text-slate-500">{cat.maxContribution} pts</td>
                </tr>
              ))}
              <tr className="bg-slate-50/90 font-bold border-t border-slate-200">
                <td colSpan={3} className="py-2.5 px-3 font-sans text-slate-900">
                  Total Base Score (Pre-penalties)
                </td>
                <td className="py-2.5 px-3 text-indigo-900">+{baseScore.toFixed(1)} pts</td>
                <td className="py-2.5 px-3 text-slate-500">100 pts</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Penalty Deductions */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          Penalty Deductions (Mandatory Prerequisite Violations)
        </h4>

        {penalties.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-rose-50 text-rose-900 uppercase text-[11px] font-bold border-y border-rose-200">
                <tr>
                  <th className="py-2.5 px-3">Penalty Identifier</th>
                  <th className="py-2.5 px-3">Specific Condition</th>
                  <th className="py-2.5 px-3">Deduction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-100">
                {penalties.map((d, idx) => (
                  <tr key={idx} className="hover:bg-rose-50/50">
                    <td className="py-2 px-3 font-bold text-rose-900">{d.penaltyType}</td>
                    <td className="py-2 px-3 text-rose-800">{d.reason}</td>
                    <td className="py-2 px-3 font-mono font-bold text-rose-600">
                      −{Math.abs(d.pointsDeducted).toFixed(1)} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium">
            ✓ No hard penalties triggered. Candidate meets all baseline prerequisites.
          </div>
        )}
      </div>

      {/* Pluggable Statistical Callback Model Note */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-2">
        <div className="font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          Architectural Separation: Match Score vs. Callback Probability
        </div>
        <p className="leading-relaxed">
          The <strong>Match Score (0–100)</strong> evaluates objective qualification alignment using deterministic rules and
          information retrieval. It answers <em>"How well does this candidate satisfy these specific requirements?"</em>
        </p>
        <p className="leading-relaxed">
          The <strong>Callback Probability Model</strong> (via the <code className="text-indigo-600 bg-white px-1 py-0.5 rounded border border-slate-200">ICallbackProbabilityModel</code> interface)
          is an empirical statistical layer designed to estimate real-world interview callback probability based on historical market outcomes,
          company hiring selectivity, and competitive candidate density.
        </p>
      </div>
    </div>
  );
};
