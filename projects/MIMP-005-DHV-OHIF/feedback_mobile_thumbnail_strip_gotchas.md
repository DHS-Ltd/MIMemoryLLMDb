---
name: feedback-mobile-thumbnail-strip-gotchas
description: "Four specific bugs hit during MobileThumbnailStrip build — wrong API call, wrong render location, flex height conflict, scroll container shrink"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 447eca1b-b14d-4a59-a1a8-98768fade01b
---

These bugs were all hit in a single session building the mobile thumbnail strip. Record them so the same mistakes aren't repeated if the strip is ever modified.

**Bug 1 — `displaySetService.getActiveDisplaySets()` does not exist.**
Use `displaySetService.activeDisplaySets` (a property, not a method). Calling the non-existent method threw a TypeError that silently killed the `useEffect` timer, leaving the strip permanently empty with no console error visible to the user.
**Why:** The OHIF `DisplaySetService` exposes `activeDisplaySets` as a getter property. There is no `getActiveDisplaySets()` method.
**How to apply:** Any time you access active display sets, use `.activeDisplaySets` directly.

---

**Bug 2 — Strip rendered as sibling of the main flex-row viewport div appeared on the left, not the bottom.**
The outer `<div>` in `ViewerLayout/index.tsx` has no explicit flex direction, but some inherited or outer context pulled the strip into the row. Fix: render the strip **inside** the viewport panel's `flex-col` container, as the last child after the `ViewportGridComp` div. It sits below the image in the column flow.
**Why:** The strip needs to be a flex-col sibling of the DICOM image, not a sibling of the entire panel row.
**How to apply:** The strip always belongs inside `<ResizablePanel>` → `<div className="flex h-full flex-1 flex-col">` → after the viewport div.

---

**Bug 3 — `h-full flex-1` on the viewport div consumed all panel height, squashing the strip to ~0px.**
In a `flex-col` container, a child with both `h-full` and `flex-1` tries to be 100% of the container height. Combined with `shrink-0` on the strip, the total exceeds the container and the strip is squashed. Fix: replace `h-full` with `min-h-0` on the viewport div.
**Why:** `min-h-0` removes the default `min-height: auto` that prevents flex children from shrinking. With `min-h-0 flex-1` the viewport takes all *remaining* space after the fixed-height strip claims its 160px.
**How to apply:** In any flex-col layout where a fixed-height footer needs to coexist with a flex-1 content area, use `min-h-0 flex-1` on the content and `shrink-0 h-[Xpx]` on the footer.

---

**Bug 4 — Strip showed cards but was not scrollable.**
The outer scroll container had `overflow-x-auto` but the inner `flex-row` div was shrinking to fit, so no overflow was generated. Fix: add `min-w-max` to the inner row div.
**Why:** `min-w-max` sets `min-width: max-content`, forcing the row to its natural full-content width regardless of the parent container width. This generates the horizontal overflow that `overflow-x-auto` then makes scrollable.
**How to apply:** Any horizontal scroll container pattern needs `min-w-max` (or `shrink-0`) on the inner row, plus `overflow-x-auto` on the outer wrapper.
