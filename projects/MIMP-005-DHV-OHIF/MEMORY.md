# Memory index โ€” d:\ohif-fork

- [Project context: DHS PACS viewer](project_dhs_pacs_viewer.md) โ€” patient-facing OHIF viewer at pacs.dhsolutions.com.bd; goals & stakeholders
- [Multi-repo architecture](project_multi_repo_architecture.md) โ€” this fork + PACS repo + (future) extension repo; which lives where
- [Phase A status: v1 + v1.1 palette live; toolbar trim doc-only](project_phase_a_complete.md) โ€” what shipped, what's pending
- [v1.1 palette shipped + deploy cache-bust gotcha](project_v11_palette_shipped.md) โ€” teal-dominant palette commit 60da49195; SW + Cloudflare cache must be busted post-deploy
- [Customization tier decision: Tier 3 + Tier 4](project_tier_decision.md) โ€” why fork+extension vs. config-only or rewrite
- [Phase C blockers: unresolved open questions](project_phase_c_blockers.md) โ€” report source, audit, demographics, i18n still owed
- [Color-palette tutorial reference](reference_color_palette_tutorial.md) โ€” in-repo Docs/Tutorial/COLOR_PALETTE.md is the canonical how-to for any color change
- [Commit & deploy tutorial reference](reference_commit_and_deploy_tutorial.md) โ€” in-repo Docs/Tutorial/COMMIT_AND_DEPLOY.md is the full local โ’ GitHub โ’ VM โ’ Cloudflare workflow + cache-bust sequence
- [Toolbar & hanging protocol how-to](reference_toolbar_and_hanging_protocol.md) โ€” 4-step recipe: create protocol โ’ register โ’ define button โ’ add to toolbarSections; isPreset trap; icon table; file checklist
- [Demo portal: marketing site viewer](project_demo_portal.md) โ€” LIVE: /demo gateway + /demo-viewer/ OHIF; self-hosted orthanc-demo (11 studies); mobile card UI; DH Dicom Viewer mode; no filter bar
- [Build & deploy ops rules](feedback_build_deploy_ops.md) โ€” never run 2 builds in parallel; always nginx -s reload after ohif container restart (stale DNS โ’ 502)

