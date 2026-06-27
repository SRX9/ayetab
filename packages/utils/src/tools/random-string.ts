import type { ToolResult } from "../types";

const CHARSETS = {
  alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  numeric: "0123456789",
  hex: "0123456789abcdef",
  symbols: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*",
};

export function generateRandomString(
  length = 32,
  charset: keyof typeof CHARSETS = "alphanumeric"
): ToolResult {
  const chars = CHARSETS[charset] ?? CHARSETS.alphanumeric;
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  const result = Array.from(array, (byte) => chars[byte % chars.length]).join("");
  return { output: result };
}
