"use client";

import type { ToolDefinition } from "@ayetab/utils";
import { isCustomUiTool } from "../lib/custom-tools";
import { CUSTOM_TOOL_COMPONENTS } from "../lib/custom-tool-components";
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
  const CustomComponent = CUSTOM_TOOL_COMPONENTS[props.tool.id];
  if (CustomComponent) {
    return <CustomComponent {...props} />;
  }

  if (isCustomUiTool(props.tool.id)) {
    return null;
  }

  return <ToolRunner {...props} />;
}
