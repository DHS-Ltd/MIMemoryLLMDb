<!-- WIKI LAYER | wiki/RULES.md | How the assistant operates the Wiki. Not a glossary (that is CONTEXT.md), not a format spec (that is SCHEMA.md). -->

# Wiki Rules

The operating instructions for reading Sources and maintaining `wiki/`. Vocabulary lives in
[`../CONTEXT.md`](../CONTEXT.md); file format lives in [`../SCHEMA.md`](../SCHEMA.md); why this
layer exists is [ADR-0006](../org/decisions/ADR-0006-mimp-cites-not-asserts.md) and
[ADR-0007](../org/decisions/ADR-0007-source-cards-not-raw-binaries.md).

## 1. Purpose

**Synthesise knowledge that spans DHS's repos, and detect when it goes stale or contradicts itself.**

DHS's knowledge lives in ~20 repos as `CONTEXT.md` files and 48 ADRs. Each repo holds **Authority**
over its own subject. This Wiki holds Authority over nothing. It exists for the three things no
single repo can do:

1. **Synthesis across repos** — the company-wide picture.
2. **Supersession tracking** — when a Source replaces a claim, record the replacement and name the
   stale copies still living elsewhere.
3. **Staleness reporting** — which Source a page came from, when, and whether it has moved since.

## 2. Folders

| Path | What | Committed? |
|------|------|-----------|
| `raw/` | Sources — the actual documents | **No** — gitignored |
| `raw/_cards/` | Source cards: origin, SHA-256, date, abstract, pages fed | **Yes** |
| `wiki/` | Wiki pages — Sourced synthesis | Yes |
| `org/` | The cited company index | Yes |
| `projects/` | Per-project memory (unchanged) | Yes |

## 3. Ingest

When a new Source appears — usually a `CONTEXT.md`, an ADR, or a strategy doc in another repo:

1. **Read it in full.** Never summarise from a filename or a heading list.
2. **Write or update its Source card** in `raw/_cards/<slug>.md`: origin path, SHA-256, source
   modified date, registered date, `status`, abstract, and pages fed.
3. **Check for supersession first**, before writing anything new. Does this Source replace a claim
   already in `wiki/`, `org/`, or `projects/`? If so, banner the old claim with what replaced it and
   when. **Never delete** — stale copies survive in other repos and must stay traceable.
4. **Create or update Wiki pages.** Prefer updating an existing page over creating a near-duplicate.
5. **Update `wiki/INDEX.md`.**
6. **Log what changed** in the card's *Pages fed* list.

**`status` is honest, not aspirational.** `ingested` means the document was read. `unread` means the
Source is registered and hashed but not read. Never write an abstract for an `unread` Source — a
fabricated abstract is worse than an absent one, because it is indistinguishable from a real one.

## 4. Page format

- **Summary first.** Every page opens with what it is, in two or three sentences.
- **Every claim cites a Source card.** A claim with no card is a lint defect, not a style choice.
- **Link related pages.** Wikilinks must match a filename or a frontmatter `aliases:` entry —
  otherwise they resolve to nothing.
- **Wiki pages are not Nodes.** Entities, Programs, Projects and Products live in `registry.json`.
- **Absolute paths to Sources are expected** and will not render as graph edges in any viewer. That
  is accepted (see the Phase 4 note in the build plan).

## 5. Answering questions

1. **Consult the Wiki first**, then `org/`, then `projects/`.
2. **Cite** which page and which Source card an answer came from.
3. **Flag uncertainty** rather than smoothing it — say which part is unsourced.
4. **Check the Authority before asserting anything commercial.** `E:\DHS-PACS` owns Commercial
   Content. If this repo and a Source disagree, **the Source wins**, and the disagreement is a defect
   to report.
5. **Never present a superseded claim as current.** If a page carries a supersession banner, the
   banner is part of the answer.

## 6. Lint

**Mechanical** — deterministic, no model, runnable any time:

- broken links and wikilink/filename mismatches
- orphan pages (nothing links in)
- Wiki claims with no Source card reference
- Source cards that fed no page
- **Source hash drift** — card SHA-256 vs the file on disk
- review-horizon breaches and passed registry deadlines

**Semantic** — needs a model, run every N ingests or monthly:

- contradictions between pages
- claims gone stale against their Source
- concepts referenced everywhere with no page of their own

Lint **reports**; it does not silently fix.

## 7. What must never live here

- **Commercial Content** — marketing plans, positioning, pricing, official posts, pitch decks,
  customer proposals. These belong in `E:\DHS-PACS` (its ADR-0001). The routing test is content
  **type**, not audience: internal GTM notes count.
- **CRM records** — Accounts, Contacts, Opportunities. The brain holds neither records nor identity.
- **Patient-identifying material** of any kind. Clinical evidence enters only in **Case Shape**:
  age, sex, modality, finding, cost, what went wrong. No names, no accession or bill numbers, no
  report or prescription files.
- **Sources themselves.** Only their cards.

## 8. Machine notes

- The MCP server reads **`origin/master`**, not your working tree. **Nothing is retrievable until it
  is pushed.**
- `wiki/` is written on **machineA only** (ADR-0007). machineB reads.
- Adding a page does not make it findable — `search_memories` must be scoped to include `wiki/`.
