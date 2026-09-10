/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { describe, it, assertTrue, assertEqual } from './test_runner.ts';

describe('Knowledge Base Integrity Suite', () => {
  const knowledgeDir = path.resolve(process.cwd(), 'knowledge');

  it('should verify all required knowledge base files exist', () => {
    const requiredFiles = [
      'skills.json',
      'skill_aliases.json',
      'technologies.json',
      'job_titles.json',
      'title_hierarchy.json',
      'certifications.json',
      'education_fields.json',
      'industries.json',
      'action_verbs.json',
      'requirement_keywords.json'
    ];

    for (const file of requiredFiles) {
      const fullPath = path.join(knowledgeDir, file);
      assertTrue(fs.existsSync(fullPath), `Knowledge file ${file} must exist`);
      const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
      assertTrue(Boolean(data), `Knowledge file ${file} must parse to non-empty JSON`);
    }
  });

  it('should verify skill_aliases contains canonical items with aliases', () => {
    const filePath = path.join(knowledgeDir, 'skill_aliases.json');
    const list: Array<{ canonical: string; aliases: string[] }> = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    assertTrue(list.length >= 10, 'Should have at least 10 canonical alias groups');

    const fpa = list.find((item) => item.canonical === 'Financial Planning and Analysis');
    assertTrue(Boolean(fpa), 'Must contain Financial Planning and Analysis');
    assertTrue(fpa!.aliases.includes('fp&a'), 'Must contain fp&a alias');
    assertTrue(fpa!.aliases.includes('financial planning & analysis'), 'Must contain ampersand alias');

    const sql = list.find((item) => item.canonical === 'SQL');
    assertTrue(Boolean(sql), 'Must contain SQL');
    assertTrue(sql!.aliases.includes('structured query language'), 'Must contain abbreviation expansion');
  });

  it('should verify title_hierarchy tracks seniority levels accurately', () => {
    const filePath = path.join(knowledgeDir, 'title_hierarchy.json');
    const hierarchy = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    assertTrue(Array.isArray(hierarchy.seniority_tiers), 'Must have seniority_tiers array');
    assertEqual(hierarchy.seniority_tiers.length, 8, 'Must have 8 tiers from Entry to Executive');
  });
});
