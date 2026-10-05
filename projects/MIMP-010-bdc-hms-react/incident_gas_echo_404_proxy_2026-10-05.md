---
name: incident-gas-echo-404-proxy
description: "2026-10-05 RESOLVED, user-confirmed: reception saves showed \"Server returned HTTP 404\" though rows were written; bad Google edge on clinic ISP; fixed by /api Cloudflare Pages Function proxy (251372d), ADR 0007"
metadata:
  node_type: memory
  type: project
  originSessionId: a655e6cc-2290-4a3a-ace4-b1dfa2c287ed
  modified: 2026-10-05T11:25:33.300Z
---

**Status:** RESOLVED 2026-10-05, confirmed by user from reception after Ctrl+F5. Proxy went live ~30s after push. Decision in `docs/adr/0007-api-calls-proxied-through-cloudflare.md`; runbook + health-check curl in `E:\BDCHMSV2\docs\Cloudflare\DEPLOYMENT.md` ("API Proxy" section + the 404 troubleshooting entry).

**Symptom:** from 2026-10-05 morning every save at reception (register patient, invoice, due…) showed "Server returned HTTP 404", but GAS executions all Completed and rows WERE written. Staff retried → duplicate patients (P2610051/P2610052 MD ADIL AHOMED; P2610052 still to clean up — I stamped UpdatedBy on it during testing).

**Root cause:** GAS replies to every POST with a 302 to `script.googleusercontent.com/macros/echo?user_content_key=…`. Clinic ISP (Discovery Internet, Narsingdi, IP 103.175.243.52) is geo-routed to Google edge `192.178.177.132`, which returned 404/bogus 302 for ~4/5 echo fetches. Same echo via 142.251.221.193 or 142.250.182.46 → 200. Not DNS hijack, proxy, antivirus MITM (TLS issuer = Google Trust Services), clock, or CGNAT rotation (IP stable). Reads looked fine at reception only because `useCachedApi` served cache.

**Fix:** `functions/api.js` (Cloudflare Pages Function) proxies POST /api → `env.VITE_GAS_URL` (existing dashboard var, readable by Functions) and follows the redirect on Cloudflare. `gasClient.js` uses `/api` in prod, VITE_GAS_URL directly in dev (keeps mock-GAS harness working).

**Temp workaround on reception PC:** hosts line `142.251.221.193 script.googleusercontent.com  # BDC temp fix 2026-10-05` was added; removal command was given to user after the fix was confirmed, but removal itself was NOT confirmed — ask before assuming it's gone. Harmless while the proxy is in use (browser no longer contacts that host).

**How to apply:** a "HTTP 404" with rows still written = lost echo reply, not a failed save. Diagnose with the two-step curl (POST without -L, then GET Location) from the affected network, pinning `--resolve script.googleusercontent.com:443:<ip>` to compare edges.

Open follow-ups the user hasn't decided yet: retry-safe (idempotent) saves; duplicate P2610052 cleanup; 5 of 9 patients on 2026-10-05 used receptionist's own phone 01731588939; `registrationDate` parses today as "2005-10-26". Related: [[cloudflare-deployment]], [[reference-gas-backend]].
