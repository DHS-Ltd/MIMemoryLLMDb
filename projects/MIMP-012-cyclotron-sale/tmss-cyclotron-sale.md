---
name: tmss-cyclotron-sale
description: "The TMSS (Bogura) cyclotron sale — the sale procedure (bind the customer before arranging finance), the cost model, Schedules 1-4, the DEG approach, Mandate Revision 2 against the Managing Committee terms, and the resolved HM-20 + TR-ALPHA machine configuration."
metadata: 
  node_type: memory
  type: project
  originSessionId: ab440ea8-ed37-4259-aa83-34a8569f1b75
  modified: 2026-09-22T00:00:00.000Z
---

Third distinct business line in this repo, alongside [[project-purpose]] (the HM-30 sale) and
[[bmu-ppp-proposal]]. Customer: **TMSS**, a very large Bangladeshi NGO in Bogura. Seller:
**MED-I (Thailand) Co., Ltd.** Full decision record lives in `TMSS_Cyclotron_project/CONTEXT.md`;
this memory holds the *procedure* and the steers that aren't obvious from the files.

## Position as at 2026-07-31

TMSS's **Governing Body has approved** the project and asked for whole-system price plus financing
help. MED-I is **sole-sourced**, the opportunity is **registered with Sumitomo**, and MED-I can
obtain a firm quote. MED-I acts as **arranger/introducer only** — never lender, never equity,
never JV.

## The sale procedure (agreed)

The governing rule: **bind before arranging finance.** MED-I's asset is its financier
relationships, and an introduction cannot be un-made. No institution is named to TMSS before
signature.

1. **Give cheap, withhold expensive.** Indicative order-of-magnitude figure only (~US$35M),
   **no cost breakdown**, no MED-I-scope vs total-project split. Firm quotation, financing
   structure and every lender name sit behind the Mandate. Detailed costing later becomes the
   paid Phase-0 study.
2. **Sign the Mandate** — a Project Development & Exclusive Arranger Mandate. Not an MOU or LOI;
   those connote non-binding intent, which defeats the purpose.
3. **Binding package: Tiers 1 + 2 + 4 now, Tier 3 later.** Now — exclusive arranger appointment,
   NCND + tail, supply exclusivity, mutual confidentiality, Governing Body resolution as recital,
   conditions precedent TMSS satisfies at its own cost (site + land title, power availability,
   BAERA pre-application, audited accounts, named focal point), steering committee, milestones,
   and all structural locks. **No cash ask to TMSS in this round.** Later — commitment fee and/or
   paid Phase-0 development study.
4. **Terms**: 24 months exclusivity + **24-month NCND tail**; Singapore law, SIAC arbitration;
   arranger fee as a % of the amount arranged, sought **from the lender/facility side** rather
   than from TMSS's funds.

## Three assets being protected (not one)

Equipment margin · arranger fee · **the 10-year consumables + service annuity**. The annuity is
the largest and the one nobody steals — it simply never gets agreed, then gets competed away
after commissioning. It is signed **now** as Schedule 3, conditional on financial close.

## Steers that keep paying off

- **Frame exclusivity as reciprocity.** TMSS's own letter of 10 May 2026 (Ref TMSS/THS/TCC/26-489)
  asked MED-I not to share their information with rival manufacturers. The Mandate just makes that
  mutual. This is the strongest argument available and should lead every conversation.
- **NCND must reach TMSS's own advisors and consultants**, not just TMSS — the user raised this
  specifically — and it is only enforceable against a countersigned register of introduced parties.
- **Japanese ECA financing locks the brand with no clause at all**: export credit disburses only
  against Japanese content. Structural locks beat contractual ones here, because cross-border
  enforcement against a Bangladeshi NGO is slow.
- **Recommend TMSS ring-fence a special-purpose company** for the cyclotron. It isolates lenders
  from the General Activities deficit, sidesteps the MRA question, and makes security clean. Best
  single demonstration that MED-I is an arranger, not just a vendor.
- TMSS's numbers cut both ways: the non-microfinance segment runs a **BDT 1.167bn deficit** with a
  negative reserve, but microfinance already moved **BDT 584M to cancer-centre equipment in FY25** —
  the funding channel is live, not theoretical. Lead credit conversations with the second fact.

## Open items carried forward

