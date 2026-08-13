# Memory index — d:\ohif-fork

- [Project context: DHS PACS viewer](project_dhs_pacs_viewer.md) — patient-facing OHIF viewer at pacs.dhsolutions.com.bd; goals & stakeholders
- [Multi-repo architecture](project_multi_repo_architecture.md) — 4 repos by audience: ohif-fork (patients), PACS repo (infra), dh-pacs-doctor (doctors, D:\dh-pacs-doctor), extension repo (future)
- [Phase A status: v1 + v1.1 palette live; toolbar trim doc-only](project_phase_a_complete.md) — what shipped, what's pending
- [Phase B complete: mobile UX](project_phase_b_complete.md) — panels hidden; toolbar: Cine/Pan/WL/MoreTools right-aligned (Zoom→MoreTools 2026-06-13); touch targets; strip+layout toggle; patient banner
- [v1.1 palette shipped + deploy cache-bust gotcha](project_v11_palette_shipped.md) — teal-dominant palette commit 60da49195; SW + Cloudflare cache must be busted post-deploy
- [Customization tier decision: Tier 3 + Tier 4](project_tier_decision.md) — why fork+extension vs. config-only or rewrite
- [Phase C blockers: unresolved open questions](project_phase_c_blockers.md) — report source, audit, demographics, i18n still owed
- [Color-palette tutorial reference](reference_color_palette_tutorial.md) — in-repo Docs/Tutorial/COLOR_PALETTE.md is the canonical how-to for any color change
- [Commit & deploy tutorial reference](reference_commit_and_deploy_tutorial.md) — in-repo Docs/Tutorial/COMMIT_AND_DEPLOY.md is the full local → GitHub → VM → Cloudflare workflow + cache-bust sequence
- [Toolbar & hanging protocol how-to](reference_toolbar_and_hanging_protocol.md) — 4-step recipe: create protocol → register → define button → add to toolbarSections; isPreset trap; icon table; file checklist
- [Demo portal: marketing site viewer](project_demo_portal.md) — LIVE: /demo gateway + /demo-viewer/ OHIF; self-hosted orthanc-demo (11 studies); mobile card UI; DH Dicom Viewer mode; no filter bar
- [Build & deploy ops rules](feedback_build_deploy_ops.md) — no parallel builds; --force-recreate; nginx -s reload; no-store on /viewer; verify deployed JS via .js.gz (zcat) not .js; /viewer is cf-cache DYNAMIC (purge usually unneeded); PowerShell+quotes-in-commit-msg breaks git
- [Mobile thumbnail strip gotchas](feedback_mobile_thumbnail_strip_gotchas.md) — 4 bugs hit: wrong API (.activeDisplaySets), wrong render location, h-full flex conflict (use min-h-0), scroll needs min-w-max
- [PWA manifest renamed to DHViewer](project_pwa_manifest_dhviewer.md) — install/"Open in App" prompt now says DHViewer; committed 0b2f0c445 on dhs-main, deployed as v1; icons/theme still OHIF defaults
- [Favicon/icon rebrand to DHV mark](project_favicon_rebrand.md) — SVG already wired; 4/32 raster fallbacks fixed+deployed 1bd2c77e7 (favicon.ico/16/32, android-chrome-512); ~28 still OHIF, follow-up pending
- [Patient context banner](project_patient_context_banner.md) — Patient name + site below toolbar; shipped 2026-06-13; fetches /api/study-context/:uid (no auth); DHP ID in API but not shown
- [Radiologist report feature](project_report_feature.md) — file-based (PDF/JPEG/PNG); desktop right-panel tab + mobile blue pill FAB; MT uploads via admin; /api/studies/:uid/reports (public); createPortal required for mobile sheet
- [Share study feature](project_share_feature.md) — teal Share FAB (desktop+mobile); timed links via app.links (created_by=patient_share); auto-fetches viewerToken via /api/studies/:uid/viewer-token when viewer opened without /open redirect; revoke-all supported
- [Film View feature](project_film_view_feature.md) — SHIPPED 51dbb1ec8; 2×2 FilmViewDH button (mobile+desktop); first 4 series one per cell; MPRDHLayout 4-file pattern; isPreset:false; patient-only (doctor builder in dh-pacs-doctor)
- [Issue tracker: Google Form → GitHub](reference_issue_tracker.md) — Apps Script at D:\Pacs_Viewer_Storage_Project\tools\issue-tracker\Code.gs; issues land in DHS-Ltd/dh-pacs-central; labels by category+severity; screenshot upload; confirmation email
- [About modal rebranded for patients](project_about_modal_patient_rebrand.md) — SHIPPED+DEPLOYED 7dd50d622; title-bar bug (separate from body, static .title prop fix); dropped debug info; added support email + tagline
- [Cardiac Viewer (LV Analysis)](project_cardiac_viewer.md) — planned 2nd Doctor Viewer instance; separate product repo D:\ohif-extension-dhs-cardiac; single-plane LVG, Area-Length, DICOM SR source of truth, no AI in v1
- [Liver & Lesion Volumetry (LLV)](project_liver_volumetry_llv.md) — planned; separate repo D:\ohif-extension-dhs-liver (scaffolded); rides IN longitudinal viewer (panel+button, no mode); SEG+SR output; most is upstream; Phase-3 AI = value; ADR-0004/0005
- [Doctor Viewer (Oncology PET-CT)](project_doctor_viewer_oncology.md) — DEPLOYED 2026-06-22; tmtv+longitudinal modes at /viewer-doctor off same image (nginx intercept, no new build); ungated dicom-web→showStudyList:false; sliding 8h doctor_jwt; dh-pacs-doctor is the PORTAL not the viewer; real PET-CT/doctor-login testing pending; ADR-0001+CONTEXT.md in repo
- [Phase 1 wadouri retrieval fix](project_wadouri_retrieval_phase1.md) — flip imageRendering wadors→wadouri in DOCTOR /viewer-doctor/app-config.js (Tier-1, PACS-central runtime file, no fork commit); thumbnails stay wadors; patient viewer deferred (mobile OOM); ⚠️FLAG: tmtv/PET-CT volume path unverified — revisit when live PET-CT patient arrives; finalized 2026-07-13, not yet shipped

