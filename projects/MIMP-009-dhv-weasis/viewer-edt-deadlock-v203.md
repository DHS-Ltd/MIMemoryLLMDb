---
name: viewer-edt-deadlock-v203
description: The SITE015 "viewer hangs on retrieve" freezes were an EDT/thumbnail deadlock, fixed and shipped as Viewer v2.0.3.
metadata:
  type: project
---

SITE015 Mirpur's repeated total Viewer freezes (2026-08-25) were **not** a PACS/network problem
despite the Retrieve bar sticking at 100%. Root cause: an ABBA deadlock between `AWT-EventQueue-0`
(paint: AWT tree lock -> `SeriesThumbnail` monitor via `Thumbnail.getImage`) and
`DicomQueryRetrieve-1` (`RetrieveTask.doInBackground:274` -> `allSeriesPostProcessing` ->
`LoadLocalDicom:182` -> `reBuildThumbnail`: monitor -> tree lock via `Component.setSize`).
Confirmed by three identical `jcmd Thread.print` dumps ("Found one Java-level deadlock").

The bar reads 100% because the C-GET genuinely finished — `allSeriesPostProcessing()` is the very
next statement after `CGet.process` returns. Reachable only via the 4D-split branch, i.e. the
heuristic from [[series-tear-fix]] / ADR-0022, which is why Philips Enhanced MR at Mirpur triggers it.

Fixed by making `SeriesThumbnail` mutation EDT-only (guard inside `reBuildThumbnail` + explicit
`GuiExecutor.execute` at the call site). See DHDicomViewer ADR-0023. Built + verified inside the
shipped jars as **Viewer v2.0.3 / bundle v1.0.3** on 2026-08-25, then **INSTALLED at SITE015 the
same night (~23:25) and confirmed loading/retrieving correctly.** The install also shipped
[[pr-selector-suppressed]] for the first time; its icon is confirmed gone.

**STATUS: NOT YET CLOSED — awaiting field confirmation.** The deadlock is a *race* between the EDT
painting a thumbnail and the retrieve worker rebuilding it, so one clean retrieve does not prove
absence; only sustained use does. The fix is structural (the lock cycle can no longer form in the
first place, since the monitor is now taken only on the EDT), so confidence is high, but the bar
agreed with the user is **a couple of days of real doctor usage at Mirpur without a freeze**.
Ask for that confirmation before declaring it fixed. **Still uncommitted** — the user is holding
the commit until doctors have used it in a later session.

**Why:** the symptom convincingly impersonates a stalled network retrieve, and two plausible-but-wrong
theories (memory pressure, hidden modal dialog) burn time first.
**How to apply:** for any "Viewer hangs" report, take a thread dump before killing the process.
`Process.Responding` is TRUE for a deadlocked Swing app (the AWT toolkit thread answers `WM_NULL`,
not the EDT) so it proves nothing. The shipped runtime is jlink `--strip-native-commands`, so put a
matching **JDK 25** on the box to get `jcmd`. File logging is off by default, so there is no
application log — only `%USERPROFILE%\.weasis\log\boot.log`. Evidence lives in
`01_Pacs_File/01_Pacs_File/docs/Problem_Troubleshooting/`. See [[dhv-build-pipeline-traps]].
