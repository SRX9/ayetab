"use client";

import { lazy, type ComponentType } from "react";
import type { CustomToolProps } from "../components/productivity/shared";

/**
 * Custom tool UIs are code-split so that opening a new tab does not pay for
 * fifty tools it will not render. Tools are grouped per module, so picking one
 * colour tool warms the rest of that group — which is the usual browsing
 * pattern anyway.
 */
type ToolComponent = ComponentType<CustomToolProps>;

const lazyTool = <M extends Record<string, unknown>>(
  load: () => Promise<M>,
  pick: (mod: M) => ToolComponent
): ToolComponent => lazy(async () => ({ default: pick(await load()) }));

const productivity = () => import("../components/productivity-bundle");
const colorTools = () => import("../components/design/color-tools");
const colorImageTools = () => import("../components/design/color-image-tools");
const imageTools = () => import("../components/design/image-tools");
const socialTools = () => import("../components/design/social-tools");
const assetTools = () => import("../components/design/asset-tools");
const imageEditor = () => import("../components/design/image-editor");
const typeTools = () => import("../components/design/type-tools");
const textTools = () => import("../components/design/text-tools");
const printTools = () => import("../components/design/print-tools");
const calcTools = () => import("../components/design/calc-tools");
const miscTools = () => import("../components/design/misc-tools");

export const CUSTOM_TOOL_COMPONENTS: Record<string, ToolComponent> = {
  // Productivity
  excalidraw: lazyTool(productivity, (m) => m.ExcalidrawTool),
  "todo-list": lazyTool(productivity, (m) => m.TodoListTool),
  "kanban-board": lazyTool(productivity, (m) => m.KanbanTool),
  pomodoro: lazyTool(productivity, (m) => m.PomodoroTool),
  "quick-notes": lazyTool(productivity, (m) => m.QuickNotesTool),
  stopwatch: lazyTool(productivity, (m) => m.StopwatchTool),
  "habit-tracker": lazyTool(productivity, (m) => m.HabitTrackerTool),

  // Colour
  "palette-generator": lazyTool(colorTools, (m) => m.PaletteGeneratorTool),
  "palette-collection": lazyTool(colorTools, (m) => m.PaletteCollectionTool),
  "contrast-checker": lazyTool(colorTools, (m) => m.ContrastCheckerTool),
  "gradient-generator": lazyTool(colorTools, (m) => m.GradientGeneratorTool),
  "harmony-generator": lazyTool(colorTools, (m) => m.HarmonyGeneratorTool),
  "tailwind-shades": lazyTool(colorTools, (m) => m.TailwindShadesTool),
  "palette-extractor": lazyTool(colorImageTools, (m) => m.PaletteExtractorTool),
  "pixel-picker": lazyTool(colorImageTools, (m) => m.PixelPickerTool),
  "colorblind-sim": lazyTool(colorImageTools, (m) => m.ColorBlindSimTool),

  // Images & assets
  "image-clipper": lazyTool(imageTools, (m) => m.ImageClipperTool),
  "image-converter": lazyTool(imageTools, (m) => m.ImageConverterTool),
  "image-splitter": lazyTool(imageTools, (m) => m.ImageSplitterTool),
  "image-stitcher": lazyTool(imageTools, (m) => m.ImageStitcherTool),
  "paste-image": lazyTool(imageTools, (m) => m.PasteImageTool),
  "placeholder-generator": lazyTool(imageTools, (m) => m.PlaceholderGeneratorTool),
  "artwork-enhancer": lazyTool(socialTools, (m) => m.ArtworkEnhancerTool),
  "matte-generator": lazyTool(socialTools, (m) => m.MatteGeneratorTool),
  "scroll-generator": lazyTool(socialTools, (m) => m.ScrollGeneratorTool),
  "social-cropper": lazyTool(socialTools, (m) => m.SocialCropperTool),
  watermarker: lazyTool(socialTools, (m) => m.WatermarkerTool),
  "background-remover": lazyTool(assetTools, (m) => m.BackgroundRemoverTool),
  "favicon-generator": lazyTool(assetTools, (m) => m.FaviconGeneratorTool),
  "image-tracer": lazyTool(assetTools, (m) => m.ImageTracerTool),
  "image-editor": lazyTool(imageEditor, (m) => m.ImageEditorTool),

  // Typography & text
  "glyph-browser": lazyTool(typeTools, (m) => m.GlyphBrowserTool),
  "large-type": lazyTool(typeTools, (m) => m.LargeTypeTool),
  "line-height-calc": lazyTool(typeTools, (m) => m.LineHeightCalcTool),
  "paper-sizes": lazyTool(typeTools, (m) => m.PaperSizesTool),
  "px-to-rem": lazyTool(typeTools, (m) => m.PxToRemTool),
  "typo-calc": lazyTool(typeTools, (m) => m.TypoCalcTool),
  "doc-converter": lazyTool(textTools, (m) => m.DocConverterTool),
  "font-explorer": lazyTool(textTools, (m) => m.FontExplorerTool),
  "markdown-editor": lazyTool(textTools, (m) => m.MarkdownEditorTool),
  "text-scratchpad": lazyTool(textTools, (m) => m.TextScratchpadTool),
  "word-counter": lazyTool(textTools, (m) => m.WordCounterTool),
  "shavian-transliterator": lazyTool(textTools, (m) => m.ShavianTool),

  // Print & production
  "pdf-preflight": lazyTool(printTools, (m) => m.PdfPreflightTool),
  "print-imposer": lazyTool(printTools, (m) => m.PrintImposerTool),
  "zine-imposer": lazyTool(printTools, (m) => m.ZineImposerTool),

  // Calculators
  "sci-calc": lazyTool(calcTools, (m) => m.SciCalcTool),
  "graph-calc": lazyTool(calcTools, (m) => m.GraphCalcTool),
  "algebra-calc": lazyTool(calcTools, (m) => m.AlgebraCalcTool),
  "time-calc": lazyTool(calcTools, (m) => m.TimeCalcTool),
  "unit-converter": lazyTool(calcTools, (m) => m.UnitConverterTool),

  // Other
  "barcode-generator": lazyTool(miscTools, (m) => m.BarcodeGeneratorTool),
  "qr-styled": lazyTool(miscTools, (m) => m.StyledQrTool),
  "cipher-decoder": lazyTool(miscTools, (m) => m.CipherDecoderTool),
  "meta-tag-generator": lazyTool(miscTools, (m) => m.MetaTagGeneratorTool),
  "tailwind-cheatsheet": lazyTool(miscTools, (m) => m.TailwindCheatsheetTool),
};

