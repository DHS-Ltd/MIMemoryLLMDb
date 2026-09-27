---
name: project-dhpacs-doctor-desk
description: "DHPacs Doctor Desk — Electron desktop shell around the hosted Doctor Portal. Designed 2026-09-05, BUILT + DEPLOYED + TESTED WORKING same day as v1.0.4. Sign Out/multi-doctor switching confirmed correct on one test machine. Auto-update infra live but never confirmed to actually fire."
metadata: 
  node_type: memory
  type: project
  originSessionId: ee2f96e5-dabc-44ef-a961-eeb696ed1b72
  modified: 2026-09-05T11:04:35.440Z
---

**DHPacs Doctor Desk** — designed via `/grill-with-docs` **2026-09-05**, then built, deployed, and tested
working **the same day**, ending at **v1.0.4**. A Windows Electron app giving doctors a desktop icon instead
of a URL: loads the *hosted* Doctor Portal (no bundled SPA copy), holds a Device Token so login happens once
ever, and self-updates. Full design rationale: [[project-doctor-dh-viewer]] (the heavier sibling this reuses
M1 from — see that memory's 2026-09-05 update for the M1 deploy record).

## Status: working, on one test machine

Confirmed end-to-end on a single test PC (Windows user `itp`): enrol once with real doctor credentials →
patients load, site-scoped correctly → **Sign Out un-enrols the device** (revokes server-side, clears the
local token, returns to enrolment — not just a browser-cookie clear) → logging in as a **different doctor from
a different hospital** correctly shows that doctor's own site-scoped patients, not the previous doctor's →
closing and reopening the app keeps the same doctor logged in with no password re-entry. That is the
product's whole point, and it now demonstrably works.

**Not yet done:** pilot with a second real machine/doctor (D6 in the plan), and **auto-update has never been
confirmed to actually fire** — see below.

## The real bugs found while getting there (all fixed, all worth remembering)

1. **`signAndEditExecutable: false` silently disabled version-metadata AND icon embedding, not just code
   signing.** Set to satisfy "never sign," it also skips electron-builder's `rcedit` resource-editing step
   entirely — every early build (`1.0.0`, `1.0.1`) shipped an exe whose `FileVersion`/`ProductVersion` read
   Electron's own version (`32.3.3`), `ProductName` read "Electron", `CompanyName` read "GitHub, Inc.". Signing
   was already a safe no-op without a certificate (`no signing info identified, signing is skipped` in every
   build log) — so the flag was unnecessary. **Fix: remove it entirely; add a real `author` field.** If this
   flag is ever reintroduced for a real signing need, verify version metadata separately — don't assume it
   only touches signing.
2. **The doctor-ui SPA had no `Cache-Control` headers**, and this became a real, PHI-adjacent bug once a
   long-lived Electron shell (not a browser tab that's closed/reopened constantly) entered the picture:
   Chromium's heuristic caching kept serving a **stale, pre-fix `index.html`** — referencing an OLD JS
   bundle — for weeks after real deploys. This is exactly why the Sign Out fix appeared to work
   inconsistently: the *first* Sign Out click ran old cached code (fell through to the plain browser
   logout, silently reconnecting as the same doctor via the Device Token); only after the cache happened to
   turn over did the fix actually engage. **Fixed two ways:** (a) `dh-pacs-doctor/nginx.conf` now sends
   `Cache-Control: no-cache` on `index.html`/the SPA fallback and `public, max-age=31536000, immutable` on
   `/assets/` (Vite content-hashes filenames, so aggressive caching there is safe) — this also benefits the
   plain browser portal, not just the Desk; (b) the Desk itself now calls
   `session.defaultSession.clearCache()` **unconditionally on every launch** (`main.js`, `app.whenReady`) —
   headers alone don't retroactively un-stale an already-cached entry from before the header existed, and
   given the failure mode was "one doctor's screen renders under another doctor's login," relying on a manual
   force-reload wasn't good enough.
3. **Electron's default `File/Edit/View/Window/Help` menu was showing** — nobody had called
   `Menu.setApplicationMenu(null)`. Fixed, but removing it also removed the default Force-Reload accelerator,
   so a window-scoped `Ctrl+Shift+R` hotkey was re-added via `before-input-event` (DevTools via F12 still work
   unassisted either way — not tied to the menu).
4. **The tray/taskbar tooltip showed a full paragraph** — turned out to be a *different* icon than expected:
   not the Electron `Tray` object (system tray near the clock), but **Windows' own taskbar tooltip reading the
   exe's `FileDescription`** resource field, which had been set to package.json's long `description` text by
   the rcedit fix in #1. Shortened `description` to `"DH PACS Doctor Portal desktop shell"`.
5. **A packaged GUI Electron app has no visible console** — `console.log`/`error` went nowhere useful once
   launched from a desktop icon. Added a durable append-only file logger (`desk.log` in `app.getPath
  ('userData')`, capped ~2MB) covering login/logout attempts (never passwords), session-exchange results,
   screen transitions, and every `autoUpdater` lifecycle event. This is the only way any *future* issue on a
   doctor's machine will be diagnosable at all — there is no other observability.
6. **`node.exe` (native Windows binary) doesn't understand Git Bash's `/d/...` POSIX-style paths** embedded
   inside a larger string argument — broke `publish-feed.sh`'s `node -p "require('$DESK_DIR/package.json')..."`
   with `MODULE_NOT_FOUND`. Git's own bundled `ssh`/`scp` ARE MSYS-aware and handle those paths fine (this is
   why the earlier D0 deploy script worked) — it's specifically bare `node.exe` that isn't. Fixed by `cd`-ing
   into the directory first and using a relative `require('./package.json')`.
7. **A doctor-ui deploy was run from the wrong working directory** (`desk/` instead of the repo root),
   causing `scp -r src/ ...` to upload the *Electron app's* `src/` (main.js, preload.js, lib/, screens/) into
   `/srv/pacs/doctor-ui/src/` on the VM, alongside the real SPA source. Harmless — Vite's build only follows
   what `main.tsx` actually imports, confirmed via an unchanged output hash — but cleaned up afterward.
   **Always `cd` to the intended repo root before a multi-repo manual deploy.**

## Auto-update: infrastructure is live, but UNVERIFIED

The feed (`https://pacs.dhsolutions.com.bd/desk-updates/`), `electron-updater` config, and
`desk/scripts/publish-feed.sh` all work mechanically — versions `1.0.0` through `1.0.4` were each built and
published without error, and `latest.yml` correctly reflects the current version when fetched. **But an
already-installed Desk has never been observed to silently pick up a newer version on its own** — every
version bump so far was applied by manual reinstall, because the 1.0.1→1.0.2 auto-update attempt appeared not
to apply (confirmed indirectly: `desk.log`, introduced in 1.0.2, didn't exist after supposedly updating to
1.0.2, meaning the app was still running 1.0.1). Root cause was never found — testing moved to manual installs
each time to keep the session progressing, and by the time `autoUpdater` event logging existed (1.0.3), the
test machine had already been manually upgraded past the failure point. **Do not claim or assume automatic
update works** until a real instance is left alone across a genuine version bump and confirmed via `desk.log`
lines like `autoUpdater: checking for update` → `update-available` → `update-downloaded`, followed by the
*next* launch reporting the new version with no manual reinstall in between.

## Explicitly not done

- Code signing (per the "never sign" decision) — SmartScreen warning still expected on every install.
- Pilot on a second real doctor/machine (D6).
- Auto-update end-to-end confirmation (above).
- **Nothing from this session is committed to git in either repo yet** — backend routes, SPA changes, the
  entire `desk/` app, deploy scripts, and doc updates all exist only as working-tree changes as of
  2026-09-05. This repeats the exact "deploy-without-commit" pattern this project has been bitten by before
  (see [[project_git_remote_live]]) — resolve it before it compounds.

## Separately discovered, NOT part of this work

**Doctor Reports (Phase 10) appears to be missing from production** — `doctor-reports.js`/
`doctor-test-catalog.js` don't exist on the VM and aren't wired into `index.js`, despite the DB table existing
and [[project_doctor_reports_live]] recording it as shipped. Not investigated or touched this session — flagged
there for its own follow-up. Also: the central repo's git working tree carries substantial uncommitted,
partially-deployed drift (Doctor Support Phase A/B–F fields, admin-ui doctor pages, JPEG-LS config) unrelated
to this work — `index.js` specifically needed a hand-verified surgical patch rather than a wholesale push of
the local file, because the live version had already diverged from git in ways this session didn't create or
fully map.

**Docs:** plan `dh-pacs-doctor/docs/DoctorDesk/DHPacs_Doctor_Desk_Plan.md`; central ADR
`docs/adr/0021-doctor-desk-is-a-remote-content-shell.md`; deploy script
`Pacs_Viewer_Storage_Project/deploy/scripts/deploy-doctor-desk-d0.sh`; publish script
`dh-pacs-doctor/desk/scripts/publish-feed.sh`.
