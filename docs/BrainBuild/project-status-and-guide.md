# MIMemoryLLMDb — Project Status & Guide

> **What this document is:** a single orientation page — what the project *is*, what has been
> *achieved* so far, *how to use* it day to day, and what is *planned ahead*. For the detailed
> build spec see [`brain-build-plan.md`](./brain-build-plan.md); for the business model see
> [`DHS Business_Initial_Plan.md`](./DHS%20Business_Initial_Plan.md).
>
> **Last updated:** 2026-06-10 · **Maintained on:** machineA · **Remote:** https://github.com/DHS-Ltd/MIMemoryLLMDb

---

## 1. What this project is

**MIMemoryLLMDb is a git-based memory system for AI assistants.** It lets Claude Code (and any
other LLM that can read text) share structured, persistent project knowledge across multiple
machines through one private GitHub repo.

- **No database, no embeddings.** Git is the database, markdown is the format, GitHub is the backup.
- **LLM-agnostic.** Plain markdown + a self-describing `SCHEMA.md`. Any model can read it.
- **Two layers:**
  - **`projects/`** — per-project code memory (the original Phase-1 system).
  - **`org/`** — a whole-business *brain* above projects: entities, programs, decisions, strategy
    (the Phase-2 layer).

The whole thing is driven by one PowerShell CLI: **`mimp`** (`tools/mimp.ps1`).

---

## 2. What has been achieved so far

### Phase 1 — Per-project memory store ✅ (complete, in daily use)

| Capability | Status |
|------------|--------|
| Core CLI — `init` / `push` / `pull` / `list` / `status` / `sync` | ✅ Working on machineA + machineB |
| Per-machine paths — each machine maps a project to its own local + Claude-memory path | ✅ |
| Git sparse checkout — each machine checks out only its own projects | ✅ Classic file-based (git ≥ 1.7), verified on machineB |
| MCP retrieval server — read-only, reads via git objects from `origin/master` | ✅ 3 tools, verified cross-machine |
| Documentation suite — workflow, add-new-machine, llm-guide, troubleshooting, roadmap | ✅ |

**In plain terms:** you can write memory on one machine, push it, and any other machine's Claude
sees it — without checking out the whole repo.

### Phase 2 — The whole-business "brain" 🟢 (data + capture + trajectory + surfacing done; digest pending)

The system was extended from a flat project store into a **whole-business brain** for DHS using an
**entity → program → project** model.

| Step | What it delivered | Status |
|------|-------------------|--------|
| **1a** | `org/business.md` + `org/north-star.md` — DHS identity, flywheel thesis, current priority | ✅ Done |
| **1b** | `registry.json` v2.0 — top-level `entities` + `programs`, typed edges on every project; schema-aware `mimp init` | ✅ Done + cross-machine verified (MIMP-006 from machineB) |
| **1c** | `org/entities/{dhs,bdc}.md` + `org/programs/*` + `relationships.md` | ✅ Done |
| **1d** | `org/decisions/` — ADR decision log (`_TEMPLATE.md` + 5 backfilled ADRs) | ✅ Done 2026-06-05 |
| **1e** | MCP brain tools (surface `org/` to the desktop assistant) | ✅ **Done 2026-06-10** |
| **1.5** | Weekly `DIGEST.md` strategist (machineB scheduled job) | ⬜ Pending — **next** |

**The model:**

| Node type | Has code? | Examples |
|-----------|-----------|----------|
| **Entity** | No | DHS (parent), BDC (100%-owned subsidiary) |
| **Program** (operational) | Usually no | BDC patient-generation; equipment-deal pipeline |
| **Project** (MIMP-XXX) | Yes | OHIF viewer, PACS site, HMS, ImageConverter, mimp |

Connected by typed edges: `owns` · `runs-on` · `dogfooded-by` · `markets` · `sold-to` · `serves`
· `builds-trust-toward` · `depends-on`.

**The decision log (1d, newest):** `org/decisions/` now records *why* the major architectural
choices were made, as ADRs with machine-readable YAML frontmatter:

- **ADR-0001** — Fork OHIF for the PACS viewer (Tier 3+4) *(flagged TO VERIFY — original record on machineB)*
- **ADR-0002** — Classic file-based sparse checkout (over cone mode)
- **ADR-0003** — MCP server reads via git objects + remote sync
- **ADR-0004** — Whole-business entity→program→project brain
- **ADR-0005** — Force UTF-8 on the MEMORY.md metadata rewrite

> **Net state:** the brain's **data, capture, trajectory, and surfacing layers are all built.**
> As of 2026-06-10 the MCP server exposes `org/` to any MCP client (Claude Desktop included) via
> the 4 brain tools. The remaining Phase-2 item is the proactive layer: the weekly `DIGEST.md`
> strategist job (step 1.5).

---

## 3. How to use it

### 3.1 Everyday CLI

Run from any registered machine (alias `mimp` is defined in `$PROFILE`):

```powershell
mimp list                 # show all registered projects + local status
mimp status <short-name>  # compare local memory vs the repo for one project
mimp push <short-name>    # upload this machine's memory for a project to GitHub
mimp pull <short-name>    # download a project's memory onto this machine
mimp sync <short-name>    # pull then push
mimp sparse-status        # show which projects this machine has checked out
mimp init "Full Name" "short-name" "E:\path\to\project"   # register a NEW project
```

