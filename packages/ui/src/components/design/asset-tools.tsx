/// <reference path="../../types/imagetracerjs.d.ts" />
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { rgbToHex, parseColor } from "@ayetab/utils";
import { ToolShell } from "../tool-shell";
import { Button } from "../button";
import { cn } from "../../lib/utils";
import {
  CHECKER_STYLE,
  ColorInput,
  ControlGrid,
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
  Toggle,
  ToolActions,
  baseName,
  canvasToBlob,
  downloadBlob,
  downloadCanvas,
  downloadText,
  formatBytes,
  useImageUpload,
} from "./shared";

// ── Favicon Generator ───────────────────────────────────────────────────────

const FAVICON_SIZES = [16, 32, 48, 64, 96, 128, 180, 192, 256, 512];

/**
 * Build a multi-size .ico by embedding PNGs, which every modern browser reads.
 * The ICO container is a 6-byte header, one 16-byte directory entry per image,
 * then the raw PNG payloads.
 */
async function buildIco(canvases: HTMLCanvasElement[]): Promise<Blob> {
  const pngs = await Promise.all(
    canvases.map(async (c) => new Uint8Array(await (await canvasToBlob(c, "image/png")).arrayBuffer()))
  );

  const headerSize = 6;
  const entrySize = 16;
  const dirSize = headerSize + entrySize * pngs.length;
  const totalSize = dirSize + pngs.reduce((sum, p) => sum + p.length, 0);

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type: icon
  view.setUint16(4, pngs.length, true);

  let offset = dirSize;
  pngs.forEach((png, i) => {
    const size = canvases[i].width;
    const entry = headerSize + i * entrySize;
    // 256px is encoded as 0 in the ICO directory.
    view.setUint8(entry, size >= 256 ? 0 : size);
    view.setUint8(entry + 1, size >= 256 ? 0 : size);
    view.setUint8(entry + 2, 0); // palette size
    view.setUint8(entry + 3, 0); // reserved
    view.setUint16(entry + 4, 1, true); // colour planes
    view.setUint16(entry + 6, 32, true); // bits per pixel
    view.setUint32(entry + 8, png.length, true);
    view.setUint32(entry + 12, offset, true);
    bytes.set(png, offset);
    offset += png.length;
  });

  return new Blob([buffer], { type: "image/x-icon" });
}

