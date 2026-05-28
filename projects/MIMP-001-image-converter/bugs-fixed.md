---
name: bugs-fixed
description: "All bugs encountered and fixed during the initial build session, with root causes"
metadata: 
  node_type: memory
  type: project
  originSessionId: f822f273-9eaa-44a8-a895-017843abf11f
---

## 1. Pillow 10.1.0 — `KeyError: '__version__'` on install
**Root cause:** Pillow 10.1.0 has a `setup.py` bug where `__version__` is inaccessible during the build metadata phase; newer setuptools exposes it.
**Fix:** Bumped to `Pillow==12.2.0` in `requirements.txt`. Python 3.14 requires Pillow 12.x for prebuilt Windows wheels.

## 2. `OSError: no library called "cairo-2" was found` on startup
**Root cause:** `import cairosvg` was at the top of `converter.py`, so it triggered the Cairo DLL lookup immediately — even when not converting SVG files. GTK3 Runtime was not installed.
**Fix (code):** Moved `import cairosvg` inside `_load_svg()` so it only runs when an SVG is actually being converted. Added a clear `ConversionError` message with the GTK installer URL.
**Fix (system):** Installed GTK3 Runtime from tschoonj's GitHub releases to `E:\Program Files\GTK3-Runtime Win64\`.

## 3. SVG → SVG output failed — `unknown file extension: .svg`
**Root cause:** PIL cannot save SVG. The `_save_image` method fell through to a bare `image.save()` call with a `.svg` extension, which PIL rejected.
**Fix:** Added `_convert_svg_to_svg()` method in `converter.py` that short-circuits before rasterisation. It parses the SVG XML with `xml.etree.ElementTree`, rewrites the `width`, `height`, and `viewBox` attributes, and writes the file directly — no PIL involved. This keeps the output as a true vector file.

## 4. `UnicodeEncodeError: 'charmap' codec can't encode character '→'`
**Root cause:** Log messages in `_resize_image` used the `→` arrow character, which Windows cp1252 console encoding cannot represent.
**Fix:** Replaced all `→` with `->` in log strings (replace_all edit across `converter.py`).

## 5. `pip` defaulting to user installation (bypassing venv)
**Root cause:** The venv was not activated in the shell session used for testing, so bare `pip` used the system Python 3.14 install.
**Fix:** Always call `venv\Scripts\pip.exe` directly, or activate the venv first.

**Why these are recorded:** [[environment-setup]] — they are likely to recur if someone clones the repo on a fresh machine or upgrades Python.
