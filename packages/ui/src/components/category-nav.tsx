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
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={cn(
            "flex items-center justify-between rounded-md px-3 py-2 text-sm text-left transition-colors",
            active === item.id
              ? "bg-accent text-accent-foreground font-medium"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          )}
        >
          <span>{item.label}</span>
          {counts?.[item.id] !== undefined && (
            <span className="text-xs text-muted-foreground">{counts[item.id]}</span>
          )}
        </button>
      ))}
    </nav>
  );
}
