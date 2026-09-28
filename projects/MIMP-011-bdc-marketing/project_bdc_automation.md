---
name: project-bdc-automation
description: "Technical automation systems for BDC marketing — GAS scripts, Gemini image pipeline, Facebook scraper"
metadata: 
  node_type: memory
  type: project
  originSessionId: 1c3fb66e-c751-491c-abc6-b53e4fdef548
---

## Three automation systems exist in E:\BDC_Marketing:

---

## System 1: BDCAutomation — Sheet-to-Doc Sync

**What:** Google Apps Script (clasp, container-bound) that syncs content plan rows from a Google Sheet into a structured Google Doc.

**Trigger:** Manual — operator uses "BDC Tools" menu in the Sheet (Sync Selected Row / Sync All Selected Rows).

**Flow:** Sheet "Content Making" tab row → DocWriter appends formatted block (Week heading, Date, Phase, ContentPillar, bdContentConcept, CaptionID) → bookmark inserted → URL written back to column H, ✅ written to column I.

**Resources:**
- Sheet: `https://docs.google.com/spreadsheets/d/1XQpFhARfVCQ2Ld31xQqU0oUOKIIZqU_3dsaMlBdj78g/edit`
- Doc: `https://docs.google.com/document/d/1McL_GC2pweBTT_yLrUqc79EWdmml8Ja1Wk41Wym78WU/edit`

**Files:** `src/Config.gs`, `Menu.gs`, `SheetReader.gs`, `DocWriter.gs`, `SyncEngine.gs`, `Utils.gs`

**Dev workflow:** `clasp push` to deploy, `clasp open` to open in browser.

---

## System 2: BDCImageGeneration — AI Image Pipeline

**What:** Fully automated image processing pipeline. Community photos → AI-branded 1080×1080 PNG + Bengali caption → Content Calendar.

**Trigger:** Hourly GAS time trigger (not yet activated — pending Test 4 and 5 passing).

**Flow:**
1. Community sends WhatsApp photos → Coordinator sorts into pillar Drive folder (5-second task)
2. `driveWatcher.gs` scans pillar folders hourly → queues new images in `ProcessingQueue` sheet
3. `geminiProcessor.gs` calls Gemini 2.5 Flash vision → JSON scene analysis → Bengali caption (80 words max, village name included, ends with 📞 01913-836244)
4. `brandingEngine.gs` copies pillar Slides template → inserts photo + caption → exports as PNG
5. `contentCalendar.gs` adds row to ContentCalendar sheet → emails coordinator

**Safety checks:**
- Skips images flagged `usable_for_marketing: false`
- Flags images with `has_identifiable_faces: true` for manual review (REVIEW_NEEDED status)

**Gemini model:** `gemini-2.5-flash` (updated from 2.0 which was deprecated)

**Config:** API key stored in Sheets Config tab (not in code). Read via `getConfig('GEMINI_API_KEY')`.

**Testing status:** Tests 1–3 passed, Tests 4–5 pending. Do not set hourly trigger until Test 4 passes.

**Key bugs already fixed in local .gs files:**
- Model name updated to gemini-2.5-flash
- maxOutputTokens raised to 1024 (was 500, caused JSON truncation)
- brandingEngine uses `getPageWidth()/getPageHeight()` not hardcoded pixel values
- testConfig() function added to main.gs

---

## System 3: BDCDataScrapper — Facebook Graph API Scraper

**What:** Python script that fetches BDC's Facebook page posts via Graph API and saves to CSV for analysis.

**Facebook page ID:** `415144131692412`

**Data fetched per post:** id, message, story, created_time, full_picture, permalink_url, likes count, comments count, shares count, reactions count

**Setup:** Requires `PAGE_ACCESS_TOKEN` in `.env` file. Uses `python-dotenv`, `requests`, `pandas`.

**Output:** `output/bdc_posts.csv`

**Usage:** This fed the 232-post audit in `BDCBrand/BDC_Marketing_Analysis_Report_23.05.26.md`.

**Why:** Facebook's native analytics don't export historical engagement in bulk. This scraper enables offline analysis of the full post history.

---

## Cross-system Integration

The three systems work together in the content pipeline:
1. **Strategy** (BDCStrategyDocs) → defines what to post
2. **BDCDataScrapper** → analyzes what was actually posted (audit input)
3. **BDCAutomation** → syncs the content plan from Sheet to Doc (caption writing workflow)
4. **BDCImageGeneration** → automates image creation from raw photos

**How to apply:** When helping with any of these systems, know which Google account/Drive to reference (directhospitalsolutionsltd@gmail.com), and that all patient-facing text must be Bengali.

[[project_bdc_directories]]
[[project_bdc_overview]]
