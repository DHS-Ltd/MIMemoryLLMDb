# Memory Index

## Project Status
- [Project Completion Status](project_completion_status.md) — Platform COMPLETE. **2 sites live: SITE01 (Ibn Sina) + SITE03 (Cumilla Medical College) 2026-06-02.**
- [SITE01 Workstation Status](site01_workstation_status.md) — SITE01 COMPLETE 2026-05-25. AET=SITE01_ORTHANC, Tailscale 100.86.132.36, autolink.lua bugs fixed.
- [SITE03 Cumilla Status](site03_cumilla_status.md) — SITE03 COMPLETE 2026-06-02. Cumilla Medical College, AET=SITE03_ORTHANC, Tailscale 100.81.132.123, Philips MRI live.
- [Admin Frontend Build Status](admin_frontend_build_status.md) — All 4 phases complete. Sites, patients, series, links, audit, OHIF admin-view all working.
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
- [PacsVM Credentials & Access](project_vm_credentials.md) — Ubuntu 22.04 VM at 192.168.1.10, username `maidul`, SSH key installed (ED25519)
- [PostgreSQL Credentials](reference_postgres_credentials.md) — DB user/db is `pacs`/`pacs`, password `dhmiPost` (set via ALTER USER; .env was stale). DATABASE_URL added explicitly.
- [OHIF Fork Reference](reference_ohif_fork.md) — DHS-Ltd/ohif-viewer-dhs private fork. Branch dhs-main off v3.12.0. SSH alias `github-ohif`.
- [Viewer Repo — Memory Pointer](reference_viewer_repo_memory_pointer.md) — the viewer/portal SPA is a SEPARATE project; its current memory lives in `…/.claude/projects/d--ohif-fork/memory/`. Read there for any viewer/portal question.

## Architecture & Business Model
- [Business Model & Architecture](project_business_model.md) — Multi-site teleradiology: local Orthanc → Tailscale → central Orthanc → patient link → OHIF viewer
- [AET format decision](decision_aet_format.md) — 2026-06-02: new sites get `SITE${nnn}_DHPACS` (3-digit, underscore). SITE01/SITE03 keep legacy `_ORTHANC`. Allocator spans both patterns.

## Website & Marketing
- [Website Work](project_website_work.md) — Content blueprint + demo portal build guide complete (2026-05-29). Product = DH PACS, Company = DH Solutions. Ibn Sina Hospital: 7 workstations, 5 centers. Film market: ৳14.6B/yr.
- [Demo Portal — LIVE](project_demo_portal_live.md) — `/demo` gateway + `/demo-viewer/` OHIF on CloudFront CDN. LIVE 2026-05-30. Includes files, sub_filter fix, scp deploy workflow, SSH alias (pacsvm), path mapping.

## Retention
- [Study Purge](project_study_purge.md) — Reclaim Orthanc disk by deleting pixels, keep metadata stub. Implemented 2026-06-07 on feat/safety-mt-gated; NOT yet deployed (migration p4 pending). ADR 0002.

## SaaS Architecture
- [SaaS Architecture Decisions](project_saas_architecture.md) — MT-gated link flow, patient portal, DH PACS Workstation, ID formats (DHP/DHMT), 4-phase build plan. Build guides in docs/260525_Admin_Frontend/Phases_Build/.
- [Phase 0 Schema Migration](phase0_schema_migration.md) — APPLIED 2026-06-03. patients identity cols, mt_users table, link_mode, claim_status. Unblocks P1. Counts unchanged, sites all on 'auto'.
- [SaaS P1 + P2 Implementation](saas_p1_p2_implementation.md) — COMPLETE 2026-06-03. P1: 11 new backend files (MT/patient/claim API). P2: MT management UI + link_mode toggle in admin panel.
- [SaaS P4 Patient Portal](saas_p4_implementation.md) — **LIVE 2026-06-04** at `/patient/`. New `pacs-patient-ui` container. Zero backend changes. Only P3 (workstation, separate repo) remains.
- [Patient List Tier-1 + Telemetry](saas_patient_list_telemetry.md) — **LIVE 2026-06-06**. Admin list/detail surface name/mobile/DHP-ID/origin/size; Tier-A upload telemetry (size/counts all sites, throughput mt_gated-only). ADR 0001 + root CONTEXT.md added.

## Repository & Tooling
- [GitHub Repo & Issue Tracker](reference_github_repo.md) — Repo URL, gitignore details, Google Form URL (forms.gle/v4rfsYmka8Lhs4oS8), Apps Script integration notes

