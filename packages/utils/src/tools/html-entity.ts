import type { ToolResult } from "../types";

const ENTITY_MAP: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": "\u00A0",
};

export function encodeHtmlEntities(input: string): ToolResult {
  const output = input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
  return { output };
}

export function decodeHtmlEntities(input: string): ToolResult {
  let output = input;
  output = output.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
    String.fromCodePoint(parseInt(hex, 16))
  );
  output = output.replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)));
  for (const [entity, char] of Object.entries(ENTITY_MAP)) {
    output = output.replaceAll(entity, char);
  }
  return { output };
}

export function convertHtmlEntities(input: string): ToolResult {
  if (/&(?:#x?[0-9a-fA-F]+|[a-zA-Z]+);/.test(input)) {
    return decodeHtmlEntities(input);
  }
  return encodeHtmlEntities(input);
}
