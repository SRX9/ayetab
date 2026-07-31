/**
 * Shared colour maths for the colour tools. Everything is plain functions on
 * `{ r, g, b }` in 0–255 so the UI layer can stay presentational.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export interface Hsl {
  h: number;
  s: number;
  l: number;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function clamp255(n: number): number {
  return clamp(Math.round(n), 0, 255);
}

export function hexToRgb(hex: string): Rgb | null {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3 || h.length === 4) {
    h = h
      .slice(0, 3)
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (h.length === 8) h = h.slice(0, 6);
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const to = (n: number) => clamp255(n).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  const l = (max + min) / 2;

  if (d === 0) return { h: 0, s: 0, l: l * 100 };

  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h *= 60;
  if (h < 0) h += 360;

  return { h, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const hn = ((h % 360) + 360) % 360;
  const sn = clamp(s, 0, 100) / 100;
  const ln = clamp(l, 0, 100) / 100;

  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((hn / 60) % 2) - 1));
  const m = ln - c / 2;

  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (hn < 60) [rp, gp, bp] = [c, x, 0];
  else if (hn < 120) [rp, gp, bp] = [x, c, 0];
  else if (hn < 180) [rp, gp, bp] = [0, c, x];
  else if (hn < 240) [rp, gp, bp] = [0, x, c];
  else if (hn < 300) [rp, gp, bp] = [x, 0, c];
  else [rp, gp, bp] = [c, 0, x];

  return { r: clamp255((rp + m) * 255), g: clamp255((gp + m) * 255), b: clamp255((bp + m) * 255) };
}

export function hslToHex(hsl: Hsl): string {
  return rgbToHex(hslToRgb(hsl));
}

/** Parse hex, rgb()/rgba(), or hsl()/hsla() strings. Returns null when unrecognised. */
export function parseColor(value: string): Rgb | null {
  const input = value.trim().toLowerCase();
  if (!input) return null;

  if (input.startsWith("#") || /^[0-9a-f]{3,8}$/.test(input)) {
    const viaHex = hexToRgb(input);
    if (viaHex) return viaHex;
  }

  const rgbMatch = input.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/);
  if (rgbMatch) {
    return {
      r: clamp255(Number(rgbMatch[1])),
      g: clamp255(Number(rgbMatch[2])),
      b: clamp255(Number(rgbMatch[3])),
    };
  }

  const hslMatch = input.match(/^hsla?\(\s*([\d.-]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%/);
  if (hslMatch) {
    return hslToRgb({ h: Number(hslMatch[1]), s: Number(hslMatch[2]), l: Number(hslMatch[3]) });
  }

  return NAMED_COLORS[input] ? hexToRgb(NAMED_COLORS[input]) : null;
}

export const NAMED_COLORS: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
  red: "#ff0000",
  lime: "#00ff00",
  blue: "#0000ff",
  yellow: "#ffff00",
  cyan: "#00ffff",
  magenta: "#ff00ff",
  silver: "#c0c0c0",
  gray: "#808080",
  grey: "#808080",
  maroon: "#800000",
  olive: "#808000",
  green: "#008000",
  purple: "#800080",
  teal: "#008080",
  navy: "#000080",
  orange: "#ffa500",
  pink: "#ffc0cb",
  brown: "#a52a2a",
  gold: "#ffd700",
  indigo: "#4b0082",
  violet: "#ee82ee",
  coral: "#ff7f50",
  salmon: "#fa8072",
  crimson: "#dc143c",
  turquoise: "#40e0d0",
  beige: "#f5f5dc",
  ivory: "#fffff0",
  khaki: "#f0e68c",
  lavender: "#e6e6fa",
  plum: "#dda0dd",
  tan: "#d2b48c",
  transparent: "#00000000",
};

// ── Contrast / luminance ────────────────────────────────────────────────────

/** WCAG relative luminance (0–1). */
export function relativeLuminance({ r, g, b }: Rgb): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio between two colours, 1–21. */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const light = Math.max(la, lb);
  const dark = Math.min(la, lb);
  return (light + 0.05) / (dark + 0.05);
}

