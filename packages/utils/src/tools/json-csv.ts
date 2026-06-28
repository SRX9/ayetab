import Papa from "papaparse";
import type { ToolResult } from "../types";

export function jsonToCsv(input: string): ToolResult {
  try {
    const parsed = JSON.parse(input);
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    if (rows.length === 0 || typeof rows[0] !== "object") {
      return { output: "", error: "JSON must be an array of objects" };
    }
    const output = Papa.unparse(rows);
    return { output };
  } catch (e) {
    return { output: "", error: `JSON to CSV failed: ${(e as Error).message}` };
  }
}

export function csvToJson(input: string): ToolResult {
  try {
    const result = Papa.parse(input.trim(), { header: true, skipEmptyLines: true });
    if (result.errors.length > 0) {
      return { output: "", error: result.errors[0]?.message ?? "CSV parse error" };
    }
    return { output: JSON.stringify(result.data, null, 2), language: "json" };
  } catch (e) {
    return { output: "", error: `CSV to JSON failed: ${(e as Error).message}` };
  }
}

export function convertJsonCsv(input: string): ToolResult {
  const trimmed = input.trim();
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    return jsonToCsv(input);
  }
  return csvToJson(input);
}
