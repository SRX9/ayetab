import type { ToolResult } from "../types";

export function inspectString(input: string): ToolResult {
  const bytes = new TextEncoder().encode(input);
  const lines = input.split("\n");
  const words = input.trim() ? input.trim().split(/\s+/) : [];

  const charCodes = [...input.slice(0, 20)]
    .map((c) => `${c} (U+${c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")})`)
    .join("\n");

  const output = [
    `Characters:  ${input.length}`,
    `Bytes (UTF-8): ${bytes.length}`,
    `Lines:       ${lines.length}`,
    `Words:       ${words.length}`,
    `Empty:       ${input.length === 0 ? "yes" : "no"}`,
    "",
    "── First 20 characters ──",
    charCodes,
    input.length > 20 ? `... and ${input.length - 20} more` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return { output };
}
