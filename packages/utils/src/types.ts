export type ToolCategory = "format" | "convert" | "inspect" | "generate" | "encode";

export type ToolPriority = "P0" | "P1" | "P2" | "P3";

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  priority: ToolPriority;
  icon: string;
  keywords: string[];
  smartDetect?: RegExp;
}

export interface ToolResult {
  output: string;
  error?: string;
  format?: "text" | "html" | "diff";
  html?: string;
  language?: string;
  diffLines?: Array<{ type: "added" | "removed" | "unchanged"; value: string }>;
  meta?: Record<string, unknown>;
}

export type ToolHandler = (input: string, options?: Record<string, unknown>) => ToolResult;

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  format: "Format & Validate",
  convert: "Data Converter",
  inspect: "Inspect & Debug",
  generate: "Generators",
  encode: "Encode & Decode",
};

export const CATEGORY_ICONS: Record<ToolCategory, string> = {
  format: "FileJson",
  convert: "ArrowLeftRight",
  inspect: "Search",
  generate: "Sparkles",
  encode: "Lock",
};
