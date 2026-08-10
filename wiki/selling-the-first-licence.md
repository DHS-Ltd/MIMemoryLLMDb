---
name: selling-the-first-licence
description: Everything bearing on the north star — sell one Advanced DICOM Image Viewer licence by 2026-10-10 — assembled from the four repos that each hold part of it
aliases: [north-star-licence, first-licence]
---

# Selling the first licence

> **Sell one licence of the [Advanced DICOM Image Viewer](./advanced-post-processing.md) by
> 2026-10-10.** Set 2026-08-10. 61 days. Any account.

One licence, not a pipeline — deliberately the smallest thing that proves the whole Surgeon Chain
is real: that a hospital will pay for Advanced Post-Processing **as a licence**, which is the claim
the entire 2026-08-03 repositioning rests on.

## Why this target is coherent, not a swerve

The DH PACS **sale** failed; the product did not. Three documented failure modes [S3, S5]:

1. **The category had no pull** — patient-record delivery had to be hospital-*pushed*; the market
   research itself records *"low patient expectation."*
2. **Standard Tier connected centres but produced almost no revenue** — Cumilla: **56 enrolments
   across 5 centres (~11 each)**, ~1.4 referring doctors per centre, against **~1,257 patients at
   Ibn Sina where forwarding is automatic**. Line 1 depends on the weaker mechanic (R5).
3. **Follow-ups went cold** — serious enough that a CRM was designed and built 2026-08-06 → 08
   around **Going Cold** (a promise broken) and **Going Quiet** (a promise never made).

This north star attacks the *other* revenue line. **Line 2 — the Advanced Post-Processing licence**
is high value and lower volume, sold to the hospital as a **licence, not a subscription and not per
study** [S1]. It also attacks **R1** directly: surgeon adoption is unproven at ~1.4 doctors per
centre, and post-processing is the surgeon's actual buying trigger — so selling it *is* the proof
pilot ADR-0002 says is required before the network claim may appear in external copy [S3].

## Who the copy is written at

**P1 — the Centre Owner / MD.** Decided 2026-08-10.

"Serve the surgeon" is the **positioning**; the **centre** is who DHS sells to. ADR-0002 settled
this when it rejected doctor-first as the primary motion — *"mass doctor recruitment is expensive
for a small team, doctors do not pay, and an empty dashboard churns"* [S3].

| Persona | Role |
|---------|------|
| **P1 Centre Owner / MD** | **Primary.** A new billable line, plus surgeons who route patients back to you |
| **P2 Surgeon** | The **argument**, never the recipient of the lead message |
| **P6 Technologist** | The **evaluation** stage — Answer Bank and clips are the proof pack, not the opener |

⚠ The Answer Bank's *"radiographer"* is a **capacity-constrained persona, a different thing** from
P6 [S7]. Reusing its copy verbatim in owner-facing material misaddresses the reader.

## Candidate accounts — account-agnostic by decision

| Candidate | State | Why |
|-----------|-------|-----|
| **Popular Diagnostic** | 🟡 **Warmest** | Proposal open since 2026-07-03, cited Cumilla only (correct tier-matched proof), and **already asked for the Head of Technologist** — the PRD-003 evaluation persona [S1] |
| **Cumilla** | 🟢 Installed base | Standard tier, connected but commercially weak — a Line 2 upsell into an existing relationship |
| **Ibn Sina** | ⚪ Enterprise already | Buys Enterprise; the *Cancer Centre* expansion is **stalled** since June |

Each account that engages becomes a CRM **Opportunity** with a Stage Set — the brain holds neither
records nor identity [S5].

## Blockers, in order

| # | Blocker | Why it gates |
|---|---------|--------------|
| **R4** | **Inobitec marketing-use permission is NOT IN WRITING** | You are making a *borrowed* capability the company's one measurable objective. A phone call and an email confirmation, not a project. **Week one.** |
| **R8** | `E:\DH-Advanced-Viewer`'s rule — *"DH PACS and the DHV Workstation are out of scope for this product's sales material"* — contradicts the Surgeon Chain, which only works if they are sold as one thing | The campaign cannot write its lead message until this is resolved. Both rules are current and written down [S2, S8] |
| **R7** | "Advanced" names both the category and the product | Every asset inherits it; naming pass before volume production |
| **R2** | Cumilla's numbers are unlabelled — *"100+ patients at one centre"* vs *"56 across 5 centres"*, both customer-facing | Define the metric before either number is used again [S2] |

## What is already built

You are not starting cold. Ready now: the **three-document funnel** (Lead Sheet → Brochure →
Capability Dossier), the **11-clip series** with six clips on real Ibn Sina footage and zero new
recordings required, and social stills in `E:\DHS-PACS\Marketing\Resources_Social_Media/`
[S8, S9].

**Not built:** the campaign plan itself. It is Commercial Content and belongs in `E:\DHS-PACS`
(ADR-0001) — not in this repo, and not in `E:\DH-Advanced-Viewer` either.

## 🔒 Two hard gates on any asset

- **Figures only from own captures**, redacted mask-then-crop. Vendor frames carry the vendor title
  bar and are banned for prospects who do not already know the vendor [S8]. See
  [advanced-post-processing](./advanced-post-processing.md#-figure-sourcing--a-trap-with-an-obvious-wrong-answer).
- **Tier-matched proof, never crossed.** Ibn Sina ⇒ Enterprise only; Cumilla ⇒ Standard only.
  Citing Ibn Sina to support free installation is false — they bought workstation licences at
  ~300k BDT/unit. `master proof point` is a **banned term** [S1].

## What would prove it

One signed Line 2 licence, any account, by 2026-10-10. Tracked in `registry.json` as
`products.PRD-003.relationships[0].deadline` and surfaced by `whats_next` as ★ NORTH STAR.

## Related

[Advanced Post-Processing](./advanced-post-processing.md) ·
[PROG-003 campaign](../org/programs/adpp-campaign.md) · [org/north-star.md](../org/north-star.md)

## Sources

| # | Source card / repo file |
|---|---|
| S1 | `raw/_cards/dhs-pacs-context-map.md` |
| S2 | `raw/_cards/dhs-brand-strategy.md` |
| S3 | `raw/_cards/adr-serve-the-surgeon.md` |
| S5 | `raw/_cards/dhs-crm-context.md` |
| S7 | `raw/_cards/dh-advanced-viewer-context-map.md` |
| S8 | `projects/MIMP-008-dh-advanced-viewer/customer-facing-sales-docs.md` |
| S9 | `projects/MIMP-008-dh-advanced-viewer/sales-enablement-answer-bank.md` |
