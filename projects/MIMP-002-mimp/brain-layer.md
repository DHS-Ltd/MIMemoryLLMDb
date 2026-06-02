# MIMemoryLLMDb — Brain Layer (Phase 2)

> The reference for the biggest infrastructure change since the system was built: MIMemoryLLMDb
> evolved from a flat per-project code-memory store into a **whole-business brain** for DHS using
> an **entity → program → project** model. This doc describes the *as-built* system. For the
> decision rationale and business interview that produced it, see `brain-architecture-decision.md`.
> Full external plan: `docs/BrainBuild/brain-build-plan.md`. Built: 2026-06-02.

## Why it exists (the gap Phase 1 had)

Phase 1 was an excellent per-project code-memory store (git + markdown + MCP retrieval), but it
could not: (1) model **relationships** between projects, (2) represent the **business** above
projects, (3) record **decisions/trajectory** over time, or (4) hold **non-code operational
memory** (e.g. marketing audits). The brain closes all four — and it is a structure problem, not
a retrieval problem, so it is solved in markdown + a richer registry. No DB, no embeddings.

## The model: entity → program → project

Three node types replace the old flat project list:

| Node type | Has code? | Examples |
|-----------|-----------|----------|
| **Entity** | No | DHS (parent), BDC (subsidiary) |
| **Program** (operational) | Usually no | BDC patient-generation & marketing; equipment-deal pipeline |
| **Project** (the old MIMP-XXX) | Yes | OHIF viewer, PACS site, HMS, ImageConverter, mimp |

Connected by **typed relationships**: `owns`, `runs-on`, `dogfooded-by`, `markets`, `sold-to`,
`serves`, `builds-trust-toward`, `depends-on`.

## DHS business context (what the brain represents)

- **DHS = Direct Hospital Solution Ltd** — Bangladesh healthcare parent company.
- **Flywheel thesis:** land with Software-SaaS + the Diagnostic-Centre business → earn trust &
  awareness → convert to high-ticket **equipment-supply** deals (the long-term revenue anchor).
- **2 entities only:** **DHS** (parent; activities = software-saas, diagnostic-centre, equipment-supply)
  and **BDC = Baroicha Diagnostic Center Ltd** (100%-owned subsidiary, different model — a rural
  diagnostic centre + patient-gen engine + DHS proving ground; runs on HMS / MIMP-003).
- Equipment supply and SaaS are DHS **activities**, not entities. External customers (Ibn Sina)
  are proof points / sales targets, **not** nodes.
- **Current north-star:** land the first external PACS sale to **Ibn Sina by July 2026**
  (constraint = PACS product readiness in full commercial context; critical path = MIMP-005 + MIMP-004).

Full business narrative lives in the repo at `org/business.md`, `org/north-star.md`,
`org/entities/{dhs,bdc}.md`, `org/programs/*`, `org/relationships.md`.

## The `org/` layer (new tier above `projects/`)

```
org/
├── business.md          -- DHS identity, flywheel thesis, full map
├── north-star.md        -- current strategic position + priorities (Ibn Sina by Jul 2026)
├── entities/
│   ├── dhs.md           -- parent: activities, thesis, Ibn Sina reference
│   └── bdc.md           -- subsidiary: model, USP, channels, people (TO VERIFY), status
├── programs/
│   ├── bdc-patient-generation.md   -- marketing/funnel + 23-May audit + overdue/live-now view
│   └── equipment-deal-pipeline.md  -- the long-term anchor (groundwork stage)
├── relationships.md     -- typed edges, human-readable
└── DIGEST.md            -- (planned) weekly strategist output; never hand-edited
```

`org/` is reachable on every machine: the sparse-checkout pattern is `/*` + `!projects/*/` +
own-project folders, so root files, `tools/`, `docs/`, and `org/` are always checked out; only
*other* machines' `projects/` subfolders are excluded.

## registry.json — schema v2.0

Two new top-level sections (`entities`, `programs`) plus typed-edge fields on every project.
**Backward-compatible:** old code (`mimp` CLI, the 3 existing MCP tools) reads `data.projects`
and ignores the new keys; PowerShell `ConvertFrom-Json`/`ConvertTo-Json` round-trips preserve
everything (verified). New per-project fields:

```jsonc
"MIMP-005": {
  "...": "existing fields",
  "niche": "software-saas",        // software-saas | diagnostic-centre | equipment-supply | internal | personal
  "business_unit": "pacs",          // product line, e.g. pacs | hms | tooling (null if personal)
  "entity": "DHS",                  // owning entity, or null for personal/self-learning
  "role": "DICOM viewer (OHIF fork)",
  "serves": ["DHS"],
  "relationships": [{ "rel": "sold-to", "target": "external-hospitals", "first_target": "Ibn Sina", "deadline": "2026-07" }],
  "depends_on": [],                 // real build/runtime deps between registered projects only
  "tags": ["pacs","dicom","ohif","viewer","frontend"]
}
```

