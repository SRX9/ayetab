"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  EmptyNote,
  ErrorNote,
  Field,
  NumberInput,
  Panel,
  Range,
  Segmented,
  Select,
  StatRow,
  TextInput,
  Toggle,
  ToolActions,
  baseName,
  canvasToBlob,
  downloadBlob,
  downloadCanvas,
  downloadText,
  formatBytes,
  useImageListUpload,
  useImageUpload,
  type LoadedImage,
} from "./shared";

type OutFormat = "image/png" | "image/jpeg" | "image/webp" | "image/bmp";

const FORMAT_OPTIONS: Array<{ value: OutFormat; label: string }> = [
  { value: "image/png", label: "PNG" },
  { value: "image/jpeg", label: "JPEG" },
  { value: "image/webp", label: "WebP" },
  { value: "image/bmp", label: "BMP" },
];

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/bmp": "bmp",
};

/** Preview strip shown once an image is loaded. */
function SourceInfo({ image, onReplace }: { image: LoadedImage; onReplace: () => void }) {
  return (
    <Panel
      title="Source"
      actions={
        <Button variant="outline" size="sm" onClick={onReplace}>
          Replace
        </Button>
      }
    >
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.url}
          alt=""
          className="h-16 w-16 shrink-0 rounded-lg object-contain"
          style={CHECKER_STYLE}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-ui font-medium">{image.name}</p>
          <p className="text-caption text-muted-foreground">
            {image.width} × {image.height} · {formatBytes(image.size)} · {image.type}
          </p>
        </div>
      </div>
    </Panel>
  );
}

// ── Image Converter ─────────────────────────────────────────────────────────

export function ImageConverterTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const { image, error, accept, clear } = useImageUpload();
  const [format, setFormat] = useState<OutFormat>("image/webp");
  const [quality, setQuality] = useState(90);
  const [resizeMode, setResizeMode] = useState<"none" | "width" | "height" | "exact" | "scale">("none");
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(1200);
  const [scale, setScale] = useState(100);
  const [background, setBackground] = useState("#ffffff");
  const [result, setResult] = useState<{ blob: Blob; url: string; w: number; h: number } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url); }, [result]);

  const target = useMemo(() => {
    if (!image) return { w: 0, h: 0 };
    const ratio = image.width / image.height;
    switch (resizeMode) {
      case "none": return { w: image.width, h: image.height };
      case "width": return { w: width, h: Math.round(width / ratio) };
      case "height": return { w: Math.round(height * ratio), h: height };
      case "exact": return { w: width, h: height };
      case "scale": return {
        w: Math.round((image.width * scale) / 100),
        h: Math.round((image.height * scale) / 100),
      };
    }
  }, [image, resizeMode, width, height, scale]);

  const convert = useCallback(async () => {
    if (!image || target.w < 1 || target.h < 1) return;
    setBusy(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = target.w;
      canvas.height = target.h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // JPEG and BMP have no alpha channel, so flatten onto a colour first.
      if (format === "image/jpeg" || format === "image/bmp") {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, target.w, target.h);
      }
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(image.el, 0, 0, target.w, target.h);

      const blob = await canvasToBlob(canvas, format, quality / 100);
      setResult((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return { blob, url: URL.createObjectURL(blob), w: target.w, h: target.h };
      });
    } finally {
      setBusy(false);
    }
  }, [image, target, format, quality, background]);

  useEffect(() => {
    if (image) void convert();
  }, [image, convert]);

  const lossy = format === "image/jpeg" || format === "image/webp";
  const delta = result && image ? ((result.blob.size - image.size) / image.size) * 100 : 0;

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => { clear(); setResult(null); }}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={
            result && image && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => downloadBlob(result.blob, `${baseName(image.name)}.${EXT[format]}`)}
              >
                Download
              </Button>
            )
          }
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="image-converter">
        {error && <ErrorNote>{error}</ErrorNote>}

        {!image ? (
          <Dropzone onFiles={(f) => void accept([...f][0])} label="Drop an image to convert" />
        ) : (
          <>
            <SourceInfo image={image} onReplace={() => { clear(); setResult(null); }} />

            <Panel title="Output">
              <div className="flex flex-col gap-3">
                <ControlGrid className="sm:grid-cols-3">
                  <Field label="Format">
                    <Select value={format} onChange={setFormat} options={FORMAT_OPTIONS} />
                  </Field>
                  <Field label="Resize">
                    <Select
                      value={resizeMode}
                      onChange={setResizeMode}
                      options={[
                        { value: "none", label: "Keep original" },
                        { value: "scale", label: "By percentage" },
                        { value: "width", label: "Fit width" },
                        { value: "height", label: "Fit height" },
                        { value: "exact", label: "Exact size" },
                      ]}
                    />
                  </Field>
                  {resizeMode === "scale" && (
                    <Field label="Scale">
                      <Range value={scale} onChange={setScale} min={5} max={400} format={(v) => `${v}%`} />
                    </Field>
                  )}
                  {(resizeMode === "width" || resizeMode === "exact") && (
                    <Field label="Width">
                      <NumberInput value={width} onChange={setWidth} min={1} suffix="px" />
                    </Field>
                  )}
                  {(resizeMode === "height" || resizeMode === "exact") && (
                    <Field label="Height">
                      <NumberInput value={height} onChange={setHeight} min={1} suffix="px" />
                    </Field>
                  )}
                  {lossy && (
                    <Field label="Quality">
                      <Range value={quality} onChange={setQuality} min={10} max={100} format={(v) => `${v}%`} />
                    </Field>
                  )}
                  {(format === "image/jpeg" || format === "image/bmp") && (
                    <Field label="Flatten onto" hint="This format has no transparency">
                      <ColorInput value={background} onChange={setBackground} />
                    </Field>
                  )}
                </ControlGrid>

                <p className="text-caption text-muted-foreground">
                  Output will be {target.w} × {target.h}px
                </p>
              </div>
            </Panel>

            {result && (
              <Panel title="Result">
                <div className="grid gap-4 sm:grid-cols-[1fr_14rem]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.url}
                    alt="Converted"
                    className="max-h-[20rem] w-full rounded-md object-contain"
                    style={CHECKER_STYLE}
                  />
                  <div>
                    <StatRow label="Dimensions" value={`${result.w} × ${result.h}`} />
                    <StatRow label="New size" value={formatBytes(result.blob.size)} />
                    <StatRow label="Was" value={formatBytes(image.size)} />
                    <StatRow
                      label="Change"
                      value={
                        <span className={delta <= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"}>
                          {delta > 0 ? "+" : ""}
                          {delta.toFixed(1)}%
                        </span>
                      }
                    />
                    {busy && <p className="pt-2 text-caption text-muted-foreground">Working…</p>}
                  </div>
                </div>
              </Panel>
            )}
          </>
        )}
      </div>
    </ToolShell>
  );
}

