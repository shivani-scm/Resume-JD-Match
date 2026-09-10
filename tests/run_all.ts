/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { printSummary } from './test_runner.ts';

// Import all test suites
import './config_integrity.test.ts';
import './knowledge_base.test.ts';
import './data_models.test.ts';

// Print final test execution summary
setTimeout(() => {
  printSummary();
}, 100);
