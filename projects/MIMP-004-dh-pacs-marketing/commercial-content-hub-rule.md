---
name: dhs-pacs-commercial-content-hub-rule
description: "DHS-PACS is the single Commercial Content hub for DH PACS, DHV, and DHDicomAnalyzerPro — established 2026-08-03; full definitions in CONTEXT-MAP.md and ADR-0001"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 2a5dbb6d-8cda-45a6-93cc-29c2d972972e
  modified: 2026-08-03T01:50:51.174Z
---

Established 2026-08-03 via `/grill-with-docs`. DH Solutions Ltd sells three products, each with
its own engineering repo: **DH PACS** (this repo), **DHV** (viewer, `E:\DHV-Weasis`), and
**DHDicomAnalyzerPro** (Slicer-based analysis tool, `E:\DH-Advanced-Viewer`).

**The rule:** Commercial Content — marketing plans, positioning, pricing, official channel posts,
pitch decks, customer proposals — for **any** of the three products lives in DHS-PACS, never in a
product's own engineering repo. Routing test is content **type**, not audience: an internal GTM
note that only shapes an engineering decision still counts (e.g. `DH-Advanced-Viewer`'s
"Positioning locked" paragraph). Engineering/technical docs stay local to each product's repo.

**Where it lands here:** DH PACS's own content stays at the existing top level
(`docs/MarketingStrategy/`, `docs/DH_PACS_BRAND_VOICE.md`, `docs/research/`) since this repo is
DH PACS's home. DHV → `docs/DHV/` (not yet created). DHDicomAnalyzerPro → `docs/DHDicomAnalyzerPro/`
(not yet created).

**Full docs:** `E:\DHS-PACS\CONTEXT-MAP.md` (new — this repo is now formally multi-context) and
`E:\DHS-PACS\docs\adr\0001-dhs-pacs-as-commercial-content-hub.md`.
Enforced in `CLAUDE.md` (both this repo and `E:\Self_project\Personal_Branding\CLAUDE.md`, new).

**Not done yet (explicitly deferred, "one by one" per user):** no content has actually been moved
out of `DHV-Weasis` or `DH-Advanced-Viewer` yet. This session only established the rule and the
destination structure. DHV-Weasis has no CLAUDE.md/CONTEXT.md at all yet — may need bootstrapping
before its migration pass.

**Also resolved this session:** DHV is confirmed to be a two-track product (OHIF web viewer +
Weasis desktop client), not just the OHIF fork the old IbnSinaCancerPacs docs implied.
