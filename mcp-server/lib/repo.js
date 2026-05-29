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

// Read a file from git objects — works even when sparse checkout excludes it from disk
export function gitReadFile(repoPath, gitPath) {
  try {
    return execSync(`git show HEAD:${gitPath}`, {
      cwd: repoPath,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch {
    return null;
  }
}

// List all project git paths from git objects: ['projects/MIMP-001-...', 'projects/MIMP-004-...']
export function gitListProjectPaths(repoPath) {
  try {
    const out = execSync('git ls-tree --name-only HEAD projects/', {
      cwd: repoPath,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    // git ls-tree returns full paths like 'projects/MIMP-001-...' — use them as-is
    return out.trim().split('\n')
      .filter(n => n && !n.endsWith('.gitkeep'));
  } catch {
    return [];
  }
}

// List .md git paths inside a project folder: ['projects/MIMP-004-.../MEMORY.md', ...]
export function gitListMdPaths(repoPath, gitFolderPath) {
  try {
    const out = execSync(`git ls-tree --name-only HEAD ${gitFolderPath}/`, {
      cwd: repoPath,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    // git ls-tree returns full paths like 'projects/MIMP-004-.../MEMORY.md' — use them as-is
    return out.trim().split('\n')
      .filter(n => n && n.endsWith('.md'));
  } catch {
    return [];
  }
}
