# MCP Server — Git Objects Build Guide

> **Purpose:** Modify the `mmp-memory` MCP server so it reads project memory files from git object
> storage instead of local disk. This makes all projects visible regardless of sparse checkout rules.
>
> **Who runs this:** machineA (E:\MIMemoryLLMDb)
> **Who tests this:** machineB (D:\MIMemoryLLMDb)
> **Rule:** Do not implement anything beyond what is described here.

---

## Background

The MCP server currently reads files from local disk (`projects/MIMP-XXX-name/`). On machines
using sparse checkout, only their own project folders are checked out — so MIMP-004 and others
are invisible to the server.

**Fix:** Replace all disk reads with `git show HEAD:<path>` and `git ls-tree HEAD <path>`.
These read directly from git object storage, which is always fully populated regardless of
sparse checkout.

---

## Files to Change

```
mcp-server/lib/repo.js              ← add 4 new exported functions + 1 new import
mcp-server/tools/list-projects.js   ← swap disk reads for git reads
mcp-server/tools/get-memory.js      ← swap disk reads for git reads
mcp-server/tools/search-memory.js   ← swap disk reads for git reads
```

Do not touch: `registry.json`, `tools/mimp.ps1`, `machines.json`, `package.json`, `index.js`.

---

## Change 1 — `mcp-server/lib/repo.js`

### Step 1a — Add `execSync` to the import at the top

```js
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, basename, resolve } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';
```

### Step 1b — Append these 4 functions at the end of the file

Do not remove any existing functions — they are still used for reading `registry.json` which
is always on disk.

```js
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
    return out.trim().split('\n')
      .filter(n => n && n !== '.gitkeep')
      .map(n => `projects/${n}`);
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
    return out.trim().split('\n')
      .filter(n => n && n.endsWith('.md'))
      .map(n => `${gitFolderPath}/${n}`);
  } catch {
    return [];
  }
}
```

---

## Change 2 — `mcp-server/tools/list-projects.js`

Replace the entire file content with:

```js
import { z } from 'zod';
import { getProjectGitPath, gitReadFile } from '../lib/repo.js';

export function registerListProjects(server, repoPath, projects) {
  server.tool(
    'list_projects',
    "List all registered projects in the MIMemoryLLMDb memory system. Returns project IDs, names, and brief summaries. Call this when you need to know what projects exist, or when the user mentions a project you don't have context for.",
    {
      status_filter: z.enum(['active', 'archived', 'all'])
        .optional()
        .describe('Filter by project status. Default: active'),
    },
    async (args) => {
      const filter = args.status_filter || 'active';

      const entries = Object.entries(projects).filter(([, p]) => {
        if (filter === 'all') return true;
        return p.status === filter;
      });

      if (entries.length === 0) {
        return { content: [{ type: 'text', text: `No projects found with status: ${filter}` }] };
      }

      const lines = [];
      for (const [id, project] of entries) {
        lines.push(`${id} | ${project.short_name} | ${project.full_name} | ${project.status}`);

        const gitPath = getProjectGitPath(id, project.short_name);
        const memoryContent = gitReadFile(repoPath, `${gitPath}/MEMORY.md`);
        if (memoryContent) {
          const summary = extractSummary(memoryContent);
          lines.push(`  Summary: ${summary}`);
        } else {
          lines.push(`  Summary: (no MEMORY.md found)`);
        }
        lines.push('');
      }

      return { content: [{ type: 'text', text: lines.join('\n').trimEnd() }] };
    }
  );
}

function extractSummary(content) {
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('#')) continue;
    if (trimmed.startsWith('|')) {
      const cell = trimmed.replace(/^\|\s*/, '').split('|')[0].trim();
      if (cell && cell !== '---' && !cell.startsWith('File')) return cell.slice(0, 120);
      continue;
    }
    if (trimmed.startsWith('- ')) {
      return trimmed.slice(2).replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').slice(0, 120);
    }
    return trimmed.slice(0, 120);
  }
  return '(empty)';
}
```

---

## Change 3 — `mcp-server/tools/get-memory.js`

Replace the entire file content with:

