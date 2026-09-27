---
name: project-demo-rig-machines
description: "Where the Ibn Sina demo rig lives on each machine, and how to move portal files between them over the tailnet"
metadata: 
  node_type: memory
  type: project
  originSessionId: 0a9ce41b-7b28-4c30-85da-34a783108a20
  modified: 2026-09-16T08:58:12.414Z
---

The Ibn Sina demo rig (dcm4chee-arc + DVTk + demo portal) exists on **two machines, at different paths**. Recorded 2026-09-16, the night before the 16 Sep 17:00 demo.

- **Machine A — `maidul-desktop`** (tailnet `100.120.244.82`). Rig at **`E:\dcm4chee_Testing\`** — `portal/`, `compose/`, `_transfer/`. *Not* `E:\dcm4chee-lab\` (that path holds only `demo-images/` and `evidence_ibnsina.csv`) and *not* `D:\IBNSinaPacs` (never existed on this machine, despite the build spec naming it). Shares the host with Immich and n8n, which is why compose here carries no restart policy.
- **Demo laptop — `lenovo-l13-yoga-notebook`** (tailnet `100.108.227.107`). Rig at **`D:\dcm4chee-lab\`**. Carries `docker-compose.override.yml` adding `restart: unless-stopped`, deliberately, so the stack survives a lid close with no terminal.

**Moving files between them:** both are on the same tailnet and both are Maidul's. Sender serves the folder, receiver pulls:

```
# sender, in the folder holding index.html
python -m http.server 8765 --bind 100.120.244.82
# receiver
.\update-laptop.ps1 -Source http://100.120.244.82:8765/
```

`_transfer\update-laptop.ps1` does the copy, rebuild and verification. Taildrop was not used — the laptop is a *tagged* device, and Taildrop wants both ends signed into the same user account.

**Two things that bite:** the portal `Dockerfile` **COPY**s `index.html` and `serve.py` into the image, so editing a file changes nothing until `docker compose up -d --build portal` — and the browser also caches the page, so a hard refresh is part of the check. And `_transfer/` can go stale: its `serve.py` was two revisions behind the live one on 2026-09-16, which is why the script reports the difference and refuses to copy `serve.py` unless `-IncludeServe` is passed.

**The host bridge drifts on every reboot, and it is load-bearing.** The laptop's `compose\docker-compose.override.yml` pins `HOST_BRIDGE` to the WSL/Hyper-V bridge IP, because the code default `host.docker.internal` is *refused* on that laptop and the LAN IP is firewall-blocked from the Docker bridge. `serve.py` maps any loopback address a person types onto that pin, so a stale value makes every C-ECHO report "nothing is listening" about a healthy modality. Seen 2026-09-16: `172.28.112.1` -> `172.30.128.1` across one reboot. `preflight.ps1` catches it as check 1; the fix is repin, `docker compose up -d portal`, then prove it with a real Test in the portal — preflight only compares two strings.

## 2026-09-16 daytime — transfer via Downloads landing zone, and full dry run rehearsed clean

On demo day itself, the tailnet-serve handoff above was **not** used. Maidul copied the whole
`_transfer\` folder as a unit into `C:\Users\Maidul\Downloads\_transfer\` on the laptop by some
other means (not Taildrop, not SMB — those were already known-refused). Because
`update-laptop.ps1`'s `-Source` parameter only ever fetches over HTTP (confirmed from the doc's
own invocation pattern; there is no local-path mode), the fix was to serve the already-local folder
back to itself over **loopback**: `python -m http.server 8765 --bind 127.0.0.1` from inside
`Downloads\_transfer\`, then run `Downloads\_transfer\update-laptop.ps1 -Source
'http://127.0.0.1:8765/' -IncludeServe` directly (no need to `iwr` it into `$env:TEMP` first, since
it's already local — just `Unblock-File` it in case Windows flagged it from the copy method used).
This pattern generalizes: **whenever the transfer already lands on the target machine by some other
route, re-serve it to itself over `127.0.0.1` rather than trying to make the script accept a local
path** — it doesn't.

**`check_map.js` was never on the laptop, and that's not a bug.** It's simply absent from B7's
transfer file list (`procedure_catalogue.csv`, `test_feed.py`, `docker-compose.emulators.yml`,
`his_feed.csv` — never `check_map.js`), so `node check_map.js` fails with `MODULE_NOT_FOUND` on the
laptop every time. The substitute is the manual check `update-laptop.ps1` itself prints after a
rebuild: register multiple stations and eyeball that the stacked nodes don't collide with the map
legend.

**A rebuild without `down -v` carries forward stale volume state, including labels from before a
rename.** After the first `up -d --build portal` (no wipe), the laptop showed `Studies 1`,
`Pending 5`, and a station registered as AE `MODALITY` but labelled `CT 4th Floor` / type `CT` —
leftover from *before* the "DVTk is the MR" rename ([[project-dh-pacs-ibnsina-commercial-posture]]
context, but really from `DEMO_BUILD_FINAL.md`'s B2). Always do a full `down -v` → `up -d` before
trusting anything the UI shows as current-build behaviour, not just after a code change.

**The full dry run (beats 2b, 3, 4, 5) was rehearsed end-to-end on the laptop and matched the
AS-BUILT design exactly, with one correction.** SHAHANARA's two visits merged correctly (age 63 vs
expected 62.5, name similarity 1.00); `SVC-PATH-CBC` skipped with no worklist row; SHARMIN split
correctly (age 24 vs expected 62.5 REJECT) — **but the live name-similarity score is `0.69`, not the
`0.71` written into `DEMO_RUN_OF_SHOW.md`'s script.** Say 0.69. RUBEL routed cleanly cross-centre to
`PETCT01`. The seed-broken/fix-it failure-reproduction beat also worked exactly as documented:
"Seed broken entry" stamps a new row with station `SCHEDULESTATION` (invisible to a `GEHC`-filtered
DVTk query, no error shown), and "Fix it" corrects it to `GEHC`, after which it appears — same
study, same data, one field changed, nothing else touched.

Also found, unrelated to the rig itself: **a printed patient card
(`IBN_Sina_Cancer_dh-pacs-DHP-26062902.pdf`) containing the real linked patient's name, mobile
number, and a bearer-credential QR was sitting inside `E:\DHS-PACS\docs\IbnSinaCancerPacs\`** — see
[[pending-cleanup-ibnsina-patient-card-pdf]] for the standing cleanup item this opened.

Related: [[project-dh-pacs-ibnsina-commercial-posture]], [[project-dh-pacs-tech-deck]],
[[pending-cleanup-ibnsina-patient-card-pdf]]
