"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import type { LoadedImage } from "./shared";
import {
  drawTransformedImage,
  normalizeCropRect,
  paintShape,
  toCanvasPoint,
  NO_ADJUST,
  type Adjustments,
  type CropRect,
  type Shape,
  type Tool,
} from "./image-editor-logic";

/** Committed annotations plus the redo stack, with commit/undo/redo/clear actions. */
export function useEditorScene() {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [redoStack, setRedoStack] = useState<Shape[]>([]);

  const commitShape = (shape: Shape) => {
    setShapes((prev) => [...prev, shape]);
    setRedoStack([]);
  };

  const undo = () => {
    if (shapes.length === 0) return;
    const last = shapes[shapes.length - 1];
    setRedoStack((r) => [...r, last]);
    setShapes((prev) => prev.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const last = redoStack[redoStack.length - 1];
    setShapes((s) => [...s, last]);
    setRedoStack((prev) => prev.slice(0, -1));
  };

  const clearScene = () => {
    setShapes([]);
    setRedoStack([]);
  };

  return { shapes, redoStack, commitShape, undo, redo, clearScene };
}

/** Rotation, flips and colour adjustments applied to the base image. */
export function useEditorTransforms() {
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [adjust, setAdjust] = useState<Adjustments>(NO_ADJUST);

  return { rotation, setRotation, flipH, setFlipH, flipV, setFlipV, adjust, setAdjust };
}

interface CanvasScene {
  image: LoadedImage | null;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  adjust: Adjustments;
  shapes: Shape[];
  draft: Shape | null;
  crop: CropRect | null;
}

/** Owns the canvas element and repaints the full scene whenever it changes. */
export function useEditorCanvasRenderer({
  image,
  rotation,
  flipH,
  flipV,
  adjust,
  shapes,
  draft,
  crop,
}: CanvasScene) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    drawTransformedImage(ctx, image, outW, outH, { rotation, flipH, flipV, adjust });
    ctx.filter = "none";

    for (const s of shapes) paintShape(ctx, canvas, s);
    if (draft) paintShape(ctx, canvas, draft);

    if (crop) {
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,.5)";
      ctx.fillRect(0, 0, outW, outH);
      ctx.clearRect(crop.x, crop.y, crop.w, crop.h);
      ctx.save();
      ctx.beginPath();
      ctx.rect(crop.x, crop.y, crop.w, crop.h);
      ctx.clip();
      drawTransformedImage(ctx, image, outW, outH, { rotation, flipH, flipV, adjust });
      ctx.restore();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(crop.x, crop.y, crop.w, crop.h);
      ctx.restore();
    }
  }, [image, outW, outH, rotation, flipH, flipV, adjust, shapes, draft, crop]);

  // Repaint after every commit that changes the scene — the canvas is an
  // external output, so this sync belongs in an effect rather than being
  // fanned out across the many handlers that touch scene state.
  // eslint-disable-next-line react-doctor/no-event-handler
  useEffect(() => {
    render();
  }, [render]);

  return { canvasRef };
}

interface InteractionConfig {
  image: LoadedImage | null;
  activeTool: Tool;
  color: string;
  strokeWidth: number;
  fontSize: number;
  textValue: string;
  commitShape: (shape: Shape) => void;
}

/** Pointer gestures on the canvas: shape drafts, text placement and crop drags. */
export function useEditorInteractions({
  image,
  activeTool,
  color,
  strokeWidth,
  fontSize,
  textValue,
  commitShape,
}: InteractionConfig) {
  const drawing = useRef(false);
  const [draft, setDraft] = useState<Shape | null>(null);
  const [crop, setCrop] = useState<CropRect | null>(null);

  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!image || activeTool === "select") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const p = toCanvasPoint(e);

    if (activeTool === "crop") {
      setCrop({ x: p.x, y: p.y, w: 0, h: 0 });
      return;
    }

    if (activeTool === "text") {
      commitShape({
        id: crypto.randomUUID(),
        tool: "text",
        color,
        width: fontSize / 5,
        points: [p],
        text: textValue,
      });
      drawing.current = false;
      return;
    }

    setDraft({ id: crypto.randomUUID(), tool: activeTool, color, width: strokeWidth, points: [p] });
  };

  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
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
      setCrop((prev) => (prev ? normalizeCropRect(prev) : prev));
      return;
    }
    if (draft && draft.points.length > 0) {
      commitShape(draft);
    }
    setDraft(null);
  };

  return { draft, crop, setCrop, onPointerDown, onPointerMove, onPointerUp };
}
