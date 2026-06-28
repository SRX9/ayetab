import type { ToolResult } from "../types";

export function generateUuid(count = 1): ToolResult {
  try {
    const uuids = Array.from({ length: Math.min(count, 100) }, () => crypto.randomUUID());
    return { output: uuids.join("\n") };
  } catch (e) {
    return { output: "", error: `UUID generation failed: ${(e as Error).message}` };
  }
}
