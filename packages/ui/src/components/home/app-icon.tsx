"use client";

import { Plus, X } from "lucide-react";
import type { ToolDefinition } from "@ayetab/utils";
import { cn } from "../../lib/utils";
import { ToolIcon } from "../tool-icon";

interface AppIconProps {
  tool: ToolDefinition;
  editing?: boolean;
  onOpen: (tool: ToolDefinition) => void;
  onRemove?: () => void;
  label?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE = {
  sm: { btn: "h-12 w-12 rounded-[14px]", icon: "h-5 w-5", label: "text-[10px]" },
  md: { btn: "h-[4.25rem] w-[4.25rem] rounded-[18px]", icon: "h-7 w-7", label: "text-[11px]" },
  lg: { btn: "h-20 w-20 rounded-[22px]", icon: "h-8 w-8", label: "text-[12px]" },
};

export function AppIcon({
  tool,
  editing,
  onOpen,
  onRemove,
  label = true,
  size = "md",
  className,
}: AppIconProps) {
  const s = SIZE[size];
  return (
    <div className={cn("relative flex flex-col items-center gap-1.5", className)}>
      {editing && onRemove && (
        <button
          type="button"
          aria-label={`Remove ${tool.name}`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
        >
          <X className="h-3 w-3" strokeWidth={2.5} />
        </button>
      )}
      <button
        type="button"
        onClick={() => !editing && onOpen(tool)}
        disabled={editing}
        className={cn(
          "flex flex-col items-center justify-center",
          s.btn,
          "bg-gradient-to-br from-white/80 to-white/40 text-selection",
          "dark:from-white/15 dark:to-white/5 dark:text-white",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]",
          "transition-[transform] duration-150 ease-out-strong",
          !editing && "active:scale-90",
          editing && "widget-jiggle"
        )}
        aria-label={tool.name}
      >
        <ToolIcon name={tool.icon} className={s.icon} />
      </button>
      {label && (
        <span
          className={cn(
            "w-full truncate text-center font-medium leading-tight tracking-tight text-foreground drop-shadow-sm",
            s.label
          )}
        >
          {tool.name.split(/[\s/]/)[0]}
        </span>
      )}
    </div>
  );
}

interface AddAppIconProps {
  onClick: () => void;
  size?: "sm" | "md" | "lg";
}

export function AddAppIcon({ onClick, size = "md" }: AddAppIconProps) {
  const s = SIZE[size];
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-1.5" aria-label="Add app">
      <span
        className={cn(
          "flex items-center justify-center border border-dashed border-white/50 text-foreground/60",
          s.btn,
          "dark:border-white/25"
        )}
      >
        <Plus className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <span className={cn("font-medium text-foreground/60", s.label)}>Add</span>
    </button>
  );
}