- **Machine model — RESOLVED 2026-09-22, and it is neither MP-30 nor HM-30.** The configuration
  is **two machines: an HM-20-class proton/deuteron accelerator plus a TR-ALPHA-class dedicated
  alpha irradiator.** Full specification and the three standing positions it overturns are in the
  2026-09-22 section below. Every document in this repo that assumes a single multi-particle
  machine is now stale.
- **`Theranostics_Bangladesh_Feasibility_Brief.md` says HM-30 throughout** and pins ²¹¹At to it.
  Already delivered to TMSS; needs correcting before due diligence.
- **Demand assumptions are prostate-weighted, Bangladesh is not.** PSMA appears in six revenue
  lines; GLOBOCAN 2022 puts prostate at rank 16 (2,335 cases) behind oesophagus, lip/oral and lung.
  Re-anchor before a lender's analyst finds it. Keep the evidence separation in
  [[reports-evidence-discipline]].

## Deliverables built (2026-07-31)

In `TMSS_Cyclotron_project/`: `TMSS_Response_Letter` and `TMSS_Mandate_Term_Sheet` (both .md +
print-styled A4 .html, outbound), plus `INTERNAL_Negotiation_Playbook` and
`INTERNAL_Financing_Route_Map` (.md, MED-I eyes only). Built through the usual interview flow —
see [[working-style]].

## Machine-spec correction (2026-08-29) — PARTLY SUPERSEDED 2026-09-22

> The physics below stands unchanged and still governs. The **machine** it describes does
> not: there is no MP-30 and no external alpha beamline, so the **energy-degrader**
> requirement is void — energy is set by internal target radial position. See the
> 2026-09-22 section.

The MP-30's alpha beam is **32 MeV FIXED**, and that is a ceiling, not the requirement. ²¹¹At is made
by Bi-209(α,2n) at **28 MeV**, and the window closes near 29.5 MeV because the (α,3n) channel then
co-produces **At-210 → Po-210** (138-day alpha emitter, severe marrow toxicity). Fukushima, which
took Sumitomo's first MP-30 in 2016, runs the reaction at **26 MeV / 20 μA / 14 MBq per μA·h**.

So **every astatine run is a degraded run**, and three things must be in the RFQ or they will be
missing from the plant: an **energy degrader** on the alpha beamline, the yield stated **at the
degraded energy at target** (not nameplate), and a **Po-210 release assay** in QC — the degrader's
failure mode is invisible to a gamma counter and unrecallable once injected.

Also settled: **HM = H-minus (proton only), MP = multi-particle.** Alpha needs a second ion source
and a second extraction system (electrostatic deflector, not stripping foil). **It cannot be
retrofitted.** The machine choice is the project's only one-way door.

## Cost model findings (2026-08-29, `INTERNAL_Cost_Model.md`)

Built at the user's direction as **internal-only**, so the outbound "indicative only, no breakdown"
rule stands untouched. Numbers to hold in mind:

- **Honest project cost US$43M (captive, alpha) to US$64M (national hub, alpha)**; the realistic
  deal case is **US$57.3M**. The **US$35M is not a total-project number** — it reconciles almost
  exactly to **MED-I supply scope for a captive-sized alpha facility, excluding owner's civil scope
  and contingency**. Fix the framing, not the number, and do it before diligence.
- **Alpha premium US$14.5M, and it does not scale with sizing** (one machine, one target station,
  one still). 51% of capex captive, 23% national. Argues for scale if alpha is kept.
- **US$5.2M/yr revenue has no basis anywhere in the repo.** Bottom-up gives **US$2.84M**
  production-only, **US$3.76M** with imaging. It only reaches US$5.2M if the facility captures
  *scan* revenue (~US$300) instead of *dose* revenue (~US$110) — which needs PET/CT and a therapy
  ward, i.e. exactly the scope the US$35M excludes. **The revenue case and the capex scope describe
  two different projects.**
- **EBITDA is negative in every year at Bangladeshi pricing.** The project services no commercial
  debt. It works only as blended finance + grant on the non-revenue assets + PPP/offtake. That is
  the deal, not a flaw in it — and it is why the arranger role decides whether the equipment sale
  happens at all.
