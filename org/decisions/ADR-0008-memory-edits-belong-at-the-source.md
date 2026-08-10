---
id: ADR-0008
date: 2026-08-10
status: accepted
scope: [infra, projects]
tags: [mimp, push, memory, source-of-truth, one-way-copy, supersession, lint]
supersedes:
superseded_by:
---

<!-- BRAIN LAYER | org/decisions/ADR-0008-memory-edits-belong-at-the-source.md | Decision (ADR, trajectory layer) -->

# ADR-0008: Project-memory edits belong at the source, never in `projects/`

| Field | Value |
|-------|-------|
| Date | 2026-08-10 |
| Status | accepted |
| Scope | `mimp push` and every file under `projects/` |

## Context

`mimp push` copies **one way**: from a project's Claude memory directory
(`~/.claude/projects/<encoded>/memory/`) into `projects/MIMP-XXX-*/`, with `Copy-Item -Force`.
The repo folder is a **replica**, not a working copy.

This was known but never written down, and on 2026-08-10 it silently destroyed real work.
Phase 0.3 had applied supersession banners to seven MIMP-004 files — the containment for the
live misinformation hazard where `search_memories` was serving *"Ibn Sina as master proof point"*
and the retired patient-ownership category to sessions drafting customer copy. Those banners were
written **into `projects/`**. The next `mimp push dh-pacs-marketing` overwrote all seven from the
memory directory, which had never carried them, and committed the deletion.

Nobody would have noticed. The push reported success for the copy step; the banners simply were
not there any more. What caught it was `mimp lint`, built the previous day: five `superseded-claim`
errors reappeared within seconds of the push.

## Decision

**Edits to project memory are made in the Claude memory directory. `projects/` is a replica and is
never hand-edited.**

- Supersession banners, corrections and annotations to a project's memory go to
  `~/.claude/projects/<encoded>/memory/<file>.md`, then reach the repo via `mimp push`.
- The only files under `projects/` that may be edited in place are those belonging to a project
  with **no** `claude_memory_paths` entry for this machine — nothing overwrites them.
- Anything the brain itself owns — `org/`, `wiki/`, `raw/_cards/`, `CONTEXT.md`, `SCHEMA.md`,
  `registry.json` — is authored in the repo and is unaffected by this rule.

## Alternatives

- **Make `mimp push` merge instead of overwrite** — rejected. Merging AI-written markdown is the
  same unsolvable problem ADR-0007 avoids by making machineA the sole Wiki writer, and it would
  make the replica's contents unpredictable.
- **Make `mimp push` refuse when the repo copy has diverged** — genuinely attractive and *not*
  rejected, only deferred: it needs a stored hash per file, which is the same mechanism Source
  cards already use. Recorded as the natural follow-up if this bites again.
- **Push the repo copy back to the memory directory (two-way sync)** — rejected. It would let a
  stale replica overwrite the live memory an agent is actively writing, which is worse.
- **Ban banners on project memory entirely, keep supersession only in `org/`** — rejected. The
  hazard is that `search_memories` serves the *project* file; a correction that lives elsewhere
  does not travel with the text being read.

## Path-impact

- **Constrains** every future correction to project memory: edit the source, then push. Documented
  in `SCHEMA.md` v1.1 and the repo `CLAUDE.md` so it is read before anyone edits `projects/`.
- **Validates the lint investment.** `mimp lint`'s `superseded-claim` check caught a regression that
  no human review would have caught, one day after being written. Mechanical lint is not overhead.
- **Leaves a gap open:** lint detects the *symptom* (a superseded claim reappears) but not the
  *cause* (a repo-side edit was overwritten). The deferred divergence check above would close it.
- **Reversible.** Nothing structural changed; this records a property `mimp push` always had.

<!-- Related: ADR-0006 (cites, not asserts), ADR-0007 (Source cards; single writer). Cause found via `mimp lint`. -->