Confirmed classification of the 5 current projects: MIMP-001 (internal/tooling/DHS),
MIMP-002 (internal/tooling/DHS, serves all), MIMP-003 (software-saas/hms/DHS, dogfooded-by BDC),
MIMP-004 (software-saas/pacs/DHS, markets PACS), MIMP-005 (software-saas/pacs/DHS, sold-to external; first target Ibn Sina).

## Schema-aware `mimp init` (Cmd-Init)

`mimp init` now classifies new projects at creation so none are born orphans:

1. First asks **Business vs Personal/self-learning**.
2. Business → pick `entity` (numbered list read **live** from the registry), then `niche`
   (**numbered choice** from a controlled set: software-saas / diagnostic-centre / equipment-supply /
   internal, or "other" for a custom token), then `business_unit`, `role`, `tags`, `serves`.
3. Personal → `entity: null`, `niche: "personal"` (skips entity/unit/serves) so the brain
   excludes it from business synthesis.
4. `relationships` and `depends_on` default to `[]` (added by hand when a real edge exists).
5. Invalid entity/niche choice **blocks** registration (consistent with the existing path-validation hardening).
6. After registering, init **re-syncs the sparse checkout** so the new project folder is inside the
   sparse definition before commit — otherwise `git add -A` silently skips the new folder's `MEMORY.md`
   on sparse-checkout machines (the sparse set is computed before the project exists). Found + fixed
   during the MIMP-006 cross-machine test.

## What consumes the brain (current gap)

- **Today:** only an agent reading the repo directly (Claude Code in this repo, or the future
  digest job) can see `org/`. The **3 existing MCP tools** (`list_projects`, `get_project_memory`,
  `search_memories`) only scan `projects/` and ignore `org/` + the new registry fields — so the
  Claude **Desktop** MCP server cannot yet surface the business overview.
- **Planned (step 1e):** add 4 brain tools — `get_business_overview`, `get_entity`,
  `get_decisions`, `whats_next` (surfaces overdue/live-now). The server stays a **context-assembler;
  it never calls a model** — reasoning stays with the calling LLM, consistent with Phase 1.
- **Planned (step 1.5):** a machineB Task Scheduler job runs `claude -p "<strategist prompt>"`
  weekly → writes `org/DIGEST.md` → `mimp push`. This is the first *automated writer*; writes
  still flow through `mimp push`.

## Build status

| Step | State |
|------|-------|
| 1a `org/business.md` + `north-star.md` | ✅ Done 2026-06-02 |
| 1b registry v2.0 + schema-aware `mimp init` (niche numbered choice; sparse re-sync) | ✅ Done 2026-06-02; verified cross-machine via MIMP-006 from machineB |
| 1c `org/entities/*` + `programs/*` + `relationships.md` | ✅ Done 2026-06-02 |
| 1d ADR/decision log (`org/decisions/`) | ⬜ Pending |
| 1e MCP brain tools | ⬜ Pending (until then `org/` invisible to desktop MCP) |
| 1.5 scheduled `DIGEST.md` strategist | ⬜ Pending |

Committed + pushed to origin/master as `e11110d` (rebased over machineB's MIMP-005 push).
Cross-machine `mimp init` validated 2026-06-02: MIMP-006 (PACS-CENTRAL-DHS) registered from machineB
with all brain fields; remote registry kept `entities`/`programs` intact (machineB round-trip safe).

## Design principles

Pure git, markdown-first, LLM-agnostic · entities & programs are first-class · MCP server assembles
context, never reasons · structured typed edges now so the **Graph Brain (Phase 3)** becomes a
generation step, not a rewrite · **time-awareness** (overdue/live-now) is a feature · every step reversible.

## Deferred (future phases)

- **Phase 3 — Graph Brain:** generate `graph.json` + traversal tools from registry edges + ADRs.
  Trigger: relationships outgrow prose + flat fields.
- **Phase 4 — Semantic Brain:** additive local vector index + semantic tools. Trigger: portfolio
  crosses dozens of nodes. Never replaces the markdown source of truth.

## Open / to verify

- BDC people/roles in `org/entities/bdc.md` are marked TO VERIFY.
- BDC overdue/live-now items (lead magnet, health camp, ACS launch, KPI) status unknown — flagged in the program file.
- Ibn Sina deal "close" definition (signed / paid / pilot) and whether a BDC reference is needed before close.
