import { html as beautifyHtml, css as beautifyCss, js as beautifyJs } from "js-beautify";
import type { ToolResult } from "../types";

function minifyOptions(indent = 2) {
  return { indent_size: indent, wrap_line_length: 80 };
}

export function formatHtml(input: string, minify = false): ToolResult {
  try {
    const output = beautifyHtml(input, minifyOptions(minify ? 0 : 2));
    return { output, language: "html" };
  } catch (e) {
    return { output: "", error: `HTML format failed: ${(e as Error).message}` };
  }
}

export function formatCss(input: string, minify = false): ToolResult {
  try {
    const output = beautifyCss(input, minifyOptions(minify ? 0 : 2));
    return { output, language: "css" };
  } catch (e) {
    return { output: "", error: `CSS format failed: ${(e as Error).message}` };
  }
}

export function formatJs(input: string, minify = false): ToolResult {
  try {
    const output = beautifyJs(input, minifyOptions(minify ? 0 : 2));
    return { output, language: "javascript" };
  } catch (e) {
    return { output: "", error: `JS format failed: ${(e as Error).message}` };
  }
}
