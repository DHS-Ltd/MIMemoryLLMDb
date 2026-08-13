# Memory Index

## Proposed / Design-Phase Systems
- [Ibn Sina Cancer PACS System](ibn_sina_cancer_pacs_system.md) — **DESIGN + BUILD PLAN COMPLETE (2026-06-20), not yet built.** Federated multi-site PACS: NO central data server, replicated Patient Directory (index only), per-site distributed storage, proxy-stream Remote reads over Tailscale, two-plane exposure, one codebase behind `FEDERATED_MODE`. USP = modular per-site investment. Docs + ADRs 0001–0004 + phased BUILD_PLAN in `docs/IbnSinaCancerPacs/`. Parked: DMWL identity (Q5), DH access/telemetry terms (Q9).

## Project Status
- [JPEG-LS Ingest Compression — LIVE](project_jpegls_ingest_compression_live.md) — **LIVE on prod 2026-07-14 (ADR 0016).** Orthanc IngestTranscoding fixes 80-min large-CT load bug without touching MPR/viewer mode. Backfill of old studies explicitly deferred as separate project.
- [Site Creation MT-Gated Default](site_creation_mt_gated_default.md) — **LIVE on VM 2026-06-28 (ADR 0012), COMMITTED 2026-07-12.** New sites default mt_gated (aligns with box installer); instructions.js rewritten to slim DH-staff onboarding; zero-MT warning banner. Cross-repo follow-up: update workstation NEW_SITE_ONBOARDING.md.
- [Patient PDF Redesign + Settings + Logo Fix](patient_pdf_redesign_plan.md) — **ALL LIVE on prod 2026-06-28.** Redesigned Patient Access Sheet (honors ADR 0003) + admin-editable Support Phone (`app.app_settings` KV table p9, folded into Dashboard, precedence DB→env→default) + logo-upload bug fixed (root cause was the global `express.json()` 100KB limit, NOT missing UI; route cap now 5MB). Uncommitted on `main`. Bangla + DICOM study-description still deferred. Remaining: user browser QA (upload Ibn Sina logo, set phone) + commit strategy.
- [Project Completion Status](project_completion_status.md) — Platform COMPLETE. **2 sites live: SITE01 (Ibn Sina) + SITE03 (Cumilla Medical College) 2026-06-02.**
- [SITE01 Workstation Status](site01_workstation_status.md) — SITE01 COMPLETE 2026-05-25. AET=SITE01_ORTHANC, Tailscale 100.86.132.36, autolink.lua bugs fixed.
- [SITE03 Cumilla Status](site03_cumilla_status.md) — SITE03 COMPLETE 2026-06-02. Cumilla Medical College, AET=SITE03_ORTHANC, Tailscale 100.81.132.123, Philips MRI live.
- [Admin Frontend Build Status](admin_frontend_build_status.md) — All 4 phases complete. Sites, patients, series, links, audit, OHIF admin-view all working.
- [Admin UI Mobile Responsive](admin_ui_mobile_responsive.md) — 2026-06-09: useBreakpoint hook + drawer nav + card layouts (ADR 0005). 2026-06-14: clickable patient rows + Status column removed. LIVE on VM but **uncommitted**.
- [Phase A OHIF Branding COMPLETE](phase_a_ohif_branding_complete.md) — Shipped 2026-05-19. pacs-ohif-dhs:v1.1 deployed; DHS logo, teal palette, favicon.
- [Central Server Phase 1 COMPLETE](central_server_phase1_complete.md) — End-to-end working 2026-05-19. Pixel data renders for patient E1027809 (AYESHA AKTER) via token link.
- [Phase 1 Execution Notes](phase1_execution_notes.md) — Phase 1 successfully completed 2026-05-10. Backend port 3000 exposed via UFW.

