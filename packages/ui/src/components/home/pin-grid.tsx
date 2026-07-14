"use client";

import { Plus, X } from "lucide-react";
import type { ToolDefinition } from "@ayetab/utils";
import { cn } from "../../lib/utils";
import { ToolIcon } from "../tool-icon";

interface PinGridProps {
  tools: ToolDefinition[];
  editing?: boolean;
  onOpen: (tool: ToolDefinition) => void;
  onRemovePin?: (toolId: string) => void;
  onAddPin?: () => void;
  compact?: boolean;
}

export function PinGrid({
  tools,
  editing,
  onOpen,
  onRemovePin,
  onAddPin,
  compact,
}: PinGridProps) {
  return (
    <div
      className={cn(
        "grid gap-3",
        compact ? "grid-cols-4" : "grid-cols-4 sm:grid-cols-5 md:grid-cols-6"
      )}
      data-testid="home-pins"
    >
      {tools.map((tool) => (
        <div key={tool.id} className="relative flex flex-col items-center gap-1.5">
          {editing && onRemovePin && (
            <button
              type="button"
              aria-label={`Remove ${tool.name}`}
              onClick={() => onRemovePin(tool.id)}
              className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-foreground"
            >
              <X className="h-3 w-3" strokeWidth={2} />
            </button>
          )}
          <button
            type="button"
            onClick={() => !editing && onOpen(tool)}
            disabled={editing}
            className={cn(
              "flex h-14 w-14 flex-col items-center justify-center rounded-[18px]",
              "bg-selection/10 text-selection",
              "transition-[transform,background-color] duration-150 ease-out-strong",
              !editing && "active:scale-[0.94] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-selection/15",
              editing && "opacity-90"
            )}
            aria-label={tool.name}
          >
            <ToolIcon name={tool.icon} className="h-6 w-6" />
          </button>
          <span className="w-full truncate text-center text-[11px] font-medium leading-tight tracking-tight">
            {tool.name.split(" ")[0]}
          </span>
        </div>
      ))}
      {editing && onAddPin && (
        <button
          type="button"
          onClick={onAddPin}
          className="flex flex-col items-center gap-1.5"
          aria-label="Add app"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-dashed border-border/70 text-muted-foreground transition-colors [@media(hover:hover)_and_(pointer:fine)]:hover:border-selection/40 [@media(hover:hover)_and_(pointer:fine)]:hover:text-selection">
            <Plus className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <span className="text-[11px] font-medium text-muted-foreground">Add</span>
        </button>
      )}
    </div>
  );
}
