---
id: ADR-0007
date: 2026-08-09
status: accepted
scope: [infra, projects]
tags: [wiki, ingest, raw, source-card, provenance, git-history, sparse-checkout, single-writer]
supersedes:
superseded_by:
---

<!-- BRAIN LAYER | org/decisions/ADR-0007-source-cards-not-raw-binaries.md | Decision (ADR, trajectory layer) -->

# ADR-0007: Sources stay local; Source cards are committed

| Field | Value |
|-------|-------|
| Date | 2026-08-09 |
| Status | accepted |
| Scope | The `raw/` ingestion tier and who may write `wiki/` |

## Context

ADR-0006 gives the brain an ingestion tier it never had. The obvious implementation — the one the
Karpathy/Teacher's Tech pattern shows — is a `raw/` folder holding the Sources themselves. That
pattern assumes a single local machine with no sync. This repo is neither.

Two constraints the video never faces:

1. **Git history is permanent.** The worktree is 689 KB against a 13 MB `.git`. Twenty vendor PDFs,
   scanned reports or pitch decks would multiply history by an order of magnitude on *both*
   machines, irreversibly. Sparse checkout cannot help: the pattern is `/*` + `!projects/*/`, so
   any new root folder is checked out everywhere by construction.
2. **An AI rewrites whole pages, it does not append lines.** Two machines ingesting different
   Sources that both touch one Wiki page produce two full-page rewrites of the same file. Git
   cannot auto-merge that — and `mimp` would not tell you, because `Git-Sync` discards stderr
   (`git pull --rebase --quiet 2>$null`) and no `$LASTEXITCODE` is checked on pull, commit or push.

## Decision

**`raw/` is gitignored. A Source card is committed in its place**, at `raw/_cards/<slug>.md`,
recording: title, origin (URL or absolute local path), date ingested, SHA-256 of the Source, a
one-paragraph abstract, and which Wiki pages it fed.

**machineA is the sole writer of `wiki/`.** machineB reads via git and MCP, and its scheduled job
writes only `org/DIGEST.md`.

The single-writer rule is nearly free rather than restrictive: because Sources are not synced,
they only exist on the machine they landed on, so ingest is already machine-local. The rule makes
an existing property explicit instead of imposing a new one.

Independently and in every branch: **`mimp` stops swallowing git failures.** Discarding stderr and
ignoring exit codes was survivable when each project was pushed from one machine; with a shared
Wiki it is silent data loss.

## Alternatives

- **Commit everything, binaries included** — rejected. Fully reproducible and true to the video,
  but the history cost is irreversible and paid by every clone on every machine, forever.
- **Convert-then-commit: markdown only, drop binaries** — rejected as lossy exactly where it hurts.
  Tables, figures and scanned documents are most of the medical-equipment and vendor material.
- **Any machine may write, enforced by atomic pull → ingest → commit → push** — rejected for now.
  It makes conflicts rare rather than impossible, and an AI-rewritten page is genuinely painful to
  merge by hand. Reconsider if the server ever needs to ingest.
- **Split capture from synthesis — ingest only ever creates new files** — structurally the most
  robust option and the natural upgrade path if single-writer becomes a constraint. Rejected now
  because it adds a step and leaves the Wiki stale between synthesis runs.
- **Keep `wiki/` out of git entirely** — rejected: no backup, no server access, and it breaks the
  core promise that the brain follows you across machines.

## Path-impact

- **Constrains** every Wiki claim to trace to a committed Source card. Lint can check this
  mechanically; provenance survives on machineB even though the Source itself does not.
- **Accepts** that machineB can read what a Source *said* but cannot re-read the Source. If
  re-ingestion from the server is ever needed, this decision is what must change first.
- **Commits** to fixing `Git-Sync` / `Git-CommitPush` error handling before any Wiki content is
  written, and to narrowing `git add -A`, which currently sweeps uncommitted `wiki/` work into
  whatever `mimp push <project>` commit happens to run next.
- **Reversible in one direction only.** Moving from cards to committed binaries is easy; removing
  binaries from history later is not. Starting strict is the recoverable choice.
- Source cards double as the Sources' own index, which is what makes ADR-0006's staleness
  reporting possible: a card's stored hash is compared against the Source on disk to detect drift.

<!-- Related: ADR-0006 (mimp cites, does not assert). Plan: docs/Phase3-Wiki/wiki-build-plan.md -->
