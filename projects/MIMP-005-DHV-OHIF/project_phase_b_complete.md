---
name: project-phase-b-complete
description: "Phase B mobile UX — collapsed panels, toolbar (Cine/Pan/WL/MoreTools, right-aligned), touch targets, MobileThumbnailStrip, layout toggle, patient banner; desktop unchanged"
metadata: 
  node_type: memory
  type: project
  originSessionId: 447eca1b-b14d-4a59-a1a8-98768fade01b
---

**Status as of 2026-06-02: Phase B COMPLETE.**

All mobile UX work is live on `dhs-main`. Desktop layout is 100% untouched — every change is guarded by `isMobileViewport` or Tailwind `md:` breakpoints.

## What shipped (in commit order)

### 1 — Panel collapse on mobile
- Left panel auto-collapsed at mount when `window.innerWidth < 768` (`initialLeftPanelClosed = leftPanelClosed || isMobileViewport`)
- `ResizablePanelsHook.tsx`: ResizeObserver watches for downward crossing of the 768px threshold and auto-collapses the left panel
- Left and right panels hidden **entirely** on mobile (not just collapsed — the `<ResizablePanel>` and `<ResizableHandle>` blocks are guarded with `!isMobileViewport`)

### 2 — Toolbar trimmed to 4 touch-sized buttons
- `mobileHidden: true` added to button definitions in `modes/basic/src/toolbarButtons.ts`: `MeasurementTools`, `TrackballRotate`, `Capture`, `Layout`, `MPRDHLayout`, `Crosshairs`, **`Zoom`** (added 2026-06-13)
- `Toolbar.tsx`: filters buttons where `componentProps.mobileHidden === true` when `isMobile` (reactive via `window.matchMedia`)
- `MOBILE_SUPPRESSED_SECTIONS = ['viewportActionMenu.topLeft']` — entire orientation/overlay section suppressed on mobile
- **Current 4 primary buttons (as of 2026-06-13): Cine, Pan, WindowLevel, MoreTools**
  - Zoom was swapped out for Cine (`modes/basic/src/index.tsx`): Zoom moved into MoreTools (position 2, after Length); Cine promoted from MoreTools to primary
- Touch size: new `touch` variant added to `ToolButton.tsx` (`w-11 h-11` = 44px), injected by Toolbar on mobile
- **Toolbar buttons right-aligned on mobile** (2026-06-13): `Header.tsx` center div changed from `left-1/2 -translate-x-1/2` to `right-0` on mobile, `md:left-1/2 md:-translate-x-1/2` on desktop — logo stays left, tools sit at the right edge

### 3 — Header thinned on mobile
`Header.tsx` — all desktop-only elements wrapped in `hidden md:block` / `hidden md:flex`:
- Secondary toolbar (left-side)
- UndoRedo buttons
- PatientInfo
- Both divider bars
- Gear/settings dropdown

### 4 — MobileThumbnailStrip component
**New file:** `extensions/default/src/ViewerLayout/MobileThumbnailStrip.tsx`

Horizontal scrollable series navigator at the bottom of the viewport on mobile:
- 160px tall strip, cards 112×144px, ~3 visible before horizontal scroll
- Image-only cards (no text labels) — thumbnail loaded async via same cornerstone pattern as `PanelStudyBrowser`
- Active series: teal border `border-[#06b6d4]`; loading: pulse placeholder
- Tapping a card: `hangingProtocolService.getViewportsRequireUpdate()` → `commandsManager.run('setDisplaySetsForViewports')`
- Subscribes to `DISPLAY_SETS_ADDED` and `DISPLAY_SETS_CHANGED` for live updates
- Filters out `NO_IMAGE_MODALITIES = ['SR', 'SEG', 'RTSTRUCT', 'RTPLAN', 'RTDOSE', 'DOC', 'PMAP']`
- Delays ready-state by `250ms + activeSets.length * 10ms` to avoid competing with initial image loading

### 5 — nginx no-cache for HTML entry points
`D:/Pacs_Viewer_Storage_Project/deploy/config/nginx/nginx.conf` — added before `location /`:
```nginx
location ~ ^/(viewer|basic-test)$ {
    proxy_hide_header ETag;
    proxy_hide_header Last-Modified;
    add_header Cache-Control "no-store" always;
}
```
**Why:** After each rebuild, browsers served stale cached `index.html` (with old bundle hashes) → 404 on new JS bundles → blank screen. This fix is permanent.

## Key files changed
| File | Change |
|---|---|
| `extensions/default/src/ViewerLayout/index.tsx` | `isMobileViewport` flag; panel guards; viewport div `min-h-0`; strip render |
| `extensions/default/src/ViewerLayout/ResizablePanelsHook.tsx` | Auto-collapse on resize below 768px |
| `extensions/default/src/ViewerLayout/MobileThumbnailStrip.tsx` | **NEW** — bottom strip component |
| `extensions/default/src/Toolbar/Toolbar.tsx` | `useIsMobile()` hook; button filtering; section suppression; touch size injection |
| `platform/ui-next/src/components/ToolButton/ToolButton.tsx` | `touch` size variant (44px) |
| `platform/ui-next/src/components/Header/Header.tsx` | `hidden md:*` on UndoRedo, PatientInfo, gear, Secondary |
| `modes/basic/src/toolbarButtons.ts` | `mobileHidden: true` on 7 buttons (added Zoom 2026-06-13) |
| `modes/basic/src/index.tsx` | `Length` prepended to `MoreTools`; Cine↔Zoom swapped between primary and MoreTools (2026-06-13) |
| `deploy/config/nginx/nginx.conf` | `no-store` on `/viewer` and `/basic-test` routes |

## How to apply
- Phase C (custom extension) is the next phase. See [[project-phase-c-blockers]] for unresolved questions blocking it.
- If mobile UX needs adjustment, the entry points are `MobileThumbnailStrip.tsx` (strip), `Toolbar.tsx` (button filtering), and `index.tsx` (layout guards).
- The `isMobileViewport` flag is a **one-time snapshot at mount** (`window.innerWidth < 768`). Reactive breakpoint behaviour uses `useIsMobile()` (matchMedia) in Toolbar. If a new component needs reactive mobile detection, copy that hook.
