"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  COLOR_BLINDNESS_TYPES,
  formatColor,
  parseColor,
  quantize,
  rgbToHex,
  simulateImageData,
  type ColorBlindnessType,
  type Rgb,
} from "@ayetab/utils";
import { ToolShell } from "../tool-shell";
import { Button } from "../button";
import { cn } from "../../lib/utils";
import { useClipboard } from "../../hooks/use-clipboard";
import {
  CopyButton,
  CustomToolProps,
  Dropzone,
  ErrorNote,
  Field,
  NumberInput,
  Panel,
  Range,
  Segmented,
  Select,
  StatRow,
  Swatch,
  ToolActions,
  baseName,
  downloadCanvas,
  downloadText,
  formatBytes,
  useImageUpload,
} from "./shared";

/** Downscale into an offscreen canvas so pixel work stays cheap. */
function sampleCanvas(img: HTMLImageElement, maxSide: number) {
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, w, h);
  return { canvas, ctx, width: w, height: h };
}

// ── Palette Extractor ───────────────────────────────────────────────────────

export function PaletteExtractorTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const { image, error, accept, clear } = useImageUpload();
  const [count, setCount] = useState(6);
  const [ignoreNearWhite, setIgnoreNearWhite] = useState(false);
  const [format, setFormat] = useState<"hex" | "rgb" | "hsl" | "oklch">("hex");

  const palette = useMemo(() => {
    if (!image) return [];
    const sampled = sampleCanvas(image.el, 320);
    if (!sampled) return [];

    const { data } = sampled.ctx.getImageData(0, 0, sampled.width, sampled.height);
    const pixels: Rgb[] = [];

    // Step through pixels rather than reading all of them — plenty for k-cut.
    for (let i = 0; i < data.length; i += 4 * 2) {
      const a = data[i + 3];
      if (a < 125) continue;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (ignoreNearWhite && r > 244 && g > 244 && b > 244) continue;
      pixels.push({ r, g, b });
    }

    return quantize(pixels, Math.max(2, Math.min(16, count)));
  }, [image, count, ignoreNearWhite]);

  const hexes = palette.map((p) => p.hex);

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={clear}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={hexes.length > 0 && <CopyButton text={hexes.join(", ")} label="Copy all" />}
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="palette-extractor">
        {error && <ErrorNote>{error}</ErrorNote>}

        {!image ? (
          <Dropzone onFiles={(f) => void accept([...f][0])} label="Drop an image to pull its palette" />
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
              <Panel className="flex items-center justify-center p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.name}
                  className="max-h-[22rem] w-auto rounded-md object-contain"
                />
              </Panel>

              <div className="flex flex-col gap-3">
                <Panel title="Settings">
                  <div className="flex flex-col gap-3">
                    <Field label="Colours">
                      <Range value={count} onChange={setCount} min={2} max={16} />
                    </Field>
                    <Field label="Format">
                      <Select
                        value={format}
                        onChange={setFormat}
                        options={[
                          { value: "hex", label: "HEX" },
                          { value: "rgb", label: "RGB" },
                          { value: "hsl", label: "HSL" },
                          { value: "oklch", label: "OKLCH" },
                        ]}
                      />
                    </Field>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIgnoreNearWhite((v) => !v)}
                      className={cn(ignoreNearWhite && "border-brand text-brand")}
                    >
                      {ignoreNearWhite ? "Including" : "Ignoring"} near-white pixels
                    </Button>
                  </div>
                </Panel>

                <Panel title="Source">
                  <StatRow label="Dimensions" value={`${image.width} × ${image.height}`} />
                  <StatRow label="File size" value={formatBytes(image.size)} />
                  <StatRow label="Type" value={image.type} />
                </Panel>
              </div>
            </div>

            <Panel title={`Palette · ${palette.length} colours`}>
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: "repeat(auto-fit, minmax(6.5rem, 1fr))" }}
              >
                {palette.map((p) => {
                  const rgb = parseColor(p.hex);
                  return (
                    <Swatch
                      key={p.hex}
                      color={p.hex}
                      label={rgb ? formatColor(rgb, format) : p.hex}
                      sublabel={`${(p.share * 100).toFixed(1)}%`}
                      height="h-24"
                    />
                  );
                })}
              </div>
            </Panel>
          </>
        )}
      </div>
    </ToolShell>
  );
}

// ── Pixel Picker ────────────────────────────────────────────────────────────

const LOUPE_SIZE = 132;

