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
  /** Raycast-style list row (default) vs denser card */
  variant?: "row" | "card";
  selected?: boolean;
  onMouseEnter?: () => void;
}

export function ToolCard({
  tool,
  onClick,
  isFavorite,
  onToggleFavorite,
  className,
  compact,
  variant = "row",
  selected = false,
  onMouseEnter,
}: ToolCardProps) {
  if (variant === "card") {
    return (
      <div
        className={cn(
          "group relative flex flex-col gap-1.5 rounded-xl border border-border/70 bg-card/70 text-left material-window",
          "transition-[transform,background-color,box-shadow] duration-150 ease-out-strong",
          "active:scale-[0.985] motion-reduce:transition-none motion-reduce:active:scale-100",
          "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-selection-soft/80",
          compact ? "p-2.5" : "p-3.5",
          className
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={() => onClick?.(tool)}
            className="flex min-w-0 flex-1 items-start gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
          >
            <span
              className={cn(
                "row-icon mt-0.5 flex shrink-0 items-center justify-center rounded-[9px] border border-border/80 bg-muted/60 font-semibold text-muted-foreground",
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
              className="shrink-0 opacity-60 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100"
            />
          )}
        </div>
        <button
          type="button"
          onClick={() => onClick?.(tool)}
          className={cn("w-full text-left focus-visible:outline-none", compact ? "pl-8" : "pl-10")}
        >
          <span className={cn("row-desc text-muted-foreground line-clamp-2", compact ? "text-[10px]" : "text-xs")}>
            {tool.description}
          </span>
        </button>
      </div>
    );
  }

  /* Raycast / macOS list row — primary browsing surface */
  return (
    <div
      onMouseEnter={onMouseEnter}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg border border-transparent px-2.5",
        "transition-[transform,background-color,color,border-color] duration-100 ease-out-strong",
        "active:scale-[0.995] motion-reduce:transition-none motion-reduce:active:scale-100",
        selected ? "row-selected" : "row-idle",
        compact ? "py-1.5" : "py-2",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onClick?.(tool)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
      >
        <span
          className={cn(
            "row-icon flex shrink-0 items-center justify-center rounded-[9px] border border-border/70 bg-muted/50 font-semibold",
            selected ? "" : "text-muted-foreground",
            compact ? "h-7 w-7 text-[11px]" : "h-9 w-9 text-xs"
          )}
          aria-hidden
        >
          {tool.name.charAt(0)}
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn("block truncate font-medium tracking-tight", compact ? "text-xs" : "text-[13px]")}>
            {tool.name}
          </span>
          <span
            className={cn(
              "row-desc mt-0.5 block truncate",
              selected ? "" : "text-muted-foreground",
              compact ? "text-[10px]" : "text-xs"
            )}
          >
            {tool.description}
          </span>
        </span>
        {!compact && (
          <span
            className={cn(
              "row-meta hidden shrink-0 text-[11px] sm:inline",
              selected ? "" : "text-muted-foreground/80"
            )}
          >
            {CATEGORY_LABELS[tool.category]}
          </span>
        )}
        <kbd
          className={cn(
            "row-meta hidden shrink-0 sm:inline-flex",
            selected && "border-white/25 bg-white/15 text-white"
          )}
        >
          ↵
        </kbd>
      </button>
      {onToggleFavorite && (
        <FavoriteButton
          active={!!isFavorite}
          onClick={() => onToggleFavorite(tool)}
          className={cn(
            "shrink-0 opacity-50 transition-opacity duration-100",
            "[@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100",
            "focus-visible:opacity-100",
            isFavorite && "opacity-100",
            selected && "text-white opacity-90 [@media(hover:hover)_and_(pointer:fine)]:hover:text-white"
          )}
        />
      )}
    </div>
  );
}
