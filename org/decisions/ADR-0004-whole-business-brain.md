---
id: ADR-0004
date: 2026-06-01
status: accepted
scope: [business, entities, programs, projects, infra]
tags: [brain, architecture, registry, entity-program-project, markdown, no-embeddings]
supersedes:
superseded_by:
---

<!-- BRAIN LAYER | org/decisions/ADR-0004-whole-business-brain.md | Decision (ADR, trajectory layer) -->

# ADR-0004: Whole-business entity → program → project brain

| Field | Value |
|-------|-------|
| Date | 2026-06-01 |
| Status | accepted |
| Scope | Whole system — adds an `org/` tier above `projects/` and a v2.0 registry |

## Context

Phase 1 of MIMemoryLLMDb was an excellent **per-project** code-memory store: git + markdown
+ MCP retrieval, synced across machines. But it had four structural gaps that no amount of
retrieval horsepower would close:

1. No layer representing the **business** above individual projects.
2. No way to model **relationships** between projects.
3. No record of **decisions / trajectory** over time.
4. No home for **non-code operational memory** (e.g. BDC marketing audits).

These are *structure* problems, not search problems. The question was how to evolve the system
to give portfolio-level insight ("where am I / what's next") across interconnected DHS work
without abandoning the pure-git, markdown-first, LLM-agnostic foundation that makes Phase 1 work.

## Decision

Add a **whole-business brain** modelled as **entity → program → project**, built in markdown +
a richer registry — no database, no embeddings.

- A new `org/` tier holds `business.md`, `north-star.md`, `entities/*`, `programs/*`, and
  `relationships.md`.
- `registry.json` goes to **v2.0**: top-level `entities` and `programs` sections, plus typed-edge
  and classification fields on every project (`entity`, `niche`, `business_unit`, `role`, `serves`,
  `relationships`, `depends_on`, `tags`). Backward-compatible — existing tools read `data.projects`
  and ignore the new keys.
- Three node types: **Entity** (DHS, BDC — no code), **Program** (operational, usually no code),
  **Project** (the existing MIMP-XXX code repos).
- Scope is the **whole DHS business**, not just the software arm, because the strategic question
  spans SaaS, the diagnostic centre, and the equipment pipeline.

## Alternatives

- **Embeddings / vector search now** — rejected as overkill and as a break from pure-git. The gap
  was structure, not retrieval. Deferred to Phase 4 (Semantic Brain), additive, never replacing the
  markdown source of truth.
- **Graph Brain (generated `graph.json` + traversal tools) now** — rejected as premature. By laying
  down typed registry edges now, Phase 3 becomes a *generation step*, not a rewrite. Deferred until
  relationships outgrow prose + flat fields.
- **Keep the flat per-project store, add tooling later** — rejected: it would never represent the
  business, relationships, or trajectory, which is exactly what "where am I / what's next" needs.
- **Model equipment-supply / SaaS / external customers as entities** — rejected. Equipment supply
  and SaaS are DHS *activities*; external customers (Ibn Sina) are proof points / sales targets, not
  nodes. Only DHS and BDC are entities.

## Path-impact

- **Unlocks** an `org/`-aware future: the brain MCP tools (`get_business_overview`, `get_entity`,
  `get_decisions`, `whats_next`) in step 1e, and the weekly `DIGEST.md` strategist in step 1.5.
- **Commits** future ADRs (including this one) to a trajectory layer — see ADR-0001..0005 — so the
  `get_decisions` tool has real data to serve.
- **Constrains** the MCP server to remain a **context-assembler that never calls a model** —
  reasoning stays with the calling LLM, consistent with Phase 1.
- **Preserves reversibility:** every piece is markdown + additive registry keys; old tooling keeps
  working untouched.
- Drove the schema-aware `mimp init` (classifies each new project at creation so none are born
  orphans) and the v2.0 registry round-trip guarantees verified across both machines.

<!-- Source memory: brain-architecture-decision.md, brain-layer.md, current-state.md. Plan: docs/BrainBuild/brain-build-plan.md -->
