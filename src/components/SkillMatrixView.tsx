/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import type { AnalysisResult, MatchResult } from '../models/types.ts';

interface SkillMatrixViewProps {
  result: AnalysisResult;
}

type FilterType = 'ALL' | 'REQUIRED' | 'PREFERRED' | 'MATCHED' | 'PARTIAL' | 'MISSING';

export const SkillMatrixView: React.FC<SkillMatrixViewProps> = ({ result }) => {
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const allMatches: MatchResult[] = [
    ...result.matches,
    ...result.partialMatches,
    ...result.missingRequirements,
  ];

  const filteredMatches = allMatches.filter((item) => {
    const isReq = item.category === 'REQUIRED';

    if (filter === 'REQUIRED' && !isReq) return false;
    if (filter === 'PREFERRED' && isReq) return false;
    if (filter === 'MATCHED' && item.matchType !== 'EXACT' && item.matchType !== 'ALIAS') return false;
    if (
      filter === 'PARTIAL' &&
      (item.matchType === 'EXACT' || item.matchType === 'ALIAS' || item.matchType === 'MISSING')
    )
      return false;
    if (filter === 'MISSING' && item.matchType !== 'MISSING') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchReq = item.requirement.toLowerCase().includes(q);
      const matchEvidence = (item.resumeEvidence || '').toLowerCase().includes(q);
      const matchNotes = (item.notes || '').toLowerCase().includes(q);
      return matchReq || matchEvidence || matchNotes;
    }

    return true;
  });

  const getBadgeStyle = (matchType: MatchResult['matchType']) => {
    switch (matchType) {
      case 'EXACT':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'ALIAS':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'ABBREVIATION':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'FUZZY':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'PHRASE':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'RELATED':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'PARTIAL':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'MISSING':
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Deterministic Skill Matching Matrix
          </h3>
          <p className="text-xs text-slate-500">
            6-Level verification: Exact, Canonical Alias, Abbreviation, Fuzzy Levenshtein, Phrase Overlap, Taxonomy Related.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search skill or evidence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b border-slate-100">
        {(['ALL', 'REQUIRED', 'PREFERRED', 'MATCHED', 'PARTIAL', 'MISSING'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              filter === f
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f === 'ALL' && `All (${allMatches.length})`}
            {f === 'REQUIRED' && `Required (${allMatches.filter((m) => m.category === 'REQUIRED').length})`}
            {f === 'PREFERRED' && `Preferred (${allMatches.filter((m) => m.category === 'PREFERRED').length})`}
            {f === 'MATCHED' &&
              `Matched (${allMatches.filter((m) => m.matchType === 'EXACT' || m.matchType === 'ALIAS').length})`}
            {f === 'PARTIAL' &&
              `Partial (${allMatches.filter((m) => m.matchType !== 'EXACT' && m.matchType !== 'ALIAS' && m.matchType !== 'MISSING').length})`}
            {f === 'MISSING' &&
              `Missing (${allMatches.filter((m) => m.matchType === 'MISSING').length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold border-y border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Requirement</th>
              <th className="py-2.5 px-3">Classification</th>
              <th className="py-2.5 px-3">Resume Evidence</th>
              <th className="py-2.5 px-3">Match Tier</th>
              <th className="py-2.5 px-3">Score Credit</th>
              <th className="py-2.5 px-3">Confidence & Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredMatches.length > 0 ? (
              filteredMatches.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {item.requirement}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.category === 'REQUIRED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {item.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-800">
                    {item.resumeEvidence ? (
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-800">
                        {item.resumeEvidence}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">None detected</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getBadgeStyle(
                        item.matchType
                      )}`}
                    >
                      {item.matchType}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold font-mono text-slate-800">
                    {item.score}%
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 max-w-xs">
                    {item.notes || '—'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-400">
                  No matching skill records found for the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
