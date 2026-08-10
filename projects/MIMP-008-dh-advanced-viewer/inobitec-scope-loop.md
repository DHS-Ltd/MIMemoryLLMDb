---
name: inobitec-scope-loop
description: "The repeatable Inobitec→Slicer feature-scoping method (watch→insight→spec, three buckets, two-layer output)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 7e74d688-a15a-475f-91b0-384878641c92
  modified: 2026-07-27T18:41:17.659Z
---

The agreed, **validated** method for scoping DHDicomAnalyzer features by studying Inobitec:

**The loop:** short Inobitec clip → `/watch` → **Feature Insight** (Layer 1) → **Slicer implementable-spec**
(Layer 2). Proven end-to-end 2026-07-10 on a vessel/aneurysm clip.

**Scope unit (D11):** a whole **clinical workflow** traced end-to-end, NOT isolated tools — forces a
shippable vertical slice.

**The three buckets** — every workflow step maps to exactly one (this, not "native/extension/custom", is
the scope-relevant question):
- **Bucket 1 — Curation:** capability + one-click UX both exist; expose/brand only.
- **Bucket 2 — Workflow-wiring:** capability exists, Inobitec's streamlined UX doesn't → a scripted module
  gluing existing primitives. **Most real v1 effort lives here.**
- **Bucket 3 — Custom dev:** algorithm genuinely missing (plaque classification, calcium scoring, DH IP LLV/LVA).

**Key recurring finding:** the work is almost never "can Slicer do it" — Slicer usually HAS the capability
but not Inobitec's slick workflow. So far every studied feature (bone-removal, vascular) is Bucket 2, zero
Bucket 3.

**Two-layer output (D14) — keep competitor research physically separate from DH planning:**
- Layer 1 Feature Insight → `Inobitec_Resources\VIdeo_Insights\<feature>.md` (+ `images\<feature>\`)
- Layer 2 Workflow Scope → `DHDicomAnalyzerPro-Planning\docs\Workflow-Scope-<name>.md`

**Legal guardrail:** study workflow/ideas only; never decompile or copy Inobitec code/assets. Don't watch
the long webinar videos (token waste) — use short focused clips. See [[watch-tooling-windows]].

**Variant: personal-understanding report (no Layer 2).** Confirmed 2026-07-11 on a bone-segmentation
clip (`Segmentation/Part1`, sourced from a *long webinar* this time, focused via `--start`/`--end`
rather than a short standalone clip — the "avoid long webinars" guardrail is about token cost of a
full-video scan, not about which video the clip comes from). When the user explicitly says the report
is "for me to understand" and not for DH/Slicer scoping, skip Layer 2 (`Workflow-Scope-*.md`) and the
comparison-notes section entirely, and use a **freeform tool-by-tool structure** (what tool → why used →
benefit) instead of the fixed Feature-Insight template — the user picked this explicitly over the
trimmed-template option when asked. Still write to
`Inobitec_Resources\VIdeo_Insights\<subfolder>\...md` with an `images/<feature>/` sibling folder.
