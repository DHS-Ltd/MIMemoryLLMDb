---
name: feedback-vm-file-transfer
description: SSH key auth fails from Git Bash in some sessions — use password-auth scp from Git Bash or edit files directly on VM with Python/heredoc
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 0d830bd0-02d2-424f-b27f-c10dc899e13e
---

SSH public key auth (`pacsvm_ed25519`) is rejected from the Git Bash / Bash tool environment in some Claude Code sessions, even though the key is in the VM's authorized_keys. The exact cause is unclear (possibly Windows OpenSSH version or key file permissions changing between sessions).

**Why:** Multiple sessions in 2026-05-25 could not SSH from Bash with key auth. Key offered, server rejected it.
**How to apply:**
1. First try: `ssh -i ~/.ssh/pacsvm_ed25519 maidul@192.168.1.10 "echo ok"` from Git Bash on Windows
2. If rejected, Git Bash scp with **password auth** still works (prompts for password interactively)
3. For in-place edits on the VM: use `python3 -c "..."` or `sed -i` directly on the VM — no scp needed
4. Never use PowerShell scp with `/d/path` format — use Windows paths `D:\...` or run from Git Bash instead

---

`.env` file on the VM has a UTF-8 BOM on line 1 (`﻿POSTGRES_USER=pacs`). The `tac | awk | tac` deduplication command can accidentally pull in npm install stdout if it was ever redirected into the file. Always `cat -n /srv/pacs/compose/.env` to inspect before and after bulk edits.

**Why:** npm install output ("added 1 package in 1s" and a hash) got appended to .env during an earlier failed hash-generation attempt, causing `docker compose` to fail with "key cannot contain a space".
**How to apply:** After any .env manipulation, always verify with `cat -n /srv/pacs/compose/.env` before running `docker compose build`.
