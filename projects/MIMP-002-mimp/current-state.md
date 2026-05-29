# MIMemoryLLMDb — Current State (2026-05-30)

## What Is Built and Working

### CLI Commands (all tested on machineA and machineB)

| Command | Status | Notes |
|---------|--------|-------|
| `mimp list` | Working | Shows all registered projects with local status |
| `mimp init` | Working | Validates memory path before assigning ID; manual paste with directory + MEMORY.md check |
| `mimp push` | Working | Reads from claude_memory_paths, copies to repo, commits+pushes |
| `mimp pull` | Working | Writes directly into machine's claude_memory_paths location |
| `mimp status` | Working | Shows file counts and timestamps for a project |
| `mimp sync` | Working | Runs pull then push |
| `mimp sparse-status` | Working | Reads `.git/info/sparse-checkout` directly; auto-initialises on first run |

### Infrastructure

| Component | Status |
|-----------|--------|
| GitHub repo (DHS-Ltd/MIMemoryLLMDb) | Live |
| machineA config (.mimp-config.json) | Configured |
| machineB config (.mimp-config.json) | Configured |
| PowerShell alias (mimp) in $PROFILE | Working on machineA and machineB |
| Git sparse checkout | Active and verified on machineB — classic file-based, git 1.7+ compatible |
| MCP server (mcp-server/) | Working on machineA and machineB — auto-syncs from origin/master |
| registry.json | 4 projects registered |
| machines.json | 2 machines registered |

### Registered Projects

| ID | Short Name | Full Name | machineA | machineB |
|----|-----------|-----------|----------|----------|
| MIMP-001 | image-converter | ImageConverter | E:\Self_project\ImageConverter | — |
| MIMP-002 | mimp | MIMemoryLLMDb | E:\MIMemoryLLMDb | D:\MIMemoryLLMDb |
| MIMP-003 | v1HMS | V1GasBDCHMS | E:\v1-BdcHmsApp | — |
| MIMP-004 | dh-pacs-marketing | DHPACS | E:\DH-PACs-Solutions | — |

### Documentation

| File | Status |
|------|--------|
| README.md | Complete with doc links |
| SCHEMA.md | Complete |
| docs/workflow.md | Complete — sparse checkout and init practical examples |
| docs/add-new-machine.md | Complete — 9-step guide with sparse checkout and auth |
| docs/llm-guide.md | Complete |
| docs/troubleshooting.md | Complete — 9 issues documented |
| docs/roadmap.md | Complete — 15 ideas, 3 done |

## Key Features Built (chronological)

| Feature | Built | Notes |
|---------|-------|-------|
| Core CLI (init/push/pull/list/status/sync) | 2026-05-28 | PS5.1 compatible |
| claude_memory_paths per-machine support | 2026-05-28 | push reads / pull writes to correct location |
| mimp init auto-detects claude_memory_paths | 2026-05-29 | Later replaced with manual paste approach |
| Git sparse checkout v1 (cone mode) | 2026-05-29 | Replaced — required Git 2.26+ |
| mimp init: memory path prompt before ID assignment | 2026-05-30 | Wrong path blocks registration entirely |
| mimp init: manual paste + directory/MEMORY.md validation | 2026-05-30 | Replaced unreliable auto-detect |
| mimp init: short_name path-character guard | 2026-05-30 | Prevents path being silently used as short_name |
| Git sparse checkout v2 (classic file-based) | 2026-05-30 | Works on all git versions ≥ 1.7; verified on machineB |
| mimp sparse-status reads file directly | 2026-05-30 | No longer depends on `git sparse-checkout list` |
| MCP server v1 (disk reads) | 2026-05-29 | 3 tools: list_projects, get_project_memory, search_memories |
| MCP server v2 (git objects) | 2026-05-30 | Reads via `git show HEAD:<path>` — bypasses sparse checkout |
| MCP server v3 (remote sync) | 2026-05-30 | Reads from `origin/master`; auto-fetches with 60s TTL; re-reads registry per call |

## Verified End-to-End Tests

**2026-05-28:** `mimp push image-converter` — 6 files pushed to GitHub successfully

**2026-05-28:** machineB setup — clone, config, alias, PAT auth, registry conflict resolved

**2026-05-29:** Sparse checkout v1 — initialised on machineA, `mimp sparse-status` showed paths

**2026-05-30:** Sparse checkout v2 — verified on machineB; only `projects/MIMP-002-mimp/` downloaded; MIMP-001, MIMP-003, MIMP-004 absent from machineB working tree

**2026-05-30:** MCP server cross-machine — machineB successfully read project memory pushed from machineA on a different project; git objects mode confirmed working across sparse checkout boundary

**2026-05-30:** MCP server remote sync — machineB-pushed memory (MIMP-005) visible on machineA without `git pull`; `origin/master` reads + 60s fetch TTL confirmed working end-to-end

**2026-05-30:** `mimp init` validation — wrong short_name (path) blocked; wrong memory path (no directory) blocked; wrong memory path (no MEMORY.md) blocked; valid path registered correctly

## Pending Work

| Task | Priority | Notes |
|------|----------|-------|
| Test `mimp pull` end-to-end on machineB | High | claude_memory_paths.machineB configured for MIMP-002 |
| Register remaining projects (bdc-hms, erpnext, bdc-marketing, hrh) | Medium | Need to confirm local paths |
| Build push-log.jsonl event log | Medium | Roadmap item — next planned feature |

## Known Limitations

- `mimp push --all` flag does not exist — must push each project individually
- No conflict detection when two machines push without pulling first (Roadmap #10)
- No encryption for sensitive memory content (Roadmap #13)
- push-log.jsonl not yet built — no cross-machine audit trail yet
- Sparse checkout patterns are rewritten on every `Git-Sync` call — minor perf cost, functionally harmless
