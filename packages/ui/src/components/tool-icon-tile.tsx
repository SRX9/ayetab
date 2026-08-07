"use client";

import type { ToolDefinition } from "@ayetab/utils";
import { cn } from "../lib/utils";
import { FOCUS_RING } from "../lib/pressable";
import { ToolIcon } from "./tool-icon";

interface ToolIconTileProps {
  tool: ToolDefinition;
  onClick?: (tool: ToolDefinition) => void;
  size?: number;
  active?: boolean;
  className?: string;
  /** Show the tool name under the tile (grid mode). */
  showLabel?: boolean;
}

/**
 * Glossy squircle tile — the OS "app icon" for a tool. Used in the dock and
 * the launcher grid. Press feedback is instant on pointer-down.
 */
export function ToolIconTile({
  tool,
  onClick,
  size = 52,
  active,
  className,
  showLabel,
}: ToolIconTileProps) {
  const iconSize = Math.round(size * 0.5);
  const tile = (
    <span
      className={cn("app-icon", active && "app-icon-active", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <ToolIcon name={tool.icon} size={iconSize} />
    </span>
  );

  if (showLabel) {
    return (
      <button
        type="button"
        onClick={() => onClick?.(tool)}
        className={cn(
          "group flex w-full flex-col items-center gap-1.5 outline-none",
          FOCUS_RING
        )}
        title={tool.name}
      >
        {tile}
        <span className="max-w-full truncate text-caption text-muted-foreground transition-colors group-hover:text-foreground">
          {tool.name}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onClick?.(tool)}
      className={cn("outline-none", FOCUS_RING)}
      title={tool.name}
      aria-label={tool.name}
    >
      {tile}
    </button>
  );
}
