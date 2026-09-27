import { z } from 'zod';
import {
  gitReadFile, gitListMdPaths, gitFetchIfStale, parseFrontmatter, extractTitle,
  getProjectGitPath, readFullRegistryFromGit, readFullRegistry,
} from '../lib/repo.js';

const RECENT_ADR_COUNT = 5;
const PROJECT_HEAD_LINES = 50;
const MAX_HEARTBEAT_HOURS = 48;   // same threshold as tools/lint.mjs check 11

// A stopped scheduled sync is silent — only a missing or stale heartbeat reveals it.
function readHeartbeats(repoPath) {
  let machines = {};
  try { machines = JSON.parse(gitReadFile(repoPath, 'machines.json') || '{}').machines || {}; } catch { /* no machines.json */ }
  return Object.keys(machines).map((id) => {
    const text = gitReadFile(repoPath, `status/${id}.json`);
    if (!text) return { id, beat: null };
    try { return { id, beat: JSON.parse(text.replace(/^﻿/, '')) }; } catch { return { id, beat: null, invalid: true }; }
  });
}

export function describeHeartbeat({ id, beat, invalid }) {
  if (invalid) return `${id}: heartbeat unreadable (invalid JSON).`;
  if (!beat) return `${id}: NO HEARTBEAT — scheduled sync not installed or never pushed; its memory is not reaching the brain.`;
  const hours = Math.round((Date.now() - Date.parse(beat.last_run)) / 36e5);
  const stale = !(hours <= MAX_HEARTBEAT_HOURS) ? 'STALE — scheduled sync has stopped. ' : '';
  const failed = beat.failed?.length ? ` FAILED: ${beat.failed.join(', ')}.` : '';
  return `${id}: ${stale}last run ${beat.last_run} (${hours}h ago), pushed ${beat.pushed?.length ?? 0}.${failed}`;
}

// Sources changed since ingest, as each machine's nightly lint saw them (only the machine holding
// a Source can hash it). Returns null when nothing has drifted.
export function describeDrift(beats) {
  const cards = [...new Set(beats.flatMap((b) => b?.source_drift ?? []))].sort();
  if (!cards.length) return null;
  return '═══ Sources CHANGED since ingest — claims citing them may be stale ═══\n' +
    'Before relying on org/ or wiki/ content that cites one of these, check it against the Source ' +
    '(the Source wins — ADR-0006) and tell the user a re-ingest is due:\n' +
    cards.map((c) => `- ${c}`).join('\n');
}

// "2026-07" or "2026-07-15" vs today -> 'OVERDUE' | 'DUE NOW' | 'upcoming'
function classifyDeadline(deadline, todayIso) {
  const todayMonth = todayIso.slice(0, 7);
  if (deadline.length === 7) {
    if (deadline < todayMonth) return 'OVERDUE';
    if (deadline === todayMonth) return 'DUE NOW (this month)';
    return 'upcoming';
  }
  if (deadline < todayIso) return 'OVERDUE';
  if (deadline === todayIso) return 'DUE NOW (today)';
  return 'upcoming';
}

function collectDeadlines(registry, todayIso) {
  const lines = [];
  const scan = (nodeId, nodeName, relationships, isNorthStar) => {
    for (const r of relationships || []) {
      if (!r.deadline) continue;
      const verdict = classifyDeadline(String(r.deadline), todayIso);
      const target = r.first_target ? `${r.target} (first: ${r.first_target})` : r.target;
      const count = r.count ? `${r.count}x ` : '';
      const star = isNorthStar ? ' ★ NORTH STAR' : '';
      lines.push(`[${verdict}]${star} ${nodeId} (${nodeName}): ${r.rel} -> ${count}${target} — deadline ${r.deadline}`);
    }
  };
  for (const [id, e] of Object.entries(registry.entities || {})) scan(id, e.full_name, e.relationships);
  for (const [id, p] of Object.entries(registry.programs || {})) scan(id, p.name, p.relationships);
  // Products carry the north-star deadline (registry v2.1) — scanned before projects so it leads.
  for (const [id, pr] of Object.entries(registry.products || {})) scan(id, pr.name, pr.relationships, pr.north_star);
  for (const [id, p] of Object.entries(registry.projects || {})) scan(id, p.short_name, p.relationships);
  return lines;
}

