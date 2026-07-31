export type ToolCategory =
  | "format"
  | "convert"
  | "inspect"
  | "generate"
  | "encode"
  | "productivity"
  | "color"
  | "image"
  | "typography"
  | "print"
  | "calculate";

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
  format?: "text" | "html" | "diff" | "image";
  html?: string;
  imageSrc?: string;
  language?: string;
  diffLines?: Array<{ type: "added" | "removed" | "unchanged"; value: string }>;
  meta?: Record<string, unknown>;
}

export type ToolHandler = (input: string, options?: Record<string, unknown>) => ToolResult;

/** Display order for the category nav. Keep new categories in step here. */
export const ALL_CATEGORIES: ToolCategory[] = [
  "format",
  "convert",
  "inspect",
  "encode",
  "generate",
  "color",
  "image",
  "typography",
  "print",
  "calculate",
  "productivity",
];

/** A zeroed counts record, so callers never have to list categories by hand. */
export function emptyCategoryCounts(): Record<ToolCategory | "all", number> {
  const counts = { all: 0 } as Record<ToolCategory | "all", number>;
  for (const category of ALL_CATEGORIES) counts[category] = 0;
  return counts;
}

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  format: "Format & Validate",
  convert: "Data Converter",
  inspect: "Inspect & Debug",
  generate: "Generators",
  encode: "Encode & Decode",
  productivity: "Productivity",
  color: "Colour",
  image: "Images & Assets",
  typography: "Typography & Text",
  print: "Print & Production",
  calculate: "Calculators",
};

export const CATEGORY_ICONS: Record<ToolCategory, string> = {
  format: "FileJson",
  convert: "ArrowLeftRight",
  inspect: "Search",
  generate: "Sparkles",
  encode: "Lock",
  productivity: "ListTodo",
  color: "Palette",
  image: "Image",
  typography: "Text",
  print: "Printer",
  calculate: "Calculator",
};
