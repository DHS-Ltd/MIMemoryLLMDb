---
name: saas-p4-implementation
description: "SaaS P4 (Patient Portal SPA at /patient/) — LIVE 2026-06-04. New pacs-patient-ui container, 22 new files, no backend changes needed."
metadata: 
  node_type: memory
  type: project
  originSessionId: c7f860b2-c79c-4513-ab52-7b2cbf33b5d6
aliases: [saas-p4-implementation]
---

## SaaS P4 — Patient Portal — LIVE 2026-06-04

**Status:** Deployed to `https://pacs.dhsolutions.com.bd/patient/`. User confirmed page loads. 100% frontend work — zero backend changes (P1 had already shipped all required endpoints).

**Why:** Consumer-facing end of the SaaS product. Patient logs in with `mobile` + DHP-ID (printed on access PDF from MT) → dashboard of all their studies across all visits/sites → opens OHIF.

**How to apply:** When touching the patient experience, this is the surface. Container is `pacs-patient-ui`, source at `deploy/patient-ui/` (`/srv/pacs/patient-ui/` on VM), nginx routes `/patient/*` via the variable-`proxy_pass` + `rewrite` pattern (same as `/admin/`). See [[saas-p1-p2-implementation]] for the backend it consumes and [[nginx-proxy-and-deployment-gotchas]] for the routing trap.

---

## Corrections to the P4 build guide (worth knowing on re-read)

The build guide at `docs/260525_Admin_Frontend/Phases_Build/P4_Patient_Portal.md` has two errors caught during implementation:

1. **§16 claims `GET /api/patient/auth/me` is missing from P1 and must be added.** Wrong — it already existed at `deploy/backend/src/routes/patient-auth.js`. Do not add a duplicate.
2. **§8 calls `GET /api/patient/${uid}/view`.** Real backend path is `GET /api/patient/studies/${uid}/view`. Same for the `report-wrong` POST. The shipped `src/api/portal.ts` uses the correct paths — do not "fix" them back to match the spec.

---

## Frontend architecture (deviations from spec — intentional)

Where the P4 spec diverged from the project's actual admin-ui conventions, the shipped code follows admin-ui (proven pattern), not the spec verbatim:

| Concern | Shipped (admin-ui pattern) | Spec said (ignored) |
|---|---|---|
| AuthGate | React Query `useQuery({ queryKey: ['me'], queryFn: getMe, retry: false })` | `useState` + `useEffect` |
| Router gate | `<Route path="/*" element={<AuthGate><Routes>…</Routes></AuthGate>}>` | `<Route element={<Gate/>}>` outlet pattern |
| Container nginx.conf | 12-line minimal (SPA fallback + gzip), no asset-cache headers | Larger version with explicit asset cache |
| vite config | No dev proxy | `proxy: { '/api': … }` |
| Site name | Use `study.site_name` from API (single source of truth) | Hardcoded `SITE_DISPLAY` map |

Also added beyond the spec: a `/patient/help` route surfacing the existing backend `POST /api/patient/studies/:uid/report-wrong` ("Not your scan?") with a confirmation modal. The spec did not surface this safety feature in the UI.

---

## Deployment shape

- Compose: new `patient-ui` service block (mirrors `admin-ui`), added to nginx `depends_on`
- Nginx: new `location /patient/` inside `pacs.dhsolutions.com.bd` server block, copy of `/admin/` pattern with `$patient_ui` + `rewrite ^/patient/(.*)$ /$1 break;`
- Bundle size: 259.7 KB raw / 85.3 KB gzipped (144 modules)
- CLAUDE.md updated: stack table + nginx routing block

---

## What's left of the SaaS roadmap

Only **P3 — dh-pacs-workstation** remains. Separate repo at `d:\dh-pacs-workstation`. Until P3 ships and MTs are trained, live sites (SITE01, SITE03) stay on `link_mode='auto'` — the patient portal still works for them via the auto-link path.