export function FaviconGeneratorTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const { image, error, accept, clear } = useImageUpload();
  const [background, setBackground] = useState("#ffffff");
  const [transparent, setTransparent] = useState(true);
  const [padding, setPadding] = useState(0);
  const [radius, setRadius] = useState(0);
  const [previews, setPreviews] = useState<Array<{ size: number; url: string }>>([]);

  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  /** Render the source at one square size with the current padding/radius. */
  const renderSize = useCallback(
    (size: number) => {
      if (!image) return null;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      if (!transparent) {
        ctx.fillStyle = background;
        if (radius > 0) {
          ctx.beginPath();
          ctx.roundRect(0, 0, size, size, (size * radius) / 100);
          ctx.fill();
        } else {
          ctx.fillRect(0, 0, size, size);
        }
      }

      if (radius > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(0, 0, size, size, (size * radius) / 100);
        ctx.clip();
      }

      const inset = (size * padding) / 100;
      const box = size - inset * 2;
      const scale = Math.min(box / image.width, box / image.height);
      const dw = image.width * scale;
      const dh = image.height * scale;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(image.el, (size - dw) / 2, (size - dh) / 2, dw, dh);

      if (radius > 0) ctx.restore();
      return canvas;
    },
    [image, background, transparent, padding, radius]
  );

  useEffect(() => {
    if (!image) {
      setPreviews([]);
      return;
    }
    let cancelled = false;

    void (async () => {
      // Sizes are independent renders, so encode them together.
      const blobs = await Promise.all(
        FAVICON_SIZES.map(async (size) => {
          const canvas = renderSize(size);
          if (!canvas) return null;
          const blob = await canvasToBlob(canvas, "image/png");
          return { size, blob };
        })
      );
      const out: Array<{ size: number; url: string }> = [];
      for (const entry of blobs) {
        if (entry) out.push({ size: entry.size, url: URL.createObjectURL(entry.blob) });
      }
      if (cancelled) {
        out.forEach((o) => URL.revokeObjectURL(o.url));
        return;
      }
      setPreviews((prev) => {
        prev.forEach((p) => URL.revokeObjectURL(p.url));
        return out;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [image, renderSize]);

  const downloadAll = () => {
    FAVICON_SIZES.forEach((size, i) => {
      setTimeout(() => {
        const canvas = renderSize(size);
        if (canvas) void downloadCanvas(canvas, `favicon-${size}x${size}.png`);
      }, i * 220);
    });
  };

  const downloadIco = async () => {
    const canvases = [16, 32, 48].map(renderSize).filter((c): c is HTMLCanvasElement => Boolean(c));
    if (canvases.length === 0) return;
    downloadBlob(await buildIco(canvases), "favicon.ico");
  };

  const html = `<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon-96x96.png" type="image/png" sizes="96x96">
<link rel="apple-touch-icon" href="/favicon-180x180.png">
<link rel="manifest" href="/site.webmanifest">`;

  const manifest = JSON.stringify(
    {
      icons: [
        { src: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/favicon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
      ],
      theme_color: background,
      background_color: background,
      display: "standalone",
    },
    null,
    2
  );

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={clear}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={
            image && (
              <>
                <Button variant="outline" size="sm" onClick={() => void downloadIco()}>
                  favicon.ico
                </Button>
                <Button variant="primary" size="sm" onClick={downloadAll}>
                  All PNGs
                </Button>
              </>
            )
          }
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="favicon-generator">
        {error && <ErrorNote>{error}</ErrorNote>}

        {!image ? (
          <Dropzone
            onFiles={(f) => void accept([...f][0])}
            label="Drop a square logo"
            hint="512×512 or larger gives the sharpest small sizes"
          />
        ) : (
          <>
            <Panel title="Options">
              <div className="flex flex-col gap-3">
                <ControlGrid className="sm:grid-cols-3">
                  <Field label="Padding">
                    <Range value={padding} onChange={setPadding} min={0} max={35} format={(v) => `${v}%`} />
                  </Field>
                  <Field label="Corner radius">
                    <Range value={radius} onChange={setRadius} min={0} max={50} format={(v) => `${v}%`} />
                  </Field>
                  <Field label="Background">
                    <ColorInput value={background} onChange={setBackground} />
                  </Field>
                </ControlGrid>
                <Toggle checked={transparent} onChange={setTransparent} label="Keep transparent background" />
              </div>
            </Panel>

            <Panel title="Sizes">
              <div className="flex flex-wrap items-end gap-4">
                {previews.map((p) => (
                  <div key={p.size} className="flex flex-col items-center gap-1.5">
                    <div className="rounded-lg p-1" style={CHECKER_STYLE}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.url}
                        alt={`${p.size}px`}
                        width={Math.min(p.size, 96)}
                        height={Math.min(p.size, 96)}
                        style={{ imageRendering: p.size <= 48 ? "pixelated" : "auto" }}
                      />
                    </div>
                    <span className="text-kbd tabular-nums text-muted-foreground">{p.size}px</span>
                  </div>
                ))}
              </div>
            </Panel>

            <div className="grid gap-3 lg:grid-cols-2">
              <Panel title="HTML" actions={<CopyButton text={html} />}>
                <pre className="overflow-auto rounded-md bg-background p-3 font-mono text-caption leading-relaxed">
                  {html}
                </pre>
              </Panel>
              <Panel
                title="site.webmanifest"
                actions={
                  <>
                    <CopyButton text={manifest} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadText(manifest, "site.webmanifest", "application/manifest+json")}
                    >
                      Download
                    </Button>
                  </>
                }
              >
                <pre className="overflow-auto rounded-md bg-background p-3 font-mono text-caption leading-relaxed">
                  {manifest}
                </pre>
              </Panel>
            </div>
          </>
        )}
      </div>
    </ToolShell>
  );
}

// ── Image Tracer ────────────────────────────────────────────────────────────

export function ImageTracerTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const { image, error, accept, clear } = useImageUpload();
  const [preset, setPreset] = useState("default");
  const [colors, setColors] = useState(16);
  const [smoothing, setSmoothing] = useState(1);
  const [svg, setSvg] = useState("");
  const [busy, setBusy] = useState(false);
  const [traceError, setTraceError] = useState<string | null>(null);

  const trace = useCallback(async () => {
    if (!image) return;
    setBusy(true);
    setTraceError(null);
    try {
      // imagetracerjs is heavy, so it only loads when this tool actually runs.
      const mod = await import("imagetracerjs");
      const tracer = (mod as { default?: unknown }).default ?? mod;

      // Downscale first — tracing full-resolution photos is very slow.
      const maxSide = 700;
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      const w = Math.max(1, Math.round(image.width * scale));
      const h = Math.max(1, Math.round(image.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("Canvas is unavailable.");
      ctx.drawImage(image.el, 0, 0, w, h);
      const frame = ctx.getImageData(0, 0, w, h);

      const options = {
        ...(preset === "default" ? {} : { preset }),
        numberofcolors: Math.max(2, Math.min(64, colors)),
        blurradius: smoothing,
        ltres: 1,
        qtres: 1,
        pathomit: 8,
        scale: 1 / scale,
      };

      const traceFn = (tracer as { imagedataToSVG: (d: ImageData, o: unknown) => string }).imagedataToSVG;
      setSvg(traceFn(frame, options));
    } catch (e) {
      setTraceError((e as Error).message || "Tracing failed.");
    } finally {
      setBusy(false);
    }
  }, [image, preset, colors, smoothing]);

  useEffect(() => {
    if (image) void trace();
  }, [image, trace]);

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => {
            clear();
            setSvg("");
          }}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={
            svg && (
              <>
                <CopyButton text={svg} label="Copy SVG" />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => downloadText(svg, `${baseName(image?.name ?? "traced")}.svg`, "image/svg+xml")}
                >
                  Download
                </Button>
              </>
            )
          }
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="image-tracer">
        {(error || traceError) && <ErrorNote>{error ?? traceError}</ErrorNote>}

        {!image ? (
          <Dropzone
            onFiles={(f) => void accept([...f][0])}
            label="Drop an image to vectorise"
            hint="Logos and flat graphics trace far better than photos"
          />
        ) : (
          <>
            <Panel title="Trace settings">
              <ControlGrid className="sm:grid-cols-3">
                <Field label="Style">
                  <Select
                    value={preset}
                    onChange={setPreset}
                    options={[
                      { value: "default", label: "Balanced" },
                      { value: "posterized2", label: "Posterised" },
                      { value: "curvy", label: "Curvy" },
                      { value: "sharp", label: "Sharp" },
                      { value: "detailed", label: "Detailed" },
                      { value: "smoothed", label: "Smoothed" },
                      { value: "grayscale", label: "Greyscale" },
                    ]}
                  />
                </Field>
                <Field label="Colours">
                  <Range value={colors} onChange={setColors} min={2} max={64} />
                </Field>
                <Field label="Smoothing">
                  <Range value={smoothing} onChange={setSmoothing} min={0} max={5} />
                </Field>
              </ControlGrid>
            </Panel>

            <div className="grid gap-3 lg:grid-cols-2">
              <Panel title="Original">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt=""
                  className="mx-auto max-h-[22rem] rounded-md object-contain"
                  style={CHECKER_STYLE}
                />
              </Panel>
              <Panel title={busy ? "Tracing…" : "Vector"}>
                {svg ? (
                  <>
                    <div
                      className="mx-auto flex max-h-[22rem] justify-center overflow-hidden rounded-md [&>svg]:h-auto [&>svg]:max-h-[22rem] [&>svg]:w-auto"
                      style={CHECKER_STYLE}
                      // The SVG is generated locally from the user's own image.
                      dangerouslySetInnerHTML={{ __html: svg }}
                    />
                    <p className="mt-2 text-center text-caption text-muted-foreground">
                      {formatBytes(new Blob([svg]).size)} of SVG
                    </p>
                  </>
                ) : (
                  <p className="py-16 text-center text-ui text-muted-foreground">
                    {busy ? "Working…" : "Adjust a setting to trace."}
                  </p>
                )}
              </Panel>
            </div>
          </>
        )}
      </div>
    </ToolShell>
  );
}

