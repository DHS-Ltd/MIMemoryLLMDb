---
name: headless-browser-verification
description: Playwright MCP bridge is unavailable in this project; use the locally installed Chrome/Edge headless directly to verify print layout and measure rendered DOM
metadata:
  node_type: memory
  type: reference
  originSessionId: dc13f953-be5c-4271-8e0c-3ccba11bbf9d
  modified: 2026-09-25T16:43:28.675Z
---

The `plugin:ecc:playwright` MCP server connects but its tools fail with "Extension connection timeout — make sure the Playwright MCP Bridge extension is installed". Two sessions have now been blocked by this (2026-08-30 lab queue, 2026-09-17 print sheet). Do not burn calls retrying it.

Chrome and Edge are both installed and drive headless fine from Bash:
- `/c/Program Files/Google/Chrome/Application/chrome.exe`
- `/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`

**Count print pages** (the only trustworthy check for anything using `@page` / page breaks):
```
chrome --headless --disable-gpu --no-sandbox --no-pdf-header-footer \
  --print-to-pdf=out.pdf "file:///<abs path>.html"
grep -a -o "/Count [0-9]*" out.pdf | head -1
```

**Measure rendered geometry** — `--dump-dom` runs page scripts first, so have a script write the number into an attribute and grep it out of the dump:
```
<script>window.addEventListener('load',function(){
  var el=document.createElement('x-m');
  el.setAttribute('data-mm',(document.querySelector('.inv').getBoundingClientRect().height/96*25.4).toFixed(1));
  document.body.appendChild(el);});</script>
```
then `chrome --headless --virtual-time-budget=2000 --dump-dom file:///... | grep -o 'data-mm="[^"]*"'`.

**Screenshot** for a visual sanity pass: `--screenshot=out.png --window-size=794,1123` (A4 at 96dpi).

To exercise a frontend module directly in Node, import it by `file:///E:/...` URL — a bare `E:/...` path throws `ERR_UNSUPPORTED_ESM_URL_SCHEME`, and copying the file elsewhere breaks its relative imports.

Used this way to prove the invoice print layout in [[feature-print-sheet-3-copies]].

**Note (2026-09-25 doctor-payment session):** without login credentials on hand, only did a shallow smoke test (`--dump-dom` on `/login`, checking the bundle boots with no console errors) instead of using the mock-GAS + CDP past-login recipe below, which was already documented here and would have let me verify the actual Add/Edit Expense modals myself. Default to the recipe below next time real functional verification is needed and credentials aren't available — it's already proven to work.

**Driving the real app past login (2026-09-25):** start Chrome with `--headless=new --remote-debugging-port=9333 --user-data-dir=<tmp>`, read `http://127.0.0.1:9333/json/list`, and talk CDP over Node 24's global `WebSocket` (no puppeteer needed). Navigate to `/login`, `Runtime.evaluate` to set `localStorage.bdc_token` + `bdc_user` (`{name, role, phone}`), then navigate anywhere. Point the app at a tiny Node mock GAS server by launching Vite with `VITE_GAS_URL=http://localhost:8787` in the env (process env beats `.env`). `Page.printToPDF({preferCSSPageSize:true})` gives the real print layout, and the Read tool renders the PDF pages. Gotcha: `innerText` applies CSS `uppercase`, so lowercase both sides of text assertions. Used for [[feature-daily-closing]].
