---
name: grill-film-composer
description: Grill one observed hospital filming practice into a locked, architecture-mapped implementation plan for the DHV Film Composer, updating CONTEXT.md / design-decisions / ADRs inline. Trigger with /grill-film-composer, or whenever the user reports a field finding about how hospitals print DICOM film at volume and wants it matched into the Composer.
---

<what-this-is>

A codebase-aware grilling instrument for the **DH DICOM Viewer Film Composer**
(the `weasis-dicom-filmcomposer` bundle, built in phases 5A–5G3). You feed it
**one thing you observed at a hospital** — how technologists actually print film
at high patient volume — and it interrogates that finding until it becomes a
locked, buildable plan mapped onto the code that already exists, then records the
decision in the project's own docs.

It is a **planning instrument, not a builder.** It stops at a confirmed plan and
hands the wheel back to the normal TDD/code-review build flow. It never writes
production code itself.

It **grows the knowledge base every session** — the four project docs below are
both what primes it and what it appends to. Over many hospital visits this turns
into the Composer's industry-conformance record.

</what-this-is>

<invocation>

- `/grill-film-composer <finding>` — start immediately on the described finding.
- `/grill-film-composer` with no argument — open by asking: *"What did you observe?"*
- Runs from the project root `e:\DHV-Weasis`. All doc paths below are relative to it.

</invocation>

<priming>

Before asking anything, prime yourself on the as-built Composer. **Do not
re-read twenty files every session** — read the curated map first, then only the
specific files it points you to for the feature at hand.

1. Read [`architecture-map.md`](./architecture-map.md) (this skill's own curated
   pointer list — the fast path to "what already exists and where").
2. Read `DHDicomViewer/dh-dicom-viewer/CONTEXT.md` (the filming glossary — the
   canonical language you must grill against).
3. Skim the decision catalog
   `DHDicomViewer/dh-dicom-viewer/docs/Printing_module/film-composer-design-decisions.md`
   for anything already resolved that touches this finding.
4. Pull only the ADRs and source files the architecture map flags as relevant to
   *this* feature — not all of them.

If the finding touches something the architecture map doesn't cover, read the
code to fill the gap, **then add a pointer to the architecture map** so next time
is faster (see `<self-growth>`).

</priming>

<the-grill>

Ask **one question at a time.** For every question, give your recommended
answer. Walk the dependency tree — resolve each fork before the one that depends
on it. Cross-reference the code: if the user states how something works and the
code disagrees, surface the contradiction immediately.

**Stage 0 — Intake / triage.**
- One observation → go straight to Stage 1.
- A messy batch from a whole visit → split it into atomic candidate features,
  help the user name and prioritize them, pick **one** to grill now, and park the
  rest in `DHDicomViewer/dh-dicom-viewer/docs/Printing_module/field-findings-backlog.md`
  (create it lazily on first use — a simple `- [ ] feature — one-line note`
  checklist). Never grill more than one feature per session.

**Stage 1 — Sharpen *what & why*.** Grill until the feature is unambiguous:
what it *is*, why high-volume printing *needs* it, what breaks without it.
Challenge every term against `CONTEXT.md`; when the user uses a fuzzy or
overloaded word, propose a precise canonical one. Invent concrete high-volume
scenarios (e.g. "a 240-image CT filmed onto 6-up sheets during a trauma rush")
to force precision about boundaries.

**Stage 2 — Industry-standard check.** Establish the bar the feature must meet:
how enterprise consoles (Siemens, Philips, GE) and dry imagers
(Fuji, Agfa, Carestream) plus the DICOM Print IOD actually handle this.
**Gated research:** rely on built-in knowledge when the practice is clear; only
pull vendor/DICOM docs, GitHub, or web when the standard is genuinely uncertain,
and cite what you found into the decision row.

**Stage 3 — Reuse-first mapping.** Identify what in the Composer / Weasis already
does 80% of this (the architecture map is the starting index). Map the feature
onto concrete classes and existing hooks. **Flag ADR conflicts before they cost
anything** — especially ADR-0003 (no cross-bundle import with
`weasis-dicom-viewer2d` in either direction; use the `SeriesViewerFactory`
dispatch hooks instead).

**Stage 4 — Feasibility & trade-offs.** Converge on the single most-feasible
approach. Name the rejected alternatives and *why* — this is the raw material for
a decision row, and for an ADR if it qualifies.

