<!-- BRAIN LAYER | org/programs/adpp-campaign.md | Program (non-code, operational). Cites; does not assert (ADR-0006). -->

# Program: Advanced Post-Processing Marketing Campaign

| Field | Value |
|-------|-------|
| Type | Program (operational, non-code) |
| Entity | DHS · Product **PRD-003** (Advanced DICOM Image Viewer) |
| Goal | Generate demand to land **1 licence by 2026-10-10** — the north star |
| Stage | **Planning** |
| **Authority** | `E:\DHS-PACS` — a campaign is Commercial Content (ADR-0001) |
| Created | 2026-08-10 |

## ⚠ Where this campaign's plan must live — and why it is not here

A marketing campaign is **Commercial Content** by definition: DHS-PACS ADR-0001 scopes that term to
*"marketing plans, positioning, pricing, official channel posts, pitch decks, and customer
proposals"*, and states the routing test is content **type, not audience** — internal GTM notes
count too.

So: **the campaign plan itself belongs in `E:\DHS-PACS`, not in this file.** This page is a *citing
index* — it records that the campaign exists, what binds it, and where its artefacts live. If
campaign copy, channel plans or budgets ever appear in this repo, that is a routing defect and
mechanical lint should flag it (ADR-0006).

## 🚫 Hard gate before any spend or publication

**R4 — the Inobitec marketing-use permission is recorded as NOT IN WRITING.**

The campaign markets a capability DHS resells, not one it owns. Publishing campaign material at
volume, using clips derived from the vendor's product, without written marketing-use permission is
the single largest exposure on this north-star. **Clear R4 first.** It is a phone call and an email
confirmation, not a project — and there are 61 days on the clock.

## Assets that already exist (do not rebuild these)

In `E:\DH-Advanced-Viewer\Inobitec\`:

| Asset | What it is |
|-------|-----------|
| `Client_Facing_Docs/` | *Advanced DICOM Image Viewer — 3D & Vascular Lead Sheet* (PDF + HTML), Brochure, Vascular Dossier |
| `Client_Facing_Clips/` | 12+ capability-named clips — vessels with anatomy retained, bone strip, stenosis measurement, MIP cleanup, report measurements, branded print layout, branch detection, liver/vein separation |
| `Sales_Enablement/` | Answer Bank — operational, **1 of 24** Action Demos complete; `WORKLIST.md` holds the rest |
| `E:\DHS-PACS\Marketing\Resources_Social_Media/` | CT brain perfusion, upper-limb/neck angiogram stills |

## 🔒 PHI gate — campaign-critical

The source corpus is **real patient studies**. Two rules recorded in
`E:\DH-Advanced-Viewer\CONTEXT-MAP.md`:

- **`_frames/` storyboard extractions may never reach a customer** — every frame carries Inobitec
  branding in its title bar.
- **`Inobitec_Clip_Process/` clips are NOT customer-ready** — they are edited cuts of real Ibn Sina
  studies, not yet redacted to Client-Facing Clip standard. Protocol-only filenames do **not** imply
  de-identified on-screen content.

Only `Client_Facing_Clips/` and `Client_Facing_Docs/` are cleared for customer use.

## Constraints this campaign inherits

From `E:\DHS-PACS\CONTEXT-MAP.md` and `DHS_BRAND_STRATEGY.md` (2026-08-03):

- **Brand the capability, not the engine.** Market *DH Advanced Post-Processing*. Never claim DHS
  built it; never conceal that a specialist engine is involved; never name the vendor in
  customer-facing material as if it were the product.
- **Serve the surgeon.** The radiologist is a *deliberate non-persona*.
- **Tier-matched proof.** Ibn Sina ⇒ Enterprise only; Cumilla ⇒ Standard only. Never crossed.
- **Banned terms:** `master proof point` · unqualified `end to end` · `referral network` ·
  `teleradiology` · naming BDC/Facility in any Commercial Content.
- **R7 naming collision** — "Advanced" names both the category and the product. Every asset written
  from here inherits it. A naming pass should precede volume production.

## Audience — decided 2026-08-10

**Primary: P1 — the Centre Owner / MD.** The copy is written at the person who signs.

**Why not the surgeon, when the strategy says "serve the surgeon":** because those are different
questions. *Serve the surgeon* is the **positioning**; the **centre** is who DHS sells to. ADR-0002
settled this explicitly when it rejected doctor-first as the primary motion — *"mass doctor
recruitment is expensive for a small team, doctors do not pay, and an empty dashboard churns.
Centre-first with catchment compounding captures most of the network effect at no additional sales
cost."* With 61 days and a one-licence target, aiming anywhere but the signature wastes the window.

How the three personas divide:

| Persona | Role in the campaign |
|---------|----------------------|
| **P1 — Centre Owner / MD** | **Primary.** The audience the copy addresses. Message: a new billable line, plus surgeons who route patients back to you. |
| **P2 — Surgeon** | The **argument**, not the audience. Surgeon pull is *why* the owner should care. Never the recipient of the lead message. |
| **P6 — Technologist** | The **evaluation** stage. The Answer Bank and 12 clips are the proof pack once the owner engages — not the opener. |

⚠ Watch the persona trap `CONTEXT-MAP.md` flags: the Answer Bank's *"radiographer"* is a
**capacity-constrained persona, a different thing** from P6. Reusing its copy verbatim in
owner-facing material will misaddress the reader.

## Target

**Account-agnostic by decision (2026-08-10).** One licence, any account — a *market-validation*
target rather than an account plan, which is the honest shape for a category whose surgeon adoption
is still unproven (R1).

| Candidate | State |
|-----------|-------|
| **Popular Diagnostic** | 🟡 **Warmest.** Proposal open since 2026-07-03; already asked for the Head of Technologist — the PRD-003 evaluation persona |
| **Cumilla** | Standard, connected, commercially weak — an installed base to upsell Line 2 into |
| **Ibn Sina Cancer** | 🔴 Stalled since June; treat as Dormant with a revisit date |

Each account that engages becomes a CRM **Opportunity** with a Stage Set
(`E:\DHS-PACS\docs\CRM\CONTEXT.md`) — the brain holds neither records nor identity.

## Linked nodes

- Product → `PRD-003` (north star); succeeded by `PRD-004` (DHDicomAnalyzerPro)
- Projects → MIMP-008 (`E:\DH-Advanced-Viewer` — assets), MIMP-004 (`E:\DHS-PACS` — Authority)
- Position → `../north-star.md` · Chain and tiers → `../business.md`

## Sources

`E:\DHS-PACS\CONTEXT-MAP.md` (2026-08-06) · `E:\DHS-PACS\docs\adr\0001-dhs-pacs-as-commercial-content-hub.md` ·
`E:\DHS-PACS\docs\MarketingStrategy\DHS_BRAND_STRATEGY.md` §10, §12 (2026-08-03) ·
`E:\DH-Advanced-Viewer\CONTEXT-MAP.md` · `E:\DH-Advanced-Viewer\Inobitec\Sales_Enablement\README.md` (docsVersion 1.3)
