"use client";

import type { ToolDefinition } from "@ayetab/utils";
import { isCustomUiTool } from "../lib/custom-tools";
import { ExcalidrawTool } from "./excalidraw-tool";
import { ToolRunner } from "./tool-runner";

interface ToolHostProps {
  tool: ToolDefinition;
  initialInput?: string;
  onNavigate?: (tool: ToolDefinition, input: string) => void;
  onRecent?: (toolId: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  compact?: boolean;
}

export function ToolHost(props: ToolHostProps) {
  if (props.tool.id === "excalidraw") {
    return <ExcalidrawTool {...props} />;
  }

  if (isCustomUiTool(props.tool.id)) {
    return null;
  }

  return <ToolRunner {...props} />;
}
