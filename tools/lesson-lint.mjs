/**
 * Lesson checks for lint.mjs (ADR-0010). Pure: takes Lesson files and product names, returns findings.
 *
 * Product names match as whole words. Short all-capitals names (HMS, DHV) match case-sensitively,
 * because "hms" or "Hms" in prose is the generic word, not PRD-005. Longer names match in any case.
 */
export const MAX_LESSONS = 60;   // Q5 ceiling: past this, one line per Lesson stops being cheap

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function productPattern(name) {
  const isAcronym = /^[A-Z0-9]{2,4}$/.test(name);
  return new RegExp(`(?<![\\w-])${escape(name)}(?![\\w-])`, isAcronym ? '' : 'i');
}

/** @param {{path: string, text: string, meta: object}[]} lessons  @param {string[]} productNames */
export function lessonFindings(lessons, productNames) {
  const out = [];
  const patterns = productNames.filter(Boolean).map(n => [n, productPattern(n)]);
  for (const { path, text, meta } of lessons) {
    for (const [name, re] of patterns) {
      if (re.test(text)) {
        out.push(['ERROR', 'lesson-names-product', path, `names the Product "${name}" — a Lesson never names a Product; only the track may name its Practice ground`]);
      }
    }
    if (!meta.use_when) {
      out.push(['WARN', 'lesson-no-use-when', path, 'no use_when — agents cannot tell when this Lesson applies']);
    }
  }
  if (lessons.length > MAX_LESSONS) {
    out.push(['WARN', 'lessons-ceiling', 'registry.json', `${lessons.length} Lessons, past the ${MAX_LESSONS} ceiling — revisit serving every Lesson to every project (ADR-0010)`]);
  }
  return out;
}