// ── Image Splitter ──────────────────────────────────────────────────────────

export function ImageSplitterTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const { image, error, accept, clear } = useImageUpload();
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(3);
  const [format, setFormat] = useState<OutFormat>("image/png");
  const [tiles, setTiles] = useState<Array<{ url: string; row: number; col: number }>>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => () => tiles.forEach((t) => URL.revokeObjectURL(t.url)), [tiles]);

  const split = useCallback(async () => {
    if (!image) return;
    const c = Math.max(1, Math.min(12, cols));
    const r = Math.max(1, Math.min(12, rows));
    setBusy(true);

    const tw = Math.floor(image.width / c);
    const th = Math.floor(image.height / r);
    const out: Array<{ url: string; row: number; col: number }> = [];

    for (let row = 0; row < r; row++) {
      for (let col = 0; col < c; col++) {
        const canvas = document.createElement("canvas");
        canvas.width = tw;
        canvas.height = th;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        ctx.drawImage(image.el, col * tw, row * th, tw, th, 0, 0, tw, th);
        const blob = await canvasToBlob(canvas, format);
        out.push({ url: URL.createObjectURL(blob), row, col });
      }
    }

    setTiles((prev) => {
      prev.forEach((t) => URL.revokeObjectURL(t.url));
      return out;
    });
    setBusy(false);
  }, [image, cols, rows, format]);

  useEffect(() => {
    if (image) void split();
  }, [image, split]);

  const downloadAll = () => {
    if (!image) return;
    // Browsers throttle rapid downloads, so stagger them slightly.
    tiles.forEach((t, i) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = t.url;
        a.download = `${baseName(image.name)}-r${t.row + 1}c${t.col + 1}.${EXT[format]}`;
        a.click();
      }, i * 220);
    });
  };

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => { clear(); setTiles([]); }}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={
            tiles.length > 0 && (
              <Button variant="primary" size="sm" onClick={downloadAll}>
                Download {tiles.length} tiles
              </Button>
            )
          }
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="image-splitter">
        {error && <ErrorNote>{error}</ErrorNote>}

        {!image ? (
          <Dropzone onFiles={(f) => void accept([...f][0])} label="Drop an image to split into tiles" />
        ) : (
          <>
            <SourceInfo image={image} onReplace={() => { clear(); setTiles([]); }} />

            <Panel title="Grid">
              <ControlGrid className="sm:grid-cols-3">
                <Field label="Columns">
                  <Range value={cols} onChange={setCols} min={1} max={12} />
                </Field>
                <Field label="Rows">
                  <Range value={rows} onChange={setRows} min={1} max={12} />
                </Field>
                <Field label="Format">
                  <Select value={format} onChange={setFormat} options={FORMAT_OPTIONS} />
                </Field>
              </ControlGrid>
              <p className="mt-2 text-caption text-muted-foreground">
                {cols * rows} tiles at {Math.floor(image.width / cols)} × {Math.floor(image.height / rows)}px
              </p>
            </Panel>

            <Panel title={busy ? "Slicing…" : `Tiles · ${tiles.length}`}>
              <div
                className="grid gap-1 overflow-hidden rounded-md"
                style={{ gridTemplateColumns: `repeat(${Math.max(1, Math.min(12, cols))}, 1fr)` }}
              >
                {tiles.map((t) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`${t.row}-${t.col}`}
                    src={t.url}
                    alt={`Tile ${t.row + 1},${t.col + 1}`}
                    className="w-full rounded-sm object-cover"
                  />
                ))}
              </div>
            </Panel>
          </>
        )}
      </div>
    </ToolShell>
  );
}

