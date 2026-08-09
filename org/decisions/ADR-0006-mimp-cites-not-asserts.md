---
id: ADR-0006
date: 2026-08-09
status: accepted
scope: [business, entities, projects, infra, mcp-server]
tags: [brain, authority, wiki, context-md, adr, staleness, supersession, reconciliation]
supersedes:
superseded_by:
---

<!-- BRAIN LAYER | org/decisions/ADR-0006-mimp-cites-not-asserts.md | Decision (ADR, trajectory layer) -->

# ADR-0006: MIMemoryLLMDb cites, it does not assert

| Field | Value |
|-------|-------|
| Date | 2026-08-09 |
| Status | accepted |
| Scope | Whole system — redefines what `org/` is for and what the brain claims Authority over |

## Context

ADR-0004 (2026-06-01) built `org/` as the place where DHS business truth is **asserted**. That
held for about two weeks. The brain's last write was **2026-06-16**. In the ten weeks since,
the knowledge moved somewhere else:

| | MIMemoryLLMDb | Rest of machineA |
|---|---|---|
| `CONTEXT.md` / `CONTEXT-MAP.md` | 0 (until this date) | **20** |
| ADRs | 5 | **48** — DHV-Weasis 17, DH-Advanced-Viewer 13, DHS-PACS 11, Self_project 7 |
| Registered projects | 7 | ~20 active repos |

The per-repo pattern won because it lives where the work happens. Worse, the centre did not
merely fall behind — it went **wrong**. `E:\DHS-PACS\CONTEXT-MAP.md` (2026-08-03) explicitly
supersedes claims this repo still serves over MCP:

- Three activity lines and the *SaaS → trust → equipment* flywheel → **four Business Pillars**
  (Supply, Facility, Build, Service), with **Build as the prime pillar**.
- BDC as the proof/credibility engine → **Facility is banned from all Commercial Content**.
- North star *"land the first external PACS sale to Ibn Sina by July 2026"* → Ibn Sina has been a
  **live Enterprise deployment since Feb 2026** (7 DHV Workstations, 5 centres, ~1,257 patients).
  What failed was the **sales motion**, not the product: the patient-ownership category had no pull,
  Standard Tier connected centres but produced ~11 enrolments each, and follow-ups went cold. The
  `registry.json` deadline passed six weeks before anyone noticed.
- *"Ibn Sina as master proof point, cited in every first touch"* → **`master proof point` is a
  banned term**; **tier-matched proof** now governs — Ibn Sina proves Enterprise Tier only,
  **Cumilla** (5 centres, 56 patients, 7 referring doctors) proves Standard Tier, and the two
  are never crossed.
- Category *"the patient as complete owner of their imaging record"* → superseded by
  **Advanced Connected Imaging Network**; patient ownership is now the mechanism, not the claim.

`search_memories` will serve every one of those superseded claims to a session drafting customer
copy. Stale is survivable. **Wrong and retrievable is a hazard**, and it is the only thing here
actively costing money.

## Decision

**MIMemoryLLMDb holds Authority over no subject except itself.** `org/` stops asserting business
truth and is rebuilt to **cite** it: every claim names the Source that owns it — a `CONTEXT.md`,
an ADR, or a strategy doc in the repo that has Authority. DHS-PACS keeps Authority over Commercial
Content per its own ADR-0001; each engineering repo keeps Authority over its product.

What the brain uniquely provides, and no single repo can:

1. **Synthesis across repos** — the company-wide picture spanning DHS-PACS, DHV-Weasis,
   DH-Advanced-Viewer, Isotope/Cyclotron, BDC, CRM, ERP and Personal_Branding.
2. **Supersession tracking** — when a Source replaces a claim, the replacement is recorded and the
   stale copies still living in other repos and in Memory files are named, never silently deleted.
3. **Staleness reporting** — which Source a page was built from, when, and whether that Source
   has moved since.

The repos are the Sources; MIMemoryLLMDb is the Wiki over them. `wiki/` holds the Sourced
synthesis; `projects/` keeps per-project memory; `org/` becomes the cited company index.

## Alternatives

- **Rebuild `org/` as authoritative, repos defer to the centre** — rejected. It contradicts
  DHS-PACS ADR-0001 (Commercial Hub) head-on, and it re-creates precisely the centralisation
  that already failed once inside eight weeks.
- **Index/router only — pointers, hashes and review dates, no synthesis** — a real contender and
  the minimum that fixes the hazard, but it leaves every cross-repo question needing three reads.
  Retained as this ADR's fallback if synthesis proves unmaintainable.
- **Retire the brain layer; `mimp` returns to memory sync only** — rejected. Honest about what
  won, but nothing then spans the seven repos outside DHS-PACS, which is exactly where cross-repo
  blindness hurts.
- **Ingest external market PDFs first (the video's literal pattern)** — rejected as the wrong
  corpus. Your own repos are higher-value Sources, already structured with glossaries and ADR
  frontmatter, and already contradicting each other.

## Path-impact

- **Amends ADR-0004** rather than replacing it. The entity → program → project model survives;
  what changes is the *posture* — `org/` cites instead of asserts. ADR-0004's `niche` field is
  retired here in favour of `pillar` (registry v2.1), since CONTEXT-MAP.md supersedes the niche
  vocabulary by name.
- **Commits** every `org/` and `wiki/` claim to carrying a Source card reference. An uncited claim
  becomes a lint defect, not a style preference.
- **Requires** MCP change: `search_memories` gains a `scope` argument covering `wiki/` and `org/`
  — which also closes the pre-existing gap where `org/` was unsearchable — plus a `get_wiki_page`
  tool. See `docs/Phase3-Wiki/wiki-build-plan.md`.
- **Preserves** the MCP server as a context-assembler that never calls a model. Mechanical lint is
  deterministic and may be a tool; semantic lint stays a prompt.
- **Reversible**: `org/` files remain markdown, the citation is an added line, and the fallback
  (index/router only) is a subset of this decision, not a rewrite of it.

<!-- Sources: E:\DHS-PACS\CONTEXT-MAP.md (2026-08-03); E:\DHS-PACS\docs\adr\0001-dhs-pacs-as-commercial-content-hub.md. Plan: docs/Phase3-Wiki/wiki-build-plan.md -->
