/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { JobProfile, ExperienceRequirement, EducationRequirement, RequirementCategory } from '../models/types.ts';
import { KnowledgeBase } from '../knowledge/data.ts';
import { extractSkillsFromText, detectIndustriesFromText } from './resumeParser.ts';

/**
 * Classify a statement into REQUIRED, PREFERRED, RESPONSIBILITY, CONTEXT, or CONSTRAINT.
 */
export function classifyStatement(statement: string): RequirementCategory {
  const lower = statement.toLowerCase();

  // Constraints first (e.g. citizenship, authorization)
  for (const phrase of KnowledgeBase.requirementKeywords.constraint_phrases) {
    if (lower.includes(phrase)) {
      return 'CONSTRAINT';
    }
  }

  // Preferred phrases (plus, nice to have, bonus)
  for (const phrase of KnowledgeBase.requirementKeywords.preferred_phrases) {
    if (lower.includes(phrase)) {
      return 'PREFERRED';
    }
  }

  // Required phrases (must have, minimum, required)
  for (const phrase of KnowledgeBase.requirementKeywords.required_phrases) {
    if (lower.includes(phrase)) {
      return 'REQUIRED';
    }
  }

  // Responsibility phrases (responsible for, you will, duties)
  for (const phrase of KnowledgeBase.requirementKeywords.responsibility_phrases) {
    if (lower.includes(phrase)) {
      return 'RESPONSIBILITY';
    }
  }

  // Check if starts with a strong action verb -> RESPONSIBILITY
  const firstWord = lower.trim().split(/\s+/)[0];
  const isActionVerb = KnowledgeBase.actionVerbs.verbs.some(
    (v) => v.lemma === firstWord || v.synonyms.includes(firstWord)
  );
  if (isActionVerb) {
    return 'RESPONSIBILITY';
  }

  // Context phrases
  for (const phrase of KnowledgeBase.requirementKeywords.context_phrases) {
    if (lower.includes(phrase)) {
      return 'CONTEXT';
    }
  }

  return 'REQUIRED'; // Default fallback for qualification statements
}

/**
 * Extract stated years of experience requirements (e.g. "5+ years of FP&A experience").
 */
export function extractExperienceRequirements(text: string): ExperienceRequirement[] {
  const reqs: ExperienceRequirement[] = [];
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 5);

  const expRegex = /(\d+)(?:\+|\s*-\s*\d+)?\s*(?:years?|yrs?)(?:\s+of)?(?:\s+experience)?(?:\s+in|\s+with)?\s*([a-zA-Z0-9\s/&,]+)?/i;

  for (const line of lines) {
    const match = line.match(expRegex);
    if (match) {
      const years = parseInt(match[1], 10);
      let domain = (match[2] || 'Professional Experience').trim();
      // clean trailing punctuation
      domain = domain.split(/[,.;]/)[0].trim();
      if (domain.length > 30) domain = domain.slice(0, 30);

      const isRequired = classifyStatement(line) === 'REQUIRED';
      reqs.push({
        requiredYears: years,
        skillOrDomain: domain || 'Overall Domain',
        isRequired,
        rawText: line,
      });
    }
  }

  // Default minimum if none parsed
  if (reqs.length === 0) {
    reqs.push({
      requiredYears: 3,
      skillOrDomain: 'Relevant Experience',
      isRequired: true,
      rawText: 'Relevant professional experience',
    });
  }

  return reqs;
}

/**
 * Identify Job Title and Seniority Level from JD.
 */
export function extractJobTitleAndSeniority(text: string): {
  title: string;
  seniority: string;
  seniorityTier: number;
} {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  let detectedTitle = 'Job Position';
  let seniorityTier = 2; // Analyst / Professional default
  let seniority = 'Mid-Level';

  // Check top 5 lines for known job titles
  for (const line of lines.slice(0, 5)) {
    const lower = line.toLowerCase();
    for (const job of KnowledgeBase.jobTitles) {
      if (
        lower.includes(job.title.toLowerCase()) ||
        job.synonyms.some((syn) => lower.includes(syn.toLowerCase()))
      ) {
        detectedTitle = job.title;
        seniorityTier = job.seniority_level;
        break;
      }
    }
    if (detectedTitle !== 'Job Position') break;
  }

  // If title is still default, use first non-empty line
  if (detectedTitle === 'Job Position' && lines.length > 0) {
    detectedTitle = lines[0].replace(/^(job title|role|position)[:\-]\s*/i, '').slice(0, 50);
  }

  // Check for explicit seniority indicators
  const lowerText = text.toLowerCase();
  for (const tier of KnowledgeBase.titleHierarchy.seniority_tiers) {
    for (const kw of tier.keywords) {
      const pattern = new RegExp(`\\b${escapeRegExp(kw)}\\b`, 'i');
      if (pattern.test(lowerText.slice(0, 300)) || pattern.test(detectedTitle.toLowerCase())) {
        seniorityTier = tier.tier;
        seniority = tier.name;
        break;
      }
    }
  }

  return { title: detectedTitle, seniority, seniorityTier };
}

