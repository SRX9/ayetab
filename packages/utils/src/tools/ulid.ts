import { ulid } from "ulid";
import type { ToolResult } from "../types";

export function generateUlid(count = 5): ToolResult {
  const ids = Array.from({ length: Math.min(count, 50) }, () => ulid());
  return { output: ids.join("\n") };
}

export function decodeUlid(input: string): ToolResult {
  const trimmed = input.trim();
  if (!/^[0-9A-HJKMNP-TV-Z]{26}$/i.test(trimmed)) {
    return { output: "", error: "Invalid ULID format" };
  }
  const timestamp = parseInt(trimmed.slice(0, 10), 32);
  const date = new Date(timestamp);
  return {
    output: [
      `ULID:        ${trimmed.toUpperCase()}`,
      `Timestamp:   ${timestamp}`,
      `Date (UTC):  ${date.toISOString()}`,
      `Random:      ${trimmed.slice(10).toUpperCase()}`,
    ].join("\n"),
  };
}

export function convertUlid(input: string): ToolResult {
  if (/^[0-9A-HJKMNP-TV-Z]{26}$/i.test(input.trim())) {
    return decodeUlid(input);
  }
  return generateUlid(5);
}
