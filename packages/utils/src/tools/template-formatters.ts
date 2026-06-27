import { html as beautifyHtml, css as beautifyCss } from "js-beautify";
import type { ToolResult } from "../types";

function fmt(content: string, minify: boolean, type: "html" | "css"): ToolResult {
  try {
    const fn = type === "html" ? beautifyHtml : beautifyCss;
    const output = fn(content, { indent_size: minify ? 0 : 2 });
    return { output, language: type === "html" ? "html" : "css" };
  } catch (e) {
    return { output: "", error: `Format failed: ${(e as Error).message}` };
  }
}

export const formatErb = (input: string, minify = false) => fmt(input, minify, "html");
export const formatLess = (input: string, minify = false) => fmt(input, minify, "css");
export const formatScss = (input: string, minify = false) => fmt(input, minify, "css");
