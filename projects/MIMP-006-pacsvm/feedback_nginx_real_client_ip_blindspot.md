---
name: feedback-nginx-real-client-ip-blindspot
description: "nginx access.log $remote_addr is always the Docker bridge gateway behind Cloudflare Tunnel — every request looks locally-sourced, so historical caller/exposure analysis from these logs is unreliable"
metadata:
  node_type: memory
  type: feedback
  originSessionId: d06b5724-4ad2-45a7-84b0-94cfc0a2baf2
  modified: 2026-09-27T18:54:01.848Z
---

nginx's `log_format main` on this VM never captures the real client IP — `$remote_addr` is always `172.18.0.1` (the Docker bridge gateway), for every request, whether it's a real visitor arriving through the Cloudflare Tunnel or a manual `curl` run locally on the VM. Confirmed 2026-09-28 by sending a probe from an external machine over HTTPS/Cloudflare and finding it logged identically to five months of local dev `curl` traffic.

**Why:** this was discovered while trying to answer "did anyone actually exploit the unauthenticated routes found in `docs/Security/API_Exposed_Fixation.md`?" — the log data *looked* like it could answer that (grouping by IP, per the doc's own Phase 0.2 plan), but every request being indistinguishable from local traffic means "no suspicious IPs in the log" is not evidence of anything. It's the same root cause as S6 in that doc (rate limiters keyed on a shared IP), but it also blinds incident investigation, not just rate limiting.

**How to apply:** don't treat an absence of odd `$remote_addr` values in these logs as reassurance about exposure — check user-agent and request shape instead (as was done: curl/Python-urllib UAs read as dev/ops testing, not a smoking gun either way). The actual fix is adding `CF-Connecting-IP` (or `X-Forwarded-For`) to `log_format`, which is on the Phase 4 list in [[project_security_api_exposure_remediation]] alongside S6, but hasn't been done yet as of 2026-09-28. If a "was there a real breach" question comes up again before that's fixed, the better data source is Cloudflare's own dashboard/Logpush, not this VM's nginx log.
