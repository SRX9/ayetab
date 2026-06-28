import { X509Certificate } from "@peculiar/x509";
import type { ToolResult } from "../types";

export function decodeCertificate(input: string): ToolResult {
  try {
    const pem = input.trim();
    const cert = new X509Certificate(pem);

    const lines = [
      `Subject:     ${cert.subject}`,
      `Issuer:      ${cert.issuer}`,
      `Serial:      ${cert.serialNumber}`,
      `Valid From:  ${cert.notBefore.toISOString()}`,
      `Valid To:    ${cert.notAfter.toISOString()}`,
    ];

    const isExpired = cert.notAfter < new Date();
    lines.push("", isExpired ? "⚠ Certificate EXPIRED" : "✓ Certificate valid");

    return { output: lines.join("\n") };
  } catch (e) {
    return { output: "", error: `Certificate decode failed: ${(e as Error).message}` };
  }
}
