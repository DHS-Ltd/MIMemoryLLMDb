<!-- BRAIN LAYER | org/business.md | Cited index of DHS. Authority lives in the repos — see ADR-0006. -->

# DH Solutions Ltd — Business Index

> **This file cites; it does not assert** (ADR-0006). Every claim names the Source that owns it.
> Authority for Commercial Content is `E:\DHS-PACS` per its own ADR-0001 [S4]. If this file and a
> Source disagree, **the Source wins** — and the disagreement is a lint defect, not a judgement call.
>
> Rebuilt **2026-08-09**, replacing the 2026-06-02 version, which was superseded on 2026-08-03 and
> wrong on six counts (see §7).

## 1. Identity

**DH Solutions Ltd (DHS)** — healthcare company serving the Bangladesh medical-imaging market. [S1]

Mission, vision, USP and the relationships-first differentiators carry forward unchanged from
`DHS Business_Initial_Plan.md`, which was marked **HISTORIC as brand doctrine** on 2026-08-03 while
remaining valid as the record of the company's origin. [S2 §13]

## 2. The strategic insight — the whole strategy in one line

> **The radiologist writes the report. The surgeon treats the patient. Nobody in Bangladesh serves
> the surgeon.** [S2 §1]

At least 30 Bangladeshi companies sell radiology reporting and teleradiology. They compete on cost
and all serve the radiologist or the hospital's reporting obligation. The surgeon decides whether
and where to operate, needs the study post-processed for a specific finding, and **cannot produce
that himself**. [S2 §1, S3]

## 3. Business Pillars (supersedes the three activity lines)

| Pillar | What it is | Note |
|--------|-----------|------|
| **Build** ⭐ | DH-produced software: DH PACS, DHV, DHDicomAnalyzerPro | **Prime pillar** — flagship, in-house, revenue-generating |
| **Supply** | Medical equipment & accessories | |
| **Service** | Installation, maintenance & training expertise | Was previously mis-filed as a customer benefit, not a pillar |
| **Facility** | The BDC diagnostic centre | Active business, **banned from all Commercial Content** |

Decided 2026-08-03. Explicitly supersedes the three "niches" in `DHS Business_Initial_Plan.md`. [S1]

⚠ **Reversal of the old thesis.** The 2026-06-02 brain recorded a flywheel of *SaaS → trust →
equipment as the long-term revenue anchor*. That is superseded: **Build is prime**, not a stepping
stone to Supply. [S1]

**Brand architecture — Endorsed House:** DHS is the master brand and the trust asset; DH PACS, DHV
and DHDicomAnalyzerPro are named sub-brands that visibly inherit it. Chosen because all four pillars
sell to the same buyer, and the company brand is the only thing that makes cross-sell work — and the
only thing that survives a white-label. [S1]

## 4. The Surgeon Chain — the core value chain

```
CT/MRI patient → Advanced Post-Processing → DH PACS → Surgeon → Patient
```

Articulated 2026-08-03. [S1, S2 §4]

**Advanced Post-Processing** is the engine slot: segmentation, 3D reconstruction, vascular analysis,
biomodeling. Filled by **Inobitec today** (resold as "Advanced DICOM Image Viewer"), to be replaced
by **DHDicomAnalyzerPro**. Same slot, sequenced — not competing products. It is also a **new billable
line for the hospital**, not merely a DHS product. Branding rule: **brand the capability, not the
engine** — DHS markets the outcome, never claims to have built the engine, and never conceals that a
specialist engine is involved. [S1]

**Category: Advanced Connected Imaging Network.** *Advanced* = post-processing; *Connected* = study →
surgeon → patient; *Network* = compounds by catchment. **Supersedes** the earlier claim *"the patient
as complete owner of their imaging record"* — patient ownership is now the **mechanism**, not the
headline. [S1, S3]

## 5. Products (the structural gap in registry v2.0)

| Product | Engineering repos | Registry today |
|---------|-------------------|----------------|
| **DH PACS** (flagship) | `E:\DHS-PACS` (also Commercial Hub), `dh-pacs-website`, `E:\DHPacs` | MIMP-004 (path broken), MIMP-006, MIMP-007 |
| **DHV** (DH Viewer) | `E:\DHV-Weasis` (desktop), OHIF web track | MIMP-005 |
| **DHDicomAnalyzerPro** | `E:\DH-Advanced-Viewer` (3D Slicer based) | **unregistered** |

