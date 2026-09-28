---
name: feedback-calendar-sync-bot-troubleshooting
description: "Always consult the Calendar Sync Bot's documented troubleshooting playbook before diagnosing a reported issue from scratch"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 910bae43-1bec-4c4c-a2fc-954d4d51b0f0
  modified: 2026-08-26T09:16:37.416Z
---

When the user reports the LinkedIn Calendar Sync Bot (Telegram bot syncing `LinkedIn_Content_Calendar_2026.md` ↔ Google Calendar ↔ Telegram) is broken, read [[project-calendar-sync-bot-docs]]'s playbook (`Calendar_Sync_Bot\docs\TROUBLESHOOTING.md`) first, rather than re-deriving the diagnostic approach from zero.

**Why:** In one session (2026-08-26) four distinct incidents were diagnosed on this bot, all sharing one root complication — it runs under `pythonw`, so `sys.stderr` is unusable and Python's `logging` module silently no-ops on every call. A process can be fully dead, hung, or throwing exceptions on every message while Task Manager shows it as healthy. Diagnosing each incident required stopping the background instance and running `python.exe bot.py` in the foreground to see real output — there is no shortcut around this, and doing it blind (without knowing this quirk) wastes significant time rediscovering it.

**How to apply:**
- Before touching anything, read the playbook's "Standard diagnostic procedure" section — it has copy-pasteable PowerShell/curl commands for process identification and Telegram health probes.
- Check the playbook's incident log first — the reported symptom may already match a documented root cause (duplicate-instance conflict, expired token, stale-sequence Calendar API error, malformed post ID crashing the URL picker) with a known fix, avoiding a full re-diagnosis.
- Critical safety note from the playbook: never start a second `bot.py` process (foreground or background) while one may already be polling — Telegram allows only one long-poll consumer, and `python-telegram-bot` does not retry on the resulting `409 Conflict`, so a careless diagnostic probe can itself kill an otherwise-healthy instance.
- If a new failure class is found that isn't in the incident log, add it to the playbook after fixing it, so this memory stays useful going forward.
- The bot still has no file-based logging (a fix for the root "silent failure" problem was proposed to the user but not yet implemented) — if asked to improve the bot's diagnosability, or if a 5th silent incident occurs, that's the highest-leverage fix.
