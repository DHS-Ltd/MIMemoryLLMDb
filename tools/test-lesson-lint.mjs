// Run: node tools/test-lesson-lint.mjs — planted fixtures only, never real memory.
import assert from 'assert';
import { lessonFindings, MAX_LESSONS } from './lesson-lint.mjs';

const PRODUCTS = ['DH PACS', 'DHV', 'Advanced DICOM Image Viewer', 'DHDicomAnalyzerPro', 'HMS'];
const lesson = (text, meta = { use_when: 'x' }) => ({ path: 'fixture.md', text, meta });
const checks = (lessons) => lessonFindings(lessons, PRODUCTS).map(f => f[1]);

assert.deepEqual(checks([lesson('Batching hurts tail latency in DH PACS.')]), ['lesson-names-product']);
assert.deepEqual(checks([lesson('Seen in the dh pacs worklist.')]), ['lesson-names-product'], 'long names any case');
assert.deepEqual(checks([lesson('Before an HMS release, test integrity first.')]), ['lesson-names-product']);
assert.deepEqual(checks([lesson('Generic hms or Hms systems, and DHVs, are fine.')]), [], 'acronyms: exact whole word only');
assert.deepEqual(checks([lesson('Check P99 before caching.')]), []);
assert.deepEqual(checks([lesson('ok', {})]), ['lesson-no-use-when']);
assert.deepEqual(checks(Array(MAX_LESSONS).fill(lesson('ok'))), []);
assert.deepEqual(checks(Array(MAX_LESSONS + 1).fill(lesson('ok'))), ['lessons-ceiling']);
console.log('lesson-lint: all checks passed');