// ── Image Stitcher ──────────────────────────────────────────────────────────

export function ImageStitcherTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const { images, error, accept, remove, move, clear } = useImageListUpload();
  const [direction, setDirection] = useState<"horizontal" | "vertical" | "grid">("horizontal");
  const [gap, setGap] = useState(0);
  const [background, setBackground] = useState("#ffffff");
  const [align, setAlign] = useState<"start" | "center" | "end">("center");
  const [gridCols, setGridCols] = useState(2);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (direction === "grid") {
      const cols = Math.max(1, gridCols);
      const rows = Math.ceil(images.length / cols);
      const cellW = Math.max(...images.map((i) => i.width));
      const cellH = Math.max(...images.map((i) => i.height));

      canvas.width = cols * cellW + gap * (cols - 1);
      canvas.height = rows * cellH + gap * (rows - 1);
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      images.forEach((img, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = col * (cellW + gap) + (cellW - img.width) / 2;
        const y = row * (cellH + gap) + (cellH - img.height) / 2;
        ctx.drawImage(img.el, x, y);
      });
      return;
    }

    const horizontal = direction === "horizontal";
    const total = images.reduce((sum, i) => sum + (horizontal ? i.width : i.height), 0) + gap * (images.length - 1);
    const cross = Math.max(...images.map((i) => (horizontal ? i.height : i.width)));

    canvas.width = horizontal ? total : cross;
    canvas.height = horizontal ? cross : total;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let offset = 0;
    for (const img of images) {
      const span = horizontal ? img.height : img.width;
      const crossOffset = align === "start" ? 0 : align === "end" ? cross - span : (cross - span) / 2;
      if (horizontal) ctx.drawImage(img.el, offset, crossOffset);
      else ctx.drawImage(img.el, crossOffset, offset);
      offset += (horizontal ? img.width : img.height) + gap;
    }
  }, [images, direction, gap, background, align, gridCols]);

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
            images.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => canvasRef.current && void downloadCanvas(canvasRef.current, "stitched.png")}
              >
                Download
              </Button>
            )
          }
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="image-stitcher">
        {error && <ErrorNote>{error}</ErrorNote>}

        <Dropzone
          onFiles={(f) => void accept(f)}
          multiple
          compact={images.length > 0}
          label="Drop images to combine"
          hint="Add as many as you like — order is editable below"
        />

        {images.length === 0 ? (
          <EmptyNote>Add two or more images to stitch them together.</EmptyNote>
        ) : (
          <>
            <Panel title={`Images · ${images.length}`}>
              <div className="flex flex-col gap-1.5">
                {images.map((img, i) => (
                  <div key={`${img.url}-${i}`} className="flex items-center gap-2.5 rounded-lg bg-background p-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" className="h-10 w-10 shrink-0 rounded object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-caption">{img.name}</p>
                      <p className="text-kbd text-muted-foreground">{img.width} × {img.height}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => move(i, i - 1)} disabled={i === 0}>
                      ↑
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => move(i, i + 1)} disabled={i === images.length - 1}>
                      ↓
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(i)}>
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Layout">
              <ControlGrid className="sm:grid-cols-2">
                <Field label="Direction">
                  <Select
                    value={direction}
                    onChange={setDirection}
                    options={[
                      { value: "horizontal", label: "Side by side" },
                      { value: "vertical", label: "Stacked" },
                      { value: "grid", label: "Grid" },
                    ]}
                  />
                </Field>
                {direction === "grid" ? (
                  <Field label="Columns">
                    <Range value={gridCols} onChange={setGridCols} min={1} max={8} />
                  </Field>
                ) : (
                  <Field label="Align">
                    <Select
                      value={align}
                      onChange={setAlign}
                      options={[
                        { value: "start", label: direction === "horizontal" ? "Top" : "Left" },
                        { value: "center", label: "Centre" },
                        { value: "end", label: direction === "horizontal" ? "Bottom" : "Right" },
                      ]}
                    />
                  </Field>
                )}
                <Field label="Gap">
                  <Range value={gap} onChange={setGap} min={0} max={120} format={(v) => `${v}px`} />
                </Field>
                <Field label="Background">
                  <ColorInput value={background} onChange={setBackground} />
                </Field>
              </ControlGrid>
            </Panel>

            <Panel title="Preview">
              <canvas ref={canvasRef} className="max-h-[26rem] w-full rounded-md object-contain" />
            </Panel>
          </>
        )}
      </div>
    </ToolShell>
  );
}

