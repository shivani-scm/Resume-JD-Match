/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  ResumeProfile,
  JobProfile,
  AnalysisResult,
  CategoryScoreItem,
  ScoreDeduction,
  ApplicationRecommendation,
  MatchResult,
} from '../models/types.ts';
import { KnowledgeBase } from '../knowledge/data.ts';
import {
  matchSkill,
  analyzeExperience,
  analyzeSeniority,
  analyzeResponsibilities,
  analyzeEducation,
  analyzeCertifications,
  analyzeAts,
} from './matchingEngine.ts';

const WEIGHTS = KnowledgeBase.scoringConfig.weights;

/**
 * Score a list of skills against the resume using multi-tier matching.
 */
function matchSkillCollection(
  skills: string[],
  category: 'REQUIRED' | 'PREFERRED',
  resume: ResumeProfile
): { score: number; results: MatchResult[] } {
  if (skills.length === 0) return { score: 100, results: [] };

  const results: MatchResult[] = [];
  let totalPoints = 0;

  for (const skill of skills) {
    const res = matchSkill(skill, category, resume.skills, resume.rawText);
    results.push(res);
    totalPoints += res.score;
  }

  const score = Math.min(100, Math.round(totalPoints / skills.length));
  return { score, results };
}

/**
 * Master scoring and explanation engine.
 */
