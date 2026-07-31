"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ToolShell } from "../tool-shell";
import { Button } from "../button";
import { cn } from "../../lib/utils";
import {
  CHECKER_STYLE,
  ColorInput,
  ControlGrid,
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
  TextInput,
  Toggle,
  ToolActions,
  baseName,
  canvasToBlob,
  downloadCanvas,
  drawFitted,
  formatBytes,
  useImageUpload,
} from "./shared";

// ── Matte Generator ─────────────────────────────────────────────────────────

type MatteFill = "color" | "blur" | "average";

export function MatteGeneratorTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const { image, error, accept, clear } = useImageUpload();
  const [ratio, setRatio] = useState("1:1");
  const [fill, setFill] = useState<MatteFill>("color");
  const [color, setColor] = useState("#ffffff");
  const [inset, setInset] = useState(6);
  const [blurAmount, setBlurAmount] = useState(40);
  const [rounded, setRounded] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [rw, rh] = ratio.split(":").map(Number);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    // Size the matte from the image's longest edge so nothing is upscaled.
    const longest = Math.max(image.width, image.height);
    const scale = longest / Math.max(rw, rh);
    const W = Math.round(rw * scale);
    const H = Math.round(rh * scale);

    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    if (fill === "color") {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, W, H);
    } else if (fill === "blur") {
      ctx.save();
      ctx.filter = `blur(${blurAmount}px)`;
      drawFitted(ctx, image.el, W, H, "cover");
      ctx.restore();
      // Knock the blurred backdrop back so the subject still leads.
      ctx.fillStyle = "rgba(0,0,0,.12)";
      ctx.fillRect(0, 0, W, H);
    } else {
      // Average colour of the source.
      const scratch = document.createElement("canvas");
      scratch.width = 1;
      scratch.height = 1;
      const sctx = scratch.getContext("2d", { willReadFrequently: true });
      if (sctx) {
        sctx.drawImage(image.el, 0, 0, 1, 1);
        const [r, g, b] = sctx.getImageData(0, 0, 1, 1).data;
        ctx.fillStyle = `rgb(${r} ${g} ${b})`;
      } else {
        ctx.fillStyle = color;
      }
      ctx.fillRect(0, 0, W, H);
    }

    // Subject, inset by a percentage of the shorter matte edge.
    const margin = (Math.min(W, H) * inset) / 100;
    const boxW = W - margin * 2;
    const boxH = H - margin * 2;
    const fitScale = Math.min(boxW / image.width, boxH / image.height);
    const dw = image.width * fitScale;
    const dh = image.height * fitScale;
    const dx = (W - dw) / 2;
    const dy = (H - dh) / 2;

    if (rounded > 0) {
      const radius = (Math.min(dw, dh) * rounded) / 100;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(dx, dy, dw, dh, radius);
      ctx.clip();
      ctx.drawImage(image.el, dx, dy, dw, dh);
      ctx.restore();
    } else {
      ctx.drawImage(image.el, dx, dy, dw, dh);
    }
  }, [image, rw, rh, fill, color, inset, blurAmount, rounded]);

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
                  canvasRef.current && void downloadCanvas(canvasRef.current, `${baseName(image.name)}-matte.png`)
                }
              >
                Download
              </Button>
            )
          }
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="matte-generator">
        {error && <ErrorNote>{error}</ErrorNote>}

        {!image ? (
          <Dropzone
            onFiles={(f) => void accept([...f][0])}
            label="Drop an image to matte"
            hint="Pads any shape onto a clean square without cropping"
          />
        ) : (
          <>
            <Panel title="Matte">
              <div className="flex flex-col gap-3">
                <ControlGrid className="sm:grid-cols-2">
                  <Field label="Aspect ratio">
                    <Select
                      value={ratio}
                      onChange={setRatio}
                      options={[
                        { value: "1:1", label: "Square 1:1" },
                        { value: "4:5", label: "Portrait 4:5" },
                        { value: "5:4", label: "Landscape 5:4" },
                        { value: "3:2", label: "Classic 3:2" },
                        { value: "16:9", label: "Wide 16:9" },
                        { value: "9:16", label: "Story 9:16" },
                      ]}
                    />
                  </Field>
                  <Field label="Backdrop">
                    <Select
                      value={fill}
                      onChange={setFill}
                      options={[
                        { value: "color", label: "Solid colour" },
                        { value: "blur", label: "Blurred image" },
                        { value: "average", label: "Average colour" },
                      ]}
                    />
                  </Field>
                  {fill === "color" && (
                    <Field label="Colour">
                      <ColorInput value={color} onChange={setColor} />
                    </Field>
                  )}
                  {fill === "blur" && (
                    <Field label="Blur">
                      <Range value={blurAmount} onChange={setBlurAmount} min={4} max={120} format={(v) => `${v}px`} />
                    </Field>
                  )}
                  <Field label="Inset">
                    <Range value={inset} onChange={setInset} min={0} max={30} format={(v) => `${v}%`} />
                  </Field>
                  <Field label="Corner radius">
                    <Range value={rounded} onChange={setRounded} min={0} max={50} format={(v) => `${v}%`} />
                  </Field>
                </ControlGrid>
              </div>
            </Panel>

            <Panel title="Preview">
              <canvas ref={canvasRef} className="mx-auto max-h-[26rem] rounded-md object-contain" />
            </Panel>
          </>
        )}
      </div>
    </ToolShell>
  );
}