// ── Image Clipper ───────────────────────────────────────────────────────────

export function ImageClipperTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const { image, error, accept, clear } = useImageUpload();
  const [threshold, setThreshold] = useState(0);
  const [padding, setPadding] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bounds, setBounds] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    // Read the source into a scratch canvas to find the alpha bounding box.
    const scratch = document.createElement("canvas");
    scratch.width = image.width;
    scratch.height = image.height;
    const sctx = scratch.getContext("2d", { willReadFrequently: true });
    if (!sctx) return;
    sctx.drawImage(image.el, 0, 0);

    const { data } = sctx.getImageData(0, 0, image.width, image.height);
    let minX = image.width;
    let minY = image.height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        if (data[(y * image.width + x) * 4 + 3] > threshold) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX < 0) {
      setBounds(null);
      return;
    }

    const x = Math.max(0, minX - padding);
    const y = Math.max(0, minY - padding);
    const w = Math.min(image.width - x, maxX - minX + 1 + padding * 2);
    const h = Math.min(image.height - y, maxY - minY + 1 + padding * 2);

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, w, h);
    ctx?.drawImage(image.el, x, y, w, h, 0, 0, w, h);
    setBounds({ x, y, w, h });
  }, [image, threshold, padding]);

  const saved = image && bounds ? 100 - ((bounds.w * bounds.h) / (image.width * image.height)) * 100 : 0;

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
            bounds && image && (
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  canvasRef.current && void downloadCanvas(canvasRef.current, `${baseName(image.name)}-clipped.png`)
                }
              >
                Download PNG
              </Button>
            )
          }
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="image-clipper">
        {error && <ErrorNote>{error}</ErrorNote>}

        {!image ? (
          <Dropzone
            onFiles={(f) => void accept([...f][0])}
            label="Drop a PNG with transparent edges"
            hint="Trims to the smallest box that still holds every visible pixel"
          />
        ) : (
          <>
            <SourceInfo image={image} onReplace={clear} />

            <Panel title="Trim">
              <ControlGrid>
                <Field label="Alpha threshold" hint="Pixels at or below this alpha count as empty">
                  <Range value={threshold} onChange={setThreshold} min={0} max={254} />
                </Field>
                <Field label="Padding" hint="Keep a margin around the trimmed content">
                  <Range value={padding} onChange={setPadding} min={0} max={100} format={(v) => `${v}px`} />
                </Field>
              </ControlGrid>
            </Panel>

            {!bounds ? (
              <ErrorNote>Every pixel is below the alpha threshold — nothing left to keep.</ErrorNote>
            ) : (
              <Panel title="Result">
                <div className="grid gap-4 sm:grid-cols-[1fr_14rem]">
                  <div className="rounded-md p-3" style={CHECKER_STYLE}>
                    <canvas ref={canvasRef} className="max-h-[20rem] w-full object-contain" />
                  </div>
                  <div>
                    <StatRow label="Original" value={`${image.width} × ${image.height}`} />
                    <StatRow label="Trimmed" value={`${bounds.w} × ${bounds.h}`} />
                    <StatRow label="Offset" value={`${bounds.x}, ${bounds.y}`} />
                    <StatRow
                      label="Area saved"
                      value={
                        <span className="text-emerald-600 dark:text-emerald-400">{saved.toFixed(1)}%</span>
                      }
                    />
                  </div>
                </div>
              </Panel>
            )}
          </>
        )}
      </div>
    </ToolShell>
  );
}

