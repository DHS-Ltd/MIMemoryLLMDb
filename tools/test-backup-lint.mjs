// Run: node tools/test-backup-lint.mjs — planted Heartbeats only, never a real one.
import assert from 'assert';
import { backupFindings } from './backup-lint.mjs';

const LIMITS = { 'mirror-D': 2, 'mirror-G': 26, image: 192 };
const AT = '2026-11-01T23:00:00+06:00';
const hoursBefore = (h) => new Date(Date.parse(AT) - h * 36e5).toISOString();
const ok = (h) => ({ ok: true, last_run: hoursBefore(h), last_ok: hoursBefore(h), detail: '' });
const healthy = () => ({ 'mirror-D': ok(0.3), 'mirror-G': ok(22.5), image: ok(165) });
const beat = (backup) => ({ last_run: AT, backup });
const count = (b, limits = LIMITS) => backupFindings('machineA', b, limits, 'status/machineA.json').length;

assert.equal(count(beat(healthy())), 0, 'healthy: silent');
assert.equal(count(beat(healthy()), undefined), 0, 'a machine with no backups configured is not checked');
assert.equal(count({ last_run: AT }), 3, 'no backup field at all: every job missing');

const missing = healthy(); delete missing.image;
assert.equal(count(beat(missing)), 1, 'one job never reported');

const stale = healthy(); stale['mirror-D'] = ok(3);
assert.equal(count(beat(stale)), 1, 'hourly Mirror older than 2h');

const failed = healthy(); failed['mirror-G'] = { ...ok(1), ok: false, last_ok: hoursBefore(20), detail: 'robocopy exit 8' };
assert.equal(count(beat(failed)), 1, 'last run failed, last success still in limit');

const never = healthy(); never.image = { ok: false, last_run: hoursBefore(1), last_ok: null, detail: 'wbadmin exit 1' };
assert.equal(count(beat(never)), 2, 'failed and never succeeded: both reported');

const [f] = backupFindings('machineA', beat(stale), LIMITS, 'status/machineA.json');
assert.deepEqual(f.slice(0, 2), ['ERROR', 'heartbeat'], 'brain-health forwards only heartbeat ERRORs');
console.log('backup-lint: all checks passed');