/**
 * Extract required education requirements from JD.
 */
export function extractEducationRequirements(text: string): EducationRequirement[] {
  const reqs: EducationRequirement[] = [];
  const lower = text.toLowerCase();

  for (const deg of KnowledgeBase.educationFields.degree_levels) {
    for (const alias of deg.aliases) {
      if (new RegExp(`\\b${escapeRegExp(alias)}\\b`, 'i').test(lower)) {
        // Collect acceptable fields
        const fields: string[] = [];
        for (const disc of KnowledgeBase.educationFields.disciplines) {
          if (new RegExp(`\\b${escapeRegExp(disc.field.toLowerCase())}\\b`, 'i').test(lower)) {
            fields.push(disc.field);
          }
        }

        reqs.push({
          minimumDegreeLevel: deg.name as any,
          acceptableFields: fields.length > 0 ? fields : ['Relevant Field'],
          isRequired: !lower.includes(`${alias} preferred`),
          rawText: `${deg.name} degree required/preferred`,
        });
        return reqs;
      }
    }
  }

  return [
    {
      minimumDegreeLevel: "Bachelor's",
      acceptableFields: ['Finance', 'Accounting', 'Business', 'Engineering'],
      isRequired: true,
      rawText: "Bachelor's degree in related field",
    },
  ];
}

/**
 * Master Job Description parsing function.
 */
export function parseJobDescription(rawText: string): JobProfile {
  const { title, seniority, seniorityTier } = extractJobTitleAndSeniority(rawText);
  const experienceRequirements = extractExperienceRequirements(rawText);
  const educationRequirements = extractEducationRequirements(rawText);
  const detectedSkills = extractSkillsFromText(rawText);
  const industries = detectIndustriesFromText(rawText);

  // Partition skills into required vs preferred based on surrounding sentence context
  const lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const requiredSkills: string[] = [];
  const preferredSkills: string[] = [];
  const responsibilities: string[] = [];
  const constraints: string[] = [];

  for (const line of lines) {
    const category = classifyStatement(line);

    if (category === 'RESPONSIBILITY') {
      responsibilities.push(line.replace(/^[*•\-\d.)]+\s*/, '').trim());
    } else if (category === 'CONSTRAINT') {
      constraints.push(line);
    }

    // Assign skills found in this line
    for (const skill of detectedSkills) {
      if (line.toLowerCase().includes(skill.toLowerCase())) {
        if (category === 'PREFERRED') {
          if (!preferredSkills.includes(skill)) preferredSkills.push(skill);
        } else {
          if (!requiredSkills.includes(skill)) requiredSkills.push(skill);
        }
      }
    }
  }

  // Ensure all detected skills are categorized
  for (const s of detectedSkills) {
    if (!requiredSkills.includes(s) && !preferredSkills.includes(s)) {
      requiredSkills.push(s);
    }
  }

  // Certifications required in JD
  const certificationRequirements: string[] = [];
  for (const cert of KnowledgeBase.certifications) {
    if (new RegExp(`\\b${escapeRegExp(cert.canonical.toLowerCase())}\\b`, 'i').test(rawText.toLowerCase())) {
      certificationRequirements.push(cert.canonical);
    }
  }

  return {
    title,
    seniority,
    seniorityTier,
    requiredSkills,
    preferredSkills,
    tools: detectedSkills.filter((s) =>
      KnowledgeBase.technologies.some((t) => t.name.toLowerCase() === s.toLowerCase())
    ),
    responsibilities: responsibilities.slice(0, 15),
    experienceRequirements,
    educationRequirements,
    certificationRequirements,
    industryRequirements: industries,
    constraints,
    rawText,
  };
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
