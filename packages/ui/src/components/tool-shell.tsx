"use client";

import type { ReactNode } from "react";
import { cn } from "../lib/utils";

interface ToolShellProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  /**
   * `h1` when the tool owns the page (/tools/[id]), `h2` when it's embedded in a
   * surface that already has one (sidepanel).
   */
  headingLevel?: 1 | 2;
}

export function ToolShell({
  title,
  description,
  children,
  actions,
  className,
  headingLevel = 2,
}: ToolShellProps) {
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <Heading className="text-title font-semibold text-balance">{title}</Heading>
          {description && (
            /* 13px across a 3xl container runs ~110 characters; cap the measure. */
            <p className="mt-1 max-w-[60ch] text-ui leading-relaxed text-pretty text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">{actions}</div>
        )}
      </div>
      {children}
    </div>
  );
}
