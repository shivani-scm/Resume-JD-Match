/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ResumeProfile, Experience, Education, Certification, ContactInfo } from '../models/types.ts';
import { KnowledgeBase } from '../knowledge/data.ts';

// Common section header markers
const SECTION_PATTERNS: Record<string, RegExp> = {
  summary: /^(summary|professional summary|executive summary|profile|about me|objective)\b/i,
  experience: /^(experience|work experience|employment history|professional experience|career history|work history)\b/i,
  education: /^(education|academic background|academics|educational qualifications)\b/i,
  skills: /^(skills|technical skills|core competencies|areas of expertise|technologies|tools & technologies)\b/i,
  certifications: /^(certifications|licenses|credentials|professional certifications|certifications & licenses)\b/i,
  projects: /^(projects|key projects|personal projects|portfolio)\b/i,
};

// Month name lookup for date parsing
const MONTHS: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

/**
 * Extract contact information from resume text.
 */
export function extractContactInfo(text: string): ContactInfo {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);

  // Extract candidate name: first clean line before contact details
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  let candidateName = 'Candidate';
  for (const line of lines.slice(0, 5)) {
    if (
      !line.includes('@') &&
      !line.match(/\d{3}/) &&
      !line.toLowerCase().includes('resume') &&
      !line.toLowerCase().includes('curriculum vitae') &&
      line.length < 40 &&
      line.split(' ').length <= 4
    ) {
      candidateName = line;
      break;
    }
  }

  // Location heuristic: City, ST or City, Country
  const locationMatch = text.match(/([A-Z][a-zA-Z\s]+,\s*(?:[A-Z]{2}|[A-Z][a-zA-Z\s]+))/);

  return {
    name: candidateName,
    email: emailMatch ? emailMatch[0] : undefined,
    phone: phoneMatch ? phoneMatch[0] : undefined,
    location: locationMatch ? locationMatch[0].trim() : undefined,
    linkedin: linkedinMatch ? linkedinMatch[0] : undefined,
    github: githubMatch ? githubMatch[0] : undefined,
  };
}

/**
 * Segment raw document into recognized sections.
 */
