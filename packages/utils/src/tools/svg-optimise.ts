import type { ToolResult } from "../types";

interface OptimiseOptions {
  precision?: number;
  removeComments?: boolean;
  removeMetadata?: boolean;
  removeDimensions?: boolean;
  collapseWhitespace?: boolean;
}

/** Attributes that never affect rendering and are safe to drop wholesale. */
const JUNK_ATTRS = [
  "inkscape:[\\w-]+",
  "sodipodi:[\\w-]+",
  "sketch:[\\w-]+",
  "figma:[\\w-]+",
  "xmlns:inkscape",
  "xmlns:sodipodi",
  "xmlns:sketch",
  "xmlns:figma",
  "xmlns:serif",
  "serif:[\\w-]+",
  "data-name",
  "enable-background",
];

const JUNK_ELEMENTS = ["metadata", "sodipodi:namedview", "title", "desc"];

/** Round every number in a path/transform string to `precision` decimals. */
function roundNumbers(value: string, precision: number): string {
  return value.replace(/-?\d*\.\d+(?:e[+-]?\d+)?/gi, (match) => {
    const n = Number(match);
    if (!Number.isFinite(n)) return match;
    const rounded = Number(n.toFixed(precision));
    return String(rounded);
  });
}

export function optimiseSvg(input: string, options: OptimiseOptions = {}): ToolResult {
  const {
    precision = 2,
    removeComments = true,
    removeMetadata = true,
    removeDimensions = false,
    collapseWhitespace = true,
  } = options;

  const source = input.trim();
  if (!source.includes("<svg")) {
    return { output: "", error: "Input does not look like an SVG document." };
  }

  let svg = source;
  const originalBytes = new TextEncoder().encode(source).length;

  if (removeComments) svg = svg.replace(/<!--[\s\S]*?-->/g, "");
  svg = svg.replace(/<\?xml[\s\S]*?\?>/g, "");
  svg = svg.replace(/<!DOCTYPE[^>]*>/gi, "");

  if (removeMetadata) {
    for (const el of JUNK_ELEMENTS) {
      const tag = el.replace(":", "\\:");
      svg = svg.replace(new RegExp(`<${tag}[\\s\\S]*?</${tag}>`, "gi"), "");
      svg = svg.replace(new RegExp(`<${tag}[^>]*/>`, "gi"), "");
    }
    for (const attr of JUNK_ATTRS) {
      svg = svg.replace(new RegExp(`\\s${attr}\\s*=\\s*"[^"]*"`, "gi"), "");
      svg = svg.replace(new RegExp(`\\s${attr}\\s*=\\s*'[^']*'`, "gi"), "");
    }
  }

  // Empty defs/groups left behind by editors.
  svg = svg.replace(/<defs\s*>\s*<\/defs>/gi, "");
  svg = svg.replace(/<g\s*>\s*<\/g>/gi, "");

  if (removeDimensions) {
    // Only safe when a viewBox is present to carry the aspect ratio.
    if (/viewBox\s*=/.test(svg)) {
      svg = svg.replace(/(<svg[^>]*?)\s+width\s*=\s*"[^"]*"/i, "$1");
      svg = svg.replace(/(<svg[^>]*?)\s+height\s*=\s*"[^"]*"/i, "$1");
    }
  }

  // Round coordinates in the attributes where numbers actually pile up.
  svg = svg.replace(/\s(d|points|transform|viewBox)\s*=\s*"([^"]*)"/gi, (_m, attr, value) => {
    let v = roundNumbers(value, precision);
    if (attr.toLowerCase() === "d" || attr.toLowerCase() === "points") {
      v = v.replace(/\s+/g, " ").replace(/\s*,\s*/g, ",").trim();
    }
    return ` ${attr}="${v}"`;
  });

  svg = svg.replace(/\s(x|y|cx|cy|r|rx|ry|width|height|x1|x2|y1|y2|stroke-width|opacity|offset)\s*=\s*"([^"]*)"/gi,
    (_m, attr, value) => ` ${attr}="${roundNumbers(value, precision)}"`
  );

  // Collapse #aabbcc → #abc where the pairs repeat.
  svg = svg.replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3\b/gi, "#$1$2$3");

  if (collapseWhitespace) {
    svg = svg
      .replace(/>\s+</g, "><")
      .replace(/\s{2,}/g, " ")
      .replace(/\s+\/>/g, "/>")
      .trim();
  }

  const optimisedBytes = new TextEncoder().encode(svg).length;
  const saved = originalBytes - optimisedBytes;
  const percent = originalBytes > 0 ? (saved / originalBytes) * 100 : 0;

  return {
    output: svg,
    language: "xml",
    meta: {
      originalBytes,
      optimisedBytes,
      saved,
      percent: Number(percent.toFixed(1)),
    },
  };
}
