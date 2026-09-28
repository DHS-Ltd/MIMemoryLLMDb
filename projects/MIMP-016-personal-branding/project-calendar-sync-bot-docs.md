---
name: project-calendar-sync-bot-docs
description: "Location of the Calendar Sync Bot's troubleshooting playbook and incident log"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 910bae43-1bec-4c4c-a2fc-954d4d51b0f0
  modified: 2026-08-26T09:16:25.204Z
---

Full troubleshooting playbook for the LinkedIn Content Calendar ↔ Google Calendar ↔ Telegram sync bot lives at `E:\Self_project\Personal_Branding\LinkedIn_Marketing\Calendar_Sync_Bot\docs\TROUBLESHOOTING.md`, linked from the bot's `README.md`.

It covers: why the bot fails silently by default (runs under `pythonw`, which discards all `logging` output), the standard diagnostic procedure (process identification, Telegram health probes, safe foreground reproduction), and a dated incident log with root cause + fix for every failure diagnosed so far — currently: duplicate-instance Telegram `409 Conflict` silently killing the polling loop, expired Google OAuth token (`invalid_grant`), stale-`sequence` Google Calendar API errors on event updates, and a malformed-post-ID bug that crashed the URL-picker with `Button_data_invalid`.

See [[feedback-calendar-sync-bot-troubleshooting]] for the process rule this reference supports.
