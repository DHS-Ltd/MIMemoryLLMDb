---
name: reference-image-tooling
description: "How to process/encode images on this machine — no ImageMagick or cwebp; use Astro's bundled sharp by absolute path"
metadata: 
  node_type: memory
  type: reference
  originSessionId: bfb74f78-4b24-4799-b716-3d3750769e41
  modified: 2026-08-13T10:58:53.522Z
---

This machine has **no ImageMagick (`magick`/`convert`), no `cwebp`, no `ffmpeg`**. The only
image encoder available is **`sharp`**, present as a dependency of Astro in
`d:/Med_I_Thailand_Website/node_modules/sharp`.

A script placed in the scratchpad cannot `import 'sharp'` (it resolves against the scratchpad,
not the project). Import it by absolute file URL instead — and note the package's `main` is
`dist/`, not `lib/`:

```js
const { default: sharp } = await import(
  'file:///d:/Med_I_Thailand_Website/node_modules/sharp/dist/index.mjs'
);
```

Two techniques that paid off and are worth reusing (relevant because the owner judges design
on sight — see [[feedback-owner-judges-design-when-deployed]]):

- **Contact sheets before choosing images.** Compositing candidates into one 900×400 grid and
  reading that costs a fraction of reading each image, and filenames lie (files named
  `Automated-Radiochemistry-Systems.jpg` turned out to be flat pictograms, not photos).
- **Mock the layout before shipping it.** Compositing the real crops + real gradient + text at
  true pixel sizes caught a bad auto-crop that the code review could not have.

Outbound network works. `images.unsplash.com` fetches fine; Unsplash's search API and
`/download` endpoint both need a key (403), but WebFetch on a `/s/photos/<query>` page will
extract the CDN URLs. Pexels blocks with 403. Openverse and the Wikimedia Commons API are
open and need no key.
