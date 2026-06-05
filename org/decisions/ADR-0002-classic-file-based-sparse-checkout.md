---
id: ADR-0002
date: 2026-05-30
status: accepted
scope: [infra, mimp, projects]
tags: [git, sparse-checkout, cross-machine, compatibility]
supersedes:
superseded_by:
---

<!-- BRAIN LAYER | org/decisions/ADR-0002-classic-file-based-sparse-checkout.md | Decision (ADR, trajectory layer) -->

# ADR-0002: Classic file-based sparse checkout (over cone mode)

| Field | Value |
|-------|-------|
| Date | 2026-05-30 |
| Status | accepted |
| Scope | Cross-machine git working tree (all machines) |

## Context

A single repo holds every project's memory under `projects/MIMP-XXX-*/`. Each machine should only
check out *its own* projects on disk, not the whole portfolio — machineB has no reason to materialise
machineA's `projects/MIMP-001-...`. The first implementation (v1, 2026-05-29) used git **cone-mode**
sparse checkout, but cone mode requires **Git 2.26+**. machineB (Windows Server 2022) and the goal of
"works on any machine I add later" made a hard floor on git version a liability.

## Decision

Replace cone mode with **classic file-based sparse checkout**: write patterns directly to
`.git/info/sparse-checkout` and enable `core.sparseCheckout`. The pattern set is
`/*` + `!projects/*/` + each owned project folder — so root files, `tools/`, `docs/`, and (later)
`org/` are **always** checked out, and only *other* machines' `projects/` subfolders are excluded.
`mimp sparse-status` reads `.git/info/sparse-checkout` directly rather than depending on
`git sparse-checkout list`.

## Alternatives

- **Cone mode (v1)** — rejected: needs Git 2.26+; fails the "any machine, any git ≥ 1.7" goal.
- **Full checkout everywhere** — rejected: every machine carries every project's memory on disk,
  defeating the point of per-machine scoping (and growing without bound).
- **Separate repo per machine / per project** — rejected: breaks the single-source-of-truth model
  and the cross-machine sync story.

## Path-impact

- **Unlocks** machine onboarding with no git-version prerequisite (verified on machineB).
- **Constrains** anything that must be visible everywhere to live *outside* `projects/*/` — this is
  exactly why the Phase-2 `org/` brain layer (ADR-0004) sits at repo root and is readable on every
  machine.
- **Surfaced a follow-on bug** fixed later: `mimp init` computes the sparse set *before* a new
  project folder exists, so `git add -A` silently skipped the new folder's `MEMORY.md` on sparse
  machines — init now re-syncs the sparse checkout before commit (found during the MIMP-006
  cross-machine test).
- Minor known cost: sparse patterns are rewritten on every sync call — functionally harmless.
