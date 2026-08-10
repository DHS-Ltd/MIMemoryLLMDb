---
name: customer-facing-sales-docs
description: "The Inobitec/Client_Facing_Docs bucket — its two documents, the fixed naming/scope rules, and the DH PACS boundary"
metadata: 
  node_type: memory
  type: project
  originSessionId: f79638df-8ceb-459b-95dd-2dc4d08da5bf
  modified: 2026-08-02T19:20:25.179Z
aliases: [customer_facing_sales_docs]
---

Started 2026-07-26: `Inobitec/Client_Facing_Docs/` holds customer-facing **sales** material
derived from the capability catalog. **Three documents as of 2026-08-03**, in funnel order:
a two-page **Lead Sheet** (`...-3D-Lead-Sheet.html` + `.pdf`), the four-page **Brochure**
(leave-behind after a demo), and the long **Capability Dossier**. Distinct from
[[client-facing-clips-pipeline]], which is video.

**Figures for any of them come from `Practise_Resoucres/Part*/images/` and
`Video_Case_Practice/Case*/images/`** — ~180 self-recorded IBN Sina captures — through
`Client_Facing_Docs/tools/redact_figures.py`. **Never** from `Sales_Enablement/Answers/*/images/`
or `VIdeo_Insights/*/images/`: those are vendor frames with the vendor title bar, banned for any
prospect who doesn't already know the vendor. The wrong folder is the obvious one (it is bigger,
better named, and sits under `Sales_Enablement/`), so this is written down in
`Inobitec/docs/adr/0007-*.md` along with the principle it forced: **a capability you have run
yourself beats a broader one you have only watched** when both want the same slot.
Redaction is **mask, then crop** — the patient block is inside the render area.

`Inobitec_Resources/VIdeo_Insights/*/images/` **looks** like the exception — 174 hand-curated,
topically-named images rather than raw frames — but it is not: same vendor title bar, **and**
512×288 / 1024×576 against 2560×1368 for the own captures. Disqualified twice over; verified by
opening them 2026-08-03, so don't re-litigate it.

**When an own-capture figure looks too small, the crop is usually the problem, not the library.**
Some captures have the 3D view as one quadrant of a four-pane layout; others have the same step
with the pane maximised, at ~3× the pixel area. Look for the maximised one before giving up.

Standing rules the user set, which recur every time this material is touched:

- **Product name is "Advanced DICOM Image Viewer".** The vendor name never appears in
  customer-facing material. (Note this overrides the caption-only rule in
  [[marketing-caption-voice]], which says to write "the post-processing software" instead
  of naming the product at all — that rule is for clip captions, not for branded documents.)
- **Target customers are vascular.** Cardiac CT, coronary analysis, calcium scoring, PET/SUV
  and DTI tractography are deliberately excluded. MRI is in scope *without* DTI.
- **DH PACS and the DHV Workstation are out of scope** for this product's sales material —
  stated explicitly by the user on 2026-07-26. Do not reference the installed base, the
  free-install wedge, or the film-replacement pitch from
  `E:\DHS-PACS\docs\research\PACS_Market_Research_Bangladesh_2026.md` here. (Those two
  pitches do conflict — DH PACS says replace film, this product sells film output — but the
  user has ruled the conflict out of scope rather than resolved it, so don't re-raise it.)
- **No pricing** in the documents. **No stopwatch numbers** — speed is described
  qualitatively only.
- The incumbent to argue against is **the scanner vendor's bundled workstation**, and the
  argument is the one-specialist-one-workstation bottleneck. Each doc gets its **own** angle:
  the Brochure argues *access* ("the problem is not capability, it is access"); the Lead Sheet
  argues *deliverable* ("the surgeon's roadmap is already in the study you just reported").
- **Visual identity** is inherited from `E:\DHS-PACS\dh-pacs-website/src/app/globals.css` —
  dark `#0F172A`, teal `#0DA98A`, Plus Jakarta Sans + Inter, eyebrow/stat/pill devices.
  Inheriting the *identity* is not inheriting the *product association*: the DH-PACS-out-of-scope
  rule above still holds. Markdown can't carry it, so the Lead Sheet is HTML with A4 print CSS,
  rendered via headless Edge `--print-to-pdf`.

**Why:** these were resolved through a long grill session and are expensive to re-derive;
several of them are non-obvious and at least one (the DH PACS boundary) is invisible in the
repo.

**How to apply:** read `Inobitec/docs/adr/0003-*.md` before editing either document — it
records the deliberate choice to drop the catalog's `practiced-hands-on` / `studied-only`
status fields in customer-facing material. Before promising a live demo of anything in
those documents, check the real status in `Knowledge_Base/CAPABILITIES.md`, because the
documents no longer tell you.