**Stage 5 — Phased plan.** Produce a task plan in the project's own `5x` shape:
dependency-ordered, TDD-friendly, each phase with an explicit test seam. Number
new phases continuing after the existing Build-order table (the last is 5H, so
field-driven work starts at **6A, 6B, …**). Respect the project's headless-test
constraints and known gotchas (see the architecture map).

Every phase **must** also include a **live verification checklist**: a numbered
list of concrete `weasis-mcp` tool calls (with arguments) paired with exactly
what a human should see on the real screen to confirm each one — written now,
before any code exists, the same way a TDD test list is written up front. This
is not optional and not vague ("confirm it works") — each item must name a
specific tool call and a specific on-screen observation. It gets stored with the
plan (see `<docs-routing>`) and is what
[`docs/MCP/live-verification-protocol.md`](../../DHDicomViewer/dh-dicom-viewer/docs/MCP/live-verification-protocol.md)
executes, item by item, later during the build flow.

**Stage 6 — Update docs** (see `<docs-routing>`) — do this inline, as decisions
crystallize, not batched at the end.

**Stage 7 — Confirm to build.** Summarize the locked plan, name the phase it
becomes (e.g. "ready as Phase 6A"), and ask for the go. **On yes:** stop —
print the handoff line ("Plan locked as Phase 6A. Start the build flow:
tdd-guide → implement → code-reviewer → live verification per
`docs/MCP/live-verification-protocol.md`, using this phase's verification
checklist.") and end. Do **not** start writing code, and do **not** run the
verification protocol yourself — see `<build-handoff>`. **On no / not yet:**
leave the docs updated and the plan recorded; the finding stays captured for
later.

</the-grill>

<docs-routing>

All four docs live under `DHDicomViewer/dh-dicom-viewer/`. Route each resolved
item to exactly the right place — do not duplicate across docs.

- **A new or sharpened term** → `CONTEXT.md`. Domain filming terms only
  (not tooling). Be opinionated: pick the canonical word, list rejected synonyms
  under `_Avoid_`. One or two sentences; define what it *is*.
- **A resolved design decision** → a new row in the appropriate table of
  `docs/Printing_module/film-composer-design-decisions.md` (What's-new /
  Implementation-architecture / User-experience). Tag it with the date and
  `(field study)` so field-driven decisions are distinguishable from the
  original v1 build-planning rows.
- **A new phase** → a new row in that doc's **Build order** table (6A, 6B, …),
  and mirror the one-line status into `CLAUDE.md`'s Phase table. **Include the
  phase's live verification checklist (Stage 5) directly in this row** — it's
  what the build session runs through at the end via
  `docs/MCP/live-verification-protocol.md`.
- **A hard architectural call** → a new ADR `docs/adr/000N-<slug>.md`, **only if
  all three hold**: (1) hard to reverse, (2) surprising without context,
  (3) a real trade-off with genuine alternatives. If any is missing, a decision
  row is enough — skip the ADR. Number by scanning `docs/adr/` for the highest
  existing number (currently 0005) and incrementing.
- **Parked candidate features** → `docs/Printing_module/field-findings-backlog.md`.

Keep `CONTEXT.md` a pure glossary — no implementation detail ever leaks into it.

</docs-routing>

<build-handoff>

`grill-film-composer` is plan-only by deliberate choice. Its deliverable is a
locked plan + updated docs — including the Stage 5 live verification checklist,
which is *authored* here but never *executed* here. Building is a separate,
disciplined mode (tdd-guide → implement → code-reviewer → live verification per
`docs/MCP/live-verification-protocol.md`, per every prior phase). The
confirmation gate is the seam between the two — honor it. This skill never
closes Weasis, never runs a build, and never launches the app itself; it only
writes down the checklist that the later build session's live-verification pass
will execute, confirm-gated step by step, against the real running app. If
handoff friction ever becomes annoying, promoting this to "skill drives the
build" is a one-line change to Stage 7; do not build that speculatively.

</build-handoff>

<self-growth>

The skill improves in two independent ways — keep them separate:

- **The knowledge grows in the repo docs.** Every session's Stage 6 appends to
  `CONTEXT.md` / the design-decisions doc / the ADRs. This is automatic in the
  sense that it is a mandatory step, not an optional one — never end a session
  with a resolved decision that isn't written down.
- **The skill's own map grows only when priming was slow.** If this session had
  to read code the architecture map didn't already point at, add that pointer to
  [`architecture-map.md`](./architecture-map.md) before finishing — so the next
  grill primes faster. Do **not** rewrite the procedure in this `SKILL.md` for a
  single finding; the procedure changes only when the *way you grill* is wrong,
  not when the *knowledge* grows.

</self-growth>