## Feedback & Gotchas
- [Site onboarding lessons](feedback_site_onboarding_lessons.md) — **NSSM required (not New-Service); port 3000 not needed from workstation; DICOMweb not needed on local bridge; run manually to diagnose service failures.**
- [Docker build gotchas](feedback_docker_build_gotchas.md) — npm ci needs lockfile (use npm install); --no-cache when editing files in-place; Python over sed for special-char replacements.
- [VM file transfer gotchas](feedback_vm_file_transfer.md) — SSH key auth unreliable from Bash; use Git Bash scp with password or edit directly on VM; always cat -n .env after editing.
- [nginx + OHIF + Orthanc + Cloudflare gotchas](feedback_ohif_orthanc_cloudflare_gotchas.md) — 7 traps: OHIF config, transcoding, multipart, Cloudflare cache, bind-mount inode, **nginx variable proxy_pass needs explicit rewrite**, **`compose up -d nginx` does NOT reload conf — use `nginx -s reload`**.
- [Compose YAML editing](feedback_compose_yaml_editing.md) — Don't regex-patch docker-compose.yml; blank lines between service blocks break lookaheads.
- [New customer scoping protocol](feedback_new_customer_scoping.md) — Before scoping ANY new customer deployment, read docs/researchDocs/MULTI_CUSTOMER_SCALING_ARCHITECTURE.md first and walk the checklist in Part 8.

## Infrastructure & Access
- [Server Hardware & Network Info](project_server_info.md) — On-premise Windows Server 2022, LAN 192.168.1.6, Hyper-V active with PacsVM (Ubuntu 22.04 at 192.168.1.10)
- [PACS Storage Layout & Migration](infrastructure_storage_layout.md) — VHDX on C: (653 GB free). D: blocked by Immich (208 GB free only). Migration runbooks ready. Hourly disk-alert scripts in `docs/tutorial/Move_PACS_Storage_C_to_D_and_Disk_Alerts.md`.
- [PacsVM Credentials & Access](project_vm_credentials.md) — Ubuntu 22.04 VM at 192.168.1.10, username `maidul`, SSH key installed (ED25519)
- [PostgreSQL Credentials](reference_postgres_credentials.md) — DB user/db is `pacs`/`pacs`, password `dhmiPost` (set via ALTER USER; .env was stale). DATABASE_URL added explicitly.
- [OHIF Fork Reference](reference_ohif_fork.md) — DHS-Ltd/ohif-viewer-dhs private fork. Branch dhs-main off v3.12.0. SSH alias `github-ohif`.
- [Viewer Repo — Memory Pointer](reference_viewer_repo_memory_pointer.md) — the viewer/portal SPA is a SEPARATE project; its current memory lives in `…/.claude/projects/d--ohif-fork/memory/`. Read there for any viewer/portal question.

## Architecture & Business Model
- [Business Model & Architecture](project_business_model.md) — Multi-site teleradiology: local Orthanc → Tailscale → central Orthanc → patient link → OHIF viewer
- [AET format decision](decision_aet_format.md) — 2026-06-02: new sites get `SITE${nnn}_DHPACS` (3-digit, underscore). SITE01/SITE03 keep legacy `_ORTHANC`. Allocator spans both patterns.
- [Branding Logo Decision](decision_branding_logo.md) — 2026-06-16: DHV_logo.svg stays in OHIF fork only. DHP_Logo_Wording.png + DHP.svg serve admin/patient/doctor portals via `/assets/` nginx static. Never use `/dhs-logo.png` (falls to OHIF catch-all).

