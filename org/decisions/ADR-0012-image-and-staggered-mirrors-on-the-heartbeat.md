---
id: ADR-0012
date: 2026-11-01
status: accepted
scope: [infra]
tags: [backup, image, mirror, heartbeat, wbadmin, robocopy, machineA, ssd]
supersedes:
superseded_by:
---

<!-- BRAIN LAYER | org/decisions/ADR-0012-image-and-staggered-mirrors-on-the-heartbeat.md | Decision (ADR, trajectory layer) -->

# ADR-0012: machineA backs up as a weekly Image plus two staggered Mirrors, reported on the Heartbeat

| Field | Value |
|-------|-------|
| Date | 2026-11-01 (grill session, Q1–Q7; not built — Phase 1) |
| Status | accepted |
| Scope | machineA's SSD (C:+E:) and its two HDDs; machineA's Heartbeat and lint check 11 |

## Context

machineA's only SSD holds Windows, every app, all projects on E: (4 repos with no remote), the
whole agent setup and the WSL disk where Hermes lives. Maidul wants nothing missing after fitting a
new SSD. The two HDDs differ: D: (2 TB) has 1,680 GB free; the 1 TB disk's best partition, G:, has
146 GB. Client `wbadmin` images whole volumes only (no `-exclude`).

## Decision

A weekly **Image** of C:+E: to D:, keeping 4 (~1 month back), restores Windows, apps and the WSL
disk. Two file **Mirrors** of E: and the user folder (minus caches) cap lost work: D: every hour,
G: nightly, so G: is always one day behind and serves as a one-day undo for mistakes a Mirror would
otherwise repeat. Results ride on machineA's existing **Heartbeat**; lint raises an ERROR for a stale
or failed run and Hermes' brain-health sends it to Telegram. A **Restore Drill** at build and every
three months is the only proof that counts.

## Alternatives

- **Files only, reinstall apps** — smaller, but a day or more of reinstalling, and things get missed.
- **Mirrors on the same schedule** — both repeat a mistake within the hour; no undo but the Image.
- **A 30-day file history** — catches mistakes found days later, but adds a second job with its own
  clean-up rules; the 4 Images cover that window coarsely.
- **A desktop pop-up or a log** — silent if the job never runs, the exact failure that hid 20 failed
  nightly syncs in September (ADR-0009 amendment).

## Path-impact

Widens **Heartbeat** from "last sync" to "last scheduled runs" (`CONTEXT.md`). The Image job needs
Administrator rights, unlike the S4U memory sync. The Mirrors hold everything on E:, including
memory kept out of the brain (`mimp-ignore.txt`), but only on local disks. Design and Unverified
list: `docs/machine-continuity-design-2026-11.md`.
