/**
 * Unit conversion tables and typographic maths.
 *
 * Every non-temperature unit is defined by its ratio to a canonical base unit
 * for its dimension, so conversion is `value * from.ratio / to.ratio`.
 */

export interface Unit {
  id: string;
  label: string;
  symbol: string;
  ratio: number;
}

export interface UnitDimension {
  id: string;
  label: string;
  base: string;
  units: Unit[];
}

const u = (id: string, label: string, symbol: string, ratio: number): Unit => ({
  id,
  label,
  symbol,
  ratio,
});

export const UNIT_DIMENSIONS: UnitDimension[] = [
  {
    id: "length",
    label: "Length",
    base: "metre",
    units: [
      u("nm", "Nanometre", "nm", 1e-9),
      u("um", "Micrometre", "µm", 1e-6),
      u("mm", "Millimetre", "mm", 0.001),
      u("cm", "Centimetre", "cm", 0.01),
      u("m", "Metre", "m", 1),
      u("km", "Kilometre", "km", 1000),
      u("in", "Inch", "in", 0.0254),
      u("ft", "Foot", "ft", 0.3048),
      u("yd", "Yard", "yd", 0.9144),
      u("mi", "Mile", "mi", 1609.344),
      u("nmi", "Nautical mile", "nmi", 1852),
      u("pt", "Point", "pt", 0.0254 / 72),
      u("pc", "Pica", "pc", 0.0254 / 6),
    ],
  },
  {
    id: "mass",
    label: "Mass",
    base: "kilogram",
    units: [
      u("mg", "Milligram", "mg", 1e-6),
      u("g", "Gram", "g", 0.001),
      u("kg", "Kilogram", "kg", 1),
      u("t", "Tonne", "t", 1000),
      u("oz", "Ounce", "oz", 0.028349523125),
      u("lb", "Pound", "lb", 0.45359237),
      u("st", "Stone", "st", 6.35029318),
      u("ton_us", "US ton", "ton", 907.18474),
      u("ton_uk", "UK ton", "long ton", 1016.0469088),
    ],
  },
  {
    id: "area",
    label: "Area",
    base: "square metre",
    units: [
      u("mm2", "Square millimetre", "mm²", 1e-6),
      u("cm2", "Square centimetre", "cm²", 1e-4),
      u("m2", "Square metre", "m²", 1),
      u("ha", "Hectare", "ha", 10000),
      u("km2", "Square kilometre", "km²", 1e6),
      u("in2", "Square inch", "in²", 0.00064516),
      u("ft2", "Square foot", "ft²", 0.09290304),
      u("yd2", "Square yard", "yd²", 0.83612736),
      u("acre", "Acre", "ac", 4046.8564224),
      u("mi2", "Square mile", "mi²", 2589988.110336),
    ],
  },
  {
    id: "volume",
    label: "Volume",
    base: "litre",
    units: [
      u("ml", "Millilitre", "ml", 0.001),
      u("l", "Litre", "l", 1),
      u("m3", "Cubic metre", "m³", 1000),
      u("tsp", "Teaspoon (US)", "tsp", 0.00492892159375),
      u("tbsp", "Tablespoon (US)", "tbsp", 0.01478676478125),
      u("floz_us", "Fluid ounce (US)", "fl oz", 0.0295735295625),
      u("cup", "Cup (US)", "cup", 0.2365882365),
      u("pt_us", "Pint (US)", "pt", 0.473176473),
      u("qt_us", "Quart (US)", "qt", 0.946352946),
      u("gal_us", "Gallon (US)", "gal", 3.785411784),
      u("floz_uk", "Fluid ounce (UK)", "fl oz", 0.0284130625),
      u("pt_uk", "Pint (UK)", "pt", 0.56826125),
      u("gal_uk", "Gallon (UK)", "gal", 4.54609),
    ],
  },
  {
    id: "data",
    label: "Data",
    base: "byte",
    units: [
      u("bit", "Bit", "b", 0.125),
      u("byte", "Byte", "B", 1),
      u("kb", "Kilobyte", "kB", 1000),
      u("kib", "Kibibyte", "KiB", 1024),
      u("mb", "Megabyte", "MB", 1e6),
      u("mib", "Mebibyte", "MiB", 1024 ** 2),
      u("gb", "Gigabyte", "GB", 1e9),
      u("gib", "Gibibyte", "GiB", 1024 ** 3),
      u("tb", "Terabyte", "TB", 1e12),
      u("tib", "Tebibyte", "TiB", 1024 ** 4),
      u("pb", "Petabyte", "PB", 1e15),
    ],
  },
  {
    id: "speed",
    label: "Speed",
    base: "metre per second",
    units: [
      u("mps", "Metres per second", "m/s", 1),
      u("kmh", "Kilometres per hour", "km/h", 1 / 3.6),
      u("mph", "Miles per hour", "mph", 0.44704),
      u("fps", "Feet per second", "ft/s", 0.3048),
      u("knot", "Knot", "kn", 0.514444444),
      u("mach", "Mach (sea level)", "M", 340.29),
    ],
  },
  {
    id: "time",
    label: "Time",
    base: "second",
    units: [
      u("ms", "Millisecond", "ms", 0.001),
      u("s", "Second", "s", 1),
      u("min", "Minute", "min", 60),
      u("h", "Hour", "h", 3600),
      u("d", "Day", "d", 86400),
      u("wk", "Week", "wk", 604800),
      u("mo", "Month (30d)", "mo", 2592000),
      u("yr", "Year (365d)", "yr", 31536000),
    ],
  },
  {
    id: "angle",
    label: "Angle",
    base: "degree",
    units: [
      u("deg", "Degree", "°", 1),
      u("rad", "Radian", "rad", 180 / Math.PI),
      u("grad", "Gradian", "grad", 0.9),
      u("turn", "Turn", "turn", 360),
      u("arcmin", "Arcminute", "′", 1 / 60),
      u("arcsec", "Arcsecond", "″", 1 / 3600),
    ],
  },
  {
    id: "pressure",
    label: "Pressure",
    base: "pascal",
    units: [
      u("pa", "Pascal", "Pa", 1),
      u("kpa", "Kilopascal", "kPa", 1000),
      u("bar", "Bar", "bar", 100000),
      u("atm", "Atmosphere", "atm", 101325),
      u("psi", "Pound per sq. inch", "psi", 6894.757293168),
      u("mmhg", "Millimetre of mercury", "mmHg", 133.322387415),
    ],
  },
];

