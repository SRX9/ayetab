"use client";

import type { ToolCategory } from "@ayetab/utils";
import { CATEGORY_LABELS } from "@ayetab/utils";
import { cn } from "../lib/utils";

interface CategoryNavProps {
  categories: ToolCategory[];
  active: ToolCategory | "all";
  onSelect: (category: ToolCategory | "all") => void;
  counts?: Record<ToolCategory | "all", number>;
  className?: string;
}

export function CategoryNav({ categories, active, onSelect, counts, className }: CategoryNavProps) {
  const items: Array<{ id: ToolCategory | "all"; label: string }> = [
    { id: "all", label: "All Tools" },
    ...categories.map((c) => ({ id: c, label: CATEGORY_LABELS[c] })),
  ];

  return (
    <nav className={cn("flex flex-col gap-0.5", className)}>
      {items.map((item) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              "flex items-center justify-between rounded-[9px] px-2.5 py-[7px] text-left text-[13px]",
              "transition-[transform,background-color,color] duration-100 ease-out-strong",
              "active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
              isActive
                ? "bg-selection text-selection-foreground font-medium shadow-sm"
                : "text-foreground/80 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-black/[0.04] dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/[0.06]"
            )}
          >
            <span className="truncate">{item.label}</span>
            {counts?.[item.id] !== undefined && (
              <span
                className={cn(
                  "ml-2 text-[11px] tabular-nums",
                  isActive ? "text-selection-foreground/75" : "text-muted-foreground"
                )}
              >
                {counts[item.id]}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