export interface ContrastVerdict {
  ratio: number;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  aaaLarge: boolean;
  uiComponent: boolean;
}

export function gradeContrast(fg: Rgb, bg: Rgb): ContrastVerdict {
  const ratio = contrastRatio(fg, bg);
  return {
    ratio,
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaNormal: ratio >= 7,
    aaaLarge: ratio >= 4.5,
    uiComponent: ratio >= 3,
  };
}

/** Pick black or white text for the strongest contrast against `bg`. */
export function readableTextOn(bg: Rgb): "#000000" | "#ffffff" {
  return contrastRatio(bg, { r: 0, g: 0, b: 0 }) >= contrastRatio(bg, { r: 255, g: 255, b: 255 })
    ? "#000000"
    : "#ffffff";
}

// ── Harmonies ───────────────────────────────────────────────────────────────

export type HarmonyKind =
  | "complementary"
  | "split-complementary"
  | "analogous"
  | "triadic"
  | "tetradic"
  | "square"
  | "monochromatic";

export const HARMONY_KINDS: HarmonyKind[] = [
  "complementary",
  "split-complementary",
  "analogous",
  "triadic",
  "tetradic",
  "square",
  "monochromatic",
];

export function harmony(base: Rgb, kind: HarmonyKind): string[] {
  const { h, s, l } = rgbToHsl(base);
  const at = (dh: number, dl = 0, ds = 0) =>
    hslToHex({ h: h + dh, s: clamp(s + ds, 0, 100), l: clamp(l + dl, 0, 100) });

  switch (kind) {
    case "complementary":
      return [at(0), at(180)];
    case "split-complementary":
      return [at(0), at(150), at(210)];
    case "analogous":
      return [at(-60), at(-30), at(0), at(30), at(60)];
    case "triadic":
      return [at(0), at(120), at(240)];
    case "tetradic":
      return [at(0), at(60), at(180), at(240)];
    case "square":
      return [at(0), at(90), at(180), at(270)];
    case "monochromatic":
      return [at(0, -30), at(0, -15), at(0), at(0, 15), at(0, 30)];
  }
}

// ── Palette generation ──────────────────────────────────────────────────────

export type PaletteMode = "vibrant" | "pastel" | "muted" | "dark" | "earth" | "neon";

export const PALETTE_MODES: PaletteMode[] = ["vibrant", "pastel", "muted", "dark", "earth", "neon"];

const MODE_RANGES: Record<PaletteMode, { s: [number, number]; l: [number, number] }> = {
  vibrant: { s: [70, 95], l: [45, 60] },
  pastel: { s: [40, 70], l: [78, 88] },
  muted: { s: [18, 38], l: [45, 65] },
  dark: { s: [35, 65], l: [18, 32] },
  earth: { s: [25, 50], l: [35, 60] },
  neon: { s: [90, 100], l: [52, 64] },
};

/**
 * Build a palette around `base` by walking the hue wheel with a golden-angle
 * offset, which spreads hues more pleasantly than an even split.
 */
export function generatePalette(base: Rgb, mode: PaletteMode, count = 5): string[] {
  const { h } = rgbToHsl(base);
  const range = MODE_RANGES[mode];
  const out: string[] = [];

  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : i / (count - 1);
    // Earth tones stay within a narrow warm band; the rest fan out by 137.5°.
    const hue = mode === "earth" ? h + (i - (count - 1) / 2) * 14 : h + i * 137.508;
    const s = range.s[0] + (range.s[1] - range.s[0]) * t;
    const l = range.l[1] - (range.l[1] - range.l[0]) * t;
    out.push(hslToHex({ h: hue, s, l }));
  }

  return out;
}

// ── Tailwind-style scales ───────────────────────────────────────────────────

export const TAILWIND_STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

/**
 * Lightness targets Tailwind's own palettes land on. The seed colour is mapped
 * to whichever stop it is closest to, then the rest are interpolated so the
 * original colour survives untouched in the scale.
 */
