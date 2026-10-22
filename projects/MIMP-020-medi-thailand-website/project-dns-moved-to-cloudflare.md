---
name: project-dns-moved-to-cloudflare
description: medi-thailand.com DNS moved to Cloudflare on 2026-10-22; web origin still old host; email verified; zone/owner facts
metadata:
  node_type: memory
  type: project
  originSessionId: 8a901b87-3891-48dc-b382-02068919b884
  modified: 2026-10-22T12:16:38.901Z
---

On 2026-10-22 nameservers at hosting.com (registrar) were switched to Cloudflare (`grace`/`major.ns.cloudflare.com`), zone in the **DH Solutions Limited** Cloudflare account (shared with PACS; owner chose to keep it there, may move later). Previous NS were `dns8/dns9.mybdhost.com` (rollback). Pages project exists at `med-i-thailand-website.pages.dev` but the domain is NOT attached yet. Old WordPress host still serves the apex/`www` (DNS-only grey cloud). Email passes SPF/DKIM/DMARC; DMARC is `p=none` reporting to `admin.support@medi-thailand.com`.

Zoho aliases on the single `admin.support@` mailbox (2026-10-22): existing `dh@`, `info@`, `technical.support@`; added `sales@` (product enquiries), `leads@` (internal form notifications), `noreply@` (automatic-email sender). `bangladesh@` deliberately NOT created yet.

Lead form live on the pages.dev preview since 2026-10-22 (commit 7c0e4e9): Pages Function `/api/contact` → Turnstile → Brevo (domain authenticated, DKIM `brevo1/2._domainkey`) → `leads@`. Secrets `TURNSTILE_SECRET` and `BREVO_API_KEY` are set in the Pages Production env. Brevo API key expires 2027-10-22 or after 90 idle days; renew ~Sept 2027. Details: docs/lead-form-setup.md.

**Why:** supersedes the "defer DNS move" amendment in [[project-transfer-dns-facts]]. The earlier note that DKIM was only at `default` was right about public DNS: `zmail._domainkey` was never published until we added it.

**How to apply:** do not re-propose the nameserver move. Remaining: Search Console Domain verification (TXT in Cloudflare), tighten DMARC after 3-4 weeks, Zoho aliases (info@, sales@, support@, bangladesh@) for the form/marketing, then web cutover by pointing apex/`www` to Pages.
