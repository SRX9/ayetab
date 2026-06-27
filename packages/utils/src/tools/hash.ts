import type { ToolResult } from "../types";

async function digest(algorithm: string, input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function generateHashes(input: string): Promise<ToolResult> {
  try {
    const [sha1, sha256, sha512] = await Promise.all([
      digest("SHA-1", input),
      digest("SHA-256", input),
      digest("SHA-512", input),
    ]);

    const lines = [
      `SHA-1:    ${sha1}`,
      `SHA-256:  ${sha256}`,
      `SHA-512:  ${sha512}`,
    ];

    return { output: lines.join("\n") };
  } catch (e) {
    return { output: "", error: `Hash failed: ${(e as Error).message}` };
  }
}

export async function generateHash(input: string, algorithm: string): Promise<ToolResult> {
  try {
    const hash = await digest(algorithm, input);
    return { output: hash };
  } catch (e) {
    return { output: "", error: `Hash failed: ${(e as Error).message}` };
  }
}