// ── Background Remover ──────────────────────────────────────────────────────

type RemoveMode = "corner" | "pick" | "chroma";

/** Colour distance in a perceptually weighted RGB space. */
function distance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) {
  const rMean = (r1 + r2) / 2;
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(
    (((512 + rMean) * dr * dr) >> 8) + 4 * dg * dg + (((767 - rMean) * db * db) >> 8)
  );
}

export function BackgroundRemoverTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const { image, error, accept, clear } = useImageUpload();
  const [mode, setMode] = useState<RemoveMode>("corner");
  const [target, setTarget] = useState("#00ff00");
  const [tolerance, setTolerance] = useState(28);
  const [feather, setFeather] = useState(2);
  const [despill, setDespill] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const source = sourceRef.current;
    if (!canvas || !source || !image) return;

    source.width = image.width;
    source.height = image.height;
    const sctx = source.getContext("2d", { willReadFrequently: true });
    if (!sctx) return;
    sctx.drawImage(image.el, 0, 0);

    const frame = sctx.getImageData(0, 0, image.width, image.height);
    const { data } = frame;

    // Decide which colour counts as background.
    let key = parseColor(target) ?? { r: 0, g: 255, b: 0 };
    if (mode === "corner") {
      // Average the four corners so a slightly noisy backdrop still works.
      const corners = [
        0,
        (image.width - 1) * 4,
        (image.height - 1) * image.width * 4,
        ((image.height - 1) * image.width + image.width - 1) * 4,
      ];
      let r = 0;
      let g = 0;
      let b = 0;
      for (const c of corners) {
        r += data[c];
        g += data[c + 1];
        b += data[c + 2];
      }
      key = { r: r / 4, g: g / 4, b: b / 4 };
    }

    // Tolerance maps onto the ~765 max of the weighted distance metric.
    const hard = (tolerance / 100) * 400;
    const soft = hard + (feather / 100) * 400 + 1;

    for (let i = 0; i < data.length; i += 4) {
      const d = distance(data[i], data[i + 1], data[i + 2], key.r, key.g, key.b);

      if (d <= hard) {
        data[i + 3] = 0;
      } else if (d < soft) {
        // Feathered edge: ramp alpha between the hard and soft thresholds.
        data[i + 3] = Math.round(data[i + 3] * ((d - hard) / (soft - hard)));
      }

      // Pull the key colour out of semi-transparent edge pixels so green
      // screens don't leave a halo.
      if (despill && data[i + 3] > 0 && data[i + 3] < 255) {
        if (key.g > key.r && key.g > key.b && data[i + 1] > (data[i] + data[i + 2]) / 2) {
          data[i + 1] = (data[i] + data[i + 2]) / 2;
        }
      }
    }

    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    ctx?.putImageData(frame, 0, 0);
  }, [image, mode, target, tolerance, feather, despill]);

  const pickAt = (clientX: number, clientY: number) => {
    if (mode !== "pick") return;
    const canvas = canvasRef.current;
    const source = sourceRef.current;
    if (!canvas || !source) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((clientX - rect.left) / rect.width) * source.width);
    const y = Math.floor(((clientY - rect.top) / rect.height) * source.height);
    const ctx = source.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
    setTarget(rgbToHex({ r, g, b }));
  };

  const pickFromClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    pickAt(e.clientX, e.clientY);
  };

  // Keyboard users get the centre pixel, which is as meaningful a key target
  // as any single point on an arbitrary image.
  const pickFromKeyboard = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    pickAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
  };

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={clear}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={
            image && (
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  canvasRef.current && void downloadCanvas(canvasRef.current, `${baseName(image.name)}-cutout.png`)
                }
              >
                Download PNG
              </Button>
            )
          }
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="background-remover">
        {error && <ErrorNote>{error}</ErrorNote>}
        <canvas ref={sourceRef} className="hidden" />

        {!image ? (
          <Dropzone
            onFiles={(f) => void accept([...f][0])}
            label="Drop an image to cut out"
            hint="Works best on flat, chroma-key, or plain-colour backgrounds"
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
            <Panel title="Result">
              <div className="rounded-md p-2" style={CHECKER_STYLE}>
                <canvas
                  ref={canvasRef}
                  onClick={pickFromClick}
                  onKeyDown={pickFromKeyboard}
                  role={mode === "pick" ? "button" : undefined}
                  tabIndex={mode === "pick" ? 0 : undefined}
                  aria-label="Pick the background colour from the image"
                  className={cn(
                    "mx-auto max-h-[28rem] w-full object-contain",
                    mode === "pick" && "cursor-crosshair"
                  )}
                />
              </div>
              {mode === "pick" && (
                <p className="mt-2 text-center text-caption text-muted-foreground">
                  Click anywhere on the background to key that colour.
                </p>
              )}
            </Panel>

            <Panel title="Keying">
              <div className="flex flex-col gap-3">
                <Field label="Background colour">
                  <Select
                    value={mode}
                    onChange={setMode}
                    options={[
                      { value: "corner", label: "Auto from corners" },
                      { value: "pick", label: "Pick from image" },
                      { value: "chroma", label: "Specific colour" },
                    ]}
                  />
                </Field>
                {mode !== "corner" && (
                  <Field label="Key colour">
                    <ColorInput value={target} onChange={setTarget} />
                  </Field>
                )}
                <Field label="Tolerance" hint="How far a pixel can differ and still count as background">
                  <Range value={tolerance} onChange={setTolerance} min={1} max={90} format={(v) => `${v}%`} />
                </Field>
                <Field label="Edge feather">
                  <Range value={feather} onChange={setFeather} min={0} max={25} format={(v) => `${v}%`} />
                </Field>
                <Toggle checked={despill} onChange={setDespill} label="Remove colour spill" />

                <p className="rounded-md bg-muted p-2.5 text-caption leading-relaxed text-muted-foreground">
                  This uses colour keying, not an AI model — nothing is uploaded and there is no
                  download. For busy photographic backgrounds, results will be rough.
                </p>
              </div>
            </Panel>
          </div>
        )}
      </div>
    </ToolShell>
  );
}
