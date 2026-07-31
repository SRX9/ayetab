"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ToolShell } from "../tool-shell";
import { Button } from "../button";
import { cn } from "../../lib/utils";
import {
  CHECKER_STYLE,
  ColorInput,
  CustomToolProps,
  Dropzone,
  ErrorNote,
  Field,
  Panel,
  Range,
  Segmented,
  Select,
  StatRow,
  TextInput,
  ToolActions,
  baseName,
  downloadCanvas,
  useImageUpload,
} from "./shared";

type Tool = "select" | "crop" | "pen" | "line" | "arrow" | "rect" | "ellipse" | "text" | "blur";

interface Shape {
  id: string;
  tool: Tool;
  color: string;
  width: number;
  points: Array<{ x: number; y: number }>;
  text?: string;
  filled?: boolean;
}

interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: number;
  sepia: number;
  invert: number;
  hue: number;
}

const NO_ADJUST: Adjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  invert: 0,
  hue: 0,
};

const filterString = (a: Adjustments) =>
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

export function ImageEditorTool({ tool: toolDef, isFavorite, onToggleFavorite }: CustomToolProps) {
  const { image, error, accept, clear } = useImageUpload();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [activeTool, setActiveTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#ef4444");
  const [strokeWidth, setStrokeWidth] = useState(6);
  const [fontSize, setFontSize] = useState(32);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [adjust, setAdjust] = useState<Adjustments>(NO_ADJUST);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [redoStack, setRedoStack] = useState<Shape[]>([]);
  const [draft, setDraft] = useState<Shape | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [textValue, setTextValue] = useState("Label");

  const drawing = useRef(false);

  // Rotating by 90/270 swaps the canvas dimensions.
  const swapped = rotation === 90 || rotation === 270;
  const outW = image ? (swapped ? image.height : image.width) : 0;
  const outH = image ? (swapped ? image.width : image.height) : 0;

  /** Repaint the whole scene: transformed image, then every annotation. */
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, outW, outH);

    ctx.save();
    ctx.translate(outW / 2, outH / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.filter = filterString(adjust);
    ctx.drawImage(image.el, -image.width / 2, -image.height / 2);
    ctx.restore();

    ctx.filter = "none";

    const paint = (s: Shape) => {
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
    };

    for (const s of shapes) paint(s);
    if (draft) paint(draft);

    if (crop) {
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,.5)";
      ctx.fillRect(0, 0, outW, outH);
      ctx.clearRect(crop.x, crop.y, crop.w, crop.h);
      ctx.save();
      ctx.beginPath();
      ctx.rect(crop.x, crop.y, crop.w, crop.h);
      ctx.clip();
      ctx.translate(outW / 2, outH / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.filter = filterString(adjust);
      ctx.drawImage(image.el, -image.width / 2, -image.height / 2);
      ctx.restore();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(crop.x, crop.y, crop.w, crop.h);
      ctx.restore();
    }
  }, [image, outW, outH, rotation, flipH, flipV, adjust, shapes, draft, crop]);

  useEffect(render, [render]);

  const toCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!image || activeTool === "select") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const p = toCanvasPoint(e);

    if (activeTool === "crop") {
      setCrop({ x: p.x, y: p.y, w: 0, h: 0 });
      return;
    }

    if (activeTool === "text") {
      setShapes((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          tool: "text",
          color,
          width: fontSize / 5,
          points: [p],
          text: textValue,
        },
      ]);
      setRedoStack([]);
      drawing.current = false;
      return;
    }

    setDraft({ id: crypto.randomUUID(), tool: activeTool, color, width: strokeWidth, points: [p] });
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const p = toCanvasPoint(e);

    if (activeTool === "crop") {
      setCrop((prev) => (prev ? { ...prev, w: p.x - prev.x, h: p.y - prev.y } : prev));
      return;
    }

    setDraft((prev) => {
      if (!prev) return prev;
      // Freehand keeps every point; the shape tools only need start and end.
      return prev.tool === "pen"
        ? { ...prev, points: [...prev.points, p] }
        : { ...prev, points: [prev.points[0], p] };
    });
  };

  const onPointerUp = () => {
    drawing.current = false;
    if (activeTool === "crop") {
      setCrop((prev) => {
        if (!prev) return prev;
        // Normalise so negative drags still produce a valid rectangle.
        const x = prev.w < 0 ? prev.x + prev.w : prev.x;
        const y = prev.h < 0 ? prev.y + prev.h : prev.y;
        const w = Math.abs(prev.w);
        const h = Math.abs(prev.h);
        return w > 4 && h > 4 ? { x, y, w, h } : null;
      });
      return;
    }
    if (draft && draft.points.length > 0) {
      setShapes((prev) => [...prev, draft]);
      setRedoStack([]);
    }
    setDraft(null);
  };

  const undo = () => {
    setShapes((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setRedoStack((r) => [...r, last]);
      return prev.slice(0, -1);
    });
  };

  const redo = () => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setShapes((s) => [...s, last]);
      return prev.slice(0, -1);
    });
  };

  /** Flatten everything to a canvas, applying the crop box if one is set. */
  const exportCanvas = (): HTMLCanvasElement | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    if (!crop) return canvas;

    const out = document.createElement("canvas");
    out.width = Math.round(crop.w);
    out.height = Math.round(crop.h);
    const ctx = out.getContext("2d");
    if (!ctx) return canvas;

    // Re-render without the crop overlay before slicing out the region.
    const clean = document.createElement("canvas");
    clean.width = canvas.width;
    clean.height = canvas.height;
    const cctx = clean.getContext("2d");
    if (cctx && image) {
      cctx.save();
      cctx.translate(canvas.width / 2, canvas.height / 2);
      cctx.rotate((rotation * Math.PI) / 180);
      cctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      cctx.filter = filterString(adjust);
      cctx.drawImage(image.el, -image.width / 2, -image.height / 2);
      cctx.restore();
    }

    ctx.drawImage(clean, crop.x, crop.y, crop.w, crop.h, 0, 0, out.width, out.height);
    return out;
  };

  const TOOLS: Array<{ id: Tool; label: string }> = [
    { id: "pen", label: "Pen" },
    { id: "line", label: "Line" },
    { id: "arrow", label: "Arrow" },
    { id: "rect", label: "Box" },
    { id: "ellipse", label: "Ellipse" },
    { id: "text", label: "Text" },
    { id: "blur", label: "Blur" },
    { id: "crop", label: "Crop" },
  ];

  return (
    <ToolShell
      title={toolDef.name}
      description={toolDef.description}
      actions={
        <ToolActions
          onClear={() => {
            clear();
            setShapes([]);
            setRedoStack([]);
            setCrop(null);
            setAdjust(NO_ADJUST);
            setRotation(0);
          }}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={
            image && (
              <>
                <Button variant="outline" size="sm" onClick={undo} disabled={shapes.length === 0}>
                  Undo
                </Button>
                <Button variant="outline" size="sm" onClick={redo} disabled={redoStack.length === 0}>
                  Redo
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const out = exportCanvas();
                    if (out) void downloadCanvas(out, `${baseName(image.name)}-edited.png`);
                  }}
                >
                  Download
                </Button>
              </>
            )
          }
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="image-editor">
        {error && <ErrorNote>{error}</ErrorNote>}

        {!image ? (
          <Dropzone
            onFiles={(f) => void accept([...f][0])}
            label="Drop an image to edit"
            hint="Crop, rotate, adjust and mark up — everything stays on your device"
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
            <Panel className="p-2">
              <div className="rounded-md p-2" style={CHECKER_STYLE}>
                <canvas
                  ref={canvasRef}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  className={cn(
                    "mx-auto max-h-[32rem] w-full touch-none object-contain",
                    activeTool !== "select" && "cursor-crosshair"
                  )}
                />
              </div>
            </Panel>

            <div className="flex flex-col gap-3">
              <Panel title="Tools">
                <div className="grid grid-cols-2 gap-1.5">
                  {TOOLS.map((t) => (
                    <Button
                      key={t.id}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveTool(t.id);
                        if (t.id !== "crop") setCrop(null);
                      }}
                      className={cn(activeTool === t.id && "border-brand text-brand")}
                    >
                      {t.label}
                    </Button>
                  ))}
                </div>
                <div className="mt-3 flex flex-col gap-3">
                  <Field label="Colour">
                    <ColorInput value={color} onChange={setColor} />
                  </Field>
                  {activeTool === "text" ? (
                    <>
                      <Field label="Label text">
                        <TextInput value={textValue} onChange={setTextValue} />
                      </Field>
                      <Field label="Font size">
                        <Range value={fontSize} onChange={setFontSize} min={10} max={140} format={(v) => `${v}px`} />
                      </Field>
                    </>
                  ) : (
                    <Field label="Stroke">
                      <Range value={strokeWidth} onChange={setStrokeWidth} min={1} max={48} format={(v) => `${v}px`} />
                    </Field>
                  )}
                  {crop && (
                    <div className="flex items-center justify-between gap-2 rounded-lg bg-muted px-2.5 py-1.5 text-caption">
                      <span>
                        Crop {Math.round(crop.w)} × {Math.round(crop.h)}
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => setCrop(null)}>
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
              </Panel>

              <Panel title="Transform">
                <div className="flex flex-col gap-2">
                  <div className="flex gap-1.5">
                    <Button variant="outline" size="sm" onClick={() => setRotation((r) => (r + 270) % 360)}>
                      ⟲ 90°
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setRotation((r) => (r + 90) % 360)}>
                      ⟳ 90°
                    </Button>
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFlipH((v) => !v)}
                      className={cn(flipH && "border-brand text-brand")}
                    >
                      Flip H
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFlipV((v) => !v)}
                      className={cn(flipV && "border-brand text-brand")}
                    >
                      Flip V
                    </Button>
                  </div>
                </div>
              </Panel>

              <Panel
                title="Adjust"
                actions={
                  <Button variant="ghost" size="sm" onClick={() => setAdjust(NO_ADJUST)}>
                    Reset
                  </Button>
                }
              >
                <div className="flex flex-col gap-2.5">
                  <Field label="Brightness">
                    <Range
                      value={adjust.brightness}
                      onChange={(v) => setAdjust((a) => ({ ...a, brightness: v }))}
                      min={0}
                      max={200}
                      format={(v) => `${v}%`}
                    />
                  </Field>
                  <Field label="Contrast">
                    <Range
                      value={adjust.contrast}
                      onChange={(v) => setAdjust((a) => ({ ...a, contrast: v }))}
                      min={0}
                      max={200}
                      format={(v) => `${v}%`}
                    />
                  </Field>
                  <Field label="Saturation">
                    <Range
                      value={adjust.saturation}
                      onChange={(v) => setAdjust((a) => ({ ...a, saturation: v }))}
                      min={0}
                      max={250}
                      format={(v) => `${v}%`}
                    />
                  </Field>
                  <Field label="Hue">
                    <Range
                      value={adjust.hue}
                      onChange={(v) => setAdjust((a) => ({ ...a, hue: v }))}
                      min={0}
                      max={360}
                      format={(v) => `${v}°`}
                    />
                  </Field>
                  <Field label="Greyscale">
                    <Range
                      value={adjust.grayscale}
                      onChange={(v) => setAdjust((a) => ({ ...a, grayscale: v }))}
                      format={(v) => `${v}%`}
                    />
                  </Field>
                  <Field label="Sepia">
                    <Range
                      value={adjust.sepia}
                      onChange={(v) => setAdjust((a) => ({ ...a, sepia: v }))}
                      format={(v) => `${v}%`}
                    />
                  </Field>
                  <Field label="Blur">
                    <Range
                      value={adjust.blur}
                      onChange={(v) => setAdjust((a) => ({ ...a, blur: v }))}
                      min={0}
                      max={24}
                      format={(v) => `${v}px`}
                    />
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