```js
import { z } from 'zod';
import { resolveProject, getProjectGitPath, parseMemoryLinks, gitReadFile } from '../lib/repo.js';

export function registerGetMemory(server, repoPath, projects) {
  server.tool(
    'get_project_memory',
    "Retrieve the full memory context for a specific project, including its MEMORY.md index and all referenced detail files. Call this when working on a specific project and you need its architecture decisions, configs, or historical context. Accepts project ID (MIMP-001) or short name (mimp).",
    {
      project: z.string().describe('Project ID (MIMP-001) or short name (e.g. mimp, v1HMS)'),
      include_referenced_files: z.boolean().optional()
        .describe('If true, also return content of files referenced in MEMORY.md. Default: true'),
    },
    async (args) => {
      const result = resolveProject(projects, args.project);
      if (!result) {
        return {
          content: [{
            type: 'text',
            text: `Error: Project '${args.project}' not found in registry. Use list_projects to see available projects.`,
          }],
        };
      }

      const [id, project] = result;
      const gitFolder = getProjectGitPath(id, project.short_name);
      const memoryGitPath = `${gitFolder}/MEMORY.md`;
      const memoryContent = gitReadFile(repoPath, memoryGitPath);

      if (!memoryContent) {
        return {
          content: [{
            type: 'text',
            text: `Error: MEMORY.md not found for project ${id} at ${memoryGitPath}`,
          }],
        };
      }

      const sections = [];
      sections.push(`═══ MEMORY.md ═══\n${memoryContent}`);

      const includeReferenced = args.include_referenced_files !== false;
      if (includeReferenced) {
        const referencedFiles = parseMemoryLinks(memoryContent);
        for (const filename of referencedFiles) {
          const fileGitPath = `${gitFolder}/${filename}`;
          const fileContent = gitReadFile(repoPath, fileGitPath);
          if (fileContent) {
            sections.push(`═══ ${filename} ═══\n${fileContent}`);
          } else {
            sections.push(`═══ ${filename} ═══\n(file not found)`);
          }
        }
      }

      return { content: [{ type: 'text', text: sections.join('\n\n') }] };
    }
  );
}
```

---

## Change 4 — `mcp-server/tools/search-memory.js`

Replace the entire file content with:

```js
import { z } from 'zod';
import { resolveProject, getProjectGitPath, gitReadFile, gitListProjectPaths, gitListMdPaths } from '../lib/repo.js';

const MAX_MATCHES = 20;

export function registerSearchMemory(server, repoPath, projects) {
  server.tool(
    'search_memories',
    "Search across all project memories for keywords or topics. Returns matching lines with surrounding context from any project. Call this when the user's question might be answered by knowledge from another project, or when looking for cross-project patterns like shared configs, similar setups, or reusable solutions.",
    {
      query: z.string().describe('Search query — keywords to find across all project memories'),
      project_filter: z.string().optional()
        .describe('Optional: limit search to a specific project ID or short name'),
    },
    async (args) => {
      const { query, project_filter } = args;
      if (!query || !query.trim()) {
        return { content: [{ type: 'text', text: 'Error: query is required' }] };
      }

      const words = query.trim().toLowerCase().split(/\s+/);

      let foldersToSearch;
      if (project_filter) {
        const result = resolveProject(projects, project_filter);
        if (!result) {
          return {
            content: [{
              type: 'text',
              text: `Error: Project '${project_filter}' not found in registry. Use list_projects to see available projects.`,
            }],
          };
        }
        const [id, project] = result;
        foldersToSearch = [getProjectGitPath(id, project.short_name)];
      } else {
        foldersToSearch = gitListProjectPaths(repoPath);
      }

      const matches = [];

      outer:
      for (const folder of foldersToSearch) {
        const mdPaths = gitListMdPaths(repoPath, folder);
        for (const gitPath of mdPaths) {
          const content = gitReadFile(repoPath, gitPath);
          if (!content) continue;

          const lines = content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            const lineLower = lines[i].toLowerCase();
            if (words.every(w => lineLower.includes(w))) {
              const start = Math.max(0, i - 2);
              const end = Math.min(lines.length - 1, i + 2);
              const contextLines = lines.slice(start, end + 1);
              const relPath = gitPath.replace(/^projects\//, '');
              matches.push({ relPath, lineNum: i + 1, context: contextLines.join('\n') });
              if (matches.length >= MAX_MATCHES) break outer;
            }
          }
        }
      }

      if (matches.length === 0) {
        return { content: [{ type: 'text', text: `No matches found for "${query}"` }] };
      }

      const output = [`Found ${matches.length} match${matches.length === 1 ? '' : 'es'} for "${query}":\n`];
      for (const m of matches) {
        output.push(`── ${m.relPath} (line ${m.lineNum}) ──`);
        output.push(m.context);
        output.push('');
      }

      return { content: [{ type: 'text', text: output.join('\n').trimEnd() }] };
    }
  );
}
```

