import type { ToolResult } from "../types";

export function encodeUrl(input: string): ToolResult {
  try {
    return { output: encodeURIComponent(input) };
  } catch (e) {
    return { output: "", error: `Encode failed: ${(e as Error).message}` };
  }
}

export function decodeUrl(input: string): ToolResult {
  try {
    return { output: decodeURIComponent(input) };
  } catch (e) {
    return { output: "", error: `Decode failed: ${(e as Error).message}` };
  }
}

export function parseUrl(input: string): ToolResult {
  try {
    const url = new URL(input.trim());
    const result = {
      href: url.href,
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || "(default)",
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      origin: url.origin,
      params: Object.fromEntries(url.searchParams.entries()),
    };
    return { output: JSON.stringify(result, null, 2) };
  } catch (e) {
    return { output: "", error: `Invalid URL: ${(e as Error).message}` };
  }
}
