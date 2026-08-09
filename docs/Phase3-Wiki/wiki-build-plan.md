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

### Phase 2 — Lint

| # | Task | Detail |
|---|---|---|
| 2.1 | `mimp lint` (mechanical, deterministic, no tokens) | Broken links · wikilink/filename mismatch · orphan pages · Wiki claims with no card · cards that fed no page · **Source hash drift** (card SHA vs file on disk) · review-horizon breaches · passed registry deadlines. Runnable on either machine; warn-only pre-push. |
| 2.2 | Semantic lint prompt | Contradictions between pages, claims gone stale, concepts referenced everywhere with no page. Run every N ingests or monthly. |

Keeps the MCP server a context-assembler that never calls a model. Note 2.1 would have caught both
the passed `MIMP-005` deadline and the 6 broken wikilinks months ago.

### Phase 3 — Retrieval

| # | Task |
|---|---|
| 3.1 | `search_memories` gains `scope` ∈ {projects, wiki, org, all}, default `all` — also closes the existing gap where `org/` is unsearchable |
| 3.2 | `get_wiki_page` — page plus outbound links |
| 3.3 | Extend `mcp-server/test-brain-tools.mjs`; restart Claude Desktop; `git pull` + restart on machineB |

⚠ MCP reads `origin/master` ([repo.js:199](../../mcp-server/lib/repo.js#L199)) — **nothing is
retrievable until pushed.** Document this in `wiki/RULES.md`.

### Phase 4 — Widen the corpus, then the vault

Build pillar first: DHV-Weasis (17 ADRs, now MIMP-009) → DH-Advanced-Viewer (13, now MIMP-008),
prioritising the **Inobitec Sales_Enablement** corpus since PRD-003 is the north-star. Then
Isotope/Cyclotron, BDC Marketing, DHS-CRM, DHS-ERP, Personal_Branding — **none of which the brain
knows exist**. Register repos under v2.1 as they are ingested, not in a big-bang pass.

**Obsidian vault — demoted here from Phase 1.7 on 2026-08-10.** The reason is architectural, not
scheduling: ADR-0006 made the brain **cite** rather than assert, so `wiki/` and `org/` links point at
absolute paths in *other* repos — and **Obsidian cannot draw a graph edge to a file outside the
vault**. The provenance edges, which are the entire point of citing, are structurally invisible to it.
Nor can the vault simply be widened: `E:\` holds **6,660** markdown files (DHSR 3,744,
ClaudeRulesMemoryRepository 1,110, SR 749), so an `E:\`-rooted vault is noise.

What survives is the **internal** concept graph among wiki pages — which only becomes informative
once `wiki/` has real page count (the video's own ~100-article threshold). At 68 files today, a
folder listing tells you more. Setup remains trivial whenever wanted: open the repo root as a vault,
exclude `mcp-server/node_modules` (**148** md files against **60** real), commit `.obsidian/` so
machineB shares the config.

For provenance visualisation the right tool is a **generated** graph (Phase 3 Graph Brain or
`/graphify`), which is built from the registry plus parsed citations and can therefore follow
absolute paths across repos — the exact thing Obsidian cannot do.

### Phase 5 — Freshness

Absorbs the pending step-1.5 weekly `DIGEST.md` strategist on machineB, now fed by lint output.
`whats_next` becomes a routine that is actually run — it worked correctly all along; nobody called it.

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
