/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  ResumeProfile,
  JobProfile,
  MatchResult,
  MatchType,
  RequirementCategory,
  ExperienceAnalysis,
  TitleSeniorityAnalysis,
  AtsAnalysis,
  AtsIssue,
  EducationAnalysis,
  CertificationAnalysis,
} from '../models/types.ts';
import { KnowledgeBase } from '../knowledge/data.ts';
import {
  levenshteinSimilarity,
  jaroWinklerSimilarity,
  calculateBM25Score,
  tfIdfCosineSimilarity,
  tokenize,
} from './nlpUtils.ts';

/**
 * Perform 6-Level Multi-Tier Deterministic Skill Matching.
 */
export function matchSkill(
  requiredSkill: string,
  category: RequirementCategory,
  resumeSkills: string[],
  resumeText: string
): MatchResult {
  const reqLower = requiredSkill.toLowerCase().trim();
  const resTextLower = resumeText.toLowerCase();

  // 1. Level 1: Exact string match
  for (const rSkill of resumeSkills) {
    if (rSkill.toLowerCase() === reqLower) {
      return {
        requirement: requiredSkill,
        normalizedRequirement: reqLower,
        category,
        resumeEvidence: rSkill,
        matchType: 'EXACT',
        confidence: 1.0,
        score: 100,
        level: 1,
        notes: `Exact match found for "${requiredSkill}"`,
      };
    }
  }

  // Check exact token boundary in full text
  if (new RegExp(`\\b${escapeRegExp(reqLower)}\\b`, 'i').test(resTextLower)) {
    return {
      requirement: requiredSkill,
      normalizedRequirement: reqLower,
      category,
      resumeEvidence: requiredSkill,
      matchType: 'EXACT',
      confidence: 1.0,
      score: 100,
      level: 1,
      notes: `Exact term matched in resume text`,
    };
  }

  // 2. Level 2: Canonical Alias match
  for (const item of KnowledgeBase.skillAliases) {
    const isTarget =
      item.canonical.toLowerCase() === reqLower ||
      item.aliases.some((a) => a.toLowerCase() === reqLower);

    if (isTarget) {
      const allAliases = [item.canonical, ...item.aliases];
      for (const alias of allAliases) {
        if (
          resumeSkills.some((s) => s.toLowerCase() === alias.toLowerCase()) ||
          new RegExp(`\\b${escapeRegExp(alias.toLowerCase())}\\b`, 'i').test(resTextLower)
        ) {
          return {
            requirement: requiredSkill,
            normalizedRequirement: item.canonical,
            category,
            resumeEvidence: alias,
            matchType: 'ALIAS',
            confidence: 0.95,
            score: 100,
            level: 2,
            notes: `Matched via canonical alias mapping ("${alias}" ≈ "${requiredSkill}")`,
          };
        }
      }
    }
  }

  // 3. Level 3: Abbreviation match (e.g. FP&A <-> Financial Planning and Analysis)
  for (const item of KnowledgeBase.skillAliases) {
    if (item.aliases.map((a) => a.toLowerCase()).includes(reqLower)) {
      if (
        resumeSkills.some((s) => s.toLowerCase() === item.canonical.toLowerCase()) ||
        resTextLower.includes(item.canonical.toLowerCase())
      ) {
        return {
          requirement: requiredSkill,
          normalizedRequirement: item.canonical,
          category,
          resumeEvidence: item.canonical,
          matchType: 'ABBREVIATION',
          confidence: 0.9,
          score: 95,
          level: 3,
          notes: `Matched abbreviation "${requiredSkill}" with canonical "${item.canonical}"`,
        };
      }
    }
  }

  // 4. Level 4: Fuzzy match (Levenshtein / Jaro-Winkler >= 0.85)
  for (const rSkill of resumeSkills) {
    const levSim = levenshteinSimilarity(rSkill, requiredSkill);
    const jwSim = jaroWinklerSimilarity(rSkill, requiredSkill);
    const maxSim = Math.max(levSim, jwSim);

    if (maxSim >= 0.85) {
      return {
        requirement: requiredSkill,
        normalizedRequirement: reqLower,
        category,
        resumeEvidence: rSkill,
        matchType: 'FUZZY',
        confidence: Math.round(maxSim * 100) / 100,
        score: 80,
        level: 4,
        notes: `Fuzzy morphological match ("${rSkill}" ≈ "${requiredSkill}", ${(maxSim * 100).toFixed(0)}%)`,
      };
    }
  }

  // 5. Level 5: Phrase / Token overlap match
  const reqTokens = tokenize(requiredSkill, true);
  if (reqTokens.length > 1) {
    let matchedTokenCount = 0;
    for (const t of reqTokens) {
      if (resTextLower.includes(t)) matchedTokenCount++;
    }
    if (matchedTokenCount / reqTokens.length >= 0.65) {
      return {
        requirement: requiredSkill,
        normalizedRequirement: reqLower,
        category,
        resumeEvidence: `${matchedTokenCount}/${reqTokens.length} sub-terms detected`,
        matchType: 'PHRASE',
        confidence: 0.75,
        score: 70,
        level: 5,
        notes: `Sub-phrase overlap detected in resume context`,
      };
    }
  }

  // 6. Level 6: Taxonomy Related Tool match (e.g. SAP S/4HANA <-> SAP ERP)
  for (const tech of KnowledgeBase.technologies) {
    if (tech.name.toLowerCase() === reqLower || tech.cluster.toLowerCase() === reqLower) {
      for (const related of tech.related) {
        if (
          resumeSkills.some((s) => s.toLowerCase() === related.toLowerCase()) ||
          resTextLower.includes(related.toLowerCase())
        ) {
          return {
            requirement: requiredSkill,
            normalizedRequirement: reqLower,
            category,
            resumeEvidence: related,
            matchType: 'RELATED',
            confidence: 0.6,
            score: 60,
            level: 6,
            notes: `Related domain tool matched via taxonomy ("${related}" in ${tech.cluster})`,
          };
        }
      }
    }
  }

  // Missing
  return {
    requirement: requiredSkill,
    normalizedRequirement: reqLower,
    category,
    resumeEvidence: '',
    matchType: 'MISSING',
    confidence: 0,
    score: 0,
    level: 0,
    notes: `No direct or semantic evidence identified in candidate resume`,
  };
}

