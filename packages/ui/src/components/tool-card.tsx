"use client";

import type { ToolDefinition } from "@ayetab/utils";
import { CATEGORY_LABELS } from "@ayetab/utils";
import { cn } from "../lib/utils";
import { FOCUS_RING } from "../lib/pressable";
import { FavoriteButton } from "./favorite-button";
import { ToolIcon } from "./tool-icon";

interface ToolCardProps {
  tool: ToolDefinition;
  onClick?: (tool: ToolDefinition) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (tool: ToolDefinition) => void;
  className?: string;
  compact?: boolean;
  variant?: "row" | "card";
  selected?: boolean;
  onMouseEnter?: () => void;
  /**
   * When the parent owns arrow-key navigation, only the active row stays in the
   * tab order so Tab exits the list instead of walking all 41 rows.
   */
  roving?: boolean;
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
  roving = false,
}: ToolCardProps) {
  const tabIndex = roving ? (selected ? 0 : -1) : undefined;

  if (variant === "card") {
    return (
      <div
        className={cn(
          "group relative flex flex-col gap-1.5 rounded text-start transition-colors duration-100",
          selected ? "row-selected" : "row-idle",
          compact ? "p-2" : "p-2.5",
          className
        )}
      >
        <div className="flex items-start justify-between gap-2">
          {/*
            One button per destination. The title and description used to be two
            separate buttons pointing at the same tool, doubling the tab stops.
          */}
          <button
            type="button"
            onClick={() => onClick?.(tool)}
            tabIndex={tabIndex}
            className={cn("flex min-w-0 flex-1 flex-col gap-1 rounded text-start", FOCUS_RING)}
          >
            <span className="flex items-start gap-2">
              <ToolIcon
                name={tool.icon}
                className={cn(
                  "mt-0.5 shrink-0",
                  compact ? "h-4 w-4" : "h-[18px] w-[18px]",
                  !selected && "text-muted-foreground"
                )}
              />
              <span className={cn("font-medium", compact ? "text-caption" : "text-ui-md")}>
                {tool.name}
              </span>
            </span>
            <span
              className={cn(
                "line-clamp-2 text-pretty text-muted-foreground",
                compact ? "ps-6 text-kbd" : "ps-6 text-caption"
              )}
            >
              {tool.description}
            </span>
          </button>
          {onToggleFavorite && (
            <FavoriteButton
              active={!!isFavorite}
              onClick={() => onToggleFavorite(tool)}
              className="shrink-0 opacity-60 group-hover:opacity-100"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseEnter={onMouseEnter}
      className={cn(
        "group relative flex items-center gap-2.5 rounded px-2 transition-colors duration-100",
        selected ? "row-selected" : "row-idle",
        compact ? "py-1" : "py-1.5",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onClick?.(tool)}
        tabIndex={tabIndex}
        data-row-button
        className={cn("flex min-w-0 flex-1 items-center gap-2.5 rounded text-start", FOCUS_RING)}
      >
        <ToolIcon
          name={tool.icon}
          className={cn(
            "shrink-0",
            compact ? "h-4 w-4" : "h-[17px] w-[17px]",
            !selected && "text-muted-foreground"
          )}
        />
        <span className="min-w-0 flex-1">
          <span className={cn("block truncate font-medium", compact ? "text-ui" : "text-ui-md")}>
            {tool.name}
          </span>
          {/* Truncated copy needs a way back — the title attribute is the cheapest one. */}
          <span
            title={tool.description}
            className={cn(
              "mt-0.5 block truncate text-muted-foreground",
              compact ? "text-kbd" : "text-caption"
            )}
          >
            {tool.description}
          </span>
        </span>
        {!compact && (
          <span className="hidden shrink-0 whitespace-nowrap text-caption text-muted-foreground sm:inline">
            {CATEGORY_LABELS[tool.category]}
          </span>
        )}
      </button>
      {onToggleFavorite && (
        <FavoriteButton
          active={!!isFavorite}
          onClick={() => onToggleFavorite(tool)}
          className={cn(
            "shrink-0 opacity-0 transition-opacity duration-100",
            "group-hover:opacity-100 focus-visible:opacity-100",
            isFavorite && "opacity-100"
          )}
        />
      )}
    </div>
  );
}
