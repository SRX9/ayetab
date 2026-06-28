import { marked } from "marked";
import type { ToolResult } from "../types";

marked.setOptions({ gfm: true, breaks: true });

export function renderMarkdown(input: string): ToolResult {
  try {
    const html = marked.parse(input) as string;
    return { output: input, html, format: "html" };
  } catch (e) {
    return { output: "", error: `Markdown render failed: ${(e as Error).message}` };
  }
}
