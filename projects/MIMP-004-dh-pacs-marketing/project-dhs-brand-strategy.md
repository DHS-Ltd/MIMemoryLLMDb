---
name: dhs-brand-strategy
description: Company-level brand strategy set 2026-08-03 — DHS serves the SURGEON not the radiologist; category is Advanced Connected Imaging Network; supersedes the patient-ownership category claim in CLAUDE.md
metadata: 
  node_type: memory
  type: project
  originSessionId: 01f6b097-aa5c-4b32-aafe-6ddcaa78db47
  modified: 2026-08-03T03:30:19.057Z
aliases: [dhs-brand-strategy, dhs_brand_strategy]
---

The DH Solutions Ltd brand strategy was set on **2026-08-03** and lives at
`docs/MarketingStrategy/DHS_BRAND_STRATEGY.md`, with the pivotal decision recorded as
[ADR-0002](../../../../E:/DHS-PACS/docs/adr/0002-serve-the-surgeon-not-the-radiologist.md).
Canonical vocabulary is in `CONTEXT-MAP.md`.

**The core insight:** the radiologist writes the report but does not treat the patient; the
surgeon treats and needs the study post-processed for his specific finding, which he cannot
produce himself. ~30 Bangladeshi reporting/teleradiology companies all serve the radiologist
and compete on cost. **DHS serves the surgeon.** The radiologist is a deliberate non-persona.

**Locked decisions:**
- **Business Pillars** — Supply · Facility · Build · Service. **Build is prime.** (Facility = BDC,
  internal only, never in Commercial Content.)
- **Endorsed House** — DHS is the master brand and trust asset; DH PACS / DHV /
  DHDicomAnalyzerPro are named sub-brands. "DH PACS — by DH Solutions Ltd."
- **The Data Chain** — "end to end" is scoped to scan → screen, NEVER the equipment chain.
  Equipment-chain ambition is internal strategy only, never first-meeting copy.
- **Category: Advanced Connected Imaging Network.** Supersedes "patient as complete owner of
  their imaging record" — patient ownership is now the *mechanism*, not the claim.
- **The Surgeon Chain** — CT/MRI patient → Advanced Post-Processing → DH PACS → Surgeon → Patient.
- **Brand the capability, not the engine** — market "DH Advanced Post-Processing"; the engine
  (Inobitec now → DHDicomAnalyzerPro later) is a swappable implementation detail.
- **The Promise (hybrid)** — "the standard views are already waiting; ask for anything more."
- **Two tiers, tier-matched proof** — Standard (proof = Cumilla) / Enterprise (proof = Ibn Sina).
  **Never cross the proofs.** Ibn Sina bought licences, so it cannot prove free installation.
- **Two revenue lines** — L1 per-patient link enrolment (per-use); L2 post-processing sold as a
  **software licence** to the hospital. Surgeon pays nothing by design.
- **GTM** — centre-first sales, catchment compounding. Three-layer sales chain is
  **Enterprise-only**; Standard chain is Owner → light IT → counter staff.
- **Personas P1–P6**, priority P2 → P6 → P1 → P3 → P4 → P5. P6 (Medical Technologist) is new.

**Why:** The old positioning was a distributor brand (`DHS Business_Initial_Plan.md`) with a
patient-ownership category that the market research itself admitted had to be *pushed* ("low
patient expectation"). The surgeon need is *pulled*, is unserved, gives the hospital a billable
line, and creates a catchment network effect no reporting company can cheaply copy.

**Documentation rollout — done 2026-08-03:** `CLAUDE.md`, `DH_PACS_BRAND_VOICE.md`, and
`DH_PACS_CUSTOMER_CONNECTION_GUIDE.md` are all updated to the new strategy.
`DHS Business_Initial_Plan.md` and `PACS_Market_Research_Bangladesh_2026.md` carry HISTORIC
banners (the research doc is *partially* superseded — §1–§4 market data is still valid and
citable; §5 and §6.1–§6.8 are not). **Deferred by user decision to a later session:** the
website (`dh-pacs-website`), `DH_PACS_WEBSITE_CONTENT_SPEC.md`, and viewer/DHV surfaces —
do not touch these until asked. Live status table is §13 of the strategy doc.

**How to apply:** Read `docs/MarketingStrategy/DHS_BRAND_STRATEGY.md` before any positioning,
persona, campaign, or proposal work. Eight open risks are logged in §12; **R1** (surgeon
adoption only ~1.4 doctors/centre at Cumilla — do NOT use network-effect claims in written
external copy until a proof pilot clears a target) and **R2** (two irreconcilable Cumilla
numbers live in customer documents: "100+ within weeks" at one centre vs "56 across 5
centres") are the urgent ones. Also still open: R7 the "Advanced" naming collision, and R8
the DH-Advanced-Viewer rule that keeps DH PACS out of post-processing sales material —
which now contradicts the Surgeon Chain. §6, §7 and §9–§14 of the Customer Connection Guide
are flagged in-doc as not yet revised.
Founder credentials must trace to `Personal_Branding/Maidul_CV/CV_FACT_SHEET.md` — the LinkedIn
170 CT / 119 MRI figures and the title "Regional Head Service Manager" are NOT confirmed.
