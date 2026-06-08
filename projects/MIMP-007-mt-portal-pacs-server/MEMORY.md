# Project memory — DH PACS Workstation

- [Program status](dh-pacs-program-status.md) — 2026-06-07: MT-gated match-then-push + upload-progress UX + Tier-A upload telemetry are LIVE end-to-end; admin link-mode toggle fixed; portal v0.2.0 installer rebuilt
- [Next-session tests](dh-pacs-next-session-tests.md) — MT-gated push DONE/deployed; remaining = §10 endpoint acceptance tests, then merge `feat/safety-mt-gated`, nightly cross-check cron, code-signing
- [Central VM deploy](central-vm-deploy.md) — how to connect (`ssh pacsvm` via PowerShell) + rebuild/redeploy central services: scp to `/srv/pacs/<svc>`, `docker compose build --no-cache <svc>` + `up -d` at `/srv/pacs/compose`; migrations via psql; VM can lag git HEAD — verify deployed file
- [MT-push architecture](dh-pacs-mt-push-architecture.md) — DEPLOYED & LIVE 2026-06-07 (ADR-0001): portal=sole uploader, Site Mode in box .env w/ central backstop; mt_gated=match-then-push (instant link + gated handoff + progress bar/non-blocking tray); telemetry Tier-A live