export function registerWhatsNext(server, repoPath) {
  server.tool(
    'whats_next',
    "Assemble everything needed to answer 'what should I work on / what matters right now' across the whole DHS portfolio: today's date, registry deadlines classified as OVERDUE/DUE NOW/upcoming, the current north-star, every program's live state (including flagged overdue items), recent decisions, and each active project's current status. Call this when the user asks about priorities, next steps, what's overdue, or for a portfolio/status review. You (the assistant) must compare the dates in the content against today's date and surface anything overdue or live now.",
    {
      include_projects: z.boolean().optional()
        .describe(`If true, include the head of each active project's current-state.md (first ${PROJECT_HEAD_LINES} lines). Default: true`),
    },
    async (args) => {
      gitFetchIfStale(repoPath);
      const registry = readFullRegistryFromGit(repoPath) || readFullRegistry(repoPath);
      if (!registry) {
        return { content: [{ type: 'text', text: 'Error: could not read registry.json from git or disk.' }] };
      }

      const todayIso = new Date().toISOString().slice(0, 10);
      const sections = [];

      sections.push(
        `═══ TODAY: ${todayIso} ═══\n` +
        `Compare every date below against today. Flag anything OVERDUE or LIVE NOW first, then ` +
        `derive the highest-leverage next moves through the DHS strategy lens: DH Solutions Ltd ` +
        `serves the SURGEON, not the radiologist. Four Business Pillars — Build (prime), Supply, ` +
        `Service, Facility. The value chain is CT/MRI patient -> Advanced Post-Processing -> ` +
        `DH PACS -> Surgeon -> Patient. Weigh moves by whether they advance the north-star product ` +
        `(marked ★ above) and Line 2 revenue (the Advanced Post-Processing licence). ` +
        `NOTE: the old "trust -> equipment deals" flywheel is SUPERSEDED (2026-08-03) — do not ` +
        `reason with it. Authority for commercial claims is E:\\DHS-PACS, not this repo (ADR-0006).`
      );

      const heartbeats = readHeartbeats(repoPath);
      sections.push(
        '═══ Machine sync health (flag any NO HEARTBEAT / STALE / FAILED line first) ═══\n' +
        (heartbeats.map(describeHeartbeat).join('\n') || '(no machines.json)')
      );
      const drift = describeDrift(heartbeats.map((h) => h.beat));
      if (drift) sections.push(drift);

      const deadlineLines = collectDeadlines(registry, todayIso);
      sections.push(
        '═══ Registry deadlines ═══\n' +
        (deadlineLines.length ? deadlineLines.join('\n') : '(no deadline-bearing relationships in registry)')
      );

      const northStar = gitReadFile(repoPath, 'org/north-star.md');
      sections.push(`═══ org/north-star.md ═══\n${northStar ?? '(not found)'}`);

      for (const [progId, prog] of Object.entries(registry.programs || {})) {
        sections.push(`═══ Program: ${progId} — ${prog.name} (entity: ${prog.entity}, stage: ${prog.stage}) ═══`);
        const progContent = prog.memory ? gitReadFile(repoPath, prog.memory) : null;
        sections.push(progContent ?? '(program memory not found)');
      }

      const adrSummaries = [];
      for (const gitPath of gitListMdPaths(repoPath, 'org/decisions')) {
        if (gitPath.toLowerCase().includes('_template')) continue;
        const content = gitReadFile(repoPath, gitPath);
        if (!content) continue;
        const { meta, body } = parseFrontmatter(content);
        adrSummaries.push({
          id: meta.id || gitPath,
          date: meta.date || '',
          status: meta.status || 'unknown',
          title: extractTitle(body) || meta.id || gitPath,
        });
      }
      adrSummaries.sort((a, b) => b.date.localeCompare(a.date));
      const recent = adrSummaries.slice(0, RECENT_ADR_COUNT)
        .map(a => `${a.id} | ${a.date} | ${a.status} | ${a.title}`);
      sections.push(
        `═══ Recent decisions (use get_decisions for full text) ═══\n` +
        (recent.length ? recent.join('\n') : '(no ADRs found)')
      );

      if (args.include_projects !== false) {
        for (const [projId, p] of Object.entries(registry.projects || {})) {
          if (p.status !== 'active') continue;
          const gitFolder = getProjectGitPath(projId, p.short_name);
          let statusContent = gitReadFile(repoPath, `${gitFolder}/current-state.md`);
          let source = 'current-state.md';
          if (!statusContent) {
            statusContent = gitReadFile(repoPath, `${gitFolder}/MEMORY.md`);
            source = 'MEMORY.md';
          }
          const header = `═══ ${projId} ${p.short_name} (${p.pillar ?? 'no-pillar'}/${p.product ?? 'no-product'}) — ${source}, first ${PROJECT_HEAD_LINES} lines ═══`;
          if (!statusContent) {
            sections.push(`${header}\n(no current-state.md or MEMORY.md found)`);
            continue;
          }
          const lines = statusContent.split('\n');
          const head = lines.slice(0, PROJECT_HEAD_LINES).join('\n');
          const truncated = lines.length > PROJECT_HEAD_LINES
            ? `\n[...truncated — use get_project_memory ${projId} for the rest]`
            : '';
          sections.push(`${header}\n${head}${truncated}`);
        }
      }

      return { content: [{ type: 'text', text: sections.join('\n\n') }] };
    }
  );
}
