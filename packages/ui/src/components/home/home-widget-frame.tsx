"use client";

import type { DragEvent, ReactNode } from "react";
import { GripVertical, Minus, Maximize2 } from "lucide-react";
import { cn } from "../../lib/utils";
import type { HomeWidgetSize } from "../../lib/home-layout";

interface HomeWidgetFrameProps {
  title?: string;
  size: HomeWidgetSize;
  editing?: boolean;
  onRemove?: () => void;
  onCycleSize?: () => void;
  dragHandleProps?: {
    draggable?: boolean;
    onDragStart?: (e: DragEvent) => void;
    onDragEnd?: (e: DragEvent) => void;
  };
  className?: string;
  children: ReactNode;
  testId?: string;
}

export function HomeWidgetFrame({
  title,
  size,
  editing,
  onRemove,
  onCycleSize,
  dragHandleProps,
  className,
  children,
  testId,
}: HomeWidgetFrameProps) {
  return (
    <section
      data-testid={testId}
      data-size={size}
      className={cn(
        "group/widget relative flex flex-col overflow-hidden rounded-[22px] material-window",
        editing && "ring-1 ring-selection/25",
        editing && "widget-jiggle",
        className
      )}
    >
      {(title || editing) && (
        <div className="flex items-center gap-1.5 px-3.5 pt-3 pb-1">
          {editing && (
            <button
              type="button"
              aria-label="Drag to reorder"
              className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
              {...dragHandleProps}
            >
              <GripVertical className="h-4 w-4" strokeWidth={1.75} />
            </button>
          )}
          {title && (
            <h3 className="flex-1 truncate text-[12px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              {title}
            </h3>
          )}
          {!title && <span className="flex-1" />}
          {editing && (
            <div className="flex items-center gap-0.5">
              {onCycleSize && (
                <button
                  type="button"
                  onClick={onCycleSize}
                  aria-label="Resize widget"
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors [@media(hover:hover)_and_(pointer:fine)]:hover:bg-black/[0.05] [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/[0.08]"
                >
                  <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              )}
              {onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  aria-label="Remove widget"
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors [@media(hover:hover)_and_(pointer:fine)]:hover:bg-destructive/10 [@media(hover:hover)_and_(pointer:fine)]:hover:text-destructive"
                >
                  <Minus className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              )}
            </div>
          )}
        </div>
      )}
      <div className={cn("flex-1", title || editing ? "px-3 pb-3" : "p-3")}>{children}</div>
    </section>
  );
}
