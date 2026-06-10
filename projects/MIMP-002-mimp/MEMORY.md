<!-- MEMORY FORMAT v1.0 | Project memory index | Read this first -->

# [MIMP-002] MIMemoryLLMDb (mimp)

| Field        | Value                              |
|--------------|------------------------------------|
| Project ID   | MIMP-002                           |
| Short name   | mimp                               |
| Last updated | 2026-06-10                         |
| Updated by   | machineA                           |
| Status       | active                             |
| Machines     | machineA, machineB (pending setup) |

## Summary

MIMemoryLLMDb is a Git-based project memory system that lets AI assistants (Claude Code and others) share structured project knowledge across multiple machines. Each project gets a unique MIMP-XXX ID and a folder of markdown memory files in a private GitHub repository. A PowerShell CLI tool (`mimp`) handles syncing via push/pull/init commands. The format is plain markdown — any LLM can read it without special integrations. As of 2026-06-02 it also has a **Phase-2 brain layer** (`org/` + registry v2.0) that models the whole DHS business as entities → programs → projects — see [brain-layer.md](./brain-layer.md).

## Key Facts

- GitHub repo: https://github.com/DHS-Ltd/MIMemoryLLMDb.git
- machineA repo path: E:\MIMemoryLLMDb
- machineB repo path: D:\MIMemoryLLMDb (not yet cloned — setup pending)
- CLI tool: E:\MIMemoryLLMDb\tools\mimp.ps1
- Local config (machineA): C:\Users\maidu\.mimp-config.json — machine_id: machineA
- PowerShell alias in $PROFILE: `function mimp { & "E:\MIMemoryLLMDb\tools\mimp.ps1" @args }`
- Claude memory for this project: C:\Users\maidu\.claude\projects\e--MIMemoryLLMDb\memory
- All commands tested and working on machineA as of 2026-05-28
- machineB has NOT been set up yet — see docs/add-new-machine.md

## Memory Files

| File | Description |
|------|-------------|
| [architecture.md](./architecture.md) | System design, file structure, how push/pull works |
| [current-state.md](./current-state.md) | What is built, tested, known bugs fixed, pending work |
| [setup-history.md](./setup-history.md) | Exact steps taken to build this system — bugs hit and how fixed |
| [mcp-server.md](./mcp-server.md) | MCP server design, tool list, config per machine, known issues |
| [brain-layer.md](./brain-layer.md) | **Phase 2 brain — as-built reference**: entity→program→project model, org/ layer, registry v2.0, schema-aware init, build status |
| [brain-architecture-decision.md](./brain-architecture-decision.md) | Phase 2 brain decision + DHS business context (scope, options weighed, flywheel thesis, north-star) |

## Recent Changes

- 2026-06-10: **NEXT SESSION START HERE** -> **1e MCP brain tools DONE** ✅. The MCP server now exposes **7 tools** — 4 new brain tools (`get_business_overview`, `get_entity`, `get_decisions` with frontmatter filters, `whats_next` with OVERDUE/DUE NOW deadline scan vs today) surface `org/` + ADRs + registry v2.0 to Claude Desktop. Stdio-verified via `mcp-server/test-brain-tools.mjs`. **Restart Claude Desktop after pulling; machineB needs `git pull` + restart.** The only remaining Phase-2 item is **1.5** — the weekly `DIGEST.md` strategist job on machineB. Details: [mcp-server.md](./mcp-server.md) + [current-state.md](./current-state.md).
- 2026-06-05: **1d decision log DONE** ✅ — `org/decisions/` template + 5 backfilled ADRs; see entry below.
- 2026-06-05: **1d — Decision log (ADRs) built.** Added `org/decisions/` with an ADR template (`_TEMPLATE.md`) + 5 backfilled ADRs: ADR-0001 OHIF fork (Tier 3+4, **flagged TO VERIFY** — MIMP-005 record is on machineB, sparse-excluded here), ADR-0002 classic file-based sparse checkout, ADR-0003 MCP git-objects + remote-sync, ADR-0004 whole-business brain, ADR-0005 MEMORY.md push-encoding fix. ADRs use YAML frontmatter (`id, date, status, scope[], tags[]`) so step-1e's `get_decisions` can machine-filter them. See [brain-layer.md](./brain-layer.md).
- 2026-06-02: **Cross-machine `mimp init` test PASSED** + step-2 hardening. MIMP-006 (pacsvm, PACS-CENTRAL-DHS) registered from machineB with full brain fields; remote registry kept entities/programs intact (round-trip safe). Hardened init: `niche` is now a validated numbered choice (controlled set + "other"), and init re-syncs sparse checkout after registering so a new project's MEMORY.md is committed on sparse machines. See [brain-layer.md](./brain-layer.md).
- 2026-06-02: **Brain layer (Phase 2) built** — flat per-project store → whole-business brain (entity→program→project). Added `org/` layer (business, north-star, entities DHS+BDC, programs, relationships), `registry.json` v2.0 (entities + programs + typed edges), and a schema-aware `mimp init`. Committed + pushed as `e11110d` (rebased over machineB's MIMP-005 push). Full reference: [brain-layer.md](./brain-layer.md).
- 2026-06-02: `mimp init` now classifies projects at creation — Business vs Personal/self-learning; business picks entity/niche/business_unit/role/tags/serves; personal → `entity: null`. Verified parse + JSON round-trip (entities/programs preserved). Cross-machine test on machineB pending (`docs/test-init-machineB.md`).
- 2026-05-30: MCP server verified working on machineB — reads project memories pushed from machineA via git objects; sparse checkout boundary confirmed transparent
- 2026-05-30: MCP server upgraded to git objects mode — `git show HEAD:<path>` replaces disk reads; all projects visible regardless of sparse checkout
- 2026-05-30: Sparse checkout rewritten — cone mode replaced with classic file-based approach (`.git/info/sparse-checkout`); works on all git versions ≥ 1.7; verified working on machineB
- 2026-05-30: `mimp init` hardened — memory path prompt moved BEFORE project ID assignment; wrong path now blocks registration entirely; validates directory existence AND MEMORY.md presence; short_name path-character guard added
- 2026-05-30: `mimp init` changed from auto-detect to manual paste for claude_memory_path — user pastes path explicitly; more reliable than encoding-based guessing
- 2026-05-30: `mimp sparse-status` reads `.git/info/sparse-checkout` file directly — no longer depends on `git sparse-checkout list`
- 2026-05-29: MCP server built (`mcp-server/`) — 3 read-only tools exposed via stdio; registered in Claude desktop config on machineA
- 2026-05-29: Git sparse checkout first implemented; `mimp sparse-status` command added
- 2026-05-28: Full system built; machineB set up; documentation suite created

