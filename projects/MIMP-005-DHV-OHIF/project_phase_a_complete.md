---
name: project-phase-a-complete
description: Phase A v1 shipped 2026-05-19; v1.1 palette (teal-dominant) shipped 2026-05-20; A1 toolbar trim still pending review of Docs/TOOLBAR_TRIM.md; Phase B/C not started
metadata: 
  node_type: memory
  type: project
  originSessionId: 166f59ff-4dd5-4370-91b6-893b33f68d3c
---

**Status as of 2026-05-20:**

- **Phase A v1 — SHIPPED 2026-05-19.** `pacs-ohif-dhs:v1` live: DHS logo (via `whiteLabeling.createLogoComponentFn` in PACS-repo `app-config.js`), SVG favicon, page title + meta tags. Commit `48f99e181`.
- **Phase A v1.1 palette — SHIPPED 2026-05-20.** `pacs-ohif-dhs:v1.1` live: teal-dominant palette derived from DHV logo gradient (primary `#36918d`, accent `#0c3f75`); cards/popovers/borders shifted to teal family; legacy `bg-secondary-dark` (NavBar + side panels + 15 other components) flipped from `#041c4a` navy to `#1a3e3a` teal. Commit `60da49195`. See [[project-v11-palette-shipped]] for what shipped and the cache-busting deploy gotcha, and [[reference-color-palette-tutorial]] for the in-repo how-to.
- **Phase A v1.1 toolbar trim — DOC WRITTEN, EXECUTION PENDING.** [Docs/TOOLBAR_TRIM.md](Docs/TOOLBAR_TRIM.md) drafted in the fork as a reviewable design; the single-file source edit at [modes/basic/src/index.tsx#L211-L277](modes/basic/src/index.tsx#L211-L277) waits for user sign-off. Will ship as a separate logical commit on `dhs-main`.
- **Phase B — mobile-first UX — NOT STARTED.**
- **Phase C — custom extension (patient info, share, report panels) — NOT STARTED.** Blocked partly on [[project-phase-c-blockers]].

**Why:** Original `Docs/OHIF_CUSTOMIZATION_PLAN.md` was the design doc that committed DHS to Tier 3 + Tier 4 (see [[project-tier-decision]]). After v1 shipped, [Docs/ImplementationSteps.md](Docs/ImplementationSteps.md) became the playbook. v1.1 palette was pulled forward when the user said "make this color tone branded" mid-iteration; toolbar trim deferred to its own ship because it's a UX scope change not bundleable with a palette tweak.

**How to apply:**
- For "what should I do next?" — read `Docs/ImplementationSteps.md` §6, but note A3 (palette) is now done; A1 (toolbar trim) is the next pending item.
- A2 (PNG favicons) and A4 (logo polish) are still **blocked on Design deliverables** — don't start speculatively.
- Phase B vs C ordering depends on B1 (mobile audit, ½ day no-code) findings.
- Brand asset placeholders tracked in [BRAND_TODO.md](BRAND_TODO.md); palette row is currently "partial" pending Design's full hex codes for background/secondary-foreground/status semantics.
