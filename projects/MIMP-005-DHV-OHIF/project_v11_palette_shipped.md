---
name: project-v11-palette-shipped
description: pacs-ohif-dhs:v1.1 teal-dominant palette shipped 2026-05-20; commit 60da49195; deploy required Cloudflare CDN + service-worker cache bust before the new colors became visible in production
metadata: 
  node_type: memory
  type: project
  originSessionId: dae93935-5b9a-4c53-a297-203db49c3279
---

**What shipped (2026-05-20):** Commit `60da49195` on `dhs-main`. Built and deployed as `pacs-ohif-dhs:v1.1` on the central VM. Palette is **teal-dominant** — derived from the DHV_logo.svg gradient stops, not from Design hex codes (Design hasn't delivered).

**Concrete edits in the commit:**
- [platform/ui-next/src/tailwind.css](platform/ui-next/src/tailwind.css) — full token override in both `:root` and `.dark` blocks. `--primary: 178 45% 38%` (`#36918d`, logo cross-mark teal), `--accent: 212 81% 26%` (`#0c3f75`, logo D-letter navy). `--card`, `--popover`, `--secondary`, `--muted`, `--border`, `--input`, `--background` all shifted into the teal family.
- [platform/ui/tailwind.config.js](platform/ui/tailwind.config.js#L47) — `secondary.dark: '#041c4a' → '#1a3e3a'`. One line. Cascades to all components using `bg-secondary-dark` (NavBar, SidePanel, TableHead, ContextMenu, MeasurementTable, PanelSection, SegmentationTable, ProgressDropdown, InvestigationalUseDialog, plus 5 extension panels).
- [platform/app/public/config/default.js](platform/app/public/config/default.js) — local-dev whiteLabeling so `yarn dev` matches prod. No-op in production (PACS-repo's mounted app-config.js overrides at runtime).
- [BRAND_TODO.md](BRAND_TODO.md) — palette row marked "partial."

**Why teal-dominant (not blue-dominant):** User explicitly asked for "medical brand" feel after seeing an initial bright-blue iteration. Teal reads as health/medical industry; blue reads as "another OHIF SaaS dashboard." The logo has both blue (D letter) and teal (cross mark) gradients — promoting teal to primary, demoting blue to accent inverted the visual hierarchy without inventing new colors.

**How to apply:**
- Future palette changes follow the patterns in [[reference-color-palette-tutorial]] — never reach for nginx sub_filter or a third CSS source.
- The remaining tokens still on OHIF defaults (`--secondary-foreground`, `--muted-foreground`, all status semantics) are flagged in [BRAND_TODO.md](BRAND_TODO.md). Wait for Design hex codes before touching them — guessing here risks contrast regressions.

---

## Operational gotcha: cache-busting after deploy

**Surprise:** After `docker compose build ohif && docker compose up -d ohif` finished cleanly on the VM, opening `https://pacs.dhsolutions.com.bd/` showed the **old navy colors** unchanged. Build was confirmed correct; image tagged correctly; container restarted; but the browser served stale assets.

**Two layers of cache** sit between the freshly-built bundle and the user's eyes:

1. **OHIF service worker (PWA).** OHIF registers an SW that aggressively caches assets. New deploys are detected and pre-downloaded but **NOT auto-activated** — the browser shows a "Relaunch to update" badge in the address bar, and the new bundle only runs after the user clicks it (or closes/reopens the tab, or hard-resets via DevTools → Application → Service Workers → Unregister + Clear site data). **This is the most common cause and the cheapest to fix.**
2. **Cloudflare Tunnel CDN edge cache.** `pacs.dhsolutions.com.bd` is fronted by Cloudflare; static assets can be cached at edge nodes for minutes. If SW unregistration doesn't fix it, purge `viewer`, `app-config.js`, `sw.js` (or "Purge Everything" for the zone) in the CF dashboard.

**Why:** Forgetting this turns a successful deploy into a panic ("nothing changed!"). Resist the urge to rebuild with `--no-cache` first — that wastes 12+ minutes and is almost never the actual cause. Cache-bust first.

**How to apply:**
- For ANY post-deploy "but the colors look the same" report, send the user to "Relaunch to update" + DevTools → unregister SW + Cloudflare purge **before** considering a rebuild.
- For verifying the build is correct (cheap one-off check), `docker exec pacs-ohif sh -c "grep -ho '178 45% 38%' /usr/share/nginx/html/*.css"`. If that returns hits, the image is fine; the issue is downstream.

**Husky pre-commit hook gotcha:** the fork's husky pre-commit hook requires `node` on PATH. Bash on this Windows VM doesn't pick up the Node install reliably; **commit from PowerShell** (where Node's install path is on Machine PATH after `[Environment]::SetEnvironmentVariable('Path', ..., 'Machine')`).
