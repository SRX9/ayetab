import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import type { ToolResult } from "../types";

export function yamlToJson(input: string): ToolResult {
  try {
    const parsed = parseYaml(input);
    return { output: JSON.stringify(parsed, null, 2), language: "json" };
  } catch (e) {
    return { output: "", error: `YAML parse failed: ${(e as Error).message}` };
  }
}

export function jsonToYaml(input: string): ToolResult {
  try {
    const parsed = JSON.parse(input);
    const output = stringifyYaml(parsed, { indent: 2 });
    return { output, language: "yaml" };
  } catch (e) {
    return { output: "", error: `JSON parse failed: ${(e as Error).message}` };
  }
}

export function convertYamlJson(input: string): ToolResult {
  const trimmed = input.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return jsonToYaml(input);
  }
  return yamlToJson(input);
}
