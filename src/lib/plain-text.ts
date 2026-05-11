/**
 * Strip common markdown for short previews so fixed-length slices never cut
 * inside **…** and leave dangling tokens (which breaks rendering).
 */
export function plainTextDigest(source: string, maxLen: number): string {
  let text = source
    .replace(/\r\n/g, "\n")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_\n]+)_/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/[`>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  const shortened = lastSpace > maxLen * 0.5 ? cut.slice(0, lastSpace) : cut;
  return `${shortened.trimEnd()}…`;
}
