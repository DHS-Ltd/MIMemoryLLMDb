---
name: current-state
description: "Current state of the project as of 2026-05-28 — what's done, what's tested, git status"
metadata: 
  node_type: memory
  type: project
  originSessionId: f822f273-9eaa-44a8-a895-017843abf11f
---

**Last updated:** 2026-05-28

## Git status
- Repo: https://github.com/DHS-Ltd/ImageConverterMI.git (private)
- Branch: `master`
- Commits so far: 2
  1. `c61c9dc` — initial commit (all source files + README)
  2. `d2f71a2` — feat: add ICO output format with multi-resolution embedding

## What is fully working and tested
- SVG → PNG at 256×256, 512×512, 1280×720 (all PASS)
- SVG → SVG at 200×200 (XML rewrite, stays vector, PASS)
- SVG → ICO at 256×256 (6 embedded sizes), 64×64 (4 sizes), 32×32 (2 sizes) — all PASS
- Interactive CLI menu (all 5 options launch correctly)
- Batch conversion (glob pattern support)
- Quality profiles (LOW / MEDIUM / HIGH / MAXIMUM)
- Direct CLI commands: `python main.py convert --input x --format Y --size WxH`

## Supported formats (current)
Input: SVG, PNG, JPG, JPEG, BMP, TIFF, WEBP, GIF, ICO, PDF
Output: PNG, JPG, JPEG, BMP, WEBP, GIF, TIFF, SVG, **ICO** (added 2026-05-28)

## Files NOT tracked in git (by .gitignore)
- `venv/` — recreate with `python -m venv venv && pip install -r requirements.txt`
- `output/` — generated files
- `logs/` — conversion log
- `.env` — copy from `env.example`
- `test_conversion.py` — local test script
- `input/test_icon.svg` — local test asset

## Known remaining issues / limitations
- PDF input is listed but has only basic support (no page selection)
- ICO input → other formats not tested end-to-end (only SVG/PNG → ICO tested)
- No progress bar on batch jobs yet (tqdm installed but not wired in)
- Batch subcommand (`main.py batch`) reads glob at CLI call time; wildcards may need quoting in PowerShell

## Next enhancement candidates (from README)
1. ICO → other format conversion (read multi-res ICO, export largest layer)
2. HEIC / AVIF input via `pillow-heif`
3. Progress bar for batch using `tqdm`
4. Watermarking
5. Watch-folder mode

**Why:** [[project-overview]], [[architecture]]
