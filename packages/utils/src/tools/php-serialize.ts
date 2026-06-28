import { serialize, unserialize } from "php-serialize";
import type { ToolResult } from "../types";

export function phpSerialize(input: string): ToolResult {
  try {
    const parsed = JSON.parse(input);
    const output = serialize(parsed);
    return { output };
  } catch (e) {
    return { output: "", error: `PHP serialize failed: ${(e as Error).message}` };
  }
}

export function phpUnserialize(input: string): ToolResult {
  try {
    const result = unserialize(input.trim());
    return { output: JSON.stringify(result, null, 2), language: "json" };
  } catch (e) {
    return { output: "", error: `PHP unserialize failed: ${(e as Error).message}` };
  }
}

export function convertPhpSerialize(input: string): ToolResult {
  const trimmed = input.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return phpSerialize(input);
  }
  return phpUnserialize(input);
}
