---
name: admin-ui-mobile-responsive
description: "Admin UI: mobile-responsive pass (2026-06-09) + patient list UX polish (2026-06-14). Live on VM, uncommitted."
metadata: 
  node_type: memory
  type: project
  originSessionId: bc6e9cf7-6425-4157-affd-135faf97f43f
---

Made the admin UI (`deploy/admin-ui/`, the `pacs-admin-ui` SPA at `/admin/`) mobile-responsive. Done 2026-06-09 on branch `feat/safety-mt-gated`.

**Mechanism (ADR 0005):** the admin UI is 100% inline `style={{}}` (no CSS framework). Responsiveness added via a new `src/hooks/useBreakpoint.ts` (`window.matchMedia` + `useSyncExternalStore`) returning a tier `'phone' | 'tablet' | 'desktop'` plus derived `isPhone`/`isTablet`/`isDrawerNav`/`isCards`. Components branch their existing inline styles on the tier. Breakpoints live ONLY in the hook. Rejected Tailwind/global-CSS (too big a blast radius / split-brain). Secondary tool for pure-CSS cases = the `<style>`+`@media`+className idiom already in `patient-ui/Layout.tsx`.

**Breakpoints (two tiers → three layouts):** phone `<640px` = drawer nav + card layouts; tablet `640–1023` = drawer nav + horizontal-scroll tables; desktop `≥1024` = original fixed-sidebar layout UNCHANGED (frozen, must stay pixel-identical).

**What changed:** `Layout.tsx` (fixed 200px sidebar → hamburger slide-in drawer + backdrop below 1024, closes on backdrop/link/route-change/Esc; also holds a global 16px input-zoom guard `<style>` for all Layout pages). List tables (`PatientsListPage`, `SitesListPage`, `MtUsersListPage`) render stacked cards on phone, table otherwise. Detail pages got responsive 1/2/3-col info grids + `SeriesList` mini-cards on phone. Forms (`SiteCreatePage`, `SiteDetailPage`), `SiteInstructionsPage` (print CSS preserved), `StoragePage` (Breakdown table → overflow-x), `DashboardPage` (grid min 180→150). `LoginPage` card made fluid (was fixed 360+40 padding = 440px, overflowed a 360px screen) + its own input guard since it renders outside Layout. Also changed `AdminOpenButton` label "Open in OHIF" → "↗ Open in DH Viewer".

**Plan + decision docs:** `docs/260525_Admin_Frontend/ADMIN_UI_MOBILE_RESPONSIVE_PLAN.md` (phased plan) and `docs/adr/0005-admin-ui-responsive-via-usemediaquery-hook.md`.

**Deploy method (non-obvious):** admin-ui Docker build context is `/srv/pacs/admin-ui` on the VM (not the compose dir). Deploy = scp the changed `src/` files there, then `cd /srv/pacs/compose && docker compose build admin-ui && docker compose up -d admin-ui`. SSH/scp with the key (`-i C:/Users/Administrator/.ssh/pacsvm_ed25519 maidul@192.168.1.10`) works fine **from PowerShell** (the older [[feedback_vm_file_transfer]] note about key auth being unreliable was about Bash). Verified live: container Up, `/admin/` HTTP 200, bundle hash matched the local build.

**2026-06-14 — Patient list UX polish (deployed, not committed):**
- `PatientsListPage.tsx`: desktop `<tr>` rows now navigate on click (`useNavigate`) with `cursor: pointer` + `#f8fafc` hover tint. "View →" last column removed from desktop table (redundant once row is clickable).
- "Status" column (`StatusCluster`) removed from both desktop table and mobile card. Flagged/pending badges no longer shown in the list — still present in the API response, just not displayed.
- Mobile `PatientCard` was already a full `<Link>` — no changes needed there.

⚠️ **Status: deployed to the live VM but NOT yet committed to git.** The VM `/srv/pacs/admin-ui/src` and the repo have drifted from the deployed-but-uncommitted edits — commit on branch `feat/safety-mt-gated` to resync. Related: [[admin_frontend_build_status]].
