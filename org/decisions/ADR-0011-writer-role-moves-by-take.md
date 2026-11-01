---
id: ADR-0011
date: 2026-11-01
status: accepted
scope: [infra, projects]
tags: [mimp, push, pull, writer, handover, laptop, machineC]
supersedes:
superseded_by:
---

<!-- BRAIN LAYER | org/decisions/ADR-0011-writer-role-moves-by-take.md | Decision (ADR, trajectory layer) -->

# ADR-0011: The Writer role moves by `mimp take`; a pull never overwrites unpushed edits

| Field | Value |
|-------|-------|
| Date | 2026-11-01 (grill session, Q11–Q12; not built — Phase 3, laptop day) |
| Status | accepted |
| Scope | Every project's memory on every machine; amends ADR-0009's one-pushing-machine rule |

## Context

A new laptop will join as machineC and be used **alongside** machineA, often on the same project.
ADR-0009's amendment fixed one pushing machine per project, because `mimp push` copies and
overwrites, never merges (lint check `two-writers`). A fixed Writer breaks on a second working
machine: memory an agent writes on the laptop for a machineA project either erases machineA's
(if pushed) or is overwritten by the laptop's next nightly pull (if not).

## Decision

Keep exactly one **Writer** per project at a time, but let the role move: `mimp take <project>`
pulls the latest memory, moves the project's `local_paths` entry to the current machine and
pushes the registry. Every pull is guarded: if a project's local memory has edits that were never
pushed, the pull skips it and the Heartbeat reports it, so brain-health tells Maidul on Telegram
instead of losing it. The agent offers `take` when work starts on a project another machine writes.

## Alternatives

- **`take` by hand, no pull guard** — one forgotten `take` and a day of laptop memory is overwritten
  that night with no warning; this user's record-keeping is a known gap (PROFILE L10).
- **Make push merge** — any machine pushes any project; removes the rule but is the largest change
  to `mimp`, and same-paragraph edits still conflict, now inside an unattended nightly job.
- **Laptop never writes** — agents there would lose every memory edit.

## Path-impact

`two-writers` stays an ERROR: `take` moves the role, it never adds a second Writer. The guarded
pull also protects machineB's manual pulls of projects machineA writes (MIMP-008, MIMP-009 keep
memory on both). Build only when a second working machine exists — nothing to test it against
before (YAGNI). Design: `docs/machine-continuity-design-2026-11.md`.