export function analyzeMatch(resume: ResumeProfile, job: JobProfile): AnalysisResult {
  // 1. Skills
  const reqSkillsResult = matchSkillCollection(job.requiredSkills, 'REQUIRED', resume);
  const prefSkillsResult = matchSkillCollection(job.preferredSkills, 'PREFERRED', resume);

  // 2. Experience
  const expAnalysis = analyzeExperience(resume, job);

  // 3. Seniority
  const titleAnalysis = analyzeSeniority(resume, job);

  // 4. Responsibilities
  const respAnalysis = analyzeResponsibilities(resume, job);
  const respScore = Math.round(Math.min(100, Math.max(30, respAnalysis.averageSimilarity * 120)));

  // 5. Education
  const eduAnalysis = analyzeEducation(resume, job);

  // 6. Certifications
  const certAnalysis = analyzeCertifications(resume, job);

  // 7. Industry / Domain
  let indScore = 70;
  if (job.industryRequirements.length > 0) {
    const matchedInd = job.industryRequirements.filter((i) => resume.industries.includes(i));
    indScore = matchedInd.length > 0 ? 100 : 50;
  } else {
    indScore = 85;
  }

  // 8. ATS & Keywords
  const atsAnalysis = analyzeAts(resume);

  // Build category score items
  const categoryScores: CategoryScoreItem[] = [
    {
      categoryKey: 'required_skills',
      label: 'Required Skills',
      score: reqSkillsResult.score,
      weight: WEIGHTS.required_skills,
      weightedContribution: Math.round(reqSkillsResult.score * WEIGHTS.required_skills * 10) / 10,
      maxContribution: Math.round(WEIGHTS.required_skills * 100),
    },
    {
      categoryKey: 'preferred_skills',
      label: 'Preferred Skills',
      score: prefSkillsResult.score,
      weight: WEIGHTS.preferred_skills,
      weightedContribution: Math.round(prefSkillsResult.score * WEIGHTS.preferred_skills * 10) / 10,
      maxContribution: Math.round(WEIGHTS.preferred_skills * 100),
    },
    {
      categoryKey: 'relevant_experience',
      label: 'Work Experience',
      score: expAnalysis.score,
      weight: WEIGHTS.relevant_experience,
      weightedContribution: Math.round(expAnalysis.score * WEIGHTS.relevant_experience * 10) / 10,
      maxContribution: Math.round(WEIGHTS.relevant_experience * 100),
    },
    {
      categoryKey: 'responsibilities',
      label: 'Job Duties Alignment',
      score: respScore,
      weight: WEIGHTS.responsibilities,
      weightedContribution: Math.round(respScore * WEIGHTS.responsibilities * 10) / 10,
      maxContribution: Math.round(WEIGHTS.responsibilities * 100),
    },
    {
      categoryKey: 'title_seniority',
      label: 'Title & Seniority',
      score: titleAnalysis.score,
      weight: WEIGHTS.title_seniority,
      weightedContribution: Math.round(titleAnalysis.score * WEIGHTS.title_seniority * 10) / 10,
      maxContribution: Math.round(WEIGHTS.title_seniority * 100),
    },
    {
      categoryKey: 'education',
      label: 'Education Level',
      score: eduAnalysis.score,
      weight: WEIGHTS.education,
      weightedContribution: Math.round(eduAnalysis.score * WEIGHTS.education * 10) / 10,
      maxContribution: Math.round(WEIGHTS.education * 100),
    },
    {
      categoryKey: 'certifications',
      label: 'Certifications',
      score: certAnalysis.score,
      weight: WEIGHTS.certifications,
      weightedContribution: Math.round(certAnalysis.score * WEIGHTS.certifications * 10) / 10,
      maxContribution: Math.round(WEIGHTS.certifications * 100),
    },
    {
      categoryKey: 'industry_domain',
      label: 'Industry Knowledge',
      score: indScore,
      weight: WEIGHTS.industry_domain,
      weightedContribution: Math.round(indScore * WEIGHTS.industry_domain * 10) / 10,
      maxContribution: Math.round(WEIGHTS.industry_domain * 100),
    },
    {
      categoryKey: 'ats_keyword_coverage',
      label: 'ATS Compatibility',
      score: atsAnalysis.score,
      weight: WEIGHTS.ats_keyword_coverage,
      weightedContribution: Math.round(atsAnalysis.score * WEIGHTS.ats_keyword_coverage * 10) / 10,
      maxContribution: Math.round(WEIGHTS.ats_keyword_coverage * 100),
    },
  ];

  // Calculate Base Score
  let baseScore = 0;
  for (const item of categoryScores) {
    baseScore += item.weightedContribution;
  }
  baseScore = Math.round(baseScore * 10) / 10;

  // Penalties calculation
  const deductions: ScoreDeduction[] = [];
  const penalties = KnowledgeBase.penaltiesConfig.penalties;

  // 1. Missing critical required skills
  const missingCritical = reqSkillsResult.results.filter((r) => r.matchType === 'MISSING');
  if (missingCritical.length >= 2) {
    deductions.push({
      reason: `Multiple mandatory skills missing (${missingCritical.map((m) => m.requirement).join(', ')})`,
      penaltyType: 'missing_critical_skill',
      pointsDeducted: penalties.missing_critical_skill.points,
    });
  }

  // 2. Experience gap
  if (expAnalysis.hasMajorGap) {
    deductions.push({
      reason: `Experience tenure (${expAnalysis.totalProfessionalYears} yrs) is significantly below requirement`,
      penaltyType: 'major_experience_gap',
      pointsDeducted: penalties.major_experience_gap.points,
    });
  }

  // 3. Seniority mismatch
  if (!titleAnalysis.isCompatible && titleAnalysis.tierDifference < -1) {
    deductions.push({
      reason: `Seniority deficit: ${titleAnalysis.candidateRecentTitle} is below ${titleAnalysis.jdTitle}`,
      penaltyType: 'major_seniority_mismatch',
      pointsDeducted: penalties.major_seniority_mismatch.points,
    });
  }

  // 4. Missing mandatory certification
  if (certAnalysis.missingCertifications.length > 0 && job.certificationRequirements.length > 0) {
    deductions.push({
      reason: `Mandatory certification missing (${certAnalysis.missingCertifications.join(', ')})`,
      penaltyType: 'mandatory_certification_missing',
      pointsDeducted: penalties.mandatory_certification_missing.points,
    });
  }

  // 5. Mandatory degree missing
  if (!eduAnalysis.meetsLevel && job.educationRequirements.length > 0) {
    deductions.push({
      reason: `Attained degree level does not satisfy mandatory ${eduAnalysis.requiredDegree || "Bachelor's"} requirement`,
      penaltyType: 'mandatory_degree_missing',
      pointsDeducted: penalties.mandatory_degree_missing.points,
    });
  }

  let totalPenalties = 0;
  for (const d of deductions) {
    totalPenalties += Math.abs(d.pointsDeducted);
  }

  const overallScore = Math.max(0, Math.min(100, Math.round((baseScore - totalPenalties) * 10) / 10));

  // Determine score band
  let scoreBand = 'Moderate Match';
  if (overallScore >= 90) scoreBand = 'Exceptional Match';
  else if (overallScore >= 80) scoreBand = 'Strong Match';
  else if (overallScore >= 65) scoreBand = 'Good Match';
  else if (overallScore >= 50) scoreBand = 'Moderate Match';
  else if (overallScore >= 35) scoreBand = 'Weak Match';
  else scoreBand = 'Poor Match';

  // Determine recommendation
  let recommendation: ApplicationRecommendation = 'GOOD APPLICATION';
  if (overallScore >= 85 && deductions.length === 0) {
    recommendation = 'HIGH PRIORITY APPLICATION';
  } else if (overallScore >= 72) {
    recommendation = 'GOOD APPLICATION';
  } else if (overallScore >= 55) {
    recommendation = 'BORDERLINE';
  } else {
    recommendation = 'LOW PRIORITY';
  }

  // Categorize matches
  const allMatches = [...reqSkillsResult.results, ...prefSkillsResult.results];
  const exactAndAlias = allMatches.filter((m) => m.matchType === 'EXACT' || m.matchType === 'ALIAS');
  const partial = allMatches.filter(
    (m) =>
      m.matchType === 'ABBREVIATION' ||
      m.matchType === 'FUZZY' ||
      m.matchType === 'PHRASE' ||
      m.matchType === 'RELATED' ||
      m.matchType === 'PARTIAL'
  );
  const missing = allMatches.filter((m) => m.matchType === 'MISSING');

  const risks = deductions.map((d) => d.reason);
  if (atsAnalysis.score < 70) {
    risks.push('ATS structure has parsing issues that could lead to rejection');
  }

  return {
    overallScore,
    baseScore,
    scoreBand,
    categoryScores,
    matches: exactAndAlias,
    partialMatches: partial,
    missingRequirements: missing,
    experienceAnalysis: expAnalysis,
    educationAnalysis: eduAnalysis,
    certificationAnalysis: certAnalysis,
    titleAnalysis,
    atsAnalysis,
    risks,
    penalties: deductions,
    totalPenalties,
    recommendation,
    analysisTimestamp: new Date().toISOString(),
  };
}
