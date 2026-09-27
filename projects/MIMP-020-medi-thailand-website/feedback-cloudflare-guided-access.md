---
name: feedback-cloudflare-guided-access
description: "Cloudflare work for this project must be guided manual steps, not direct API/MCP automation"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: f48f69dd-90d7-42cd-9385-5030ba8fbaf6
  modified: 2026-07-19T12:02:30.438Z
---

For medi-thailand.com, do Cloudflare setup (Pages project, DNS zone/records) via **guided
manual steps that the owner executes themselves in the dashboard** — do not automate it via
the Cloudflare API/MCP connector, even once it's authorized.

**Why:** the owner's Cloudflare account also runs the unrelated PACS project on a different
domain (see [[project-medi-website-rebuild]] for repo context). The owner explicitly chose
"guided manual steps" over "authorize direct API access" (2026-07-19) specifically to keep
zero risk of an automated action touching the PACS project/domain. This was a deliberate
choice between two offered options, not a default — don't silently switch to direct API
control later just because a Cloudflare MCP connector becomes authorized for some other reason.

**How to apply:** when Cloudflare work comes up (Pages project creation, DNS record changes,
zone setup), write exact click-by-click dashboard instructions for the owner to run, rather
than calling Cloudflare tools directly. One-time exception already planned: once the Pages
project is connected to the GitHub repo via the dashboard, future deploys are automatic on
git push and need no Cloudflare access from Claude at all.
