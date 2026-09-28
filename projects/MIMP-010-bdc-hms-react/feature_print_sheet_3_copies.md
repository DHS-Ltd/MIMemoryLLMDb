---
name: feature-print-sheet-3-copies
description: Print invoice emits 2 Office + 1 Patient copy on one auto-scaled A4 sheet; the fit zoom must be iterative — transform-scale and single-pass zoom both fail pagination
metadata:
  type: project
---

2026-09-17: `generateInvoiceHtml()` defaults to `copies: 3` — two OFFICE COPY then one PATIENT COPY on a single A4 sheet, cut lines between. Two mechanisms keep it to one page: a `.compact` CSS class (applied only when multi-copy) that strips vertical whitespace, then an inline script that shrinks `document.body.style.zoom` in a loop until `.wrap` fits 278mm.

Shipped in commit `d9925cb`, pushed to main, Cloudflare Pages build confirmed live (see [[cloudflare-deployment]]). Frontend-only — no `clasp` deploy was needed, GAS backend untouched. **Not yet tested on real paper** as of this writing; the open risks are printer-driver "fit to page" double-shrinking the sheet, and the navy `.itbl th` bar in draft/grayscale mode.

**Why three copies at all:** the user asked for two office + one patient. Three full-size copies physically cannot fit one A4 — measured one copy at 124mm (3 test lines) and 152mm (8), against a 281mm budget. Offered the choice of spilling to a second sheet vs. shrinking to fit; the user chose "shrink everything to always fit", accepting smaller print on long invoices.

**How to apply:** if you touch the fit logic, the loop is not optional. Two cleaner-looking alternatives were measured and both FAILED to produce one page:
- single-pass `zoom = avail / height` — `zoom` reflows text, so height does not shrink linearly with the factor; still paginated at 3 and 8 test lines
- `transform: scale()` on an inner wrapper plus explicit heights — transform does not reflow, but the untransformed layout box still drives pagination; produced 2-3 pages

Confirmed 1 page at 1/3/5/8/15/25 test lines (zoom 1.00 → 0.48). Verify any change the same way — by page count, never by eyeballing: see [[headless-browser-verification]].

There is deliberately **no lower bound on the zoom**, because the user asked for "always fit". A 25-line invoice prints at 48%. If staff complain about size, add a floor (~0.65) and let it break to a second sheet past that. A second known cosmetic gap: at heavy zoom the sheet narrows horizontally too, leaving unused page width.

Run `node src/utils/generateInvoiceHtml.selfcheck.mjs` after editing — plain `node:assert`, no framework. It asserts copy count, labels, ordering, and that the `copies: 1` path stays clean.

**Do not let `copies: 1` regress.** `InvoiceTemplate.jsx` passes it for the on-screen preview AND the html2canvas image archived to Drive. It must get neither the `.compact` class nor the fit script — a stray `<script>` or a zoom would corrupt the archived invoice image.
