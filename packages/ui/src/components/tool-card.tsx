"use client";

import type { ToolDefinition } from "@ayetab/utils";
import { CATEGORY_LABELS } from "@ayetab/utils";
import { cn } from "../lib/utils";
import { FavoriteButton } from "./favorite-button";

interface ToolCardProps {
  tool: ToolDefinition;
  onClick?: (tool: ToolDefinition) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (tool: ToolDefinition) => void;
  className?: string;
  compact?: boolean;
}

export function ToolCard({
  tool,
  onClick,
  isFavorite,
  onToggleFavorite,
  className,
  compact,
}: ToolCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-lg border border-border bg-card text-left",
        compact ? "p-2" : "p-4",
        "hover:border-primary/50 hover:bg-accent/50 transition-colors",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => onClick?.(tool)}
          className="flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          <span className={cn("font-medium", compact ? "text-xs" : "text-sm")}>{tool.name}</span>
        </button>
        {onToggleFavorite && (
          <FavoriteButton
            active={!!isFavorite}
            onClick={() => onToggleFavorite(tool)}
            className="shrink-0"
          />
        )}
      </div>
      <button type="button" onClick={() => onClick?.(tool)} className="text-left w-full focus-visible:outline-none">
        <span className={cn("text-muted-foreground line-clamp-2", compact ? "text-[10px]" : "text-xs")}>
          {tool.description}
        </span>
        {!compact && (
          <span className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-wider block">
            {CATEGORY_LABELS[tool.category]}
          </span>
        )}
      </button>
    </div>
  );
}