const STOP_LIGHTNESS: Record<number, number> = {
  50: 97,
  100: 94,
  200: 86,
  300: 77,
  400: 66,
  500: 56,
  600: 48,
  700: 39,
  800: 32,
  900: 27,
  950: 16,
};

export function tailwindScale(base: Rgb): Array<{ stop: number; hex: string; isSeed: boolean }> {
  const { h, s, l } = rgbToHsl(base);

  const seedStop = TAILWIND_STOPS.reduce((best, stop) =>
    Math.abs(STOP_LIGHTNESS[stop] - l) < Math.abs(STOP_LIGHTNESS[best] - l) ? stop : best
  );

  return TAILWIND_STOPS.map((stop) => {
    if (stop === seedStop) return { stop, hex: rgbToHex(base), isSeed: true };

    const targetL = STOP_LIGHTNESS[stop];
    // Ease saturation down at the extremes so the light/dark ends don't scream.
    const distance = Math.abs(targetL - l) / 100;
    const satAdjust = stop <= 100 || stop >= 900 ? 1 - distance * 0.35 : 1 + distance * 0.1;

    return {
      stop,
      hex: hslToHex({ h, s: clamp(s * satAdjust, 0, 100), l: targetL }),
      isSeed: false,
    };
  });
}

// ── Colour blindness simulation ─────────────────────────────────────────────

export type ColorBlindnessType =
  | "protanopia"
  | "protanomaly"
  | "deuteranopia"
  | "deuteranomaly"
  | "tritanopia"
  | "tritanomaly"
  | "achromatopsia"
  | "achromatomaly";

export const COLOR_BLINDNESS_TYPES: Array<{ id: ColorBlindnessType; label: string; note: string }> = [
  { id: "protanopia", label: "Protanopia", note: "No red cones — ~1% of men" },
  { id: "protanomaly", label: "Protanomaly", note: "Weak red cones — ~1% of men" },
  { id: "deuteranopia", label: "Deuteranopia", note: "No green cones — ~1% of men" },
  { id: "deuteranomaly", label: "Deuteranomaly", note: "Weak green cones — ~6% of men" },
  { id: "tritanopia", label: "Tritanopia", note: "No blue cones — very rare" },
  { id: "tritanomaly", label: "Tritanomaly", note: "Weak blue cones — very rare" },
  { id: "achromatopsia", label: "Achromatopsia", note: "No colour vision — very rare" },
  { id: "achromatomaly", label: "Achromatomaly", note: "Partial colour vision — very rare" },
];

/** Row-major 3x3 RGB transform matrices (Machado/Brettel style approximations). */
const CB_MATRICES: Record<ColorBlindnessType, number[]> = {
  protanopia: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758],
  protanomaly: [0.817, 0.183, 0, 0.333, 0.667, 0, 0, 0.125, 0.875],
  deuteranopia: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7],
  deuteranomaly: [0.8, 0.2, 0, 0.258, 0.742, 0, 0, 0.142, 0.858],
  tritanopia: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525],
  tritanomaly: [0.967, 0.033, 0, 0, 0.733, 0.267, 0, 0.183, 0.817],
  achromatopsia: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114],
  achromatomaly: [0.618, 0.320, 0.062, 0.163, 0.775, 0.062, 0.163, 0.320, 0.516],
};

export function simulateColorBlindness(rgb: Rgb, type: ColorBlindnessType): Rgb {
  const m = CB_MATRICES[type];
  return {
    r: clamp255(rgb.r * m[0] + rgb.g * m[1] + rgb.b * m[2]),
    g: clamp255(rgb.r * m[3] + rgb.g * m[4] + rgb.b * m[5]),
    b: clamp255(rgb.r * m[6] + rgb.g * m[7] + rgb.b * m[8]),
  };
}

