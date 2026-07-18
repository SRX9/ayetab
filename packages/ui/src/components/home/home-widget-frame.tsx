"use client";

import type { DragEvent, ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Maximize01Icon, MinusSignIcon } from "@hugeicons/core-free-icons";
import { cn } from "../../lib/utils";
import type { BentoSize } from "../../lib/home-layout";

interface HomeWidgetFrameProps {
  title?: string;
  size: BentoSize | string;
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
  /** Fill the bento cell completely */
  fill?: boolean;
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
  fill = true,
}: HomeWidgetFrameProps) {
  return (
    <section
      data-testid={testId}
      data-size={size}
      draggable={editing && !!dragHandleProps}
      onDragStart={editing ? dragHandleProps?.onDragStart : undefined}
      onDragEnd={editing ? dragHandleProps?.onDragEnd : undefined}
      className={cn(
        "group/widget relative flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] bento-tile",
        fill && "h-full",
        editing && "widget-jiggle cursor-grab active:cursor-grabbing",
        className
      )}
    >
      {editing ? (
        <div className="absolute right-2 top-2 z-10 flex items-center gap-0.5">
          {onCycleSize ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCycleSize();
              }}
              aria-label="Resize widget"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-md"
            >
              <HugeiconsIcon icon={Maximize01Icon} size={14} strokeWidth={2} color="currentColor" />
            </button>
          ) : null}
          {onRemove ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              aria-label="Remove widget"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md"
            >
              <HugeiconsIcon icon={MinusSignIcon} size={14} strokeWidth={2.5} color="currentColor" />
            </button>
          ) : null}
        </div>
      ) : null}
      {title && (
        <div className="flex shrink-0 items-center px-4 pt-3.5 pb-1">
          <h3 className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground/55">
            {title}
          </h3>
        </div>
      )}
      <div className={cn("min-h-0 flex-1", title ? "px-3 pb-3" : "p-3")}>{children}</div>
    </section>
  );
}
