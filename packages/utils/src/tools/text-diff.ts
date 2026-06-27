import { diffLines, type Change } from "diff";
import type { ToolResult } from "../types";

export interface DiffLine {
  type: "added" | "removed" | "unchanged";
  value: string;
}

export function computeTextDiff(left: string, right: string): ToolResult {
  const changes = diffLines(left, right);
  const lines: DiffLine[] = [];
  const unified: string[] = [];

  for (const change of changes) {
    const prefix = change.added ? "+ " : change.removed ? "- " : "  ";
    const type: DiffLine["type"] = change.added ? "added" : change.removed ? "removed" : "unchanged";

    for (const line of change.value.split("\n")) {
      if (line === "" && change.value.endsWith("\n")) continue;
      lines.push({ type, value: line });
      unified.push(prefix + line);
    }
  }

  const added = changes.filter((c: Change) => c.added).length;
  const removed = changes.filter((c: Change) => c.removed).length;

  return {
    output: unified.join("\n"),
    format: "diff",
    diffLines: lines,
    meta: { added, removed },
  };
}

export function parseDiffInput(input: string): { left: string; right: string } {
  const separator = "\n---\n";
  const idx = input.indexOf(separator);
  if (idx === -1) {
    const half = Math.floor(input.length / 2);
    return { left: input.slice(0, half), right: input.slice(half) };
  }
  return { left: input.slice(0, idx), right: input.slice(idx + separator.length) };
}