- **The annuity is US$23.8M gross over 10 years, ~5x the equipment margin** and larger than the
  other two streams combined, three times over. 10-yr opex (US$52.9M) exceeds 10-yr capex.
- **Bogura splits the product line**: F-18 reaches Dhaka at ~2.5 half-lives' decay penalty;
  **²¹¹At cannot** (3-hour rule), so alpha is on-site-only at this site. The differentiator the whole
  case was built on is the one product the location caps.

## Schedules 1–4 built (2026-09-04)

Term sheet is **with the TMSS Governing Body**, not signed. Four schedule templates written in
`TMSS_Cyclotron_project/`; full decision record appended to that folder's `CONTEXT.md`.

**The defect found and fixed.** Clause 14 made *the obligation to execute* Schedule 3 binding but
not Schedule 3 itself — an agreement to agree, generally unenforceable under Singapore law. The
US$23.8M annuity was resting on a promise to negotiate later, at the exact moment leverage starts
falling. Cured by executing Schedule 3 **with** the Mandate.

**Release rule.** Build all four now, send nothing while the board deliberates — schedules arriving
mid-deliberation give TMSS's secretariat a reason to table the item. Presenting Schedule 3 at
execution is *delivery of what Clause 6 already told the board would exist*, so it triggers no
re-approval. At execution TMSS signs **Mandate + Sch 2 + Sch 3 + Sch 4**; Sch 1 follows with the
firm quotation at T+45 per Clause 7.

**Design rules that carry forward:**

- **Benchmarking adjusts price, it never releases exclusivity.** One sentence, the most valuable in
  Schedule 3. Benchmark at years 3 / 6 / 9 only, ±10% collar, Tier A only.
- **Two-tier supply scope.** Tier A exclusive because third-party parts void warranty and licence
  conditions — a genuine justification, not a naked restraint. Tier B (Lu-177 / Y-90, generators,
  commodity reagents) is right-of-first-refusal only. Blanket exclusivity is what a lawyer attacks
  first, and it would put MED-I on the hook for Lu-177 in a globally tight market.
- **Committed vs Target milestones.** Everything market-facing is Target with an express non-breach
  line, because no arranger controls a lender's credit committee. Schedule 4 signed at execution is
  a *gain*: it puts a clock on TMSS's Clause 8 conditions precedent, which currently say only "as
  soon as practicable".
- **Milestone 1.7 is the one to protect** — first formal application at M+7 keeps the Clause 4
  auto-extension armed with 17 months to spare. Every other slip is survivable; that one is not.

User chose the **18-month envelope** over the recommended 24, and **all four schedules signed
together** over the safer subset. Both accepted with the risks stated; mitigations built in.

Schedule 4 runs through to **first production ~M+44** — the 18–24 month Sumitomo build lead time is
disclosed to the board now rather than at commissioning. Schedule 1 shows Column C (PET/CT, SPECT,
therapy rooms) as unscheduled and unbudgeted, which is where the cost model's revenue-vs-scope
contradiction gets surfaced on MED-I's terms.

## DEG financing approach (2026-09-14) — the fourth workstream on this line

MED-I Thailand holds a relationship with **DEG**, the German DFI owned by KfW. A preliminary verbal
talk happened, DEG showed real interest and **asked for a written proposal so it can be moved
officially**. DEG's institutional facts, products, ticket sizes and Bangladesh footprint live in
[[deg-financier-reference]] — this section holds only the strategy.

Deliverable: `TMSS_Cyclotron_project/DEG_Funding_Proposal.md` + `.docx`. Three-page letter plus a
one-page **Annex A Project Summary Sheet**, placeholders left for contact name, date of the talk,
signatory and liaison bank. Full decision record in that folder's `CONTEXT.md`.

### Four steers that should survive into any future DEG work

- **DEG breaks the Japanese-content brand lock.** The standing position in this repo is that
  JBIC/NEXI export credit locks Sumitomo structurally, because it disburses only against Japanese
  content, so no clause is needed. **A German DFI has no such rule.** Resolution used: keep an **ECA
  tranche in the stack** so the lock still operates; DEG breaks it only if DEG becomes the *sole*
  financier. While DEG leads, **Clause 2 moves up the never-concede list.**
