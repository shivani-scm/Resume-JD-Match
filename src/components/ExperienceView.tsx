/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, CheckCircle2, AlertCircle, Briefcase } from 'lucide-react';
import type { AnalysisResult, ResumeProfile, JobProfile } from '../models/types.ts';

interface ExperienceViewProps {
  result: AnalysisResult;
  resumeProfile: ResumeProfile;
  jobProfile: JobProfile;
}

export const ExperienceView: React.FC<ExperienceViewProps> = ({
  result,
  resumeProfile,
  jobProfile,
}) => {
  const { experienceAnalysis, titleAnalysis } = result;

  const comparison = experienceAnalysis.comparisons[0] || {
    requiredYears: 3,
    detectedYears: experienceAnalysis.totalProfessionalYears,
    status: 'MEETS' as const,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'EXCEEDS':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'MEETS':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'SLIGHTLY_BELOW':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'SIGNIFICANTLY_BELOW':
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tenure Matrix Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Experience Tenure Verification</h3>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80 mb-4">
            <div className="flex items-baseline justify-between mb-2">
              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold">Detected Calendar Tenure</span>
                <div className="text-2xl font-black text-slate-900 mt-0.5">
                  {experienceAnalysis.totalProfessionalYears} Years
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 uppercase font-semibold">Required by JD</span>
                <div className="text-2xl font-black text-slate-700 mt-0.5">
                  {comparison.requiredYears}+ Years
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-xs font-semibold text-slate-600">Verification Status:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(
                  comparison.status
                )}`}
              >
                {comparison.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-600 space-y-2 bg-indigo-50/50 p-3 rounded-md border border-indigo-100">
            <div className="font-semibold text-indigo-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
              Disjoint Calendar Union Rule:
            </div>
            <p className="leading-relaxed">
              Tenure is calculated using disjoint calendar intervals [start_i, end_i]. Concurrent or overlapping
              employments are unified into contiguous spans, strictly preventing artificial double-counting of experience.
            </p>
          </div>
        </div>

        {/* Seniority & Hierarchy Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Seniority & Title Hierarchy</h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">Target Role</span>
                <span className="text-sm font-bold text-slate-800">{titleAnalysis.jdTitle}</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-slate-200 font-bold text-slate-700">
                Tier {titleAnalysis.jdSeniorityTier} ({jobProfile.seniority})
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">Candidate Latest Title</span>
                <span className="text-sm font-bold text-slate-800">{titleAnalysis.candidateRecentTitle}</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-slate-200 font-bold text-slate-700">
                Tier {titleAnalysis.candidateMaxSeniorityTier}
              </span>
            </div>

            <div
              className={`p-3 rounded-lg border text-xs ${
                !titleAnalysis.isCompatible
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              <div className="font-bold mb-0.5 flex items-center gap-1.5">
                {!titleAnalysis.isCompatible ? (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
                <span>Seniority Assessment:</span>
              </div>
              <p>{titleAnalysis.progressionTrajectory}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Career History Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Parsed Chronological Work History
        </h3>

        <div className="space-y-4">
          {resumeProfile.experiences.map((exp, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{exp.title}</h4>
                  <span className="text-xs font-semibold text-indigo-700">{exp.company}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">
                    {exp.startDate} – {exp.endDate}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-[11px] font-bold text-slate-700">
                    {exp.durationMonths} mos
                  </span>
                </div>
              </div>

              {exp.responsibilities && exp.responsibilities.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-slate-600 list-disc list-inside">
                  {exp.responsibilities.map((resp, rIdx) => (
                    <li key={rIdx} className="leading-relaxed">
                      {resp}
                    </li>
                  ))}
                </ul>
              )}

              {exp.skills && exp.skills.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-200 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-500">Identified Competencies:</span>
                  {exp.skills.map((s, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-white border border-slate-300 text-slate-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
