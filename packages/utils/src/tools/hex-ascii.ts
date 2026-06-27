import type { ToolResult } from "../types";

export function asciiToHex(input: string): ToolResult {
  const hex = [...new TextEncoder().encode(input)]
    .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
    .join(" ");
  return { output: hex };
}

export function hexToAscii(input: string): ToolResult {
  try {
    const hex = input.replace(/\s/g, "");
    if (!/^[0-9a-fA-F]*$/.test(hex)) {
      return { output: "", error: "Invalid hex string" };
    }
    if (hex.length % 2 !== 0) {
      return { output: "", error: "Hex string must have an even number of characters" };
    }
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return { output: new TextDecoder().decode(bytes) };
  } catch (e) {
    return { output: "", error: `Conversion failed: ${(e as Error).message}` };
  }
}

export function convertHexAscii(input: string): ToolResult {
  const trimmed = input.trim();
  if (/^[0-9a-fA-F\s]+$/.test(trimmed) && trimmed.replace(/\s/g, "").length >= 2) {
    return hexToAscii(trimmed);
  }
  return asciiToHex(input);
}