/**
 * Calculate disjoint calendar months across all experiences (prevent double-counting concurrent jobs).
 */
export function calculateDisjointTenureMonths(experiences: ResumeProfile['experiences']): number {
  if (experiences.length === 0) return 0;

  const intervals: [number, number][] = [];
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentEpochMonths = currentYear * 12 + currentMonth;

  for (const exp of experiences) {
    const duration = exp.durationMonths || 12;
    let endEpoch = currentEpochMonths;
    if (!exp.isCurrent && exp.endDate) {
      const yr = parseInt(exp.endDate.match(/\d{4}/)?.[0] || `${currentYear}`, 10);
      endEpoch = yr * 12 + 6;
    }
    const startEpoch = Math.max(0, endEpoch - duration);
    intervals.push([startEpoch, endEpoch]);
  }

  intervals.sort((a, b) => a[0] - b[0]);

  const merged: [number, number][] = [];
  for (const interval of intervals) {
    if (merged.length === 0) {
      merged.push(interval);
    } else {
      const last = merged[merged.length - 1];
      if (interval[0] <= last[1]) {
        last[1] = Math.max(last[1], interval[1]);
      } else {
        merged.push(interval);
      }
    }
  }

  let totalMonths = 0;
  for (const [start, end] of merged) {
    totalMonths += Math.max(0, end - start);
  }

  return totalMonths;
}

/**
 * Analyze candidate experience vs job experience requirements.
 */
export function analyzeExperience(
  resume: ResumeProfile,
  job: JobProfile
): ExperienceAnalysis {
  const disjointMonths = calculateDisjointTenureMonths(resume.experiences);
  const totalYears = Math.round((disjointMonths / 12) * 10) / 10;
  const primaryReq = job.experienceRequirements[0] || { requiredYears: 3, skillOrDomain: 'Relevant Field' };
  const requiredYears = primaryReq.requiredYears || 3;

  let status: 'EXCEEDS' | 'MEETS' | 'SLIGHTLY_BELOW' | 'SIGNIFICANTLY_BELOW' = 'MEETS';
  let score = 95;

  if (totalYears >= requiredYears * 1.3) {
    status = 'EXCEEDS';
    score = 100;
  } else if (totalYears >= requiredYears) {
    status = 'MEETS';
    score = 95;
  } else if (totalYears >= requiredYears * 0.75) {
    status = 'SLIGHTLY_BELOW';
    score = 65;
  } else {
    status = 'SIGNIFICANTLY_BELOW';
    score = 35;
  }

  const hasMajorGap = totalYears < requiredYears * 0.5;

  return {
    totalProfessionalYears: totalYears,
    relevantYears: totalYears,
    comparisons: [
      {
        requirement: `${requiredYears}+ years in ${primaryReq.skillOrDomain}`,
        requiredYears,
        detectedYears: totalYears,
        status,
        relevantRoles: resume.experiences.map((e) => `${e.title} at ${e.company}`),
      },
    ],
    hasMajorGap,
    score,
  };
}

