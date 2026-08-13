---
name: project-wadouri-retrieval-phase1
description: Phase 1 large-study fix — flip imageRendering wadors→wadouri in the DOCTOR viewer app-config. Deployed 2026-07-13, then ROLLED BACK same day — MPR broke. Next step is two-data-source scoping (§5), not a plain retry.
metadata: 
  node_type: memory
  type: project
  originSessionId: 9f5e76ae-029b-4131-ae92-ebc6a962fe06
---

Fix for ~80-min load of large uncompressed multiframe CTs in DHV. Root cause: OHIF `imageRendering: 'wadors'` loads frame-by-frame; Orthanc pays ~2s to extract one frame from a 278MB uncompressed multiframe object (no offset table), doesn't parallelize. Fix = whole-object retrieval via `wadouri`. Plan doc: `Docs/Data_Reloading/OHIF_Whole_Instance_Retrieval_Plan.md`. Diagnosis lived in [[project-large-study-load-time]] (dh-pacs-doctor project).

**Grilled & finalized 2026-07-13 (`/grill-with-docs`). Decisions:**
- **Q1 — where it ships:** verify/reason in this repo (`ohif-fork`), but the change is a Tier-1 `app-config.js` key flip. The file that ships lives in **dh-pacs-central's runtime-mounted config on the VM**, NOT in this fork's `platform/app/public/config/*.js` (those are build-time defaults, overridden in prod). **No source commit to this fork.**
- **Q2 — scope:** `imageRendering` is a **data-source-level** key (`sourceName: 'dicomweb'`), not per-mode. Do a **global flip** on that data source. Two-data-source scoping (route PET-CT→wadors) is a **contingency only** if a tmtv volume regression is actually measured.
- **Q3 — thumbnails:** flip `imageRendering` only. **Keep `thumbnailRendering: 'wadors'`** — wadouri thumbnails would eagerly pull all 7 whole objects (~1.9GB) at panel open to slice frame 1. Bad.
- **Q4 — one-line diff:** confirmed against LIVE configs (fetched 2026-07-13). Only `imageRendering: 'wadors' → 'wadouri'`. `requestTransferSyntaxUID:''`, `singlepart`, `useBulkDataURI`, `wadoUriRoot:'/wado'` unchanged. getImageId hardcodes `transferSyntax=*` so Orthanc returns stored uncompressed as-is.
- **Q5 — which config:** there are **TWO** live configs, both currently wadors/wadors:
  - Patient viewer → root **`/app-config.js`** (routerBasename `/`, basic/stack only).
  - Doctor viewer → **`/viewer-doctor/app-config.js`** (routerBasename `/viewer-doctor`, carries tmtv + longitudinal).
  **Flip the DOCTOR config FIRST, alone.** Patient viewer DEFERRED pending a large-CT **mobile-phone memory test** (1.9GB decoded on a phone = OOM risk; patient audience is mobile-first).

**⚠️ DEFERRED / FLAGGED WORK — tmtv PET-CT verification:**
The measured study (DUD Miah, token `03ec938e-...`) is **CT-only → opens in `longitudinal`, stack view**. It does NOT exercise the Cornerstone3D **volume loader**, which is the actual Q2 risk. tmtv (fusion/SUV) and longitudinal-MPR both use the volume loader. **No PET-CT study currently available in prod to test tmtv.** DECISION: ship the doctor flip with tmtv **"flipped-but-unverified — monitor first real read."** **When a live PET-CT patient arrives, come back and verify tmtv+MPR under wadouri** (watch for broken/degraded volume rendering; contingency = two-data-source scoping per Q2).

**Status 2026-07-13 — deployed, tested, ROLLED BACK same day:**
- Deployed to the doctor viewer. **Correction to Q1/rollback mechanism discovered during deploy**: the
  doctor config is NOT on the `ohif` container's `:rw`/gzip path like the patient config. It's a separate
  file, `/srv/pacs/config/ohif/doctor-app-config.js`, mounted `:ro` into the **`nginx`** container and
  served via nginx `alias` + `sub_filter` intercept — no gzip involved. **Restart/recreate `nginx`, not
  `ohif`, to deploy or roll back this config.** Also hit a real gotcha: `sed -i` (and most editors) do an
  atomic rename-based edit, which swaps the file's inode — Docker single-file bind mounts follow the
  original inode, so the container silently kept serving the OLD content even though the host file was
  correct. Always recreate the `nginx` container after editing, don't assume a plain file edit is live.
  Full corrected procedure now lives in `Docs/Data_Reloading/OHIF_Whole_Instance_Retrieval_BUILD.md` §3.
- **§4.1 transport sanity: PASS** — `/wado` whole-object fetch, HTTP 200, ~10.5 MB/s.
- **§4.2 stack scroll: PARTIAL** — request pattern correct (whole-object `wado?...objectUID=` fetches, not
  per-frame), but wall-clock badly missed the ≤3min target: ~9 min total from open, needed a manual reload
  to ever complete.
- **§4.3 MPR: FAIL** — MPR rendered completely blank in `longitudinal` under `wadouri` (real screenshot
  evidence, `[object Object]` in the instance-number overlay — volume loader choking on whole-object data).
  This is the exact Cornerstone3D volume-loader risk flagged in the Plan doc §4.1.
- **Rolled back same day**: restored `doctor-app-config.js` from pre-change backup, recreated `nginx`.
  Confirmed via Cloudflare + origin: back to `wadors`/`wadors`. Doctor viewer is back to its pre-Phase-1
  state as of 2026-07-13 ~11:46 UTC. Failed wadouri config preserved on the VM as
  `doctor-app-config.js.wadouri-failed-2026-07-13` for reference.
- **tmtv/PET-CT flag from Q2 is now moot for this attempt** — reverted before any PET-CT study could be
  tested, and would have been a lower priority than the MPR failure anyway.
- **Next step is §5 (two-data-source scoping)**: keep `longitudinal` stack scroll on `wadouri` (works) but
  route anything invoking MPR/volume rendering to a `wadors` data source, since the volume loader — not
  the stack-scroll path — is the confirmed failure point. The §4.2 timing miss also needs separate
  investigation before any re-attempt. NOT a plain retry of the global flip.

See [[feedback-build-deploy-ops]] for deploy/verify conventions.
