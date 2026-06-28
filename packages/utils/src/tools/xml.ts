import { html as beautifyHtml } from "js-beautify";
import type { ToolResult } from "../types";

export function formatXml(input: string, minify = false): ToolResult {
  try {
    const output = beautifyHtml(input, { indent_size: minify ? 0 : 2, wrap_line_length: 80 });
    return { output, language: "xml" };
  } catch (e) {
    return { output: "", error: `XML format failed: ${(e as Error).message}` };
  }
}
