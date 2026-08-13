# Project memory — DH PACS Workstation

- [Program status](dh-pacs-program-status.md) — 2026-07-12: v1.2.0 tree fully committed (8 commits) + README rewritten for repo relationships. Future scope only: code-signing.
- [Commit/doc preferences](dh-pacs-commit-and-doc-preferences.md) — split commits by concern (hunk-level OK); capability-based status not dated tables; link to CONTEXT-MAP.md, don't redefine terms; gitignore runtime logs
- [PDFKit continued-width bug](pdfkit-continued-width-bug.md) — { continued:true, width:N } locks entire block to N pt; use table-row pattern instead
- [Patient PDF archive debug](patient-pdf-archive-debug.md) — stale patient_pdfs row masks pdfGenerator changes; check/delete before debugging layout
- [Next-session tests](dh-pacs-next-session-tests.md) — ALL DONE 2026-06-14: §10 passed, both repos merged to main, cron active. Only future scope remaining: code-signing.
- [Central VM deploy](central-vm-deploy.md) — how to connect (`ssh pacsvm` via PowerShell) + rebuild/redeploy central services: scp to `/srv/pacs/<svc>`, `docker compose build --no-cache <svc>` + `up -d` at `/srv/pacs/compose`; migrations via psql; VM can lag git HEAD — verify deployed file
- [MT-push architecture](dh-pacs-mt-push-architecture.md) — DEPLOYED & LIVE 2026-06-07 (ADR-0001): portal=sole uploader, Site Mode in box .env w/ central backstop; mt_gated=match-then-push (instant link + gated handoff + progress bar/non-blocking tray); telemetry Tier-A live
- [nginx metadata-404 incident](dh-pacs-nginx-metadata-404-incident.md) — 2026-06-12 viewer outage: unpinned nginx auto-update (1.29.8) broke WADO-RS /metadata proxying, NOT Cloudflare; fixed (raw-URI proxy_pass) + images pinned by digest
- [DICOM compression pipeline](dicom-compression-pipeline.md) — UPDATED 2026-07-15: JPEG-LS lossless IngestTranscoding now applied at BOTH central (ADR-0016) and site (ADR-0017); verify via /instances/<id>/metadata/TransferSyntax
- [Leg-1 upload compression](dh-pacs-leg1-upload-compression.md) — 2026-07-15 LIVE on SITE005 (ADR-0017): site IngestTranscoding cut site→central upload 72→29.5min (2.4x); per-instance C-STORE overhead floor → Lever 2 (concurrent C-STORE) deferred
- [Tailscale tenancy](dh-pacs-tailscale-tenancy.md) — 2026-06-26 LIVE: one tailnet (Free/Gmail), hub-and-spoke ACL (policy.hujson), tagged per-site auth keys (ADR-0009); v1.1.0 installer with bundled Tailscale auto-install (MSI 1.98.4) BUILT + VERIFIED WORKING 2026-06-28
- [Bogra brownfield site](dh-pacs-bogra-brownfield-site.md) — 2026-07-01: SITE008 = first BROWNFIELD site; reuse existing DHVIEWER Orthanc, Portal-only (NO combined installer, port clash), outbound LocalAet=SITE008_DHPACS; ADR-0010 + BOGRA_SETUP_RUNBOOK.md; also fixed 7034 no-auto-restart