- **With a DFI, honesty is the strategy, not a risk.** The cost model's negative EBITDA in every year
  is stated plainly in the letter, as the reason a DFI rather than a commercial bank is required.
  What ends a DFI relationship permanently is not a weak return, it is being caught presenting a weak
  return as a strong one. Corollaries: **US$5.2M/yr never goes to a lender** (the letter uses the
  bottom-up **US$3.8M**), and the **US$35M is reframed** through Schedule 1's three-column split
  rather than restated, so nothing contradicts what TMSS already holds.
- **To a lender, alpha is a liability, not a differentiator.** At-211 has zero controlled efficacy
  evidence worldwide and no reimbursement path, so the credit case rests on PET / imaging / therapy
  and the alpha-capable machine is justified *only* by the one-way door: *"US$14.5M today and
  infinite tomorrow. We are not asking DEG to finance an unproven therapy, we are asking it not to
  foreclose one."* Same facts as the TMSS documents, different emphasis — **the two must survive
  being read side by side.**
- **DEG's mandate is private enterprise, and TMSS is an NGO.** Pre-empted rather than hidden: the
  letter recommends a **ring-fenced SPV under TMSS ownership** and invites DEG's structuring view,
  noting DEG founded IPDC and IDLC. TMSS's deficit, negative reserve and PAR ratio are disclosed in
  full **in the Annex, not the letter body** — where they read as candour instead of spending a third
  of a three-page letter arguing against your own sponsor.

### The find that was sitting unused in every document

