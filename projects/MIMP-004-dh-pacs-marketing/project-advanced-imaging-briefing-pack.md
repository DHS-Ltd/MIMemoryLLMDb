---
name: project-advanced-imaging-briefing-pack
description: "The 8-doc ML-engineer onboarding pack at docs/Briefing_doc/, why it lives in the Hub, and the cross-repo decisions it forced (D25/D26, ADR-0006, Data Use Right)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 448a460b-2105-480d-901c-35f0986fb4a3
  modified: 2026-08-13T17:42:42.106Z
---

Written 2026-08-13 via `/grill-with-docs`. An eight-document briefing corpus at
`E:\DHS-PACS\docs\Briefing_doc\` for **a highly skilled ML engineer with zero DICOM/medical-imaging
background** — a close friend of Maidul's acting as advisor *and* prospective builder on
DHDicomAnalyzerPro, under **full disclosure**.

**Docs:** START_HERE · DICOM_PRIMER · BUSINESS_STRATEGY · ECOSYSTEM_MAP · SHIPPED_DH_PACS ·
ADVANCED_POST_PROCESSING · SLICER_ARCHITECTURE · DATA_AND_ML_OPPORTUNITY · OPEN_PROBLEMS.

**Four asks** stated in START_HERE, and every doc ends with hooks pointing back at them: where the ML
leverage is · design v1 so labels accrue · honest feasibility verdict · where he personally plugs in.

**Framing constraints Maidul chose, which are not obvious from the files:**
- **Split the pack** — docs 1–7 sell; OPEN_PROBLEMS carries every weakness. He rejected
  diagnostic-honesty-throughout; the split is deliberate, not an oversight.
- **No corpus numbers, shape only.** The corpus has never been measured; a census is listed as an open
  problem rather than guessed at.
- **Slicer settled, reversible only on an analysed market-requirement case** — full reasoning written
  out (4 arguments against, 4 rejected alternatives) so a verdict has something to bite on.

**The central thesis:** every post-processing job a technologist performs *is* a labelling job someone
else is paying for. Line 2 inverts the usual economics of building a medical imaging dataset. The window
to design capture in is open now and **closes when v1 ships** — retrofitting into deployed clinical
software means a release, a migration, retraining, and possibly a DGDA conversation.

**Ground truth that makes the pitch honest:** Line 2 has **not sold**, no P6 technologist has been
trained into production, and **only Maidul post-processes, on Inobitec, for demos/practice**. Zero labels
exist. Greenfield — nothing to migrate.

**Decisions this forced, recorded outside this repo:**
- **D25 / D26** appended to
  `E:\DH-Advanced-Viewer\DHDicomAnalyzerPro-Planning\docs\Product-Strategy-Decisions.md`. D25 adds
  label-capture-by-design to the D6 v1 surface *without* deciding format/schema/quality-gate — those are
  deliberately assigned outward to the engineer. D26 restates the Slicer platform call with its reasoning.
- **[[commercial-content-hub-rule]] gained a stated exception** — [ADR-0006](file:///E:/DHS-PACS/docs/adr/0006-briefing-pack-lives-whole-in-the-hub.md):
  reader-oriented artifacts route to the Hub whole, because a briefing pack's unit of value is coherence
  for one reader. It summarises and points; it is never a source of truth.
- **Data Use Right vs Data Control** — two separate grants, now in `docs/product_design/CONTEXT.md` and
  correcting `CLAUDE.md`. Use right is a **precondition of connection across both tiers** and is what
  makes an internal training corpus possible; control is per-deal, and ADR-0005 (Ibn Sina keeps control)
  stands unamended. See [[project-dh-pacs-ibnsina-commercial-posture]].

Reads with [[project-dh-pacs-product-design]] for the DH PACS boundary the pack summarises.
