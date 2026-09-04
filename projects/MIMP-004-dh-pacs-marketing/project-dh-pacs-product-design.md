---
name: project-dh-pacs-product-design
description: "DH PACS product-design doctrine, started 2026-08-13 — read docs/product_design/ before ANY product, UX, or build decision; Phases 0-1 done, Phase 2 part-done, resume point recorded"
metadata: 
  node_type: memory
  aliases: 
    - project_dh_pacs_product_design
  type: project
  originSessionId: 58bf2763-f262-40ce-964b-c227a3343d8a
  modified: 2026-08-13T16:44:36.691Z
---

Product-design doctrine created in a grill session on **2026-08-13**, from a roadmap.sh Product Design Roadmap triaged against DH PACS's real situation. Lives at `E:\DHS-PACS\docs\product_design\` — `CONTEXT.md` (glossary, 13 terms) · `VISION.md` · `PRINCIPLES.md` · `METRICS.md` · `ROADMAP.md` · `adr/0001`–`0005`. **Read before any product, UX, metric, or build decision.** `CLAUDE.md` now carries a pointer block.

## The finding that reframed everything

**Routing already works.** Once a patient is linked to a referring surgeon, that patient's studies reach his dashboard automatically, including every later one. Only the *recording of that link* is manual (a DHS person, per patient). R1 was wrong three times in a row — "surgeon adoption is unproven" → "automatic routing does not exist" → finally **"the referral graph has no intake."** Phase 2 was renamed from *the routing problem* to *the capture problem* and shrank from building a routing system to capturing one field. `~1.4 referring doctors/centre` at Cumilla measures **DHS's manual link-recording throughput** — not adoption, not delivery.

## Load-bearing decisions, with the reasoning that is easy to lose

- **The Connected Layer is four verbs**, not three: ingest · merge · **orchestrate** · deliver. One clause: *DH PACS moves records and the requests about them; it never creates or interprets pixel data.* The fourth verb exists because The Promise sells *"ask for anything more"* and three verbs left it homeless ([[ADR-0001]]).
- **`VISION.md` is a scope arbiter, not ambition.** A conventional vision statement fails Build Discipline's own gate. It exists to answer "is this DH PACS's job, DHV's, or Advanced Post-Processing's?" — 4-question test, 11 worked examples.
- **Patient Link is built, not borrowed from OHIF** (ADR-0002). Today the patient's link opens a professional radiology viewer; the marketing site sells that as a feature. Decided: DH PACS builds the record view (report in plain language first), viewer one tap behind. Split is *presentation of the record* (DH PACS) vs *rendering of pixels* (DHV).
- **"Automatic" = a named surgeon's Standing Set, never a study-type protocol** (ADR-0003). *User chose this over my protocol-table recommendation and was right*: authoring a protocol table is a clinical judgement by a company whose hard line is that it does not read or report. Seeded in person at onboarding → the surgeon visit must now leave a **configured product** behind, not a demo.
- **The product never forms a clinical opinion.** General form of the above; principle 4. Permanently rules out flagging, ranking, suggesting, specialty defaults.
- **Graph is built at the patient's moment, never the centre's workflow** (principle 1). **The referral-commission ledger was explicitly considered and rejected** — centres already record referrers because they pay ~30% commission, so the data exists, but asking makes DHS a party to the economics it positions against, and it is a HIS/billing integration rather than the one outbound destination P4 agreed to. Recorded as rejected so it is not re-proposed.
- **Referrer capture: DICOM tag first, counter on a miss** (ADR-0004). Selection, never spelling. Every edge records provenance (`asserted_by = dicom_tag | counter | dhs_staff`). ⚠️ **The reach argument for the counter is FALSE** — under Standard tier only opted-in studies are forwarded, so an unenrolled patient's study never reaches DH PACS; forwarding everything is a consent failure, not a config choice. **The graph is capped at enrolment either way.** The counter wins on *conversion*, not reach.
- **Images ship before the report, to both surfaces** (ADR-0005). Key distinction: **availability ≠ presentation** — the patient's link still opens to the record view saying "report pending"; images stay one tap behind. Knowingly accepted: a patient can tap through to greyscale slices of their own body with no interpretation. Makes the **report-pending state the highest-priority Phase 4 usability test**, ahead of the complete-record case.
- **Two SMS to the patient**: link when images land, nudge when the report merges. The second is the highest-value message the product sends. Cost hits Line 1's thin margin; absorption deferred to MachineB.
- **Records accrete within a centre**, keyed on the centre's own patient ID. Cross-centre deliberately separate — a wrong match shows one patient another's imaging, and principle 5 puts record integrity outside the moat trade-off.
- **Billing unit = Patient Entry** (one patient registered, billed once; returning patient = new entry). Stakeholder commission split deferred to the MachineB billing build.