// ── Seamless Scroll Generator ───────────────────────────────────────────────

export function ScrollGeneratorTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const { image, error, accept, clear } = useImageUpload();
  const [slides, setSlides] = useState(3);
  const [ratio, setRatio] = useState("4:5");
  const [panels, setPanels] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const [rw, rh] = ratio.split(":").map(Number);

  useEffect(() => () => panels.forEach((p) => URL.revokeObjectURL(p)), [panels]);

  const generate = useCallback(async () => {
    if (!image) return;
    setBusy(true);

    const n = Math.max(2, Math.min(10, slides));
    // Each panel keeps the chosen ratio; height comes from the source.
    const panelH = image.height;
    const panelW = Math.round((panelH * rw) / rh);
    const totalW = panelW * n;

    // Scale the source to span every panel, cropping vertically as needed.
    const scale = Math.max(totalW / image.width, panelH / image.height);
    const dw = image.width * scale;
    const dh = image.height * scale;
    const offsetX = (totalW - dw) / 2;
    const offsetY = (panelH - dh) / 2;

    const out: string[] = [];
    for (let i = 0; i < n; i++) {
      const canvas = document.createElement("canvas");
      canvas.width = panelW;
      canvas.height = panelH;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(image.el, offsetX - i * panelW, offsetY, dw, dh);
      const blob = await canvasToBlob(canvas, "image/jpeg", 0.94);
      out.push(URL.createObjectURL(blob));
    }

    setPanels((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p));
      return out;
    });
    setBusy(false);
  }, [image, slides, rw, rh]);

  useEffect(() => {
    if (image) void generate();
  }, [image, generate]);

  const downloadAll = () => {
    if (!image) return;
    panels.forEach((url, i) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = url;
        a.download = `${baseName(image.name)}-${String(i + 1).padStart(2, "0")}.jpg`;
        a.click();
      }, i * 240);
    });
  };

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => {
            clear();
            setPanels([]);
          }}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={
            panels.length > 0 && (
              <Button variant="primary" size="sm" onClick={downloadAll}>
                Download {panels.length} slides
              </Button>
            )
          }
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="scroll-generator">
        {error && <ErrorNote>{error}</ErrorNote>}

        {!image ? (
          <Dropzone
            onFiles={(f) => void accept([...f][0])}
            label="Drop a wide image"
            hint="Split into carousel slides that line up when swiped"
          />
        ) : (
          <>
            <Panel title="Carousel">
              <ControlGrid>
                <Field label="Slides">
                  <Range value={slides} onChange={setSlides} min={2} max={10} />
                </Field>
                <Field label="Slide ratio">
                  <Select
                    value={ratio}
                    onChange={setRatio}
                    options={[
                      { value: "4:5", label: "Portrait 4:5 (Instagram)" },
                      { value: "1:1", label: "Square 1:1" },
                      { value: "3:4", label: "Portrait 3:4" },
                      { value: "9:16", label: "Story 9:16" },
                    ]}
                  />
                </Field>
              </ControlGrid>
              <p className="mt-2 text-caption text-muted-foreground">
                Upload numbered slides in order — the seams line up as you swipe.
              </p>
            </Panel>

            <Panel title={busy ? "Slicing…" : `Slides · ${panels.length}`}>
              <div className="flex gap-1 overflow-x-auto rounded-md pb-2">
                {panels.map((url, i) => (
                  <div key={url} className="relative shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Slide ${i + 1}`} className="h-56 w-auto rounded-md" />
                    <span className="absolute left-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-kbd font-semibold text-white">
                      {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          </>
        )}
      </div>
    </ToolShell>
  );
}

// ── Social Media Cropper ────────────────────────────────────────────────────

interface CropPreset {
  id: string;
  platform: string;
  label: string;
  w: number;
  h: number;
}

const CROP_PRESETS: CropPreset[] = [
  { id: "ig-square", platform: "Instagram", label: "Feed square", w: 1080, h: 1080 },
  { id: "ig-portrait", platform: "Instagram", label: "Feed portrait", w: 1080, h: 1350 },
  { id: "ig-landscape", platform: "Instagram", label: "Feed landscape", w: 1080, h: 566 },
  { id: "ig-story", platform: "Instagram", label: "Story / Reel", w: 1080, h: 1920 },
  { id: "bsky-post", platform: "Bluesky", label: "Post image", w: 1200, h: 675 },
  { id: "bsky-banner", platform: "Bluesky", label: "Profile banner", w: 1500, h: 500 },
  { id: "bsky-avatar", platform: "Bluesky", label: "Avatar", w: 400, h: 400 },
  { id: "threads-post", platform: "Threads", label: "Post", w: 1080, h: 1350 },
  { id: "x-post", platform: "X", label: "Post image", w: 1600, h: 900 },
  { id: "x-header", platform: "X", label: "Header", w: 1500, h: 500 },
  { id: "li-post", platform: "LinkedIn", label: "Post", w: 1200, h: 627 },
  { id: "li-banner", platform: "LinkedIn", label: "Cover", w: 1584, h: 396 },
  { id: "yt-thumb", platform: "YouTube", label: "Thumbnail", w: 1280, h: 720 },
  { id: "og", platform: "Web", label: "Open Graph", w: 1200, h: 630 },
];

export function SocialCropperTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const { image, error, accept, clear } = useImageUpload();
  const [presetId, setPresetId] = useState("ig-square");
  const [offsetX, setOffsetX] = useState(50);
  const [offsetY, setOffsetY] = useState(50);
  const [zoom, setZoom] = useState(100);
  const [background, setBackground] = useState("#ffffff");
  const [fit, setFit] = useState<"cover" | "contain">("cover");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const preset = CROP_PRESETS.find((p) => p.id === presetId) ?? CROP_PRESETS[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    canvas.width = preset.w;
    canvas.height = preset.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, preset.w, preset.h);
    ctx.imageSmoothingQuality = "high";

    const base =
      fit === "cover"
        ? Math.max(preset.w / image.width, preset.h / image.height)
        : Math.min(preset.w / image.width, preset.h / image.height);
    const scale = base * (zoom / 100);
    const dw = image.width * scale;
    const dh = image.height * scale;

    ctx.drawImage(
      image.el,
      (preset.w - dw) * (offsetX / 100),
      (preset.h - dh) * (offsetY / 100),
      dw,
      dh
    );
  }, [image, preset, offsetX, offsetY, zoom, background, fit]);

  const byPlatform = useMemo(() => {
    const map = new Map<string, CropPreset[]>();
    for (const p of CROP_PRESETS) {
      map.set(p.platform, [...(map.get(p.platform) ?? []), p]);
    }
    return [...map.entries()];
  }, []);

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => {
            clear();
            setOffsetX(50);
            setOffsetY(50);
            setZoom(100);
          }}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={
            image && (
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  canvasRef.current &&
                  void downloadCanvas(canvasRef.current, `${baseName(image.name)}-${preset.id}.jpg`, "image/jpeg", 0.94)
                }
              >
                Download
              </Button>
            )
          }
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="social-cropper">
        {error && <ErrorNote>{error}</ErrorNote>}

        {!image ? (
          <Dropzone onFiles={(f) => void accept([...f][0])} label="Drop an image to crop for social" />
        ) : (
          <>
            <Panel title="Preset">
              <div className="flex flex-col gap-3">
                {byPlatform.map(([platform, presets]) => (
                  <div key={platform}>
                    <p className="mb-1.5 text-label font-medium uppercase text-muted-foreground">
                      {platform}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {presets.map((p) => (
                        <Button
                          key={p.id}
                          variant="outline"
                          size="sm"
                          onClick={() => setPresetId(p.id)}
                          className={cn(p.id === presetId && "border-brand text-brand")}
                        >
                          {p.label}
                          <span className="ml-1 text-kbd opacity-60">
                            {p.w}×{p.h}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
              <Panel title="Preview">
                <canvas ref={canvasRef} className="mx-auto max-h-[28rem] rounded-md object-contain" />
              </Panel>

              <Panel title="Framing">
                <div className="flex flex-col gap-3">
                  <Field label="Fit">
                    <Segmented
                      value={fit}
                      onChange={setFit}
                      options={[
                        { value: "cover", label: "Fill" },
                        { value: "contain", label: "Fit" },
                      ]}
                    />
                  </Field>
                  <Field label="Zoom">
                    <Range value={zoom} onChange={setZoom} min={50} max={300} format={(v) => `${v}%`} />
                  </Field>
                  <Field label="Horizontal">
                    <Range value={offsetX} onChange={setOffsetX} min={0} max={100} format={(v) => `${v}%`} />
                  </Field>
                  <Field label="Vertical">
                    <Range value={offsetY} onChange={setOffsetY} min={0} max={100} format={(v) => `${v}%`} />
                  </Field>
                  {fit === "contain" && (
                    <Field label="Letterbox colour">
                      <ColorInput value={background} onChange={setBackground} />
                    </Field>
                  )}
                  <StatRow label="Output" value={`${preset.w} × ${preset.h}`} />
                </div>
              </Panel>
            </div>
          </>
        )}
      </div>
    </ToolShell>
  );
}

// ── Watermarker ─────────────────────────────────────────────────────────────

type Position = "tl" | "tc" | "tr" | "ml" | "mc" | "mr" | "bl" | "bc" | "br";

const POSITIONS: Position[] = ["tl", "tc", "tr", "ml", "mc", "mr", "bl", "bc", "br"];

export function WatermarkerTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const { image, error, accept, clear } = useImageUpload();
  const mark = useImageUpload();
  const [kind, setKind] = useState<"text" | "image">("text");
  const [text, setText] = useState("© Your Name");
  const [color, setColor] = useState("#ffffff");
  const [opacity, setOpacity] = useState(65);
  const [size, setSize] = useState(5);
  const [position, setPosition] = useState<Position>("br");
  const [margin, setMargin] = useState(3);
  const [rotate, setRotate] = useState(0);
  const [tile, setTile] = useState(false);
  const [shadow, setShadow] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(image.el, 0, 0);

    const W = canvas.width;
    const H = canvas.height;
    const pad = (Math.min(W, H) * margin) / 100;
    const fontSize = (Math.min(W, H) * size) / 100;

    ctx.globalAlpha = opacity / 100;

    /** Draw one instance of the mark with its centre at (cx, cy). */
    const drawMark = (cx: number, cy: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      if (rotate !== 0) ctx.rotate((rotate * Math.PI) / 180);

      if (kind === "text") {
        ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (shadow) {
          ctx.shadowColor = "rgba(0,0,0,.45)";
          ctx.shadowBlur = fontSize * 0.18;
          ctx.shadowOffsetY = fontSize * 0.05;
        }
        ctx.fillStyle = color;
        ctx.fillText(text, 0, 0);
      } else if (mark.image) {
        const mw = (W * size * 4) / 100;
        const mh = (mw / mark.image.width) * mark.image.height;
        ctx.drawImage(mark.image.el, -mw / 2, -mh / 2, mw, mh);
      }
      ctx.restore();
    };

    if (tile) {
      const stepX = W / 3.2;
      const stepY = H / 3.2;
      for (let y = stepY / 2; y < H + stepY; y += stepY) {
        for (let x = stepX / 2; x < W + stepX; x += stepX) {
          drawMark(x, y);
        }
      }
    } else {
      const vertical = position[0];
      const horizontal = position[1];

      // Approximate the mark box so edge positions respect the margin.
      let markW = fontSize * text.length * 0.5;
      let markH = fontSize;
      if (kind === "image" && mark.image) {
        markW = (W * size * 4) / 100;
        markH = (markW / mark.image.width) * mark.image.height;
      }

      const cx =
        horizontal === "l" ? pad + markW / 2 : horizontal === "r" ? W - pad - markW / 2 : W / 2;
      const cy = vertical === "t" ? pad + markH / 2 : vertical === "b" ? H - pad - markH / 2 : H / 2;

      drawMark(cx, cy);
    }

    ctx.globalAlpha = 1;
  }, [image, mark.image, kind, text, color, opacity, size, position, margin, rotate, tile, shadow]);

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => {
            clear();
            mark.clear();
          }}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={
            image && (
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  canvasRef.current &&
                  void downloadCanvas(canvasRef.current, `${baseName(image.name)}-watermarked.png`)
                }
              >
                Download
              </Button>
            )
          }
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="watermarker">
        {(error || mark.error) && <ErrorNote>{error ?? mark.error}</ErrorNote>}

        {!image ? (
          <Dropzone onFiles={(f) => void accept([...f][0])} label="Drop the image to watermark" />
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1fr_17rem]">
            <Panel title="Preview">
              <canvas ref={canvasRef} className="mx-auto max-h-[30rem] w-full rounded-md object-contain" />
            </Panel>

            <div className="flex flex-col gap-3">
              <Panel title="Mark">
                <div className="flex flex-col gap-3">
                  <Segmented
                    value={kind}
                    onChange={setKind}
                    options={[
                      { value: "text", label: "Text" },
                      { value: "image", label: "Logo" },
                    ]}
                  />
                  {kind === "text" ? (
                    <>
                      <Field label="Text">
                        <TextInput value={text} onChange={setText} placeholder="© Your Name" />
                      </Field>
                      <Field label="Colour">
                        <ColorInput value={color} onChange={setColor} />
                      </Field>
                      <Toggle checked={shadow} onChange={setShadow} label="Drop shadow" />
                    </>
                  ) : mark.image ? (
                    <div className="flex items-center gap-2.5 rounded-lg bg-background p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mark.image.url} alt="" className="h-10 w-10 rounded object-contain" style={CHECKER_STYLE} />
                      <span className="min-w-0 flex-1 truncate text-caption">{mark.image.name}</span>
                      <Button variant="ghost" size="sm" onClick={mark.clear}>
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <Dropzone
                      onFiles={(f) => void mark.accept([...f][0])}
                      compact
                      label="Drop a logo"
                      hint="PNG with transparency works best"
                    />
                  )}
                </div>
              </Panel>

              <Panel title="Placement">
                <div className="flex flex-col gap-3">
                  <Field label="Position">
                    <div className="grid grid-cols-3 gap-1">
                      {POSITIONS.map((p) => (
                        <button
                          key={p}
                          type="button"
                          aria-label={`Position ${p}`}
                          onClick={() => setPosition(p)}
                          disabled={tile}
                          className={cn(
                            "h-7 rounded-md border text-kbd transition-colors disabled:opacity-40",
                            p === position && !tile
                              ? "border-brand bg-brand/12 text-brand"
                              : "border-border text-muted-foreground hover:bg-[hsl(var(--hover-fill))]"
                          )}
                        >
                          ●
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Toggle checked={tile} onChange={setTile} label="Tile across the image" />
                  <Field label="Size">
                    <Range value={size} onChange={setSize} min={1} max={20} format={(v) => `${v}%`} />
                  </Field>
                  <Field label="Opacity">
                    <Range value={opacity} onChange={setOpacity} min={5} max={100} format={(v) => `${v}%`} />
                  </Field>
                  <Field label="Margin">
                    <Range value={margin} onChange={setMargin} min={0} max={20} format={(v) => `${v}%`} />
                  </Field>
                  <Field label="Rotation">
                    <Range value={rotate} onChange={setRotate} min={-90} max={90} format={(v) => `${v}°`} />
                  </Field>
                </div>
              </Panel>
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
}

// ── Artwork Enhancer ────────────────────────────────────────────────────────

export function ArtworkEnhancerTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const { image, error, accept, clear } = useImageUpload();
  const [amount, setAmount] = useState(18);
  const [grainSize, setGrainSize] = useState(1);
  const [colorNoise, setColorNoise] = useState(true);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [vignette, setVignette] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Tone adjustments run through the canvas filter, which is GPU-backed.
    const filters: string[] = [];
    if (contrast !== 0) filters.push(`contrast(${100 + contrast}%)`);
    if (saturation !== 0) filters.push(`saturate(${100 + saturation}%)`);
    ctx.filter = filters.join(" ") || "none";
    ctx.drawImage(image.el, 0, 0);
    ctx.filter = "none";

    if (amount > 0) {
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data } = frame;
      const step = Math.max(1, Math.round(grainSize));
      const strength = amount * 2.4;

      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const nr = (Math.random() - 0.5) * strength;
          const ng = colorNoise ? (Math.random() - 0.5) * strength : nr;
          const nb = colorNoise ? (Math.random() - 0.5) * strength : nr;

          // Apply the same noise value across the whole grain cell.
          for (let dy = 0; dy < step && y + dy < canvas.height; dy++) {
            for (let dx = 0; dx < step && x + dx < canvas.width; dx++) {
              const i = ((y + dy) * canvas.width + (x + dx)) * 4;
              data[i] += nr;
              data[i + 1] += ng;
              data[i + 2] += nb;
            }
          }
        }
      }
      ctx.putImageData(frame, 0, 0);
    }

    if (vignette > 0) {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = Math.hypot(cx, cy);
      const gradient = ctx.createRadialGradient(cx, cy, radius * 0.45, cx, cy, radius);
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, `rgba(0,0,0,${vignette / 100})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [image, amount, grainSize, colorNoise, contrast, saturation, vignette]);

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
                  canvasRef.current && void downloadCanvas(canvasRef.current, `${baseName(image.name)}-enhanced.png`)
                }
              >
                Download
              </Button>
            )
          }
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="artwork-enhancer">
        {error && <ErrorNote>{error}</ErrorNote>}

        {!image ? (
          <Dropzone
            onFiles={(f) => void accept([...f][0])}
            label="Drop artwork to add grain"
            hint="Noise hides banding in flat gradients and warms up digital art"
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
            <Panel title="Preview">
              <canvas ref={canvasRef} className="mx-auto max-h-[30rem] w-full rounded-md object-contain" />
            </Panel>

            <Panel title="Grain & tone">
              <div className="flex flex-col gap-3">
                <Field label="Noise amount">
                  <Range value={amount} onChange={setAmount} min={0} max={60} />
                </Field>
                <Field label="Grain size">
                  <Range value={grainSize} onChange={setGrainSize} min={1} max={6} format={(v) => `${v}px`} />
                </Field>
                <Toggle checked={colorNoise} onChange={setColorNoise} label="Colour noise" />
                <Field label="Contrast">
                  <Range value={contrast} onChange={setContrast} min={-40} max={60} format={(v) => `${v > 0 ? "+" : ""}${v}`} />
                </Field>
                <Field label="Saturation">
                  <Range value={saturation} onChange={setSaturation} min={-100} max={80} format={(v) => `${v > 0 ? "+" : ""}${v}`} />
                </Field>
                <Field label="Vignette">
                  <Range value={vignette} onChange={setVignette} min={0} max={80} format={(v) => `${v}%`} />
                </Field>
              </div>
            </Panel>
          </div>
        )}
      </div>
    </ToolShell>
  );
}
