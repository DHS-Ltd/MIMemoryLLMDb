---
name: watch-tooling-windows
description: How to make the /watch skill work on this Windows box (ffmpeg + yt-dlp not on PATH)
metadata: 
  node_type: memory
  type: reference
  originSessionId: 7e74d688-a15a-475f-91b0-384878641c92
  modified: 2026-08-02T23:22:50.954Z
---

`/watch` on this machine needs its binaries PATH-patched per run — its setup `--check` reports them
missing because they aren't on the persistent PATH.

- **ffmpeg/ffprobe:** already installed via winget `Gyan.FFmpeg` at
  `C:\Users\maidu\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin`
  (version drifts — re-locate with `Get-ChildItem $env:LOCALAPPDATA\Microsoft\WinGet\Packages -Recurse -Filter ffmpeg.exe`).
- **yt-dlp:** run the local `e:\DH-Advanced-Viewer\Inobitec_Resources\yt-dlp_x86.exe`, copied to a
  PATH-visible `yt-dlp.exe` (the script expects the name `yt-dlp`).
- **Python:** use `python` (not `python3`) — `C:\Python314\python`. `python3` is the MS Store stub.
- **No Whisper key configured** → run with `--no-whisper` (frames-only). Fine when clips have native
  captions or the read is visual.

Working per-run recipe (Bash): prepend the ffmpeg bin dir + a scratch bin holding `yt-dlp.exe` to `$PATH`,
then `python "$SKILL_DIR/scripts/watch.py" <url> --detail balanced --no-whisper --out-dir <scratch>`.

User has NOT yet opted to make this permanent (add ffmpeg to user PATH + drop `yt-dlp.exe` on PATH) —
offer once when relevant. See [[inobitec-scope-loop]].

## Slicer's Screen Capture — wired up 2026-08-03, and why it failed

Stock Slicer could not find the installed ffmpeg **even though it is on this box**. Root cause is a
Slicer defect on Windows: `ScreenCapture.py`'s `findFfmpeg()` probes only `/usr/local/bin/ffmpeg`,
`/usr/bin/ffmpeg` and Slicer's own download folder — **it never checks `PATH` or any Windows
location**, so auto-detection cannot succeed here. Its fallback is a mid-task prompt to download a
second copy over the internet.

Fixed permanently for the reconnaissance install by writing `General/ffmpegPath` into
`C:\Users\maidu\AppData\Roaming\slicer.org\Slicer.ini` (persists across restarts):

```python
slicer.modules.screencapture.widgetRepresentation().self().logic.setFfmpegPath(
    r"C:/Users/maidu/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe")
```

Verified end to end: 36-frame yaw rotation → H.264 MP4, 686×620, 3.0 s.

**Carries a product consequence** — `setFfmpegPath()` stores via `toSlicerHomeRelativePath()`, so
ffmpeg placed **inside the Slicer home tree** is stored as a *relative* path and stays valid across
installs. That is the packaging recipe for DHDicomAnalyzerPro, recorded in
`UX-Foundation/Slicer-Map-1-3D-VRT.md` §3.5. Ship an **essentials** build — the full one here is
242 MB.