## Metric definitions (closes R2 once numbers are recomputed)

Six-stage funnel replaces the one overloaded word "delivered": received → complete → generated → sent → patient opens → surgeon opens.

- **Study Delivered = a human opened a *Complete* record** (stage 5/6). Never "we sent it" — that adopts the exact last-mile failure the product exists to fix. Partial opens do not count (`record_state` on the event).
- **Enrolment / Paid Enrolment / Settled** are three rows, previously one word. Only Paid Enrolment may be quoted externally, named in full.
- **Active Surgeon = opened ≥1 complete record in trailing 30 days.** Explicitly *not* "onboarded" or "has an account" — that counts DHS's throughput wearing an adoption number's name, the exact R1 error.
- **Routed Study = an edge DHS staff did not record.** Currently **0** while Surgeon Delivery is not. That distance is the moat's build gap expressed as a number, and it is Phase 2's headline metric.
- **Verified Referrer** = an edge whose *provenance* is recorded — not a claim it is correct.

## Risk register rewritten in `DHS_BRAND_STRATEGY.md` §12

**R1** rewritten twice (above) · **R5 escalated** — P5's counter sentence now gates the moat, not just Line 1, so the script card is moat infrastructure · **R8 inverted** — the DH-Advanced-Viewer out-of-scope rule is *correct*; the real gap is that no **DH PACS ↔ Advanced Post-Processing interface contract** exists · **R9 new** — The Promise's automatic half has no mechanism for any surgeon not yet onboarded by hand, and that sentence is being said in the field.

## Resume point

**Phase 2 remainder** (all now aimed at *validating* one mechanism rather than discovering one): assumption map · JTBD for P2 and P6 · journey map of **the study** · target flow + edge cases · interview guide and contextual-inquiry protocol. Alternative branch: **Phase 4's report-pending state** and the P5 script card (now conditional — *sometimes the system asks you, sometimes it does not*, harder to train than a fixed script).

**Deferred by the user's explicit decision:** how a study reaches the surgeon (push vs digest vs login-only). Full analysis parked in `PRINCIPLES.md` → *Still unresolved*, including the constraint most likely to be forgotten — **a WhatsApp message naming a patient is a PHI disclosure to Meta**, so any push must carry no identifying content. Until this is settled, **Active Surgeon is defined but not meaningful**, because it may be measuring the surgeon's memory rather than the product.

**Blocked on MachineB:** measure `ReferringPhysicianName` coverage against real ingested studies **before building ADR-0004** — if coverage is poor the design degenerates into prompting P5 every time, having paid the complexity cost for nothing. Also: SMS cost absorption, billing/commission split, all of Phase 3 (as-built reverse-documentation).

**Blocked on the user:** locate the **Capability Report** (holds the "100+ patients" figure; not in this repo, so R2 cannot close) · **SYNC_SETUP steps 2–4** — `E:\DHS-PACS` is still not under git, so Phase 0's exit criterion (*MachineB can read this doctrine*) is unmet. Steps 0–1 are done: `.gitignore` written.

**Flag to settle before MachineB builds billing:** if any commission in the bill can reach a **referring doctor**, it breaks P1's message (*"volume that does not cost 30%"*) and the reason "referral network" is a banned term. Centre↔DHS splits are fine.

## PHI cleanup — done 2026-08-13

`Marketing/Popular_Diagnostic/` moved intact to `E:\DHS-Archive\Popular_Diagnostic\` (outside the repo, never to be edited or committed — it is the record of a real sent proposal), path gitignored as defence in depth, and `Marketing/STANDARD_TIER_PROPOSAL_TEMPLATE.md` written in its place carrying case shape only with blank number placeholders. **A fifth identifier had been missed** in SYNC_SETUP's original table: the proposal named the reporting radiologist — it reads as a compliment rather than as data, which is exactly why it would be repeated. Table corrected.

## How this work goes

Grill-with-docs format: one question at a time, each with a recommendation and an explicit *cost / where it bites*. The user pushes back with field knowledge and **defers when a decision is premature** ("flag this, we will finalize when building X") — treat deferral as a valid answer and park the analysis rather than forcing a pick. Twice they chose against my recommendation and were better grounded both times.

See also [[project-dhs-brand-strategy]], [[project-dh-pacs-product]], [[project-dhs-crm]], [[commercial-content-hub-rule]].
