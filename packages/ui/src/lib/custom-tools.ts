/** Tools that use a custom UI instead of the standard input/output runner. */
export const CUSTOM_UI_TOOL_IDS = new Set([
  // Productivity
  "excalidraw",
  "todo-list",
  "kanban-board",
  "pomodoro",
  "quick-notes",
  "stopwatch",
  "habit-tracker",

  // Colour
  "palette-generator",
  "palette-collection",
  "palette-extractor",
  "pixel-picker",
  "colorblind-sim",
  "contrast-checker",
  "gradient-generator",
  "harmony-generator",
  "tailwind-shades",

  // Images & assets
  "image-editor",
  "background-remover",
  "artwork-enhancer",
  "favicon-generator",
  "image-clipper",
  "image-converter",
  "image-splitter",
  "image-stitcher",
  "image-tracer",
  "paste-image",
  "placeholder-generator",
  "matte-generator",
  "scroll-generator",
  "social-cropper",
  "watermarker",

  // Typography & text
  "doc-converter",
  "font-explorer",
  "glyph-browser",
  "large-type",
  "line-height-calc",
  "paper-sizes",
  "px-to-rem",
  "markdown-editor",
  "text-scratchpad",
  "typo-calc",
  "word-counter",
  "shavian-transliterator",

  // Print & production
  "pdf-preflight",
  "print-imposer",
  "zine-imposer",

  // Calculators
  "sci-calc",
  "graph-calc",
  "algebra-calc",
  "time-calc",
  "unit-converter",

  // Other
  "barcode-generator",
  "qr-styled",
  "cipher-decoder",
  "meta-tag-generator",
  "tailwind-cheatsheet",
]);

export function isCustomUiTool(toolId: string): boolean {
  return CUSTOM_UI_TOOL_IDS.has(toolId);
}
