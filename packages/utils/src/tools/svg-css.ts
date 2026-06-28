import type { ToolResult } from "../types";

export function svgToCss(input: string): ToolResult {
  try {
    const trimmed = input.trim();
    const encoded = encodeURIComponent(trimmed)
      .replace(/'/g, "%27")
      .replace(/"/g, "%22");
    const output = `.icon {\n  background-image: url("data:image/svg+xml,${encoded}");\n  background-repeat: no-repeat;\n  background-size: contain;\n  width: 24px;\n  height: 24px;\n}`;
    return { output, language: "css" };
  } catch (e) {
    return { output: "", error: `SVG to CSS failed: ${(e as Error).message}` };
  }
}
