---
name: dh-pacs-tech-deck
description: "Ibn Sina TECHNICAL-facing architecture deck (distinct from the management deck) — audience, spine, decisions, and the measured DHV storage metric. Built 2026-06-21."
metadata:
  node_type: memory
  type: project
  originSessionId: 7c0034ad-0073-4342-97a9-22d14339372e
aliases: [dh-pacs-tech-deck, dh_pacs_tech_deck]
---

A second Ibn Sina deck — **technical-facing**, distinct from the management deck ([[dh-pacs-ibnsina-commercial-posture]]). Built `docs/IbnSinaCancerPacs/presentation/build_tech_deck.py` → `DH_PACS_IbnSina_Technical.pptx` (19 slides, English-only, same visual system/palette/fonts/helpers as `build_deck.py`).

**Audience:** Ibn Sina **IT / biomedical / CIO** (Layer 1 technical validators). Job: make them *want* the future federated implementation — proven by engineering, not claimed as built.

**Spine:** **TCO, proven by the federated architecture** ("never buy peak capacity you may never reach; add a Site Server only when a center needs it"). Architecture-first arc; cost/comparison lands last. Value triad woven throughout: **storage efficiency · cost control · new revenue Ibn Sina owns**.

**Foil:** ONLY commercial enterprise PACS (GE Centricity / Philips Vue / Sectra / Agfa / Fujifilm Synapse / Carestream) — central archive/VNA, capital + per-user/study/seat license meter, lock-in. Open-source / custom-build is NOT a competitor — it is DH's partnership moat + future-modules story. Cost numbers: **sourced public figures for commercial** (~$100K–$millions all-in; Sectra ~$10K→$50K→$100K+/yr + impl $20K–100K — RamSoft/SBS/Hyland/ITQlick/Capterra); **DH side figurative/relative** (no invented taka — honors the never-guess-pricing rule).

**Positioning:** Ibn Sina's own **custom, branded solution** — they receive a **branded source repository**; **DH = named technical implementation partner**; Ibn Sina becomes DH's **flagship reference site**. IP/financial/DH-retained-access terms stay in the commercial track.

**Maturity (honest):** presented as **future implementation**, justified by need (storage efficiency + cost + revenue) — NOT claimed as built. Live DHV workstations already in Ibn Sina centers are the credibility anchor; the mesh is the designed next step.

**Measured DHV storage metric (the empirical anchor, slide 5 proof panel):** ~**1 TB per 1,000 patients** (rough planning rule, measured) and ~**1,257 patients since February 2026 ≈ ~1.26 TB** — taken from Ibn Sina's installed DHV system. **Measured fact only, no run-rate projection** (user's call). Footnote: PET/CT cancer studies run larger (conservative floor). Unit confirmed = per *patient* (1,257 = distinct patients).

**Peer-backup feature (own slide 13 + amended into ADR 0004 / ARCHITECTURE §8):** Site Servers back **each other** up — **configurable 1:1 DR-buddy + 1:many fan-out/shard** — so a downed site is recovered from an alive peer; Directory re-points on site loss. Honest cost claim: **no *dedicated* DR hardware; reuse distributed spare capacity** (never "free"). Key synthesis: every Site Server added for primary growth also enlarges the shared backup pool → one purchase = capacity + DR.

**19-slide arc:** 1 Title · 2 Requirement · 3 Design principles(triad) · 4 Architecture overview · 5 Site Server(+measured-storage proof panel) · 6 Patient Directory · 7 Two planes · 8 Identity/HIS · 9 Clinician experience · 10 Patient experience · 11 Security/data ownership · 12 Reliability/redundancy(L1/L2/L3) · 13 Peer backup · 14 Operations/growth · 15 Extensibility(branded build) · 16 Off-the-shelf trap · 17 Why custom wins(matrix) · 18 Cost payoff · 19 Partnership close.

**Why:** designed in the 2026-06-21 grilling session for a technical audience, after the management deck. **How to apply:** keep this deck technical and architecture-first; never put financial-model figures or IP-ownership terms on it; always cite the commercial PACS numbers as sourced and keep DH's side figurative; the 1 TB/1,000-patient + 1,257-patient figure is real measured data — present as measured, not projected.
