---
name: project-share-feature
description: "Patient share-study feature: teal Share FAB creates timed viewer links via app.links; auto-fetches viewerToken when viewer opened without /open redirect; revoke-all supported"
metadata:
  node_type: memory
  type: project
  originSessionId: 523b212b-8608-453d-971b-6bf6b2002b19
---

**Status: LIVE as of 2026-06-14.**

## What it does
Teal "Share" FAB in the viewer. Patient taps it, picks a validity duration (1h / 24h / 7d / 30d), backend mints a new `app.links` row with `created_by='patient_share'`. A shareable `/open?token=...` URL is returned; patient shares via OS share sheet or copies it. Recipient opens the viewer without any login. "Revoke all shares" kills every `patient_share` link for the study.

## Component
**File:** `extensions/default/src/ViewerLayout/MobileShareFAB.tsx`

- No `isMobileViewport` guard — renders on **both desktop and mobile**
- Positioned `absolute bottom-4 right-4 z-10` (below the Report FAB at `bottom-[68px]`)
- Bottom sheet via `ReactDOM.createPortal(_, document.body)` (same stacking-context fix as ReportFAB)
- State machine: `'pick' | 'creating' | 'ready' | 'revoking' | 'revoked'`
- DURATIONS: 1h, 24h, 7d (168h), 30d (720h)

## Auth: viewerToken flow
The Share FAB needs a `viewerToken` (the original link UUID) to call the create/revoke endpoints. Two paths:

1. **Gold-path via `/open?token=xxx`**: `viewer.html` resolves the token, then redirects to `/viewer?StudyInstanceUIDs=uid&viewerToken=token`. The FAB reads it from `URLSearchParams`.

2. **Direct viewer open** (admin panel, MT workstation, patient portal link): no token in URL. On mount, the FAB calls `GET /api/studies/:uid/viewer-token` to get the active link token. If 404 (no active link for this study), FAB stays hidden.

This means the Share button only appears for studies that already have at least one active link in `app.links`. Studies with no link (e.g. unclaimed mt_gated) correctly show no Share button.

## Backend endpoints (all in `deploy/backend/src/routes/legacy.js`)

### `GET /api/studies/:studyUid/viewer-token`
- **New (2026-06-14)**: looks up most-recent active (non-revoked, non-expired) link for the study
- Returns `{ token }` or 404
- Public, studyUID as implicit auth

### `POST /api/studies/:studyUid/share-links`
- Body: `{ viewerToken, durationHours }`
- Validates: `viewerToken` resolves to this study, not revoked, not expired; `durationHours` is in `[1, 24, 168, 720]`
- Creates new `app.links` row: `created_by='patient_share'`, `expiry_date = NOW() + interval`
- Returns `{ viewerUrl, expiresAt }` where `viewerUrl = BASE_URL/open?token=<new-uuid>`

### `DELETE /api/studies/:studyUid/share-links`
- Body: `{ viewerToken }`
- Validates the `viewerToken` belongs to this study
- Sets `revoked=true` on all `app.links` rows where `created_by='patient_share'` and `study_id` matches
- Does NOT revoke the original link (only patient-created share links)

## Key design decisions
- `created_by='patient_share'` distinguishes patient shares from auto-links and MT-gated links — revoke only affects patient-created links
- Share recipients get full viewer access (no auth, no login) within the expiry window — same as the gold-path patient experience
- No audit log written on share creation (decided acceptable for now; add later if compliance requires)

## How to apply
- If the duration options need changing, update `DURATIONS` array in `MobileShareFAB.tsx` AND the `SHARE_DURATIONS_HOURS` Set in the POST endpoint in `legacy.js`
- If `created_by` semantics change, also update the DELETE endpoint's WHERE clause
- The FAB currently shows for ALL studies with an active link, including admin-opened ones. If share should be patient-only, add an ownership check to the viewer-token endpoint.
