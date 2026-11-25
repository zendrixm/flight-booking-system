/** Levenshtein distance, case-insensitive: how many letters change between two spellings. */
export function editDistance(first: string, second: string): number {
  const a = first.toLowerCase();
  const b = second.toLowerCase();
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[b.length];
}

/** Trims and collapses runs of spaces: "  Andrea   Lim " → "Andrea Lim". */
export function normalizeSpaces(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}
