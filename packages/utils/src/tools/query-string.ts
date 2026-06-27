import type { ToolResult } from "../types";

export function parseQueryString(input: string): ToolResult {
  try {
    const trimmed = input.trim();
    const qs = trimmed.includes("?") ? trimmed.split("?").pop()! : trimmed;
    const params = Object.fromEntries(new URLSearchParams(qs));
    return { output: JSON.stringify(params, null, 2), language: "json" };
  } catch (e) {
    return { output: "", error: `Query string parse failed: ${(e as Error).message}` };
  }
}

export function buildQueryString(input: string): ToolResult {
  try {
    const obj = JSON.parse(input) as Record<string, string>;
    const params = new URLSearchParams(obj);
    return { output: params.toString() };
  } catch (e) {
    return { output: "", error: `JSON parse failed: ${(e as Error).message}` };
  }
}

export function convertQueryString(input: string): ToolResult {
  const trimmed = input.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return buildQueryString(input);
  }
  return parseQueryString(input);
}
