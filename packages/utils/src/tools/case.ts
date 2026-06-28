import type { ToolResult } from "../types";

export function toCamelCase(input: string): string {
  return input
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/^(.)/, (c) => c.toLowerCase());
}

export function toPascalCase(input: string): string {
  const camel = toCamelCase(input);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

export function toSnakeCase(input: string): string {
  return input
    .replace(/([A-Z])/g, "_$1")
    .replace(/[-\s]+/g, "_")
    .toLowerCase()
    .replace(/^_/, "");
}

export function toKebabCase(input: string): string {
  return input
    .replace(/([A-Z])/g, "-$1")
    .replace(/[_\s]+/g, "-")
    .toLowerCase()
    .replace(/^-/, "");
}

export function toConstantCase(input: string): string {
  return toSnakeCase(input).toUpperCase();
}

export function toTitleCase(input: string): string {
  return input
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function convertCase(input: string): ToolResult {
  if (!input.trim()) {
    return { output: "", error: "Input is empty" };
  }

  return {
    output: [
      `camelCase:      ${toCamelCase(input)}`,
      `PascalCase:     ${toPascalCase(input)}`,
      `snake_case:     ${toSnakeCase(input)}`,
      `kebab-case:     ${toKebabCase(input)}`,
      `CONSTANT_CASE:  ${toConstantCase(input)}`,
      `Title Case:     ${toTitleCase(input)}`,
    ].join("\n"),
  };
}