/** Temperature is affine, not a simple ratio, so it gets its own converter. */
export const TEMPERATURE_UNITS = [
  { id: "c", label: "Celsius", symbol: "°C" },
  { id: "f", label: "Fahrenheit", symbol: "°F" },
  { id: "k", label: "Kelvin", symbol: "K" },
  { id: "r", label: "Rankine", symbol: "°R" },
] as const;

export type TemperatureUnit = (typeof TEMPERATURE_UNITS)[number]["id"];

export function convertTemperature(value: number, from: TemperatureUnit, to: TemperatureUnit): number {
  // Normalise to Celsius, then out.
  let c: number;
  switch (from) {
    case "c": c = value; break;
    case "f": c = (value - 32) * (5 / 9); break;
    case "k": c = value - 273.15; break;
    case "r": c = (value - 491.67) * (5 / 9); break;
  }

  switch (to) {
    case "c": return c;
    case "f": return c * (9 / 5) + 32;
    case "k": return c + 273.15;
    case "r": return (c + 273.15) * (9 / 5);
  }
}

export function convertUnit(value: number, from: Unit, to: Unit): number {
  return (value * from.ratio) / to.ratio;
}

/** Trim float noise without losing precision on very large/small numbers. */
export function formatUnitValue(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e15 || abs < 1e-6) return n.toExponential(6).replace(/e([+-])(\d)$/, "e$10$2");
  const decimals = abs >= 1000 ? 2 : abs >= 1 ? 4 : 8;
  return String(Number(n.toFixed(decimals)));
}