**Typical loop:** work with Claude on a project → Claude writes/updates memory → `mimp push <name>`
→ on another machine `mimp pull <name>` (or it is already visible via the MCP server).

### 3.2 Registering a new project (`mimp init` is now brain-aware)

`init` classifies every new project at creation so none are born orphans:

1. Asks **Business vs Personal/self-learning**.
2. **Business** → pick `entity` (numbered, read live from the registry) → `niche` (numbered choice:
   software-saas / diagnostic-centre / equipment-supply / internal, or "other") → `business_unit`,
   `role`, `tags`, `serves`.
3. **Personal** → `entity: null`, `niche: personal` (excluded from business synthesis).
4. It validates the Claude-memory path **before** assigning a project ID, and re-syncs the sparse
   checkout so the new folder's `MEMORY.md` actually commits.

### 3.3 Reading the brain (today)

- **From Claude Code in this repo:** just ask. The `org/` files (`business.md`, `north-star.md`,
  `entities/*`, `programs/*`, `relationships.md`, `decisions/*`) are plain markdown and always
  checked out on every machine.
- **From the Claude Desktop MCP server:** 7 read-only tools. The 3 project tools
  (`list_projects`, `get_project_memory`, `search_memories`) cover **project** memory; the 4 brain
  tools (step 1e, built 2026-06-10) surface `org/`:
  - `get_business_overview` — business.md + north-star + entities/programs/relationships + project map
  - `get_entity` — one entity in full (registry record + memory file + its programs + its projects)
  - `get_decisions` — ADRs filtered by `scope` / `tag` / `since` / `status` (or `summaries_only`)
  - `whats_next` — today's date + registry-deadline scan (OVERDUE / DUE NOW / upcoming) + north-star
    + program state + recent ADRs + each active project's `current-state.md` head
  Restart Claude Desktop after pulling to load the new tools. Test harness: `mcp-server/test-brain-tools.mjs`.

### 3.4 Where things live

```
MIMemoryLLMDb/
├── registry.json          ← master project list + entities + programs (schema v2.0)
├── machines.json          ← registered machines (machineA, machineB)
├── tools/mimp.ps1         ← all CLI logic
├── org/                   ← THE BRAIN
│   ├── business.md, north-star.md, relationships.md
│   ├── entities/{dhs,bdc}.md
│   ├── programs/*.md
│   └── decisions/         ← ADRs (_TEMPLATE.md + ADR-0001..0005)
├── projects/MIMP-XXX-*/   ← per-project memory (one folder each)
├── mcp-server/            ← read-only retrieval server (Node, stdio)
└── docs/                  ← guides (this doc lives in docs/BrainBuild/)
```

### 3.5 Recording a new decision (ADR)

Copy `org/decisions/_TEMPLATE.md` → `org/decisions/ADR-NNNN-short-title.md` (next sequential id),
fill `Context / Decision / Alternatives / Path-impact`, set the frontmatter `scope`/`tags`/`date`,
then commit and `mimp push mimp`. Keep frontmatter keys present even when empty — the
`get_decisions` MCP tool filters on them.

---

## 4. Plans ahead

### Near-term — finish Phase 2

| Step | What it adds | Why it matters |
|------|--------------|----------------|
| **1e — MCP brain tools** ✅ *(built 2026-06-10)* | 4 read-only tools: `get_business_overview`, `get_entity`, `get_decisions`, `whats_next` (surfaces OVERDUE / LIVE-NOW vs today's date) | **Lights up the brain for the Claude Desktop assistant.** Reuses the existing git-objects / `origin/master` pattern; the server stays a context-assembler and never calls a model. |
| **1.5 — Weekly DIGEST.md** *(next)* | A machineB scheduled `claude -p "<strategist prompt>"` job reads `org/` + every project's `current-state.md`, writes `org/DIGEST.md`, and `mimp push`es it | The **first automated writer** — proactive, time-aware portfolio insight through the trust→equipment lens. |

### Open follow-ups (tracked, non-blocking)

- **Verify ADR-0001 (OHIF fork)** from machineB — date, the meaning of "Tier 3+4", and the
  alternatives are currently reconstructed and flagged `TO VERIFY` (MIMP-005's record lives on
  machineB and is sparse-excluded from machineA).
- **BDC facts to confirm** — people/roles in `org/entities/bdc.md`; status of the overdue/live-now
  marketing items; the Ibn Sina deal "close" definition (signed / paid / pilot).
- **Test `mimp pull` end-to-end on machineB** for MIMP-002.

### Later phases (deferred by design)

- **Phase 3 — Graph Brain:** generate `graph.json` + traversal tools *from* the typed registry edges
  and ADRs. Because Phase 2 already stores structured edges, this is a generation step, not a
  rewrite. Trigger: relationships outgrow prose + flat fields.
- **Phase 4 — Semantic Brain:** an additive local vector index + semantic tools. Trigger: the
  portfolio crosses dozens of nodes. It never replaces the markdown source of truth.

---

## 5. The strategic "why" (one paragraph)

DHS's thesis is a **flywheel**: land with Software-SaaS + the diagnostic-centre business (BDC) →
earn trust and credibility with hospital owners and doctors → convert that trust into high-ticket
**equipment-supply** deals (the long-term revenue anchor). The current north-star is the **first
external PACS sale to Ibn Sina by July 2026**. The brain exists so that any assistant — on any
machine — can answer *"where am I, and what's the highest-leverage next move?"* through that lens,
grounded in real entities, programs, projects, and the decisions that got us here.