export const CUSTOM_TOOL_TEST_IDS: Record<string, string> = {
  excalidraw: "excalidraw-canvas",
  "todo-list": "todo-list",
  "kanban-board": "kanban-board",
  pomodoro: "pomodoro-timer",
  "quick-notes": "quick-notes",
  stopwatch: "stopwatch",
  "habit-tracker": "habit-tracker",

  "palette-generator": "palette-generator",
  "palette-collection": "palette-collection",
  "palette-extractor": "palette-extractor",
  "pixel-picker": "pixel-picker",
  "colorblind-sim": "colorblind-sim",
  "contrast-checker": "contrast-checker",
  "gradient-generator": "gradient-generator",
  "harmony-generator": "harmony-generator",
  "tailwind-shades": "tailwind-shades",

  "image-editor": "image-editor",
  "background-remover": "background-remover",
  "artwork-enhancer": "artwork-enhancer",
  "favicon-generator": "favicon-generator",
  "image-clipper": "image-clipper",
  "image-converter": "image-converter",
  "image-splitter": "image-splitter",
  "image-stitcher": "image-stitcher",
  "image-tracer": "image-tracer",
  "paste-image": "paste-image",
  "placeholder-generator": "placeholder-generator",
  "matte-generator": "matte-generator",
  "scroll-generator": "scroll-generator",
  "social-cropper": "social-cropper",
  watermarker: "watermarker",

  "doc-converter": "doc-converter",
  "font-explorer": "font-explorer",
  "glyph-browser": "glyph-browser",
  "large-type": "large-type",
  "line-height-calc": "line-height-calc",
  "paper-sizes": "paper-sizes",
  "px-to-rem": "px-to-rem",
  "markdown-editor": "markdown-editor",
  "text-scratchpad": "text-scratchpad",
  "typo-calc": "typo-calc",
  "word-counter": "word-counter",
  "shavian-transliterator": "shavian-transliterator",

  "pdf-preflight": "pdf-preflight",
  "print-imposer": "print-imposer",
  "zine-imposer": "zine-imposer",

  "sci-calc": "sci-calc",
  "graph-calc": "graph-calc",
  "algebra-calc": "algebra-calc",
  "time-calc": "time-calc",
  "unit-converter": "unit-converter",

  "barcode-generator": "barcode-generator",
  "qr-styled": "qr-styled",
  "cipher-decoder": "cipher-decoder",
  "meta-tag-generator": "meta-tag-generator",
  "tailwind-cheatsheet": "tailwind-cheatsheet",
};