export function PixelPickerTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const { image, error, accept, clear } = useImageUpload();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loupeRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<{ x: number; y: number; hex: string } | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [zoom, setZoom] = useState(8);
  const [format, setFormat] = useState<"hex" | "rgb" | "hsl" | "oklch">("hex");
  const { copy } = useClipboard(1200);

  // Paint the source image once per upload.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx?.drawImage(image.el, 0, 0);
  }, [image]);

  const readAt = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((clientY - rect.top) / rect.height) * canvas.height);
    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return null;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
    return { x, y, hex: rgbToHex({ r, g, b }) };
  }, []);

  const paintLoupe = useCallback(
    (x: number, y: number) => {
      const source = canvasRef.current;
      const loupe = loupeRef.current;
      if (!source || !loupe) return;
      const ctx = loupe.getContext("2d");
      if (!ctx) return;

      const span = Math.round(LOUPE_SIZE / zoom);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, LOUPE_SIZE, LOUPE_SIZE);
      ctx.drawImage(
        source,
        x - span / 2,
        y - span / 2,
        span,
        span,
        0,
        0,
        LOUPE_SIZE,
        LOUPE_SIZE
      );

      // Crosshair over the sampled pixel.
      const mid = LOUPE_SIZE / 2;
      ctx.strokeStyle = "rgba(255,255,255,.9)";
      ctx.lineWidth = 1;
      ctx.strokeRect(mid - zoom / 2, mid - zoom / 2, zoom, zoom);
      ctx.strokeStyle = "rgba(0,0,0,.75)";
      ctx.strokeRect(mid - zoom / 2 - 1, mid - zoom / 2 - 1, zoom + 2, zoom + 2);
    },
    [zoom]
  );

  const pickAt = (clientX: number, clientY: number) => {
    const hit = readAt(clientX, clientY);
    if (!hit) return;
    setPicked((prev) => (prev.includes(hit.hex) ? prev : [hit.hex, ...prev].slice(0, 24)));
    void copy(hit.hex);
  };

  const hoverRgb = hover ? parseColor(hover.hex) : null;

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => {
            clear();
            setPicked([]);
            setHover(null);
          }}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={picked.length > 0 && <CopyButton text={picked.join(", ")} label="Copy picks" />}
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="pixel-picker">
        {error && <ErrorNote>{error}</ErrorNote>}

        {!image ? (
          <Dropzone onFiles={(f) => void accept([...f][0])} label="Drop an image to sample colours" />
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-[1fr_15rem]">
              <Panel className="relative overflow-hidden p-2">
                <canvas
                  ref={canvasRef}
                  className="w-full cursor-crosshair rounded-md"
                  style={{ imageRendering: "pixelated" }}
                  role="button"
                  tabIndex={0}
                  aria-label="Sample a colour from the image"
                  onMouseMove={(e) => {
                    const hit = readAt(e.clientX, e.clientY);
                    if (hit) {
                      setHover(hit);
                      paintLoupe(hit.x, hit.y);
                    }
                  }}
                  onMouseLeave={() => setHover(null)}
                  onClick={(e) => pickAt(e.clientX, e.clientY)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" && e.key !== " ") return;
                    e.preventDefault();
                    // No pointer position on the keyboard, so sample the centre.
                    const rect = e.currentTarget.getBoundingClientRect();
                    pickAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
                  }}
                />
              </Panel>

              <div className="flex flex-col gap-3">
                <Panel title="Loupe">
                  <canvas
                    ref={loupeRef}
                    width={LOUPE_SIZE}
                    height={LOUPE_SIZE}
                    className="input-well mx-auto"
                  />
                  <div className="mt-3">
                    <Field label="Zoom">
                      <Range value={zoom} onChange={setZoom} min={2} max={24} format={(v) => `${v}×`} />
                    </Field>
                  </div>
                </Panel>

                <Panel title="Under cursor">
                  {hover && hoverRgb ? (
                    <div className="flex flex-col gap-2">
                      <div
                        className="input-well h-14"
                        style={{ backgroundColor: hover.hex }}
                      />
                      <Select
                        value={format}
                        onChange={setFormat}
                        options={[
                          { value: "hex", label: "HEX" },
                          { value: "rgb", label: "RGB" },
                          { value: "hsl", label: "HSL" },
                          { value: "oklch", label: "OKLCH" },
                        ]}
                      />
                      <p className="text-center font-mono text-ui">{formatColor(hoverRgb, format)}</p>
                      <p className="text-center text-caption text-muted-foreground">
                        x {hover.x} · y {hover.y}
                      </p>
                    </div>
                  ) : (
                    <p className="py-4 text-center text-caption text-muted-foreground">
                      Move over the image, click to keep a colour.
                    </p>
                  )}
                </Panel>
              </div>
            </div>

            {picked.length > 0 && (
              <Panel title={`Picked · ${picked.length}`}>
                <div
                  className="grid gap-2"
                  style={{ gridTemplateColumns: "repeat(auto-fit, minmax(5.5rem, 1fr))" }}
                >
                  {picked.map((hex) => (
                    <Swatch key={hex} color={hex} height="h-16" />
                  ))}
                </div>
              </Panel>
            )}
          </>
        )}
      </div>
    </ToolShell>
  );
}

