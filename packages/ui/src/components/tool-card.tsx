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
        "group relative flex flex-col gap-1.5 rounded-lg border border-border/80 bg-card/80 text-left",
        "transition-[transform,border-color,background-color,box-shadow] duration-200 ease-out-strong",
        "active:scale-[0.985]",
        "motion-reduce:transition-none motion-reduce:active:scale-100",
        "[@media(hover:hover)_and_(pointer:fine)]:hover:border-brand/35 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-accent/40",
        "[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_8px_24px_-16px_hsl(var(--foreground)/0.25)]",
        compact ? "p-2.5" : "p-4",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => onClick?.(tool)}
          className="flex min-w-0 flex-1 items-start gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          <span
            className={cn(
              "mt-0.5 flex shrink-0 items-center justify-center rounded-md border border-border bg-background font-medium text-muted-foreground",
              "transition-[border-color,color,background-color] duration-200 ease-out-strong",
              "[@media(hover:hover)_and_(pointer:fine)]:group-hover:border-brand/30 [@media(hover:hover)_and_(pointer:fine)]:group-hover:text-brand",
              compact ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs"
            )}
            aria-hidden
          >
            {tool.name.charAt(0)}
          </span>
          <span className={cn("font-medium tracking-tight", compact ? "text-xs" : "text-sm")}>
            {tool.name}
          </span>
        </button>
        {onToggleFavorite && (
          <FavoriteButton
            active={!!isFavorite}
            onClick={() => onToggleFavorite(tool)}
            className="shrink-0 opacity-70 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100"
          />
        )}
      </div>
      <button
        type="button"
        onClick={() => onClick?.(tool)}
        className={cn("w-full text-left focus-visible:outline-none", compact ? "pl-8" : "pl-10")}
      >
        <span className={cn("text-muted-foreground line-clamp-2", compact ? "text-[10px]" : "text-xs")}>
          {tool.description}
        </span>
        {!compact && (
          <span className="mt-1.5 block text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
            {CATEGORY_LABELS[tool.category]}
          </span>
        )}
      </button>
    </div>
  );
}