// ── Paste Image ─────────────────────────────────────────────────────────────

export function PasteImageTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const { image, error, accept, clear } = useImageUpload();
  const [format, setFormat] = useState<OutFormat>("image/png");
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    if (!image) {
      setDataUrl("");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (format === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(image.el, 0, 0);
    setDataUrl(canvas.toDataURL(format, 0.92));
  }, [image, format]);

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
                onClick={() => {
                  const canvas = document.createElement("canvas");
                  canvas.width = image.width;
                  canvas.height = image.height;
                  const ctx = canvas.getContext("2d");
                  if (!ctx) return;
                  if (format === "image/jpeg") {
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                  }
                  ctx.drawImage(image.el, 0, 0);
                  void downloadCanvas(canvas, `pasted.${EXT[format]}`, format);
                }}
              >
                Download
              </Button>
            )
          }
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="paste-image">
        {error && <ErrorNote>{error}</ErrorNote>}

        {!image ? (
          <Dropzone
            onFiles={(f) => void accept([...f][0])}
            label="Press ⌘V / Ctrl+V to paste an image"
            hint="Screenshots, copied images, or drop a file — it stays on your device"
          />
        ) : (
          <>
            <Panel
              title="Pasted image"
              actions={
                <Button variant="outline" size="sm" onClick={clear}>
                  Clear
                </Button>
              }
            >
              <div className="rounded-md p-3" style={CHECKER_STYLE}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt="Pasted" className="mx-auto max-h-[24rem] object-contain" />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <StatRow label="Dimensions" value={`${image.width} × ${image.height}`} />
                  <StatRow label="Size" value={formatBytes(image.size)} />
                </div>
                <Field label="Save as">
                  <Select value={format} onChange={setFormat} options={FORMAT_OPTIONS} />
                </Field>
              </div>
            </Panel>

            {dataUrl && (
              <Panel
                title="Data URL"
                actions={<CopyButton text={dataUrl} />}
              >
                <p className="mb-2 text-caption text-muted-foreground">
                  {formatBytes(dataUrl.length)} as base64 — roughly 33% larger than the binary file.
                </p>
                <pre className="max-h-32 overflow-auto break-all rounded-md bg-background p-3 font-mono text-caption">
                  {dataUrl.slice(0, 4000)}
                  {dataUrl.length > 4000 ? "…" : ""}
                </pre>
              </Panel>
            )}
          </>
        )}
      </div>
    </ToolShell>
  );
}

// ── Placeholder Generator ───────────────────────────────────────────────────

