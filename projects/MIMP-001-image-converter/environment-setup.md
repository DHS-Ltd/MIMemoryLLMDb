---
name: environment-setup
description: "How to set up the dev environment — Python version, venv, dependencies, GTK3 Runtime"
metadata: 
  node_type: memory
  type: project
  originSessionId: f822f273-9eaa-44a8-a895-017843abf11f
---

## Python version
Python **3.14.3** — this is important. Pillow 10.x and 11.x have no prebuilt Windows wheels for 3.14, so Pillow **12.x** is required.

## Virtual environment
```powershell
python -m venv venv
venv\Scripts\activate
```
Always use the venv's pip directly when not activated:
```powershell
venv\Scripts\pip.exe install -r requirements.txt
```
Running bare `pip` in the project directory bypasses the venv and installs to the system Python.

## Current pinned dependencies (requirements.txt)
| Package | Version | Notes |
|---------|---------|-------|
| Pillow | 12.2.0 | Python 3.14 requires 12.x |
| cairosvg | 2.7.1 | SVG rasterisation |
| click | 8.1.8 | CLI framework |
| colorama | 0.4.6 | Coloured output |
| python-dotenv | 1.0.1 | .env loading |
| tqdm | 4.67.1 | Progress bars |

## GTK3 Runtime (required for SVG-to-raster only)
- **Installed at:** `E:\Program Files\GTK3-Runtime Win64\bin\`
- **DLL:** `libcairo-2.dll` lives in that bin folder
- The installer adds this path to the system PATH permanently
- **After a fresh terminal**, PATH is picked up automatically
- If running from a session that predates the install, manually prepend:
  ```powershell
  $env:PATH = "E:\Program Files\GTK3-Runtime Win64\bin;" + $env:PATH
  ```
- Verify: `where.exe libcairo-2.dll`

## SVG → SVG does NOT need GTK3
Only SVG-to-raster conversions require Cairo. SVG-to-SVG rewrites XML attributes directly.

**Why:** [[project-overview]]
