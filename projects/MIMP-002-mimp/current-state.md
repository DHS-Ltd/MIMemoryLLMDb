# MIMemoryLLMDb — Current State (2026-05-29, updated)

## What Is Built and Working

### CLI Commands (all tested on machineA)

| Command | Status | Notes |
|---------|--------|-------|
| `mimp list` | Working | Shows all registered projects with local status |
| `mimp init` | Working | Registers project, auto-detects claude_memory_paths, updates sparse checkout, commits+pushes |
| `mimp push` | Working | Reads from claude_memory_paths, copies to repo, commits+pushes |
| `mimp pull` | Working | Writes directly into machine's claude_memory_paths location |
| `mimp status` | Working | Shows file counts and timestamps for a project |
| `mimp sync` | Working | Runs pull then push |
| `mimp sparse-status` | Working | Shows which project folders this machine checks out |

### Infrastructure

| Component | Status |
|-----------|--------|
| GitHub repo (DHS-Ltd/MIMemoryLLMDb) | Live |
| machineA config (.mimp-config.json) | Configured |
| machineB config (.mimp-config.json) | Configured |
| PowerShell alias (mimp) in $PROFILE | Working on machineA and machineB |
| Git sparse checkout | Active — each machine only downloads its own projects |
| registry.json | 3 projects registered |
| machines.json | 2 machines registered |
| MCP server (mcp-server/) | Built and registered — machineA |

### Registered Projects

| ID | Short Name | Full Name | machineA | machineB |
|----|-----------|-----------|----------|----------|
| MIMP-001 | image-converter | ImageConverter | E:\Self_project\ImageConverter | — |
| MIMP-002 | mimp | MIMemoryLLMDb | E:\MIMemoryLLMDb | D:\MIMemoryLLMDb |
| MIMP-003 | v1HMS | V1GasBDCHMS | E:\v1-BdcHmsApp | — |

### Documentation

| File | Status |
|------|--------|
| README.md | Complete with doc links |
| SCHEMA.md | Complete — includes machine_id explanation |
| docs/workflow.md | Complete — includes sparse checkout and auto-detect practical examples |
| docs/add-new-machine.md | Complete — 8-step guide with sparse checkout note |
| docs/llm-guide.md | Complete |
| docs/troubleshooting.md | Complete — 9 issues documented |
| docs/roadmap.md | Complete — 15 enhancement ideas, 3 marked Done |
| docs/mcp-server-guide.md | Complete — user manual for MCP server setup and usage |
| docs/MaidulMemoryProject-Implementation-Guide.md | Original spec |
| docs/MaidulMemoryProject-MCP-Server-BuildGuide.md | MCP server build spec |

## Key Features Built (chronological)

| Feature | Built | Notes |
|---------|-------|-------|
| Core CLI (init/push/pull/list/status/sync) | 2026-05-28 | PS5.1 compatible |
| claude_memory_paths support in push/pull | 2026-05-28 | Per-machine, reads/writes Claude Code memory location |
| mimp init auto-detects claude_memory_paths | 2026-05-29 | Encodes local path, scans ~/.claude/projects/, prompts Y/N |
| Git sparse checkout (mimp sparse-status) | 2026-05-29 | Machines only download their own project folders |
| MCP server (mcp-server/) | 2026-05-29 | Read-only; 3 tools: list_projects, get_project_memory, search_memories |

## Verified End-to-End Tests

**2026-05-28 — First push test:**
- `mimp push image-converter` found 6 memory files at claude_memory_paths location
- Committed and pushed to GitHub successfully

**2026-05-28 — Cross-machine setup:**
- machineB cloned repo, configured .mimp-config.json, set up PowerShell alias
- Git auth set up with PAT via Windows Credential Manager
- machineB registry conflict resolved (claude_memory_path singular vs claude_memory_paths plural)

**2026-05-29 — Sparse checkout:**
- `mimp sparse-status` shows correct path list for machineA
- Sync-SparseCheckout runs before every git pull automatically

**2026-05-29 — MCP server built (machineA):**
- `node mcp-server/index.js` starts silently, connects via stdio
- Reads `repo_path` from `~/.mimp-config.json` (no duplicate config needed)
- All 3 tools tested and verified working
- Registered in `%APPDATA%\Claude\claude_desktop_config.json` as `mmp-memory`
- Handles UTF-8 BOM in registry.json (Windows-generated files)
- machineB still needs: `npm install` in `mcp-server/` and Claude config entry

## Pending Work

| Task | Priority | Notes |
|------|----------|-------|
| Test `mimp pull` end-to-end on machineB | High | claude_memory_paths.machineB now configured for MIMP-002 |
| Set up MCP server on machineB | High | Run `npm install` in mcp-server/, add config entry to Claude settings |
| Register remaining projects (dhv, bdc-marketing, hrh, erpnext) | Medium | Need to confirm local paths |
| Build push-log.jsonl event log | Medium | Roadmap item — agreed to build next after sparse checkout |
| Test sparse checkout prune on machineB | Medium | First mimp command on machineB should prune MIMP-001, MIMP-003 |

## Known Limitations

- `mimp push --all` flag does not exist — must push each project individually
- No conflict detection when two machines push without pulling first (Roadmap #10)
- No encryption for sensitive memory content (Roadmap #13)
- push-log.jsonl not yet built — no cross-machine audit trail yet

## Recent Git Commits

```
feat: git sparse checkout — machines only download their own projects
feat: mimp init auto-detects claude_memory_paths (roadmap #9)
docs: document claude_memory_paths fix, per-machine path instructions
fix: per-machine claude_memory_paths + pull writes to Claude Code memory location
docs: add cross-machine sync practical example for MIMP-001
init: MIMP-002 self-registration + full documentation suite
push: MIMP-001 from machineA (2026-05-28 19:21)
feat: support claude_memory_path in push command
```
