# MIMemoryLLMDb — Central Brain Build Plan (Phase 2)

> **Status:** IN PROGRESS — steps 1a, 1b, 1c built (2026-06-02); 1d ADRs built (2026-06-05); 1e MCP brain tools built (2026-06-10). Remaining: 1.5 digest.
> **Decided:** 2026-06-01 · **Revised:** 2026-06-02 (entity→program→project model)
> **Scope:** Evolve MIMemoryLLMDb from a per-project code-memory store into a **whole-business
> brain** for DHS that answers *"where am I / what's next"* across entities, operational
> programs, and code projects — and surfaces what is overdue or live-now.

---

## 1. Why this exists (the gap)

Phase 1 built a **per-project code-memory store with retrieval**, and built it well:

- **Storage:** Git is the database, markdown is the format, GitHub is the backup (no DB, no embeddings).
- **Sync:** `mimp push/pull/sync` + sparse checkout (each machine carries only its own projects).
- **Retrieval:** MCP server v3 reads from `origin/master` via git objects (60s fetch TTL), so any machine sees all memory regardless of what is checked out.

What the system **cannot** do today — and why the brain is a new *layer*, not a feature:

1. **No relationships.** Every project is an island. The registry has no notion that the projects ladder up to a business.
2. **No business layer.** Nothing exists *above* `projects/` — no representation of the company, its entities, or its strategy.
3. **No trajectory / no time-sensitivity.** `current-state.md` is a snapshot. Nothing records decisions over time, and nothing can surface that an operational deadline has *passed* or an event is *live this week*.
4. **Only code is modeled.** The richest business memory (e.g. the BDC marketing audit, 60-day calendar, KPI tracker) is **not code** and has no home in the current `projects/MIMP-XXX/` mold.

**Core realization:** the missing capability is **structure, trajectory, and non-code business memory** — not retrieval horsepower. That is a data-modeling problem, solved cheapest in markdown + a richer registry.

---

## 2. The decision

The "brain" is **two separable decisions**:

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **A — Representation** | **Markdown Brain** with an **entity → program → project** model (an `org/` layer + structured registry edges) | Pure git, LLM-agnostic, low effort; the foundation a graph/semantic layer would need anyway. |
| **B — Synthesis** | **Both** — on-demand (live MCP query) **+** scheduled digest (weekly `DIGEST.md` commit) | machineB is always-on; on-demand reuses existing MCP plumbing; scheduled gives proactive, time-aware insight. |
| **Scope** | **Whole-business** (all of DHS), confirmed 2026-06-02 | Software is one branch; equipment & diagnostic-centre work become tracked memory over time. |

### Explicitly deferred (NOT building now)

- **Graph Brain** (`graph.json` + traversal tools) → Phase 3. Because Phase 2 stores typed edges as structured fields, promoting to a graph later is a *generation step*, not a rewrite.
- **Semantic Brain** (embeddings + vector store) → Phase 4, only if the portfolio crosses dozens of nodes. Strictly additive; never replaces the markdown source of truth.

---

## 3. The DHS business model (what the brain represents)

This section is the source of truth for `org/business.md` and the entity files.

### 3.1 DHS strategic thesis (the flywheel)

> **Land with software + the diagnostic-centre business → earn market awareness, trust, and credibility → convert that trust into high-ticket medical-equipment deals (the long-term revenue anchor).**

- **Current revenue engine:** Software SaaS + the Diagnostic-Centre business (these pay the bills today).
- **Long-term core target:** Equipment supply — expensive, very long sales cycles; *not* the anchor yet, but the destination the whole business steers toward.
- **Strategic lens for every decision:** does this move generate direct revenue *and* compound trust toward equipment? The brain must apply this lens to "what's next."

Identity (from the DHS Business plan): mission = *empower hospitals and patients with the knowledge to make informed healthcare decisions, fostering trust*; vision = *transform healthcare technology in Bangladesh, value over domination*; differentiators = relationships-first, 25+ yrs experience, global-manufacturer connections, tailored-to-Bangladesh, flexible/curated pricing; customers = hospital owners, diagnostic centres, healthcare providers across Bangladesh.

### 3.2 Entities (2 — the layer stays small by design)

