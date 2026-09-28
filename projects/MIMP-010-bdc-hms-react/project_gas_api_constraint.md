---
name: project-gas-api-constraint
description: BDC HMS must use Content-Type text/plain for all API calls — never application/json — or GAS rejects with CORS preflight error
metadata: 
  node_type: memory
  type: project
  originSessionId: 1665653c-9128-4a63-8fe8-4383e507c9c1
---

BDC HMS calls a Google Apps Script JSON API via `callApi()` in `src/api/gasClient.js`. All fetch calls MUST use `Content-Type: text/plain` — never `application/json`. Using `application/json` triggers a CORS preflight which GAS rejects. The GAS URL lives in the `VITE_GAS_URL` env variable.

**Why:** Google Apps Script does not handle CORS preflight requests, so any non-simple request (triggered by `application/json` Content-Type) will be blocked by the browser.

**How to apply:** When writing or reviewing any API call, data fetching, or HTTP utility code in this project, always verify `Content-Type: text/plain` is used (or that `callApi()` handles it). Never bypass `callApi()` with a direct `fetch()` call using `application/json`.