// ── Colour Blindness Simulator ──────────────────────────────────────────────

const SWATCH_TEST = ["#e63946", "#f4a261", "#e9c46a", "#2a9d8f", "#264653", "#457b9d", "#a8dadc", "#f1faee"];

export function ColorBlindSimTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const { image, error, accept, clear } = useImageUpload();
  const [mode, setMode] = useState<"image" | "swatches">("swatches");
  const [only, setOnly] = useState<ColorBlindnessType | "all">("all");
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  const shownTypes = useMemo(
    () => (only === "all" ? COLOR_BLINDNESS_TYPES : COLOR_BLINDNESS_TYPES.filter((t) => t.id === only)),
    [only]
  );

  // Repaint every simulated canvas whenever the source or selection changes.
  useEffect(() => {
    if (mode !== "image" || !image) return;

    const maxSide = 520;
    const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
    const w = Math.round(image.width * scale);
    const h = Math.round(image.height * scale);

    for (const type of shownTypes) {
      const canvas = canvasRefs.current[type.id];
      if (!canvas) continue;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) continue;
      ctx.drawImage(image.el, 0, 0, w, h);
      const frame = ctx.getImageData(0, 0, w, h);
      simulateImageData(frame.data, type.id);
      ctx.putImageData(frame, 0, 0);
    }
  }, [image, mode, shownTypes]);

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions onClear={clear} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />
      }
    >
      <div className="flex flex-col gap-4" data-testid="colorblind-sim">
        {error && <ErrorNote>{error}</ErrorNote>}

        <div className="flex flex-wrap items-end gap-3">
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: "swatches", label: "Test swatches" },
              { value: "image", label: "My image" },
            ]}
          />
          <Field label="Show">
            <Select
              value={only}
              onChange={setOnly}
              options={[
                { value: "all" as const, label: "All types" },
                ...COLOR_BLINDNESS_TYPES.map((t) => ({ value: t.id, label: t.label })),
              ]}
            />
          </Field>
        </div>

        {mode === "image" && !image ? (
          <Dropzone onFiles={(f) => void accept([...f][0])} label="Drop an image to simulate" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {mode === "swatches" && only === "all" && (
              <Panel title="Normal vision">
                <div className="flex overflow-hidden rounded-lg">
                  {SWATCH_TEST.map((c) => (
                    <div key={c} className="h-16 flex-1" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <p className="mt-2 text-caption text-muted-foreground">Baseline for comparison</p>
              </Panel>
            )}

            {shownTypes.map((type) => (
              <Panel key={type.id} title={type.label}>
                {mode === "swatches" ? (
                  <div className="flex overflow-hidden rounded-lg">
                    {SWATCH_TEST.map((c) => {
                      const rgb = parseColor(c);
                      if (!rgb) return null;
                      // Reuse the pixel path on a 1x1 buffer for a single colour.
                      const buf = new Uint8ClampedArray([rgb.r, rgb.g, rgb.b, 255]);
                      simulateImageData(buf, type.id);
                      return (
                        <div
                          key={c}
                          className="h-16 flex-1"
                          style={{ backgroundColor: rgbToHex({ r: buf[0], g: buf[1], b: buf[2] }) }}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <canvas
                    ref={(el) => {
                      canvasRefs.current[type.id] = el;
                    }}
                    className="w-full rounded-lg"
                  />
                )}
                <p className="mt-2 text-caption text-muted-foreground">{type.note}</p>
                {mode === "image" && image && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      const canvas = canvasRefs.current[type.id];
                      if (canvas) void downloadCanvas(canvas, `${baseName(image.name)}-${type.id}.png`);
                    }}
                  >
                    Download
                  </Button>
                )}
              </Panel>
            ))}
          </div>
        )}
      </div>
    </ToolShell>
  );
}
