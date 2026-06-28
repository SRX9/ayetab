import type { ToolResult } from "../types";

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function base64ToUtf8(b64: string): string {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function encodeBase64(input: string): ToolResult {
  try {
    return { output: utf8ToBase64(input) };
  } catch (e) {
    return { output: "", error: `Encode failed: ${(e as Error).message}` };
  }
}

export function decodeBase64(input: string): ToolResult {
  try {
    return { output: base64ToUtf8(input.trim()) };
  } catch (e) {
    return { output: "", error: `Decode failed: ${(e as Error).message}` };
  }
}