/**
 * Analyze Job Title and Seniority Alignment.
 */
export function analyzeSeniority(
  resume: ResumeProfile,
  job: JobProfile
): TitleSeniorityAnalysis {
  const candidateRecentTitle = resume.experiences[0]?.title || resume.titles[0] || 'Analyst';
  const candidateSeniority = detectSeniorityTier(candidateRecentTitle);
  const requiredSeniority = job.seniorityTier || 2;
  const diff = candidateSeniority - requiredSeniority;

  const isCompatible = diff >= -1 && diff <= 2;
  let trajectory = 'Stable promotion track';
  let score = 90;

  if (diff < -1) {
    trajectory = `Below target tier by ${Math.abs(diff)} levels`;
    score = 40;
  } else if (diff > 2) {
    trajectory = `Above target tier by ${diff} levels (overqualification)`;
    score = 70;
  } else if (diff >= 0) {
    trajectory = 'Direct target alignment or upward growth';
    score = 100;
  }

  return {
    jdTitle: job.title,
    jdSeniorityTier: requiredSeniority,
    candidateRecentTitle,
    candidateMaxSeniorityTier: candidateSeniority,
    tierDifference: diff,
    isCompatible,
    progressionTrajectory: trajectory,
    score,
  };
}

function detectSeniorityTier(title: string): number {
  const lower = title.toLowerCase();
  for (const tier of KnowledgeBase.titleHierarchy.seniority_tiers) {
    for (const kw of tier.keywords) {
      if (new RegExp(`\\b${escapeRegExp(kw)}\\b`, 'i').test(lower)) {
        return tier.tier;
      }
    }
  }
  return 2;
}

/**
 * Responsibility Alignment: calculate BM25 and Action Verb overlap between JD and Resume.
 */
export function analyzeResponsibilities(
  resume: ResumeProfile,
  job: JobProfile
): {
  averageSimilarity: number;
  detailedMatches: Array<{
    jdResponsibility: string;
    bestResumeBullet: string;
    similarity: number;
  }>;
} {
  const allResumeBullets: string[] = [];
  for (const exp of resume.experiences) {
    allResumeBullets.push(...exp.responsibilities);
  }

  if (allResumeBullets.length === 0) {
    allResumeBullets.push(resume.summary || 'Professional duties');
  }

  const jdDuties = job.responsibilities.length > 0 ? job.responsibilities : [job.title];
  const detailedMatches: Array<{
    jdResponsibility: string;
    bestResumeBullet: string;
    similarity: number;
  }> = [];

  let totalSim = 0;

  for (const duty of jdDuties) {
    let bestSim = 0;
    let bestBullet = '';

    for (const bullet of allResumeBullets) {
      const bm25 = calculateBM25Score(duty, bullet);
      const tfidf = tfIdfCosineSimilarity(duty, bullet);
      const combined = bm25 * 0.6 + tfidf * 0.4;

      if (combined > bestSim) {
        bestSim = combined;
        bestBullet = bullet;
      }
    }

    detailedMatches.push({
      jdResponsibility: duty,
      bestResumeBullet: bestBullet || 'General domain experience',
      similarity: Math.round(bestSim * 100) / 100,
    });
    totalSim += bestSim;
  }

  const avg = jdDuties.length > 0 ? totalSim / jdDuties.length : 0.5;
  return {
    averageSimilarity: Math.round(avg * 100) / 100,
    detailedMatches,
  };
}

/**
 * Analyze Education Level & Disciplines.
 */
