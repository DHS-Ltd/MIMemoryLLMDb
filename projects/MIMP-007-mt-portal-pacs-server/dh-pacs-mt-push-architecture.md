---
name: dh-pacs-mt-push-architecture
description: Deferred design decision — user wants MT-gated PUSH (image stays local until MT pushes); current build auto-forwards instead
metadata: 
  node_type: memory
  type: project
  originSessionId: d36e60e0-598b-4e8b-9e7a-fa48aeed765b
---

The user's intended DH PACS Workstation workflow (stated 2026-06-04): a patient image arrives at the **local** Orthanc, the MT matches the patient, and **only then** does the MT push that one study to central to mint the link. The image must NOT leave the box until the MT acts — "it only fires an upload when it is asked to upload."

**Why this matters:** the current build does the OPPOSITE, and the pieces are coupled. Component A's `forward_to_central.lua` `OnStableStudy` **auto-forwards every stable study** to central. The MT Portal's pending queue (`portal/src/pages/PendingStudiesPage.tsx`) is the intersection of local Orthanc studies and **central's** `pending` list, and the claim/safety-check run against central — so a study must already BE at central to be claimable. Therefore just disabling the auto-forward Lua leaves the MT with nothing to claim (everything shows as "already processed").

**DEPLOYED & LIVE end-to-end (2026-06-07).** Match-then-push works in production: central endpoints + `pixels_received_at` migration deployed to the VM; portal v0.2.0 built+installed; MT claims a study → link minted instantly → background C-STORE push → gated handoff reveals link when pixels arrive. Also live: **upload-progress UX** (real progress bar from the local Orthanc C-STORE job, global UploadTray, non-blocking "Process next study", live % in the queue) and **upload telemetry Tier-A** (size_bytes/uncompressed_bytes/series_count/instance_count + push_started_at captured at `/studies/received`; availability latency = pixels_received_at − claimed_at). Central `cancel` now no-ops once pixels arrive (`already_received`). See `docs/MT_UPLOAD_PROGRESS_UX_PLAN.md` + `docs/CENTRAL_PATIENT_LIST_DATA_REFERENCE.md` §10. Workstation commit `753ac31`; central commits `dc7f393`/`2d79736` (+ user's Tier-A telemetry in legacy.js/init.sql).

**Original design (2026-06-06 grill, see `docs/adr/0001-mt-gated-match-then-push.md` + `CONTEXT-MAP.md`/`portal/CONTEXT.md`).** The old 3-part plan below was WRONG on two points: it claimed central needs no code change, and it assumed push-then-claim. The agreed (and now shipped) design:

- **Component A**: remove the `OnStableStudy` forwarder **entirely** (all sites). The Receiver only lands studies locally; it never talks to central.
- **Portal is the sole uploader**, acting on **Site Mode** held in the box `.env` (`LINK_MODE=auto|mt_gated`); central `link_mode` is the **fail-safe backstop** (no machine-auth was built — none exists in central; AET is the only headless identity). Mismatch fails safe (stuck study, never a wrong link).
- **Auto site**: portal pushes every local study headlessly via the *local* Orthanc C-STORE (`/modalities/Central/store`, no central auth, no MT); dedup by tagging pushed studies in local Orthanc metadata.
- **mt_gated site = match-then-push** (user chose: image leaves only AFTER match): MT matches/creates patient -> **safety-check runs server-side on DICOM tags read from local Orthanc and sent in the request** (new central endpoint; central stays source of truth) -> on confirm the **Link is minted immediately** from the supplied snapshot, pixels push in **background**, and the **patient Handoff (Link/PDF reveal) is gated** on central confirming arrival (`pixels_received_at`, stamped by the existing stable-study webhook). Arrival reconciliation: already-linked -> stamp & skip the `link_mode` branch. **No on-arrival re-verification** (local Orthanc is single source of both tags+pixels). Push failure -> **retry** (handoff stays locked) **+ Cancel** that revokes the link and returns the study to the to-process queue (new central cancel/revert endpoint).

**Central code changes required** (the old "no change" claim was wrong): safety-check-on-tags endpoint; pre-upload claim creating the linked study row from the supplied snapshot; `pixels_received_at` column + status endpoint; webhook reconciliation (already-linked short-circuit in `legacy.js` `/studies/received`); cancel/revert endpoint. Both components bump versions together (central-contract change). Related: [[dh-pacs-program-status]], [[dh-pacs-next-session-tests]].
