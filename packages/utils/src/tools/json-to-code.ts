import type { ToolResult } from "../types";

function tsType(value: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  if (value === null) return "null";
  if (Array.isArray(value)) {
    if (value.length === 0) return "unknown[]";
    return `${tsType(value[0], indent)}[]`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "Record<string, unknown>";
    const lines = entries.map(([k, v]) => {
      const key = /^[a-zA-Z_$][\w$]*$/.test(k) ? k : JSON.stringify(k);
      return `${pad}  ${key}: ${tsType(v, indent + 1)};`;
    });
    return `{\n${lines.join("\n")}\n${pad}}`;
  }
  return typeof value;
}

export function jsonToTypeScript(input: string): ToolResult {
  try {
    const parsed = JSON.parse(input);
    const output = `interface Generated {\n  root: ${tsType(parsed, 1)};\n}\n\n// Or as type alias:\nexport type Root = ${tsType(parsed)};`;
    return { output, language: "typescript" };
  } catch (e) {
    return { output: "", error: `JSON parse failed: ${(e as Error).message}` };
  }
}

export function jsonToGo(input: string): ToolResult {
  try {
    const parsed = JSON.parse(input);
    const output = `// Go struct (simplified)\npackage main\n\ntype Root ${goType(parsed)}`;
    return { output, language: "go" };
  } catch (e) {
    return { output: "", error: `JSON parse failed: ${(e as Error).message}` };
  }
}

function goType(value: unknown): string {
  if (Array.isArray(value)) return `[]${goType(value[0])}`;
  if (typeof value === "object" && value !== null) {
    const fields = Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `\t${k[0]!.toUpperCase()}${k.slice(1)} ${goType(v)} \`json:"${k}"\``)
      .join("\n");
    return `struct {\n${fields}\n}`;
  }
  const map: Record<string, string> = { string: "string", number: "float64", boolean: "bool" };
  return map[typeof value] ?? "interface{}";
}

export function jsonToCode(input: string, lang = "typescript"): ToolResult {
  return lang === "go" ? jsonToGo(input) : jsonToTypeScript(input);
}
