# Phase 3 — The Wiki Layer (reconciliation + ingestion)

> Build plan produced 2026-08-09 from a grilling session against
> *"Karpathy's LLM Wiki — Full Beginner Setup Guide"* (Teacher's Tech, 15 min).
> Successor to `docs/Phase1-Build/` and `docs/BrainBuild/brain-build-plan.md`.
> Decisions recorded as **ADR-0006** (cites, not asserts) and **ADR-0007** (Source cards).

---

## 1. Why this phase exists

The video proposes three layers: `raw/` read-only sources → an AI-maintained `wiki/` → a rules
doc. Measured against this repo, **most of it was already built, and better**: you have a schema,
typed registry edges, an ADR trajectory layer, and a 7-tool MCP server with cross-machine git-object
retrieval. The video has none of that.

What it exposed were four genuine holes: **no ingestion tier, no synthesis-on-ingest, no
provenance, no health check.**

Then the survey of machineA found something bigger.

### The brain was bypassed, and then went wrong

| | MIMemoryLLMDb | Rest of machineA |
|---|---|---|
| Last written | **2026-06-16** | continuously, through 2026-08-09 |
| `CONTEXT.md` / `CONTEXT-MAP.md` | 0 | **20** |
| ADRs | 5 | **48** (DHV-Weasis 17, DH-Advanced-Viewer 13, DHS-PACS 11, Self_project 7) |
| Registered projects | 7 | ~20 active repos |

Between June and August, the per-repo `CONTEXT.md` + `docs/adr/` pattern was adopted independently
across the estate and won, because it lives where the work happens.

Meanwhile `E:\DHS-PACS\CONTEXT-MAP.md` (2026-08-03) superseded what this repo still serves:

| `org/` + MIMP-004 assert | Authority as of 2026-08-03 |
|---|---|
| 3 activity lines; flywheel SaaS → trust → **equipment** | **4 Business Pillars** (Supply/Facility/Build/Service); **Build is prime** |
| BDC = proof/credibility engine | Facility/BDC **banned from all Commercial Content** |
| *Land* first PACS sale to Ibn Sina by Jul 2026 | Ibn Sina has been a **live Enterprise deployment since Feb 2026** — 7 workstations, 5 centres, ~1,257 patients. The **sales motion** failed, not the product |
| "Ibn Sina as **master proof point**", every first touch | Banned term. **Tier-matched proof**: Ibn Sina ⇒ Enterprise only; **Cumilla** (5 centres, 56 patients, 7 doctors) ⇒ Standard |
| Category = "patient as complete owner of imaging record" | **Advanced Connected Imaging Network**; patient ownership is the *mechanism* |
| Products: PACS, HMS | **DH PACS, DHV, DHDicomAnalyzerPro** |

`search_memories` will serve every superseded claim above to a session drafting customer copy.
**That hazard is the only thing here actively costing money, and Phase 0 exists to kill it first.**

### The reframe

The Karpathy pattern holds — but `raw/` is not PDFs. **Your repos are the Sources; MIMemoryLLMDb
is the Wiki over them.** They arrive pre-structured with glossaries and ADR frontmatter, and they
already contradict each other, which is exactly what a Wiki is for.

---

## 2. Decisions locked (2026-08-09)

| # | Decision | Recorded |
|---|---|---|
| 1 | Corpus is **DHS business-wide**, not per-project | this plan |
| 2 | `raw/` gitignored; **Source cards** committed | ADR-0007 |
| 3 | Tier boundary is **provenance**: Sourced ⇒ cites a card; first-party ⇒ repo's own | ADR-0006, `CONTEXT.md` |
| 4 | Obsidian **vault at repo root** — **demoted to Phase 4** on 2026-08-10 (see §4 Phase 4) | this plan |
| 5 | **machineA is sole `wiki/` writer**; machineB reads | ADR-0007 |
| 6 | Rules in **`wiki/RULES.md`**; `SCHEMA.md` corrected to v1.1 | this plan |
| 7 | MCP: widen `search_memories` with `scope`, add `get_wiki_page` | ADR-0006 |
| 8 | Lint **splits**: mechanical script + periodic semantic prompt | this plan |
| 9 | MIMemoryLLMDb **cites, never asserts**; Authority stays in the repos | ADR-0006 |
| 10 | First ingest = **DHS-PACS only**, reconciliation-first | this plan |
| 11 | Registry **v2.1**: add `pillar`, retire `niche` | this plan |
| 12 | Plan lives here, in `docs/Phase3-Wiki/` | this plan |

---

## 3. Target shape

```
E:\MIMemoryLLMDb\              ← Obsidian vault root
├── CONTEXT.md                 ← glossary (created 2026-08-09)
├── SCHEMA.md                  ← v1.1: frontmatter permitted + specified
├── .obsidian/                 ← committed; excludes mcp-server/node_modules
├── raw/                       ← GITIGNORED — Sources never leave the machine
│   └── _cards/<slug>.md       ← COMMITTED — origin, SHA-256, date, abstract, pages fed
├── wiki/
│   ├── RULES.md               ← ingest workflow, page format, citation, lint, Q&A
│   ├── INDEX.md
│   └── *.md                   ← Sourced synthesis, every claim cited
├── org/                       ← rebuilt: CITES Authority, never asserts
├── projects/                  ← unchanged; MIMP-004 gets supersession banners
└── mcp-server/                ← +scope arg, +get_wiki_page
```

**Invariant:** a `wiki/` or `org/` claim with no Source card reference is a lint defect.

---

## 4. Phases

### Phase 0 — Stop the bleeding *(do first; nothing else is urgent by comparison)*

| # | Task | Detail |
|---|---|---|
| 0.1 | Make `mimp` loud | `Git-Sync` / `Git-CommitPush` ([mimp.ps1:128-141](../../tools/mimp.ps1#L128-L141)) discard stderr and check no exit code. Surface stderr, check `$LASTEXITCODE` on pull/commit/push, abort on failure. |
| 0.2 | Narrow `git add -A` | It currently sweeps the whole worktree, folding unrelated `wiki/` work into a project-push commit. |
| 0.3 | **Contain the hazard** | Add a supersession banner to the top of each affected MIMP-004 file naming what replaced the claim and where Authority now lives. Do **not** delete — stale copies exist elsewhere and must stay traceable. |
| 0.4 | Fix 6 broken wikilinks | `[[dh-pacs-pricing]]`, `[[dh-pacs-hipaa-compliance]]`, `[[dh-pacs-website-decisions]]`, `[[dh-pacs-product]]` match frontmatter `name:`, not filenames. Add `aliases:` or rename. They render as phantom nodes in the vault. |

**Exit:** no retrievable claim contradicts DHS-PACS without saying so; no git failure is silent.

### Phase 1 — Reconciliation (the first ingest)

| # | Task | Detail |
|---|---|---|
| 1.1 | Scaffold | `raw/` (+ `.gitignore` entry), `raw/_cards/`, `wiki/`, `wiki/RULES.md`, `wiki/INDEX.md`. Move `Obsidian_reasearch/` → `raw/`; delete the stray empty `Ob/`. |
| 1.2 | Write `wiki/RULES.md` | Purpose line; folder map; ingest workflow (read → extract → create/update → update INDEX → write card → log); page format (summary first, every claim cites a card, links to related pages); Q&A behaviour (consult Wiki first, cite, flag uncertainty); lint checklist. |
| 1.3 | First Source cards | `E:\DHS-PACS\CONTEXT-MAP.md` + the 11 DHS-PACS ADRs. Plus the video itself as the worked example — transcript already extracted at `raw/Video_reference/transcript_clean.txt`. |
| 1.4 | Rebuild `org/` | `business.md` and `north-star.md` re-derived from those Sources, **cited not asserted**. Record the Ibn Sina outcome as a closed Enterprise deal and whatever the current north-star actually is. |
| 1.5 | Registry **v2.1** | Add `pillar` ∈ {Supply, Facility, Build, Service}; retire `niche`; re-tag 7 projects. Blast radius verified small: [mimp.ps1:239-254](../../tools/mimp.ps1#L239-L254) + line 299, 7 registry values, and 3 **display-only** MCP interpolations ([get-business-overview.js:51](../../mcp-server/tools/get-business-overview.js#L51), [get-entity.js:80](../../mcp-server/tools/get-entity.js#L80), [whats-next.js:109](../../mcp-server/tools/whats-next.js#L109)). No logic branches on `niche`. |
| 1.6 | `SCHEMA.md` → v1.1 | Rule 5 currently forbids frontmatter that half the repo already uses. Permit and specify it; state the wikilink-must-match-filename rule. |

**Exit:** `org/` cites DHS-PACS for every strategic claim, and the registry speaks Pillars and Products.

### Phase 2 — Lint ✅ **DONE 2026-08-10**

**`tools/lint.mjs`, wired as `mimp lint`.** Deterministic, no model, no tokens; exit 1 on any error
so it can gate a push. Implemented in Node because it hashes files and parses markdown — PS 5.1 is
the wrong tool. Ten checks:

`broken-wikilink` · `broken-link` · `source-drift` (card SHA-256 vs the file on disk) ·
`source-missing` · `card-fed-nothing` · `card-no-abstract` · `uncited-page` · `orphan-page` ·
`deadline-passed` · `dead-path` · `unpushed-memory` · `review-overdue`

**First run found 18 errors — including its own false positives**, which was the most useful
result. It flagged the MEMORY.md template inside `SCHEMA.md` and the `[[wikilink]]` in SCHEMA.md's
own rule 7. A linter that cries wolf gets ignored, so `stripIllustrative()` now blanks fenced code,
inline code spans, and `---begin/end template---` regions before scanning.

Real defects found and fixed: **6 broken README links** (files had moved to `docs/Phase1-Build/`)
and **`org/programs/bdc-patient-generation.md` uncited**. Now **0 errors, 3 warnings** — all three
`unpushed-memory`, which is genuine signal: MIMP-004 has 16 memory files against 8 in the repo,
MIMP-008 has 19 against 0, MIMP-009 has 6 against 0.

Note 2.1 would have caught the passed `MIMP-005` deadline and the 6 broken MIMP-004 wikilinks
months ago.

**2.2 Semantic lint** (contradictions, meaning gone stale, missing concept pages) stays a prompt,
run every N ingests. Keeps the MCP server a context-assembler that never calls a model.

### Phase 3 — Retrieval ✅ **DONE 2026-08-10**

| # | Delivered |
|---|---|
| 3.1 | `search_memories` gains `scope` ∈ {all, projects, wiki, org, cards}, default `all`. **Closes the pre-existing gap where `org/` was entirely unsearchable** — it only ever walked `projects/`. `project_filter` implies `scope=projects`, so old callers are unaffected. |
| 3.2 | `get_wiki_page` — lists pages when called bare, resolves loose names (`INDEX`, `INDEX.md`, `wiki/INDEX.md`, or a frontmatter alias), returns the page plus its outbound links. |
| 3.3 | `gitListMdTree()` added — `gitListMdPaths` is depth-1 only and would have missed `org/decisions`, `org/entities`, `org/programs`. Test harness extended by 8 calls. |

**Verified:** 8 tools register (was 7); `scope='org'` returns 9 matches where org/ was previously
unreachable; `scope='projects'` preserves legacy results; `get_wiki_page` correctly reports the
not-yet-pushed state.

⚠ MCP reads `origin/master` ([repo.js:199](../../mcp-server/lib/repo.js#L199)) — **nothing is
retrievable until pushed.** Documented in `wiki/RULES.md` §8 and surfaced in `get_wiki_page`'s own
empty-state message.

### Phase 4 — Widen the corpus, then the vault ✅ **DONE 2026-08-10**

**Corpus widened.** 41 unpushed memory files brought in: **MIMP-008** (DH-Advanced-Viewer — the
Inobitec sales material the north-star depends on), **MIMP-009** (DHV-Weasis), and **MIMP-004**
refreshed with 9 files that did not exist in the repo, including `project-dhs-brand-strategy.md`
and `project-linkedin-surgeon-first.md`. `projects/` went from **33 → 74** markdown files.

**First two Wiki pages written** — both serving the north star, both holding synthesis no single
repo does:

- [`wiki/advanced-post-processing.md`](../../wiki/advanced-post-processing.md) — the engine slot:
  two engines sequenced, three naming rules that conflict if read carelessly, the vascular-only
  scope, and the figure-sourcing trap where the wrong folder is the obvious one.
- [`wiki/selling-the-first-licence.md`](../../wiki/selling-the-first-licence.md) — the north-star
  play: why the *sale* failed and not the product, why the copy is aimed at the centre owner rather
  than the surgeon, candidates, blockers in order.

**What the Wiki immediately earned:** it surfaced a contradiction neither repo could see alone.
`E:\DH-Advanced-Viewer` holds a standing rule (2026-07-26) that *"DH PACS and the DHV Workstation
are out of scope for this product's sales material"*, while `DHS_BRAND_STRATEGY.md` §12 records
**R8** — that the same rule **must be revised**, because the Surgeon Chain only works if they are
sold as one thing. Both current. The campaign cannot write a lead message until one gives way.

**ADR-0008 written**, at real cost: `mimp push` destroyed the seven Phase 0 supersession banners
because they were applied to `projects/` rather than to the Claude memory source. `mimp lint`
caught it within seconds. Rule now in `SCHEMA.md` rule 9 and `CLAUDE.md`.

**Obsidian vault — built, with its limitation recorded rather than discovered later.**
`.obsidian/app.json` excludes `mcp-server/node_modules` (**148** md files against the real corpus)
and the video folder; `.obsidian/graph.json` colour-codes by tier — wiki green, org blue, decisions
red, Source cards purple, projects orange, docs grey — so the graph is legible by layer. Committed
so both machines share it.

⚠ **What it cannot show, by construction:** ADR-0006 made the brain **cite**, so `wiki/` and `org/`
point at absolute paths in *other* repos, and **Obsidian cannot draw an edge to a file outside the
vault**. The provenance edges are invisible to it. Widening is not an option either — `E:\` holds
**6,660** markdown files. For provenance visualisation the right tool is a **generated** graph
(Phase 3 Graph Brain or `/graphify`), built from the registry plus parsed citations, which can
follow absolute paths across repos.

**Remaining corpus** (deliberately not ingested yet): Isotope/Cyclotron, BDC Marketing, DHS-CRM,
DHS-ERP, Personal_Branding, BDCHMSV2 — none registered. Add under v2.1 as they are ingested, not in
a big-bang pass.

### Phase 5 — Freshness

⚠ **Needs re-planning.** Step 1.5 scheduled the weekly `DIGEST.md` strategist on **machineB** — but
machineB holds only the DH PACS technical codebase (confirmed 2026-08-10), so it is the wrong host
for a whole-business strategist job. Options: run it on machineA, or drop the scheduled job in
favour of `mimp lint` plus `whats_next` on demand. Decide before building.

The underlying point stands either way: `whats_next` worked correctly all along — the passed
`MIMP-005` deadline was there to be seen. Nobody ran it. Freshness needs a *routine*, not another
tool.

---

## 5. Definition of done

1. No retrievable claim contradicts an Authority without a supersession banner saying so.
2. Every `wiki/` and rebuilt `org/` claim traces to a committed Source card.
3. `mimp lint` runs clean, or every defect is knowingly accepted.
4. A question spanning DHS-PACS, DHV-Weasis and DH-Advanced-Viewer is answered from `wiki/` in one
   read, with citations.
5. `mimp` fails loudly on any git error.
6. Broken wikilinks are zero — verified by mechanical lint, not by eye (the vault moved to Phase 4).

## 6. Risks

| Risk | Mitigation |
|---|---|
| Reconciliation stalls; hazard persists | Phase 0 is independent of everything else — ship it alone if needed |
| Wiki drifts from repos, recreating the same failure | Source hash drift check (2.1) is the early-warning; freshness is a first-class feature, not a chore |
| Single-writer rule becomes a constraint | Upgrade path recorded in ADR-0007: split capture from synthesis |
| Synthesis proves unmaintainable | Fallback recorded in ADR-0006: index/router only — a subset, not a rewrite |
| Scale limit (video cites ~100 articles) | 20 CONTEXT files + 48 ADRs ≈ 68 Sources — inside the envelope, but Phase 4 should stop and reassess at ~100 |

## 7. Resolved by evidence (2026-08-09) — Phase 1.4 executed early

The reconciliation was run rather than deferred. `org/business.md`, `org/north-star.md` and
`org/relationships.md` are rebuilt as **cited, not asserted**.

**The sale failed; the product did not.** DH PACS is the flagship under Build, the prime pillar, and
the middle link of the Surgeon Chain. Three documented failure modes:

1. **The category had no pull** — patient-record delivery had to be hospital-pushed; the market
   research itself records *"low patient expectation."*
2. **Standard Tier connected centres but produced almost no revenue** — Cumilla: **56 enrolments
   across 5 centres (~11 each)**, **~1.4 referring doctors per centre**, against **~1,257 patients
   at Ibn Sina where forwarding is automatic**. Line 1 depends on the weaker mechanic (R5).
3. **Follow-ups went cold** — serious enough that a CRM was built 2026-08-06 → 08 around **Going
   Cold** (a promise broken) and **Going Quiet** (a promise never made).

**What replaced it (2026-08-03):** serve the surgeon, not the radiologist; category becomes the
**Advanced Connected Imaging Network**; patient ownership demoted from claim to mechanism.

### Still open — genuinely unanswerable from the repos

1. **The north-star itself.** No Source states one. `north-star.md` §3 records a *derived* candidate
   — close R1 (surgeon-adoption proof pilot), then R5 (Line 1 default-on/opt-out), with the CRM live
   throughout — explicitly flagged **DERIVED, NOT CONFIRMED**.
2. **Ibn Sina Cancer Centre expansion** — the June proposal's status is unrecorded (ADR-0005 is
   marked *"proposal phase"*). Closed, stalled, or lapsed?
3. **Popular Diagnostic** — outcome of the 2026-07-03 proposal.
4. **`org/entities/bdc.md`** — TO VERIFY since June, and BDC's role changed materially.
5. **Do Programs survive** as a node type, or do Business Pillars replace them?

### Phase 1.5 executed early — registry v2.1 shipped 2026-08-09

**North star confirmed: sell the Advanced DICOM Image Viewer** (the Inobitec resale, `PRD-003`) —
*not* DHDicomAnalyzerPro, which has no code. Recorded in `org/north-star.md` §3 and as
`products.PRD-003.north_star`.

Shipped:

- `schema_version` → **2.1**. Retired `niche` **and** `business_unit`; added `pillar`, `product`,
  `classification`.
- **New `products` section** — the structural gap is closed. `business_unit: "pacs"` was a string
  pretending to be a node; one product spans several repos and one repo serves several products.

  | ID | Product | Pillar | Provenance | Status |
  |----|---------|--------|------------|--------|
  | PRD-001 | DH PACS | Build | dh-built | selling |
  | PRD-002 | DHV | Build | dh-built | selling |
  | **PRD-003** | **Advanced DICOM Image Viewer** | Supply ⚠ | **resold** (Inobitec) | **selling ★** |
  | PRD-004 | DHDicomAnalyzerPro | Build | dh-built | planning (no code) |
  | PRD-005 | HMS | Facility | dh-built | internal, non-commercial |

- **MIMP-008** (`E:\DH-Advanced-Viewer`, 13 ADRs) and **MIMP-009** (`E:\DHV-Weasis`, 17 ADRs)
  registered — two of the three products had no project record at all.
- **MIMP-004 repointed** from the dead `E:\DH-PACs-Solutions` to `E:\DHS-PACS`, and re-roled as the
  Commercial Hub holding Authority over Commercial Content.
- `mimp init` now prompts **Pillar** and **Product** (product list read live from the registry).
- MCP: three display sites migrated off `niche`/`business_unit`; `get_business_overview` gained a
  full **Products** block surfacing north-star, revenue line, proof, succession and risks.
- Verified: PowerShell `ConvertFrom-Json`/`ConvertTo-Json` round-trip preserves entities, programs
  **and** products; all JS parses; `mimp.ps1` parses; zero stale field references.

⚠ **`PRD-003.pillar` is flagged TO CONFIRM.** Resold third-party software fits no pillar cleanly —
it is not DH-produced (Build), not equipment (Supply), not labour (Service). Provisionally Supply,
with `pillar_confidence` recording the doubt in-band. The north-star product not fitting the
company's own taxonomy is worth a deliberate answer.

### Still unregistered (not products — deferred by decision)

DHS-CRM, DHS-ERP, Isotope/Cyclotron, BDC_Marketing, Personal_Branding, BDCHMSV2. Three of these
already hold `CONTEXT.md` files and **41 unpushed memory files** sit in their Claude memory dirs.
