/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Play, RotateCcw, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { extractTextFromFile } from '../engine/textExtractor.ts';
import { SAMPLE_DATA_PAIRS, type SamplePair } from '../data/sampleData.ts';

interface InputPanelProps {
  resumeText: string;
  setResumeText: (text: string) => void;
  jdText: string;
  setJdText: (text: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  resumeText,
  setResumeText,
  jdText,
  setJdText,
  onAnalyze,
  isAnalyzing,
}) => {
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [jdFileName, setJdFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeSample, setActiveSample] = useState<string | null>(null);

  const resumeFileInputRef = useRef<HTMLInputElement>(null);
  const jdFileInputRef = useRef<HTMLInputElement>(null);

  const handleResumeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    try {
      setResumeFileName(file.name);
      const text = await extractTextFromFile(file);
      setResumeText(text);
      setActiveSample(null);
    } catch (err: any) {
      setUploadError(`Failed to parse resume file: ${err?.message}`);
    }
  };

  const handleJdFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    try {
      setJdFileName(file.name);
      const text = await extractTextFromFile(file);
      setJdText(text);
      setActiveSample(null);
    } catch (err: any) {
      setUploadError(`Failed to parse job description: ${err?.message}`);
    }
  };

  const loadSample = (sample: SamplePair) => {
    setResumeText(sample.resumeText);
    setJdText(sample.jdText);
    setResumeFileName(`${sample.name} (Resume)`);
    setJdFileName(`${sample.name} (Job Description)`);
    setActiveSample(sample.id);
    setUploadError(null);
  };

  const resetInputs = () => {
    setResumeText('');
    setJdText('');
    setResumeFileName(null);
    setJdFileName(null);
    setActiveSample(null);
    setUploadError(null);
  };

  const isReady = resumeText.trim().length > 30 && jdText.trim().length > 30;

  return (
    <div id="input-section" className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 md:p-6 mb-8">
      {/* Sample presets bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Quick-Load Benchmark Samples:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_DATA_PAIRS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => loadSample(sample)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all border ${
                activeSample === sample.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              {sample.name}
            </button>
          ))}
          {(resumeText || jdText) && (
            <button
              onClick={resetInputs}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1"
              title="Clear inputs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {uploadError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Side by side inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RESUME INPUT */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Candidate Resume
            </label>
            <div className="flex items-center gap-2">
              <input
                ref={resumeFileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleResumeFileUpload}
                className="hidden"
                id="resume-file-input"
              />
              <button
                type="button"
                onClick={() => resumeFileInputRef.current?.click()}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1.5 transition-colors border border-slate-200"
              >
                <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
                Upload PDF/DOCX/TXT
              </button>
            </div>
          </div>

          {resumeFileName && (
            <div className="mb-2 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Loaded: {resumeFileName}</span>
            </div>
          )}

          <textarea
            id="resume-text-input"
            value={resumeText}
            onChange={(e) => {
              setResumeText(e.target.value);
              setActiveSample(null);
            }}
            placeholder="Paste raw resume text here, or click Upload above to load a PDF or Word (.docx) file..."
            className="w-full h-56 p-3 text-xs font-mono text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white resize-none transition-all leading-relaxed"
          />
          <div className="flex justify-between items-center mt-1.5 text-[11px] text-slate-400">
            <span>{resumeText.trim().length} characters</span>
            <span>Supports standard sections: Experience, Education, Skills</span>
          </div>
        </div>

        {/* JOB DESCRIPTION INPUT */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Target Job Description
            </label>
            <div className="flex items-center gap-2">
              <input
                ref={jdFileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleJdFileUpload}
                className="hidden"
                id="jd-file-input"
              />
              <button
                type="button"
                onClick={() => jdFileInputRef.current?.click()}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1.5 transition-colors border border-slate-200"
              >
                <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
                Upload PDF/DOCX/TXT
              </button>
            </div>
          </div>

          {jdFileName && (
            <div className="mb-2 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Loaded: {jdFileName}</span>
            </div>
          )}

          <textarea
            id="jd-text-input"
            value={jdText}
            onChange={(e) => {
              setJdText(e.target.value);
              setActiveSample(null);
            }}
            placeholder="Paste target job description text here, including requirements, responsibilities, and qualifications..."
            className="w-full h-56 p-3 text-xs font-mono text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white resize-none transition-all leading-relaxed"
          />
          <div className="flex justify-between items-center mt-1.5 text-[11px] text-slate-400">
            <span>{jdText.trim().length} characters</span>
            <span>Rule-based extraction: Required vs Preferred vs Constraints</span>
          </div>
        </div>
      </div>

      {/* Action button */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-500 max-w-xl">
          Deterministic 9-category mathematical weighting with hard constraint penalties. Zero LLM hallucinations.
        </p>
        <button
          id="analyze-match-btn"
          disabled={!isReady || isAnalyzing}
          onClick={onAnalyze}
          className={`w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
            !isReady || isAnalyzing
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer hover:shadow'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Documents Deterministically...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Analyze Match (0–100)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
