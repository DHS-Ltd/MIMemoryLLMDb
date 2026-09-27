---
name: project-site-snapshot-findings
description: "Results of the 2026-07-18 live-site snapshot — exact spam scope, legit content inventory, and where the archive lives"
metadata: 
  node_type: memory
  type: project
  originSessionId: e7c54296-92ea-4acd-86ec-5d1ab9750f72
  modified: 2026-07-18T13:24:21.166Z
---

Full snapshot of medi-thailand.com captured 2026-07-18 via its own `wp-json` REST API (site
allows crawling, robots.txt has no disallow) into `docs/site-snapshot/` (~387MB, gitignored-
candidate — not yet a git repo). Contents: `wp-json/pages` (16), `wp-json/posts` (70),
`wp-json/media` (370 files + metadata), Yoast `sitemaps/`, and a generated `url-inventory.md`
reconciling API vs sitemap.

**Quantified the compromise** (CLAUDE.md already flagged "injected casino-spam" — this is the
exact scope): of 70 published posts, **24 are spam** — casino/betting/gambling content in
Azerbaijani, German, Russian, Finnish, French, Spanish, Croatian, plus one "kmspico microsoft
office" piracy-crack post (a common malware/SEO-poisoning content type). All are live, published,
and in the Yoast sitemap — actively indexed by Google right now. The 3 sitemap category-archive
URLs (`/category/blog/`, `/category/events/`, `/category/post/`) aren't real content, ignore.

**Legit content confirmed:** 16 real pages, ~33 legitimate blog articles (matches the ~17-20
estimate from historic notes plus a few not in Maidul's list), 4 event posts.

**Resolved:** `/home-ไทย/` ("Home – Thailand") is also junk, not a real i18n attempt — 0 bytes of
content, no excerpt, no custom fields, created 2025-05-13, never linked from anywhere including
itself's own menu. A one-off stub, likely someone testing WP's language/menu setup. Astro i18n
for Thai starts from zero per CLAUDE.md, nothing to inherit here. → 410 on migration, same as the
other three orphaned pages.

**Resolved:** `/services/`, `/about-us-2/`, `/site-under-construction/` reviewed and are all
junk — `/services/` is uncustomized 2022 GeneratePress demo content (fake "Blood test/Surgery"
services, Latin filler, literal unfinished builder notes), `/about-us-2/` is a 0-byte empty
stub, `/site-under-construction/` is a stale maintenance placeholder from 2024-02-29. None are
linked from any live page/post/nav — orphaned-but-`status:publish`, so still in the Yoast
sitemap and Google-indexable despite being invisible to visitors. Same failure mode as the spam
posts, quieter. All three → 410 on migration, per `docs/content-systems-plan.md` §5.

**Why this matters going forward:** the spam scope (24/70 posts, one-third of "content") means
the crawl/inventory step (CLAUDE.md Phase 0) is done and confirms v1 should treat roughly a third
of live posts as delete-on-migrate (410, not 301 — see [[project-medi-website-rebuild]] ADR 0004).
The `/home-ไทย/` page is worth a look before assuming Thai i18n starts from zero.

See [[project-transfer-dns-facts]] for the DNS/hosting side of the same wasting-asset urgency.
