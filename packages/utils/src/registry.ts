import type { ToolDefinition } from "./types";

export const TOOL_REGISTRY: ToolDefinition[] = [
  // P0 — MVP
  {
    id: "json-formatter",
    name: "JSON Formatter",
    description: "Format, validate, and minify JSON",
    category: "format",
    priority: "P0",
    icon: "Braces",
    keywords: ["json", "format", "validate", "minify", "pretty"],
    smartDetect: /^[\s]*[{[]/,
  },
  {
    id: "base64",
    name: "Base64 Encode/Decode",
    description: "Encode and decode Base64 strings",
    category: "encode",
    priority: "P0",
    icon: "Binary",
    keywords: ["base64", "encode", "decode", "b64"],
    smartDetect: /^[A-Za-z0-9+/]+=*$/,
  },
  {
    id: "url-encode",
    name: "URL Encode/Decode",
    description: "Encode and decode URL strings",
    category: "encode",
    priority: "P0",
    icon: "Link",
    keywords: ["url", "encode", "decode", "percent", "uri"],
  },
  {
    id: "hash-generator",
    name: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, SHA-512 hashes",
    category: "generate",
    priority: "P0",
    icon: "Hash",
    keywords: ["hash", "md5", "sha", "sha256", "checksum"],
  },
  {
    id: "uuid-generator",
    name: "UUID Generator",
    description: "Generate random UUIDs (v4)",
    category: "generate",
    priority: "P0",
    icon: "Fingerprint",
    keywords: ["uuid", "guid", "generate", "random", "v4"],
  },
  {
    id: "unix-time",
    name: "Unix Time Converter",
    description: "Convert Unix timestamps to human-readable dates",
    category: "inspect",
    priority: "P0",
    icon: "Clock",
    keywords: ["unix", "timestamp", "epoch", "time", "date"],
    smartDetect: /^\d{10,13}$/,
  },
  {
    id: "jwt-debugger",
    name: "JWT Debugger",
    description: "Decode and inspect JWT tokens",
    category: "inspect",
    priority: "P0",
    icon: "Shield",
    keywords: ["jwt", "token", "decode", "json web token", "bearer"],
    smartDetect: /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
  },
  {
    id: "regex-tester",
    name: "RegExp Tester",
    description: "Test and debug regular expressions",
    category: "inspect",
    priority: "P0",
    icon: "Regex",
    keywords: ["regex", "regexp", "regular expression", "pattern", "match"],
  },
  {
    id: "color-converter",
    name: "Color Converter",
    description: "Convert between HEX, RGB, HSL color formats",
    category: "convert",
    priority: "P0",
    icon: "Palette",
    keywords: ["color", "hex", "rgb", "hsl", "convert"],
  },
  {
    id: "number-base",
    name: "Number Base Converter",
    description: "Convert between binary, octal, decimal, hexadecimal",
    category: "convert",
    priority: "P0",
    icon: "Calculator",
    keywords: ["binary", "hex", "decimal", "octal", "base", "radix"],
  },
  {
    id: "case-converter",
    name: "String Case Converter",
    description: "Convert between camelCase, snake_case, kebab-case, and more",
    category: "convert",
    priority: "P0",
    icon: "CaseSensitive",
    keywords: ["case", "camelcase", "snake_case", "kebab-case", "pascal"],
  },
  {
    id: "line-sort",
    name: "Line Sort/Dedupe",
    description: "Sort lines and remove duplicates",
    category: "format",
    priority: "P0",
    icon: "ListOrdered",
    keywords: ["sort", "dedupe", "lines", "unique", "order"],
  },

  // P1 — Core
  {
    id: "html-formatter",
    name: "HTML Formatter",
    description: "Beautify and minify HTML",
    category: "format",
    priority: "P1",
    icon: "Code",
    keywords: ["html", "format", "beautify", "minify"],
  },
  {
    id: "css-formatter",
    name: "CSS Formatter",
    description: "Beautify and minify CSS",
    category: "format",
    priority: "P1",
    icon: "Paintbrush",
    keywords: ["css", "format", "beautify", "minify"],
  },
  {
    id: "js-formatter",
    name: "JS Formatter",
    description: "Beautify and minify JavaScript",
    category: "format",
    priority: "P1",
    icon: "FileCode",
    keywords: ["javascript", "js", "format", "beautify", "minify"],
  },
  {
    id: "sql-formatter",
    name: "SQL Formatter",
    description: "Format SQL queries with syntax highlighting",
    category: "format",
    priority: "P1",
    icon: "Database",
    keywords: ["sql", "format", "query", "postgresql", "mysql"],
  },
  {
    id: "yaml-json",
    name: "YAML ↔ JSON",
    description: "Convert between YAML and JSON formats",
    category: "convert",
    priority: "P1",
    icon: "FileJson2",
    keywords: ["yaml", "json", "convert", "yml"],
  },
  {
    id: "json-csv",
    name: "JSON ↔ CSV",
    description: "Convert between JSON and CSV formats",
    category: "convert",
    priority: "P1",
    icon: "Table",
    keywords: ["json", "csv", "convert", "spreadsheet"],
  },
  {
    id: "text-diff",
    name: "Text Diff",
    description: "Compare two texts and find differences",
    category: "inspect",
    priority: "P1",
    icon: "GitCompare",
    keywords: ["diff", "compare", "text", "difference"],
  },
  {
    id: "markdown-preview",
    name: "Markdown Preview",
    description: "Live preview of markdown content",
    category: "inspect",
    priority: "P1",
    icon: "FileText",
    keywords: ["markdown", "md", "preview", "render"],
  },
  {
    id: "cron-parser",
    name: "Cron Parser",
    description: "Parse and explain cron expressions",
    category: "inspect",
    priority: "P1",
    icon: "Timer",
    keywords: ["cron", "schedule", "parser", "crontab"],
  },
  {
    id: "url-parser",
    name: "URL Parser",
    description: "Parse URL into components",
    category: "convert",
    priority: "P1",
    icon: "Globe",
    keywords: ["url", "parse", "uri", "components"],
    smartDetect: /^https?:\/\//,
  },
  {
    id: "html-entity",
    name: "HTML Entity Encode/Decode",
    description: "Encode and decode HTML entities",
    category: "encode",
    priority: "P1",
    icon: "Code2",
    keywords: ["html", "entity", "encode", "decode", "ampersand"],
  },
  {
    id: "lorem-ipsum",
    name: "Lorem Ipsum Generator",
    description: "Generate placeholder text",
    category: "generate",
    priority: "P1",
    icon: "Text",
    keywords: ["lorem", "ipsum", "placeholder", "text", "dummy"],
  },
  {
    id: "random-string",
    name: "Random String Generator",
    description: "Generate random strings with custom charset",
    category: "generate",
    priority: "P1",
    icon: "Shuffle",
    keywords: ["random", "string", "password", "generate"],
  },
  {
    id: "hex-ascii",
    name: "Hex ↔ ASCII",
    description: "Convert between hex and ASCII strings",
    category: "convert",
    priority: "P1",
    icon: "Hexagon",
    keywords: ["hex", "ascii", "convert", "hexadecimal"],
    smartDetect: /^[0-9a-fA-F\s]+$/,
  },
  {
    id: "string-inspector",
    name: "String Inspector",
    description: "Analyze text statistics and character codes",
    category: "inspect",
    priority: "P1",
    icon: "ScanSearch",
    keywords: ["string", "inspect", "analyze", "length", "encoding"],
  },
];

export function getToolById(id: string): ToolDefinition | undefined {
  return TOOL_REGISTRY.find((t) => t.id === id);
}

export function getToolsByCategory(category: ToolDefinition["category"]): ToolDefinition[] {
  return TOOL_REGISTRY.filter((t) => t.category === category);
}

export function getToolsByPriority(priority: ToolDefinition["priority"]): ToolDefinition[] {
  return TOOL_REGISTRY.filter((t) => t.priority === priority);
}

export function searchTools(query: string): ToolDefinition[] {
  const q = query.toLowerCase().trim();
  if (!q) return TOOL_REGISTRY;

  return TOOL_REGISTRY.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.id.includes(q) ||
      t.keywords.some((k) => k.includes(q))
  );
}
