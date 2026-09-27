---
name: dh-pacs-duplicate-link-display-bug
description: 2026-08-30 fixed — one uploaded study showed as 3 separate "study" cards in Admin + Patient portal at Central; root cause was an un-deduplicated LEFT JOIN app.links fanning one Study row into N rows whenever it had >1 active link
metadata:
  node_type: memory
  type: project
  originSessionId: unknown
  modified: 2026-08-30T13:09:20.914Z
---

**Symptom (2026-08-30, SITE016 Baroicha, patient DHP-26083001):** admin patient-detail page and the
patient portal both showed "Studies (3)" for a single DX upload — identical size/throughput/claimed-by
across all 3 cards, but different link tokens/view-counts/expiry.

**Root cause:** only 1 row ever existed in `app.studies` (`study_uid` is globally `UNIQUE`). The "3
entities" were 3 non-revoked `app.links` rows for that one study, fanned out by
`LEFT JOIN app.links l ON l.study_id = st.id AND l.revoked = FALSE` with no de-dup — present
identically in **6 places** in `dh-pacs-central/deploy/backend/src/routes`: `patients.js` (admin),
`patient-portal.js` (×2 — the portal list AND a single-study lookup), `mt-studies.js` (MT queue),
`doctor-patients.js` (Doctor portal), `legacy.js` (`/v1/studies` polling). One link was the MT's claim
link; two were `created_by='patient_share'` from the OHIF viewer's own "Share" feature
(`POST /studies/:studyUid/share-links` in `legacy.js`), which minted a fresh link every click with no
revoke/reuse of the prior one.

**Fix (deployed to central VM 2026-08-30, `backend` rebuilt):**
1. `share-links` now revokes any prior `patient_share` link before minting a new one (at most 1 active
   Share Link per study).
2. All 6 query sites replaced the plain `LEFT JOIN` with `LEFT JOIN LATERAL (... ORDER BY priority,
   created_at DESC LIMIT 1)` picking one deterministic **Primary Link** (MT claim > Admin-generated >
   Share Link) — same column shape as before, so **zero frontend changes needed**.
3. Deliberately did NOT do the "more correct" array-of-links rework, because `LinkManager.tsx`
   (admin-ui) and the equivalent patient-ui/doctor-ui components all assume a singular
   `study.uuid_token` — checked this *before* committing to the fix shape, since the user's first
   answer ("aggregate into an array") would have required a 3-frontend rework nobody had scoped.
   Full write-up: `dh-pacs-central` ADR-0020, `CONTEXT.md` **Link** entry (updated same session).

**Verified:** direct psql query against patient 204 in production returns exactly 1 row post-fix
(was 3). Screenshot-confirmed by the user in the admin UI.

**Surfaced during unrelated work:** the user was testing an OHIF-fork fix for DX-modality images not
rendering on mobile, using the viewer's Share feature repeatedly against a test upload — that's how the
2 stray `patient_share` links got minted. The mobile-display fix itself lives in a third repo
(`ohif-fork`, built into `pacs-ohif-dhs:v1`) not present in this or the central working tree, and was
unrelated to either bug found here — see [[dh-pacs-leg1-upload-compression]] for the (non-)issue with
compression that was checked in the same session.

Related: [[central-vm-deploy]] (deploy mechanics used), [[dh-pacs-leg1-upload-compression]] (the
compression question checked alongside this).
