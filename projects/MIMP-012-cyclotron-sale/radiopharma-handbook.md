---
name: radiopharma-handbook
description: "Fifth context, Radiopharma_Education/: one no-price teaching handbook for external Bangladeshi imaging professionals, under Maidul Islam's personal name. Status and what a resume needs."
metadata:
  node_type: memory
  type: project
  originSessionId: bc2684ab-6456-45bb-9198-a2d43ef3e669
  modified: 2026-11-04T15:31:47.114Z
---

Started 2026-11-04 through a `/grill-with-docs` interview. All 20 decisions are in
`Radiopharma_Education/CONTEXT.md`; the chapter plan is `Radiopharma_Education/Handbook_Outline.md`.
**Status 2026-11-04:** whole first draft written in one pass, at
`Radiopharma_Education/Radiopharma_Handbook.md` (the source), with all 18 SVG figures in `figures/` and
a linked 113-page PDF, `Radiopharma_Handbook.pdf`. About 26,500 words, all 20 chapters and 4
appendices, 40 `Unverified:` marks still visible. Waiting for the user's additions and cuts.
Rebuild after any Markdown change, from `Radiopharma_Education/build/`: `python make_figures.py`, then
`python build_pdf.py`, then `python verify_pdf.py ../Radiopharma_Handbook.pdf <out_dir>`. Needs Chrome
or Edge, plus the Python packages markdown and pymupdf.
The Chapter 19 shares, the Chapter 14 day timetable and the Chapter 17 planning times are assumptions
written in the author's name, so the user must confirm or replace them.

Non-obvious points a resume needs:

- **Personal authorship was the user's correction.** No MED-I, DHS or other formal name appears as
  author. "Prepared by Maidul Islam", one gentle check-the-facts note on the cover only, and footer
  with `linkedin.com/in/maidul-islam-sifat`. Do not add repeated disclaimers.
- **User chose to publish without MED-I or Sumitomo approval**, risk stated and accepted on
  2026-11-04, despite "strictly prohibited" wording in the quotations. Do not re-raise it. Mitigate
  quietly: prefer a public source for the same number, copy no Sumitomo pages, name no customer.
- **User chose a reading list over per-claim citations**, overriding the usual evidence rule in
  [[reports-evidence-discipline]] for this document. Facts are still checked, and `Unverified:` marks
  stay in the review draft. Reading list carries public sources only. File names such as "Sumitomo
  Technical Specification KYAMCH.pdf" must never reach the Reader.
- **Most Sumitomo data is image-only.** `Sumitomo Technical Specification KYAMCH.pdf` (HM-20S, Oct
  2025, doc HWG5003DE001) has no text layer and no OCR is installed, so pages must be rendered and
  viewed. PDF page numbers run 2 ahead of printed page numbers from about printed p.47.
- **SmartTAG-LT** is Sumitomo's HM-20S solid target and dissolution system (Oct 2025 spec, printed
  p.30), so the Dec 2025 proposal's "68Ga: SmartTAG LT" matches the Oct solid target. The newer spec,
  HWG5003EE001-00, is still missing (cover only); user will send it if obtained.
- **Conflicts to resolve while writing:** "No Need of Bunker" vs 1 m walls; HM-12S self-shield 55 t vs
  90 t; F-18 target 3.0 mL vs 2.1 mL; power 70 kVA at 60 Hz vs 100 kVA; "20 and 14 MeV" vs Sumitomo's
  "fixed-energy" (the lower energy comes from a degrader); N-13 labelled "viability" in quotations.
  Sumitomo's own documents win.

Separate from the sales work in [[project-purpose]] and [[tmss-cyclotron-sale]]: no TMSS or BMU
content may appear. Same conventions as [[at211-technical-context]]: `F-18` notation, no em dashes.
