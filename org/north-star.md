<!-- BRAIN LAYER | org/north-star.md | Current position. Cites; does not assert (ADR-0006). -->

# DHS — Current Position

> Rebuilt **2026-08-09** from Sources dated 2026-06-20 → 2026-08-08. The previous version
> (2026-06-02) named a north-star whose deadline passed on 2026-07-31 with nobody told;
> `whats_next` would have flagged it correctly — it was never run.

## 1. What actually happened: the sale failed, the product did not

**DH PACS is not discarded.** It is the company flagship under **Build, the prime pillar**, and the
middle link of the Surgeon Chain [S1]. What failed was the **sales motion**, on three counts, each
recorded with field evidence:

| # | What failed | Evidence | Source |
|---|---|---|---|
| 1 | **The category had no pull.** "Patient as complete owner of their imaging record" had to be pushed — the market research itself records *"low patient expectation… has to be hospital-push."* A category you must push is expensive to establish. | market research §6.1 | S3 |
| 2 | **Standard Tier connected centres but produced almost no revenue.** Cumilla: **56 paid enrolments across 5 centres (~11 per centre)** and **~1.4 referring doctors per centre** — against **~1,257 patients at Ibn Sina, where forwarding is automatic**. The mechanic works when automatic and underperforms when it depends on a counter opt-in. Line 1 revenue depends on the weaker mechanic. | Cumilla vs Ibn Sina deployment comparison | S3, S2 R5 |
| 3 | **Follow-ups went cold.** No system tracked what DHS owed whom. Serious enough that a CRM was designed and built 2026-08-06 → 08 around two named failure modes — **Going Cold** (a promise broken) and **Going Quiet** (a promise never made). | CRM doctrine | S5 |

**What replaced it** — decided 2026-08-03 [S1, S3]:

- **Serve the surgeon, not the radiologist.** The radiologist is a *deliberate non-persona*.
- **Category → Advanced Connected Imaging Network.** Patient ownership demoted from claim to mechanism.
- The surgeon need is **pulled, not pushed**: a surgeon feels the absence of a prepared study weekly.
- It is the one position the ~30 reporting companies cannot cheaply copy — it needs post-processing
  capability, trained technologists, a connectivity platform, and surgeon relationships.
- It gives the hospital a **billable line**, not just a service improvement.

## 2. Where each deal actually stands

| Account | Tier | Status |
|---------|------|--------|
| **Ibn Sina** | Enterprise | **Live since Feb 2026** — 7 DHV Workstations, 5 centres, ~1,257 patients [S1]. |
| **Ibn Sina Cancer & Diagnostic Center** | Enterprise (proposed) | 🔴 **STALLED — no movement.** Federated expansion proposed 2026-06-20, terms in ADR-0005 [S6]. Treat as CRM **Dormant** and set a revisit date — Dormant is the only stage exit and it carries its own re-entry. Status reported by Maidul, 2026-08-10. |
| **Cumilla** | Standard | **Connected but commercially weak** — 5 centres, 56 enrolments, 7 referring doctors (Jul 2026) [S1]. This is the R5 evidence. |
| **Popular Diagnostic** | — | 🟡 **OPEN — awaiting response** since the proposal of 2026-07-03. Cited Cumilla only, correctly following tier-matched proof; next step requests the Head of Radiology **and the Head of Technologist**. [S1, S7] **The warmest candidate for the north-star licence** — it already asked for the technologist, which is the PRD-003 evaluation persona. Status reported by Maidul, 2026-08-10. |

⚠ **Both non-live accounts are the CRM's two named failure modes in the wild.** Ibn Sina Cancer is
**Going Quiet** (a promise never made — no Next Action date, no interaction for far longer than a
fortnight). Popular Diagnostic is at risk of the same: a proposal issued five weeks ago with no
recorded follow-up. This is precisely what the CRM was built for — both need a Next Action date.

## 3. The north star

> ## Sell **one licence** of the Advanced DICOM Image Viewer by **2026-10-10**.
>
> Set **2026-08-10** (two months). Registry: `products.PRD-003.north_star = true`,
> deadline scanned by `whats_next` via `PRD-003.relationships[0].deadline`.

**One licence, not a pipeline.** The target is a single closed Line 2 sale — deliberately the
smallest thing that proves the whole Surgeon Chain is real: that a hospital will pay for Advanced
Post-Processing as a licence, which is the claim the entire 2026-08-03 repositioning rests on. It
also directly attacks **R1** (surgeon adoption unproven), because a surgeon pulling for prepared
studies is what makes a centre buy.

**Account-agnostic by decision (2026-08-10).** No target account is named — any account counts. That
makes this a *market-validation* target rather than an account plan, which is the honest shape for a
category whose surgeon adoption is still unproven (R1). Warm candidates: Cumilla (Standard,
connected), Popular Diagnostic (proposal 2026-07-03). Ibn Sina already buys Enterprise.

**The mechanism is a marketing campaign** — registered as **PROG-003-adpp-campaign**, stage
*planning*. See `programs/adpp-campaign.md`. Its plan and copy belong in `E:\DHS-PACS` (Commercial
Content, ADR-0001); the brain holds only the citing index.

**Two months is short given R4 is unresolved.** The Inobitec marketing-use permission is not in
writing. Running a *campaign* for a borrowed capability against a 61-day clock without that in hand
is the single largest exposure on this north-star — **clear it in week one, before any spend or
publication.**

