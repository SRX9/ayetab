import type { ToolResult } from "../types";

export function previewHtml(input: string): ToolResult {
  return { output: input, html: input, format: "html" };
}
