---
name: project-transfer-dns-facts
description: "Live DNS/hosting facts for the medi-thailand.com cutover — email on Zoho, DNS trapped on an uncontrolled host"
metadata: 
  node_type: memory
  type: project
  originSessionId: e7c54296-92ea-4acd-86ec-5d1ab9750f72
  modified: 2026-07-19T12:02:20.022Z
---

Transfer-critical facts about the live medi-thailand.com WordPress site (discovered 2026-07-18 via DNS probing; owner has registrar/domain creds but NOT hosting creds):

- **Nameservers:** `ns1/ns2.136-243-104-109.cprapid.com` — DNS is managed INSIDE the cPanel hosting account the owner is locked out of. Moving DNS = change nameserver delegation at the **registrar** (owner controls this) to Cloudflare.
- **Web host:** `136.243.104.109` (Hetzner, Germany). Apex + `www` both point here. This is also the rollback IP if the account stays alive.
- **Email:** Zoho paid mail — `mx.zoho.com`/`mx2`/`mx3` (priority 10/20/50), SPF
  `v=spf1 +a +mx +ip4:136.243.104.109 include:zohomail.com ~all`, DKIM at **`zmail._domainkey`**
  (confirmed 2026-07-19 from the owner's live Zoho admin screenshot — corrected from an earlier
  `default._domainkey` guess that was WRONG; using `default` would have silently broken DKIM).
  Email is EXTERNAL and must be preserved across the move. No DMARC yet — add one.
- **Host is UNCONTROLLED/could-vanish** (owner's assessment; cPanel admin = `shakib.mir@gmail.com`). Therefore: (1) "keep WP live as rollback" is NOT reliable — real rollback = a static snapshot we capture ourselves; (2) capture the full live site NOW (media + HTML + URL map) before it disappears; (3) moving DNS to Cloudflare early also PROTECTS EMAIL, since if the host vanishes its nameservers stop answering and Zoho MX resolution would break too.
- **Registrar:** hosting.com (domain expiry 2026-10-30, transfer-locked). **Registrant on record:**
  "Medinvest bd" / Anwarul Alam Akhand — confirmed 2026-07-19 this is just the domain
  registrant-of-record (agency/freelancer), NOT an operating entity — has no bearing on the site's
  legal footer, which stays **MED I (Thailand) Co. Ltd only**. Do not confuse with "Direct
  Hospital Solutions Ltd" (owner's email domain, also not an operating entity on the site).
  Registrar login itself not yet shared — not needed until the actual nameserver switch.

See [[project-medi-website-rebuild]]. Cutover approach captured in docs/adr/0003.
