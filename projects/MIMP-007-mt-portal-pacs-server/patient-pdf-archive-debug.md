---
name: patient-pdf-archive-debug
description: Stale patient_pdfs archives mask pdfGenerator.js changes — always check/clear archives when debugging PDF layout
metadata: 
  node_type: memory
  type: feedback
  originSessionId: eeb34906-4bee-4e90-ada6-ab915aaafef0
---

When debugging PDF layout issues, ALWAYS check `app.patient_pdfs` first. The ADR-0003 archive is write-once (`ON CONFLICT (study_id) DO NOTHING`), so a broken PDF baked into the archive will be returned by every reprint regardless of changes to `pdfGenerator.js`.

**Why:** In 2026-06-13 session: three pdfGenerator fixes were deployed but the PDF looked identical each time. The real cause was an 8629-byte archived PDF for study 33 (DHP-26060703) written on 2026-06-12 19:42 with the first broken redesign. The `/api/mt/studies/:uid/pdf` route returns `archived_pdf` if present — `generatePatientPdf()` is never called.

**How to apply:** Before deploying a pdfGenerator fix, run:
```sql
SELECT pp.study_id, pp.byte_size, pp.issued_at, p.dh_patient_id
  FROM app.patient_pdfs pp
  JOIN app.studies st ON st.id = pp.study_id
  JOIN app.patients p ON p.id = st.patient_id
  ORDER BY pp.issued_at DESC LIMIT 10;
```
If the affected study has a row, delete it:
```sql
DELETE FROM app.patient_pdfs WHERE study_id = <id>;
```
After deleting, the next reprint regenerates from the live `pdfGenerator.js`. The archive will be re-written the next time pixels arrive for that study.

Run these via: `docker exec -i pacs-postgres psql -U pacs -d pacs` (pipe SQL from PowerShell here-string).
