# MCP Server — Design and Configuration

## Overview

A local Node.js MCP server that gives any MCP-compatible LLM client (Claude Code, Cursor, Continue) read-only access to all project memories during a session. The LLM calls the tools autonomously based on conversation context — no manual invocation needed.

- **Location in repo:** `mcp-server/`
- **Runtime:** Node.js v24+ (ESM)
- **Transport:** stdio (stdin/stdout JSON-RPC 2.0) — no HTTP, no ports
- **Access pattern:** Read-only. All writes still go through `mimp push`.
- **Built:** 2026-05-29
- **Git objects mode:** 2026-05-30 (reads via `git show` — all projects visible regardless of sparse checkout)
- **Verified cross-machine:** 2026-05-30 (machineB confirmed reading machineA-pushed memories)
- **Brain layer gap (2026-06-02):** the current 3 tools scan only `projects/` and read `data.projects` — they do **NOT** read the new `org/` layer or the v2.0 entity/program/edge fields. So the desktop MCP server cannot yet surface the business overview. Planned step **1e** closes this (below).

## Planned: Brain Tools (Phase 2, step 1e)

Additive, same read-only / git-objects design. The server stays a **context-assembler — it never calls a model** (reasoning stays with the calling LLM).

- `get_business_overview` — `org/business.md` + entity files + registry edges → portfolio snapshot
- `get_entity` — one entity file + its programs + linked projects (e.g. "tell me about BDC")
- `get_decisions` — ADRs from `org/decisions/` filtered by scope / tag / date
- `whats_next` — north-star + recent ADRs + program state + project `current-state.md`, surfacing **overdue / live-now** items

See `brain-layer.md` for the full plan and `brain-architecture-decision.md` for rationale.

## File Structure

```
mcp-server/
├── package.json             ← ESM, @modelcontextprotocol/sdk + zod
├── index.js                 ← Server entry point; reads config; registers tools
├── lib/
│   └── repo.js              ← Shared helpers (config, registry, file reading, link parsing)
└── tools/
    ├── list-projects.js     ← list_projects handler
    ├── get-memory.js        ← get_project_memory handler
    └── search-memory.js     ← search_memories handler
```

## Config Source

The server reads `repo_path` from `~/.mimp-config.json` at startup — the same file the CLI uses. No duplicate configuration is needed.

```json
{ "machine_id": "machineA", "repo_path": "E:\\MIMemoryLLMDb", ... }
```

## Tools Exposed (3)

### `list_projects`

Lists all registered projects with status and MEMORY.md summary.

- Input: optional `status_filter` (active / archived / all, default: active)
- Output: plain text list with ID, short name, full name, status, and first meaningful line of MEMORY.md

### `get_project_memory`

Returns the full memory for one project (MEMORY.md + all referenced files).

- Input: `project` (MIMP-001 or short name like `mimp`), optional `include_referenced_files` (default true)
- Output: each file printed with an `═══ FILENAME ═══` header

### `search_memories`

Case-insensitive keyword search across all (or one) project's markdown files.

- Input: `query` (required), optional `project_filter`
- AND logic for multi-word queries — all words must appear on the same line
- Returns up to 20 matches, each with 2 lines of context above and below
- Output: `── folder/file.md (line N) ──` blocks

## Machine Configuration

### machineA (Windows, machineA)

Registered in `%APPDATA%\Claude\claude_desktop_config.json`:

```json
"mmp-memory": {
  "command": "node",
  "args": ["E:\\MIMemoryLLMDb\\mcp-server\\index.js"]
}
```

Status: **configured and working as of 2026-05-29**

### machineB (Windows Server 2022)

Registered in `%APPDATA%\Claude\claude_desktop_config.json`:

```json
"mmp-memory": {
  "command": "node",
  "args": ["D:\\MIMemoryLLMDb\\mcp-server\\index.js"]
}
```

Status: **configured and working as of 2026-05-30**

Verified: machineB successfully read project memories pushed from machineA on a different project — confirmed cross-machine memory sharing via MCP works end-to-end.

## Implementation Notes

### Git objects mode (2026-05-30)

All file reads were upgraded from disk (`fs.readFileSync`) to git object storage (`git show HEAD:<path>` and `git ls-tree HEAD <path>`). This means the MCP server sees all project memory files regardless of sparse checkout — machineB can query MIMP-001, MIMP-003, MIMP-004 even though only `projects/MIMP-002-mimp/` is checked out on disk.

`git ls-tree` on this git version returns full paths (`projects/MIMP-001-...`), not bare names. The helpers use the output lines as-is rather than prepending `projects/`.

### BOM handling

`registry.json` is written by Windows tools with a UTF-8 BOM (`﻿`). The `readRegistry()` helper strips it before `JSON.parse()`. Without this, startup fails with `Unexpected token '﻿'`.

### Zod v4 required

MCP SDK 1.29.0 requires Zod schemas for tool registration (not plain JSON Schema objects). Zod v4 is installed and used for all three tools.

### No console.log

MCP communicates over stdin/stdout. Any `console.log()` corrupts the JSON-RPC stream. All debug output uses `console.error()` (stderr).

### MEMORY.md parser

Two link formats are handled by the same regex (`/\[[^\]]*\]\(([^)]+\.md)\)/g`):
- Bullet list: `- [file.md](./file.md) — description`  (MIMP-001 style)
- Markdown table: `| [file.md](./file.md) | description |`  (MIMP-002 style)

`MEMORY.md` itself is excluded from the returned list.

## Verify It Works

```
# 1. Confirm it starts cleanly (should produce no stdout output):
node E:\MIMemoryLLMDb\mcp-server\index.js

# 2. In Claude Code, check connected servers:
/mcp
# Should show: mmp-memory • 3 tools

# 3. Test a real call:
# "What projects do I have in my memory system?"
# → LLM calls list_projects

# "Get the full memory for the mimp project"
# → LLM calls get_project_memory with project: "mimp"

# "Have I set up Nginx anywhere?"
# → LLM calls search_memories with query: "Nginx"
```