// ── Typographic units ───────────────────────────────────────────────────────

export interface TypoUnits {
  px: number;
  pt: number;
  pc: number;
  em: number;
  rem: number;
  percent: number;
  mm: number;
  cm: number;
  in: number;
  ex: number;
  ch: number;
}

export type TypoUnitId = keyof TypoUnits;

export const TYPO_UNIT_LABELS: Record<TypoUnitId, string> = {
  px: "Pixels",
  pt: "Points",
  pc: "Picas",
  em: "Em",
  rem: "Rem",
  percent: "Percent",
  mm: "Millimetres",
  cm: "Centimetres",
  in: "Inches",
  ex: "Ex (x-height)",
  ch: "Ch (0 width)",
};

/**
 * Convert a typographic value across every unit at once.
 *
 * `rootSize` is the document root font size and `parentSize` is the font size
 * of the element's parent, which is what `em` and `%` resolve against.
 * `ex` and `ch` use the usual 0.5em / 0.5em approximations since the real
 * values are font-specific.
 */
export function convertTypoUnits(
  value: number,
  unit: TypoUnitId,
  rootSize = 16,
  parentSize = 16,
  dpi = 96
): TypoUnits {
  // Everything goes through pixels.
  let px: number;
  switch (unit) {
    case "px": px = value; break;
    case "pt": px = (value / 72) * dpi; break;
    case "pc": px = (value / 6) * dpi; break;
    case "em": px = value * parentSize; break;
    case "rem": px = value * rootSize; break;
    case "percent": px = (value / 100) * parentSize; break;
    case "mm": px = (value / 25.4) * dpi; break;
    case "cm": px = (value / 2.54) * dpi; break;
    case "in": px = value * dpi; break;
    case "ex": px = value * parentSize * 0.5; break;
    case "ch": px = value * parentSize * 0.5; break;
  }

  return {
    px,
    pt: (px / dpi) * 72,
    pc: (px / dpi) * 6,
    em: px / parentSize,
    rem: px / rootSize,
    percent: (px / parentSize) * 100,
    mm: (px / dpi) * 25.4,
    cm: (px / dpi) * 2.54,
    in: px / dpi,
    ex: px / (parentSize * 0.5),
    ch: px / (parentSize * 0.5),
  };
}

// ── Paper sizes ─────────────────────────────────────────────────────────────

export interface PaperSize {
  name: string;
  series: string;
  mm: [number, number];
}

const ISO_A: PaperSize[] = [
  { name: "4A0", series: "ISO A", mm: [1682, 2378] },
  { name: "2A0", series: "ISO A", mm: [1189, 1682] },
  { name: "A0", series: "ISO A", mm: [841, 1189] },
  { name: "A1", series: "ISO A", mm: [594, 841] },
  { name: "A2", series: "ISO A", mm: [420, 594] },
  { name: "A3", series: "ISO A", mm: [297, 420] },
  { name: "A4", series: "ISO A", mm: [210, 297] },
  { name: "A5", series: "ISO A", mm: [148, 210] },
  { name: "A6", series: "ISO A", mm: [105, 148] },
  { name: "A7", series: "ISO A", mm: [74, 105] },
  { name: "A8", series: "ISO A", mm: [52, 74] },
];

const ISO_B: PaperSize[] = [
  { name: "B0", series: "ISO B", mm: [1000, 1414] },
  { name: "B1", series: "ISO B", mm: [707, 1000] },
  { name: "B2", series: "ISO B", mm: [500, 707] },
  { name: "B3", series: "ISO B", mm: [353, 500] },
  { name: "B4", series: "ISO B", mm: [250, 353] },
  { name: "B5", series: "ISO B", mm: [176, 250] },
  { name: "B6", series: "ISO B", mm: [125, 176] },
  { name: "B7", series: "ISO B", mm: [88, 125] },
];

