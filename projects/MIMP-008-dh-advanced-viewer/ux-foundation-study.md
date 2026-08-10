---
name: ux-foundation-study
description: "The UX-Foundation interaction-design study (D17-D24, locked 2026-08-03) - persona, six areas, what's deliberately NOT evidenced, and what's still open"
metadata: 
  node_type: memory
  type: project
  originSessionId: f2b377b6-f216-4c06-86b7-9f584a13dd36
  modified: 2026-08-03T01:44:40.059Z
---

> **PARKED 2026-08-03 by the user.** Surface 1 (G4 3D VRT) and its Slicer map are complete and
> live-bridge verified; **surfaces 2–6 and all of step 3 are not started.**
> **Resume trigger: the first DHDicomAnalyzerPro scaffold setup** (Phase 1, `E:\DHDAPro\Src`) — not
> before. Pickup point is `UX-Foundation/PARKED.md`; the flag is repeated at the top of the Phase-1
> doc and in CLAUDE.md.
> **Five items must be applied AT that setup, not retrofitted:** bundle an *essentials* ffmpeg build
> **inside the Slicer home tree** (that is what makes `General/ffmpegPath` store relative and
> portable; Slicer's `findFfmpeg()` probes Unix paths only and **cannot** succeed on Windows) · flip
> ROI rotation handles **on** and `Paint` brush to **sphere** · author DH VRT presets (Slicer ships
> **no skin preset** — the cheapest useful Inobitec result has no equivalent) · build standard-view
> buttons (Slicer has **no** view-direction control at all) · **re-verify everything on the pinned
> 5.12.3** (findings are from recon 5.11.0).
> **Bridge tip:** `/mcp reconnect all` failed; not needed — the bridge is plain HTTP MCP at
> `http://localhost:2026/mcp` and can be driven directly with curl/urllib from Bash.

`DHDicomAnalyzerPro-Planning/docs/UX-Foundation/` — the three-step study run before any UI code:
six **UX surface** docs (Inobitec's UX per feature area) → per-area Slicer mapping with evidenced
bucket calls → design decisions. Locked 2026-08-03 via `/grill-with-docs`. Decisions **D17–D24**;
**D13** and **D14** closed in the same pass. Start at that folder's `README.md`.

**The three things that are easy to get wrong here:**

1. **The persona is the unobserved one, on purpose.** Target is the **BD diagnostic-centre
   operator** — capability-constrained, design for *fewer decisions*. **Not** the Answer Bank's
   IBN Sina radiographer, who is *capacity*-constrained (*fewer clicks*) and pulls design the
   opposite way. The radiographer is far better evidenced and attached to live revenue, which is
   exactly why the choice needed an ADR (0003). Answer Bank cards are a **friction** source here,
   never a **requirements** source.

2. **Two accepted evidence gaps, both must stay visible.** (a) The study unit is the *feature
   area*, not the clinical workflow — reversing D11 — so **no seam evidence exists**; every
   seam decision in step 3 must be tagged *inferred, no source* (ADR-0004). (b) The persona has
   never been observed, so every design decision carries an `assumption` tag **plus a falsifier**,
   and guidance level ships configurable rather than baked in.

3. **Bucket 1-vs-2 may not be decided from documentation.** It is a UX judgement by definition;
   docs cannot see a UI. Docs settle existence and all Bucket-3 calls; the **live Slicer bridge**
   settles 1-vs-2 (D20). `Biomodeling-Slicer-Implementation-Path.md` predates this rule — its
   bucket calls are doc-only and provisional (its step 1 tags Slicer's two-step DICOM
   import→load as Bucket 1, which is where first-time users actually stall).

**Scope:** six areas — 3D VRT · segmentation+biomodeling · basic 2D · measurements · MPR/MIP ·
subtraction+fusion. **Vessel Analysis excluded** (specialist module, v2 per D16).
**D12 is not superseded:** study six, decide the *shell* against six, design *depth* only for
biomodeling.

**Still open — D23:** does the DH shell mirror Inobitec's tool-organised layout or depart to a
task-first model? Deferred by choice; it is the **first entry of step 3** and must not drift past
that trigger.

**Next concrete step:** write the **G4 (3D VRT) surface as a schema pilot** — densest evidence and
on D12's path — then revise the 9-field schema before writing the other five.

**Why the shape discipline (D24):** this corpus feeds a future DHDicomAnalyzerPro
**feature-implementation agent**, to be built step by step in later sessions once the product
build starts. Hence one stable shape per doc type, greppable citations, and `unobserved` /
`assumption` as machine-visible markers rather than prose hedges.

Related: [[scope-current-position]] · [[dhdicomanalyzerpro-rescaffold]] ·
[[sales-enablement-answer-bank]] · [[inobitec-scope-loop]] · [[slicer-live-bridge]]
