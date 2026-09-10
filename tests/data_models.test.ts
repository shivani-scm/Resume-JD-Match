/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, assertTrue, assertEqual } from './test_runner.ts';
import type { ResumeProfile, JobProfile, AnalysisResult } from '../src/models/types.ts';

describe('Data Models & Synthetic Benchmark Suite', () => {
  it('should instantiate a valid ResumeProfile model', () => {
    const resume: ResumeProfile = {
      candidateName: 'Jane Doe',
      contactInfo: {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        phone: '555-0199',
        location: 'New York, NY',
        linkedin: 'linkedin.com/in/janedoe'
      },
      summary: 'Experienced Senior Financial Analyst with 5+ years in FP&A, financial modeling, and SQL.',
      skills: ['FP&A', 'Financial Modeling', 'Forecasting', 'SQL', 'Power BI'],
      tools: ['Excel', 'SAP ERP', 'Adaptive Planning'],
      titles: ['Senior Financial Analyst', 'Financial Analyst'],
      experiences: [
        {
          company: 'FinTech Growth Corp',
          title: 'Senior Financial Analyst',
          startDate: '2023-01',
          endDate: 'Present',
          durationMonths: 20,
          isCurrent: true,
          skills: ['FP&A', 'SQL', 'Power BI'],
          responsibilities: [
            'Led annual budgeting and monthly forecasting processes for $50M portfolio',
            'Developed automated Power BI executive reporting dashboards'
          ],
          industries: ['Finance', 'SaaS']
        }
      ],
      education: [
        {
          institution: 'NYU Stern School of Business',
          degreeLevel: "Bachelor's",
          fieldOfStudy: 'Finance',
          graduationYear: 2019,
          isCompleted: true
        }
      ],
      certifications: [
        {
          canonicalName: 'CFA',
          rawText: 'CFA Level II Candidate',
          isActive: true
        }
      ],
      projects: [],
      industries: ['Finance', 'SaaS'],
      rawText: 'Jane Doe resume text...'
    };

    assertEqual(resume.candidateName, 'Jane Doe');
    assertEqual(resume.experiences.length, 1);
    assertTrue(resume.skills.includes('FP&A'));
  });

  it('should instantiate a valid JobProfile model', () => {
    const jd: JobProfile = {
      title: 'Senior FP&A Analyst',
      seniority: 'Senior',
      seniorityTier: 4,
      requiredSkills: ['FP&A', 'Financial Modeling', 'SQL', 'Power BI'],
      preferredSkills: ['Adaptive Planning', 'SAP S/4HANA'],
      tools: ['Excel', 'Power BI', 'SQL'],
      responsibilities: [
        'Develop monthly financial forecasts and variance analysis',
        'Partner with leadership to drive strategic annual budgeting'
      ],
      experienceRequirements: [
        {
          requiredYears: 5,
          skillOrDomain: 'FP&A',
          isRequired: true,
          rawText: '5+ years FP&A experience'
        }
      ],
      educationRequirements: [
        {
          minimumDegreeLevel: "Bachelor's",
          acceptableFields: ['Finance', 'Accounting', 'Economics'],
          isRequired: true,
          rawText: "Bachelor's degree in Finance, Accounting, Economics or related field"
        }
      ],
      certificationRequirements: [],
      industryRequirements: ['Finance', 'SaaS'],
      constraints: ['Must be authorized to work in the United States'],
      rawText: 'Job description text...'
    };

    assertEqual(jd.title, 'Senior FP&A Analyst');
    assertEqual(jd.experienceRequirements[0].requiredYears, 5);
    assertTrue(jd.requiredSkills.includes('FP&A'));
  });

  it('should structure an AnalysisResult with deterministic explainability', () => {
    const analysis: AnalysisResult = {
      overallScore: 87.0,
      baseScore: 87.0,
      scoreBand: 'Strong Match',
      categoryScores: [
        {
          categoryKey: 'required_skills',
          label: 'Required Skills',
          score: 92.0,
          weight: 0.25,
          weightedContribution: 23.0,
          maxContribution: 25.0
        },
        {
          categoryKey: 'preferred_skills',
          label: 'Preferred Skills',
          score: 70.0,
          weight: 0.10,
          weightedContribution: 7.0,
          maxContribution: 10.0
        }
      ],
      matches: [
        {
          requirement: 'SQL',
          normalizedRequirement: 'SQL',
          category: 'REQUIRED',
          resumeEvidence: 'Structured Query Language',
          matchType: 'ALIAS',
          confidence: 0.95,
          score: 100,
          level: 2
        }
      ],
      partialMatches: [
        {
          requirement: 'SAP S/4HANA',
          normalizedRequirement: 'SAP S/4HANA',
          category: 'PREFERRED',
          resumeEvidence: 'SAP ERP',
          matchType: 'PARTIAL',
          confidence: 0.75,
          score: 65,
          level: 6
        }
      ],
      missingRequirements: [],
      experienceAnalysis: {
        totalProfessionalYears: 5.4,
        relevantYears: 5.4,
        comparisons: [
          {
            requirement: 'FP&A',
            requiredYears: 5,
            detectedYears: 5.4,
            status: 'MEETS',
            relevantRoles: ['Senior Financial Analyst', 'Financial Analyst']
          }
        ],
        hasMajorGap: false,
        score: 95.0
      },
      educationAnalysis: {
        candidateHighestDegree: "Bachelor's",
        requiredDegree: "Bachelor's",
        meetsLevel: true,
        fieldMatch: true,
        detectedFields: ['Finance'],
        score: 100.0
      },
      certificationAnalysis: {
        requiredCertifications: [],
        detectedCertifications: ['CFA'],
        missingCertifications: [],
        score: 100.0
      },
      titleAnalysis: {
        jdTitle: 'Senior FP&A Analyst',
        jdSeniorityTier: 4,
        candidateRecentTitle: 'Senior Financial Analyst',
        candidateMaxSeniorityTier: 4,
        tierDifference: 0,
        isCompatible: true,
        progressionTrajectory: 'Lateral / High Alignment',
        score: 90.0
      },
      atsAnalysis: {
        score: 94.0,
        standardHeadingsFound: ['Experience', 'Education', 'Skills'],
        unusualSectionsFound: [],
        contactExtractionSuccess: true,
        hasTablesOrComplexFormatting: false,
        hasSpecialCharacters: false,
        keywordDensityScore: 92.0,
        issues: []
      },
      risks: [],
      penalties: [],
      totalPenalties: 0,
      recommendation: 'HIGH PRIORITY APPLICATION',
      analysisTimestamp: new Date().toISOString()
    };

    assertEqual(analysis.overallScore, 87.0);
    assertEqual(analysis.recommendation, 'HIGH PRIORITY APPLICATION');
  });
});