export function PlaceholderGeneratorTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(630);
  const [bg, setBg] = useState("#e2e8f0");
  const [fg, setFg] = useState("#64748b");
  const [text, setText] = useState("");
  const [style, setStyle] = useState<"solid" | "grid" | "diagonal" | "noise">("solid");
  const [showSize, setShowSize] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const label = text.trim() || (showSize ? `${width} × ${height}` : "");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = Math.max(1, Math.min(6000, width));
    const h = Math.max(1, Math.min(6000, height));
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = fg;
    ctx.globalAlpha = 0.22;
    if (style === "grid") {
      const step = Math.max(16, Math.round(Math.min(w, h) / 16));
      ctx.lineWidth = 1;
      for (let x = 0; x <= w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y <= h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    } else if (style === "diagonal") {
      ctx.lineWidth = Math.max(1, Math.round(Math.min(w, h) / 200));
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w, h);
      ctx.moveTo(w, 0);
      ctx.lineTo(0, h);
      ctx.stroke();
      ctx.strokeRect(0, 0, w, h);
    } else if (style === "noise") {
      const frame = ctx.getImageData(0, 0, w, h);
      for (let i = 0; i < frame.data.length; i += 4) {
        const n = (Math.random() - 0.5) * 34;
        frame.data[i] += n;
        frame.data[i + 1] += n;
        frame.data[i + 2] += n;
      }
      ctx.putImageData(frame, 0, 0);
    }
    ctx.globalAlpha = 1;

    if (label) {
      const size = Math.max(12, Math.round(Math.min(w, h) / 8));
      ctx.fillStyle = fg;
      ctx.font = `600 ${size}px ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, w / 2, h / 2, w * 0.9);
    }
  }, [width, height, bg, fg, label, style]);

  const svg = useMemo(() => {
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const size = Math.max(12, Math.round(Math.min(width, height) / 8));
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${bg}"/>${
      label
        ? `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${fg}" font-family="system-ui, sans-serif" font-size="${size}" font-weight="600">${esc(label)}</text>`
        : ""
    }</svg>`;
  }, [width, height, bg, fg, label]);

  const PRESETS: Array<[string, number, number]> = [
    ["OG image", 1200, 630],
    ["Square", 1080, 1080],
    ["Story", 1080, 1920],
    ["Hero", 1920, 1080],
    ["Avatar", 400, 400],
    ["Banner", 1500, 500],
  ];

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => {
            setWidth(1200);
            setHeight(630);
            setText("");
          }}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                canvasRef.current && void downloadCanvas(canvasRef.current, `placeholder-${width}x${height}.png`)
              }
            >
              Download PNG
            </Button>
          }
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="placeholder-generator">
        <Panel title="Size">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map(([name, w, h]) => (
                <Button
                  key={name}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setWidth(w);
                    setHeight(h);
                  }}
                  className={cn(width === w && height === h && "border-brand text-brand")}
                >
                  {name}
                </Button>
              ))}
            </div>
            <ControlGrid className="sm:grid-cols-4">
              <Field label="Width">
                <NumberInput value={width} onChange={setWidth} min={1} max={6000} suffix="px" />
              </Field>
              <Field label="Height">
                <NumberInput value={height} onChange={setHeight} min={1} max={6000} suffix="px" />
              </Field>
              <Field label="Background">
                <ColorInput value={bg} onChange={setBg} />
              </Field>
              <Field label="Foreground">
                <ColorInput value={fg} onChange={setFg} />
              </Field>
            </ControlGrid>
            <ControlGrid>
              <Field label="Label" hint="Leave empty to show the dimensions">
                <TextInput value={text} onChange={setText} placeholder={`${width} × ${height}`} />
              </Field>
              <Field label="Pattern">
                <Select
                  value={style}
                  onChange={setStyle}
                  options={[
                    { value: "solid", label: "Solid" },
                    { value: "grid", label: "Grid" },
                    { value: "diagonal", label: "Diagonal cross" },
                    { value: "noise", label: "Noise" },
                  ]}
                />
              </Field>
            </ControlGrid>
            <Toggle checked={showSize} onChange={setShowSize} label="Show dimensions when no label is set" />
          </div>
        </Panel>

        <Panel title="Preview">
          <canvas ref={canvasRef} className="max-h-[24rem] w-full rounded-md object-contain" />
        </Panel>

        <Panel
          title="Inline SVG"
          actions={
            <>
              <CopyButton text={svg} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadText(svg, `placeholder-${width}x${height}.svg`, "image/svg+xml")}
              >
                Download SVG
              </Button>
            </>
          }
        >
          <pre className="max-h-32 overflow-auto rounded-md bg-background p-3 font-mono text-caption">
            {svg}
          </pre>
        </Panel>
      </div>
    </ToolShell>
  );
}