One product spans several repos, and one repo serves several products. `business_unit: "pacs"` is a
string pretending to be a node — recorded as the open structural question in
`docs/Phase3-Wiki/wiki-build-plan.md`.

⚠ `DHDicomAnalyzerPro` supersedes the pre-rescaffold name `DHDicomAnalyzer` (2026-07-27). [S1]

## 6. Commercial structure

**Two tiers** [S1]

| Tier | Offer | Proof |
|------|-------|-------|
| **Standard** | No hardware at site — the centre's existing PACS adds one outbound destination; free installation; per-patient billing; Doctor Dashboard free | **Cumilla** — 5 centres, 56 enrolments, 7 referring doctors (Jul 2026) |
| **Enterprise** | Licensed, charged, on-prem under the hospital's own branding, DH-maintained | **Ibn Sina** — 7 DHV Workstations, 5 centres, ~1,257 patients since Feb 2026 |

**Tier-matched proof (hard rule):** a proof point may be cited **only** for the tier it bought. Ibn
Sina proves Enterprise; Cumilla proves Standard; **they are never crossed** — citing Ibn Sina to
support free installation is false, because Ibn Sina bought workstation software licences
(~300k BDT/unit). This supersedes the old *"Ibn Sina as master proof point, in every first touch"*
rule, and `master proof point` is now a **banned term**. [S1]

**Two revenue lines** [S1]

- **Line 1 — per-patient link enrolment:** low value, high volume. Patient opts in, the hospital
  bills it and pays DHS per enrolled patient, keeping the spread.
- **Line 2 — Advanced Post-Processing licence:** high value, lower volume. Sold to the hospital as a
  **licence, not a subscription and not per-study**.
- **The surgeon pays nothing.** The Doctor Dashboard is free because the surgeon's role is to drive
  volume, not to be billed.

**Doctor Dashboard:** every doctor referring to a connected centre gets a free account; their
patients' complete studies appear automatically. Commercially a **referral moat**, not a convenience
feature. Absent from every brand document before July 2026. [S1]

**Go-to-market — centre-first, catchment compounding:** win one centre in a catchment → onboard its
surgeons (dashboards populated day one, so no cold start) → those surgeons also refer to competing
centres → approach those competitors, who are now negotiating with surgeons who already expect
prepared studies → next catchment. Sales chain differs by tier: Enterprise runs IT → Management →
Surgeons; Standard runs Owner → light IT → counter staff, surgeon relationship in parallel. [S2 §11]

## 7. What this file previously got wrong

| The 2026-06-02 brain asserted | Corrected |
|---|---|
| 3 activity lines; flywheel SaaS → trust → **equipment anchor** | 4 Business Pillars; **Build is prime** [S1] |
| BDC = proof/credibility engine backing the sale | Facility pillar; **banned from all Commercial Content** [S1] |
| North star: *land* the first PACS sale to Ibn Sina by Jul 2026 | Ibn Sina has been deployed since **Feb 2026**; see `north-star.md` for what actually failed |
| "Ibn Sina as **master proof point**" | **Banned term**; tier-matched proof [S1] |
| Category = patient as complete owner of imaging record | **Advanced Connected Imaging Network**; ownership is the mechanism [S3] |
| Products: PACS, HMS | DH PACS, DHV, DHDicomAnalyzerPro (+ HMS, internal to Facility) |

## Sources

| # | Source | Dated |
|---|--------|-------|
| S1 | `E:\DHS-PACS\CONTEXT-MAP.md` | 2026-08-06 (decisions 2026-08-03) |
| S2 | `E:\DHS-PACS\docs\MarketingStrategy\DHS_BRAND_STRATEGY.md` | 2026-08-03 |
| S3 | `E:\DHS-PACS\docs\adr\0002-serve-the-surgeon-not-the-radiologist.md` | 2026-08-03 |
| S4 | `E:\DHS-PACS\docs\adr\0001-dhs-pacs-as-commercial-content-hub.md` | 2026-08-03 |

Source cards with SHA-256 land in Phase 1.3 (`raw/_cards/`, ADR-0007); until then these citations
are path + date only and **cannot be drift-checked**.
