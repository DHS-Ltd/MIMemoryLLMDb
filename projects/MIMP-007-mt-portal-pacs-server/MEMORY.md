# Project memory — DH PACS Workstation

- [Program status](dh-pacs-program-status.md) — 2026-06-14: BOTH REPOS ON MAIN. Nightly cron active. Future scope only: code-signing.
- [PDFKit continued-width bug](pdfkit-continued-width-bug.md) — { continued:true, width:N } locks entire block to N pt; use table-row pattern instead
- [Patient PDF archive debug](patient-pdf-archive-debug.md) — stale patient_pdfs row masks pdfGenerator changes; check/delete before debugging layout
- [Next-session tests](dh-pacs-next-session-tests.md) — ALL DONE 2026-06-14: §10 passed, both repos merged to main, cron active. Only future scope remaining: code-signing.
- [Central VM deploy](central-vm-deploy.md) — how to connect (`ssh pacsvm` via PowerShell) + rebuild/redeploy central services: scp to `/srv/pacs/<svc>`, `docker compose build --no-cache <svc>` + `up -d` at `/srv/pacs/compose`; migrations via psql; VM can lag git HEAD — verify deployed file
- [MT-push architecture](dh-pacs-mt-push-architecture.md) — DEPLOYED & LIVE 2026-06-07 (ADR-0001): portal=sole uploader, Site Mode in box .env w/ central backstop; mt_gated=match-then-push (instant link + gated handoff + progress bar/non-blocking tray); telemetry Tier-A live
- [nginx metadata-404 incident](dh-pacs-nginx-metadata-404-incident.md) — 2026-06-12 viewer outage: unpinned nginx auto-update (1.29.8) broke WADO-RS /metadata proxying, NOT Cloudflare; fixed (raw-URI proxy_pass) + images pinned by digest
- [DICOM compression pipeline](dicom-compression-pipeline.md) — no compression applied by this system; small study sizes come from modality's own transfer syntax; check TransferSyntaxUID on instances to confirm

