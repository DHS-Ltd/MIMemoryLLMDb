---
name: dh-pacs-remote-connection-status
description: "DH Remote (Component C) build/verification status — self-hosted RustDesk relay for remote support, ADR-0018"
metadata: 
  node_type: memory
  type: project
  originSessionId: d3d44aa3-7822-4e39-82db-b9a9f4c5fdc3
  modified: 2026-09-09T17:50:40.812Z
---

DH Remote (Component C, `Remote_Connection_Server/`, ADR-0018) went from fully built-but-uncommitted
to checkpointed and partially re-verified on 2026-09-09, across two commits: `b433755` (the original
Phase 1-4 body of work — had been live in production for a week with zero git history) and `05f9936`
(closing out Phase 1-3 loose ends).

**Why the checkpoint was needed:** the entire `Remote_Connection_Server/` tree, plus ADR-0018 itself,
had never been committed despite Phases 1-3 being verified live in production (including a real ACL
narrowing on the live Tailscale network and a verified remote session against pilot site SITE03).
Always check `git status` for this directory before starting new DH Remote work — this project tends
to do real, production-verified work before committing it.

**Verified 2026-09-09** (from the Support PC, `WIN-2G5V0O0AEBU`, which doubles as the DHS build box):
Phase 1 restore-from-backup drill performed for the first time (decrypt real nightly backup → scratch
dir → diff keypair vs. production → isolated scratch `hbbs` container → matching key fingerprint →
teardown). 6 of Phase 2's 8 ACL acceptance tests confirmed (up from 1). `RUST_LOG=debug` was already
reverted on the Relay (found, not caused, by this session). Nightly off-host backups
(`github.com/DHS-Ltd/dh-remote-backup.git`, GPG-encrypted) and the 5-min healthcheck have been running
clean since 2026-09-02.

**Still open, none actionable by an agent alone:**
- SITE03's Bitwarden item was never created — no `bw` CLI or Bitwarden MCP tool available in this
  environment, and the password value itself was never captured outside a past conversation. Needs a
  human with Bitwarden access.
- Network-switch (CGNAT) resilience test — needs physical access at SITE03.
- 2 of 8 Phase 2 ACL tests (site-to-site denial, untagged-phone denial) — need a second provisioned
  Site and a physical phone signed into the Gmail tailnet account, neither available yet.

**Deferred, not started:** combined-installer fold (D7 — add DH Remote to
`installer/dh-pacs-workstation.iss` as v1.4.0, currently v1.3.0/A+B-only) and running the standalone
`dh-remote.iss` (v0.1.0) installer against a real second site. User chose to stop after closing the
Phase 1-3 loose ends on 2026-09-09 rather than start either. See
[[dh-pacs-program-status]] for the umbrella program status and
`Remote_Connection_Server/DH_REMOTE_BUILD_GUIDE.md` for the full phase-by-phase detail.