| Entity | What it is | Notes |
|--------|-----------|-------|
| **DHS** — Direct Hospital Solution Ltd | Parent healthcare company. Holds three activity lines: **equipment supply**, **software SaaS**, and **ownership of BDC**. | Equipment supply and the SaaS arm are DHS *activities*, **not** separate entities. |
| **BDC** — Baroicha Diagnostic Center Ltd | **100%-owned subsidiary**, run on a **different business model**: a real rural diagnostic centre (Belabo/Raipura/Baroicha). | Operating revenue + a patient-generation engine + DHS's **proving ground** (runs on HMS). |

Future entities, if any, fold under DHS or BDC. External reference customers (e.g. Ibn Sina) are **not** entities — they are proof points / future equipment buyers, referenced inside DHS memory.

### 3.3 The three node types

| Node type | Has code? | Examples today |
|-----------|-----------|----------------|
| **Entity** | No | DHS, BDC |
| **Program** (operational, non-code) | Usually no | BDC patient-generation & marketing; equipment-deal pipeline |
| **Project** (today's MIMP) | Yes | OHIF viewer, PACS site, HMS, ImageConverter, mimp |

### 3.4 Typed relationships (the connective tissue)

`owns` (DHS→BDC, 100%) · `runs-on` / `dogfooded-by` (BDC↔HMS) · `markets` (PACS site→PACS product) · `sold-to` (PACS/HMS→external hospitals) · `builds-trust-toward` (SaaS + BDC → equipment) · `serves` (project→entity/program).

### 3.5 The full map

```
DHS  (parent — thesis: trust → equipment)
├── activity: Equipment supply ............ future revenue anchor   → program: equipment-deal pipeline
├── activity: Software SaaS
│     ├── PACS product   → MIMP-004 (markets) + MIMP-005 (OHIF viewer)  --sold-to--> external hospitals (Ibn Sina proof)
│     └── HMS product    → MIMP-003                                      --runs-on--> BDC
│     └── internal tooling → MIMP-001, MIMP-002
└── owns (100%): BDC  (subsidiary — different model)
        ├── operations (tests, doctor chambers, reports)
        ├── program: patient-generation & marketing (FB, miking, agents, PC-doctors, video-consult funnel)
        └── runs-on: HMS (MIMP-003)   ← BDC is the dogfooding/proving ground
```

---

## 4. Target architecture

### 4.1 The `org/` layer — tiers above `projects/`

```
MIMemoryLLMDb/
├── org/                            ← NEW: the brain layer
│   ├── business.md                 ← DHS identity, thesis/flywheel, the whole map (§3)
│   ├── north-star.md               ← current strategic position, priorities, horizon
│   ├── entities/
│   │   ├── dhs.md                  ← parent: activities, equipment thesis, references (Ibn Sina)
│   │   └── bdc.md                  ← subsidiary: model, operations, key people, status
│   ├── programs/
│   │   ├── bdc-patient-generation.md   ← marketing/funnel: strategy + live state + audit pointers
│   │   └── equipment-deal-pipeline.md  ← the long-term anchor activity
│   ├── relationships.md            ← human-readable narrative of the typed edges
│   ├── decisions/                  ← ADR log (the trajectory layer)
│   │   └── ADR-00X-*.md
│   └── DIGEST.md                   ← GENERATED weekly by the strategist job (never hand-edited)
├── projects/                       ← unchanged (per-project code memory)
├── registry.json                   ← EXTENDED: entities + programs + typed project edges (§4.2)
└── mcp-server/                     ← EXTENDED: brain tools (§4.4)
```

Programs may reference operational artifacts (marketing audits, KPI snapshots) stored under the program folder or linked from the relevant project — the brain treats them as first-class memory.

### 4.2 `registry.json` schema extension (`schema_version: 2.0`)

Add two top-level sections (`entities`, `programs`) and edge fields on each project. Existing tooling stays compatible: `mimp` and the current MCP tools read `data.projects` and ignore new keys; `ConvertFrom-Json`/`ConvertTo-Json` preserve them.

```jsonc
{
  "schema_version": "2.0",
  "entities": {
    "DHS": {
      "full_name": "Direct Hospital Solution Ltd",
      "role": "Parent healthcare company; thesis: trust -> equipment",
      "activities": ["equipment-supply", "software-saas"],
      "tags": ["parent", "healthcare", "bangladesh"]
    },
    "BDC": {
      "full_name": "Baroicha Diagnostic Center Ltd",
      "owned_by": "DHS", "ownership": "100%",
      "role": "Rural diagnostic centre; different model; DHS proving ground",
      "relationships": [{ "rel": "runs-on", "target": "MIMP-003" }],
      "tags": ["subsidiary", "diagnostic-centre", "belabo"]
    }
  },
  "programs": {
    "PROG-001-bdc-patient-gen": {
      "name": "BDC patient-generation & marketing",
      "entity": "BDC",
      "memory": "org/programs/bdc-patient-generation.md",
      "tags": ["marketing", "funnel", "facebook", "video-consult"]
    },
    "PROG-002-equipment-pipeline": {
      "name": "Equipment-deal pipeline", "entity": "DHS",
      "memory": "org/programs/equipment-deal-pipeline.md",
      "tags": ["equipment", "long-cycle", "anchor"]
    }
  },
  "projects": {
    "MIMP-003": {
      "...": "existing fields unchanged",
      "niche": "software-saas", "business_unit": "hms",
      "entity": "DHS", "serves": ["BDC"],
      "relationships": [{ "rel": "dogfooded-by", "target": "BDC" }],
      "depends_on": [], "tags": ["hms", "diagnostics", "analytics", "android", "web"]
    }
  }
}
```

**Confirmed project mapping (2026-06-02):**

| ID | niche | business_unit | entity | serves / edge | tags |
|----|-------|---------------|--------|---------------|------|
| **MIMP-001** ImageConverter | `internal` | `tooling` | DHS | — | `python, image-conversion, desktop, utility` |
| **MIMP-002** mimp | `internal` | `tooling` | DHS | serves all | `memory, mcp, powershell, infrastructure` |
| **MIMP-003** v1HMS | `software-saas` | `hms` | DHS | `runs-on / dogfooded-by` BDC | `hms, diagnostics, analytics, android, web` |
| **MIMP-004** dh-pacs-marketing | `software-saas` | `pacs` | DHS | `markets` PACS → external | `pacs, marketing, website, supabase, hipaa, gtm` |
| **MIMP-005** DHV-OHIF | `software-saas` | `pacs` | DHS | `sold-to` external hospitals | `pacs, dicom, ohif, viewer, frontend` |

**Modeling rules:** `depends_on` = real build/runtime dependency between two registered projects only (all empty today). Product/sibling/ownership links are expressed via `entity` + typed `relationships`, never forced into `depends_on`.

**New projects are classified at creation (done 2026-06-02):** `mimp init` (`Cmd-Init` in `tools/mimp.ps1`) now prompts for the brain fields. It first asks **Business vs Personal/self-learning**; business projects pick an `entity` (numbered list read live from `registry.json`), `niche`, `business_unit`, `role`, `tags`, and `serves`; personal projects get `entity: null` + `niche: "personal"` so the brain excludes them from business synthesis. `relationships` and `depends_on` default to `[]` and are added by hand when a real edge exists. Verified: parses clean, Load→Save round-trip preserves `entities`/`programs`/nested edges, both branches serialize correctly.

### 4.3 ADR (decision log) — the trajectory primitive

One file per decision in `org/decisions/`. Frontmatter (`id, date, scope:[entities/programs/projects], status, tags`) makes them queryable; body = Context / Decision / Alternatives / Path-impact. Backfill candidates: OHIF fork (Tier 3+4), classic sparse checkout, MCP git-objects mode, **whole-business + entity-program-project brain (this plan)**.

### 4.4 MCP server — brain tools (additive, same read-only/git-objects design)

The server stays a **context-assembler — it never calls a model**. Reasoning stays with the calling LLM.

| Tool | Assembles | Answers |
|------|-----------|---------|
| `get_business_overview` | `business.md` + entity files + registry edges | "Where does the whole business stand? What ladders up to what?" |
| `get_entity` | one entity file + its programs + linked projects | "Tell me everything about BDC." |
| `get_decisions` | ADRs filtered by scope / tag / date | "Which path did I take, and why?" |
| `whats_next` | `north-star.md` + recent ADRs + program state + project `current-state.md` | Bundles context (incl. **overdue / live-now** items) for the LLM to synthesize next moves |

### 4.5 Scheduled synthesis — the proactive, time-aware brain

A **machineB Task Scheduler job** (always-on) runs Claude headless weekly:

```
claude -p "<strategist prompt: read org/ (business, entities, programs, decisions, north-star)
            + every project current-state.md; output portfolio state, what is OVERDUE or
            LIVE THIS WEEK, and the 3 highest-leverage next moves through the trust->equipment lens>"
        >  org/DIGEST.md
mimp push mimp        # commit + push the regenerated digest
```

machineB cron is chosen over a GitHub Action so it uses the existing Claude subscription (no `ANTHROPIC_API_KEY` secret in CI). `DIGEST.md` is generated output — never hand-edited. **Note:** this is the first automated *writer* in an otherwise read-only retrieval system; writes still flow through `mimp push` to keep that boundary intact.

---

## 5. Build order

| Step | Deliverable | Notes |
|------|-------------|-------|
| **1a** | ✅ `org/business.md` + `org/north-star.md` | Built 2026-06-02. |
| **1b** | ✅ `registry.json` v2.0 (`entities` + `programs` + project edges) **and** `mimp init` made schema-aware | Built 2026-06-02; init verified (parse + round-trip + both branches). |
| **1c** | ✅ `org/entities/{dhs,bdc}.md` + `org/programs/*` + `relationships.md` | Built 2026-06-02. BDC people marked TO VERIFY; overdue/live-now flagged. |
| **1d** | ✅ ADR template + backfill key decisions | Built 2026-06-05: `_TEMPLATE.md` + ADR-0001..0005 (ADR-0001 flagged TO VERIFY). |
| **1e** | ✅ Brain tools added to MCP server | Built 2026-06-10: 4 tools (`get_business_overview`, `get_entity`, `get_decisions`, `whats_next`), all verified over stdio (`mcp-server/test-brain-tools.mjs`). Restart Claude Desktop to load. |
| **1.5** | ⬜ machineB scheduled `DIGEST.md` strategist job | Depends on `org/` content (done) + brain tools (done). **Next.** |

**Recommended start:** 1b (registry v2.0) — purely structural; every later step reads those edges.

---

## 6. Design principles carried forward

- **Pure git, markdown-first, LLM-agnostic** — the brain adds no DB and no embeddings.
- **The MCP server assembles context; it never reasons.**
- **Structured typed edges now, graph later** — `entity`/`relationships`/`serves`/`tags` make the deferred Graph Brain a generation step.
- **Entities and programs are first-class** — the brain models the business, not just the code.
- **Time-awareness is a feature** — surfacing overdue/live-now items is core to the value, not a nicety.
- **Every step reversible** — markdown/JSON additions; no migration, no lock-in.

---

## 7. Open inputs still needed from the user

1. **`north-star.md` (step 1a):** current top priorities and how they sequence the flywheel over the next horizon.
2. **`org/programs/bdc-patient-generation.md` (1c):** confirm the live state — did the 23-May action list (lead magnet, health camp, ACS launch, KPI tracking) execute? What's the status *now* (we are past those deadlines and inside the Week-6 camp window)?
3. **`org/entities/bdc.md` (1c):** key people/roles to record (e.g. Arif, coordinators, Dr. Upal, Dr. Sonia, agents) and BDC's current operational status.
4. **ADR backfill list (1d):** which past decisions to record first.
5. **Digest cadence (1.5):** weekly vs other; preferred machineB run time.

---

## 8. Future phases (deferred — recorded for continuity)

- **Phase 3 — Graph Brain:** generate `graph.json` (typed nodes/edges) from registry + ADRs; add traversal MCP tools. Trigger: relationships outgrow prose + flat fields.
- **Phase 4 — Semantic Brain:** additive local vector index + semantic tools. Trigger: portfolio crosses dozens of nodes. Never replaces the markdown source of truth.
