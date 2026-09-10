/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Minimal deterministic test assertion runner for ResumeMatch.
 */

type TestFn = () => void | Promise<void>;

interface TestReport {
  suiteName: string;
  testName: string;
  passed: boolean;
  error?: Error;
  durationMs: number;
}

const reports: TestReport[] = [];
let currentSuite = 'Default';

export function describe(suite: string, fn: () => void | Promise<void>) {
  currentSuite = suite;
  console.log(`\n▶ [SUITE] ${suite}`);
  fn();
}

export function it(testName: string, fn: TestFn) {
  const start = performance.now();
  try {
    const result = fn();
    if (result && typeof (result as Promise<void>).then === 'function') {
      (result as Promise<void>)
        .then(() => {
          const durationMs = performance.now() - start;
          reports.push({ suiteName: currentSuite, testName, passed: true, durationMs });
          console.log(`  ✔ ${testName} (${durationMs.toFixed(1)}ms)`);
        })
        .catch((err) => {
          const durationMs = performance.now() - start;
          reports.push({ suiteName: currentSuite, testName, passed: false, error: err, durationMs });
          console.error(`  ✖ ${testName} (${durationMs.toFixed(1)}ms):`, err.message);
        });
      return;
    }
    const durationMs = performance.now() - start;
    reports.push({ suiteName: currentSuite, testName, passed: true, durationMs });
    console.log(`  ✔ ${testName} (${durationMs.toFixed(1)}ms)`);
  } catch (err: any) {
    const durationMs = performance.now() - start;
    reports.push({ suiteName: currentSuite, testName, passed: false, error: err, durationMs });
    console.error(`  ✖ ${testName} (${durationMs.toFixed(1)}ms):`, err.message);
  }
}

export function assertEqual<T>(actual: T, expected: T, message?: string) {
  if (actual !== expected) {
    throw new Error(
      `${message || 'Assertion failed'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  }
}

export function assertTrue(condition: boolean, message?: string) {
  if (!condition) {
    throw new Error(message || 'Expected condition to be true');
  }
}

export function assertCloseTo(actual: number, expected: number, tolerance = 0.001, message?: string) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(
      `${message || 'Assertion failed'}: expected ${expected} ± ${tolerance}, got ${actual}`
    );
  }
}

export function printSummary() {
  const passed = reports.filter((r) => r.passed).length;
  const failed = reports.filter((r) => !r.passed).length;
  console.log(`\n========================================`);
  console.log(`Test Execution Summary: ${passed} passed, ${failed} failed (${reports.length} total)`);
  console.log(`========================================\n`);
  if (failed > 0) {
    process.exit(1);
  }
}
