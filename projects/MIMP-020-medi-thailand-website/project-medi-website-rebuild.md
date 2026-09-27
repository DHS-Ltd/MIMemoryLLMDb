---
name: project-medi-website-rebuild
description: The medi-thailand.com rebuild project — status and where the authoritative plan lives
metadata: 
  node_type: memory
  type: project
  originSessionId: a3f89dd9-9727-4af7-a79d-8e84e00ec108
  modified: 2026-08-23T18:04:30.533Z
---

Rebuilding **medi-thailand.com** off a compromised WordPress site onto **Astro + Cloudflare
Pages + GitHub + Sveltia CMS**. One domain, two sections (B2B now, consumer shop later); the
new business angle is a **B2B Bangladesh expansion** as a `/bangladesh` section.

**The authoritative plan lives in the repo — read it at session start, don't re-derive:**
- `d:\Med_I_Thailand_Website\CLAUDE.md` — working brief + build phases
- `d:\Med_I_Thailand_Website\CONTEXT.md` — glossary + all locked decisions
- `d:\Med_I_Thailand_Website\docs\adr\` — ADR 0001 (stack), 0002 (architecture + BD), 0003
  (cutover/DNS), 0003-bold-biotech (visual direction), 0004 (content collections/routing)
- `d:\Med_I_Thailand_Website\docs\content-systems-plan.md` — concrete build plan
- `d:\Med_I_Thailand_Website\docs\design\visual-design-system.md` — full design spec
- Historic source material: `d:\Med_I_Thailand_Website\docs\Med_I_Historic_data\`

**Code target:** GitHub repo `DHS-Ltd/med_i_thailand_website` (private, was empty as of
2026-07-19). `gh` CLI in this environment is already authenticated as `DHS-Ltd` with `repo`
scope — no separate credential setup needed to push.

**Status (as of 2026-07-19):** Phase 1 (Astro foundation) built and pushed to `main` — content
collections (solutions/products/team/events/blog/bangladesh) with a legacy-URL dispatcher
(ADR 0004), Sveltia CMS config, design tokens from the visual-design-system spec, i18n
scaffold, Cloudflare Pages `_redirects` with 410s for the confirmed-dead orphan pages. One
placeholder entry per collection only — real content migration is Phase 2, not done yet.
`npm run build` and `astro check` both pass clean. Note: `docs/Med_I_Historic_data`,
`docs/site-snapshot`, `docs/Cyclotron_Isotope_Research` are gitignored (1GB+ local reference
corpora, not website source — includes a file over GitHub's 100MB limit) — don't try to `git
add` them.

**Cloudflare Pages is live** (2026-07-19, guided dashboard steps): project `med-i-thailand-website`
connected to `DHS-Ltd/med_i_thailand_website` main branch, Astro preset, `NODE_VERSION=22` env
var (package.json requires Node >=22.12.0), auto-deploys on push. Preview URL:
https://med-i-thailand-website.pages.dev — verified live and rendering correctly.

**Sveltia CMS login is live** (2026-07-19, guided steps): GitHub OAuth App "MED I Thailand CMS"
(owned by DHS-Ltd) + a self-hosted `sveltia-cms-auth` Cloudflare Worker
(`DHS-Ltd/sveltia-cms-auth` repo, deployed via the project's one-click-deploy button, URL
`https://sveltia-cms-auth.directhospitalsolutionsltd.workers.dev`) with `GITHUB_CLIENT_ID`/
`GITHUB_CLIENT_SECRET` set under the Worker's **Runtime** variables (not Build — those are two
different sections on the same settings page, easy to confuse). `public/admin/config.yml`
`backend.base_url` points at that Worker. Verified: owner logged into
https://med-i-thailand-website.pages.dev/admin/ via GitHub and sees all 6 collections with
correct entry counts.

