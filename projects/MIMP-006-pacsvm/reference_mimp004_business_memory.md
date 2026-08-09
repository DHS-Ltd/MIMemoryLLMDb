---
name: reference-mimp004-business-memory
description: "MIMP-004 (mmp-memory MCP) is the authoritative source for the DH PACS marketing website, sales/business strategy, pricing model, and brand voice — covers a separate repo, not this one"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 4a1b770e-8ea6-4b4c-a188-2bed29f37d05
aliases: [reference-mimp004-business-memory]
---

The DH PACS marketing website was originally planned with docs inside this repo (`docs/Website/DH_PACS_WEBSITE_CONTENT_BLUEPRINT.md`, see [[project_website_work]]), but the actual implementation has since moved to its own dedicated repo and project memory:

- **Repo:** `E:\DHS-PACS\dh-pacs-website` — GitHub `https://github.com/DHS-Ltd/DH-PACs-Solutions.git` (private)
- **Stack:** Next.js 16.2.6 (App Router, server runtime via `output: "standalone"` — NOT static export), Tailwind v4 + shadcn/ui, Supabase Cloud (Singapore region, `tdvixhpnnljrhvhxsvzw`), deployed via OpenNext Cloudflare adapter to **Cloudflare Workers + Workers Builds** (not classic Pages — Next 16 isn't supported there; see [[project_marketing_site_central_integration]] for the full decision)
- **Domain:** Will be mirrored at `pacs.dhsolutions.com.bd` itself via nginx reverse proxy in `dh-pacs-central` — not a separate domain (overrides the original blueprint's `dhsolutions.com.bd` plan, see [[project_marketing_site_central_integration]])
- **Content source of truth:** `E:\DHS-PACS\docs\Architecture\DH_PACS_WEBSITE_CONTENT_SPEC.md`
- **Brand voice doc:** `E:\DHS-PACS\docs\DH_PACS_BRAND_VOICE.md`
- **Memory:** tracked in `mcp__mmp-memory` project `MIMP-004`, not in this project's local `.claude` memory

**Why:** This repo's CLAUDE.md and local memory only know the pre-rewrite blueprint stage (static HTML/Tailwind plan from 2026-05-29). MIMP-004 reflects the live, far more advanced build (full Next.js site, 8 homepage sections built, visual-quality pass in progress as of 2026-06-16) plus the business/sales strategy that was decided alongside it.

**How to apply:** For any question about the marketing website, lead generation, sales copy, pricing strategy, or brand voice, call `mcp__mmp-memory__get_project_memory(project="MIMP-004")` rather than trusting the local `docs/Website/` blueprint or [[project_website_work]] — those are stale. See [[dh_pacs_business_strategy]] for the durable facts pulled from MIMP-004 on 2026-06-17.
