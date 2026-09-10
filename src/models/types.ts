/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Requirement classification categories within a Job Description.
 */
export type RequirementCategory =
  | 'REQUIRED'
  | 'PREFERRED'
  | 'RESPONSIBILITY'
  | 'CONTEXT'
  | 'CONSTRAINT';

/**
 * Match tier level and quality classification.
 */
export type MatchType =
  | 'EXACT'
  | 'ALIAS'
  | 'ABBREVIATION'
  | 'FUZZY'
  | 'PHRASE'
  | 'RELATED'
  | 'PARTIAL'
  | 'MISSING'
  | 'CONTRADICTORY';

/**
 * Comparison status for experience tenure.
 */
export type ExperienceStatus =
  | 'EXCEEDS'
  | 'MEETS'
  | 'SLIGHTLY_BELOW'
  | 'SIGNIFICANTLY_BELOW';

/**
 * Recommendation priority.
 */
export type ApplicationRecommendation =
  | 'HIGH PRIORITY APPLICATION'
  | 'GOOD APPLICATION'
  | 'BORDERLINE'
  | 'LOW PRIORITY';

/**
 * Education degree level.
 */
export type DegreeLevel =
  | 'High School'
  | 'Associate'
  | "Bachelor's"
  | "Master's"
  | 'MBA'
  | 'PhD';

/**
 * Contact and header information extracted from resume.
 */