export function segmentSections(text: string): Record<string, string[]> {
  const lines = text.split('\n').map((l) => l.trim());
  const sections: Record<string, string[]> = {
    header: [],
    summary: [],
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    other: [],
  };

  let currentSection = 'header';

  for (const line of lines) {
    if (!line) continue;

    // Check if this line is a section heading
    let matchedSection: string | null = null;
    const cleanHeader = line.replace(/[:\-#=]/g, '').trim();

    for (const [secKey, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(cleanHeader)) {
        matchedSection = secKey;
        break;
      }
    }

    if (matchedSection) {
      currentSection = matchedSection;
    } else {
      if (!sections[currentSection]) {
        sections[currentSection] = [];
      }
      sections[currentSection].push(line);
    }
  }

  return sections;
}

/**
 * Parse date string into [year, month] representation.
 */
function parseDateString(dateStr: string): { year: number; month: number } | null {
  const clean = dateStr.trim().toLowerCase();
  if (clean === 'present' || clean === 'current' || clean === 'now') {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }

  // Try "Month YYYY" or "Mon YYYY"
  const monthYearMatch = clean.match(/([a-z]+)\.?\s+(\d{4})/i);
  if (monthYearMatch) {
    const mStr = monthYearMatch[1].slice(0, 3);
    const month = MONTHS[mStr] || 1;
    const year = parseInt(monthYearMatch[2], 10);
    return { year, month };
  }

  // Try "MM/YYYY" or "YYYY-MM"
  const slashMatch = clean.match(/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    return { month: parseInt(slashMatch[1], 10), year: parseInt(slashMatch[2], 10) };
  }

  // Try just year "YYYY"
  const yearMatch = clean.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearMatch) {
    return { year: parseInt(yearMatch[1], 10), month: 1 };
  }

  return null;
}

/**
 * Parse work experiences from the experience section lines.
 */
export function parseExperiences(lines: string[]): Experience[] {
  const experiences: Experience[] = [];
  let currentExp: Partial<Experience> | null = null;

  // Regex to detect date range like "Jan 2020 - Present", "2018 - 2022", "06/2019 to 08/2021"
  const dateRangeRegex = /([a-z]{3,9}\.?\s+\d{4}|\d{1,2}\/\d{4}|\b(?:19|20)\d{2}\b)\s*(?:–|-|to)\s*([a-z]{3,9}\.?\s+\d{4}|\d{1,2}\/\d{4}|\b(?:19|20)\d{2}\b|present|current)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dateMatch = line.match(dateRangeRegex);

    if (dateMatch) {
      if (currentExp && currentExp.title) {
        experiences.push(finalizeExperience(currentExp));
      }

      const startParsed = parseDateString(dateMatch[1]);
      const endParsed = parseDateString(dateMatch[2]);
      const isCurrent = /present|current/i.test(dateMatch[2]);

      let durationMonths = 12; // fallback
      if (startParsed && endParsed) {
        durationMonths = Math.max(
          1,
          (endParsed.year - startParsed.year) * 12 + (endParsed.month - startParsed.month)
        );
      }

      // Title & Company extraction from line before or rest of current line
      let title = 'Professional';
      let company = 'Company';

      // Check text surrounding date
      const textWithoutDate = line.replace(dateRangeRegex, '').replace(/[|•–-]/g, ' ').trim();
      const parts = textWithoutDate.split(/\s+at\s+|\s*,\s*|\s*\|\s*/i).filter((p) => p.length > 2);

      if (parts.length >= 2) {
        title = parts[0];
        company = parts[1];
      } else if (parts.length === 1) {
        title = parts[0];
      }

      // If line before exists and has company name
      if (i > 0 && lines[i - 1].length < 60 && !lines[i - 1].match(dateRangeRegex)) {
        const prevLine = lines[i - 1];
        if (prevLine.includes(',') || prevLine.includes('|') || prevLine.includes(' - ')) {
          const prevParts = prevLine.split(/[,|–-]/).map((s) => s.trim());
          if (prevParts[0]) title = prevParts[0];
          if (prevParts[1]) company = prevParts[1];
        } else {
          company = prevLine;
        }
      }

      currentExp = {
        title,
        company,
        startDate: dateMatch[1],
        endDate: dateMatch[2],
        durationMonths,
        isCurrent,
        responsibilities: [],
        skills: [],
        industries: [],
      };
    } else if (currentExp) {
      // Add as responsibility or bullet point
      const cleanBullet = line.replace(/^[*•\-\d.)]+\s*/, '').trim();
      if (cleanBullet.length > 10) {
        currentExp.responsibilities = currentExp.responsibilities || [];
        currentExp.responsibilities.push(cleanBullet);
      }
    }
  }

  if (currentExp && currentExp.title) {
    experiences.push(finalizeExperience(currentExp));
  }

  // Fallback: if no experiences parsed, create a baseline experience record from lines
  if (experiences.length === 0 && lines.length > 0) {
    experiences.push({
      title: 'Professional',
      company: 'Enterprise',
      startDate: '2020',
      endDate: 'Present',
      durationMonths: 36,
      isCurrent: true,
      responsibilities: lines.filter((l) => l.length > 20),
      skills: [],
      industries: [],
    });
  }

  return experiences;
}

function finalizeExperience(exp: Partial<Experience>): Experience {
  const fullText = (exp.responsibilities || []).join(' ') + ' ' + (exp.title || '');
  const detectedSkills = extractSkillsFromText(fullText);

  return {
    title: exp.title || 'Role',
    company: exp.company || 'Organization',
    startDate: exp.startDate || '2020',
    endDate: exp.endDate || 'Present',
    durationMonths: exp.durationMonths || 12,
    isCurrent: Boolean(exp.isCurrent),
    responsibilities: exp.responsibilities || [],
    skills: detectedSkills,
    industries: detectIndustriesFromText(fullText),
  };
}

/**
 * Extract skills from text by matching canonical skills and aliases.
 */
export function extractSkillsFromText(text: string): string[] {
  const lowerText = ` ${text.toLowerCase()} `;
  const found = new Set<string>();

  // Check canonical skills
  for (const s of KnowledgeBase.skills) {
    const pattern = new RegExp(`\\b${escapeRegExp(s.canonical.toLowerCase())}\\b`, 'i');
    if (pattern.test(lowerText)) {
      found.add(s.canonical);
    }
  }

  // Check aliases
  for (const item of KnowledgeBase.skillAliases) {
    if (lowerText.includes(item.canonical.toLowerCase())) {
      found.add(item.canonical);
    }
    for (const alias of item.aliases) {
      const pattern = new RegExp(`\\b${escapeRegExp(alias.toLowerCase())}\\b`, 'i');
      if (pattern.test(lowerText)) {
        found.add(item.canonical);
        break;
      }
    }
  }

  return Array.from(found);
}

