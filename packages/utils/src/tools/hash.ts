import SparkMD5 from "spark-md5";
import { keccak256 } from "js-sha3";
import type { ToolResult } from "../types";

async function digest(algorithm: string, input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function generateHashes(input: string): Promise<ToolResult> {
  try {
    const [sha1, sha256, sha512, md5, keccak] = await Promise.all([
      digest("SHA-1", input),
      digest("SHA-256", input),
      digest("SHA-512", input),
      Promise.resolve(SparkMD5.hash(input)),
      Promise.resolve(keccak256(input)),
    ]);

    return {
      output: [
        `MD5:         ${md5}`,
        `SHA-1:       ${sha1}`,
        `SHA-256:     ${sha256}`,
        `SHA-512:     ${sha512}`,
        `Keccak-256:  ${keccak}`,
      ].join("\n"),
    };
  } catch (e) {
    return { output: "", error: `Hash failed: ${(e as Error).message}` };
  }
}
