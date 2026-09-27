#!/usr/bin/env node
/**
 * Brain health for Hermes' `brain-health` routine (hermes cron --no-agent --script).
 * One line per problem — a machine's Heartbeat missing, stale or failed, or Sources in Drift —
 * and NOTHING when healthy: empty stdout is silence, so the routine only speaks when something
 * is wrong. No LLM, no tokens. The checks themselves live in lint.mjs (check 11); this filters.
 */
import { execFileSync } from 'child_process';
import { resolve } from 'path';

const lint = resolve(import.meta.dirname, 'lint.mjs');
let out;
try {
  out = execFileSync(process.execPath, [lint, '--json'], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
} catch (e) {
  out = e.stdout;   // lint exits 1 whenever it finds errors; its JSON is still on stdout
}

let findings;
try {
  findings = JSON.parse(out).findings;
} catch {
  // A health check that fails quietly is the failure it exists to catch — say so.
  console.log(`Brain health: lint did not run (${lint}) — check this job.`);
  process.exit(0);
}

const lines = findings
  .filter((f) => f.check === 'heartbeat' && (f.severity === 'ERROR' || f.message.includes('Drift')))
  .map((f) => `${f.severity}: ${f.message}`);

if (lines.length) console.log(['Brain health (MIMemoryLLMDb):', ...lines].join('\n'));
