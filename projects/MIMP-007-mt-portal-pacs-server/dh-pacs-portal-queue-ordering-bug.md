---
name: dh-pacs-portal-queue-ordering-bug
description: 2026-09-02 fleet-wide Portal bug found via SITE03 - unordered Orthanc /studies array silently dropped new studies from queue + resurrected phantom stuck uploads; fixed in v0.3.2 (commit dcd457d)
metadata:
  type: project
  originSessionId: (see conversation this was saved from)
  modified: 2026-09-02T12:07:03.392Z
---

**Fleet-wide bug, not SITE03-specific — any site whose local Orthanc backlog exceeds 50 studies
can hit this.** Found while diagnosing SITE03 (CMCH, fleet's first-ever live site) reporting a
real patient study (Ajgor Ali, 2026-09-02) invisible in the Portal's To-Process queue despite the
modality confirming a successful send, plus a "33 uploading, all stuck at 0%" tray.

**Root cause 1 — `GET /api/local/studies` (portal/server.js):** assumed Orthanc's plain
`GET /studies` array is returned in arrival/chronological order and did `ids.slice(-50).reverse()`.
Orthanc's REST API does not guarantee that ordering — it's an internal implementation detail. Past
50 local studies, this silently dropped genuinely new studies from the queue while including old
ones instead. **Fixed:** switched to `POST /tools/find` with `Expand:true`, sort explicitly by each
resource's own `LastUpdate` field, then take top 50.

**Root cause 2 — `rebuildUploadRegistry()`:** Orthanc metadata slot 4202 (`JOB_METADATA`) is written
once when a push *starts* and is never cleared. On every Portal restart this function replayed
every study carrying that marker as "still uploading" without checking whether the underlying
Orthanc job actually still exists — and Orthanc doesn't retain job history forever, so old job ids
mostly 404. A missing job was being treated as "still pending" → permanent stuck-at-0% entries in
the UI tray. **Fixed:** now calls `GET /jobs/{id}` and only reattaches if `State` is
Pending/Running/Paused.

**Shipped:** v0.3.1 (fix 1) then v0.3.2 (both fixes + Copy Link), commit `dcd457d`. Deployed to
SITE03 via in-place upgrade (no wipe) specifically so the real stranded patient study could be
rescued and pushed before any destructive work touched the box — see [[dh-pacs-leg1-upload-compression]]
for SITE03's broader install history (this is the same box, `C:\DHPacs\Orthanc` / `DH-PACS-Orthanc`,
`C:\DHPacs\Portal` / `DH-PACS-Portal`, AET `SITE03_ORTHANC`).

**Other fleet sites should be treated as suspect** if their local Orthanc backlog is large and
unpruned — same pattern as the JPEG-LS retrofit gap. Not yet swept across the fleet as of this
writing.

**Gotcha confirmed same session — install-directory locks silently no-op a "clean reinstall":**
attempted to `Rename-Item` SITE03's `C:\DHPacs\Orthanc` aside before reinstalling fresh; it failed
with "Access to the path is denied" (something still had a handle open even after `Stop-Service` +
`nssm remove`). The operator ran the installer anyway — Inno Setup silently installed *into* the
still-existing directory. `install-orthanc-service.ps1`'s config generation only writes
`orthanc.json` if one doesn't already exist (same pattern as `install-portal.ps1`'s `.env`
handling), so the existing config (and the full old local-study backlog) survived untouched with no
error surfaced. **Lesson: after a failed rename/move, verify with fresh file timestamps + a real
study count before trusting a "reinstalled" box — don't assume the installer ran clean just because
the wizard completed and services came up Running.** On SITE03 this turned out to be harmless
(config was already correct) and the operator chose to leave the backlog in place rather than force
a reboot to release the lock.

**Also reconfirmed:** the combined installer (`dh-pacs-workstation-setup-v1.3.0.exe`) is
new-site-only (ADR-0008) — existing sites use the legacy split installers
(`dh-pacs-orthanc-setup-v0.2.0.exe` + `dh-pacs-portal-setup-v0.3.x.exe`, built by `build-all.ps1`).
SITE03 also had a hand-added `Inobitec` DICOM modality entry (`192.168.1.21:11112`, presumably the
hospital's own CT/RIS console) in `orthanc.json` that the stock `orthanc.json.template` does not
carry — worth checking for on any site before a from-scratch config regen.
