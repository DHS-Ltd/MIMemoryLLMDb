---
name: advanced-post-processing
description: The engine slot in the Surgeon Chain — what DHS sells as DH Advanced Post-Processing, which engine fills it today, and the rules that bind how it is sold
aliases: [adpp, advanced-dicom-image-viewer]
---

# Advanced Post-Processing

The engine slot in [the Surgeon Chain](../org/business.md): *CT/MRI patient → **Advanced
Post-Processing** → DH PACS → Surgeon → Patient*. It turns a raw study into something
analysis-ready for a surgeon's specific finding — segmentation, 3D reconstruction, vascular
analysis, biomodeling. It is also **a new billable line for the hospital**, not merely a DHS
product. As of 2026-08-10 it carries the north star: **sell one licence by 2026-10-10**.

This page exists because the knowledge is split across four places — `E:\DHS-PACS` owns the
commercial position, `E:\DH-Advanced-Viewer` owns the capability and the assets, `registry.json`
owns the product records, and the sales constraints live only in project memory. No single repo
answers "what are we selling and what may we say about it."

## Two engines, one slot, sequenced

| | Today | Later |
|---|---|---|
| Product | **Advanced DICOM Image Viewer** (`PRD-003`) | **DHDicomAnalyzerPro** (`PRD-004`) |
| Origin | **Resold** — Inobitec | DH-built, 3D Slicer based |
| Status | **Selling** ★ north star | **Planning — no code exists** |
| Regulatory | Certified product | Ships as a *non-diagnostic aid* pending DGDA |

These are the **same slot, sequenced** — not competing products [S1]. `E:\DHDAPro\Src`, where
PRD-004's source will live, does not exist yet; Phase 1 dev environment is unstarted and the
UX-Foundation study has been parked since 2026-08-03 [S7].

**The branding rule is what makes the swap survivable:** DHS markets the **capability** —
*DH Advanced Post-Processing* — and treats the engine as an implementation detail that may change.
DHS never claims to have built it and never conceals that a specialist engine is involved [S1].

## Naming — three rules that conflict if read carelessly

1. **In branded customer documents**, the product is **"Advanced DICOM Image Viewer"**. The vendor
   name never appears.
2. **In clip captions**, write *"the post-processing software"* — do not name the product at all.
   This is narrower than rule 1 and applies only to captions.
3. **In DHS strategy**, the capability is **"DH Advanced Post-Processing"**.

⚠ **R7 — the word "Advanced" names both the category and the product.** Every asset written from
here inherits the collision. A naming pass should precede volume production [S2].

## Scope — vascular, and deliberately narrow

Target customers are **vascular**. Explicitly excluded: cardiac CT, coronary analysis, calcium
scoring, PET/SUV, and DTI tractography. **MRI is in scope, without DTI.** [S8]

Demonstrated capability, from the 11-clip series built on real studies: vessels with anatomy
retained · arteries with bone in place · bone strip · separating touching bone and vessel ·
stenosis measurement · MIP cleanup · measurements for the report · branded print layout ·
plain-from-angio subtraction · automatic branch detection · liver with veins separated [S9].

## Assets that already exist

In `E:\DH-Advanced-Viewer\Inobitec\`:

| Asset | State |
|-------|-------|
| `Client_Facing_Docs/` | **Three documents in funnel order** — two-page Lead Sheet (HTML + PDF), four-page Brochure (demo leave-behind), long Capability Dossier [S8] |
| `Client_Facing_Clips/` | 11-clip series, **six on real Ibn Sina footage**, zero new recordings needed. Cut sheets in `Clip_Specs/` with measured timecodes and PHI mask rectangles [S9] |
| `Sales_Enablement/` | Answer Bank — operational, 1 of 24 Action Demos complete [S6] |

## 🔒 Figure sourcing — a trap with an obvious wrong answer

Figures for customer documents come **only** from own captures —
`Practise_Resoucres/Part*/images/` and `Video_Case_Practice/Case*/images/`, ~180 self-recorded
studies — passed through `Client_Facing_Docs/tools/redact_figures.py`. Redaction is **mask, then
crop**: the patient block sits inside the render area [S8].

**Never** from `Sales_Enablement/Answers/*/images/` or `Inobitec_Resources/VIdeo_Insights/*/images/`.
Those are vendor frames carrying the vendor title bar, banned for any prospect who does not already
know the vendor. `VIdeo_Insights/` *looks* like the exception — 174 hand-curated, topically named
images — but it is disqualified twice: same title bar, and 512×288 / 1024×576 against 2560×1368 for
own captures. Verified by inspection 2026-08-03; **do not re-litigate** [S8].

The wrong folder is the obvious one — bigger, better named, and sitting under `Sales_Enablement/`.
The principle it forced: **a capability you have run yourself beats a broader one you have only
watched**, when both want the same slot [S8].

## ⚠ Live conflict — R8, and it blocks the campaign

`E:\DH-Advanced-Viewer` carries a standing rule, set by Maidul on 2026-07-26: **"DH PACS and the
DHV Workstation are out of scope for this product's sales material"** [S8].

`DHS_BRAND_STRATEGY.md` §12 records this as **risk R8** and states the rule **must be revised**,
because the Surgeon Chain only works if post-processing and DH PACS are sold as **one thing** [S2].

Both are current. Both are written down. They cannot both hold, and the campaign
([PROG-003](../org/programs/adpp-campaign.md)) cannot write its lead message until one gives way.
**This is the single most consequential unresolved item on the north-star path**, and it is exactly
the class of contradiction this Wiki exists to surface.

## Risks

| # | Risk | State |
|---|------|-------|
| **R4** | **Inobitec marketing-use permission is NOT IN WRITING** | 🔴 First blocker. The campaign markets a borrowed capability against a 61-day clock. |
| **R8** | The out-of-scope rule contradicts the Surgeon Chain | 🔴 Blocks the lead message. See above. |
| **R7** | "Advanced" names both category and product | 🟡 Naming pass before volume production |
| **R3** | PRD-004 is a regulatory step *down* from certified Inobitec | 🟢 Only bites at engine migration |

## Related

[Selling the first licence](./selling-the-first-licence.md) · [org/business.md](../org/business.md) ·
[org/north-star.md](../org/north-star.md) · [PROG-003 campaign](../org/programs/adpp-campaign.md)

## Sources

| # | Source card / repo file |
|---|---|
| S1 | `raw/_cards/dhs-pacs-context-map.md` |
| S2 | `raw/_cards/dhs-brand-strategy.md` (§12 risk register) |
| S6 | `raw/_cards/inobitec-sales-enablement.md` |
| S7 | `raw/_cards/dh-advanced-viewer-context-map.md` |
| S8 | `projects/MIMP-008-dh-advanced-viewer/customer-facing-sales-docs.md` |
| S9 | `projects/MIMP-008-dh-advanced-viewer/sales-enablement-answer-bank.md` |
