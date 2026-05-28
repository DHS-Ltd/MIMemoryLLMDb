---
name: project-overview
description: "What the ImageConverter project is, its purpose, repo, and tech stack"
metadata: 
  node_type: memory
  type: project
  originSessionId: f822f273-9eaa-44a8-a895-017843abf11f
---

**ImageConverter** is a personal Python CLI tool for converting and resizing images between formats, with a focus on SVG-to-raster workflows.

- **Repo:** https://github.com/DHS-Ltd/ImageConverterMI.git (private, personal use only)
- **Local path:** `E:\Self_project\ImageConverter`
- **Language:** Python 3.14.3
- **Venv:** `E:\Self_project\ImageConverter\venv\`

## What it does
- SVG → PNG / JPG / WEBP / BMP / GIF / TIFF / ICO (rasterises via Cairo/cairosvg)
- SVG → SVG (rewrites width/height/viewBox in XML — stays vector, no Cairo needed)
- Raster → raster (all common format pairs)
- Any → ICO (multi-resolution: embeds 16, 32, 48, 64, 128, 256 px layers up to requested max)
- Single-file and batch conversion (glob pattern support)
- Aspect ratio preservation with transparent RGBA padding
- Quality profiles: LOW / MEDIUM / HIGH / MAXIMUM
- Built-in size presets (social media, app icons, web, document, standard)
- Interactive guided CLI menu AND direct `convert` / `batch` subcommands

## Core files
| File | Role |
|------|------|
| `main.py` | CLI entry point, interactive menus, click commands |
| `converter.py` | `ImageConverter` + `BatchConverter` classes, all format logic |
| `validators.py` | File, format, dimension, conversion-pair validation |
| `config.py` | All constants, presets, quality profiles, conversion matrix |
| `env.example` | Template for `.env` overrides |

**Why:** The tool exists solely for the owner's personal image conversion needs (logos, icons, social media assets). It is not distributed.
