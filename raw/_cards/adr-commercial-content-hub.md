---
card: adr-commercial-content-hub
source: 0001-dhs-pacs-as-commercial-content-hub.md
origin: E:\DHS-PACS\docs\adr\0001-dhs-pacs-as-commercial-content-hub.md
sha256: 4e55ef0b4e6a8f2b643324281bb1ecc704bc12889e6b3bce71ec34155a43cc10
source_modified: 2026-08-03
registered: 2026-08-10
status: ingested
---

# Source: 0001-dhs-pacs-as-commercial-content-hub.md

| Field | Value |
|-------|-------|
| Origin | `E:\DHS-PACS\docs\adr\0001-dhs-pacs-as-commercial-content-hub.md` |
| SHA-256 | `4e55ef0b4e6a8f2b…` |
| Source modified | 2026-08-03 |
| Registered | 2026-08-10 |
| Status | **ingested** |

## Abstract

Establishes DHS-PACS as the single home for Commercial Content across all three products, regardless of which repo the content was drafted in. The routing test is content type, not audience. This is the decision MIMemoryLLMDb defers to in ADR-0006 when it stops asserting commercial facts.

## Pages fed

- `org/relationships.md`
- `org/programs/adpp-campaign.md`

---

> The Source itself is **not** committed — `raw/` is gitignored (ADR-0007). The SHA-256 above is what lets mechanical lint detect that the Source changed after this card was written.
