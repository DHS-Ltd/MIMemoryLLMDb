---
name: pending-ibnsina-beat6-patient-link-node
description: "Unresolved: user saw a QR code node rendering only on the left side of the Ibn Sina demo portal post-demo, but no trace of that node exists anywhere on Machine A"
metadata: 
  node_type: memory
  type: project
  originSessionId: 51b3b7f4-9ed0-451f-b26f-249dee0159f5
  modified: 2026-09-16T09:16:37.016Z
---

Recorded 2026-09-16, post-demo, during a `/grill-with-docs` session. **Nothing below is resolved — this is a paused investigation, not a finding.**

## What the user reported

After going through beat 5 of the Ibn Sina demo run-of-show, the user wanted to work on the last beat (beat 6, the Patient Link/QR beat): the QR code **node only appears on the left side of the portal**, and wanted this planned and fixed.

## What the documented record says (contradicts the report)

- `docs/IbnSinaCancerPacs/DEMO_BUILD_FINAL.md`, AS-BUILT section (written 2026-09-16, 04:45–05:55): **"B5 — Patient Link node + modal | The node's timing was its claim, and decoupling killed the claim. Beat 6 moved off the laptop entirely."** — i.e. cut before it was ever built, replaced by a physically printed QR card.
- `docs/IbnSinaCancerPacs/CONTEXT.md`, glossary entry **Patient Link**: *"It is not on the portal map. The node was designed and then cut the same night... Beat 6 runs off the laptop entirely, as a printed QR card."*
- `DEMO_RUN_OF_SHOW.md` is internally split: its correction table (near the top) agrees the node/modal was cut, but the beat-6 prose further down was **never rewritten** and still describes clicking a `Patient Link` node that opens a phone modal with a QR. This is a known stale-doc inconsistency, not evidence the node exists.

## What was actually checked on Machine A (`E:\dcm4chee_Testing\portal\`)

- Current `index.html`: no `Patient Link`, `qr`, or `plink` reference anywhere (grep, case-insensitive).
- `index.html.bak-20260916-011534` (an earlier-tonight backup) and the transfer patch files (`.laptop_baseline.tmp`, `.patch2.tmp`, `.patch3.tmp`): same — zero matches. The node has **no trace in Machine A's history at all**, current or past.
- Machine A's own live-served portal (`http://localhost:7000/`) was diffed byte-for-byte against the on-disk file: **identical**. No drift between disk and running container here.
- `make_qr.py` exists in the portal folder (matches B6's spec for generating a static QR PNG), but `portal/static/` currently holds only `dhp.png` and `ibnsina.png` — no `patient_qr.png` on disk right now.

## What's unresolved

- The user confirmed **they personally did not edit the portal code** — so if the node exists anywhere, it would have to be on the demo laptop's copy (`D:\dcm4chee-lab\portal\index.html`), which diverged from Machine A independently, or the "portal" the user means is a **different system entirely** (not the Ibn Sina demo rig SVG map) — this was never disambiguated.
- The laptop's stack was brought back up (`docker compose up -d` in `D:\dcm4chee-lab\compose`, confirmed running: portal/ldap/db/arc containers all up) during this session, but **port 7000 timed out over the tailnet** even though `tailscale ping` succeeded (DERP relay). This is plausibly deliberate — the docs are explicit that the QR link is a bearer credential and warn against exposing that portal beyond the laptop itself — so forcing it open to check was deliberately not pursued.
- The next concrete step, not yet run: on the laptop itself,
  ```powershell
  Select-String -Path "D:\dcm4chee-lab\portal\index.html" -Pattern "qr|patient.?link|plink" -CaseSensitive:$false
  ```
  This determines, in one shot, whether the node exists there at all. If it does, get the actual `<g class="node">` markup and `transform="translate(...)"` coordinates from that file — that's what would explain a "left side" placement bug (the design spec calls for `translate(408,540)`, deliberately outside `stations-g`'s left column at `x=32`, so a node rendering on the left would mean it landed inside/near the station list instead of at its designed position under Image Archive).

## For the documentation narrative

When beat 6 / the Patient Link node is written up, the honest narrative has two possible branches depending on what the laptop check above finds:
1. **The node never existed anywhere** — the user's "beat 5" review surfaced a stale expectation from the not-yet-rewritten `DEMO_RUN_OF_SHOW.md` prose (see the internal contradiction above), not an actual bug. The documentation fix is to finish rewriting that prose to match the AS-BUILT cut, closing the inconsistency.
2. **The node exists only on the laptop** — someone (possibly an AI session run directly on the laptop, outside this repo's tracked history) reversed the AS-BUILT cut and rebuilt B5 independently, with a placement bug. The documentation fix is to reconcile that laptop-only build back into `DEMO_BUILD_FINAL.md` / `CONTEXT.md` (updating the "cut" language) before fixing the coordinates per the original B5 spec (`translate(408,540)`, `w-plink` wire from `(508,492)` to `(508,540)`, class `wire web`).

Related: [[project-demo-rig-machines]], [[project-dh-pacs-ibnsina-commercial-posture]]
