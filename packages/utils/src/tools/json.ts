import type { ToolResult } from "../types";

export function formatJson(input: string, indent = 2): ToolResult {
  try {
    const parsed = JSON.parse(input);
    return { output: JSON.stringify(parsed, null, indent) };
  } catch (e) {
    return { output: "", error: `Invalid JSON: ${(e as Error).message}` };
  }
}

export function minifyJson(input: string): ToolResult {
  try {
    const parsed = JSON.parse(input);
    return { output: JSON.stringify(parsed) };
  } catch (e) {
    return { output: "", error: `Invalid JSON: ${(e as Error).message}` };
  }
}

export function validateJson(input: string): ToolResult {
  try {
    JSON.parse(input);
    return { output: "✓ Valid JSON" };
  } catch (e) {
    return { output: "", error: `Invalid JSON: ${(e as Error).message}` };
  }
}
