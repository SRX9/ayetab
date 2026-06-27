import type { ToolResult } from "../types";

export function escapeBackslash(input: string): ToolResult {
  return { output: JSON.stringify(input).slice(1, -1) };
}

export function unescapeBackslash(input: string): ToolResult {
  try {
    return { output: JSON.parse(`"${input.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`) };
  } catch {
    try {
      return { output: JSON.parse(`"${input}"`) };
    } catch (e) {
      return { output: "", error: `Unescape failed: ${(e as Error).message}` };
    }
  }
}

export function convertBackslash(input: string): ToolResult {
  if (/\\[nrtbf"'\\]/.test(input)) {
    return unescapeBackslash(input);
  }
  return escapeBackslash(input);
}
