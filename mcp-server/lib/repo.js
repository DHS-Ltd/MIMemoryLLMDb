import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, basename, resolve } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';

export function getConfig() {
  const configPath = join(homedir(), '.mimp-config.json');
  try {
    const raw = readFileSync(configPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    throw new Error(`Could not read ~/.mimp-config.json: ${configPath}`);
  }
}

export function readRegistry(repoPath) {
  const registryPath = join(repoPath, 'registry.json');
  try {
    const raw = readFileSync(registryPath, 'utf8').replace(/^﻿/, '');
    const data = JSON.parse(raw);
    return data.projects || {};
  } catch (err) {
    throw new Error(`Could not read registry.json at ${registryPath}: ${err.message}`);
  }
}

// Read registry.json from origin/master — picks up new projects registered on other machines
export function readRegistryFromGit(repoPath) {
  try {
    const raw = (gitReadFile(repoPath, 'registry.json') || '').replace(/^﻿/, '');
    const data = JSON.parse(raw);
    return data.projects || {};
  } catch {
    return null;
  }
}

// Full registry from origin/master — schema v2.0: { entities, programs, projects, ... }.
// Brain tools need entities/programs, not just the projects map.
export function readFullRegistryFromGit(repoPath) {
  try {
    const raw = (gitReadFile(repoPath, 'registry.json') || '').replace(/^﻿/, '');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Local-disk fallback for the full registry (used only if git objects are unreadable)
export function readFullRegistry(repoPath) {
  const registryPath = join(repoPath, 'registry.json');
  try {
    const raw = readFileSync(registryPath, 'utf8').replace(/^﻿/, '');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Parse the YAML frontmatter block of an ADR (org/decisions/*.md).
// Handles only the subset the ADR template uses: scalar values and inline arrays [a, b].
// Returns { meta, body }; meta is {} when no frontmatter block exists.
export function parseFrontmatter(content) {
  const lines = content.split('\n');
  if (lines[0]?.trim() !== '---') return { meta: {}, body: content };

  const meta = {};
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') { end = i; break; }
    const line = lines[i].replace(/#.*$/, ''); // strip trailing comments
    const sep = line.indexOf(':');
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    const rawValue = line.slice(sep + 1).trim();
    if (!key) continue;
    if (!rawValue) { meta[key] = null; continue; }
    if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
      meta[key] = rawValue.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
    } else {
      meta[key] = rawValue;
    }
  }

  if (end === -1) return { meta: {}, body: content };
  return { meta, body: lines.slice(end + 1).join('\n') };
}

// First "# " heading of a markdown body, or null
export function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

// Returns [id, projectEntry] or null
export function resolveProject(projects, query) {
  if (!query) return null;
  const q = query.trim().toUpperCase();

  // Try exact ID match first (MIMP-001)
  if (projects[q]) return [q, projects[q]];

  // Try case-insensitive short_name match
  for (const [id, project] of Object.entries(projects)) {
    if (project.short_name?.toLowerCase() === query.trim().toLowerCase()) {
      return [id, project];
    }
  }

  return null;
}

// Returns the absolute path to the project folder, e.g. projects/MIMP-001-image-converter/
export function getProjectFolder(repoPath, id, shortName) {
  return join(repoPath, 'projects', `${id}-${shortName}`);
}

// Parse markdown links from MEMORY.md — handles both bullet list and table formats.
// Returns unique filenames (excluding MEMORY.md itself).
export function parseMemoryLinks(content) {
  const seen = new Set();
  const results = [];
  // Matches [display](href) where href ends in .md
  const linkRegex = /\[[^\]]*\]\(([^)]+\.md)\)/g;
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const href = match[1];
    // Strip leading ./ or /
    const filename = basename(href.replace(/^\.\//, ''));
    if (filename.toLowerCase() !== 'memory.md' && !seen.has(filename)) {
      seen.add(filename);
      results.push(filename);
    }
  }
  return results;
}

// Returns file content string or null if file does not exist
export function safeReadFile(filePath) {
  try {
    return readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

// Returns all project folder paths that exist under projects/
export function listProjectFolders(repoPath) {
  const projectsDir = join(repoPath, 'projects');
  try {
    return readdirSync(projectsDir, { withFileTypes: true })
      .filter(e => e.isDirectory())
      .map(e => join(projectsDir, e.name));
  } catch {
    return [];
  }
}

// Returns all .md files recursively within a folder
export function listMdFiles(folderPath) {
  try {
    return readdirSync(folderPath, { withFileTypes: true })
      .filter(e => e.isFile() && e.name.endsWith('.md'))
      .map(e => join(folderPath, e.name));
  } catch {
    return [];
  }
}

// Returns git-relative path for a project folder: 'projects/MIMP-004-dh-pacs-marketing'
export function getProjectGitPath(id, shortName) {
  return `projects/${id}-${shortName}`;
}

// Fetch from origin at most once every 60 seconds — keeps reads in sync with remote without
// hitting the network on every individual file read within a single tool call.
let _lastFetchMs = 0;
const FETCH_TTL_MS = 60_000;

export function gitFetchIfStale(repoPath) {
  const now = Date.now();
  if (now - _lastFetchMs < FETCH_TTL_MS) return;
  try {
    execSync('git fetch origin --quiet', {
      cwd: repoPath,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 15_000,
    });
    _lastFetchMs = Date.now();
  } catch {
    // Fetch failure is non-fatal — fall back to whatever is already local
  }
}

// Read a file from git objects via remote tracking branch — always reflects latest GitHub state
export function gitReadFile(repoPath, gitPath) {
  try {
    return execSync(`git show origin/master:${gitPath}`, {
      cwd: repoPath,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch {
    return null;
  }
}

// List all project git paths from remote tracking branch
export function gitListProjectPaths(repoPath) {
  try {
    const out = execSync('git ls-tree --name-only origin/master projects/', {
      cwd: repoPath,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return out.trim().split('\n')
      .filter(n => n && !n.endsWith('.gitkeep'));
  } catch {
    return [];
  }
}

// List .md git paths under a prefix, RECURSIVELY, from the remote tracking branch.
// gitListMdPaths is depth-1 only, which is fine for a project folder but misses org/decisions,
// org/entities and org/programs.
export function gitListMdTree(repoPath, gitPrefix) {
  try {
    const out = execSync(`git ls-tree -r --name-only origin/master ${gitPrefix}/`, {
      cwd: repoPath,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      maxBuffer: 10 * 1024 * 1024,
    });
    return out.trim().split('\n').filter(n => n && n.endsWith('.md'));
  } catch {
    return [];
  }
}

// List .md git paths inside a project folder from remote tracking branch
export function gitListMdPaths(repoPath, gitFolderPath) {
  try {
    const out = execSync(`git ls-tree --name-only origin/master ${gitFolderPath}/`, {
      cwd: repoPath,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return out.trim().split('\n')
      .filter(n => n && n.endsWith('.md'));
  } catch {
    return [];
  }
}
