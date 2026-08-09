/**
 * Mechanical lint for the DHS brain — Phase 2.1.
 *
 * Deterministic, no model, no tokens. Reports; never fixes. The semantic half
 * (contradictions, staleness of meaning, missing concept pages) is a prompt, not this.
 *
 * Run:  node tools/lint.mjs  [--json]  [--quiet]
 *       mimp lint
 *
 * Exit 1 if any ERROR, so it can gate a push.
 *
 * Scope note: link and citation checks read the working tree, so sparse-excluded project folders
 * are invisible to them. The superseded-claim check reads origin/master via git objects and
 * therefore covers the whole repo — that is deliberate, because a stale commercial claim in
 * another machine's folder is still served by search_memories.
 *
 * Severity: defects in the brain's own layers (org/, wiki/, root files) are ERROR. The same defect
 * in imported project memory is WARN, because it usually means a sibling memory exists on another
 * machine and has not been pushed rather than that the link is wrong.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, relative, basename, extname, dirname, resolve } from 'path';
import { createHash } from 'crypto';
import { homedir } from 'os';
import { execSync } from 'child_process';

const REPO = resolve(import.meta.dirname, '..');
const TODAY = new Date().toISOString().slice(0, 10);
const SKIP_DIRS = new Set(['.git', 'node_modules', '.obsidian', 'target']);

const findings = [];
const add = (severity, check, file, message) =>
  findings.push({ severity, check, file, message });

// ── file walking ───────────────────────────────────────────────────────────
function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walk(join(dir, e.name), out);
    } else if (e.name.endsWith('.md')) {
      out.push(join(dir, e.name));
    }
  }
  return out;
}

const allMd = walk(REPO);
const rel = (p) => relative(REPO, p).replace(/\\/g, '/');
const read = (p) => { try { return readFileSync(p, 'utf8').replace(/^\ufeff/, ''); } catch { return null; } };

// ── frontmatter (scalars + inline arrays only, matching mcp-server/lib/repo.js) ──
function frontmatter(text) {
  const lines = text.split('\n');
  if (lines[0]?.trim() !== '---') return {};
  const meta = {};
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') break;
    const sep = lines[i].indexOf(':');
    if (sep === -1) continue;
    const key = lines[i].slice(0, sep).trim();
    let value = lines[i].slice(sep + 1).trim();
    if (!key) continue;
    if (value.startsWith('[') && value.endsWith(']')) {
      meta[key] = value.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else {
      meta[key] = value.replace(/^["']|["']$/g, '');
    }
  }
  return meta;
}

// ── resolvable link targets: filename stems + frontmatter aliases ───────────
const targets = new Map();          // name -> [files]
for (const file of allMd) {
  const stem = basename(file, '.md');
  if (!targets.has(stem)) targets.set(stem, []);
  targets.get(stem).push(file);

  const meta = frontmatter(read(file) ?? '');
  for (const alias of [].concat(meta.aliases ?? [])) {
    if (!targets.has(alias)) targets.set(alias, []);
    targets.get(alias).push(file);
  }
}

/**
 * Blank out regions where markdown is being *shown*, not *used*: fenced code blocks,
 * inline code spans, and template blocks. Without this the linter flags its own
 * documentation — SCHEMA.md's MEMORY.md template and the `[[wikilink]]` in its own rule 7.
 * Newlines are preserved so nothing else shifts.
 */