const ISO_C: PaperSize[] = [
  { name: "C0", series: "ISO C", mm: [917, 1297] },
  { name: "C1", series: "ISO C", mm: [648, 917] },
  { name: "C2", series: "ISO C", mm: [458, 648] },
  { name: "C3", series: "ISO C", mm: [324, 458] },
  { name: "C4", series: "ISO C", mm: [229, 324] },
  { name: "C5", series: "ISO C", mm: [162, 229] },
  { name: "C6", series: "ISO C", mm: [114, 162] },
  { name: "C7", series: "ISO C", mm: [81, 114] },
  { name: "DL", series: "ISO C", mm: [110, 220] },
];

const US: PaperSize[] = [
  { name: "Letter", series: "US", mm: [215.9, 279.4] },
  { name: "Legal", series: "US", mm: [215.9, 355.6] },
  { name: "Junior Legal", series: "US", mm: [127, 203.2] },
  { name: "Ledger / Tabloid", series: "US", mm: [279.4, 431.8] },
  { name: "Executive", series: "US", mm: [184.15, 266.7] },
  { name: "Half Letter", series: "US", mm: [139.7, 215.9] },
  { name: "ANSI A", series: "US", mm: [215.9, 279.4] },
  { name: "ANSI B", series: "US", mm: [279.4, 431.8] },
  { name: "ANSI C", series: "US", mm: [431.8, 558.8] },
  { name: "ANSI D", series: "US", mm: [558.8, 863.6] },
  { name: "ANSI E", series: "US", mm: [863.6, 1117.6] },
];

const PHOTO: PaperSize[] = [
  { name: '4" × 6"', series: "Photo", mm: [101.6, 152.4] },
  { name: '5" × 7"', series: "Photo", mm: [127, 177.8] },
  { name: '8" × 10"', series: "Photo", mm: [203.2, 254] },
  { name: 'Square 8"', series: "Photo", mm: [203.2, 203.2] },
];

const BOOK: PaperSize[] = [
  { name: "Mass market", series: "Book", mm: [106, 171] },
  { name: "Trade paperback", series: "Book", mm: [140, 216] },
  { name: "Digest", series: "Book", mm: [140, 216] },
  { name: "US Trade", series: "Book", mm: [152, 229] },
  { name: "Royal", series: "Book", mm: [156, 234] },
  { name: "Crown Quarto", series: "Book", mm: [189, 246] },
];

const CARD: PaperSize[] = [
  { name: "Business card (US)", series: "Card", mm: [88.9, 50.8] },
  { name: "Business card (EU)", series: "Card", mm: [85, 55] },
  { name: "Credit card (ID-1)", series: "Card", mm: [85.6, 53.98] },
  { name: "Postcard (A6)", series: "Card", mm: [105, 148] },
];

export const PAPER_SIZES: PaperSize[] = [...ISO_A, ...ISO_B, ...ISO_C, ...US, ...PHOTO, ...BOOK, ...CARD];

export const PAPER_SERIES = ["ISO A", "ISO B", "ISO C", "US", "Photo", "Book", "Card"];

export function paperDimensions(size: PaperSize, dpi = 300) {
  const [wMm, hMm] = size.mm;
  return {
    mm: [wMm, hMm] as [number, number],
    cm: [wMm / 10, hMm / 10] as [number, number],
    in: [wMm / 25.4, hMm / 25.4] as [number, number],
    pt: [(wMm / 25.4) * 72, (hMm / 25.4) * 72] as [number, number],
    px: [Math.round((wMm / 25.4) * dpi), Math.round((hMm / 25.4) * dpi)] as [number, number],
    ratio: hMm / wMm,
  };
}
