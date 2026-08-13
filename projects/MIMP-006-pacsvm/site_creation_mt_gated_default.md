---
name: site_creation_mt_gated_default
description: "New sites default to MT-Gated + site-registration instructions rewritten (ADR 0012). Implemented 2026-06-28, live on VM, committed 2026-07-12."
metadata: 
  node_type: memory
  type: project
  originSessionId: 0c6f94fc-b54b-4cd3-9609-3f2bcdda7c04
---

**2026-06-28 — Site creation revamp (ADR 0012). DEPLOYED & LIVE on VM (backend + admin-ui rebuilt --no-cache + up -d). COMMITTED 2026-07-12 on branch `feat/patient-pdf-redesign-settings` (commit c57ad19).**

Live-verified via minted admin_jwt: `GET /api/admin/sites/:id` returns `active_mt_count` + `link_mode`; instructions endpoint serves new sections (audience/summary/before-visit/install-box/modality). No DB migration needed — live `link_mode` column default stays `auto`; new sites get `mt_gated` from the explicit INSERT. Deploy: files scp'd to `/srv/pacs/{backend,admin-ui,config}` (verified VM==HEAD before clobbering), then `docker compose build --no-cache backend admin-ui && up -d` at `/srv/pacs/compose`.

Two changes, grilled out via `/grill-with-docs`:

1. **New sites default to MT-Gated** (was `auto`). `app.sites.link_mode` now defaults `mt_gated` in `init.sql` AND is set explicitly in the `POST /api/admin/sites` INSERT (deploy-independent — existing `auto` sites SITE01/SITE03 untouched). This *aligns* Central with the box installer, which already defaulted `mt_gated`.
   - **Authority model kept as backstop** (not changed): box `.env LINK_MODE` is the driver; Central `link_mode` is the fail-safe backstop; they must match (manual coordination), mismatch fails safe (stalled study). See [[decision_aet_format]] sibling. LinkModeToggle warnings now spell out the box-side coordination.
   - Site Detail shows a zero-MT warning banner when a site is `mt_gated` with 0 active MTs (`GET /sites/:id` now returns `active_mt_count`).

2. **`instructions.js` rewritten** — was fully stale (manual Orthanc download, hand-written orthanc.json, broken `SendToModality` lua). Now a SLIM DH-staff onboarding summary: AET, Site Mode, MT login, central addresses, mint `tag:site` Tailscale key → run combined installer `dh-pacs-workstation-setup-v1.1.0.exe`. Heavy steps point to workstation repo `docs/NEW_SITE_ONBOARDING.md`. Page retitled "Onboarding Summary"; audience reframed DH-staff (not hospital IT).

Docs: `docs/adr/0012-new-sites-default-mt-gated.md`, `CONTEXT.md` (Site Mode / Auto / MT-Gated / Backstop terms added).

**Cross-repo follow-up (not done):** workstation `D:\dh-pacs-workstation\docs\NEW_SITE_ONBOARDING.md` still says "link_mode defaults to auto" and describes the old two separate v0.1.0 installers — now contradicts ADR 0012. Update on that side.

**Remaining:** QA the instructions page + zero-MT banner in browser. Deploy already done; commit done — only merge-to-`main` is outstanding, shared across the whole branch (see [[saas_p10_doctor_reports]]).