/** In-place simulation over a canvas pixel buffer. */
export function simulateImageData(data: Uint8ClampedArray, type: ColorBlindnessType): void {
  const m = CB_MATRICES[type];
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    data[i] = clamp255(r * m[0] + g * m[1] + b * m[2]);
    data[i + 1] = clamp255(r * m[3] + g * m[4] + b * m[5]);
    data[i + 2] = clamp255(r * m[6] + g * m[7] + b * m[8]);
  }
}

// ── Quantisation (palette extraction) ───────────────────────────────────────

interface Box {
  pixels: Rgb[];
  channel: "r" | "g" | "b";
  range: number;
}

function boxFor(pixels: Rgb[]): Box {
  let rMin = 255;
  let rMax = 0;
  let gMin = 255;
  let gMax = 0;
  let bMin = 255;
  let bMax = 0;

  for (const p of pixels) {
    if (p.r < rMin) rMin = p.r;
    if (p.r > rMax) rMax = p.r;
    if (p.g < gMin) gMin = p.g;
    if (p.g > gMax) gMax = p.g;
    if (p.b < bMin) bMin = p.b;
    if (p.b > bMax) bMax = p.b;
  }

  const dr = rMax - rMin;
  const dg = gMax - gMin;
  const db = bMax - bMin;
  const range = Math.max(dr, dg, db);
  const channel = range === dr ? "r" : range === dg ? "g" : "b";

  return { pixels, channel, range };
}

/**
 * Median-cut quantisation. Returns `count` representative colours ordered by
 * how much of the image they cover.
 */
export function quantize(pixels: Rgb[], count: number): Array<{ hex: string; share: number }> {
  if (pixels.length === 0) return [];

  let boxes: Box[] = [boxFor(pixels)];

  while (boxes.length < count) {
    boxes.sort((a, b) => b.range * b.pixels.length - a.range * a.pixels.length);
    const target = boxes.shift();
    if (!target || target.pixels.length < 2) {
      if (target) boxes.push(target);
      break;
    }

    const ch = target.channel;
    const sorted = [...target.pixels].sort((a, b) => a[ch] - b[ch]);
    const mid = Math.floor(sorted.length / 2);
    boxes.push(boxFor(sorted.slice(0, mid)), boxFor(sorted.slice(mid)));
  }

  const total = pixels.length;
  return boxes
    .filter((b) => b.pixels.length > 0)
    .map((b) => {
      let r = 0;
      let g = 0;
      let bl = 0;
      for (const p of b.pixels) {
        r += p.r;
        g += p.g;
        bl += p.b;
      }
      const n = b.pixels.length;
      return { hex: rgbToHex({ r: r / n, g: g / n, b: bl / n }), share: n / total };
    })
    .sort((a, b) => b.share - a.share);
}

// ── Formatting ──────────────────────────────────────────────────────────────

export function formatColor(rgb: Rgb, format: "hex" | "rgb" | "hsl" | "oklch"): string {
  switch (format) {
    case "hex":
      return rgbToHex(rgb);
    case "rgb":
      return `rgb(${clamp255(rgb.r)} ${clamp255(rgb.g)} ${clamp255(rgb.b)})`;
    case "hsl": {
      const { h, s, l } = rgbToHsl(rgb);
      return `hsl(${h.toFixed(0)} ${s.toFixed(0)}% ${l.toFixed(0)}%)`;
    }
    case "oklch": {
      const { l, c, h } = rgbToOklch(rgb);
      return `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(3)} ${h.toFixed(1)})`;
    }
  }
}

/** sRGB → Oklch, via linear sRGB and the LMS cone space. */
export function rgbToOklch({ r, g, b }: Rgb): { l: number; c: number; h: number } {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const rl = lin(r);
  const gl = lin(g);
  const bl = lin(b);

  const l = Math.cbrt(0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl);
  const m = Math.cbrt(0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl);
  const s = Math.cbrt(0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl);

  const okL = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const okA = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const okB = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const c = Math.sqrt(okA * okA + okB * okB);
  let h = (Math.atan2(okB, okA) * 180) / Math.PI;
  if (h < 0) h += 360;

  return { l: okL, c, h };
}