---

## Smoke Test (run on machineA before committing)

```powershell
cd E:\MIMemoryLLMDb\mcp-server
node --input-type=module --eval "
import { gitReadFile, gitListProjectPaths, gitListMdPaths } from './lib/repo.js';
const repo = 'E:\\\\MIMemoryLLMDb';
console.log('Projects:', gitListProjectPaths(repo));
console.log('MIMP-004 files:', gitListMdPaths(repo, 'projects/MIMP-004-dh-pacs-marketing'));
const mem = gitReadFile(repo, 'projects/MIMP-004-dh-pacs-marketing/MEMORY.md');
console.log('MEMORY.md:', mem ? 'OK (' + mem.length + ' chars)' : 'FAILED');
"
```

Expected output:
- Projects: all 4 MIMP folders listed
- MIMP-004 files: at least MEMORY.md listed
- MEMORY.md: OK (N chars)

If any line shows FAILED, do not commit — diagnose first.

---

## Commit and Push (machineA)

```powershell
cd E:\MIMemoryLLMDb
git add mcp-server/lib/repo.js mcp-server/tools/list-projects.js mcp-server/tools/get-memory.js mcp-server/tools/search-memory.js
git commit -m "feat: mcp-server reads from git objects — works with sparse checkout"
git push
```

---

## Steps on machineB After Push

1. `cd D:\MIMemoryLLMDb` then `git pull`
2. Confirm sparse checkout is still intact — only `projects/MIMP-002-mimp/` on disk (correct)
3. Restart Claude Code session (required to reload the MCP server process)
4. Run `claude mcp list` — confirm `mmp-memory: ✓ Connected`
5. Test query: _"Get the full memory for dh-pacs-marketing"_
6. Test search: _"Search my memories for digital partner"_

If the MCP server fails to connect after restart, check the Node.js error with:

```powershell
node D:\MIMemoryLLMDb\mcp-server\index.js
```

Any startup error will print to the terminal.

---

## Implementation Record (machineA — 2026-05-30)

### What Was Implemented

All 4 changes applied exactly as specified:

| File | Change |
|------|--------|
| `mcp-server/lib/repo.js` | Added `execSync` import; appended `getProjectGitPath`, `gitReadFile`, `gitListProjectPaths`, `gitListMdPaths` |
| `mcp-server/tools/list-projects.js` | Full replacement — now uses `gitReadFile` for MEMORY.md reads |
| `mcp-server/tools/get-memory.js` | Full replacement — now uses `gitReadFile` for all file reads |
| `mcp-server/tools/search-memory.js` | Full replacement — now uses `gitListProjectPaths`, `gitListMdPaths`, `gitReadFile` |

### Path Format Fix

`git ls-tree --name-only HEAD projects/` returns full paths on this git version (e.g., `projects/MIMP-001-image-converter`), not bare names. The spec assumed bare names and would have double-prefixed them with `projects/`. Fixed in both `gitListProjectPaths` and `gitListMdPaths` to use the returned lines as-is.

### Smoke Test Results (machineA, PowerShell, 2026-05-30)

```
Projects: projects/MIMP-001-image-converter, projects/MIMP-002-mimp,
          projects/MIMP-003-v1HMS, projects/MIMP-004-dh-pacs-marketing

MIMP-004 files: projects/MIMP-004-dh-pacs-marketing/MEMORY.md,
                projects/MIMP-004-dh-pacs-marketing/project-dh-pacs-hipaa.md,
                projects/MIMP-004-dh-pacs-marketing/project-dh-pacs-market-strategy.md,
                projects/MIMP-004-dh-pacs-marketing/project-dh-pacs-pricing.md,
                projects/MIMP-004-dh-pacs-marketing/project-dh-pacs-product.md,
                projects/MIMP-004-dh-pacs-marketing/project-dh-pacs-website-decisions.md

MEMORY.md: OK (1000 chars)
```

All 3 smoke test criteria from the spec passed:
- Projects: all 4 MIMP folders listed ✓
- MIMP-004 files: MEMORY.md listed (plus 5 referenced files) ✓
- MEMORY.md: OK (1000 chars) ✓

Server also confirmed to start silently (no stdout output).

### Not Yet Tested

- machineB sparse checkout scenario (MIMP-004 absent from disk, visible via git objects) — pending machineB pull and Claude restart per the spec's "Steps on machineB After Push" section
