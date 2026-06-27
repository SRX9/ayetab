"use client";

import type { ToolDefinition } from "@ayetab/utils";
import { CATEGORY_LABELS } from "@ayetab/utils";
import { cn } from "../lib/utils";

interface ToolCardProps {
  tool: ToolDefinition;
  onClick?: (tool: ToolDefinition) => void;
  className?: string;
}

export function ToolCard({ tool, onClick, className }: ToolCardProps) {
  return (
    <button
      onClick={() => onClick?.(tool)}
      className={cn(
        "flex flex-col gap-1 rounded-lg border border-border bg-card p-4 text-left",
        "hover:border-primary/50 hover:bg-accent/50 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <span className="font-medium text-sm">{tool.name}</span>
      <span className="text-xs text-muted-foreground line-clamp-2">{tool.description}</span>
      <span className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-wider">
        {CATEGORY_LABELS[tool.category]}
      </span>
    </button>
  );
}
