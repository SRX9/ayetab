"use client";

import type { ToolCategory } from "@ayetab/utils";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "@ayetab/utils";
import { cn } from "../lib/utils";
import { FOCUS_RING } from "../lib/pressable";
import { ToolIcon } from "./tool-icon";

interface CategoryNavProps {
  categories: ToolCategory[];
  active: ToolCategory | "all";
  onSelect: (category: ToolCategory | "all") => void;
  counts?: Record<ToolCategory | "all", number>;
  className?: string;
}

export function CategoryNav({ categories, active, onSelect, counts, className }: CategoryNavProps) {
  const items: Array<{ id: ToolCategory | "all"; label: string; icon: string }> = [
    { id: "all", label: "All tools", icon: "LayoutGrid" },
    ...categories.map((c) => ({ id: c, label: CATEGORY_LABELS[c], icon: CATEGORY_ICONS[c] })),
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
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "flex items-center gap-2 rounded px-2 py-1 text-start text-ui transition-colors duration-100",
              FOCUS_RING,
              isActive ? "nav-active" : "row-idle"
            )}
          >
            <ToolIcon
              name={item.icon}
              className={cn("h-4 w-4 shrink-0", !isActive && "text-muted-foreground")}
            />
            {/* Wraps instead of clipping: translated category names run 30–40% longer. */}
            <span className="min-w-0 flex-1 text-pretty">{item.label}</span>
            {counts?.[item.id] !== undefined && (
              <span className="text-caption tabular-nums text-muted-foreground">
                {counts[item.id]}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
