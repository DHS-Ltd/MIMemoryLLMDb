---
name: marketing-site-central-integration
description: "In-progress work to mirror the dh-pacs-website homepage at pacs.dhsolutions.com.bd via nginx reverse proxy, plus the dh-pacs-central CI/CD pipeline (ADR 0011) — current decisions and what's still pending as of 2026-06-17"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4a1b770e-8ea6-4b4c-a188-2bed29f37d05
aliases: [marketing-site-central-integration, marketing_site_central_integration, project-marketing-site-central-integration]
---

Session started from a CI/CD request for `dh-pacs-central` (ADR 0011: self-hosted GitHub Actions runner on the production VM, manual `workflow_dispatch` deploy, SHA-tagged rollback, auto health-check rollback, `nginx -t`-gated config deploys, migrations excluded). Mid-session, the user revealed the actual immediate driver: the `dh-pacs-website` marketing site (built on a separate machine, see [[reference_mimp004_business_memory]]) needs to be reachable at `pacs.dhsolutions.com.bd` itself, not a separate domain.

## Key architecture decisions made this session

**No secondary domain.** Originally recommended keeping the marketing site off `pacs.dhsolutions.com.bd` (separate hostname). User overruled this explicitly — the site's only home is `pacs.dhsolutions.com.bd`. All of the site's routes (`/`, `/contact`, `/case-study`, `/privacy-policy`, and a renamed demo route) get proxied there via nginx; nothing lives on a different domain.

**`/demo` collision resolved by renaming the website's route.** `pacs.dhsolutions.com.bd/demo` is already a live production demo gateway (OHIF + CloudFront, deploy/config/nginx/nginx.conf:158-161) — do not touch it. The website's own demo page is being renamed to `/product-demo` (user's task, in the `dh-pacs-website` repo) to avoid the clash.

**Bare `/` was safe to repurpose.** Traced the actual patient flow: `/open?token=...` redirects to `/viewer?StudyInstanceUIDs=...` (deploy/config/nginx/viewer.html:53) — patients never land on literal `/`. Today it only shows OHIF's confusing in-app "not found" (client-side, not a server error — confirmed by curling the raw HTML, no "404" string present server-side). An nginx `location = /` exact-match rule can claim it with zero risk to OHIF, `/viewer`, `/open`, `/admin/`, `/patient/`, `/doctor/`, or any existing route.

**Cloudflare hosting: Workers + Workers Builds, not classic Pages.** The site is Next.js 16.2.6 via the OpenNext Cloudflare adapter (`@opennextjs/cloudflare`), and Next 16 isn't supported on classic Pages — only the newer Workers + Workers Builds path. User considered downgrading to Next 15.5.2 to keep classic Pages; recommended against it and the user agreed. Reasoning: classic Pages is Cloudflare's legacy product being phased out in favor of unified Workers; downgrading is tech debt with no functional upside; Workers Builds gives free git-push CI/CD for the site itself (similar to Vercel's native Next.js integration). This means `wrangler.toml` needs reconfiguring away from `pages_build_output_dir` toward a `main` entry + `[assets]` binding shape — not yet done as of this memory.

**Runtime env vars confirmed required** (read live from the website repo): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (both can be plaintext), `SUPABASE_SERVICE_ROLE_KEY` (must be encrypted) — used by `src/lib/supabase-admin.ts` for the contact form's server action (`submitLead.ts`). Must be set in the Cloudflare project's environment variables before the contact form will work, separate from the local `.env.local` used for client-bundle inlining at build time.

## Status — DONE as of 2026-06-17

Site deployed to Cloudflare Workers + Workers Builds at `dh-pacs-website.directhospitalsolutionsltd.workers.dev` (Next.js 16.2.6 kept, no downgrade). `/demo` renamed to `/product-demo` in the website repo. nginx rules added to `deploy/config/nginx/nginx.conf` in `dh-pacs-central` (exact-match `/`, prefix `/_next/` and `/images/`, regex group for `favicon.ico|robots.txt|sitemap.xml|og-image.jpg`, regex group for `contact|case-study|privacy-policy|product-demo`) — all proxy to the Workers URL with a public resolver (`1.1.1.1`/`1.0.0.1`) + `proxy_ssl_server_name on` + `Host` header rewritten to the Workers hostname. Deployed to the VM, `nginx -t` validated, reloaded. Verified live: homepage + all proxied routes return 200 through `pacs.dhsolutions.com.bd`, full regression pass confirmed zero impact on `/demo`, `/open?token=`, `/admin/`, `/patient/`, `/doctor/`, `/api/health`.

## Pending test — NOT YET DONE

**Contact form / Supabase submission is unverified and will currently fail.** User confirmed Supabase has not been integrated/configured yet on the deployed Worker (the `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` env vars from the walkthrough were not actually set up). Submitting the contact form at `pacs.dhsolutions.com.bd` will not land a row anywhere until that's done.
**How to apply:** Don't treat the marketing site integration as fully done until this is retested. Next time this comes up, check whether Supabase env vars have been added to the Cloudflare Workers project, then retest the form end-to-end (submit → confirm row in Supabase `leads` table).

## Completed sequence (for reference)

1. ~~User reconfigures `wrangler.toml` for Workers + Workers Builds, deploys~~ DONE
2. ~~User renames `/demo` to `/product-demo`~~ DONE
3. ~~Write nginx rules in `dh-pacs-central`~~ DONE
4. ~~`nginx -t` validate, deploy to VM, reload~~ DONE
5. ~~Verify routes + regression pass~~ DONE (contact form submission specifically still pending, see above)
6. Next: build the actual `dh-pacs-central` CI/CD pipeline per ADR 0011 (self-hosted runner install, workflow YAMLs, rollback/health-check logic) — full multi-repo scope and routing map written up at `docs/CI_CD_Pipeline/00_SCOPE_AND_SYSTEM_CONTEXT.md` in the repo (2026-06-17)
7. Set up the second machine for `dh-pacs-central` itself (SSH key, GitHub auth, clone) — separate from whatever machine runs `dh-pacs-website`

**Why:** This sequencing matters — the marketing site routing change touches the same production nginx config that real patients depend on, so it's being done deliberately and verified before any pipeline automation goes in that could mask a mistake.

**How to apply:** Before touching `deploy/config/nginx/nginx.conf` or the VM again, re-check this memory for current state — don't restart the grilling process or re-derive decisions already settled here. See [[adr-0011]] (docs/adr/0011-self-hosted-runner-cicd-deploy.md in the repo) for the full pipeline design.
