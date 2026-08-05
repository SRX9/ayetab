"use client";

import { useState } from "react";
import { ToolShell } from "../tool-shell";
import {
  CustomToolProps,
  Dropzone,
  ErrorNote,
  ToolActions,
  baseName,
  downloadCanvas,
  useImageUpload,
} from "./shared";
import { NO_ADJUST, buildExportCanvas, type Tool } from "./image-editor-logic";
import {
  useEditorCanvasRenderer,
  useEditorInteractions,
  useEditorScene,
  useEditorTransforms,
} from "./image-editor-hooks";
import { AdjustPanel, EditorActions, EditorCanvas, ToolsPanel, TransformPanel } from "./image-editor-panels";

export function ImageEditorTool({ tool: toolDef, isFavorite, onToggleFavorite }: CustomToolProps) {
  const { image, error, accept, clear } = useImageUpload();
  const { shapes, redoStack, commitShape, undo, redo, clearScene } = useEditorScene();
  const { rotation, setRotation, flipH, setFlipH, flipV, setFlipV, adjust, setAdjust } = useEditorTransforms();

  const [activeTool, setActiveTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#ef4444");
  const [strokeWidth, setStrokeWidth] = useState(6);
  const [fontSize, setFontSize] = useState(32);
  const [textValue, setTextValue] = useState("Label");

  const { draft, crop, setCrop, onPointerDown, onPointerMove, onPointerUp } = useEditorInteractions({
    image,
    activeTool,
    color,
    strokeWidth,
    fontSize,
    textValue,
    commitShape,
  });
  const { canvasRef } = useEditorCanvasRenderer({ image, rotation, flipH, flipV, adjust, shapes, draft, crop });

  const onSelectTool = (t: Tool) => {
    setActiveTool(t);
    if (t !== "crop") setCrop(null);
  };

  const onClear = () => {
    clear();
    clearScene();
    setCrop(null);
    setAdjust(NO_ADJUST);
    setRotation(0);
  };

  const onDownload = () => {
    const out = buildExportCanvas(canvasRef.current, crop, image, { rotation, flipH, flipV, adjust });
    if (out && image) void downloadCanvas(out, `${baseName(image.name)}-edited.png`);
  };

  return (
    <ToolShell
      title={toolDef.name}
      description={toolDef.description}
      actions={
        <ToolActions
          onClear={onClear}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={
            <EditorActions
              image={image}
              canUndo={shapes.length > 0}
              canRedo={redoStack.length > 0}
              onUndo={undo}
              onRedo={redo}
              onDownload={onDownload}
            />
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
            <EditorCanvas
              canvasRef={canvasRef}
              activeTool={activeTool}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            />

            <div className="flex flex-col gap-3">
              <ToolsPanel
                activeTool={activeTool}
                onSelectTool={onSelectTool}
                color={color}
                onColorChange={setColor}
                textValue={textValue}
                onTextValueChange={setTextValue}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
                strokeWidth={strokeWidth}
                onStrokeWidthChange={setStrokeWidth}
                crop={crop}
                onClearCrop={() => setCrop(null)}
              />
              <TransformPanel
                setRotation={setRotation}
                flipH={flipH}
                setFlipH={setFlipH}
                flipV={flipV}
                setFlipV={setFlipV}
              />
              <AdjustPanel adjust={adjust} setAdjust={setAdjust} />
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
}
