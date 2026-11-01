/**
 * Backup checks for lint.mjs check 11 (ADR-0012). Pure: takes one machine's Heartbeat and its
 * `backups` limits from machines.json ({ job: max hours since its last success }), returns findings.
 *
 * Ages are measured at the Heartbeat's own time, not now: a stale Heartbeat is already its own
 * ERROR, and measuring from now would repeat it once per job. Check name 'heartbeat' so
 * brain-health forwards these to Telegram.
 */
export function backupFindings(id, beat, limits, file) {
  const out = [];
  if (!limits) return out;   // this machine runs no backups
  const at = Date.parse(beat.last_run);
  for (const [job, maxHours] of Object.entries(limits)) {
    const r = beat.backup?.[job];
    if (!r) {
      out.push(['ERROR', 'heartbeat', file, `${id} reported no ${job} result — its backup job is not installed or has never run (tools/install-backup.ps1 on ${id})`]);
      continue;
    }
    if (r.ok === false) {
      const when = r.last_run ? ` at ${r.last_run}` : '';
      out.push(['ERROR', 'heartbeat', file, `${id}'s ${job} failed${when}: ${r.detail} — see ${r.log || `${job}.log`} on ${id}`]);
    }
    const hours = (at - Date.parse(r.last_ok)) / 36e5;
    if (!(hours <= maxHours)) {   // negated so a missing last_ok (never succeeded, NaN) also fails
      out.push(['ERROR', 'heartbeat', file, Number.isFinite(hours)
        ? `${id}'s ${job} last succeeded ${r.last_ok} (${Math.round(hours)}h before the Heartbeat; limit ${maxHours}h)`
        : `${id}'s ${job} has never succeeded`]);
    }
  }
  return out;
}
