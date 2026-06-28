import type { ToolResult } from "../types";

export function sortLines(
  input: string,
  options: { order?: "asc" | "desc"; caseSensitive?: boolean; unique?: boolean } = {}
): ToolResult {
  const { order = "asc", caseSensitive = true, unique = false } = options;

  let lines = input.split("\n");

  if (unique) {
    const seen = new Set<string>();
    lines = lines.filter((line) => {
      const key = caseSensitive ? line : line.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  lines.sort((a, b) => {
    const cmp = caseSensitive
      ? a.localeCompare(b)
      : a.toLowerCase().localeCompare(b.toLowerCase());
    return order === "asc" ? cmp : -cmp;
  });

  return { output: lines.join("\n") };
}

export function dedupeLines(input: string, caseSensitive = true): ToolResult {
  return sortLines(input, { unique: true, caseSensitive });
}