**TMSS is Thengamara _Mohila_ (Women's) Sabuj Sangha**, rebuilt in 1980 by **Prof. Dr. Hosne-Ara
Begum** from a group of destitute women. Against DEG's **2X Global** standard that is close to a
textbook case, and **no document in this repo had ever used it**. Paired with the real epidemiology —
**breast and cervix are Bangladesh's #2 and #3 cancers** — it also fixes the long-flagged
**prostate-weighted demand assumption**. For this audience the accurate epidemiology and the
strongest argument turned out to be the same sentence.

### Sequencing rule, preserved

The Mandate is still unsigned, so the letter carries a **channel clause** asking DEG to route
correspondence through MED-I until direct sponsor engagement is opened. Intended play: **DEG
indication of interest → TMSS signs the Mandate → formal introduction under signed NCND with DEG
entered in Schedule 2.** An indication is usable with TMSS **without naming DEG** — *"a European
development finance institution has indicated appetite"* — which matches the Response Letter's
existing no-names convention. **Carried assumption, unconfirmed: DEG's name has not reached TMSS.**
If it has, the priority inverts and the signature is chased first.

### Raised in urgency by the DEG route

The **HM-30 error in `Theranostics_Bangladesh_Feasibility_Brief.md`** is now blocking. It is already
with TMSS, names a proton-only machine, and attributes the At-211 route to it. Once a DFI's technical
advisor is in the picture that is **a specification error at the centre of the one-way-door argument**,
not a typo. Fix before any DEG technical meeting.

### Sequencing reversed (2026-09-16) — the Mandate signature is now a DEG deliverable

The plan above assumed DEG's next move is to *give* an indication before asking for anything. A DFI's
second conversation opens instead with *"are you mandated by the sponsor, and does the sponsor know we
are talking?"* — and MED-I's honest answer is **no on both counts**. A DFI given that answer does not
decline, it **goes quiet**: an unmandated arranger with an uninformed sponsor is the profile of a deal
that wastes a credit officer's time.

**User decision: chase the signed Mandate from TMSS first**, DEG round-two readiness work resumes only
after signature. Parallel-track was recommended and declined. Accepted cost: DEG's interest is
perishable and the wait runs on a Governing Body timetable MED-I does not control.

Scope clarified and parked for the resumed session — **not** commercial security (payment, collateral,
break fees all expressly out), but **readiness**: what must be true at TMSS, paperwork included, to
survive DEG's round two. Full carry-forward list lives in `TMSS_Cyclotron_project/CONTEXT.md` under
*DEG round-two readiness*. The two items most likely to be forgotten: **information-sharing consent
has never been obtained** though TMSS's finances are already in Annex A of the DEG letter, and the
**borrower-vehicle answer needs a TMSS board decision**, not an MED-I recommendation.


---

## Mandate Revision 2 (2026-09-22) — the Managing Committee terms

TMSS returned the term sheet with **eight terms the Managing Committee requires in Terms &
Conditions** as its condition for signature. All eight are accepted; the whole design problem was
accepting them without MED-I warranting any of them. Deliverables:
`TMSS_Mandate_Term_Sheet_Rev2.md` + `.docx` (ref MEDI/TMSS/2026-02-TS, supersedes the 31 July
term sheet). Full decision record in `TMSS_Cyclotron_project/CONTEXT.md`.

### The governing device

**Clause 5 (Financing Parameters)** carries all eight terms as binding T&C, and **5.3** states they
are the *objective* of the appointment — **not a condition precedent, condition subsequent,
representation or warranty, and missing them is expressly not a breach.** This is the
**Committed/Target device the board already approved in Schedule 4**, applied to price instead of
timing. Reusing a device they signed off on is what gets this through without a second
deliberation round — that argument is worth more than the drafting.

**5.5** is the clause that protects the deal: if an offer departs from the Parameters, TMSS may
decline it and **exclusivity survives the no**. Without it, a term sheet that misses 4% BDT is the
event TMSS points at to walk.

### The trap that was caught

The Committee's *"Maximum interest rate will be 4% (5.5-1.5)"* would have made the arranger fee
**the residual of 5.5% minus whatever the lender actually charges** — a lender pricing at 5.5%
leaves MED-I nothing, with MED-I absorbing every basis point of market movement to close. **Clause
6.4 severs the fee from the interest rate expressly.** Never let the fee be defined against an
all-in figure.

### Decisions that should survive

- **Rate framing**: **4% is stated as TMSS's desire; 5–6% as MED-I's practical assessment**, in the
  document, at signature. Putting the realistic number in writing now forecloses the *"you promised
  4%"* conversation entirely. Governing sentence, user's own words, carried close to verbatim:
  *"interest pricing is a function of the project and the borrower entity; if the borrower can
  obtain a preferred rate that is to the borrower's credit."* **That sentence also converts the
  ring-fenced SPV from MED-I's advice into TMSS's own route to a better rate.**
- **BDT and 5–6% cannot both hold.** Local Taka lending is ~11–14%; a foreign lender's BDT tranche
  carries the rate differential as hedge cost, landing ~10–13%. The 5–6% is a foreign-currency
  number. Both are stated deliberately — it is the record that MED-I disclosed the conflict before
  anyone discovered it. **FX risk expressly not MED-I's (5.4)**; a 30% move over ten years on a
  US$50M facility is ~US$15M. The **split-currency structure** (FX tranche for imported plant —
  which also preserves the Japanese-content lock — plus BDT for local costs) is **held back from
  the document** by user direction and raised at Steering Committee.
- **Grace period**: three years with interest **capitalised and funded within the facility**, not
  waived. True waiver only from concessional sources. **Capitalised interest ~US$8M is expressly
  outside the US$60M** — without that line it would have silently consumed US$8M of buildable scope
  and surfaced around month twenty. TMSS's 3-year number is accidentally correct: Schedule 4 gives
  a **26-month build** (close M+18, first production M+44).
- **Tenor ≥10 years inclusive of grace**, which keeps the deal inside **DEG's 4–12 year product
  range**; 3+10=13 would not.
- **US$60M is attributed, not adopted** — *"as determined by TMSS"*. MED-I never makes it MED-I's
  estimate, so the DEG letter's **US$52M** is not contradicted. Bridge kept in the playbook only:
  52 + ~7 alpha therapy completion ≈ 59.
- **Funding Requirement = "up to US$60M less the Sponsor Contribution"**, left blank in the
  document so the board approves no figure it has not discussed. Sponsor equity is raised as **the
  market's universal requirement** (no DFI/ECA funds 100%), never as MED-I's demand. Softening
  fact: TMSS already moved **BDT 584M to cancer-centre equipment in FY25**.
- **Fee**: 1.5% of **"Arranged Funding"** (widened to catch guarantees and ECA cover where the
  principal sits with a commercial bank), **due at First Close**, payable from TMSS's own funds or
  the borrowings at TMSS's election. The per-annum reading of *(5.5-1.5)* — worth ~US$3.5–4M — was
  **deliberately not pursued**: 1.5% p.a. is a lender's margin, not an arranger's fee, and it is
  the first thing a DFI's counsel strikes. The recurring money is already held in Schedule 3.
- **New conditions precedent (Clause 9 items 7–9)**: foreign-borrowing approval, NGOAB
  registration, and **confirmation of a ring-fenced borrowing vehicle acceptable to financiers**.
  Item 9 puts a clock on the borrower-vehicle question that had no owner; item 7 places a
  **regulator** between TMSS's 4% and MED-I.
- **Clause 2 strengthened**: match right qualified by Schedule 1A with independent verification at
  TMSS's cost, plus **2.4 barring any parallel tender, RFQ, RFI or budgetary enquiry** — practically
  the most effective supply lock in the document.

### The grant, carved out

**US$15M is no longer capital-stack money.** It became a **separate post-GMP assignment for
oncology research** (Clause 15): MED-I's **election, not obligation**; conditions precedent written
as the grant-maker's own requirements so the board reads a roadmap; **fee 1.5% from TMSS's own
funds, expressly not from grant proceeds** — most serious research funders (Wellcome, Gates,
NIH-family, IAEA) prohibit intermediary fees paid from grant money and can treat one as an
eligibility defect.

**MED-I does not intend to pursue it** (user's position: not a realistic deliverable). No condition
needed engineering — the **election right already achieves the exit**, and a disclosed option is
hard bargaining where a condition provably built to fail is a bad-faith argument. Keep the file
neutral on this.

**Clause 15.7 is the clause that pays**: consumables for any grant-funded programme at the Facility
fall under **Schedule 3 Tier A whether or not MED-I takes the assignment**. Schedule 3 already runs
ten years from M+44 and captures everything at that facility regardless of funding source — **MED-I
never needed the grant assignment to be paid by grant-funded research.**

**Clause 15.3 is the most valuable sentence in the whole revision, and not because of the grant**:
**MED-I supplies GMP-*capable*; TMSS achieves GMP-*compliant*.** It sits in operative text so it
also governs Schedule 1. That is what stops an equipment supply contract becoming a regulatory
performance guarantee against a regulator MED-I does not control — a larger exposure than anything
in the eight terms.

### Also settled

- **Board authority embedded, not separate** (Clause 16): the resolution is recited as an **excerpt
  inside the Mandate**, paired with a **warranty** that it was duly passed and the signatories are
  authorised — the warranty is the enforceable part. Approved **"together with its Schedules"** at
  instrument level, which gives full authority over Schedule 3 **without writing "ten-year exclusive
  consumables supply" into a board minute**. Signed by the **Member Secretary of the Governing
  Board together with Dr. Matiur Rahman**. Includes **information-sharing consent to prospective
  financiers**, closing the exposure flagged 16 September. Clause 9 item 1 still owes a certified
  copy — a DFI's counsel will ask.
- **No eight-point response table** in the covering letter (user-directed). The terms live in
  Clause 5, which is where the Committee asked for them.
- **Procurement caution, recorded and not acted on**: where a DFI, ECA or multilateral finances,
  **the lender's procurement rules apply, not TMSS's preference.** The professional route to a
  sole-source outcome is a **documented sole-source justification** — which every DFI permits on
  proprietary-technology or single-qualified-supplier grounds — not a specification written to
  exclude. A rigged spec found at appraisal costs the arranger fee, the equipment sale and the
  US$23.8M annuity together.

## The Governing Board Resolution (received 2026-09-22; meeting dated 28 April 2026)

`TMSS_Governing Body Resolution.pdf` — Governing Board Meeting-25, signed by Chairperson Mrs.
Gulnahar Parveen alone.

- **7 of 9 board members are women**, chaired by a woman, with founder **Prof. Dr. Hosne-Ara Begum**
  sitting as **Member Secretary**. This is **2X Global's leadership criterion met with a verifiable
  board minute** rather than a founding narrative — a straight upgrade to Annex A of the DEG letter,
  which currently argues 2X on history alone.
- **Focal Person named**: *Rotarian Dr. Md. Matiur Rahman, Deputy Executive Director-2* — the
  signatory of the 10 May letter. **That condition precedent is already satisfied.**
- Approval is **"in principle"**, the nomination is for *communication* only, **nobody is authorised
  to sign**, and it says nothing about **supply exclusivity** or the **Schedule 3 annuity** — both
  of which had no board authority behind them at all until Clause 16.
- The operative Decision calls MED-I **"the Financier and Arranger"**; the Discussion paragraph
  above it says Exclusive Arranger. **User confirms TMSS understands MED-I is not the funder** —
  most likely a translation artefact. **Bangla original + certified translation requested.** Clause
  1.3 neutralises it either way, *"notwithstanding any description of MED-I in the resolution dated
  28 April 2026"*.
- **Date anachronism to have an answer for**: the 28 April agenda names the *"Project Development &
  Exclusive Arranger Mandate"* by exact title, and that title was created in MED-I's own drafting on
  **31 July 2026**. This is the Clause 9 item 1 document that goes to a DFI. Know the answer before
  compliance asks.

## Machine configuration RESOLVED (2026-09-22) — two machines, not one

**Proton/deuteron accelerator (HM-20 class)** — H⁻ / D⁻; **20 MeV proton, 10 MeV deuteron**; max
extracted **150 µA dual beam / 100 µA single beam** at 20 MeV proton, **50 µA** at 10 MeV deuteron;
**dual beam extraction**; **2 exit ports, up to 4 targets per port**; **vertical acceleration plane**.

**Alpha irradiation system (TR-ALPHA class)** — **⁴He²⁺**; **no external beam extraction, internal
targets**; irradiation energy **up to 30 MeV**; **>50 µA**; **2 irradiation ports**; **vertical
acceleration plane**; **solid-state RF amplifier**.

### Three standing positions this overturns

1. **The cost model's alpha framing is wrong for this architecture.** *"Alpha premium US$14.5M, and
   it does not scale with sizing (one machine, one target station, one still)"* describes a single
   multi-particle machine. This is a **second cyclotron, second vault, second shielding design**.
   Rebuild before the figure is quoted anywhere.
2. **The one-way door relocates — it does not disappear.** *"Alpha capability cannot be retrofitted"*
   was true of an H-minus machine; a **separate** alpha machine can be added later. What cannot be
   retrofitted affordably is the **second vault and its civil works**. The DEG letter's sentence
   needs rewriting; the argument itself survives.
3. **The energy-degrader mandatory is void.** No external beam extraction means no alpha beamline.
   Energy is set by **internal target radial position** instead.

### Specification lock as built, and what was left out

**Schedule 1A** executes at signature carrying **the datasheet values and nothing else**; **Schedule
1B** (supply scope, **manufacturers and brands**, pricing) issues with the firm quotation — which is
how the Committee's "brands named" term is met without naming a model Sumitomo has not confirmed.
**This is the one point where the document departs from the Committee's literal instruction**, and
Clause 5 says so explicitly so it reads as sequencing rather than omission.

**Removed at user direction**: a supplier-qualification part (single-vendor responsibility, in-region
service, installed base including ≥1 machine in At-211 production, vault envelope) — of which
**installed base was the sharpest defensible exclusion and vault envelope quietly excluded a 70 MeV
machine**.

**Safety items declined, and they must resurface at quotation.** An irradiation energy **settable and
verifiable at 26–28 MeV at target with yield warranted at irradiation energy not nameplate**, and a
**Po-210 release assay in QC**, were recommended and are **not in the Mandate**. The physics is
unchanged: Bi-209(α,2n) runs at **28 MeV**, the window closes near **29.5 MeV**, and above it (α,3n)
co-produces At-210 → **Po-210**, a 138-day alpha emitter with severe marrow toxicity whose failure
mode is **invisible to a gamma counter and unrecallable once injected**. The datasheet's *"up to
30 MeV"* is a ceiling above that window, exactly as the MP-30's 32 MeV was. **Carry into Schedule 1B
and the firm quotation**, where it is a specification question rather than a contractual one.

### Documents now stale and needing correction

1. `INTERNAL_Cost_Model.md` — alpha premium built on a single multi-particle machine.
2. `DEG_Funding_Proposal.md` — the one-way-door sentence, and the US$52M / grant-line stack.
3. `Alpha_Cyclotron_Treatment_Landscape.md` — written to the alpha-capable MP-30 class.
4. `Theranostics_Bangladesh_Feasibility_Brief.md` — **already with TMSS**, says HM-30 throughout and
   pins ²¹¹At to it. Was wrong before; now wrong twice over. Still the most urgent of the four.
