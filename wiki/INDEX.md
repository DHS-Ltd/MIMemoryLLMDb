<!-- WIKI LAYER | wiki/INDEX.md | The Wiki's front door. Maintained on ingest. -->

# Wiki Index

Sourced synthesis across DHS's repos. Every claim on every page below cites a Source card in
[`../raw/_cards/`](../raw/_cards/). Rules: [`RULES.md`](./RULES.md). Vocabulary:
[`../CONTEXT.md`](../CONTEXT.md).

> **Status: scaffolded 2026-08-10, no pages yet.** Phase 1 registered the Sources and rebuilt `org/`
> as cited; page-writing begins in Phase 4 once the corpus widens beyond DHS-PACS. This is
> deliberate — writing synthesis pages before the ingest loop has run more than once would bake any
> systematic mistake into every page at the same time.

## Pages

_(none yet)_

## Sources registered — 19 cards

| Status | Count | Meaning |
|--------|-------|---------|
| `ingested` | 9 | Read in full; abstract written |
| `unread` | 10 | Registered and hashed, not yet read — **no abstract written, deliberately** |

### Ingested

| Card | Source |
|------|--------|
| `dhs-pacs-context-map` | `E:\DHS-PACS\CONTEXT-MAP.md` — the commercial glossary and Authority |
| `dhs-brand-strategy` | `…\docs\MarketingStrategy\DHS_BRAND_STRATEGY.md` — pillars, chain, tiers, personas, R1–R8 |
| `adr-serve-the-surgeon` | `…\docs\adr\0002-*` — why the patient-ownership category was abandoned |
| `adr-commercial-content-hub` | `…\docs\adr\0001-*` — DHS-PACS holds Authority over Commercial Content |
| `dhs-crm-context` | `…\docs\CRM\CONTEXT.md` — Going Cold / Going Quiet; the follow-up failure mode |
| `adr-ibnsina-enterprise-posture` | `…\IbnSinaCancerPacs\adr\0005-*` — how Ibn Sina diverges from Standard |
| `dh-advanced-viewer-context-map` | `E:\DH-Advanced-Viewer\CONTEXT-MAP.md` — three contexts + the PHI rules |
| `inobitec-sales-enablement` | `…\Inobitec\Sales_Enablement\README.md` — the Answer Bank contract |
| `karpathy-llm-wiki-video` | `raw/Video_reference/transcript_clean.txt` — the Source that prompted Phase 3 |

### Unread — registered, hashed, drift-checkable

`popular-diagnostic-proposal` · `pacs-market-research-bd-2026` · `adr-crm-three-layers` ·
`adr-crm-case-shape` · `adr-crm-interaction-history` · `adr-ibnsina-federated-mesh` ·
`adr-ibnsina-two-plane-exposure` · `adr-ibnsina-single-codebase` · `adr-ibnsina-data-redundancy` ·
`adr-website-cloudflare-workers`

## Not yet registered

**29 more ADRs** across the estate: DHV-Weasis (17) and DH-Advanced-Viewer (13, minus the map
already carded). Plus `CONTEXT.md` files in DHS-CRM, DHS-ERP, Isotope/Cyclotron, Personal_Branding,
BDCHMSV2 and Self_project. Phase 4 widens to these, Build pillar first.

## Where the current answers actually live

Until Wiki pages exist, the synthesised view is in `org/`:

- [`../org/business.md`](../org/business.md) — pillars, Surgeon Chain, products, tiers, revenue lines
- [`../org/north-star.md`](../org/north-star.md) — the north star, what failed, account states, R1–R8
- [`../org/relationships.md`](../org/relationships.md) — typed edges
- [`../org/programs/adpp-campaign.md`](../org/programs/adpp-campaign.md) — the campaign