## Website & Marketing
- [Website Work](project_website_work.md) — **STALE, see MIMP-004 pointer below.** Original blueprint-stage plan (2026-05-29) before the site moved to its own repo.
- [MIMP-004 Pointer](reference_mimp004_business_memory.md) — Real website now lives at `E:\DHS-PACS\dh-pacs-website` (Next.js 16 + Supabase + Cloudflare Pages); query mmp-memory project MIMP-004 for current build status.
- [DH PACS Business Strategy](dh_pacs_business_strategy.md) — Pulled from MIMP-004 2026-06-17: not-teleradiology positioning, pricing model structure (no exact numbers), HIPAA phrasing rule, 3-layer sales chain, brand voice hard lines.
- [Marketing Site ↔ Central Integration](project_marketing_site_central_integration.md) — **DONE 2026-06-17** (contact form/Supabase submission still untested — Supabase not yet integrated). Site mirrored at pacs.dhsolutions.com.bd via nginx proxy to Cloudflare Workers.
- [CI/CD Pipeline — LIVE](project_cicd_pipeline_live.md) — **LIVE 2026-06-17.** Self-hosted runner + ci.yml/deploy.yml built and verified end-to-end on real production, including a real failure (compose.yml not synced) caught and fixed same session. Scope is backend/admin-ui/patient-ui/nginx ONLY — OHIF and doctor-ui still fully manual. Read before touching `ci_deploy.sh` or assuming pipeline coverage.
- [Demo Portal — LIVE](project_demo_portal_live.md) — `/demo` gateway + `/demo-viewer/` OHIF on CloudFront CDN. LIVE 2026-05-30. Includes files, sub_filter fix, scp deploy workflow, SSH alias (pacsvm), path mapping.
- [Demo Links — Patient Experience](project_demo_link.md) — **2 live links.** ADR 0009: `34e5f845...` → AYESHA AKTER anonymized (DH PACS DEMO). ADR 0010: `50046f87...` → Abdur Gofur SITE03 real identity (consent obtained). Do NOT revoke either.

## Retention
- [Study Purge](project_study_purge.md) — Reclaim Orthanc disk by deleting pixels, keep metadata stub. Implemented 2026-06-07 on feat/safety-mt-gated; NOT yet deployed (migration p4 pending). ADR 0002.

## SaaS Architecture
- [SaaS Architecture Decisions](project_saas_architecture.md) — MT-gated link flow, patient portal, DH PACS Workstation, ID formats (DHP/DHMT), 4-phase build plan. Build guides in docs/260525_Admin_Frontend/Phases_Build/.
- [Phase 0 Schema Migration](phase0_schema_migration.md) — APPLIED 2026-06-03. patients identity cols, mt_users table, link_mode, claim_status. Unblocks P1. Counts unchanged, sites all on 'auto'.
- [SaaS P1 + P2 Implementation](saas_p1_p2_implementation.md) — COMPLETE 2026-06-03. P1: 11 new backend files (MT/patient/claim API). P2: MT management UI + link_mode toggle in admin panel.
- [SaaS P4 Patient Portal](saas_p4_implementation.md) — **LIVE 2026-06-04** at `/patient/`. New `pacs-patient-ui` container. Zero backend changes. Only P3 (workstation, separate repo) remains.
- [Patient List Tier-1 + Telemetry](saas_patient_list_telemetry.md) — **LIVE 2026-06-06**. Admin list/detail surface name/mobile/DHP-ID/origin/size; Tier-A upload telemetry (size/counts all sites, throughput mt_gated-only). ADR 0001 + root CONTEXT.md added.

## Doctor Portal
- [Doctor Portal Plan](project_doctor_portal_plan.md) — Multi-site view-only portal for consultant doctors. Email+password auth, many-to-many site access, admin-assigned. **Radiology report = critical future phase.**
- [Doctor Portal P8 — LIVE](saas_p8_doctor_portal.md) — **FULLY LIVE 2026-06-13**. DB migration, 5 backend routes, 3 admin-UI pages, nginx `/doctor/` + `pacs-doctor-ui` container all deployed. SPA repo at `D:\dh-pacs-doctor`.
- [Doctor Reports P10 — LIVE](saas_p10_doctor_reports.md) — **FULLY LIVE 2026-07-12**. Real prescribing (chief complaint/diagnosis/medications), Test Catalog, PDF letterhead. Deployed via scoped manual deploy, NOT CI/CD (see file for why). `feat/patient-pdf-redesign-settings` commit-strategy debt RESOLVED 2026-07-12 — 6 logical commits, still not merged to main.

## Repository & Tooling
- [GitHub Repo & Issue Tracker](reference_github_repo.md) — Repo URL, gitignore details, Google Form URL (forms.gle/v4rfsYmka8Lhs4oS8), Apps Script integration notes
- [Companion Repo Map](reference_companion_repo_map.md) — Full 7-repo family incl. 2 undocumented OHIF extension scaffolds (cardiac/liver) found 2026-07-12; workstation has no GitHub remote (intentional). Mirrors README.md's "Related Repositories" section.

