import type { ToolResult } from "../types";

export function convertNumberBase(input: string, fromBase = 10): ToolResult {
  const trimmed = input.trim().replace(/,/g, "");

  let decimal: number;
  try {
    if (fromBase === 10) {
      decimal = parseInt(trimmed, 10);
    } else if (fromBase === 16) {
      decimal = parseInt(trimmed.replace(/^0x/i, ""), 16);
    } else if (fromBase === 2) {
      decimal = parseInt(trimmed.replace(/^0b/i, ""), 2);
    } else if (fromBase === 8) {
      decimal = parseInt(trimmed.replace(/^0o/i, ""), 8);
    } else {
      decimal = parseInt(trimmed, fromBase);
    }
  } catch {
    return { output: "", error: `Invalid number for base ${fromBase}` };
  }

  if (isNaN(decimal)) {
    return { output: "", error: `Invalid number for base ${fromBase}` };
  }

  return {
    output: [
      `Decimal:     ${decimal}`,
      `Binary:      0b${decimal.toString(2)}`,
      `Octal:       0o${decimal.toString(8)}`,
      `Hexadecimal: 0x${decimal.toString(16).toUpperCase()}`,
    ].join("\n"),
  };
}

export function autoDetectBase(input: string): ToolResult {
  const trimmed = input.trim();
  if (/^0x[0-9a-fA-F]+$/i.test(trimmed)) return convertNumberBase(trimmed, 16);
  if (/^0b[01]+$/i.test(trimmed)) return convertNumberBase(trimmed, 2);
  if (/^0o[0-7]+$/i.test(trimmed)) return convertNumberBase(trimmed, 8);
  return convertNumberBase(trimmed, 10);
}
