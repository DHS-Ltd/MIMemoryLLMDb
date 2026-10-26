---
id: ADR-0010
date: 2026-10-26
status: accepted
scope: [projects, infra, mcp-server, MIMP-015, MIMP-021]
tags: [learning, lessons, learning-track, mcp, lint, registry]
supersedes:
superseded_by:
---

<!-- BRAIN LAYER | org/decisions/ADR-0010-*.md | Decision (ADR, trajectory layer) -->

# ADR-0010: Learning Tracks: product-free Lessons served to every project

| Field | Value |
|-------|-------|
| Date | 2026-10-26 (decided in a grill session 2026-10-24, build approved 2026-10-26) |
| Status | accepted |
| Scope | Every project's memory load; Learning Tracks MIMP-015 (sqa-learning), MIMP-021 (system-design) |

## Context

Maidul's learning spreads across many topics as the business grows (System Design, SQA, more to
come). He wanted it "not connected to any specific products, rather open to any projects to pick it
up", and wanted the tools to "suggest me along the way when I am working on any project". Before this,
MIMP-021 was registered as `personal` with no entity, and MIMP-015 was tied to DH PACS
(`Build / PRD-001`), so its knowledge could only reach DH PACS work. Learning tracks also get
interrupted by business work (SQA stopped at lecture 27), and nothing brings him back on its own.

## Decision

A **Learning Track** is an ordinary Project with `classification: "learning"`, entity `DHS`, and no
pillar or product. Each finished unit gets a **Lesson**: a small `lesson-NN-<slug>.md` file in the
track's memory with `use_when`, optional `studied` (a date; only Maidul sets it) and `write_up`. The
MCP server lists **every** Lesson, one line each, in two places: at the end of `get_project_memory`
for every project, and through a new `get_lessons` tool. The agent matches Lessons by meaning and
says so in one line when one applies, saying whether it is Studied or not studied yet. `mimp lint`
reports an ERROR if a Lesson names a Product, and WARNs past 60 Lessons or when `use_when` is missing.

## Alternatives

- **A new node type, or Wiki pages** — Wiki pages carry DHS facts with an Authority; general
  engineering knowledge has none. A new node type builds something new for what a Project already holds.
- **Match Lessons to projects by tags** — fails: MIMP-019's tags (`worklist, mwl, ibn-sina, dcm4chee`)
  would never surface the latency Lesson. Tags describe what a project *is*; Lessons are about problems.
- **Only studied Lessons** — an unstudied Lesson that turns up in real work is the cheapest way back
  into a parked track (a Return), so both kinds are served.
- **A hook or watcher that interrupts work** — rejected on principle: the agent you are talking to
  suggests; no tool watches and interrupts.
- **Have Claude Code call `get_project_memory`** — Claude Code already loads its own project memory,
  so that would load it twice; hence the separate `get_lessons`.

## Path-impact

- Every session in every project now receives Learning Track content. That is why DH Worklist's
  memory includes System Design Lessons. This is intended.
- The cost grows linearly (about 35 tokens per Lesson). Lint WARNs past 60; revisit this ADR then.
- **A Lesson never names a Product; the track may name its Practice ground.** SQA's DH PACS Test Plan
  stays DH PACS work; only product-free Lessons go in the track.
- Lessons are served from `origin/master`, so a Lesson exists for other projects only after `mimp push`.
- `mimp init` does not yet offer `learning`, and its `[2] Personal` option contradicts the
  business-only rule (2026-09-27). Parked.