**Status update 2026-08-13 (later):** Phase 4 design pass shipped (`c6af33a`) — component
system, site chrome (the site had NO nav/footer before), redesigned home, `/events/` index,
a rewritten `/privacy-policy/`, self-hosted fonts, horizontal logo lockup, 50 vetted+re-encoded
images. **Palette was relocked** after owner review: red is scientific notation only (logo mark
+ hot isotope node), blue carries the whole interface (ADR 0005, amends 0003). Awaiting owner's
live review of the home page before rolling the system across the remaining templates
(solution/product/article/event detail pages still render through the plain dispatcher).
Bangladesh internals deferred to their own session by owner choice.

**Earlier 2026-08-13:** Phase 2 IS done (commit `cb9cbae`) — 8 solutions, 13 products,
8 team bios, 4 events, 27 Academy articles, BD landing + brief, 30 legacy URLs 410'd. The
2026-07-19 handoff doc predates this and is stale; ignore its "Phase 2 not started" claim.
Content is real; **presentation is still a bare scaffold** — no header/nav/footer, no
components dir, everything inline-styled, `/privacy-policy/` missing entirely (it's live today
and in the sitemap → will 404 at cutover), and every content entry points at
`/images/placeholder/…` (48+ dead paths). Phase 4 design session is the agreed next work.

**Not yet done:** the DNS protective-move guide (deferred per owner's explicit
choice, still open since 2026-07-19). Owner has requested one-step-at-a-time guided pacing
for hands-on work: give one step, wait for owner to complete it, solve any blockers before
advancing — don't batch multiple dashboard actions into one turn (see
[[feedback-guided-stepwise-pacing]]). See [[project-transfer-dns-facts]] and
[[feedback-cloudflare-guided-access]].

**Status update 2026-08-24:** The "detail pages still render through the plain dispatcher" gap
noted above is now fixed. `src/pages/[...slug].astro` renders real per-collection markup for
Solutions (§7.3 of the design spec — header/intro/benefits/related-products-queried-from-
catalog/video/CTA, deliberately no header image per the spec's explicit note that `tileImage`
crops don't survive being shown large), Events (§7.6 — cover/write-up/photo gallery/video/
related solutions; also removed a stale "gallery pending" sentence left in all 4 event `.md`
files from before their galleries were actually populated), and Blog (§7.5 — hero when present/
author+date/prose/related links/CTA). `src/pages/products/[slug].astro` now renders the
`images[]` field (was schema-only, unrendered) and `src/pages/products/index.astro` (previously
also a bare scaffold, not grouped) now groups by Solution using the real `ProductCard`
component. All still read correctly with zero images per ADR 0006 — that decision is unchanged,
only the previously-missing rendering path was added. Owner had not yet reviewed the Phase 4
home page live when this session started, but flagged Solutions/Products/Events pages directly
as "not fully filled" — the real cause was this dispatcher gap, not missing content data.

**Next session starts here: Phase 3 (forms, newsletter, GA4, Search Console, PDPA).** Owner
confirmed 2026-08-24 this is the next work after the detail-page fix above. This is the last
fully-unbuilt phase — contact form, per-product/solution "request info" CTA, newsletter signup,
and the Bangladesh lead gate are all still dead placeholders (`src/pages/contacts.astro`,
`src/components/Footer.astro`). The spec for all four forms already exists in
`docs/content-systems-plan.md` §4: Cloudflare Pages Functions → Cloudflare Turnstile → Brevo
(marketing lists + transactional email), owner notified by email on every submit, PDPA consent
checkboxes never pre-ticked. Brevo account is already created
(`medi.thailand.global@gmail.com`, per `docs/owner-requirements.md`) but not yet configured —
API key/list IDs still need to be set up with the owner. The Bangladesh feasibility brief PDF
that the lead gate delivers already exists at
`docs/Cyclotron_Isotope_Research/4_copy_Theranostics_Bangladesh_Feasibility_Brief.pdf`. Also
needed in this phase: GA4 property + consent mode, Search Console verification, and the PDPA
consent notice on `/privacy-policy/` (currently a stub pending this exact phase).
