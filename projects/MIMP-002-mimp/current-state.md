# MIMemoryLLMDb — Current State (2026-06-02)

## Brain Layer (Phase 2) — Status (2026-06-02)

Major infrastructure change: flat per-project store → **whole-business brain** for DHS using an **entity → program → project** model. Full reference: `brain-layer.md`; rationale: `brain-architecture-decision.md`; plan: `docs/BrainBuild/brain-build-plan.md`.

| Step | State |
|------|-------|
| 1a `org/business.md` + `north-star.md` | ✅ Done |
| 1b `registry.json` v2.0 + schema-aware `mimp init` | ✅ Done (verified: parse + round-trip + both branches) |
| 1c `org/entities/*` + `programs/*` + `relationships.md` | ✅ Done |
| 1d decision log (`org/decisions/` ADRs) | ⬜ Pending |
| 1e MCP brain tools | ⬜ Pending — until then `org/` is invisible to the desktop MCP server |
| 1.5 weekly `DIGEST.md` strategist (machineB) | ⬜ Pending |

Committed + pushed as `e11110d` (clean rebase over machineB's MIMP-005 push). Cross-machine `mimp init` test still pending on machineB — see `docs/test-init-machineB.md`.

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
| MCP server (mcp-server/) | Working on machineA and machineB — reads via git objects from `origin/master` (v3 remote-sync); 3 tools; does NOT yet read `org/` |
| registry.json | **v2.0** — 5 projects + 2 entities (DHS, BDC) + 2 programs |
| machines.json | 2 machines registered |

### Registered Projects

| ID | Short Name | Full Name | machineA | machineB |
|----|-----------|-----------|----------|----------|
| MIMP-001 | image-converter | ImageConverter | E:\Self_project\ImageConverter | — |
| MIMP-002 | mimp | MIMemoryLLMDb | E:\MIMemoryLLMDb | D:\MIMemoryLLMDb |
| MIMP-003 | v1HMS | V1GasBDCHMS | E:\v1-BdcHmsApp | — |
| MIMP-004 | dh-pacs-marketing | DHPACS | E:\DH-PACs-Solutions | — |
| MIMP-005 | DHV-OHIF | DHV-Online | — | D:\ohif-fork |

All projects now carry brain fields (`entity`, `niche`, `business_unit`, `role`, `serves`, `tags`). Classification: MIMP-001/002 = internal/tooling (DHS); MIMP-003 = software-saas/hms (dogfooded-by BDC); MIMP-004/005 = software-saas/pacs (MIMP-005 sold-to Ibn Sina, Jul 2026).

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
| MCP server v3 (remote sync) | 2026-05-30 | Reads from `origin/master`; auto-fetch 60s TTL; re-reads registry per call |
| Brain layer: `org/` + registry v2.0 (entity→program→project) | 2026-06-02 | business/north-star/entities/programs/relationships; 2 entities (DHS, BDC), 2 programs |
| Schema-aware `mimp init` | 2026-06-02 | Business/Personal branch; classifies entity/niche/business_unit/role/tags/serves at creation; personal → entity null |

## Verified End-to-End Tests

**2026-05-28:** `mimp push image-converter` — 6 files pushed to GitHub successfully

**2026-05-28:** machineB setup — clone, config, alias, PAT auth, registry conflict resolved

**2026-05-29:** Sparse checkout v1 — initialised on machineA, `mimp sparse-status` showed paths

**2026-05-30:** Sparse checkout v2 — verified on machineB; only `projects/MIMP-002-mimp/` downloaded; MIMP-001, MIMP-003, MIMP-004 absent from machineB working tree

**2026-05-30:** MCP server cross-machine — machineB successfully read project memory pushed from machineA on a different project; git objects mode confirmed working across sparse checkout boundary

**2026-05-30:** `mimp init` validation — wrong short_name (path) blocked; wrong memory path (no directory) blocked; wrong memory path (no MEMORY.md) blocked; valid path registered correctly

**2026-06-02:** registry v2.0 round-trip — `ConvertFrom-Json`→`ConvertTo-Json` preserves `entities`/`programs`/nested edges/arrays/nulls; a `mimp init` will not damage the v2.0 registry (only reformats to PS style + BOM)

**2026-06-02:** `mimp.ps1` parses clean after schema-aware init change; business + personal project objects serialize to correct JSON (simulated, zero side effects)

**2026-06-02:** brain commit pushed to `origin/master` (`e11110d`) via clean rebase over machineB's disjoint MIMP-005 push — no conflict

## Pending Work

| Task | Priority | Notes |
|------|----------|-------|
| Cross-machine `mimp init` test on machineB (new PACS project) | High | `docs/test-init-machineB.md` — proves schema-aware init end-to-end across machines |
| 1e: MCP brain tools (read `org/` + new fields) | High | `get_business_overview` / `get_entity` / `get_decisions` / `whats_next`; lights up the brain for the desktop assistant |
| 1d: decision log (`org/decisions/` ADRs) | Medium | trajectory layer — backfill OHIF fork, sparse checkout, git-objects MCP, this brain decision |
| 1.5: weekly `DIGEST.md` strategist on machineB | Medium | proactive insight; first automated writer (still via `mimp push`) |
| Test `mimp pull` end-to-end on machineB | High | claude_memory_paths.machineB configured for MIMP-002 |
| Register remaining projects (bdc-hms, erpnext, bdc-marketing, hrh) | Medium | Need to confirm local paths |
| Build push-log.jsonl event log | Medium | Roadmap item — next planned feature |

## Known Limitations

- `mimp push --all` flag does not exist — must push each project individually
- No conflict detection when two machines push without pulling first (Roadmap #10)
- No encryption for sensitive memory content (Roadmap #13)
- push-log.jsonl not yet built — no cross-machine audit trail yet
- Sparse checkout patterns are rewritten on every `Git-Sync` call — minor perf cost, functionally harmless
