"use client";

import { Suspense } from "react";
import type { ToolDefinition } from "@ayetab/utils";
import { isCustomUiTool } from "../lib/custom-tools";
import { CUSTOM_TOOL_COMPONENTS } from "../lib/custom-tool-components";
import { LoadingState } from "./productivity/shared";
import { ToolRunner } from "./tool-runner";

interface ToolHostProps {
  tool: ToolDefinition;
  initialInput?: string;
  onNavigate?: (tool: ToolDefinition, input: string) => void;
  onRecent?: (toolId: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  compact?: boolean;
  /** Standalone tool page: owns the `h1` and can afford a side-by-side layout. */
  standalone?: boolean;
}

export function ToolHost(props: ToolHostProps) {
  const CustomComponent = CUSTOM_TOOL_COMPONENTS[props.tool.id];
  if (CustomComponent) {
    // Custom tool UIs are lazy-loaded, so each needs a boundary while its
    // chunk arrives. Keyed on the tool id so switching tools resets it.
    return (
      <Suspense key={props.tool.id} fallback={<LoadingState label="Loading tool…" />}>
        <CustomComponent {...props} />
      </Suspense>
    );
  }

  if (isCustomUiTool(props.tool.id)) {
    return null;
  }

  return <ToolRunner {...props} />;
}
