---
name: architecture
description: "Code architecture — how the modules connect, key design decisions, and ICO multi-resolution logic"
metadata: 
  node_type: memory
  type: project
  originSessionId: f822f273-9eaa-44a8-a895-017843abf11f
---

## Module relationships

```
main.py  (CLI / menus)
  └── ImageConverter      (converter.py)
  └── BatchConverter      (converter.py)
        └── ImageValidator   (validators.py)
        └── validate_all     (validators.py)
        └── config constants (config.py)
```

## converter.py — key design decisions

### SVG → raster flow
1. `convert()` detects `input_format == 'SVG'` and calls `_load_svg()`
2. `_load_svg()` lazy-imports `cairosvg` (import is inside the function, not at module level)
3. cairosvg rasterises to PNG bytes in memory → loaded as PIL RGBA Image
4. Normal `_resize_image()` → `_save_image()` pipeline follows

### SVG → SVG flow (short-circuit, no rasterisation)
1. `convert()` detects `input_format == 'SVG'` AND `output_format == 'SVG'`
2. Calls `_convert_svg_to_svg()` immediately — skips PIL entirely
3. Uses `xml.etree.ElementTree` to parse SVG, set `width`/`height`, ensure `viewBox` exists, write output

### ICO multi-resolution logic (`_save_image`)
- `ICO_STANDARD_SIZES = [16, 32, 48, 64, 128, 256]` defined in `config.py`
- Image must be RGBA (converted if not)
- Embedded sizes = all standard sizes ≤ `min(image.width, image.height)`
- Example: request 256×256 → embeds 6 sizes; request 32×32 → embeds 2 sizes (16, 32)
- Pillow's `image.save(path, format='ICO', sizes=[...])` handles the actual multi-res packing

### Aspect ratio preservation
- `_resize_image()` with `preserve_aspect_ratio=True`: scales to fit inside target box, then pastes onto a transparent RGBA canvas of exact target size (letterbox/pillarbox)

## config.py — key constants
- `SUPPORTED_OUTPUT_FORMATS` — what the interactive menu shows
- `CONVERSION_MATRIX` — what validator allows per input format
- `ICO_STANDARD_SIZES` — `[16, 32, 48, 64, 128, 256]`
- `SVG_DPI` — default 150; controls rasterisation resolution (override in `.env`)
- `SIZE_PRESETS` — nested dict: category → name → (width, height)

## Output directory structure
```
output/
  PNG/    ← all PNG outputs
  JPG/
  WEBP/
  ICO/
  SVG/
  ...     ← one sub-dir per format
```
Sub-directories are created automatically by `output_path.parent.mkdir(parents=True, exist_ok=True)`.

**Why:** [[project-overview]]
