# Memory Index

## Project Status
- [Project Completion Status](project_completion_status.md) โ€” Platform COMPLETE. **2 sites live: SITE01 (Ibn Sina) + SITE03 (Cumilla Medical College) 2026-06-02.**
- [SITE01 Workstation Status](site01_workstation_status.md) โ€” SITE01 COMPLETE 2026-05-25. AET=SITE01_ORTHANC, Tailscale 100.86.132.36, autolink.lua bugs fixed.
- [SITE03 Cumilla Status](site03_cumilla_status.md) โ€” SITE03 COMPLETE 2026-06-02. Cumilla Medical College, AET=SITE03_ORTHANC, Tailscale 100.81.132.123, Philips MRI live.
- [Admin Frontend Build Status](admin_frontend_build_status.md) โ€” All 4 phases complete. Sites, patients, series, links, audit, OHIF admin-view all working.
- [Phase A OHIF Branding COMPLETE](phase_a_ohif_branding_complete.md) โ€” Shipped 2026-05-19. pacs-ohif-dhs:v1.1 deployed; DHS logo, teal palette, favicon.
- [Central Server Phase 1 COMPLETE](central_server_phase1_complete.md) โ€” End-to-end working 2026-05-19. Pixel data renders for patient E1027809 (AYESHA AKTER) via token link.
- [Phase 1 Execution Notes](phase1_execution_notes.md) โ€” Phase 1 successfully completed 2026-05-10. Backend port 3000 exposed via UFW.

## Feedback & Gotchas
- [Site onboarding lessons](feedback_site_onboarding_lessons.md) โ€” **NSSM required (not New-Service); port 3000 not needed from workstation; DICOMweb not needed on local bridge; run manually to diagnose service failures.**
- [Docker build gotchas](feedback_docker_build_gotchas.md) โ€” npm ci needs lockfile (use npm install); --no-cache when editing files in-place; Python over sed for special-char replacements.
- [VM file transfer gotchas](feedback_vm_file_transfer.md) โ€” SSH key auth unreliable from Bash; use Git Bash scp with password or edit directly on VM; always cat -n .env after editing.
- [nginx + OHIF + Orthanc + Cloudflare gotchas](feedback_ohif_orthanc_cloudflare_gotchas.md) โ€” 6 traps: OHIF config, transcoding, multipart, Cloudflare cache, bind-mount inode, **nginx variable proxy_pass does not strip location prefix (add rewrite)**.
- [Compose YAML editing](feedback_compose_yaml_editing.md) โ€” Don't regex-patch docker-compose.yml; blank lines between service blocks break lookaheads.
- [New customer scoping protocol](feedback_new_customer_scoping.md) โ€” Before scoping ANY new customer deployment, read docs/researchDocs/MULTI_CUSTOMER_SCALING_ARCHITECTURE.md first and walk the checklist in Part 8.

## Infrastructure & Access
- [Server Hardware & Network Info](project_server_info.md) โ€” On-premise Windows Server 2022, LAN 192.168.1.6, Hyper-V active with PacsVM (Ubuntu 22.04 at 192.168.1.10)
- [PacsVM Credentials & Access](project_vm_credentials.md) โ€” Ubuntu 22.04 VM at 192.168.1.10, username `maidul`, SSH key installed (ED25519)
- [PostgreSQL Credentials](reference_postgres_credentials.md) โ€” DB user/db is `pacs`/`pacs`, password `dhmiPost` (set via ALTER USER; .env was stale). DATABASE_URL added explicitly.
- [OHIF Fork Reference](reference_ohif_fork.md) โ€” DHS-Ltd/ohif-viewer-dhs private fork. Branch dhs-main off v3.12.0. SSH alias `github-ohif`.

## Architecture & Business Model
- [Business Model & Architecture](project_business_model.md) โ€” Multi-site teleradiology: local Orthanc โ’ Tailscale โ’ central Orthanc โ’ patient link โ’ OHIF viewer

## Website & Marketing
- [Website Work](project_website_work.md) โ€” Content blueprint + demo portal build guide complete (2026-05-29). Product = DH PACS, Company = DH Solutions. Ibn Sina Hospital: 7 workstations, 5 centers. Film market: เงณ14.6B/yr.
- [Demo Portal โ€” LIVE](project_demo_portal_live.md) โ€” `/demo` gateway + `/demo-viewer/` OHIF on CloudFront CDN. LIVE 2026-05-30. Includes files, sub_filter fix, scp deploy workflow, SSH alias (pacsvm), path mapping.

## Repository & Tooling
- [GitHub Repo & Issue Tracker](reference_github_repo.md) โ€” Repo URL, gitignore details, Google Form URL (forms.gle/v4rfsYmka8Lhs4oS8), Apps Script integration notes

