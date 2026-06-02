---
name: brain-architecture-decision
description: "Phase 2 direction for MIMemoryLLMDb — the \"central brain\" layer above per-project memory"
metadata: 
  node_type: memory
  type: project
  originSessionId: db1d3e8a-7d57-4cde-bea6-a5d38ec24cd3
---

# Central Brain architecture decision (2026-06-01)

Decision made on 2026-06-01 about how to evolve MIMemoryLLMDb from a per-project
memory store into a "central brain" that gives portfolio-level insight ("where am I /
what's next") across interconnected DHS projects.

**Chosen direction:** Markdown Brain foundation + both on-demand and scheduled synthesis,
**whole-business scope** (all of DHS, not just the software arm), using an
**entity → program → project** model. Explicitly NOT building embeddings/vector search yet
(overkill; breaks pure-git). Graph Brain is deferred Phase 3 (becomes a generation step once
typed registry edges exist); Semantic Brain is Phase 4.

**Why:** The gap was never retrieval horsepower — it was (1) no business/entity layer above
projects, (2) no relationship modeling, (3) no decision/trajectory record, (4) no home for
non-code operational memory (e.g. BDC marketing audits). Structure problems, solved cheapest
in markdown + a richer registry.

**Business model captured (drives org/business.md):** DHS = parent healthcare co (Bangladesh).
Thesis/flywheel = land with Software-SaaS + Diagnostic-Centre business → earn trust/awareness →
convert to high-ticket **equipment-supply** deals (the long-term revenue anchor, not yet earning).
Two entities only: **DHS** (parent; activities = equipment-supply, software-saas) and **BDC =
Baroicha Diagnostic Center Ltd** (100%-owned subsidiary, different model: rural diagnostic centre +
patient-gen marketing engine + DHS proving ground, runs on HMS/MIMP-003). Equipment supply & SaaS
are DHS *activities*, not entities. External customers (Ibn Sina) = proof points, not nodes.
Node types: Entity / Program (non-code, e.g. BDC patient-generation) / Project (MIMP code repos).

**How to apply (build order — see docs/BrainBuild/brain-build-plan.md for full detail):**
1a. `org/business.md` + `org/north-star.md`.
1b. `registry.json` v2.0: add top-level `entities` + `programs`; backfill project edges (`niche`, `business_unit`, `entity`, `serves`, typed `relationships`, `tags`). Backward-compatible (existing tools read `data.projects`, ignore new keys).
1c. `org/entities/{dhs,bdc}.md` + `org/programs/*` (bdc-patient-generation, equipment-deal-pipeline) + `relationships.md`.
1d. ADR template + backfill (OHIF fork, sparse-checkout, git-objects MCP, this brain decision).
1e. Brain MCP tools (context-assembler, never reasons): `get_business_overview`, `get_entity`, `get_decisions`, `whats_next` (whats_next surfaces overdue/live-now).
1.5. machineB Task Scheduler runs `claude -p "<strategist prompt>"` weekly → writes `org/DIGEST.md` → `mimp push`. First automated writer; writes still go through mimp push.

**Current business north-star (drives org/north-star.md; as of 2026-06-02):** Land the
**first external PACS sale to Ibn Sina by July 2026.** Binding constraint = PACS product
readiness *in full commercial context* (MIMP-005 Phase-C blockers: report source, audit,
demographics, i18n — PLUS commercial wrap: deployment, pricing/packaging, support).
Ibn Sina is now both the **first paying customer** AND the proof point that unlocks
subsequent PACS sales (earlier MIMP-004 memory framed Ibn Sina as proof point only — note the shift).
Critical path = MIMP-005 (viewer) + MIMP-004 (marketing/commercial). This is the first turn
of the trust→equipment flywheel.

Full plan doc: `E:\MIMemoryLLMDb\docs\BrainBuild\brain-build-plan.md` (revised 2026-06-02).
See [[architecture]] and [[current-state]].
