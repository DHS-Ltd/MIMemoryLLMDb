# MIMemoryLLMDb — Current State (2026-06-10)

## Brain Layer (Phase 2) — Status (2026-06-10)

Major infrastructure change: flat per-project store → **whole-business brain** for DHS using an **entity → program → project** model. Full reference: `brain-layer.md`; rationale: `brain-architecture-decision.md`; plan: `docs/BrainBuild/brain-build-plan.md`.

| Step | State |
|------|-------|
| 1a `org/business.md` + `north-star.md` | ✅ Done |
| 1b `registry.json` v2.0 + schema-aware `mimp init` (niche = validated numbered choice; sparse re-sync before commit) | ✅ Done + verified cross-machine (MIMP-006 from machineB) |
| 1c `org/entities/*` + `programs/*` + `relationships.md` | ✅ Done |
| 1d decision log (`org/decisions/` ADRs) | ✅ Done 2026-06-05 — template + 5 ADRs (ADR-0001 OHIF flagged TO VERIFY) |
| 1e MCP brain tools | ✅ Done 2026-06-10 — 4 tools built + tested over stdio; server now exposes 7 tools |
| 1.5 weekly `DIGEST.md` strategist (machineB) | ⬜ Pending — **next** |

Committed + pushed as `e11110d` (clean rebase over machineB's MIMP-005 push). **Cross-machine `mimp init` test PASSED on machineB** — MIMP-006 (PACS-CENTRAL-DHS) registered with full brain fields; `entities`/`programs` survived machineB's round-trip. See `docs/test-init-machineB.md`.

## Next Session — Start Here (remaining brain roadmap)

The brain's data + capture + trajectory + **surfacing (1e)** layers are all done. Remaining: **1.5 (weekly DIGEST strategist)**. Full specs in `docs/BrainBuild/brain-build-plan.md`. **Start the next session on 1.5** — it runs on **machineB** (Task Scheduler + `claude -p`), so plan it for a machineB session or set it up remotely.

### 1d — Decision log (`org/decisions/` ADRs)  ✅ DONE 2026-06-05
- Built `org/decisions/` + `_TEMPLATE.md` (YAML frontmatter `id, date, status, scope[], tags[], supersedes, superseded_by`; body `Context / Decision / Alternatives / Path-impact`).
- 5 ADRs backfilled: ADR-0001 OHIF fork (Tier 3+4 — **flagged TO VERIFY**; MIMP-005 record lives on machineB, sparse-excluded from machineA, so date/"Tier 3+4"/alternatives are reconstructed — correct from machineB), ADR-0002 classic file-based sparse checkout, ADR-0003 MCP git-objects + remote-sync, ADR-0004 whole-business brain, ADR-0005 MEMORY.md push-encoding fix.
- These are the real data `get_decisions` (1e) will serve. **When building 1e, parse the YAML frontmatter for scope/tag/date filtering.**

### 1e — MCP brain tools  ✅ DONE 2026-06-10
- 4 read-only tools added to `mcp-server/` (server now exposes **7**): `get_business_overview`, `get_entity`, `get_decisions` (frontmatter filters: scope/tag/since/status/summaries_only), `whats_next` (today's date + registry-deadline scan -> OVERDUE/DUE NOW/upcoming + north-star + programs + recent ADRs + 50-line head of each active project's current-state.md).
- New `lib/repo.js` helpers: `readFullRegistryFromGit`/`readFullRegistry` (entities+programs), `parseFrontmatter`, `extractTitle`. Same git-objects/`origin/master` pattern; context-assembler only; stderr-only logging; Zod v4.
- All verified over real stdio via `mcp-server/test-brain-tools.mjs` (SDK client harness — keep it; rerun after any server change).
- **Restart Claude Desktop on each machine after pulling** to load the new tools. Details: `mcp-server.md`.

### 1.5 — Weekly `DIGEST.md` strategist  [proactive brain]
- machineB Task Scheduler job: `claude -p "<strategist prompt: read org/ + all project current-state.md; output portfolio state, OVERDUE/LIVE-NOW items, and the 3 highest-leverage next moves through the trust->equipment lens>"` -> writes `org/DIGEST.md` -> `mimp push mimp`.
- First automated writer; writes still go through `mimp push`. Decide cadence + run time.

### Also pending (verify with the user)
- `org/entities/bdc.md` people/roles are marked TO VERIFY.
- BDC overdue/live-now marketing items (lead magnet, health camp, ACS launch, KPI) — status unknown.
- North-star: Ibn Sina deal "close" definition (signed / paid / pilot); whether a BDC reference is needed before close.

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
| MCP server (mcp-server/) | Working on machineA and machineB — reads via git objects from `origin/master` (v3 remote-sync); **7 tools** (3 project + 4 brain, 2026-06-10); machineB needs pull + Desktop restart to pick up brain tools |
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
| `mimp init` hardening | 2026-06-02 | `niche` now a validated numbered choice (controlled set + "other"); re-syncs sparse checkout after registering so the new folder's MEMORY.md is committed on sparse machines |
| MCP brain tools (step 1e) | 2026-06-10 | 4 tools surface `org/`: business overview, entity, decisions (ADR frontmatter filters), whats_next (registry deadline scan vs today); + `test-brain-tools.mjs` harness |

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

**2026-06-02:** **cross-machine schema-aware `mimp init` PASSED** — MIMP-006 (pacsvm) registered from machineB; remote registry shows all brain fields (entity=DHS, business_unit=pacs, serves=[DHS], tags) and `entities`/`programs` intact (machineB round-trip safe). Surfaced two issues, both fixed: free-form `niche` (now a numbered choice) and a sparse-checkout `git add` skip of the new folder (now re-syncs sparse before commit)

**2026-06-02:** `mimp init` hardening verified — parses clean; niche choice resolves correctly (1→software-saas, 5→custom prompt, invalid→blocked)

**2026-06-10:** brain tools (1e) verified over real stdio on machineA via `test-brain-tools.mjs` — all 7 tools listed; `get_business_overview` returns business+north-star+entities+programs+relationships+project map (~11k chars); `get_entity('bdc')` resolves case-insensitively with programs+projects; unknown entity returns helpful error; `get_decisions` filters by scope (`mcp-server`→ADR-0003 only) / tag+since (no-match message correct) / summaries; `whats_next` emits today's date + classifies MIMP-005 deadline 2026-07 as "upcoming" (~25k chars total)

## Pending Work

| Task | Priority | Notes |
|------|----------|-------|
| 1.5: weekly `DIGEST.md` strategist on machineB | High | proactive insight; first automated writer (still via `mimp push`); brain tools (1e) now done so all inputs exist |
| machineB: pull + restart Claude Desktop to load the 4 brain tools | High | brain tools built on machineA 2026-06-10 |
| Verify ADR-0001 (OHIF fork) from machineB | Medium | date / "Tier 3+4" meaning / alternatives are reconstructed + flagged TO VERIFY — confirm against the DHV-OHIF (MIMP-005) record on machineB |
| Test `mimp pull` end-to-end on machineB | High | claude_memory_paths.machineB configured for MIMP-002 |
| Register remaining projects (bdc-hms, erpnext, bdc-marketing, hrh) | Medium | Need to confirm local paths |
| Build push-log.jsonl event log | Medium | Roadmap item — next planned feature |

## Known Limitations

- `mimp push --all` flag does not exist — must push each project individually
- No conflict detection when two machines push without pulling first (Roadmap #10)
- No encryption for sensitive memory content (Roadmap #13)
- push-log.jsonl not yet built — no cross-machine audit trail yet
- Sparse checkout patterns are rewritten on every `Git-Sync` call — minor perf cost, functionally harmless
