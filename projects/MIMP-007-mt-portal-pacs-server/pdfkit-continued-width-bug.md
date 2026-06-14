---
name: pdfkit-continued-width-bug
description: "PDFKit { continued:true, width:N } constrains the ENTIRE continued block to N pt — use table approach instead"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: eeb34906-4bee-4e90-ada6-ab915aaafef0
---

Do NOT use `{ continued: true, width: N }` with a narrow N for numbered list items in PDFKit. The `width` on the first call constrains the entire text block (including continuation calls) to N pt — producing character-per-line wrapping even if the continuation call specifies a wide `{ width }`.

**Why:** Confirmed via live diagnostic in the pacs-backend container: `doc.text('1.', ML, 200, { continued: true, width: 20 })` followed by `doc.text(longText, { width: 335 })` produced `doc.y = 386` (186 pt for one line of text = ~16 micro-lines). The 20 pt box was the binding constraint.

**How to apply:** Use the table-row pattern instead:
```js
steps.forEach((step, i) => {
  const sy = doc.y;
  // Cell 2 first — establishes row height
  doc.fillColor(bodyColor).font('Helvetica').fontSize(9.5)
     .text(step, STXT_X, sy, { width: STXT_W });
  const rowEnd = doc.y + 5;
  // Cell 1 stamped at same sy — lineBreak:false, doesn't reflow
  doc.fillColor(accentColor).font('Helvetica-Bold').fontSize(10)
     .text(`${i + 1}.`, ML, sy, { width: SNUM_W, lineBreak: false });
  doc.y = rowEnd;  // explicit row advance
});
```
Render the wide text cell first (advances `doc.y` to row bottom), save `rowEnd`, then stamp the narrow number cell at the same `sy` with `lineBreak: false`. Restore `doc.y = rowEnd` explicitly.
