import type { PointerEvent } from "react";
import type { LoadedImage } from "./shared";

export type Tool = "select" | "crop" | "pen" | "line" | "arrow" | "rect" | "ellipse" | "text" | "blur";

export interface Shape {
  id: string;
  tool: Tool;
  color: string;
  width: number;
  points: Array<{ x: number; y: number }>;
  text?: string;
  filled?: boolean;
}

export interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: number;
  sepia: number;
  invert: number;
  hue: number;
}

export interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Rotation/flip/filter state shared by the live canvas and the export path. */
export interface SceneTransform {
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  adjust: Adjustments;
}

export const NO_ADJUST: Adjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  invert: 0,
  hue: 0,
};

export const filterString = (a: Adjustments) =>
  [
    `brightness(${a.brightness}%)`,
    `contrast(${a.contrast}%)`,
    `saturate(${a.saturation}%)`,
    `grayscale(${a.grayscale}%)`,
    `sepia(${a.sepia}%)`,
    `invert(${a.invert}%)`,
    `hue-rotate(${a.hue}deg)`,
    a.blur > 0 ? `blur(${a.blur}px)` : "",
  ]
    .filter(Boolean)
    .join(" ");

export const TOOLS: Array<{ id: Tool; label: string }> = [
  { id: "pen", label: "Pen" },
  { id: "line", label: "Line" },
  { id: "arrow", label: "Arrow" },
  { id: "rect", label: "Box" },
  { id: "ellipse", label: "Ellipse" },
  { id: "text", label: "Text" },
  { id: "blur", label: "Blur" },
  { id: "crop", label: "Crop" },
];

export const toCanvasPoint = (e: PointerEvent<HTMLCanvasElement>) => {
  const canvas = e.currentTarget;
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * canvas.width,
    y: ((e.clientY - rect.top) / rect.height) * canvas.height,
  };
};

/** Draws the source image centred, with rotation, flips and filters applied. */
export function drawTransformedImage(
  ctx: CanvasRenderingContext2D,
  image: LoadedImage,
  outW: number,
  outH: number,
  t: SceneTransform
) {
  ctx.save();
  ctx.translate(outW / 2, outH / 2);
  ctx.rotate((t.rotation * Math.PI) / 180);
  ctx.scale(t.flipH ? -1 : 1, t.flipV ? -1 : 1);
  ctx.filter = filterString(t.adjust);
  ctx.drawImage(image.el, -image.width / 2, -image.height / 2);
  ctx.restore();
}

/** Paints one annotation shape onto the canvas context. */
export function paintShape(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, s: Shape) {
  if (s.points.length === 0) return;
  ctx.save();
  ctx.strokeStyle = s.color;
  ctx.fillStyle = s.color;
  ctx.lineWidth = s.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const [start] = s.points;
  const end = s.points[s.points.length - 1];

  switch (s.tool) {
    case "pen": {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      for (const p of s.points.slice(1)) ctx.lineTo(p.x, p.y);
      ctx.stroke();
      break;
    }
    case "line": {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      break;
    }
    case "arrow": {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      // Head sized relative to the stroke so it scales sensibly.
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const head = Math.max(12, s.width * 3.5);
      ctx.beginPath();
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(end.x - head * Math.cos(angle - Math.PI / 7), end.y - head * Math.sin(angle - Math.PI / 7));
      ctx.lineTo(end.x - head * Math.cos(angle + Math.PI / 7), end.y - head * Math.sin(angle + Math.PI / 7));
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "rect": {
      const w = end.x - start.x;
      const h = end.y - start.y;
      if (s.filled) ctx.fillRect(start.x, start.y, w, h);
      else ctx.strokeRect(start.x, start.y, w, h);
      break;
    }
    case "ellipse": {
      const cx = (start.x + end.x) / 2;
      const cy = (start.y + end.y) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.abs(end.x - start.x) / 2, Math.abs(end.y - start.y) / 2, 0, 0, Math.PI * 2);
      if (s.filled) ctx.fill();
      else ctx.stroke();
      break;
    }
    case "text": {
      ctx.font = `600 ${s.width * 5}px ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif`;
      ctx.textBaseline = "top";
      ctx.shadowColor = "rgba(0,0,0,.4)";
      ctx.shadowBlur = s.width;
      ctx.fillText(s.text ?? "", start.x, start.y);
      break;
    }
    case "blur": {
      // Redraw the source region through a blur filter, clipped to the box.
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const w = Math.abs(end.x - start.x);
      const h = Math.abs(end.y - start.y);
      if (w < 2 || h < 2) break;
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      ctx.filter = `blur(${Math.max(4, s.width * 2)}px)`;
      ctx.drawImage(canvas, 0, 0);
      break;
    }
    default:
      break;
  }
  ctx.restore();
}

/** Normalise so negative drags still produce a valid rectangle. */
export function normalizeCropRect(prev: CropRect): CropRect | null {
  const x = prev.w < 0 ? prev.x + prev.w : prev.x;
  const y = prev.h < 0 ? prev.y + prev.h : prev.y;
  const w = Math.abs(prev.w);
  const h = Math.abs(prev.h);
  return w > 4 && h > 4 ? { x, y, w, h } : null;
}

/** Flatten everything to a canvas, applying the crop box if one is set. */
export function buildExportCanvas(
  source: HTMLCanvasElement | null,
  crop: CropRect | null,
  image: LoadedImage | null,
  t: SceneTransform
): HTMLCanvasElement | null {
  if (!source) return null;
  if (!crop) return source;

  const out = document.createElement("canvas");
  out.width = Math.round(crop.w);
  out.height = Math.round(crop.h);
  const ctx = out.getContext("2d");
  if (!ctx) return source;

  // Re-render without the crop overlay before slicing out the region.
  const clean = document.createElement("canvas");
  clean.width = source.width;
  clean.height = source.height;
  const cctx = clean.getContext("2d");
  if (cctx && image) {
    drawTransformedImage(cctx, image, clean.width, clean.height, t);
  }

  ctx.drawImage(clean, crop.x, crop.y, crop.w, crop.h, 0, 0, out.width, out.height);
  return out;
}
