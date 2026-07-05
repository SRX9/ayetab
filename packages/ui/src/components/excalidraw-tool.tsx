"use client";

import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ToolDefinition } from "@ayetab/utils";
import type {
  AppState,
  BinaryFiles,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types";
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import { ToolShell } from "./tool-shell";
import { FavoriteButton } from "./favorite-button";
import { useToolState } from "../hooks/use-tool-state";
import { useTheme } from "./theme-provider";
import "@excalidraw/excalidraw/index.css";

const ExcalidrawCanvas = lazy(() =>
  import("@excalidraw/excalidraw").then((mod) => ({ default: mod.Excalidraw }))
);

function parseScene(input: string): ExcalidrawInitialDataState | null {
  if (!input.trim()) return null;
  try {
    const data = JSON.parse(input) as ExcalidrawInitialDataState;
    if (!data || typeof data !== "object") return null;
    return data;
  } catch {
    return null;
  }
}

function serializeScene(
  elements: readonly OrderedExcalidrawElement[],
  appState: AppState,
  files: BinaryFiles
): string {
  const data: ExcalidrawInitialDataState = {
    elements,
    appState: {
      viewBackgroundColor: appState.viewBackgroundColor,
      currentItemFontFamily: appState.currentItemFontFamily,
      currentItemStrokeColor: appState.currentItemStrokeColor,
      currentItemBackgroundColor: appState.currentItemBackgroundColor,
      currentItemFillStyle: appState.currentItemFillStyle,
      currentItemStrokeWidth: appState.currentItemStrokeWidth,
      currentItemRoughness: appState.currentItemRoughness,
      currentItemOpacity: appState.currentItemOpacity,
      gridSize: appState.gridSize,
      scrollX: appState.scrollX,
      scrollY: appState.scrollY,
      zoom: appState.zoom,
    },
    files,
  };
  return JSON.stringify(data);
}

interface ExcalidrawToolProps {
  tool: ToolDefinition;
  onRecent?: (toolId: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  compact?: boolean;
}

export function ExcalidrawTool({
  tool,
  onRecent,
  isFavorite,
  onToggleFavorite,
  compact,
}: ExcalidrawToolProps) {
  const { theme } = useTheme();
  const { input, setInput, reset, isHydrated } = useToolState(tool.id);
  const skipChangeRef = useRef(true);
  const [canvasKey, setCanvasKey] = useState(0);

  useEffect(() => {
    onRecent?.(tool.id);
  }, [tool.id, onRecent]);

  const initialData = useMemo(() => parseScene(input), [input]);

  useEffect(() => {
    if (isHydrated) {
      skipChangeRef.current = true;
    }
  }, [isHydrated, canvasKey]);

  const handleChange = useCallback(
    (elements: readonly OrderedExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
      if (skipChangeRef.current) {
        skipChangeRef.current = false;
        return;
      }
      setInput(serializeScene(elements, appState, files));
    },
    [setInput]
  );

  const handleExport = useCallback(() => {
    const blob = new Blob([input || '{"type":"excalidraw","version":2,"source":"ayetab","elements":[]}'], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "drawing.excalidraw";
    a.click();
    URL.revokeObjectURL(url);
  }, [input]);

  const handleClear = useCallback(() => {
    reset();
    setCanvasKey((key) => key + 1);
  }, [reset]);

  const canvasHeight = compact ? "min-h-[28rem] h-[calc(100vh-6rem)]" : "h-[calc(100vh-12rem)]";

  const actions = (
    <>
      {onToggleFavorite && <FavoriteButton active={!!isFavorite} onClick={onToggleFavorite} />}
      <button
        type="button"
        onClick={handleExport}
        disabled={!input.trim()}
        className="text-xs px-2 py-1 rounded border border-border hover:bg-accent transition-colors disabled:opacity-50"
      >
        Export
      </button>
      <button
        type="button"
        onClick={handleClear}
        className="text-xs px-2 py-1 rounded border border-border hover:bg-accent transition-colors"
      >
        Clear
      </button>
    </>
  );

  return (
    <ToolShell title={tool.name} description={tool.description} actions={actions}>
      <div
        className={`${canvasHeight} w-full rounded-lg border border-border overflow-hidden bg-background`}
        data-testid="excalidraw-canvas"
      >
        {isHydrated ? (
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Loading canvas…
              </div>
            }
          >
            <div className="h-full w-full">
              <ExcalidrawCanvas
                key={canvasKey}
                initialData={initialData ?? undefined}
                onChange={handleChange}
                theme={theme === "dark" ? "dark" : "light"}
              />
            </div>
          </Suspense>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Loading saved drawing…
          </div>
        )}
      </div>
    </ToolShell>
  );
}
