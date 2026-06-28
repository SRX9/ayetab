import type { ToolResult } from "../types";

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface Hsl {
  h: number;
  s: number;
  l: number;
}

function parseHex(input: string): Rgb | null {
  const hex = input.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{3,8}$/.test(hex)) return null;

  let r: number, g: number, b: number;
  if (hex.length === 3) {
    r = parseInt(hex[0]! + hex[0], 16);
    g = parseInt(hex[1]! + hex[1], 16);
    b = parseInt(hex[2]! + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  } else {
    return null;
  }
  return { r, g, b };
}

function parseRgb(input: string): Rgb | null {
  const match = input.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (!match) return null;
  return { r: parseInt(match[1]!), g: parseInt(match[2]!), b: parseInt(match[3]!) };
}

function rgbToHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function convertColor(input: string): ToolResult {
  const trimmed = input.trim();
  let rgb: Rgb | null = null;

  if (trimmed.startsWith("#") || /^[0-9a-fA-F]{3,6}$/.test(trimmed)) {
    rgb = parseHex(trimmed);
  } else if (trimmed.toLowerCase().startsWith("rgb")) {
    rgb = parseRgb(trimmed);
  }

  if (!rgb) {
    return { output: "", error: "Could not parse color. Use HEX (#ff0000) or RGB (rgb(255,0,0))." };
  }

  const hex = rgbToHex(rgb);
  const hsl = rgbToHsl(rgb);

  return {
    output: [
      `HEX:  ${hex}`,
      `RGB:  rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      `HSL:  hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    ].join("\n"),
  };
}