**Which product this is, precisely.** "Advanced DICOM Analyzer" is ambiguous in DHS's own
vocabulary — this is risk **R7**. The north-star is the **Inobitec resale**, marketed as
**Advanced DICOM Image Viewer**. It is **not** DHDicomAnalyzerPro (PRD-004), which has no code:
`E:\DHDAPro\Src` does not exist, Phase 1 dev environment is unstarted, and UX-Foundation has been
parked since 2026-08-03.

**Why this is coherent with the strategy rather than a departure:**

- It **is** the Advanced Post-Processing slot in the Surgeon Chain — the thing that makes DHS serve
  the surgeon rather than the radiologist. [S3]
- It drives **Line 2 — the high-value licence**, not the per-patient Line 1 that just underperformed
  at Cumilla (~11 enrolments per centre). It attacks the revenue line that works.
- It is the one capability the ~30 reporting companies cannot cheaply copy. [S2 §1]
- It is **sellable today**: certified product, and the sales apparatus already exists —
  `Sales_Enablement/ANSWER-BANK.md`, `Clip_Specs/`, `Client_Facing_Clips/`, `Client_Facing_Docs/`,
  `WORKLIST.md` in `E:\DH-Advanced-Viewer\Inobitec\`.
- It sells the hospital a **new billable line**, not a service improvement. [S3]

**Branding rule applies unchanged:** market the capability as *DH Advanced Post-Processing*; the
engine is an implementation detail that may change. Never claim DHS built it; never conceal that a
specialist engine is involved. This is what lets PRD-004 replace PRD-003 later with no brand break. [S1]

### Blockers, in order

| # | Blocker | Why it gates the north-star |
|---|---------|------------------------------|
| **R4** | **Inobitec marketing-use permission is not in writing.** | You are about to make selling a borrowed capability the company's primary goal. This is the first thing to clear, and it is a phone call, not a project. |
| **R7** | "Advanced" names both the category and the product. | Every piece of sales copy written from here inherits the collision. Needs a naming pass before volume selling. |
| **R1** | Surgeon adoption unproven (~1.4 doctors/centre). | Still open — but note this north-star **attacks R1 directly**: post-processing is the surgeon's buying trigger, so selling it *is* the proof pilot. |
| **R3** | DHDicomAnalyzerPro's regulatory step-down. | Deferred, not urgent — it only bites at engine migration. Selling the certified product first is the lower-risk order. |

### What this de-prioritises

R5 (fix the Line 1 counter opt-in mechanic) drops below the line. Line 1 is the weaker mechanic;
this north-star bets on Line 2 instead. Recorded so the choice is visible rather than accidental.

## 4. Open risk register (verbatim status, 2026-08-03) [S2 §12]

| # | Risk | Status |
|---|------|--------|
| R1 | Surgeon adoption unproven (~1.4 doctors/centre) | **Open** — needs proof pilot |
| R2 | Cumilla data integrity — "100+ patients at one centre" vs "56 across 5 centres", both customer-facing, neither labelled | **Open** — define metrics before either number is used again |
| R3 | Regulatory step-down: Inobitec certified, DHDicomAnalyzerPro ships as non-diagnostic aid pending DGDA | **Open** |
| R4 | Borrowed capability — Inobitec marketing permission not yet in writing | **Open** |
| R5 | Counter opt-in mechanic underperforms; Line 1 depends on it | **Open** |
| R6 | Capex wedge weakened — Line 2 licence reintroduces the capital ask free installation removed | **Managed** |
| R7 | "Advanced" appears in both the category and the Inobitec-resale product name | **Open** — needs a naming pass |
| R8 | DH-Advanced-Viewer's *"DH PACS out of scope for this product's sales material"* rule contradicts the Surgeon Chain | **Open** — that rule must be revised |

## 5. To confirm

1. ~~The north-star~~ — **confirmed and made measurable 2026-08-10**: 1 licence by 2026-10-10 (§3).
   Remaining gap: **which account?** No target account is named. Cumilla and Popular Diagnostic are
   the warm ones; Ibn Sina already buys Enterprise. Naming it turns this into a CRM Opportunity.
2. **Ibn Sina Cancer Centre expansion** — did the June proposal close, stall, or lapse?
3. **Popular Diagnostic** — outcome of the July proposal.
4. **BDC / Facility** — `entities/bdc.md` people and roles have been flagged TO VERIFY since June,
   and BDC's role changed materially (banned from Commercial Content).
5. **Do Programs survive** as a node type, or do Business Pillars replace them?

## Sources

| # | Source | Dated |
|---|--------|-------|
| S1 | `E:\DHS-PACS\CONTEXT-MAP.md` | 2026-08-06 |
| S2 | `E:\DHS-PACS\docs\MarketingStrategy\DHS_BRAND_STRATEGY.md` §11–§13 | 2026-08-03 |
| S3 | `E:\DHS-PACS\docs\adr\0002-serve-the-surgeon-not-the-radiologist.md` | 2026-08-03 |
| S5 | `E:\DHS-PACS\docs\CRM\CONTEXT.md` | 2026-08-08 |
| S6 | `E:\DHS-PACS\docs\IbnSinaCancerPacs\adr\0005-ibnsina-enterprise-commercial-posture.md` | 2026-06-20 |
| S7 | `E:\DHS-PACS\Marketing\Popular_Diagnostic\Popular_Diagnostic_Proposal.md` | 2026-07-03 |
