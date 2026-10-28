/** `s` with every RegExp metacharacter escaped, to match it literally inside a pattern. */
export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
