import { z } from 'zod';
import {
  gitReadFile, gitListMdPaths, gitFetchIfStale, parseFrontmatter, extractTitle,
  getProjectGitPath, readFullRegistryFromGit, readFullRegistry,
} from '../lib/repo.js';

const RECENT_ADR_COUNT = 5;
const PROJECT_HEAD_LINES = 50;

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
  const scan = (nodeId, nodeName, relationships) => {
    for (const r of relationships || []) {
      if (!r.deadline) continue;
      const verdict = classifyDeadline(String(r.deadline), todayIso);
      const target = r.first_target ? `${r.target} (first: ${r.first_target})` : r.target;
      lines.push(`[${verdict}] ${nodeId} (${nodeName}): ${r.rel} -> ${target} — deadline ${r.deadline}`);
    }
  };
  for (const [id, e] of Object.entries(registry.entities || {})) scan(id, e.full_name, e.relationships);
  for (const [id, p] of Object.entries(registry.programs || {})) scan(id, p.name, p.relationships);
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
        `Compare every date below against today. Flag anything OVERDUE or LIVE NOW first, ` +
        `then derive the highest-leverage next moves through the DHS flywheel lens (trust -> equipment deals).`
      );

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
          const header = `═══ ${projId} ${p.short_name} (${p.niche ?? '?'}/${p.business_unit ?? '?'}) — ${source}, first ${PROJECT_HEAD_LINES} lines ═══`;
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