/**
 * Extract education degrees and fields.
 */
export function parseEducation(lines: string[]): Education[] {
  const educations: Education[] = [];
  const text = lines.join(' ');

  for (const deg of KnowledgeBase.educationFields.degree_levels) {
    for (const alias of deg.aliases) {
      const pattern = new RegExp(`\\b${escapeRegExp(alias)}\\b`, 'i');
      if (pattern.test(text)) {
        // Detect field
        let fieldOfStudy = 'General';
        for (const disc of KnowledgeBase.educationFields.disciplines) {
          for (const dAlias of disc.aliases) {
            if (new RegExp(`\\b${escapeRegExp(dAlias)}\\b`, 'i').test(text)) {
              fieldOfStudy = disc.field;
              break;
            }
          }
          if (fieldOfStudy !== 'General') break;
        }

        // Detect institution
        let institution = 'University';
        for (const line of lines) {
          if (/university|college|institute|school/i.test(line)) {
            institution = line.split(/[,|–-]/)[0].trim();
            break;
          }
        }

        // Detect graduation year
        const yearMatch = text.match(/\b(19\d{2}|20\d{2})\b/);
        const graduationYear = yearMatch ? parseInt(yearMatch[1], 10) : undefined;

        educations.push({
          institution,
          degreeLevel: deg.name as any,
          fieldOfStudy,
          graduationYear,
          isCompleted: true,
        });
        return educations; // Found primary degree
      }
    }
  }

  return educations;
}

/**
 * Parse certifications from text.
 */
export function parseCertifications(text: string): Certification[] {
  const certs: Certification[] = [];
  const lowerText = text.toLowerCase();

  for (const cert of KnowledgeBase.certifications) {
    const isExact = new RegExp(`\\b${escapeRegExp(cert.canonical.toLowerCase())}\\b`, 'i').test(lowerText);
    const isAlias = cert.aliases.some((a) =>
      new RegExp(`\\b${escapeRegExp(a.toLowerCase())}\\b`, 'i').test(lowerText)
    );

    if (isExact || isAlias) {
      certs.push({
        canonicalName: cert.canonical,
        rawText: cert.full_name,
        issuingAuthority: cert.authority,
        isActive: true,
      });
    }
  }

  return certs;
}

/**
 * Detect industries from text.
 */
export function detectIndustriesFromText(text: string): string[] {
  const lower = text.toLowerCase();
  const matched = new Set<string>();

  for (const ind of KnowledgeBase.industries) {
    if (new RegExp(`\\b${escapeRegExp(ind.canonical.toLowerCase())}\\b`, 'i').test(lower)) {
      matched.add(ind.canonical);
    }
    for (const alias of ind.aliases) {
      if (new RegExp(`\\b${escapeRegExp(alias.toLowerCase())}\\b`, 'i').test(lower)) {
        matched.add(ind.canonical);
        break;
      }
    }
  }

  return Array.from(matched);
}

/**
 * Master resume parsing function.
 */
export function parseResume(rawText: string): ResumeProfile {
  const sections = segmentSections(rawText);
  const contactInfo = extractContactInfo(rawText);
  const experiences = parseExperiences(sections.experience.length > 0 ? sections.experience : rawText.split('\n'));
  const education = parseEducation(sections.education);
  const certifications = parseCertifications(rawText);
  const skills = extractSkillsFromText(rawText);
  const industries = detectIndustriesFromText(rawText);

  // Extract candidate titles
  const titles = experiences.map((e) => e.title);

  return {
    candidateName: contactInfo.name || 'Candidate',
    contactInfo,
    summary: sections.summary.join(' '),
    skills,
    tools: skills.filter((s) =>
      KnowledgeBase.technologies.some((t) => t.name.toLowerCase() === s.toLowerCase())
    ),
    titles,
    experiences,
    education,
    certifications,
    projects: [],
    industries,
    rawText,
  };
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
