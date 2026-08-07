"use client";

import type { Dispatch, PointerEvent, RefObject, SetStateAction } from "react";
import { Button } from "../button";
import { cn } from "../../lib/utils";
import { CHECKER_STYLE, ColorInput, Field, Panel, Range, TextInput, type LoadedImage } from "./shared";
import { NO_ADJUST, TOOLS, type Adjustments, type CropRect, type Tool } from "./image-editor-logic";

/** Canvas element on the checkerboard backdrop, wired to the pointer gestures. */
export function EditorCanvas({
  canvasRef,
  activeTool,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  activeTool: Tool;
  onPointerDown: (e: PointerEvent<HTMLCanvasElement>) => void;
  onPointerMove: (e: PointerEvent<HTMLCanvasElement>) => void;
  onPointerUp: () => void;
}) {
  return (
    <Panel className="p-2">
      <div className="rounded-md p-2" style={CHECKER_STYLE}>
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={cn(
            "mx-auto max-h-[32rem] w-full touch-none object-contain",
            activeTool !== "select" && "cursor-crosshair"
          )}
        />
      </div>
    </Panel>
  );
}

/** Undo/redo/export buttons shown in the tool header once an image is loaded. */
export function EditorActions({
  image,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onDownload,
}: {
  image: LoadedImage | null;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onDownload: () => void;
}) {
  if (!image) return null;
  return (
    <>
      <Button variant="outline" size="sm" onClick={onUndo} disabled={!canUndo}>
        Undo
      </Button>
      <Button variant="outline" size="sm" onClick={onRedo} disabled={!canRedo}>
        Redo
      </Button>
      <Button variant="primary" size="sm" onClick={onDownload}>
        Download
      </Button>
    </>
  );
}

/** Annotation tool picker plus per-tool options (colour, stroke/text, crop info). */
export function ToolsPanel({
  activeTool,
  onSelectTool,
  color,
  onColorChange,
  textValue,
  onTextValueChange,
  fontSize,
  onFontSizeChange,
  strokeWidth,
  onStrokeWidthChange,
  crop,
  onClearCrop,
}: {
  activeTool: Tool;
  onSelectTool: (tool: Tool) => void;
  color: string;
  onColorChange: (color: string) => void;
  textValue: string;
  onTextValueChange: (value: string) => void;
  fontSize: number;
  onFontSizeChange: (value: number) => void;
  strokeWidth: number;
  onStrokeWidthChange: (value: number) => void;
  crop: CropRect | null;
  onClearCrop: () => void;
}) {
  return (
    <Panel title="Tools">
      <div className="grid grid-cols-2 gap-1.5">
        {TOOLS.map((t) => (
          <Button
            key={t.id}
            variant="outline"
            size="sm"
            onClick={() => onSelectTool(t.id)}
            className={cn(activeTool === t.id && "border-brand text-brand")}
          >
            {t.label}
          </Button>
        ))}
      </div>
      <div className="mt-3 flex flex-col gap-3">
        <Field label="Colour">
          <ColorInput value={color} onChange={onColorChange} />
        </Field>
        {activeTool === "text" ? (
          <>
            <Field label="Label text">
              <TextInput value={textValue} onChange={onTextValueChange} />
            </Field>
            <Field label="Font size">
              <Range value={fontSize} onChange={onFontSizeChange} min={10} max={140} format={(v) => `${v}px`} />
            </Field>
          </>
        ) : (
          <Field label="Stroke">
            <Range value={strokeWidth} onChange={onStrokeWidthChange} min={1} max={48} format={(v) => `${v}px`} />
          </Field>
        )}
        {crop && (
          <div className="flex items-center justify-between gap-2 rounded-lg bg-muted px-2.5 py-1.5 text-caption">
            <span>
              Crop {Math.round(crop.w)} × {Math.round(crop.h)}
            </span>
            <Button variant="ghost" size="sm" onClick={onClearCrop}>
              Clear
            </Button>
          </div>
        )}
      </div>
    </Panel>
  );
}

/** Rotate and flip controls for the base image. */
export function TransformPanel({
  setRotation,
  flipH,
  setFlipH,
  flipV,
  setFlipV,
}: {
  setRotation: Dispatch<SetStateAction<number>>;
  flipH: boolean;
  setFlipH: Dispatch<SetStateAction<boolean>>;
  flipV: boolean;
  setFlipV: Dispatch<SetStateAction<boolean>>;
}) {
  return (
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
  );
}

/** Colour/tone sliders applied as a canvas filter to the base image. */
export function AdjustPanel({
  adjust,
  setAdjust,
}: {
  adjust: Adjustments;
  setAdjust: Dispatch<SetStateAction<Adjustments>>;
}) {
  return (
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
  );
}
