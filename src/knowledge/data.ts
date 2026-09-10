/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import skillsData from '../../knowledge/skills.json';
import skillAliasesData from '../../knowledge/skill_aliases.json';
import technologiesData from '../../knowledge/technologies.json';
import jobTitlesData from '../../knowledge/job_titles.json';
import titleHierarchyData from '../../knowledge/title_hierarchy.json';
import certificationsData from '../../knowledge/certifications.json';
import educationFieldsData from '../../knowledge/education_fields.json';
import industriesData from '../../knowledge/industries.json';
import actionVerbsData from '../../knowledge/action_verbs.json';
import requirementKeywordsData from '../../knowledge/requirement_keywords.json';
import scoringConfigData from '../../config/scoring_config.json';
import thresholdsData from '../../config/thresholds.json';
import penaltiesConfigData from '../../config/penalties_config.json';

export const KnowledgeBase = {
  skills: skillsData,
  skillAliases: skillAliasesData,
  technologies: technologiesData,
  jobTitles: jobTitlesData,
  titleHierarchy: titleHierarchyData,
  certifications: certificationsData,
  educationFields: educationFieldsData,
  industries: industriesData,
  actionVerbs: actionVerbsData,
  requirementKeywords: requirementKeywordsData,
  scoringConfig: scoringConfigData,
  thresholds: thresholdsData,
  penaltiesConfig: penaltiesConfigData,
};
