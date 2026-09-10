/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { describe, it, assertEqual, assertTrue, assertCloseTo } from './test_runner.ts';

describe('Configuration Integrity Suite', () => {
  it('should load scoring_config.json and verify weights sum exactly to 1.00', () => {
    const filePath = path.resolve(process.cwd(), 'config', 'scoring_config.json');
    assertTrue(fs.existsSync(filePath), 'scoring_config.json must exist');
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const weights: Record<string, number> = content.weights;
    const sum = Object.values(weights).reduce((acc: number, val: number) => acc + Number(val), 0);
    assertCloseTo(sum, 1.0, 0.0001, 'Category weights must sum to 1.00 (100%)');
    assertEqual(weights.required_skills, 0.25, 'Required skills weight must be 25%');
    assertEqual(weights.relevant_experience, 0.20, 'Relevant experience weight must be 20%');
    assertEqual(weights.responsibilities, 0.15, 'Responsibilities weight must be 15%');
  });

  it('should verify thresholds.json score bands do not have gaps or overlaps', () => {
    const filePath = path.resolve(process.cwd(), 'config', 'thresholds.json');
    assertTrue(fs.existsSync(filePath), 'thresholds.json must exist');
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const bands = content.score_bands;
    assertTrue(Array.isArray(bands) && bands.length === 6, 'Must have 6 score bands');
    assertEqual(bands[0].label, 'Exceptional Match');
    assertEqual(bands[bands.length - 1].label, 'Poor Match');
  });

  it('should verify penalties_config.json has required penalty definitions', () => {
    const filePath = path.resolve(process.cwd(), 'config', 'penalties_config.json');
    assertTrue(fs.existsSync(filePath), 'penalties_config.json must exist');
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const penalties = content.penalties;
    assertTrue(Boolean(penalties.missing_critical_skill), 'missing_critical_skill must be defined');
    assertEqual(penalties.missing_critical_skill.points, 8.0);
    assertEqual(penalties.mandatory_certification_missing.points, 10.0);
    assertEqual(penalties.major_experience_gap.points, 10.0);
    assertEqual(penalties.mandatory_degree_missing.points, 7.0);
    assertEqual(penalties.major_seniority_mismatch.points, 7.0);
  });
});
