/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  ListFilter,
  Calendar,
  Layers,
  GraduationCap,
  Calculator,
} from 'lucide-react';
import { Header } from './components/Header.tsx';
import { InputPanel } from './components/InputPanel.tsx';
import { ResultsOverview } from './components/ResultsOverview.tsx';
import { SkillMatrixView } from './components/SkillMatrixView.tsx';
import { ExperienceView } from './components/ExperienceView.tsx';
import { ResponsibilitiesView } from './components/ResponsibilitiesView.tsx';
import { EducationAtsView } from './components/EducationAtsView.tsx';
import { ScoreAuditView } from './components/ScoreAuditView.tsx';

import { parseResume } from './engine/resumeParser.ts';
import { parseJobDescription } from './engine/jdParser.ts';
import { analyzeMatch } from './engine/scoringEngine.ts';
import { SAMPLE_DATA_PAIRS } from './data/sampleData.ts';
import type { AnalysisResult, ResumeProfile, JobProfile } from './models/types.ts';

type ActiveTab = 'overview' | 'skills' | 'experience' | 'responsibilities' | 'education-ats' | 'audit';

export default function App() {
  const initialSample = SAMPLE_DATA_PAIRS[0];
  const [resumeText, setResumeText] = useState(initialSample.resumeText);
  const [jdText, setJdText] = useState(initialSample.jdText);
  const [parsedResume, setParsedResume] = useState<ResumeProfile | null>(null);
  const [parsedJd, setParsedJd] = useState<JobProfile | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Perform deterministic analysis
  const runAnalysis = () => {
    if (!resumeText.trim() || !jdText.trim()) return;
    setIsAnalyzing(true);

    setTimeout(() => {
      try {
        const resume = parseResume(resumeText);
        const jd = parseJobDescription(jdText);
        const result = analyzeMatch(resume, jd);

        setParsedResume(resume);
        setParsedJd(jd);
        setAnalysisResult(result);
      } catch (err) {
        console.error('Analysis execution failed:', err);
      } finally {
        setIsAnalyzing(false);
      }
    }, 150);
  };

  // Run on mount with initial benchmark sample
  useEffect(() => {
    runAnalysis();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Document Inputs & Sample Loader */}
        <InputPanel
          resumeText={resumeText}
          setResumeText={setResumeText}
          jdText={jdText}
          setJdText={setJdText}
          onAnalyze={runAnalysis}
          isAnalyzing={isAnalyzing}
        />

        {/* Results Section */}
        {analysisResult && parsedResume && parsedJd && (
          <div id="analysis-results-container" className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 overflow-x-auto shadow-xs">
              <button
                id="tab-overview"
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'overview'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Overview & Match Score</span>
              </button>

              <button
                id="tab-skills"
                onClick={() => setActiveTab('skills')}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'skills'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ListFilter className="w-4 h-4" />
                <span>Skill Matrix ({analysisResult.matches.length + analysisResult.partialMatches.length + analysisResult.missingRequirements.length})</span>
              </button>

              <button
                id="tab-experience"
                onClick={() => setActiveTab('experience')}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'experience'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Experience & Seniority</span>
              </button>

              <button
                id="tab-responsibilities"
                onClick={() => setActiveTab('responsibilities')}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'responsibilities'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Duties Alignment</span>
              </button>

              <button
                id="tab-education-ats"
                onClick={() => setActiveTab('education-ats')}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'education-ats'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Education & ATS</span>
              </button>

              <button
                id="tab-audit"
                onClick={() => setActiveTab('audit')}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'audit'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Calculator className="w-4 h-4" />
                <span>Score Audit & Formula</span>
              </button>
            </div>

            {/* Tab Views */}
            <div className="transition-all duration-200">
              {activeTab === 'overview' && <ResultsOverview result={analysisResult} />}
              {activeTab === 'skills' && <SkillMatrixView result={analysisResult} />}
              {activeTab === 'experience' && (
                <ExperienceView
                  result={analysisResult}
                  resumeProfile={parsedResume}
                  jobProfile={parsedJd}
                />
              )}
              {activeTab === 'responsibilities' && (
                <ResponsibilitiesView
                  result={analysisResult}
                  resumeProfile={parsedResume}
                  jobProfile={parsedJd}
                />
              )}
              {activeTab === 'education-ats' && (
                <EducationAtsView
                  result={analysisResult}
                  resumeProfile={parsedResume}
                  jobProfile={parsedJd}
                />
              )}
              {activeTab === 'audit' && <ScoreAuditView result={analysisResult} />}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-12 text-center text-xs text-slate-500">
        <p>
          ResumeMatch &bull; 100% Deterministic &bull; Zero External AI Models &bull; Safe for Protected Candidate Information
        </p>
      </footer>
    </div>
  );
}
