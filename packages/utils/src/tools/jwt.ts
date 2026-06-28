import type { ToolResult } from "../types";

function decodeBase64Url(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  try {
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return atob(padded);
  }
}

export function decodeJwt(input: string): ToolResult {
  const parts = input.trim().split(".");
  if (parts.length !== 3) {
    return { output: "", error: "Invalid JWT: expected 3 dot-separated parts" };
  }

  try {
    const header = JSON.parse(decodeBase64Url(parts[0]!));
    const payload = JSON.parse(decodeBase64Url(parts[1]!));

    const warnings: string[] = [];
    if (payload.exp) {
      const expDate = new Date(payload.exp * 1000);
      if (expDate < new Date()) {
        warnings.push(`⚠ Token expired at ${expDate.toISOString()}`);
      } else {
        warnings.push(`✓ Token valid until ${expDate.toISOString()}`);
      }
    }
    if (payload.nbf) {
      const nbfDate = new Date(payload.nbf * 1000);
      if (nbfDate > new Date()) {
        warnings.push(`⚠ Token not valid until ${nbfDate.toISOString()}`);
      }
    }

    const output = [
      "── Header ──",
      JSON.stringify(header, null, 2),
      "",
      "── Payload ──",
      JSON.stringify(payload, null, 2),
      "",
      "── Signature ──",
      parts[2]!,
      ...(warnings.length ? ["", "── Status ──", ...warnings] : []),
    ].join("\n");

    return { output };
  } catch (e) {
    return { output: "", error: `JWT decode failed: ${(e as Error).message}` };
  }
}
