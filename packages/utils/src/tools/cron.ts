import cronstrue from "cronstrue";
import { CronExpressionParser } from "cron-parser";
import type { ToolResult } from "../types";

export function parseCron(input: string): ToolResult {
  const expr = input.trim();
  try {
    const description = cronstrue.toString(expr);
    const interval = CronExpressionParser.parse(expr);
    const nextRuns = [];
    for (let i = 0; i < 5; i++) {
      nextRuns.push(interval.next().toISOString());
    }

    return {
      output: [
        `Expression:  ${expr}`,
        `Description: ${description}`,
        "",
        "── Next 5 runs (UTC) ──",
        ...nextRuns.map((t, i) => `${i + 1}. ${t}`),
      ].join("\n"),
    };
  } catch (e) {
    return { output: "", error: `Invalid cron expression: ${(e as Error).message}` };
  }
}
