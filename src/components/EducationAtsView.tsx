/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GraduationCap, Award, FileSearch, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import type { AnalysisResult, ResumeProfile, JobProfile } from '../models/types.ts';

interface EducationAtsViewProps {
  result: AnalysisResult;
  resumeProfile: ResumeProfile;
  jobProfile: JobProfile;
}

export const EducationAtsView: React.FC<EducationAtsViewProps> = ({
  result,
  resumeProfile,
  jobProfile,
}) => {
  const { atsAnalysis } = result;

  const atsScoreColor =
    atsAnalysis.score >= 85
      ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
      : atsAnalysis.score >= 70
      ? 'text-indigo-700 bg-indigo-50 border-indigo-300'
      : 'text-rose-700 bg-rose-50 border-rose-300';

  return (
    <div className="space-y-6">
      {/* Education & Certifications Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Education Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Academic Background</h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">Required Degree</span>
              <span className="text-sm font-bold text-slate-800">
                {jobProfile.educationRequirements[0]?.minimumDegreeLevel || "Bachelor's Degree"} in{' '}
                {jobProfile.educationRequirements[0]?.acceptableFields.join(', ') || 'Related Field'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">Candidate Credentials</span>
              {resumeProfile.education.length > 0 ? (
                resumeProfile.education.map((edu, idx) => (
                  <div key={idx} className="mt-1">
                    <span className="text-sm font-bold text-slate-900 block">
                      {edu.degreeLevel} in {edu.fieldOfStudy}
                    </span>
                    <span className="text-xs text-slate-500">
                      {edu.institution} {edu.graduationYear ? `(${edu.graduationYear})` : ''}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic mt-1 block">
                  No standard academic degree detected in resume.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Certifications Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Professional Certifications</h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">Required by JD</span>
              <span className="text-sm font-semibold text-slate-800">
                {jobProfile.certificationRequirements.length > 0
                  ? jobProfile.certificationRequirements.join(', ')
                  : 'None strictly mandatory (or preferred only)'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">Verified on Resume</span>
              {resumeProfile.certifications.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {resumeProfile.certifications.map((cert, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800"
                    >
                      ✓ {cert.canonicalName} ({cert.issuingAuthority || 'Verified'})
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-500 italic mt-1 block">
                  No canonical professional certifications detected.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Standalone ATS Compatibility Score & Audit */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                ATS Compatibility & Parsing Readiness
              </h3>
              <p className="text-xs text-slate-500">
                Audit of resume document structure, standard section headings, and contact completeness.
              </p>
            </div>
          </div>

          <div className={`px-3 py-1.5 rounded-lg border text-sm font-black ${atsScoreColor}`}>
            ATS Score: {atsAnalysis.score} / 100
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
          {/* Section Headings */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Standard Section Headings</h4>
            <div className="space-y-1.5">
              {['Experience', 'Education', 'Skills'].map((sec) => {
                const found = atsAnalysis.standardHeadingsFound.includes(sec);
                return (
                  <div key={sec} className="flex items-center gap-2 text-xs">
                    {found ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                    <span className={found ? 'text-slate-800 font-medium' : 'text-amber-700'}>
                      {sec} Section ({found ? 'Recognized' : 'Missing/Non-standard'})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Verification */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Contact Extraction Audit</h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                {resumeProfile.contactInfo.email ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                )}
                <span>Email: {resumeProfile.contactInfo.email || 'Missing'}</span>
              </div>
              <div className="flex items-center gap-2">
                {resumeProfile.contactInfo.phone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                )}
                <span>Phone: {resumeProfile.contactInfo.phone || 'Missing'}</span>
              </div>
              <div className="flex items-center gap-2">
                {resumeProfile.contactInfo.name ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                )}
                <span>Candidate Name: {resumeProfile.contactInfo.name || 'Uncertain'}</span>
              </div>
            </div>
          </div>

          {/* ATS Recommendations */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">ATS Audit Findings</h4>
            {atsAnalysis.issues.length > 0 ? (
              <ul className="space-y-1 text-xs text-rose-700">
                {atsAnalysis.issues.map((issue, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="font-bold">•</span>
                    <span>{issue.message}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Resume format is cleanly structured for ATS parsers.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