export interface ContactInfo {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

/**
 * Individual employment experience record.
 */
export interface Experience {
  company: string;
  title: string;
  startDate: string; // ISO or YYYY-MM
  endDate: string; // ISO or YYYY-MM or 'Present'
  durationMonths: number;
  isCurrent: boolean;
  skills: string[];
  responsibilities: string[];
  industries: string[];
}

/**
 * Educational credential.
 */
export interface Education {
  institution: string;
  degreeLevel: DegreeLevel;
  fieldOfStudy: string;
  graduationYear?: number;
  gpa?: string;
  isCompleted: boolean;
}

/**
 * Professional certification or license.
 */
export interface Certification {
  canonicalName: string;
  rawText: string;
  issuingAuthority?: string;
  yearObtained?: number;
  isActive: boolean;
}

/**
 * Project or portfolio item.
 */
export interface Project {
  name: string;
  description: string;
  technologies: string[];
  role?: string;
}

/**
 * Normalized representation of a Candidate Resume.
 */
export interface ResumeProfile {
  candidateName: string;
  contactInfo: ContactInfo;
  summary: string;
  skills: string[];
  tools: string[];
  titles: string[];
  experiences: Experience[];
  education: Education[];
  certifications: Certification[];
  projects: Project[];
  industries: string[];
  rawText: string;
}

/**
 * Experience requirement stated in a JD.
 */
export interface ExperienceRequirement {
  requiredYears: number;
  skillOrDomain: string;
  isRequired: boolean;
  rawText: string;
}

/**
 * Education requirement stated in a JD.
 */
export interface EducationRequirement {
  minimumDegreeLevel: DegreeLevel;
  acceptableFields: string[];
  isRequired: boolean;
  rawText: string;
}

/**
 * Normalized representation of a parsed Job Description.
 */
export interface JobProfile {
  title: string;
  seniority: string;
  seniorityTier: number;
  requiredSkills: string[];
  preferredSkills: string[];
  tools: string[];
  responsibilities: string[];
  experienceRequirements: ExperienceRequirement[];
  educationRequirements: EducationRequirement[];
  certificationRequirements: string[];
  industryRequirements: string[];
  constraints: string[];
  rawText: string;
}

/**
 * Individual extracted requirement from a JD statement.
 */
export interface Requirement {
  id: string;
  text: string;
  normalizedValue: string;
  category: RequirementCategory;
  isRequired: boolean;
  confidence: number;
  sourcePosition?: number;
}

/**
 * Deterministic match result for an individual requirement.
 */
export interface MatchResult {
  requirement: string;
  normalizedRequirement: string;
  category: RequirementCategory;
  resumeEvidence: string;
  matchType: MatchType;
  confidence: number;
  score: number; // 0 to 100
  level: number; // 1 to 6 or 0 for missing
  notes?: string;
}

/**
 * Detailed experience comparison item.
 */
export interface ExperienceComparisonItem {
  requirement: string;
  requiredYears: number;
  detectedYears: number;
  status: ExperienceStatus;
  relevantRoles: string[];
}

/**
 * Full experience analysis breakdown.
 */
export interface ExperienceAnalysis {
  totalProfessionalYears: number;
  relevantYears: number;
  comparisons: ExperienceComparisonItem[];
  hasMajorGap: boolean;
  score: number; // 0 to 100
}

/**
 * Education analysis result.
 */
export interface EducationAnalysis {
  candidateHighestDegree?: DegreeLevel;
  requiredDegree?: DegreeLevel;
  meetsLevel: boolean;
  fieldMatch: boolean;
  detectedFields: string[];
  score: number; // 0 to 100
}

/**
 * Certification analysis result.
 */
export interface CertificationAnalysis {
  requiredCertifications: string[];
  detectedCertifications: string[];
  missingCertifications: string[];
  score: number; // 0 to 100
}

/**
 * Title and seniority compatibility analysis.
 */
export interface TitleSeniorityAnalysis {
  jdTitle: string;
  jdSeniorityTier: number;
  candidateRecentTitle: string;
  candidateMaxSeniorityTier: number;
  tierDifference: number;
  isCompatible: boolean;
  progressionTrajectory: string;
  score: number; // 0 to 100
}

/**
 * ATS compatibility inspection breakdown.
 */
export interface AtsIssue {
  type: 'WARNING' | 'ERROR' | 'INFO';
  category: string;
  message: string;
  impactScore: number;
}

export interface AtsAnalysis {
  score: number; // 0 to 100
  standardHeadingsFound: string[];
  unusualSectionsFound: string[];
  contactExtractionSuccess: boolean;
  hasTablesOrComplexFormatting: boolean;
  hasSpecialCharacters: boolean;
  keywordDensityScore: number;
  issues: AtsIssue[];
}

/**
 * Itemized score deduction.
 */
export interface ScoreDeduction {
  reason: string;
  penaltyType: string;
  pointsDeducted: number;
}

/**
 * Category score breakdown (normalized to 0-100 and weighted contributions).
 */
export interface CategoryScoreItem {
  categoryKey: string;
  label: string;
  score: number; // 0 to 100
  weight: number; // e.g. 0.25
  weightedContribution: number; // e.g. 23.0
  maxContribution: number; // e.g. 25.0
}

/**
 * Comprehensive deterministic analysis result returned by the scoring engine.
 */
export interface AnalysisResult {
  overallScore: number; // 0 to 100 (after penalties)
  baseScore: number; // 0 to 100 (before penalties)
  scoreBand: string; // e.g. "Strong Match"
  categoryScores: CategoryScoreItem[];
  matches: MatchResult[];
  partialMatches: MatchResult[];
  missingRequirements: MatchResult[];
  experienceAnalysis: ExperienceAnalysis;
  educationAnalysis: EducationAnalysis;
  certificationAnalysis: CertificationAnalysis;
  titleAnalysis: TitleSeniorityAnalysis;
  atsAnalysis: AtsAnalysis;
  risks: string[];
  penalties: ScoreDeduction[];
  totalPenalties: number;
  recommendation: ApplicationRecommendation;
  analysisTimestamp: string;
}

/**
 * Configurable scoring weights.
 */
export interface ScoringConfig {
  version: string;
  weights: {
    required_skills: number;
    preferred_skills: number;
    relevant_experience: number;
    responsibilities: number;
    title_seniority: number;
    education: number;
    certifications: number;
    industry_domain: number;
    ats_keyword_coverage: number;
  };
  skill_match_quality_weights: Record<string, number>;
}

/**
 * Future statistical callback probability model interface.
 */
export interface CallbackProbabilityFeatureVector {
  deterministicMatchScore: number;
  requiredSkillsRatio: number;
  yearsExperienceRatio: number;
  seniorityTierDiff: number;
  industryMatched: boolean;
  atsScore: number;
}

export interface ICallbackProbabilityModel {
  name: string;
  version: string;
  predict(features: CallbackProbabilityFeatureVector): {
    probability: number;
    confidenceInterval: [number, number];
    calibrationSource: string;
  };
}
