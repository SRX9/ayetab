"use client";

import type { ToolCategory } from "@ayetab/utils";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "@ayetab/utils";
import { LayoutGrid } from "lucide-react";
import { cn } from "../lib/utils";
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
    { id: "all", label: "All Tools", icon: "LayoutGrid" },
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
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-2.5 py-[7px] text-left text-[13px]",
              "transition-[transform,background-color,color] duration-120 ease-out-strong",
              "active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
              isActive
                ? "nav-active"
                : "text-foreground/75 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-black/[0.04] dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/[0.06]"
            )}
          >
            {item.id === "all" ? (
              <LayoutGrid className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            ) : (
              <ToolIcon name={item.icon} className="h-4 w-4" />
            )}
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {counts?.[item.id] !== undefined && (
              <span
                className={cn(
                  "text-[11px] tabular-nums",
                  isActive ? "opacity-70" : "text-muted-foreground"
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
