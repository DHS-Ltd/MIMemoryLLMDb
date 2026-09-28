---
name: cloudflare-deployment
description: "Cloudflare Pages deployment setup — live URL, GitHub repo, build config, and env vars"
metadata: 
  node_type: memory
  type: project
  originSessionId: 2649aff0-dafb-465a-b08f-375c1de5acc9
---

Live on Cloudflare Pages as of 2026-05-20.

**Live URL:** https://bdc-hms-react.pages.dev/
**GitHub Repo:** https://github.com/DHS-Ltd/bdc-hms-react (private, org: DHS-Ltd)
**Auto-deploy:** Every `git push` to `main` triggers a Cloudflare build (~1-2 min)

**Build config:**
- Build command: `npm run build`
- Output directory: `dist`
- Node: 22.x (auto-detected)

**Environment variables set in Cloudflare dashboard (not in repo):**
- `VITE_GAS_URL` — GAS deployment URL
- `VITE_APP_NAME` — BDC HMS
- `VITE_CENTER_NAME_BN` — Bengali centre name

**Why:** `.env` is gitignored; env vars must be set manually in Cloudflare Settings → Environment variables after any GAS redeployment.

**How to apply:** When the user asks to deploy or update the live site, remind them to `git push` to main. If `VITE_GAS_URL` changes, they must update it in Cloudflare dashboard AND trigger a new deploy.

**Docs:** `E:\BDCHMSV2\docs\Cloudflare\DEPLOYMENT.md` — full manual and troubleshooting guide.

**Known issue fixed:** `_redirects` file may be needed in `public/` if direct URL navigation returns 404 (React Router client-side routing).
