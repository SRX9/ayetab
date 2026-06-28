import type { ToolResult } from "../types";

export function testRegex(pattern: string, testString: string, flags = "g"): ToolResult {
  try {
    const regex = new RegExp(pattern, flags);
    const matches = [...testString.matchAll(regex)];

    if (matches.length === 0) {
      return { output: "No matches found." };
    }

    const lines = matches.map((match, i) => {
      const groups = match.slice(1).filter((g) => g !== undefined);
      const groupStr = groups.length ? `  Groups: [${groups.map((g) => `"${g}"`).join(", ")}]` : "";
      return `Match ${i + 1}: "${match[0]}" at index ${match.index}${groupStr ? "\n" + groupStr : ""}`;
    });

    return {
      output: `Found ${matches.length} match(es):\n\n${lines.join("\n\n")}`,
    };
  } catch (e) {
    return { output: "", error: `Invalid regex: ${(e as Error).message}` };
  }
}