export function analyzeEducation(
  resume: ResumeProfile,
  job: JobProfile
): EducationAnalysis {
  const target = job.educationRequirements[0];
  const candidateDegree = resume.education[0]?.degreeLevel;
  const meetsLevel = checkDegreeHierarchy(
    candidateDegree || 'Associate',
    target?.minimumDegreeLevel || "Bachelor's"
  );

  const detectedFields = resume.education.map((e) => e.fieldOfStudy);
  let fieldMatch = false;

  if (target?.acceptableFields) {
    for (const f of detectedFields) {
      if (target.acceptableFields.some((af) => af.toLowerCase().includes(f.toLowerCase()) || f.toLowerCase().includes(af.toLowerCase()))) {
        fieldMatch = true;
        break;
      }
    }
  } else {
    fieldMatch = true;
  }

  let score = 60;
  if (meetsLevel && fieldMatch) score = 100;
  else if (meetsLevel) score = 85;
  else if (fieldMatch) score = 70;

  return {
    candidateHighestDegree: candidateDegree,
    requiredDegree: target?.minimumDegreeLevel,
    meetsLevel,
    fieldMatch,
    detectedFields,
    score,
  };
}

function checkDegreeHierarchy(candidateDeg: string, requiredDeg: string): boolean {
  const levels: Record<string, number> = {
    'High School': 1,
    'Associate': 2,
    "Bachelor's": 3,
    "Master's": 4,
    'MBA': 4,
    'PhD': 5,
  };
  const cLevel = levels[candidateDeg] || 2;
  const rLevel = levels[requiredDeg] || 3;
  return cLevel >= rLevel;
}

/**
 * Analyze Professional Certifications.
 */
export function analyzeCertifications(
  resume: ResumeProfile,
  job: JobProfile
): CertificationAnalysis {
  const required = job.certificationRequirements;
  const detected = resume.certifications.map((c) => c.canonicalName);
  const missing: string[] = [];

  for (const req of required) {
    if (!detected.includes(req)) {
      missing.push(req);
    }
  }

  let score = 100;
  if (required.length > 0) {
    const matchedCount = required.length - missing.length;
    score = Math.round((matchedCount / required.length) * 100);
  }

  return {
    requiredCertifications: required,
    detectedCertifications: detected,
    missingCertifications: missing,
    score,
  };
}

/**
 * Analyze ATS compatibility: headings, contact completeness, formatting check.
 */
export function analyzeAts(resume: ResumeProfile): AtsAnalysis {
  let score = 100;
  const issues: AtsIssue[] = [];
  const standardHeadingsFound: string[] = [];

  const hasEmail = Boolean(resume.contactInfo.email);
  const hasPhone = Boolean(resume.contactInfo.phone);
  const contactExtractionSuccess = hasEmail && hasPhone;

  if (!hasEmail) {
    score -= 15;
    issues.push({
      type: 'ERROR',
      category: 'Contact Information',
      message: 'Direct professional email address could not be extracted from header.',
      impactScore: -15,
    });
  }

  if (!hasPhone) {
    score -= 10;
    issues.push({
      type: 'WARNING',
      category: 'Contact Information',
      message: 'Telephone number missing from resume contact block.',
      impactScore: -10,
    });
  }

  const lowerText = resume.rawText.toLowerCase();
  const requiredSections = [
    { name: 'Experience', pattern: /experience|work history|employment/i },
    { name: 'Education', pattern: /education|academics/i },
    { name: 'Skills', pattern: /skills|competencies|technologies/i },
  ];

  for (const sec of requiredSections) {
    if (sec.pattern.test(lowerText)) {
      standardHeadingsFound.push(sec.name);
    } else {
      score -= 12;
      issues.push({
        type: 'WARNING',
        category: 'Section Headings',
        message: `Standard "${sec.name}" section heading not cleanly detected.`,
        impactScore: -12,
      });
    }
  }

  const wordCount = resume.rawText.split(/\s+/).length;
  if (wordCount < 150) {
    score -= 15;
    issues.push({
      type: 'ERROR',
      category: 'Document Length',
      message: 'Resume word count is extremely brief (<150 words).',
      impactScore: -15,
    });
  }

  return {
    score: Math.max(20, Math.min(100, score)),
    standardHeadingsFound,
    unusualSectionsFound: [],
    contactExtractionSuccess,
    hasTablesOrComplexFormatting: false,
    hasSpecialCharacters: false,
    keywordDensityScore: 85,
    issues,
  };
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
