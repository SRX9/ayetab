"use client";

import type { ReactNode } from "react";
import { cn } from "../lib/utils";

interface ToolShellProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function ToolShell({ title, description, children, actions, className }: ToolShellProps) {
  return (
    <div className={cn("flex flex-col gap-5 animate-fade-up motion-reduce:animate-none", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
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