function stripIllustrative(text) {
  const blank = (m) => m.replace(/[^\n]/g, ' ');
  return text
    .replace(/```[\s\S]*?```/g, blank)
    .replace(/^---begin template---[\s\S]*?^---end template---/gm, blank)
    .replace(/`[^`\n]*`/g, blank);
}

// ── 1. broken wikilinks ────────────────────────────────────────────────────
// ── 2. broken relative markdown links ──────────────────────────────────────
const linkedTo = new Set();
for (const file of allMd) {
  const raw = read(file);
  if (!raw) continue;
  const text = stripIllustrative(raw);

  // The brain's own layers must be link-clean (ERROR). Imported project memory may legitimately
  // reference a sibling memory another machine has not pushed yet, so that is a WARN.
  const severity = /^(org|wiki)\//.test(rel(file)) || /^[^/]+\.md$/.test(rel(file)) ? 'ERROR' : 'WARN';

  for (const m of text.matchAll(/\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]/g)) {
    const name = m[1].trim();
    if (!name || name.includes('^')) continue;
    if (targets.has(name)) {
      for (const t of targets.get(name)) linkedTo.add(t);
    } else {
      add(severity, 'broken-wikilink', rel(file),
        `[[${name}]] matches no filename or frontmatter alias${severity === 'WARN' ? ' — likely memory another machine has not pushed' : ' — renders as a phantom node'}`);
    }
  }

  // A project's CLAUDE.md is a *copy* of that repo's own file, so its relative links point into
  // the source repo, not into this one. Checking them here reports the copy, not a defect.
  const isCopiedClaudeMd = /^projects\/[^/]+\/CLAUDE\.md$/.test(rel(file));

  for (const m of text.matchAll(/\[[^\]]*\]\(([^)\s]+\.md)(?:#[^)]*)?\)/g)) {
    const href = m[1];
    if (/^(https?:|file:|mailto:)/i.test(href)) continue;
    const abs = resolve(dirname(file), decodeURIComponent(href));
    if (existsSync(abs)) linkedTo.add(abs);
    else if (!isCopiedClaudeMd) add(severity, 'broken-link', rel(file), `[…](${href}) does not resolve`);
  }
}

// ── 3/4/5. Source cards: drift, missing origin, fed nothing ────────────────
const CARDS = join(REPO, 'raw', '_cards');
const cardFiles = existsSync(CARDS) ? readdirSync(CARDS).filter(f => f.endsWith('.md')) : [];
for (const name of cardFiles) {
  const path = join(CARDS, name);
  const text = read(path);
  if (!text) continue;
  const meta = frontmatter(text);

  if (!meta.origin || !meta.sha256) {
    add('ERROR', 'card-malformed', rel(path), 'missing origin or sha256 — cannot be drift-checked');
    continue;
  }
  if (!existsSync(meta.origin)) {
    add('WARN', 'source-missing', rel(path),
      `Source no longer at ${meta.origin} — moved, renamed, or on another machine`);
    continue;
  }
  const current = createHash('sha256').update(readFileSync(meta.origin)).digest('hex');
  if (current !== meta.sha256) {
    add('ERROR', 'source-drift', rel(path),
      `Source CHANGED since ingest (${meta.sha256.slice(0, 12)}… → ${current.slice(0, 12)}…) — re-ingest, claims may be stale`);
  }
  if (meta.status === 'ingested' && /^- _\(none yet\)_/m.test(text)) {
    add('WARN', 'card-fed-nothing', rel(path), 'marked ingested but fed no page — read but never used');
  }
  if (meta.status === 'ingested' && !/^## Abstract\s*\n\s*\n\s*\S/m.test(text)) {
    add('ERROR', 'card-no-abstract', rel(path), 'marked ingested but has no abstract');
  }
}

// ── 6. Sourced pages with no citation ──────────────────────────────────────
// wiki/ and org/ are Sourced (ADR-0006). Exceptions are first-party by design.
const FIRST_PARTY = /^(org\/decisions\/|wiki\/RULES\.md|wiki\/INDEX\.md)/;
for (const file of allMd) {
  const r = rel(file);
  if (!/^(wiki|org)\//.test(r) || FIRST_PARTY.test(r)) continue;
  const text = read(file) ?? '';
  const cited = /raw\/_cards|^##+ Sources?\b|\bS\d+\b|E:\\DHS-PACS|E:\\DH-Advanced-Viewer/m.test(text);
  if (!cited) {
    add('ERROR', 'uncited-page', r,
      'Sourced page with no Source citation — every claim in wiki/ and org/ must trace to a Source (ADR-0006)');
  }
}

// ── 7. orphan wiki pages ───────────────────────────────────────────────────
for (const file of allMd) {
  const r = rel(file);
  if (!/^wiki\//.test(r) || /^wiki\/(INDEX|RULES)\.md$/.test(r)) continue;
  if (!linkedTo.has(file)) {
    add('WARN', 'orphan-page', r, 'nothing links to this page — unreachable from INDEX.md');
  }
}

// ── 8. registry deadlines + dead local paths ───────────────────────────────
let registry = null;
try {
  registry = JSON.parse(readFileSync(join(REPO, 'registry.json'), 'utf8').replace(/^\ufeff/, ''));
} catch (err) {
  add('ERROR', 'registry-unreadable', 'registry.json', err.message);
}

let machineId = null;
try {
  machineId = JSON.parse(readFileSync(join(homedir(), '.mimp-config.json'), 'utf8')).machine_id;
} catch { /* not fatal — path checks are skipped */ }

if (registry) {
  const scanDeadlines = (kind, id, name, rels, star) => {
    for (const r of rels ?? []) {
      if (!r.deadline) continue;
      const d = String(r.deadline);
      const cmp = d.length === 7 ? TODAY.slice(0, 7) : TODAY;
      if (d < cmp) {
        add('ERROR', 'deadline-passed', 'registry.json',
          `${star ? '★ NORTH STAR ' : ''}${kind} ${id} (${name}): ${r.rel} → ${r.target} — deadline ${d} PASSED`);
      }
    }
  };
  for (const [id, e] of Object.entries(registry.entities ?? {})) scanDeadlines('entity', id, e.full_name, e.relationships);
  for (const [id, p] of Object.entries(registry.programs ?? {})) scanDeadlines('program', id, p.name, p.relationships);
  for (const [id, p] of Object.entries(registry.products ?? {})) scanDeadlines('product', id, p.name, p.relationships, p.north_star);
  for (const [id, p] of Object.entries(registry.projects ?? {})) scanDeadlines('project', id, p.short_name, p.relationships);

  if (machineId) {
    for (const [id, p] of Object.entries(registry.projects ?? {})) {
      const local = p.local_paths?.[machineId];
      if (local && !existsSync(local)) {
        add('ERROR', 'dead-path', 'registry.json',
          `${id} (${p.short_name}) local_paths.${machineId} = ${local} — does not exist; mimp push would find nothing`);
      }
      const mem = p.claude_memory_paths?.[machineId];
      if (mem && existsSync(mem)) {
        const inMemory = readdirSync(mem).filter(f => f.endsWith('.md')).length;
        const folder = join(REPO, 'projects', `${id}-${p.short_name}`);
        const inRepo = existsSync(folder) ? readdirSync(folder).filter(f => f.endsWith('.md')).length : 0;
        if (inMemory > inRepo) {
          add('WARN', 'unpushed-memory', 'registry.json',
            `${id} (${p.short_name}): ${inMemory} md files in Claude memory vs ${inRepo} in the repo — unpushed work`);
        }
      }
    }
  }
}

// ── 9. superseded claims, including in files this machine cannot see ───────
// Sparse checkout hides other machines' project folders, so a stale claim can sit in the repo,
// be served by search_memories, and never appear to a disk-based linter. MIMP-006's copy of the
// pre-2026-08-03 strategy was found by hand; this check is so the next one is not.
const BANNED = [
  [/master proof point/i, "'master proof point' is a banned term — use tier-matched proof"],
  [/patient data ownership/i, "'patient data ownership' as the category is superseded by the Advanced Connected Imaging Network"],
  [/complete owner of their/i, "the patient-ownership category claim is superseded; ownership is now the mechanism"],
  [/three-layer sales chain/i, 'the three-layer chain is Enterprise-tier only; Standard runs Owner → light IT → counter staff'],
  [/Radiologists\s*\/\s*Surgeons/i, 'radiologist and surgeon have opposite roles and must never be one sales layer'],
  [/teleradiology platform/i, "'never teleradiology' is a standing brand hard line"],
];
// A file that is *documenting* a retired term is not asserting it. Case-insensitive and
// deliberately broad: a genuinely stale file will not describe its own claim as superseded.
const DISCUSSES = /superseded|banned|retired|_avoid_|demoted|no longer the headline|replaced by/i;

let gitMdPaths = [];
try {
  gitMdPaths = execSync('git ls-tree -r --name-only origin/master', { cwd: REPO, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })
    .trim().split('\n').filter(p => p.endsWith('.md'));
} catch {
  add('WARN', 'git-unreadable', 'origin/master', 'could not list origin/master — sparse-hidden files were not checked');
}

let hidden = 0;
for (const gitPath of gitMdPaths) {
  const onDisk = existsSync(join(REPO, gitPath));
  let text;
  if (onDisk) {
    text = read(join(REPO, gitPath));
  } else {
    hidden++;
    try {
      text = execSync(`git show origin/master:${gitPath}`, { cwd: REPO, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    } catch { continue; }
  }
  if (!text || DISCUSSES.test(text)) continue;

  for (const [pattern, why] of BANNED) {
    if (pattern.test(text)) {
      add('ERROR', 'superseded-claim', gitPath,
        `${why}${onDisk ? '' : ' [sparse-hidden on this machine — read from git objects]'}`);
    }
  }
}
if (hidden) add('INFO', 'sparse-hidden', 'origin/master', `${hidden} markdown file(s) exist in the repo but are not checked out here; they were still scanned`);

// ── 10. review horizons ────────────────────────────────────────────────────
for (const file of allMd) {
  const text = read(file);
  if (!text) continue;
  for (const m of text.matchAll(/[Rr]eview by (\d{4}-\d{2}-\d{2})/g)) {
    if (m[1] < TODAY) {
      add('WARN', 'review-overdue', rel(file), `review was due ${m[1]}`);
    }
  }
}

// ── report ─────────────────────────────────────────────────────────────────
const ORDER = { ERROR: 0, WARN: 1, INFO: 2 };
findings.sort((a, b) => ORDER[a.severity] - ORDER[b.severity] || a.check.localeCompare(b.check));

const errors = findings.filter(f => f.severity === 'ERROR').length;
const warns = findings.filter(f => f.severity === 'WARN').length;

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ today: TODAY, scanned: allMd.length, cards: cardFiles.length, errors, warns, findings }, null, 2));
} else {
  const quiet = process.argv.includes('--quiet');
  console.log(`\nBrain lint — ${TODAY}`);
  console.log(`  scanned ${allMd.length} markdown files, ${cardFiles.length} Source cards\n`);
  if (!findings.length) {
    console.log('  clean — no mechanical defects\n');
  } else {
    let lastCheck = null;
    for (const f of findings) {
      if (quiet && f.severity !== 'ERROR') continue;
      if (f.check !== lastCheck) { console.log(`  [${f.check}]`); lastCheck = f.check; }
      console.log(`    ${f.severity.padEnd(5)} ${f.file}`);
      console.log(`          ${f.message}`);
    }
    console.log(`\n  ${errors} error(s), ${warns} warning(s)\n`);
  }
}

process.exit(errors > 0 ? 1 : 0);
